import {
  YOUTUBE_EMBED_URL_PATTERNS,
  YOUTUBE_PLAYLIST_URL_PATTERNS,
  YOUTUBE_POPOUT_PLAYER_URL_PATTERNS,
  YOUTUBE_VIDEO_URL_PATTERNS,
} from "@/utils/constants";
import Options from "@/utils/options";
import type { VideoPlayerInfo } from "@/utils/types";
import { GetPlaylistIDFromURL, IsVideoURL } from "@/utils/youtube";

import { ShowBasicNotification } from "./notifications";
import { OpenPopoutBackgroundHelper } from "./popout";

type ContextMenuProperties = Parameters<typeof browser.contextMenus.create>[0];
type ContextMenuClickListener = Parameters<
  typeof browser.contextMenus.onClicked.addListener
>[0];
type ContextMenuClickData = Parameters<ContextMenuClickListener>[0];
type ContextMenuClickTab = Parameters<ContextMenuClickListener>[1];

const MENU_IDS = {
  openVideo: "OpenVideo",
  openPlaylist: "OpenPlaylist",
  linkRotationParent: "LinkRotationParent",
  frameRotationParent: "FrameRotationParent",
  popoutRotationParent: "PopoutRotationParent",
  openVideoRotateLeft: "OpenVideoRotateLeft",
  openVideoRotateRight: "OpenVideoRotateRight",
  openPlaylistRotateLeft: "OpenPlaylistRotateLeft",
  openPlaylistRotateRight: "OpenPlaylistRotateRight",
  openEmbeddedVideo: "OpenEmbeddedVideo",
  openEmbeddedVideoRotateLeft: "OpenEmbeddedVideoRotateLeft",
  openEmbeddedVideoRotateRight: "OpenEmbeddedVideoRotateRight",
  rotatePopoutVideoLeft: "RotatePopoutVideoLeft",
  rotatePopoutVideoRight: "RotatePopoutVideoRight",
} as const;

const YOUTUBE_LINK_ROTATION_URL_PATTERNS = [
  ...YOUTUBE_VIDEO_URL_PATTERNS,
  ...YOUTUBE_PLAYLIST_URL_PATTERNS,
] as const;

const GetMenus = async () => {
  const menus: ContextMenuProperties[] = [
    {
      id: MENU_IDS.openVideo,
      title: browser.i18n.getMessage("ContextMenuEntry_Open_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_VIDEO_URL_PATTERNS),
    },
    {
      id: MENU_IDS.openPlaylist,
      title: browser.i18n.getMessage("LinkContextMenuEntry_OpenPlaylist_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_PLAYLIST_URL_PATTERNS),
    },
    {
      id: MENU_IDS.openEmbeddedVideo,
      title: browser.i18n.getMessage("FrameContextMenuEntry_Open_Text"),
      contexts: ["frame"],
      documentUrlPatterns: Array.from(YOUTUBE_EMBED_URL_PATTERNS),
    },
  ];

  const showRotationMenus = await Options.GetLocalOption(
    "behavior",
    "showRotationMenus",
  );

  if (showRotationMenus !== false) {
    menus.push({
      id: MENU_IDS.linkRotationParent,
      title: browser.i18n.getMessage("LinkContextMenuEntry_RotateAndOpen_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_LINK_ROTATION_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.openVideoRotateLeft,
      parentId: MENU_IDS.linkRotationParent,
      title: browser.i18n.getMessage("ContextMenuEntry_OpenRotatedLeft_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_VIDEO_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.openVideoRotateRight,
      parentId: MENU_IDS.linkRotationParent,
      title: browser.i18n.getMessage("ContextMenuEntry_OpenRotatedRight_Text"),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_VIDEO_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.openPlaylistRotateLeft,
      parentId: MENU_IDS.linkRotationParent,
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenPlaylistRotatedLeft_Text",
      ),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_PLAYLIST_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.openPlaylistRotateRight,
      parentId: MENU_IDS.linkRotationParent,
      title: browser.i18n.getMessage(
        "LinkContextMenuEntry_OpenPlaylistRotatedRight_Text",
      ),
      contexts: ["link"],
      targetUrlPatterns: Array.from(YOUTUBE_PLAYLIST_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.frameRotationParent,
      title: browser.i18n.getMessage(
        "FrameContextMenuEntry_RotateAndOpen_Text",
      ),
      contexts: ["frame"],
      documentUrlPatterns: Array.from(YOUTUBE_EMBED_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.openEmbeddedVideoRotateLeft,
      parentId: MENU_IDS.frameRotationParent,
      title: browser.i18n.getMessage(
        "FrameContextMenuEntry_OpenRotatedLeft_Text",
      ),
      contexts: ["frame"],
      documentUrlPatterns: Array.from(YOUTUBE_EMBED_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.openEmbeddedVideoRotateRight,
      parentId: MENU_IDS.frameRotationParent,
      title: browser.i18n.getMessage(
        "FrameContextMenuEntry_OpenRotatedRight_Text",
      ),
      contexts: ["frame"],
      documentUrlPatterns: Array.from(YOUTUBE_EMBED_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.popoutRotationParent,
      title: browser.i18n.getMessage("ContextMenuEntry_RotatePopoutVideo_Text"),
      contexts: ["page", "video"],
      documentUrlPatterns: Array.from(YOUTUBE_POPOUT_PLAYER_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.rotatePopoutVideoLeft,
      parentId: MENU_IDS.popoutRotationParent,
      title: browser.i18n.getMessage("PopoutPlayerControls_RotateVideo_Left"),
      contexts: ["page", "video"],
      documentUrlPatterns: Array.from(YOUTUBE_POPOUT_PLAYER_URL_PATTERNS),
    });
    menus.push({
      id: MENU_IDS.rotatePopoutVideoRight,
      parentId: MENU_IDS.popoutRotationParent,
      title: browser.i18n.getMessage("PopoutPlayerControls_RotateVideo_Right"),
      contexts: ["page", "video"],
      documentUrlPatterns: Array.from(YOUTUBE_POPOUT_PLAYER_URL_PATTERNS),
    });
  }

  return menus;
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
    for (const menu of menus) {
      await browser.contextMenus.create(menu);
    }
  } catch (ex) {
    console.error("Failed to initialize context menus", ex);
  }
};

export const OnMenuClicked = async (
  info: ContextMenuClickData,
  tab: ContextMenuClickTab,
) => {
  let success = true;

  switch (info.menuItemId) {
    case MENU_IDS.openVideo:
      success = await OpenVideo(info, tab);
      break;

    case MENU_IDS.openPlaylist:
      success = await OpenPlaylist(info, tab);
      break;

    case MENU_IDS.openVideoRotateLeft:
      success = await OpenVideo(info, tab, 270);
      break;

    case MENU_IDS.openVideoRotateRight:
      success = await OpenVideo(info, tab, 90);
      break;

    case MENU_IDS.openPlaylistRotateLeft:
      success = await OpenPlaylist(info, tab, 270);
      break;

    case MENU_IDS.openPlaylistRotateRight:
      success = await OpenPlaylist(info, tab, 90);
      break;

    case MENU_IDS.openEmbeddedVideo:
      success = await OpenEmbeddedVideo(info, tab);
      break;

    case MENU_IDS.openEmbeddedVideoRotateLeft:
      success = await OpenEmbeddedVideo(info, tab, 270);
      break;

    case MENU_IDS.openEmbeddedVideoRotateRight:
      success = await OpenEmbeddedVideo(info, tab, 90);
      break;

    case MENU_IDS.rotatePopoutVideoLeft:
      success = await RotatePopoutVideo(tab, -90);
      break;

    case MENU_IDS.rotatePopoutVideoRight:
      success = await RotatePopoutVideo(tab, +90);
      break;
  }

  if (success !== true) {
    NotifyMenuActionFailed();
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

export const GetYouTubeURLFromMenuInfo = (
  info: ContextMenuClickData,
): string | undefined => {
  const candidates = [info.frameUrl, info.linkUrl, info.srcUrl, info.pageUrl];
  return candidates.find(IsSupportedYouTubeOpenURL);
};

const IsSupportedYouTubeOpenURL = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  return IsVideoURL(url) || GetPlaylistIDFromURL(url) !== undefined;
};

const GetPlayerInfoFromFrame = async (
  tabId: number | undefined,
  frameId: number | undefined,
): Promise<VideoPlayerInfo | undefined> => {
  if (tabId === undefined || frameId === undefined) {
    return;
  }

  try {
    return (await browser.tabs.sendMessage(
      tabId,
      {
        action: "get-video-player-info",
      },
      {
        frameId,
      },
    )) as VideoPlayerInfo | undefined;
  } catch (error) {
    console.warn("Failed to get embedded video player info", error);
    return;
  }
};

const OpenEmbeddedVideo = async (
  info: ContextMenuClickData,
  tab: ContextMenuClickTab,
  rotation: number = 0,
): Promise<boolean> => {
  return OpenMenuPopout(info, tab, {
    includeList: true,
    rotation,
  });
};

const OpenVideo = (
  info: ContextMenuClickData,
  tab: ContextMenuClickTab,
  rotation: number = 0,
): Promise<boolean> => {
  return OpenMenuPopout(info, tab, {
    includeList: false,
    rotation,
  });
};

const OpenPlaylist = (
  info: ContextMenuClickData,
  tab: ContextMenuClickTab,
  rotation: number = 0,
): Promise<boolean> => {
  return OpenMenuPopout(info, tab, {
    includeList: true,
    rotation,
  });
};

const OpenMenuPopout = async (
  info: ContextMenuClickData,
  tab: ContextMenuClickTab,
  {
    includeList,
    rotation = 0,
  }: {
    includeList: boolean;
    rotation?: number;
  },
): Promise<boolean> => {
  const url = GetYouTubeURLFromMenuInfo(info);
  if (!url) {
    console.warn("No video or playlist detected from context menu", info);
    return false;
  }

  const isEmbeddedFrame = IsSupportedYouTubeOpenURL(info.frameUrl);
  const playerInfo = isEmbeddedFrame
    ? await GetPlayerInfoFromFrame(tab?.id, info.frameId)
    : undefined;

  return await OpenPopoutBackgroundHelper({
    url,
    tabId: tab?.id,
    includeList,
    allowCloseTab: !isEmbeddedFrame,
    allowCloseTabOnAnyDomain: false,
    time: playerInfo?.time,
    originalVideoWidth: playerInfo?.width,
    originalVideoHeight: playerInfo?.height,
    rotation,
    contentFrameId: isEmbeddedFrame ? info.frameId : undefined,
  });
};

const RotatePopoutVideo = async (
  tab: ContextMenuClickTab,
  rotationAmount: number,
): Promise<boolean> => {
  if (tab?.id === undefined) {
    console.warn("No tab detected for popout video rotation");
    return false;
  }

  try {
    await browser.tabs.sendMessage(tab.id, {
      action: "rotate-video-player",
      data: {
        rotationAmount,
      },
    });
    return true;
  } catch (error) {
    console.warn("Failed to rotate popout video", error);
    return false;
  }
};

const NotifyMenuActionFailed = () => {
  ShowBasicNotification({
    message: browser.i18n.getMessage("Notification_Error_FailedToOpen"),
  });
};
