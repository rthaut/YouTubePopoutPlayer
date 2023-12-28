import {
  YOUTUBE_PLAYLIST_URL_PATTERNS,
  YOUTUBE_VIDEO_URL_PATTERNS,
} from "../helpers/constants";
import Options from "../helpers/options";
import { OpenPopoutBackgroundHelper } from "./popout";

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

  const showRotationMenus = await Options.GetLocalOption(
    "behavior",
    "showRotationMenus",
  );
  if (showRotationMenus !== false) {
    menus.push({
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenVideoRotateLeft_Text",
      ),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
      onclick: (info, tab) =>
        OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false, 270),
    });
    menus.push({
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenVideoRotateRight_Text",
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

  const createMenus = async (reset = true) => {
    try {
      if (reset) {
        await browser.contextMenus.removeAll();
      }
      const menus = await GetMenus();
      menus.forEach((menu) => browser.contextMenus.create(menu));
    } catch (ex) {
      console.error("Failed to initialize context menus", ex);
    }
  };

  createMenus();
  browser.storage.local.onChanged.addListener((changes) => {
    if (Object.keys(changes).includes("behavior.showRotationMenus")) {
      createMenus(true);
    }
  });
};
