import Options from "../helpers/options";
import {
  GetVideoIDFromURL,
  GetPlaylistIDFromURL,
  GetPlaylistVideoIDsFromDOM,
} from "../helpers/youtube";
import HTML5Player from "./HTML5Player.class";

export const OnRuntimeMessage = async (message, sender) => {
  console.log("[Content] YouTubePopoutPlayer Runtime Message", message, sender);

  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout-via-command":
        await OpenPopout();
        if (message.data?.closeTab) {
          await CloseTab(message.data?.enforceDomainRestriction);
        }
        break;

      case "get-playlist-videos":
        return GetPlaylistVideoIDsFromDOM();
    }

    console.log(
      "[Content] YouTubePopoutPlayer Runtime Message :: Unhandled Action"
    );
    return;
  }
};

/**
 * Click event handler for the context menu entry and the controls button
 * @param {MouseEvent} event the original click event
 */
export const CustomControlsClickEventHandler = async (event) => {
  event.preventDefault();

  await OpenPopout();

  if (await Options.GetLocalOption("advanced", "close")) {
    await CloseTab(true);
  }
};

/**
 * Opens the Popout Player (via a request to the background script)
 */
export const OpenPopout = async () => {
  console.log("[Content] YouTubePopoutPlayer OpenPopout()");

  const container =
    document.getElementById("movie_player") ||
    document.getElementById("player");
  const video = container.querySelector("video");
  const player = new HTML5Player(video);

  try {
    const response = await browser.runtime.sendMessage({
      action: "open-popout",
      data: {
        id: GetVideoIDFromURL(window.location.href),
        list: GetPlaylistIDFromURL(window.location.href),
        time: player.getTime(),
        originalVideoWidth: player.getWidth(),
        originalVideoHeight: player.getHeight(),
      },
    });

    if (response !== undefined) {
      console.log(
        '[Content] YouTubePopoutPlayer OpenPopout() :: Action "open-popout" response',
        response
      );
    }

    player.pause();
  } catch (error) {
    console.error("[Content] YouTubePopoutPlayer OpenPopout() :: Error", error);
  }
};

/**
 * Closes the current tab (via a request to the background script)
 * @param {boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 */
export const CloseTab = async (enforceDomainRestriction = true) => {
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
