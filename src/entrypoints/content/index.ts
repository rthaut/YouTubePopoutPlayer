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
      
      // Auto-retry on error 153
      SetupErrorRetry();
      
      // Setup autoplay
      SetupAutoplay();
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

/**
 * Sets up automatic retry when YouTube error 153 is detected
 */
const SetupErrorRetry = () => {
  console.log("[YouTubePopout] Error retry initialized");
  
  const checkForError = () => {
    const bodyText = document.body.innerText;
    
    if (bodyText.includes("Error 153") || bodyText.includes("error 153")) {
      console.log("[YouTubePopout] Detected error 153, auto-retrying...");
      
      if (!sessionStorage.getItem("ytpp_retry_attempted")) {
        sessionStorage.setItem("ytpp_retry_attempted", "true");
        console.log("[YouTubePopout] Reloading page...");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.log("[YouTubePopout] Already retried once, not reloading again");
      }
    } else {
      // Clear retry flag if page loads successfully
      sessionStorage.removeItem("ytpp_retry_attempted");
    }
  };

  // Check after a delay to let the page load
  setTimeout(checkForError, 2000);
  
  // Also watch for DOM changes
  const observer = new MutationObserver(checkForError);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
};

/**
 * Sets up autoplay by unmuting the video (it starts muted to bypass browser restrictions)
 */
const SetupAutoplay = () => {
  console.log("[YouTubePopout] Autoplay initialized (video starts muted)");
  
  const unmuteVideo = () => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      // Check if video is playing (muted autoplay should have started)
      if (!video.paused) {
        console.log("[YouTubePopout] Video is playing (muted), unmuting...");
        video.muted = false;
        console.log("[YouTubePopout] Video unmuted successfully!");
        return true;
      } else {
        console.log("[YouTubePopout] Video not playing yet");
      }
    }
    return false;
  };
  
  // Try to unmute after delays
  const delays = [1000, 2000, 3000];
  delays.forEach(delay => {
    setTimeout(() => {
      if (unmuteVideo()) {
        console.log("[YouTubePopout] Unmute successful at " + delay + "ms");
      }
    }, delay);
  });
  
  // Also watch for video to start playing
  const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video && !video.paused && video.muted) {
      if (unmuteVideo()) {
        observer.disconnect();
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  setTimeout(() => observer.disconnect(), 10000);
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
