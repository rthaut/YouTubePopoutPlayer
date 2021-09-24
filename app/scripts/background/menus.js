import Options from "../helpers/options";
import { GetVideoIDFromURL, GetPlaylistIDFromURL } from "../helpers/youtube";
import OpenPopoutPlayer from "./popout";
import { CloseTab } from "./tabs";

export const MENUS = [
  {
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
    contexts: ["link"],
    targetUrlPatterns: ["*://youtu.be/*", "*://*.youtube.com/watch?*"],
    onclick: (info, tab) =>
      OpenPopoutMenuAction(
        {
          id: GetVideoIDFromURL(info.linkUrl),
        },
        tab.id
      ),
  },
  {
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
    contexts: ["link"],
    targetUrlPatterns: [
      "*://youtu.be/*list=*",
      "*://*.youtube.com/watch?*list=*",
      "*://*.youtube.com/playlist?*list=*",
    ],
    onclick: (info, tab) =>
      OpenPopoutMenuAction(
        {
          id: GetVideoIDFromURL(info.linkUrl),
          list: GetPlaylistIDFromURL(info.linkUrl),
        },
        tab.id
      ),
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
    console.error("Failed to setup context menus", ex);
  }
};

/**
 * Helper function for opening the Popout Player (and optionally closing the original tab) via context menus
 * @param {object} popoutPlayerData data for the popout player
 * @param {number} tabId the ID of the tab from which the context menu click originated
 */
const OpenPopoutMenuAction = async (popoutPlayerData, tabId) => {
  await OpenPopoutPlayer({
    ...popoutPlayerData,
    originTabId: tabId,
  });

  if (await Options.GetLocalOption("advanced", "close")) {
    await CloseTab(tabId, true);
  }
};
