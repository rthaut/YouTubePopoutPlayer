import { GetVideoIDFromURL, GetPlaylistIDFromURL } from "../helpers/youtube";
import OpenPopoutPlayer from "./popout";

export const MENUS = [
  {
    id: "open-popout-player-for-video",
    title: browser.i18n.getMessage("LinkContextMenuEntry_OpenVideo_Text"),
    contexts: ["link"],
    targetUrlPatterns: ["*://youtu.be/*", "*://*.youtube.com/watch?*"],
  },
  {
    id: "open-popout-player-for-playlist",
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
export const InitMenus = () => {
  try {
    MENUS.forEach((menu) =>
      browser.contextMenus
        .remove(menu.id)
        .finally(browser.contextMenus.create(menu))
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
export const OnMenuClicked = (info, tab) => {
  switch (info.menuItemId) {
    case "open-popout-player-for-video":
      OpenPopoutPlayer({
        id: GetVideoIDFromURL(info.linkUrl),
        originalWindowID: tab.windowId,
      });
      break;

    case "open-popout-player-for-playlist":
      OpenPopoutPlayer({
        id: GetVideoIDFromURL(info.linkUrl),
        list: GetPlaylistIDFromURL(info.linkUrl),
        originalWindowID: tab.windowId,
      });
      break;
  }
};
