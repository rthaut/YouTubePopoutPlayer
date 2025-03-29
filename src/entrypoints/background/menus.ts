import type { Menus, Tabs } from "wxt/browser";

import {
  YOUTUBE_PLAYLIST_URL_PATTERNS,
  YOUTUBE_VIDEO_URL_PATTERNS,
} from "@/utils/constants";
import Options from "@/utils/options";

import { OpenPopoutBackgroundHelper } from "./popout";

const GetMenus = async () => {
  const menus: Menus.CreateCreatePropertiesType[] = [
    {
      id: "OpenVideo",
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_VIDEO_URL_PATTERNS),
    },
    {
      id: "OpenPlaylist",
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_PLAYLIST_URL_PATTERNS),
    },
  ];

  const showRotationMenus = await Options.GetLocalOption(
    "behavior",
    "showRotationMenus",
  );

  if (showRotationMenus !== false) {
    menus.push({
      id: "OpenVideoRotateLeft",
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenVideoRotateLeft_Text",
      ),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_VIDEO_URL_PATTERNS),
    });
    menus.push({
      id: "OpenVideoRotateRight",
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenVideoRotateRight_Text",
      ),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_VIDEO_URL_PATTERNS),
    });
  }

  return menus;
};

const OnMenuClicked = async (
  info: Menus.OnClickData,
  tab: Tabs.Tab | undefined,
) => {
  if (!info.linkUrl) {
    return;
  }

  switch (info.menuItemId) {
    case "OpenVideo":
    case "OpenPlaylist":
      OpenPopoutBackgroundHelper({
        url: info.linkUrl,
        tabId: tab?.id,
        includeList: info.menuItemId === "OpenPlaylist", // omit playlist when opening video only
        allowCloseTab: true,
        allowCloseTabOnAnyDomain: false,
      });
      break;

    case "OpenVideoRotateLeft":
      OpenPopoutBackgroundHelper({
        url: info.linkUrl,
        tabId: tab?.id,
        allowCloseTab: true,
        allowCloseTabOnAnyDomain: false,
        rotation: 270,
      });
      break;

    case "OpenVideoRotateRight":
      OpenPopoutBackgroundHelper({
        url: info.linkUrl,
        tabId: tab?.id,
        allowCloseTab: true,
        allowCloseTabOnAnyDomain: false,
        rotation: 90,
      });
      break;
  }
};

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
  CreateMenus();
  browser.storage.local.onChanged.addListener((changes) => {
    if (Object.keys(changes).includes("behavior.showRotationMenus")) {
      CreateMenus(true);
    }
  });
};
