import {
  OnRuntimeMessage,
  CustomControlsClickEventHandler,
} from "./content/YouTubePopoutPlayer";
import { InsertControlsAndWatch } from "./content/YouTubeCustomControls";
import { IsPopoutPlayer, debounce } from "./helpers/utils";

/**
 * Registers event listeners for when the Popout Player window is resized and closed.
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
  await InsertControlsAndWatch(CustomControlsClickEventHandler);

  browser.runtime.onMessage.addListener(OnRuntimeMessage);

  if (IsPopoutPlayer(window.location)) {
    RegisterEventListeners();
  }
})();
