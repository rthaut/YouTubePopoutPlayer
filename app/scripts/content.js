import {
  OpenPopoutForPageVideo,
  PauseVideoPlayer,
  PlayVideoPlayer,
} from "./content/YouTubePopoutPlayer";
import { InsertControlsAndWatch } from "./content/YouTubeCustomControls";
import Options from "./helpers/options";
import { debounce, IsPopoutPlayer } from "./helpers/utils";
import { GetPlaylistVideoIDsFromDOM } from "./helpers/youtube";

/**
 * Closes the current tab (via a request to the background script)
 * @param {boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 */
const CloseTab = async (enforceDomainRestriction = true) => {
  console.log("[Content] YouTubePopoutPlayer CloseTab()");

  try {
    const response = await browser.runtime.sendMessage({
      action: "close-tab",
      data: {
        enforceDomainRestriction,
      },
    });

    if (response !== undefined) {
      console.log(
        '[Content] YouTubePopoutPlayer CloseTab() :: Action "close-tab" response',
        response
      );
    }
  } catch (error) {
    console.error("[Content] YouTubePopoutPlayer CloseTab() :: Error", error);
  }
};

/**
 * Click event handler for the context menu entry and the controls button
 * @param {MouseEvent} event the original click event
 */
const CustomControlsClickEventHandler = async (event) => {
  event.preventDefault();

  await OpenPopoutForPageVideo();

  if (await Options.GetLocalOption("advanced", "close")) {
    await CloseTab(true);
  }
};

const OnRuntimeMessage = async (message, sender) => {
  console.log("[Content] YouTubePopoutPlayer Runtime Message", message, sender);

  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout-via-command":
        await OpenPopoutForPageVideo();
        if (message.data?.closeTab) {
          await CloseTab(message.data?.enforceDomainRestriction);
        }
        break;

      case "get-playlist-videos":
        return GetPlaylistVideoIDsFromDOM();

      case "pause-video-player":
        return PauseVideoPlayer();
    }

    console.log(
      "[Content] YouTubePopoutPlayer Runtime Message :: Unhandled Action"
    );
    return;
  }
};

/**
 * Registers event listeners for when the popout player window is resized and closed.
 * This is done in the content script, as there is no way to get window size or position data from the background script.
 */
const RegisterEventListeners = () => {
  // window resize event listener (debounced for performance)
  window.addEventListener(
    "resize",
    debounce(() => {
      SendWindowDimensionsAndPosition("popout-resized");
    }, 400)
  );

  // alternative to window close event listener (as recommended by MDN),
  // used for situations where the user moves the window AFTER resizing it,
  // as there is no native move/(re)position event
  // alternative syntax for `beforeunload` event registration, seems to have better browser support
  window.onbeforeunload = () => {
    SendWindowDimensionsAndPosition("popout-closed");
  };
};

const SendWindowDimensionsAndPosition = async (action) => {
  const data = {
    dimensions: {
      // important: using innerWidth/innerHeight because we manually adjust the dimensions when opening the window
      width: window.innerWidth,
      height: window.innerHeight,
    },
    position: {
      top: window.screenY,
      left: window.screenX,
    },
  };

  // TODO: this still records an error in the console for the "closed" event/message
  browser.runtime
    .sendMessage({
      action,
      data,
    })
    .catch((error) => {
      void error;
    });
};

(async () => {
  InsertControlsAndWatch(CustomControlsClickEventHandler);

  browser.runtime.onMessage.addListener(OnRuntimeMessage);

  if (IsPopoutPlayer(window.location)) {
    RegisterEventListeners();
    if (await Options.GetLocalOption("behavior", "autoplay")) {
      const started = await PlayVideoPlayer();
      if (!started) {
        console.warn("Failed to start video in popout player");
      }
    }
  }
})();
