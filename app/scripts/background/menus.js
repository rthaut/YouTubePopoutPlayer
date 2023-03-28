import { OpenPopoutBackgroundHelper } from "./popout";
import {
  YOUTUBE_VIDEO_URL_PATTERNS,
  YOUTUBE_PLAYLIST_URL_PATTERNS,
} from "../helpers/constants";

export const GetMenus = async () => {
  const menus = [
    {
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
      onclick: (info, tab) =>
        OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false),
    },
    {
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_PLAYLIST_URL_PATTERNS,
      onclick: (info, tab) =>
        OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false),
    },
  ];

  if (await Promise.resolve(true)) { // TODO: replace this with an actual configurable option
    menus.push({
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenVideoRotateLeft_Text"
      ),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
      onclick: (info, tab) =>
        OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false, 270),
    });
    menus.push({
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenVideoRotateRight_Text"
      ),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
      onclick: (info, tab) =>
        OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false, 90),
    });
  }

  return menus;
};

/**
 * Initializes menus and event handlers
 */
export const InitMenus = async () => {
  console.log("[Background] InitMenus()");
  try {
    const menus = await GetMenus();
    await browser.contextMenus.removeAll();
    menus.forEach((menu) => browser.contextMenus.create(menu));
  } catch (ex) {
    console.error("Failed to initialize context menus", ex);
  }
};
