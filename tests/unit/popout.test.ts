import type { Browser } from "wxt/browser";
import {
  OpenPopoutPlayer,
  OpenPopoutPlayerInTab,
  OpenPopoutPlayerInWindow,
} from "@/entrypoints/background/popout";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OPTION_DEFAULTS } from "@/utils/constants";

type TestTab = Browser.tabs.Tab & { cookieStoreId?: string };

const POPOUT_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ?__ytpp=1";

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

const CreateWindow = (
  overrides: Partial<Browser.windows.Window> = {},
): Browser.windows.Window =>
  ({
    focused: true,
    id: 789,
    incognito: false,
    state: "normal",
    type: "popup",
    ...overrides,
  }) as Browser.windows.Window;

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
  createdTab = CreateTab(),
  createdWindow = CreateWindow(),
  queryTabs = [],
  tabsCreateError,
  windowsCreateError,
  windowsUpdateError,
}: {
  browserName?: string;
  optionOverrides?: Record<string, unknown>;
  originTab?: TestTab;
  createdTab?: TestTab | undefined;
  createdWindow?: Browser.windows.Window | undefined;
  queryTabs?: TestTab[];
  tabsCreateError?: Error;
  windowsCreateError?: Error;
  windowsUpdateError?: Error;
} = {}) => {
  const storageValues = {
    ...CreateFlatDefaultOptions(),
    ...optionOverrides,
  };
  const notificationsCreate = vi.fn();
  const tabsCreate = vi.fn();
  const tabsGet = vi.fn().mockResolvedValue(originTab);
  const tabsQuery = vi.fn().mockResolvedValue(queryTabs);
  const tabsRemove = vi.fn().mockResolvedValue(undefined);
  const tabsUpdate = vi
    .fn()
    .mockImplementation(async (tabId: number, props: { url: string }) => {
      const match = queryTabs.find((tab) => tab.id === tabId) ?? CreateTab();
      return { ...match, ...props };
    });
  const windowsCreate = vi.fn();
  const windowsRemove = vi.fn().mockResolvedValue(undefined);
  const windowsUpdate = vi.fn().mockImplementation(async () => {
    if (windowsUpdateError) {
      throw windowsUpdateError;
    }
    return CreateWindow();
  });

  if (tabsCreateError) {
    tabsCreate.mockRejectedValue(tabsCreateError);
  } else {
    tabsCreate.mockResolvedValue(createdTab);
  }

  if (windowsCreateError) {
    windowsCreate.mockRejectedValue(windowsCreateError);
  } else {
    windowsCreate.mockResolvedValue(createdWindow);
  }

  vi.stubGlobal("browser", {
    i18n: {
      getMessage: vi.fn((messageName: string) => messageName),
    },
    notifications: {
      clear: vi.fn(),
      create: notificationsCreate,
      onClicked: {
        addListener: vi.fn(),
        hasListener: vi.fn().mockReturnValue(false),
        removeListener: vi.fn(),
      },
    },
    runtime: {
      getBrowserInfo: vi.fn().mockResolvedValue({ name: browserName }),
      getURL: vi.fn((url: string) => url),
    },
    storage: {
      local: {
        get: vi.fn().mockResolvedValue(storageValues),
      },
    },
    tabs: {
      create: tabsCreate,
      get: tabsGet,
      query: tabsQuery,
      remove: tabsRemove,
      update: tabsUpdate,
    },
    windows: {
      create: windowsCreate,
      remove: windowsRemove,
      update: windowsUpdate,
    },
  });

  return {
    notificationsCreate,
    tabsCreate,
    tabsQuery,
    tabsRemove,
    tabsUpdate,
    windowsCreate,
    windowsRemove,
    windowsUpdate,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("OpenPopoutPlayerInWindow", () => {
  it("reports window creation failures", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { notificationsCreate, windowsRemove } = StubBrowser({
      windowsCreateError: new Error("create failed"),
    });

    await expect(
      OpenPopoutPlayerInWindow(POPOUT_URL, false, 42),
    ).resolves.toBeNull();

    expect(error).toHaveBeenCalledWith(
      "[Background] Failed to open popout player",
      expect.any(Error),
    );
    expect(windowsRemove).not.toHaveBeenCalled();
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Error_PopoutOpenFailed",
      }),
    );
  });

  it("closes and reports a popup opened outside the origin private context", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { notificationsCreate, tabsRemove, windowsCreate, windowsRemove } =
      StubBrowser({
        originTab: CreateTab({
          incognito: true,
          windowId: 1,
        }),
        createdWindow: CreateWindow({
          id: 7,
          incognito: false,
        }),
      });

    await expect(
      OpenPopoutPlayerInWindow(POPOUT_URL, false, 42),
    ).resolves.toBeNull();

    expect(windowsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        incognito: true,
        url: POPOUT_URL,
      }),
    );
    expect(windowsRemove).toHaveBeenCalledWith(7);
    expect(tabsRemove).not.toHaveBeenCalled();
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Warning_PrivateWindowNotPreserved",
      }),
    );
  });

  it("keeps a created window open when post-create positioning fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const createdWindow = CreateWindow({
      id: 8,
      incognito: false,
    });
    const { notificationsCreate, windowsRemove, windowsUpdate } = StubBrowser({
      createdWindow,
      optionOverrides: {
        "position.mode": "custom",
      },
      windowsUpdateError: new Error("position failed"),
    });

    await expect(OpenPopoutPlayerInWindow(POPOUT_URL, false, 42)).resolves.toBe(
      createdWindow,
    );

    expect(windowsUpdate).toHaveBeenCalledWith(8, {
      left: 0,
      top: 0,
    });
    expect(warn).toHaveBeenCalledWith(
      "[Background] OpenPopoutPlayerInWindow() :: Unable to position created window",
      expect.any(Error),
    );
    expect(error).not.toHaveBeenCalled();
    expect(windowsRemove).not.toHaveBeenCalled();
    expect(notificationsCreate).not.toHaveBeenCalled();
  });
});

describe("OpenPopoutPlayerInTab", () => {
  it("reports tab creation failures", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { notificationsCreate, tabsRemove } = StubBrowser({
      tabsCreateError: new Error("create failed"),
    });

    await expect(OpenPopoutPlayerInTab(POPOUT_URL)).resolves.toBeNull();

    expect(error).toHaveBeenCalledWith(
      "[Background] Failed to open popout player",
      expect.any(Error),
    );
    expect(tabsRemove).not.toHaveBeenCalled();
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Error_PopoutOpenFailed",
      }),
    );
  });

  it("closes and reports a tab opened outside the origin context", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { notificationsCreate, tabsCreate, tabsRemove } = StubBrowser({
      browserName: "Firefox",
      optionOverrides: {
        "advanced.contextualIdentity": true,
      },
      originTab: CreateTab({
        cookieStoreId: "firefox-private",
        incognito: true,
        windowId: 1,
      }),
      createdTab: CreateTab({
        cookieStoreId: "firefox-private",
        id: 99,
        incognito: false,
        windowId: 1,
      }),
    });

    await expect(
      OpenPopoutPlayerInTab(POPOUT_URL, true, 42),
    ).resolves.toBeNull();

    expect(tabsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        cookieStoreId: "firefox-private",
        url: POPOUT_URL,
        windowId: 1,
      }),
    );
    expect(tabsRemove).toHaveBeenCalledWith(99);
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Warning_PrivateWindowNotPreserved",
      }),
    );
  });
});

describe("OpenPopoutPlayer", () => {
  it("returns a normalized result for a newly opened window", async () => {
    StubBrowser({
      createdWindow: CreateWindow({ id: 789 }),
    });

    await expect(
      OpenPopoutPlayer({ id: "dQw4w9WgXcQ", originTabId: 42 }),
    ).resolves.toEqual({
      target: "window",
      reused: false,
      tabIds: [],
      windowIds: [789],
    });
  });

  it("returns a normalized result for a newly opened tab", async () => {
    StubBrowser({
      optionOverrides: {
        "behavior.target": "tab",
      },
      createdTab: CreateTab({ id: 123, windowId: 456 }),
    });

    await expect(
      OpenPopoutPlayer({ id: "dQw4w9WgXcQ", originTabId: 42 }),
    ).resolves.toEqual({
      target: "tab",
      reused: false,
      tabIds: [123],
      windowIds: [456],
    });
  });

  it("returns a reused result when an existing popout tab is updated", async () => {
    const { tabsCreate, tabsUpdate } = StubBrowser({
      optionOverrides: {
        "behavior.target": "tab",
        "behavior.reuseWindowsTabs": true,
      },
      queryTabs: [CreateTab({ id: 555, windowId: 456 })],
    });

    await expect(
      OpenPopoutPlayer({ id: "dQw4w9WgXcQ", originTabId: 42 }),
    ).resolves.toEqual({
      target: "tab",
      reused: true,
      tabIds: [555],
      windowIds: [456],
    });
    expect(tabsUpdate).toHaveBeenCalledWith(555, expect.objectContaining({}));
    expect(tabsCreate).not.toHaveBeenCalled();
  });

  it("returns null when neither a video nor a playlist can be opened", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { notificationsCreate, tabsCreate, windowsCreate } = StubBrowser();

    await expect(OpenPopoutPlayer({ originTabId: 42 })).resolves.toBeNull();

    expect(tabsCreate).not.toHaveBeenCalled();
    expect(windowsCreate).not.toHaveBeenCalled();
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Error_FailedToOpen",
      }),
    );
  });
});
