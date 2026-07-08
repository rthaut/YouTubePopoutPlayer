import type { Browser } from "wxt/browser";

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
  CloseTab,
  GetActiveTab,
  GetPopoutOriginContext,
  GetPopoutPlayerTabs,
  TabMatchesPopoutOriginContext,
  UpdatePopoutPlayerTab,
} from "./tabs";
import type {
  PopoutOpenResult,
  PopoutOriginContext,
  PopoutTabCreateData,
  PopoutWindowCreateData,
} from "./types";
import { CloseWindow } from "./windows";

const WIDTH_PADDING = 16; // TODO: find a way to calculate this (or make it configurable)
const HEIGHT_PADDING = 40; // TODO: find a way to calculate this (or make it configurable)

const ShowPopoutOpenFailureNotification = async (error?: unknown) => {
  console.error(
    "[Background] Failed to open popout player",
    error ?? "An unknown error occurred",
  );
  const message = browser.i18n.getMessage(
    "Notification_Error_PopoutOpenFailed",
  );
  await ShowBasicNotification({ message });
};

const ShowPopoutContextNotPreservedNotification = async () => {
  const message = browser.i18n.getMessage(
    "Notification_Warning_PrivateWindowNotPreserved",
  );
  await ShowBasicNotification({ message });
};

const AddOriginContextToTabCreateData = (
  createData: PopoutTabCreateData,
  originContext: PopoutOriginContext | null,
) => {
  if (originContext?.cookieStoreId !== undefined) {
    createData.cookieStoreId = originContext.cookieStoreId;
  }

  if (typeof originContext?.windowId === "number") {
    createData.windowId = originContext.windowId;
  }

  return createData;
};

const AddOriginContextToWindowCreateData = (
  createData: PopoutWindowCreateData,
  originContext: PopoutOriginContext | null,
) => {
  if (originContext?.cookieStoreId !== undefined) {
    createData.cookieStoreId = originContext.cookieStoreId;
  }

  if (typeof originContext?.incognito === "boolean") {
    createData.incognito = originContext.incognito;
  }

  return createData;
};

const BuildTabsOpenResult = (
  tabs: (Browser.tabs.Tab | undefined)[],
  target: "tab" | "window",
  reused: boolean,
): PopoutOpenResult => {
  const definedTabs = tabs.filter(
    (tab): tab is Browser.tabs.Tab => tab !== undefined,
  );

  return {
    target,
    reused,
    tabIds: definedTabs
      .map((tab) => tab.id)
      .filter((id): id is number => id !== undefined),
    windowIds: [
      ...new Set(
        definedTabs
          .map((tab) => tab.windowId)
          .filter((id): id is number => id !== undefined),
      ),
    ],
  };
};

const BuildWindowOpenResult = (
  window: Browser.windows.Window,
): PopoutOpenResult => ({
  target: "window",
  reused: false,
  tabIds: [],
  windowIds: window.id !== undefined ? [window.id] : [],
});

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

  if (result === undefined || result === null) {
    return false;
  }

  // NOTE: we can only act on the origin tab here (close it or pause its video); we cannot touch the
  // popout itself because `OpenPopoutPlayer()` does not return the created window/tab ID(s) in a usable form
  // TODO: have `OpenPopoutPlayer()` return the created window/tab ID(s) so callers can act on the popout directly (see the return-type cleanup TODO on `OpenPopoutPlayer()`)
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

  return true;
};

/**
 * Opens the popout player
 * @returns {Promise<PopoutOpenResult|null>} a normalized description of the opened popout, or null if it was not opened
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
}): Promise<PopoutOpenResult | null> => {
  // if the origin tab ID wasn't explicitly provided, assume it was the active tab
  if (isNaN(originTabId) || +originTabId <= 0) {
    console.warn("Invalid or missing origin tab ID", originTabId);
    originTabId = (await GetActiveTab())?.id ?? originTabId;
  }

  // https://developers.google.com/youtube/player_parameters#Parameters

  const params: Record<string, number | string> = {};

  // custom flag for determining if the embedded player is playing within a popout window/tab
  params[POPOUT_PLAYER_PARAM_NAME] = 1;

  const behavior = await Options.GetLocalOptionsForDomain("behavior");

  ["autoplay", "loop"].forEach((param) => {
    params[param] = behavior[param] ? 1 : 0; // convert true/false to 1/0 for URL params
  });

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
  const openInBackground = await Options.GetLocalOption(
    "advanced",
    "background",
  );
  const target = behavior.target.toLowerCase();

  const normalizedTarget = target === "tab" ? "tab" : "window";

  if (reuseExistingWindowsTabs) {
    // NOTE: these tabs are already filtered to the origin context by `GetPopoutPlayerTabs()`, so the
    // "context not preserved" verification below (for freshly created tabs/windows) is intentionally skipped here
    const tabs = await GetPopoutPlayerTabs(originTabId, target === "tab");
    if (tabs.length > 0) {
      // TODO: maybe this should just modify the first tab (or most recent tab) instead of all of them?
      const updatedTabs = await Promise.all(
        tabs.map((tab) => UpdatePopoutPlayerTab(tab, url, !openInBackground)),
      );
      return BuildTabsOpenResult(updatedTabs, normalizedTarget, true);
    }
  }

  switch (target) {
    case "tab": {
      const tab = await OpenPopoutPlayerInTab(
        url,
        !openInBackground,
        originTabId,
      );
      return tab === null ? null : BuildTabsOpenResult([tab], "tab", false);
    }

    case "window":
    default: {
      const window = await OpenPopoutPlayerInWindow(
        url,
        openInBackground,
        originTabId,
        originalVideoWidth,
        originalVideoHeight,
      );
      return window === null ? null : BuildWindowOpenResult(window);
    }
  }
};

/**
 * Opens an Embedded Player in a new tab
 * @param {string} url the URL of the Embedded Player to open in a new window
 * @param {boolean} [active] indicates if the tab should become the active tab in the window
 * @param {number} originTabId the ID of the tab from which the request to open the popout player originated
 * @returns {Promise<Browser.tabs.Tab|null>} the created tab, or null if it was not opened (or the origin context was not preserved)
 */
export const OpenPopoutPlayerInTab = async (
  url: string,
  active: boolean = true,
  originTabId: number = -1,
): Promise<Browser.tabs.Tab | null> => {
  const originContext = await GetPopoutOriginContext(originTabId);
  const createData = AddOriginContextToTabCreateData(
    { url, active },
    originContext,
  );

  let createdTab: Browser.tabs.Tab | undefined;

  try {
    createdTab = await browser.tabs.create(createData);
  } catch (error) {
    await ShowPopoutOpenFailureNotification(error);
    return null;
  }

  if (createdTab === undefined) {
    await ShowPopoutOpenFailureNotification(
      new Error(
        "[Background] OpenPopoutPlayerInTab() :: tabs.create() returned no tab",
      ),
    );
    return null;
  }

  if (!TabMatchesPopoutOriginContext(createdTab, originContext, true)) {
    console.warn(
      "[Background] OpenPopoutPlayerInTab() :: Created tab did not preserve original browser context",
    );
    await ShowPopoutContextNotPreservedNotification();
    if (createdTab.id !== undefined) {
      await CloseTab(createdTab.id);
    }
    return null;
  }

  return createdTab;
};

/**
 * Opens an Embedded Player in a new window (optionally matching the size of the original video player)
 * @param {string} url the URL of the Embedded Player to open in a new window
 * @param {boolean} openInBackground indicates if the window should be opened in the background
 * @param {number} originTabId the ID of the tab from which the request to open the popout player originated
 * @param {object} originalVideoWidth the width of the original video player
 * @param {boolean} originalVideoHeight the height of the original video player
 * @returns {Promise<Browser.windows.Window|null>} the created window, or null if it was not opened (or the origin context was not preserved)
 */
export const OpenPopoutPlayerInWindow = async (
  url: string,
  openInBackground: boolean = false,
  originTabId: number = -1,
  originalVideoWidth: number = OPTION_DEFAULTS.size.width,
  originalVideoHeight: number = OPTION_DEFAULTS.size.height,
): Promise<Browser.windows.Window | null> => {
  const dimensions = await GetDimensionsForPopoutPlayerWindow(
    originalVideoWidth,
    originalVideoHeight,
  );
  const originContext = await GetPopoutOriginContext(originTabId);
  const createData = AddOriginContextToWindowCreateData(
    {
      url,
      state: "normal",
      type: "popup",
      ...dimensions,
    },
    originContext,
  );

  const isFirefox = await IsFirefox();

  if (isFirefox) {
    createData.titlePreface = await Options.GetLocalOption("advanced", "title");
  }

  let createdWindow: Browser.windows.Window | undefined;

  try {
    createdWindow = await browser.windows.create(createData);
    if (createdWindow === undefined) {
      throw new Error(
        "windows.create() did not return a created Window object",
      );
    }
  } catch (error) {
    await ShowPopoutOpenFailureNotification(error);
    return null;
  }

  // NOTE: we can only verify the incognito state here; a `windows.Window` does not expose `cookieStoreId`,
  // so a popup that opens in the wrong Firefox container (but the correct incognito state) cannot be detected.
  // Container preservation for popup windows is therefore best-effort only (see the FAQ / PR notes for the known limitation).
  if (
    typeof originContext?.incognito === "boolean" &&
    createdWindow.incognito !== originContext.incognito
  ) {
    console.warn(
      "[Background] OpenPopoutPlayerInWindow() :: Created window did not preserve original browsing context",
    );
    await ShowPopoutContextNotPreservedNotification();
    if (createdWindow.id !== undefined) {
      await CloseWindow(createdWindow.id);
    }
    return null;
  }

  if (createdWindow.id === undefined) {
    console.warn(
      "[Background] OpenPopoutPlayerInWindow() :: Unable to resize/reposition created window",
    );
    return createdWindow;
  }

  const windowId = createdWindow.id;

  try {
    // IMPORTANT: the `top` and `left` position values are set here via `windows.update()`
    // (instead of earlier in this function via `windows.create()`) due to a bug in Firefox
    // (see https://bugzilla.mozilla.org/show_bug.cgi?id=1271047)
    const position = await GetPositionForPopoutPlayerWindow();
    if (position?.top !== undefined && position?.left !== undefined) {
      await browser.windows.update(windowId, position);
    }
  } catch (error) {
    console.warn(
      "[Background] OpenPopoutPlayerInWindow() :: Unable to position created window",
      error,
    );
  }

  try {
    if ((await Options.GetLocalOption("size", "mode")) === "maximized") {
      await browser.windows.update(windowId, {
        state: "maximized",
      });
    } else if (openInBackground) {
      if (!isNaN(originTabId) && +originTabId > 0) {
        // try to move the original window back to the foreground
        const { windowId: originWindowId } =
          await browser.tabs.get(originTabId);
        if (originWindowId !== undefined) {
          await browser.windows.update(originWindowId, {
            focused: true,
          });
        }
      } else {
        // fallback: minimize the popout player window
        await browser.windows.update(windowId, {
          focused: false,
          state: "minimized",
        });
      }
    }
  } catch (error) {
    console.warn(
      "[Background] OpenPopoutPlayerInWindow() :: Unable to update created window focus or state",
      error,
    );
  }

  return createdWindow;
};

/**
 * Gets the URL for the popout player given a video ID and/or URL parameters
 * @param {string} [id] the video ID
 * @param {object} [params] URL parameters
 * @returns {Promise<string>} the full URL for the popout player
 */
export const GetUrlForPopoutPlayer = async (
  id?: string,
  params?: Record<string, number | string>,
): Promise<string> => {
  // TODO: if autoplay is disabled, we can omit the video ID from the path; as long as either `playlist` or `list` has a value, the Embedded Player will use it when the user clicks play (for single videos, this will prevent it appearing as a playlist with 2 videos, even though it is just the same video twice)
  // TODO: there may be some other edge cases to consider, like setting the start time with autoplay disabled

  let url = (await Options.GetLocalOption("advanced", "noCookieDomain"))
    ? YOUTUBE_NOCOOKIE_EMBED_URL
    : YOUTUBE_EMBED_URL;

  if (id !== undefined && id !== null) {
    url += id;
  }

  if (params !== undefined && params !== null) {
    url +=
      "?" +
      new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, value.toString()]),
      ).toString();
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
