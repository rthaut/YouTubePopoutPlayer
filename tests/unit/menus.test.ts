import {
  GetYouTubeURLFromMenuInfo,
  InitMenus,
  OnMenuClicked,
} from "@/entrypoints/background/menus";
import { ShowBasicNotification } from "@/entrypoints/background/notifications";
import { OpenPopoutBackgroundHelper } from "@/entrypoints/background/popout";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POPOUT_PLAYER_PARAM_NAME } from "@/utils/constants";

vi.mock("@/entrypoints/background/popout", () => ({
  OpenPopoutBackgroundHelper: vi.fn(),
}));

vi.mock("@/entrypoints/background/notifications", () => ({
  ShowBasicNotification: vi.fn(),
}));

type ContextMenuClickData = Parameters<typeof GetYouTubeURLFromMenuInfo>[0];
type ContextMenuClickTab = Parameters<typeof OnMenuClicked>[1];

const mockedOpenPopoutBackgroundHelper = vi.mocked(OpenPopoutBackgroundHelper);
const mockedShowBasicNotification = vi.mocked(ShowBasicNotification);

const VIDEO_ID = "dQw4w9WgXcQ";
const PLAYING_VIDEO_ID = "YuMdsHIXatY";
const videoUrl = `https://www.youtube.com/embed/${VIDEO_ID}`;
const videoUrlWithPlaylist = `${videoUrl}?list=PL123`;
const playlistUrl = "https://www.youtube.com/embed/videoseries?list=PL123";
const popoutUrl = `${videoUrl}?${POPOUT_PLAYER_PARAM_NAME}=1`;
const videoWatchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const videoWatchUrlWithPlaylist = `${videoWatchUrl}&list=PL123`;
const otherVideoWatchUrl = `https://www.youtube.com/watch?v=${PLAYING_VIDEO_ID}`;

const menuInfo = (info: Partial<ContextMenuClickData>): ContextMenuClickData =>
  info as ContextMenuClickData;

const tab = (tabInfo: Partial<ContextMenuClickTab>): ContextMenuClickTab =>
  tabInfo as ContextMenuClickTab;

const stubFramePlayerInfo = (playerInfo: object | undefined) => {
  const sendMessage = vi.fn(async () => playerInfo);
  vi.stubGlobal("browser", {
    tabs: {
      sendMessage,
    },
  });
  return sendMessage;
};

beforeEach(() => {
  mockedOpenPopoutBackgroundHelper.mockResolvedValue(true);
});

afterEach(() => {
  mockedOpenPopoutBackgroundHelper.mockReset();
  mockedShowBasicNotification.mockReset();
  vi.unstubAllGlobals();
});

describe("context menu URL selection", () => {
  it("uses the embedded frame URL for frame actions", () => {
    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({ frameUrl: playlistUrl, linkUrl: otherVideoWatchUrl }),
        "frame",
      ),
    ).toBe(playlistUrl);
  });

  it("uses the clicked link URL for link actions inside an embedded frame", () => {
    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({ frameUrl: videoUrl, linkUrl: otherVideoWatchUrl }),
        "link",
      ),
    ).toBe(otherVideoWatchUrl);
  });

  it("ignores URLs that do not identify a video or playlist", () => {
    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({
          frameUrl: videoUrl,
          linkUrl: "https://example.com/video",
        }),
        "link",
      ),
    ).toBeUndefined();
  });

  it("allows popout player URLs to open a new popout player", () => {
    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({
          frameUrl: popoutUrl,
          pageUrl: "https://example.com/page",
        }),
        "frame",
      ),
    ).toBe(popoutUrl);
  });
});

describe("context menu click handling", () => {
  it("opens rotated video links without playlist context", async () => {
    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenVideoRotateLeft",
        linkUrl: videoWatchUrlWithPlaylist,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: videoWatchUrlWithPlaylist,
        includeList: false,
        rotation: 270,
      }),
    );
  });

  it("opens rotated playlist links with playlist context", async () => {
    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenPlaylistRotateRight",
        linkUrl: videoWatchUrlWithPlaylist,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: videoWatchUrlWithPlaylist,
        includeList: true,
        rotation: 90,
      }),
    );
  });

  it("opens the clicked link rather than the containing embedded frame", async () => {
    const sendMessage = stubFramePlayerInfo({ time: 42 });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenVideo",
        frameUrl: videoUrl,
        frameId: 3,
        linkUrl: otherVideoWatchUrl,
      }),
      tab({ id: 1 }),
    );

    expect(sendMessage).not.toHaveBeenCalled();
    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: otherVideoWatchUrl,
        allowCloseTab: true,
        contentFrameId: undefined,
      }),
    );
  });

  it("opens embedded video actions without playlist context", async () => {
    stubFramePlayerInfo({ id: VIDEO_ID, time: 42 });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenEmbeddedVideoRotateLeft",
        frameUrl: videoUrlWithPlaylist,
        frameId: 3,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: videoUrlWithPlaylist,
        includeList: false,
        allowCloseTab: false,
        rotation: 270,
        contentFrameId: 3,
      }),
    );
  });

  it("opens embedded playlist actions with playlist context", async () => {
    stubFramePlayerInfo({ id: VIDEO_ID, time: 42 });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenEmbeddedPlaylistRotateRight",
        frameUrl: videoUrlWithPlaylist,
        frameId: 3,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: videoUrlWithPlaylist,
        includeList: true,
        rotation: 90,
      }),
    );
  });

  it("opens the video playing in an embedded playlist at its current time", async () => {
    const sendMessage = stubFramePlayerInfo({
      id: PLAYING_VIDEO_ID,
      time: 42,
      width: 640,
      height: 360,
    });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenEmbeddedPlaylist",
        frameUrl: playlistUrl,
        frameId: 3,
      }),
      tab({ id: 1 }),
    );

    expect(sendMessage).toHaveBeenCalledWith(
      1,
      { action: "get-video-player-info" },
      { frameId: 3 },
    );
    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: playlistUrl,
        videoId: PLAYING_VIDEO_ID,
        time: 42,
        originalVideoWidth: 640,
        originalVideoHeight: 360,
      }),
    );
  });

  it("does not resume an embedded playlist when the playing video is unknown", async () => {
    stubFramePlayerInfo({ time: 42 });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenEmbeddedPlaylist",
        frameUrl: videoUrlWithPlaylist,
        frameId: 3,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: videoUrlWithPlaylist,
        videoId: undefined,
        time: undefined,
      }),
    );
  });

  it("resumes a single embedded video when the player does not report its ID", async () => {
    stubFramePlayerInfo({ time: 42 });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenEmbeddedVideo",
        frameUrl: videoUrl,
        frameId: 3,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: videoUrl,
        time: 42,
      }),
    );
  });

  it("notifies when a selected menu action cannot determine what to open", async () => {
    vi.stubGlobal("browser", {
      i18n: {
        getMessage: vi.fn(() => "Failed to open popout player"),
      },
    });

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenVideoRotateLeft",
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).not.toHaveBeenCalled();
    expect(mockedShowBasicNotification).toHaveBeenCalledWith({
      message: "Failed to open popout player",
    });
  });

  it("notifies when a selected menu action does not report success", async () => {
    vi.stubGlobal("browser", {
      i18n: {
        getMessage: vi.fn(() => "Failed to open popout player"),
      },
    });
    mockedOpenPopoutBackgroundHelper.mockResolvedValueOnce(
      undefined as unknown as boolean,
    );

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenVideoRotateLeft",
        linkUrl: videoWatchUrl,
      }),
      tab({ id: 1 }),
    );

    expect(mockedShowBasicNotification).toHaveBeenCalledWith({
      message: "Failed to open popout player",
    });
  });
});

describe("InitMenus", () => {
  it("registers the click listener before menus are rebuilt", () => {
    const addListener = vi.fn();
    vi.stubGlobal("browser", {
      contextMenus: {
        // never resolves, so anything registered after it would not run
        removeAll: vi.fn(() => new Promise(() => {})),
        create: vi.fn(),
        onClicked: {
          addListener,
        },
      },
      storage: {
        local: {
          onChanged: {
            addListener: vi.fn(),
          },
        },
      },
    });

    InitMenus();

    expect(addListener).toHaveBeenCalledWith(OnMenuClicked);
  });
});
