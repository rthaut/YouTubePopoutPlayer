import type { Runtime } from "wxt/browser";

import { debounce, IsPopoutPlayer } from "@/utils/misc";
import type {
  OpenPopoutData,
  RotateVideoData,
  RuntimeMessage,
} from "@/utils/types";
import { GetPlaylistVideoIDsFromDOM } from "@/utils/youtube";

import { InsertControlsAndWatch } from "./controls";
import {
  GetVideoPlayerInfo,
  OpenPopoutForPageVideo,
  PauseVideoPlayer,
  RotateVideoPlayer,
} from "./player";

import "./style.css";

export default defineContentScript({
  allFrames: true,
  matches: ["*://*.youtube.com/*", "*://*.youtube-nocookie.com/*"],
  runAt: "document_end",
  async main() {
    InsertControlsAndWatch();

    browser.runtime.onMessage.addListener((message, sender) =>
      OnRuntimeMessage(message as RuntimeMessage, sender),
    );

    if (IsPopoutPlayer(window.location)) {
      RegisterEventListeners();
      const query = new URLSearchParams(window.location.search);
      if (query.has("rotation")) {
        document.documentElement.setAttribute(
          "data-ytp-rotation",
          parseInt(query.get("rotation") ?? "0", 10).toString(),
        );
      }
    }
  },
});

/**
 * Closes the current tab (via a request to the background script)
 * @param {boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 */
export const CloseTab = async (enforceDomainRestriction: boolean = true) => {
  try {
    await browser.runtime.sendMessage({
      action: "close-tab",
      data: {
        enforceDomainRestriction,
      },
    });
  } catch (error) {
    console.error("[Content] YouTubePopoutPlayer CloseTab() :: Error", error);
  }
};

const OnRuntimeMessage = async (
  message: RuntimeMessage,
  sender: Runtime.MessageSender,
) => {
  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout-via-command":
        // eslint-disable-next-line no-case-declarations
        const {
          closeTab = false,
          enforceDomainRestriction = true,
          ...data
        } = (message.data as OpenPopoutData) ?? {};
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
          return RotateVideoPlayer(
            (message.data as RotateVideoData).rotationAmount,
          );
        }
    }
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

const SendWindowDimensionsAndPosition = async (action: string) => {
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
    .catch((error: any) => {
      void error;
    });
};
