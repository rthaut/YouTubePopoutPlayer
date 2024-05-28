import { InsertControlsAndWatch } from "./content/YouTubeCustomControls";
import {
  GetVideoPlayerInfo,
  OpenPopoutForPageVideo,
  PauseVideoPlayer,
  RotateVideoPlayer,
} from "./content/YouTubePopoutPlayer";
import { debounce, IsPopoutPlayer } from "./helpers/utils";
import { GetPlaylistVideoIDsFromDOM } from "./helpers/youtube";

/**
 * Closes the current tab (via a request to the background script)
 * @param {boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 */
export const CloseTab = async (enforceDomainRestriction = true) => {
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
        response,
      );
    }
  } catch (error) {
    console.error("[Content] YouTubePopoutPlayer CloseTab() :: Error", error);
  }
};

const OnRuntimeMessage = async (message, sender) => {
  console.log("[Content] YouTubePopoutPlayer Runtime Message", message, sender);

  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout-via-command":
        // eslint-disable-next-line no-case-declarations
        const {
          closeTab = false,
          enforceDomainRestriction = true,
          ...data
        } = message.data ?? {};
        await OpenPopoutForPageVideo(data);
        if (closeTab) {
          await CloseTab(enforceDomainRestriction);
        }
        break;

      case "get-playlist-videos":
        return GetPlaylistVideoIDsFromDOM();

      case "get-video-player-info":
        return GetVideoPlayerInfo();

      case "pause-video-player":
        return PauseVideoPlayer();

      case "rotate-video-player":
        if (IsPopoutPlayer(window.location)) {
          return RotateVideoPlayer(message.data.rotationAmount);
        }
    }

    console.log(
      "[Content] YouTubePopoutPlayer Runtime Message :: Unhandled Action",
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
    }, 400),
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
  InsertControlsAndWatch();

  browser.runtime.onMessage.addListener(OnRuntimeMessage);

  if (IsPopoutPlayer(window.location)) {
    RegisterEventListeners();
    const query = new URLSearchParams(window.location.search);
    if (query.has("rotation")) {
      document.documentElement.setAttribute(
        "data-ytp-rotation",
        parseInt(query.get("rotation"), 10),
      );
    }
  }
})();
