import {
  GetYouTubeURLFromMenuInfo,
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
const videoUrl = `https://www.youtube.com/embed/${VIDEO_ID}`;
const playlistUrl = "https://www.youtube.com/embed/videoseries?list=PL123";
const popoutUrl = `${videoUrl}?${POPOUT_PLAYER_PARAM_NAME}=1`;
const videoWatchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const videoWatchUrlWithPlaylist = `${videoWatchUrl}&list=PL123`;

const menuInfo = (info: Partial<ContextMenuClickData>): ContextMenuClickData =>
  info as ContextMenuClickData;

const tab = (tabInfo: Partial<ContextMenuClickTab>): ContextMenuClickTab =>
  tabInfo as ContextMenuClickTab;

beforeEach(() => {
  mockedOpenPopoutBackgroundHelper.mockResolvedValue(true);
});

afterEach(() => {
  mockedOpenPopoutBackgroundHelper.mockReset();
  mockedShowBasicNotification.mockReset();
  vi.unstubAllGlobals();
});

describe("context menu URL selection", () => {
  it("uses the embedded frame URL when a YouTube video frame is selected", () => {
    expect(GetYouTubeURLFromMenuInfo(menuInfo({ frameUrl: videoUrl }))).toBe(
      videoUrl,
    );
  });

  it("uses the embedded frame URL when a YouTube playlist frame is selected", () => {
    expect(GetYouTubeURLFromMenuInfo(menuInfo({ frameUrl: playlistUrl }))).toBe(
      playlistUrl,
    );
  });

  it("uses the first supported URL from the context menu data", () => {
    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({
          linkUrl: "https://example.com/video",
          frameUrl: videoUrl,
          pageUrl: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
        }),
      ),
    ).toBe(videoUrl);
  });

  it("prefers the frame URL when both frame and link URLs are available", () => {
    const frameUrl = `${videoUrl}?list=PL123`;

    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({
          frameUrl,
          linkUrl: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
        }),
      ),
    ).toBe(frameUrl);
  });

  it("allows popout player URLs to open a new popout player", () => {
    expect(
      GetYouTubeURLFromMenuInfo(
        menuInfo({
          frameUrl: popoutUrl,
          pageUrl: "https://example.com/page",
        }),
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

  it("opens embedded video actions without playlist context when requested", async () => {
    const frameUrl = `${videoUrl}?list=PL123`;

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenVideoRotateLeft",
        frameUrl,
        linkUrl: videoWatchUrlWithPlaylist,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: frameUrl,
        includeList: false,
        rotation: 270,
      }),
    );
  });

  it("opens embedded playlist actions with playlist context when requested", async () => {
    const frameUrl = `${videoUrl}?list=PL123`;

    await OnMenuClicked(
      menuInfo({
        menuItemId: "OpenPlaylistRotateRight",
        frameUrl,
        linkUrl: videoWatchUrlWithPlaylist,
      }),
      tab({ id: 1 }),
    );

    expect(mockedOpenPopoutBackgroundHelper).toHaveBeenCalledWith(
      expect.objectContaining({
        url: frameUrl,
        includeList: true,
        rotation: 90,
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
