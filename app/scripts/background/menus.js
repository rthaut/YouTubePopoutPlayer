import {
  COMMAND_OPEN_POPOUT_VIDEO,
  COMMAND_OPEN_POPOUT_PLAYLIST,
} from "../helpers/constants";
import Options from "../helpers/options";
import { GetVideoIDFromURL, GetPlaylistIDFromURL } from "../helpers/youtube";
import OpenPopoutPlayer from "./popout";
import { CloseTab } from "./tabs";

export const MENUS = [
  {
    id: COMMAND_OPEN_POPOUT_VIDEO,
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
    contexts: ["link"],
    targetUrlPatterns: ["*://youtu.be/*", "*://*.youtube.com/watch?*"],
  },
  {
    id: COMMAND_OPEN_POPOUT_PLAYLIST,
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
    contexts: ["link"],
    targetUrlPatterns: [
      "*://youtu.be/*list=*",
      "*://*.youtube.com/watch?*list=*",
      "*://*.youtube.com/playlist?*list=*",
    ],
  },
];

/**
 * Initializes menus and event handlers
 */
export const InitMenus = async () => {
  console.log("[Background] InitMenus()");
  try {
    await Promise.all(
      MENUS.map((menu) =>
        browser.contextMenus
          .remove(menu.id)
          .catch((error) => void error)
          .finally(browser.contextMenus.create(menu))
      )
    );
    browser.contextMenus.onClicked.addListener(OnMenuClicked);
  } catch (ex) {
    console.error("Failed to setup context menus", ex);
  }
};

/**
 * Event handler for when a menu item is clicked
 * @param {object} info menu info
 */
export const OnMenuClicked = async (info, tab) => {
  console.log("[Background] OnMenuClicked()", info, tab);
  switch (info.menuItemId) {
    case COMMAND_OPEN_POPOUT_VIDEO:
      await OpenPopoutMenuAction(
        {
          id: GetVideoIDFromURL(info.linkUrl),
        },
        tab
      );
      break;

    case COMMAND_OPEN_POPOUT_PLAYLIST:
      await OpenPopoutMenuAction(
        {
          id: GetVideoIDFromURL(info.linkUrl),
          list: GetPlaylistIDFromURL(info.linkUrl),
        },
        tab
      );
      break;
  }
};

const OpenPopoutMenuAction = async (popoutPlayerData, tab) => {
  await OpenPopoutPlayer({
    ...popoutPlayerData,
    originalWindowID: tab.windowId,
  });

  if (await Options.GetLocalOption("advanced", "close")) {
    await CloseTab(tab.id, true);
  }
};
