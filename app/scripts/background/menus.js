import { OpenPopoutBackgroundHelper } from "./popout";
import {
  YOUTUBE_VIDEO_URL_PATTERNS,
  YOUTUBE_PLAYLIST_URL_PATTERNS,
} from "../helpers/constants";

export const MENUS = [
  {
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
    contexts: ["link"],
    targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
    onclick: (info, tab) => OpenPopoutBackgroundHelper(info.linkUrl, tab.id),
  },
  {
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
    contexts: ["link"],
    targetUrlPatterns: YOUTUBE_PLAYLIST_URL_PATTERNS,
    onclick: (info, tab) => OpenPopoutBackgroundHelper(info.linkUrl, tab.id),
  },
];

/**
 * Initializes menus and event handlers
 */
export const InitMenus = async () => {
  console.log("[Background] InitMenus()");
  try {
    await browser.contextMenus.removeAll();
    MENUS.forEach((menu) => browser.contextMenus.create(menu));
  } catch (ex) {
    console.error("Failed to initialize context menus", ex);
  }
};
