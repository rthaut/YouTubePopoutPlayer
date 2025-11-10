import type { Windows } from "wxt/browser";

import {
  OPTION_DEFAULTS,
  POPOUT_PLAYER_PARAM_NAME,
  START_THRESHOLD,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "@/utils/constants";
import { GetDimensionForScreenPercentage, IsFirefox } from "@/utils/misc";
import Options from "@/utils/options";
import { GetPlaylistIDFromURL, GetVideoIDFromURL } from "@/utils/youtube";

import { ShowBasicNotification } from "./notifications";
import {
  AddContextualIdentityToDataObject,
  CloseTab,
  GetActiveTab,
  GetPopoutPlayerTabs,
} from "./tabs";

const WIDTH_PADDING = 16; // TODO: find a way to calculate this (or make it configurable)
const HEIGHT_PADDING = 40; // TODO: find a way to calculate this (or make it configurable)

/**
 * Helper function to open the popout player from various points in the background script
 * @param {object} params
 * @param {string} params.url the URL containing a video ID and/or playlist
 * @param {number} [params.tabId=-1] the ID of the original tab
 * @param {boolean} [params.allowCloseTab=true] if the original tab can be closed (depending on the user's preference)
 * @param {boolean} [params.allowCloseTabOnAnyDomain=false] if the original tab can be closed regardless of which domain it is on
 * @param {number} [params.rotation=0] the initial video rotation amount
 * @returns {Promise<boolean>} if the popout player was opened
 */
export const OpenPopoutBackgroundHelper = async ({
  url,
  tabId = -1,
  includeList = true,
  allowCloseTab = true,
  allowCloseTabOnAnyDomain = false,
  rotation = 0,
}: {
  url: string;
  includeList?: boolean;
  tabId?: number;
  allowCloseTab?: boolean;
  allowCloseTabOnAnyDomain?: boolean;
  rotation?: number;
}): Promise<boolean> => {
  const id = GetVideoIDFromURL(url);
  const list = includeList ? GetPlaylistIDFromURL(url) : undefined;

  if (!(id || list)) {
    console.warn("No video or playlist detected from URL", url);
    return false;
  }

  const result = await OpenPopoutPlayer({
    id,
    list,
    rotation,
    originTabId: tabId,
  });

  // we can't do anything if a tab ID wasn't given, as the "active" tab will now likely be the popout
  // (unless the user has configured it to open in the background, but checking for that is not guaranteed)
  if (+tabId > 0) {
    if (allowCloseTab && (await Options.GetLocalOption("advanced", "close"))) {
      // close the tab if allowed and configured
      await CloseTab(tabId, !allowCloseTabOnAnyDomain);
    } else {
      // pause the video player (if there is one) in the tab
      await browser.tabs.sendMessage(tabId, {
        action: "pause-video-player",
      });
    }
  }

  return result !== undefined && result !== null;
};

/**
 * Opens the popout player
 * @returns {Promise<object|null>} the opened window/tab
 */
export const OpenPopoutPlayer = async ({
  id = "",
  list = "",
  time = 0,
  originalVideoWidth = undefined,
  originalVideoHeight = undefined,
  rotation = 0,
  originTabId = -1,
}: {
  id?: string;
  list?: string;
  time?: number;
  originalVideoWidth?: number;
  originalVideoHeight?: number;
  rotation?: number;
  originTabId?: number;
}): Promise<object | null> => {
  let result;

  // if the origin tab ID wasn't explicitly provided, assume it was the active tab
  if (isNaN(originTabId) || +originTabId <= 0) {
    console.warn("Invalid or missing origin tab ID", originTabId);
    originTabId = (await GetActiveTab())?.id ?? originTabId;
  }

  // https://developers.google.com/youtube/player_parameters#Parameters

  const params: Record<string, any> = {};

  // custom flag for determining if the embedded player is playing within a popout window/tab
  params[POPOUT_PLAYER_PARAM_NAME] = 1;

  const behavior = await Options.GetLocalOptionsForDomain("behavior");

  ["autoplay", "loop"].forEach((param) => {
    params[param] = behavior[param] ? 1 : 0; // convert true/false to 1/0 for URL params
  });
  
  // Start muted to allow autoplay, will be unmuted by content script
  if (behavior.autoplay) {
    params.mute = 1;
  }

  switch (behavior.controls.toLowerCase()) {
    case "none":
      params.controls = 0;
      params.modestbranding = 1;
      break;

    case "standard":
      params.controls = 1;
      params.modestbranding = 0;
      break;

    case "extended":
      params.controls = 1;
      params.modestbranding = 0;
      break;

    default:
      console.warn(
        '[Background] OpenPopoutPlayer() :: Invalid value for "behavior.controls" option',
        behavior.controls,
      );
      // use values for "standard" configuration
      params.controls = 1;
      params.modestbranding = 0;
      break;
  }

  if (behavior.resumePlayback) {
    if (time <= START_THRESHOLD) {
      console.info(
        "[Background] OpenPopoutPlayer() :: Popout video will start from beginning",
      );
      time = 0;
    }
    params.start = Math.round(time); // param must be an integer for the embedded player
  }

  if (list !== undefined && list !== null && list !== "") {
    if (list.toUpperCase() === "WL") {
      // the embedded player does not support the Watch Later playlist natively
      // as a workaround, get the video IDs from the DOM and make a manual playlist from them
      try {
        const videos = await browser.tabs.sendMessage(originTabId, {
          action: "get-playlist-videos",
        });

        if (Array.isArray(videos) && videos.length > 1) {
          params.playlist = videos.join(",");
        }
      } catch (error) {
        // this only fails when using the context menu to open the Watch Later playlist from a link outside of YouTube
        // since we can only get the Video IDs from the DOM, we have to be on YouTube, so there's nothing more we can do
        void error;
      }
    } else {
      // `list` is the identifier for either: playlist, search, or user_uploads (as indicated by `listType`)
      params.list = list;
      params.listType = "playlist";
    }
  } else if (behavior.loop) {
    // to loop a single video, the `playlist` parameter value must be set to the video's ID
    params.playlist = id;
  }

  if (!isNaN(rotation) && rotation !== 0) {
    params.rotation = rotation;
  }

  // prettier-ignore
  if (!id && !Object.keys(params).includes("list") && !Object.keys(params).includes("playlist")) {
    const message = browser.i18n.getMessage("Notification_Error_FailedToOpen");
    console.warn(message);
    ShowBasicNotification({
      message,
    });
    return null;
  }

  const url = await GetUrlForPopoutPlayer(id, params);

  const reuseExistingWindowsTabs = await Options.GetLocalOption(
    "behavior",
    "reuseWindowsTabs",
  );

  if (reuseExistingWindowsTabs) {
    const tabs = await GetPopoutPlayerTabs(originTabId);
    if (tabs.length > 0) {
      result = await Promise.all(
        tabs.map((tab) => browser.tabs.update(tab.id, { url })),
      );
      return result;
    }
  }

  const openInBackground = await Options.GetLocalOption(
    "advanced",
    "background",
  );

  switch (behavior.target.toLowerCase()) {
    case "tab":
      result = await OpenPopoutPlayerInTab(url, !openInBackground, originTabId);
      break;

    case "window":
    default:
      result = await OpenPopoutPlayerInWindow(
        url,
        openInBackground,
        originTabId,
        originalVideoWidth,
        originalVideoHeight,
      );
      break;
  }

  return result;
};

/**
 * Opens an Embedded Player in a new tab
 * @param {string} url the URL of the Embedded Player to open in a new window
 * @param {boolean} [active] indicates if the tab should become the active tab in the window
 * @param {number} originTabId the ID of the tab from which the request to open the popout player originated
 * @returns {Promise<object>}
 */
export const OpenPopoutPlayerInTab = async (
  url: string,
  active: boolean = true,
  originTabId: number = -1,
): Promise<object> => {
  const createData = await AddContextualIdentityToDataObject(
    {
      url,
      active,
    },
    originTabId,
  );

  const tab = await browser.tabs.create(createData);
  return tab;
};

/**
 * Opens an Embedded Player in a new window (optionally matching the size of the original video player)
 * @param {string} url the URL of the Embedded Player to open in a new window
 * @param {boolean} openInBackground indicates if the window should be opened in the background
 * @param {number} originTabId the ID of the tab from which the request to open the popout player originated
 * @param {object} originalVideoWidth the width of the original video player
 * @param {boolean} originalVideoHeight the height of the original video player
 * @returns {Promise<object>}
 */
export const OpenPopoutPlayerInWindow = async (
  url: string,
  openInBackground: boolean = false,
  originTabId: number = -1,
  originalVideoWidth: number = OPTION_DEFAULTS.size.width,
  originalVideoHeight: number = OPTION_DEFAULTS.size.height,
): Promise<object> => {
  const dimensions = await GetDimensionsForPopoutPlayerWindow(
    originalVideoWidth,
    originalVideoHeight,
  );

  const createData = await AddContextualIdentityToDataObject(
    {
      url,
      state: "normal",
      type: "popup",
      ...dimensions,
    } as Windows.CreateCreateDataType,
    originTabId,
  );

  const isFirefox = await IsFirefox();

  if (isFirefox) {
    createData.titlePreface = await Options.GetLocalOption("advanced", "title");
  }

  let window = await browser.windows.create(createData);

  if (window.id === undefined) {
    console.warn(
      "[Background] OpenPopoutPlayerInWindow() :: Unable to resize/reposition created window",
    );
    return window;
  }

  // IMPORTANT: the `top` and `left` position values are set here via `windows.update()`
  // (instead of earlier in this function via `windows.create()`) due to a bug in Firefox
  // (see https://bugzilla.mozilla.org/show_bug.cgi?id=1271047)
  const position = await GetPositionForPopoutPlayerWindow();
  if (position?.top !== undefined && position?.left !== undefined) {
    await browser.windows.update(window.id, position);
  }

  if ((await Options.GetLocalOption("size", "mode")) === "maximized") {
    await browser.windows.update(window.id, {
      state: "maximized",
    });
  } else if (openInBackground) {
    if (!isNaN(originTabId) && +originTabId > 0) {
      // try to move the original window back to the foreground
      const { windowId: originWindowId } = await browser.tabs.get(originTabId);
      if (originWindowId !== undefined) {
        await browser.windows.update(originWindowId, {
          focused: true,
        });
      }
    } else {
      // fallback: minimize the popout player window
      await browser.windows.update(window.id, {
        focused: false,
        state: "minimized",
      });
    }
  }

  return window;
};

/**
 * Gets the URL for the popout player given a video ID and/or URL parameters
 * @param {string} [id] the video ID
 * @param {object} [params] URL parameters
 * @returns {Promise<string>} the full URL for the popout player
 */
export const GetUrlForPopoutPlayer = async (
  id?: string,
  params?: Record<string, any>,
): Promise<string> => {
  // TODO: if autoplay is disabled, we can omit the video ID from the path; as long as either `playlist` or `list` has a value, the Embedded Player will use it when the user clicks play (for single videos, this will prevent it appearing as a playlist with 2 videos, even though it is just the same video twice)
  // TODO: there may be some other edge cases to consider, like setting the start time with autoplay disabled

  // Force the use of youtube-nocookie.com to fix embed errors
  let url = YOUTUBE_NOCOOKIE_EMBED_URL;

  if (id !== undefined && id !== null) {
    url += id;
  }

  if (params !== undefined && params !== null) {
    url += "?" + new URLSearchParams(params).toString();
  }

  return url;
};

/**
 * Gets the target width and height size values (in pixels) for the popout player window
 * @param {number} originalVideoWidth the width of the original video player (if available)
 * @param {number} originalVideoHeight the height of the original video player (if available)
 * @returns {Promise<object>} object containing width and height values
 */
export const GetDimensionsForPopoutPlayerWindow = async (
  originalVideoWidth: number,
  originalVideoHeight: number,
): Promise<object> => {
  let width = originalVideoWidth ?? OPTION_DEFAULTS.size.width;
  let height = originalVideoHeight ?? OPTION_DEFAULTS.size.height;

  const size = await Options.GetLocalOptionsForDomain("size");

  if (size.mode.toLowerCase() !== "current") {
    switch (size.units.toLowerCase()) {
      case "pixels":
        width = size.width;
        height = size.height;
        break;

      case "percentage":
        width = GetDimensionForScreenPercentage("Width", size.width)!;
        height = GetDimensionForScreenPercentage("Height", size.height)!;
        break;

      default:
        console.warn(
          '[Background] OpenPopoutPlayerInWindow() :: Invalid value for "size.units" option',
          size.units,
        );
        // do nothing; use the original video player's dimensions instead
        break;
    }
  }

  // important: manually increasing dimensions to account for window frame
  width += WIDTH_PADDING;
  height += HEIGHT_PADDING;

  return { width, height };
};

/**
 * Gets the target top and left position values (in pixels) for the popout player window
 * @returns {Promise<{top?: number, left?: number}>} object containing top and left values
 */
export const GetPositionForPopoutPlayerWindow = async (): Promise<{
  top?: number;
  left?: number;
}> => {
  const position = await Options.GetLocalOptionsForDomain("position");

  if (position.mode.toLowerCase() === "auto") {
    return {
      top: undefined,
      left: undefined,
    };
  }

  return {
    top: position.top,
    left: position.left,
  };
};

/**
 * Store the dimensions and/or position if the applicable modes are "previous"
 * @returns {Promise<void>}
 */
export const StoreDimensionsAndPosition = async ({
  dimensions = {},
  position = {},
}: {
  dimensions: {
    width?: number;
    height?: number;
  };
  position: {
    top?: number;
    left?: number;
  };
}): Promise<void> => {
  // TODO: we should also (or even instead) check if this came from a popout player window (as opposed to a tab)
  // the use case is: user opened popout player in a window, then changed to tab mode, then closed the window
  // in theory we could still store these values, since they came from a window
  const target = await Options.GetLocalOption("behavior", "target");
  if (target.toLowerCase() !== "window") {
    return;
  }

  const sizeMode = await Options.GetLocalOption("size", "mode");
  const positionMode = await Options.GetLocalOption("position", "mode");

  if (sizeMode.toLowerCase() === "previous") {
    if (dimensions?.width !== undefined && dimensions?.height !== undefined) {
      const size = {
        units: "pixels",
        ...dimensions,
      };
      Options.SetLocalOptionsForDomain("size", size);
    } else {
      console.warn(
        "[Background] StoreDimensionsAndPosition() :: Missing or invalid dimensions values",
        dimensions,
      );
    }
  }

  if (positionMode.toLowerCase() === "previous") {
    if (position?.top !== undefined && position?.left !== undefined) {
      Options.SetLocalOptionsForDomain("position", position);
    } else {
      console.warn(
        "[Background] StoreDimensionsAndPosition() :: Missing or invalid position values",
        position,
      );
    }
  }
};

export default OpenPopoutPlayer;
