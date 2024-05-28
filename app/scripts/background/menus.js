import {
  YOUTUBE_PLAYLIST_URL_PATTERNS,
  YOUTUBE_VIDEO_URL_PATTERNS,
} from "../helpers/constants";
import Options from "../helpers/options";
import { OpenPopoutBackgroundHelper } from "./popout";

const GetMenus = async () => {
  const menus = [
    {
      id: "OpenVideo",
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
    },
    {
      id: "OpenPlaylist",
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_PLAYLIST_URL_PATTERNS,
    },
  ];

  const showRotationMenus = await Options.GetLocalOption("behavior", "showRotationMenus");

  if (showRotationMenus !== false) {
    menus.push({
      id: "OpenVideoRotateLeft",
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideoRotateLeft_Text"),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
    });
    menus.push({
      id: "OpenVideoRotateRight",
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideoRotateRight_Text"),
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_VIDEO_URL_PATTERNS,
    });
  }

  return menus;
};

const OnMenuClicked = async (info, tab) => {
  switch (info.menuItemId) {
    case "OpenVideo":
    case "OpenPlaylist":
      OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false);
      break;

    case "OpenVideoRotateLeft":
      OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false, 270)
      break;

    case "OpenVideoRotateRight":
      OpenPopoutBackgroundHelper(info.linkUrl, tab.id, true, false, 90)
      break;
  }
}

const CreateMenus = async (reset = true) => {
  try {
    if (reset) {
      await browser.contextMenus.removeAll();
    }

    if (!browser.contextMenus.onClicked.hasListener(OnMenuClicked)) {
      browser.contextMenus.onClicked.addListener(OnMenuClicked);
    }

    const menus = await GetMenus();
    menus.forEach((menu) => browser.contextMenus.create(menu));
  } catch (ex) {
    console.error("Failed to initialize context menus", ex);
  }
};

/**
 * Initializes menus and event handlers
 */
export const InitMenus = async () => {
  console.log("[Background] InitMenus()");

  CreateMenus();
  browser.storage.local.onChanged.addListener((changes) => {
    if (Object.keys(changes).includes("behavior.showRotationMenus")) {
      CreateMenus(true);
    }
  });
};
