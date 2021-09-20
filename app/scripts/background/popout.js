import {
  START_THRESHOLD,
  OPTION_DEFAULTS,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "../helpers/constants";
import Options from "../helpers/options";
import { GetDimensionForScreenPercentage, IsFirefox } from "../helpers/utils";
import { GetCookieStoreIDForTab } from "./tabs";

const WIDTH_PADDING = 16; // TODO: find a way to calculate this (or make it configurable)
const HEIGHT_PADDING = 40; // TODO: find a way to calculate this (or make it configurable)

/**
 * Opens the popout player
 * @returns {Promise<object>}
 */
export const OpenPopoutPlayer = async ({
  id = "",
  list = "",
  time = 0,
  originalVideoWidth = null,
  originalVideoHeight = null,
  originTabId = -1,
}) => {
  console.log("[Background] OpenPopoutPlayer()", {
    id,
    list,
    time,
    originalVideoWidth,
    originalVideoHeight,
    originTabId,
  });

  // https://developers.google.com/youtube/player_parameters
  const params = {};

  // custom flag for determining if the embedded player is playing within a popout window/tab
  params.popout = 1;

  const behavior = await Options.GetLocalOptionsForDomain("behavior");
  console.log("[Background] OpenPopoutPlayer() :: Behavior options", behavior);

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
        behavior.controls
      );
      // use values for "standard" configuration
      params.controls = 1;
      params.modestbranding = 0;
      break;
  }

  if (time <= START_THRESHOLD) {
    console.info(
      "[Background] OpenPopoutPlayer() :: Popout video will start from beginning"
    );
    time = 0;
  }
  params.start = time;

  if (list !== undefined && list !== null && list !== "") {
    // `list` is the identifier for either: playlist, search, or user_uploads
    params.list = list;
  } else if (behavior.loop) {
    // `playlist` is a comma-separated list of video IDs to play
    // to loop a single video, the playlist parameter value must be set to the video's ID
    params.playlist = id;
  }

  const url = await GetUrlForPopoutPlayer(id, params);

  const openInBackground = await Options.GetLocalOption(
    "advanced",
    "background"
  );

  let result;
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
        originalVideoHeight
      );
      break;
  }

  console.log("[Background] OpenPopoutPlayer() :: Return", result);
  return result;
};

/**
 * Opens an Embedded Player in a new tab
 * @param {string} url the URL of the Embedded Player to open in a new window
 * @param {boolean} [active] indicates if the tab should become the active tab in the window
 * @param {number} originTabId the ID of the tab from which the request to open the Popout Player originated
 * @returns {Promise<object>}
 */
export const OpenPopoutPlayerInTab = async (
  url,
  active = true,
  originTabId = -1
) => {
  console.log("[Background] OpenPopoutPlayerInTab()", url, active, originTabId);

  const createData = await AddContextualIdentityToCreateData(
    {
      url,
      active,
    },
    originTabId
  );

  console.log(
    "[Background] OpenPopoutPlayerInTab() :: Creating tab",
    createData
  );
  const tab = await browser.tabs.create(createData);

  console.log("[Background] OpenPopoutPlayerInTab() :: Return", tab);
  return tab;
};

/**
 * Opens an Embedded Player in a new window (optionally matching the size of the original video player)
 * @param {string} url the URL of the Embedded Player to open in a new window
 * @param {boolean} openInBackground indicates if the window should be opened in the background
 * @param {number} originTabId the ID of the tab from which the request to open the Popout Player originated
 * @param {object} originalVideoWidth the width of the original video player
 * @param {boolean} originalVideoHeight the height of the original video player
 * @returns {Promise<object>}
 */
export const OpenPopoutPlayerInWindow = async (
  url,
  openInBackground = false,
  originTabId = -1,
  originalVideoWidth = OPTION_DEFAULTS.size.width,
  originalVideoHeight = OPTION_DEFAULTS.size.height
) => {
  console.log(
    "[Background] OpenPopoutPlayerInWindow()",
    url,
    openInBackground,
    originTabId,
    originalVideoWidth,
    originalVideoHeight
  );

  const dimensions = await GetDimensionsForPopoutPlayerWindow(
    originalVideoWidth,
    originalVideoHeight
  );

  const createData = await AddContextualIdentityToCreateData(
    {
      url,
      state: "normal",
      type: "popup",
      ...dimensions,
    },
    originTabId
  );

  const isFirefox = await IsFirefox();

  if (isFirefox) {
    createData.titlePreface = await Options.GetLocalOption("advanced", "title");
  }

  console.log(
    "[Background] OpenPopoutPlayerInWindow() :: Creating Popout Player window",
    createData
  );
  let window = await browser.windows.create(createData);

  // IMPORTANT: the `top` and `left` position values are set here via `windows.update()`
  // (instead of earlier in this function via `windows.create()`) due to a bug in Firefox
  // (see https://bugzilla.mozilla.org/show_bug.cgi?id=1271047)
  const position = await GetPositionForPopoutPlayerWindow();
  if (!isNaN(position?.top) && !isNaN(position?.left)) {
    console.log(
      "[Background] OpenPopoutPlayerInWindow() :: Positioning Popout Player window",
      position
    );
    window = await browser.windows.update(window.id, position);
  }

  if (openInBackground) {
    if (!isNaN(originTabId) && parseInt(originTabId, 10) > 0) {
      // try to move the original window back to the foreground
      console.log(
        "[Background] OpenPopoutPlayerInWindow() :: Moving original window to foreground"
      );
      const { windowId: originWindowId } = await browser.tabs.get(originTabId);
      await browser.windows.update(originWindowId, {
        focused: true,
      });
    } else {
      // fallback: minimize the popout player window
      console.warn(
        "[Background] OpenPopoutPlayerInWindow() :: Missing/Invalid ID for original tab",
        originTabId
      );
      window = await browser.windows.update(window.id, {
        focused: false,
        state: "minimized",
      });
    }
  }

  console.log("[Background] OpenPopoutPlayerInWindow() :: Return", window);
  return window;
};

/**
 * Gets the URL for the popout player given a video ID and/or URL parameters
 * @param {string} [id] the video ID
 * @param {object} [params] URL parameters
 * @returns {string} the full URL for the popout player
 */
export const GetUrlForPopoutPlayer = async (id = null, params = null) => {
  console.log("[Background] GetUrlForPopoutPlayer()", id, params);

  // TODO: if autoplay is disabled, we can omit the video ID from the path; as long as either `playlist` or `list` has a value, the Embedded Player will use it when the user clicks play (for single videos, this will prevent it appearing as a playlist with 2 videos, even though it is just the same video twice)
  // TODO: there may be some other edge cases to consider, like setting the start time with autoplay disabled

  let url = (await Options.GetLocalOption("advanced", "noCookieDomain"))
    ? YOUTUBE_NOCOOKIE_EMBED_URL
    : YOUTUBE_EMBED_URL;

  if (id !== undefined && id !== null) {
    url += id;
  }

  if (params !== undefined && params !== null) {
    url += "?" + new URLSearchParams(params).toString();
  }

  console.log("[Background] GetUrlForPopoutPlayer() :: Return", url);
  return url;
};

/**
 * Gets the target width and height size values (in pixels) for the popout player window
 * @param {number} originalVideoWidth the width of the original video player (if available)
 * @param {number} originalVideoHeight the height of the original video player (if available)
 * @returns {object} object containing width and height values
 */
export const GetDimensionsForPopoutPlayerWindow = async (
  originalVideoWidth,
  originalVideoHeight
) => {
  console.log(
    "[Background] GetDimensionsForPopoutPlayerWindow()",
    originalVideoWidth,
    originalVideoHeight
  );

  let width = originalVideoWidth ?? OPTION_DEFAULTS.size.width;
  let height = originalVideoHeight ?? OPTION_DEFAULTS.size.height;

  const size = await Options.GetLocalOptionsForDomain("size");
  console.log(
    "[Background] GetDimensionsForPopoutPlayerWindow() :: Size options",
    size
  );

  if (size.mode.toLowerCase() !== "current") {
    switch (size.units.toLowerCase()) {
      case "pixels":
        width = size.width;
        height = size.height;
        break;

      case "percentage":
        width = GetDimensionForScreenPercentage("Width", size.width);
        height = GetDimensionForScreenPercentage("Height", size.height);
        break;

      default:
        console.warn(
          '[Background] OpenPopoutPlayerInWindow() :: Invalid value for "size.units" option',
          size.units
        );
        // do nothing; use the original video player's dimensions instead
        break;
    }
  }

  // important: manually increasing dimensions to account for window frame
  width += WIDTH_PADDING;
  height += HEIGHT_PADDING;

  console.log("[Background] GetDimensionsForPopoutPlayerWindow() :: Return", {
    width,
    height,
  });
  return { width, height };
};

/**
 * Gets the target top and left position values (in pixels) for the popout player window
 * @returns {object} object containing top and left values
 */
export const GetPositionForPopoutPlayerWindow = async () => {
  console.log("[Background] GetPositionForPopoutPlayerWindow()");

  const position = await Options.GetLocalOptionsForDomain("position");
  console.log(
    "[Background] GetDimensionsForPopoutPlayerWindow() :: Position options",
    position
  );

  if (position.mode.toLowerCase() === "auto") {
    console.log(
      '[Background] GetDimensionsForPopoutPlayerWindow() :: Position mode is "auto" - returning empty position values'
    );
    return {
      top: null,
      left: null,
    };
  }

  return {
    top: position.top,
    left: position.left,
  };
};

/**
 * Store the dimensions and/or position if the applicable modes are "previous"
 * @returns {null}
 */
export const StoreDimensionsAndPosition = async ({
  dimensions = {},
  position = {},
}) => {
  console.log("[Background] StoreDimensionsAndPosition()");

  // TODO: we should also (or even instead) check if this came from a popout player window (as opposed to a tab)
  // the use case is: user opened popout player in a window, then changed to tab mode, then closed the window
  // in theory we could still store these values, since they came from a window
  const target = await Options.GetLocalOption("behavior", "target");
  if (target.toLowerCase() !== "window") {
    console.log(
      '[Background] GetDimensionsForPopoutPlayerWindow() :: Behavior target is not "window" - skipping dimensions and position storage'
    );
    return;
  }

  const sizeMode = await Options.GetLocalOption("size", "mode");
  const positionMode = await Options.GetLocalOption("position", "mode");
  console.log(
    "[Background] GetDimensionsForPopoutPlayerWindow() :: Size and position modes",
    {
      sizeMode,
      positionMode,
    }
  );

  if (sizeMode.toLowerCase() === "previous") {
    if (!isNaN(dimensions?.width) && !isNaN(dimensions?.height)) {
      const size = {
        units: "pixels",
        ...dimensions,
      };
      console.log(
        "[Background] StoreDimensionsAndPosition() :: Saving size",
        size
      );
      Options.SetLocalOptionsForDomain("size", size);
    } else {
      console.warn(
        "[Background] StoreDimensionsAndPosition() :: Missing or invalid dimensions values",
        dimensions
      );
    }
  }

  if (positionMode.toLowerCase() === "previous") {
    if (!isNaN(position?.top) && !isNaN(position?.left)) {
      console.log(
        "[Background] StoreDimensionsAndPosition() :: Saving Position",
        position
      );
      Options.SetLocalOptionsForDomain("position", position);
    } else {
      console.warn(
        "[Background] StoreDimensionsAndPosition() :: Missing or invalid position values",
        position
      );
    }
  }
};

/**
 * Adds the contextual identify properties to the create data if appropriate
 * @param {object} createData properties for the tab/window to be created for the Popout Player
 * @param {number} originTabId the original tab ID (of which to match the contextual identify)
 * @returns modified properties for the tab/window to be created for the Popout Player
 */
export const AddContextualIdentityToCreateData = async (
  createData = {},
  originTabId = -1
) => {
  try {
    const isFirefox = await IsFirefox();
    const useContextualIdentity = await Options.GetLocalOption(
      "advanced",
      "contextualIdentity"
    );

    if (isFirefox && useContextualIdentity) {
      const cookieStoreId = await GetCookieStoreIDForTab(originTabId);
      if (cookieStoreId) {
        createData.cookieStoreId = cookieStoreId;
        console.log(
          "[Background] AddContextualIdentityToCreateData() :: Added cookie store ID to create data",
          createData
        );
      } else {
        console.warn(
          "[Background] AddContextualIdentityToCreateData() :: Failed to get cookie store ID from original tab"
        );
      }
    }
  } catch (error) {
    console.error(
      "Failed to add contextual identity to window/tab for Popout Player",
      error
    );
  }

  return createData;
};

export default OpenPopoutPlayer;
