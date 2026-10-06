import type { Browser } from "wxt/browser";
import {
  GetPopoutPlayerTabs,
  UpdatePopoutPlayerTab,
} from "@/entrypoints/background/tabs";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  OPTION_DEFAULTS,
  POPOUT_PLAYER_PARAM_NAME,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "@/utils/constants";

type TestTab = Browser.tabs.Tab & { cookieStoreId?: string };

const CreateTab = (overrides: Partial<TestTab> = {}): TestTab => ({
  active: false,
  autoDiscardable: true,
  discarded: false,
  frozen: false,
  groupId: -1,
  highlighted: false,
  id: 123,
  incognito: false,
  index: 0,
  pinned: false,
  selected: false,
  windowId: 456,
  ...overrides,
});

const CreateFlatDefaultOptions = () =>
  Object.fromEntries(
    Object.entries(OPTION_DEFAULTS).flatMap(([domain, options]) =>
      Object.entries(options).map(([name, value]) => [
        `${domain}.${name}`,
        value,
      ]),
    ),
  );

const StubBrowser = ({
  browserName = "Chrome",
  optionOverrides = {},
  originTab = CreateTab(),
  queryTabs = [],
}: {
  browserName?: string;
  optionOverrides?: Record<string, unknown>;
  originTab?: TestTab;
  queryTabs?: TestTab[];
} = {}) => {
  const storageValues = {
    ...CreateFlatDefaultOptions(),
    ...optionOverrides,
  };
  const tabsGet = vi.fn().mockResolvedValue(originTab);
  const tabsQuery = vi.fn().mockResolvedValue(queryTabs);
  const tabsUpdate = vi.fn().mockResolvedValue(CreateTab());
  const windowsUpdate = vi.fn().mockResolvedValue({ id: 456 });

  vi.stubGlobal("browser", {
    runtime: {
      getBrowserInfo: vi.fn().mockResolvedValue({ name: browserName }),
    },
    storage: {
      local: {
        get: vi.fn().mockResolvedValue(storageValues),
      },
    },
    tabs: {
      get: tabsGet,
      query: tabsQuery,
      update: tabsUpdate,
    },
    windows: {
      update: windowsUpdate,
    },
  });

  return {
    tabsGet,
    tabsQuery,
    tabsUpdate,
    windowsUpdate,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("GetPopoutPlayerTabs", () => {
  it("filters reusable popout tabs to the same private container and origin window", async () => {
    const matchingTab = CreateTab({
      cookieStoreId: "firefox-private",
      id: 101,
      incognito: true,
      windowId: 1,
    });
    const otherPrivateWindowTab = CreateTab({
      cookieStoreId: "firefox-private",
      id: 102,
      incognito: true,
      windowId: 2,
    });
    const normalTab = CreateTab({
      cookieStoreId: "firefox-default",
      id: 103,
      incognito: false,
      windowId: 1,
    });
    const otherContainerTab = CreateTab({
      cookieStoreId: "firefox-container-2",
      id: 104,
      incognito: true,
      windowId: 1,
    });
    const { tabsQuery } = StubBrowser({
      browserName: "Firefox",
      optionOverrides: {
        "advanced.contextualIdentity": true,
      },
      originTab: CreateTab({
        cookieStoreId: "firefox-private",
        incognito: true,
        windowId: 1,
      }),
      queryTabs: [
        matchingTab,
        otherPrivateWindowTab,
        normalTab,
        otherContainerTab,
      ],
    });

    await expect(GetPopoutPlayerTabs(42, true)).resolves.toEqual([matchingTab]);
    expect(tabsQuery).toHaveBeenCalledWith({
      url: [YOUTUBE_EMBED_URL, YOUTUBE_NOCOOKIE_EMBED_URL].map(
        (url) => url + `*?*${POPOUT_PLAYER_PARAM_NAME}=1*`,
      ),
    });
  });

  it("allows same-context popup-window tabs from another window", async () => {
    const matchingTab = CreateTab({
      cookieStoreId: "firefox-private",
      id: 101,
      incognito: true,
      windowId: 1,
    });
    const otherPrivateWindowTab = CreateTab({
      cookieStoreId: "firefox-private",
      id: 102,
      incognito: true,
      windowId: 2,
    });
    StubBrowser({
      browserName: "Firefox",
      optionOverrides: {
        "advanced.contextualIdentity": true,
      },
      originTab: CreateTab({
        cookieStoreId: "firefox-private",
        incognito: true,
        windowId: 1,
      }),
      queryTabs: [
        matchingTab,
        otherPrivateWindowTab,
        CreateTab({
          cookieStoreId: "firefox-default",
          id: 103,
          incognito: false,
          windowId: 1,
        }),
      ],
    });

    await expect(GetPopoutPlayerTabs(42, false)).resolves.toEqual([
      matchingTab,
      otherPrivateWindowTab,
    ]);
  });
});

describe("UpdatePopoutPlayerTab", () => {
  it("activates the reused tab and focuses its window when active", async () => {
    const { tabsUpdate, windowsUpdate } = StubBrowser();

    await UpdatePopoutPlayerTab(
      CreateTab({ id: 123, windowId: 456 }),
      "https://www.youtube.com/embed/dQw4w9WgXcQ?__ytpp=1",
      true,
    );

    expect(tabsUpdate).toHaveBeenCalledWith(123, {
      active: true,
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?__ytpp=1",
    });
    expect(windowsUpdate).toHaveBeenCalledWith(456, { focused: true });
  });

  it("updates the reused tab in the background without changing focus", async () => {
    const { tabsUpdate, windowsUpdate } = StubBrowser();

    await UpdatePopoutPlayerTab(
      CreateTab({ id: 123, windowId: 456 }),
      "https://www.youtube.com/embed/dQw4w9WgXcQ?__ytpp=1",
      false,
    );

    expect(tabsUpdate).toHaveBeenCalledWith(123, {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?__ytpp=1",
    });
    expect(windowsUpdate).not.toHaveBeenCalled();
  });
});
