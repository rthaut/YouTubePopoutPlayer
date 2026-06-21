import type { Browser } from "wxt/browser";
import { OpenPopoutPlayerInWindow } from "@/entrypoints/background/popout";
import {
  ApplyOriginTabContextToDataObject,
  GetOriginTabContext,
} from "@/entrypoints/background/tabs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OPTION_DEFAULTS } from "@/utils/constants";

type TestTab = Browser.tabs.Tab & { cookieStoreId?: string };

const CreateTab = (overrides: Partial<TestTab> = {}): TestTab => ({
  active: true,
  autoDiscardable: true,
  discarded: false,
  frozen: false,
  groupId: -1,
  highlighted: true,
  incognito: false,
  index: 0,
  pinned: false,
  selected: true,
  windowId: 1,
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
  browserName = "Firefox",
  optionOverrides = {},
  tab = CreateTab(),
  window,
}: {
  browserName?: string;
  optionOverrides?: Record<string, unknown>;
  tab?: TestTab;
  window?: Browser.windows.Window;
} = {}) => {
  const notificationsCreate = vi.fn();
  const windowsCreate = vi.fn().mockResolvedValue(window);
  const tabsGet = vi.fn().mockResolvedValue(tab);
  const storageValues = {
    ...CreateFlatDefaultOptions(),
    ...optionOverrides,
  };

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
        get: vi.fn().mockImplementation(async () => storageValues),
      },
    },
    tabs: {
      get: tabsGet,
    },
    windows: {
      create: windowsCreate,
      update: vi.fn(),
    },
  });

  return {
    notificationsCreate,
    tabsGet,
    windowsCreate,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ApplyOriginTabContextToDataObject", () => {
  it("adds selected private window and cookie store context", () => {
    const data = ApplyOriginTabContextToDataObject(
      { url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      {
        cookieStoreId: "firefox-private",
        incognito: true,
        windowId: 123,
      },
      {
        includeCookieStoreId: true,
        includeIncognito: true,
        includeWindowId: true,
      },
    );

    expect(data).toEqual({
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      cookieStoreId: "firefox-private",
      incognito: true,
      windowId: 123,
    });
  });

  it("only adds explicitly requested context values", () => {
    const data = ApplyOriginTabContextToDataObject(
      { url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      {
        cookieStoreId: "firefox-container-1",
        incognito: false,
        windowId: 456,
      },
      {
        includeCookieStoreId: true,
      },
    );

    expect(data).toEqual({
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      cookieStoreId: "firefox-container-1",
    });
  });
});

describe("GetOriginTabContext", () => {
  it("includes Firefox cookie store context when contextual identity is enabled", async () => {
    StubBrowser({
      optionOverrides: {
        "advanced.contextualIdentity": true,
      },
      tab: CreateTab({
        cookieStoreId: "firefox-container-1",
        incognito: true,
        windowId: 123,
      }),
    });

    await expect(GetOriginTabContext(42)).resolves.toEqual({
      cookieStoreId: "firefox-container-1",
      incognito: true,
      windowId: 123,
    });
  });

  it("shows a localized warning when enabled contextual identity cannot be attached", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { notificationsCreate } = StubBrowser({
      optionOverrides: {
        "advanced.contextualIdentity": true,
      },
      tab: CreateTab(),
    });

    await expect(
      GetOriginTabContext(42, {
        notifyOnMissingContextualIdentity: true,
      }),
    ).resolves.toEqual({
      incognito: false,
      windowId: 1,
    });

    expect(warn).toHaveBeenCalledWith(
      "[Background] GetOriginTabContext() :: Failed to get cookie store ID from original tab",
    );
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Warning_ContextualIdentityNotPreserved",
      }),
    );
  });

  it("does not warn for missing contextual identity when no origin tab is available", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { notificationsCreate, tabsGet } = StubBrowser({
      optionOverrides: {
        "advanced.contextualIdentity": true,
      },
    });

    await expect(
      GetOriginTabContext(-1, {
        notifyOnMissingContextualIdentity: true,
      }),
    ).resolves.toEqual({});

    expect(tabsGet).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(notificationsCreate).not.toHaveBeenCalled();
  });
});

describe("OpenPopoutPlayerInWindow", () => {
  it("logs an error and notifies when window creation returns no window", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { notificationsCreate, windowsCreate } = StubBrowser({
      browserName: "Chrome",
      tab: CreateTab({
        incognito: false,
        windowId: 123,
      }),
    });

    await expect(
      OpenPopoutPlayerInWindow("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).resolves.toBeNull();

    expect(windowsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      }),
    );
    expect(error).toHaveBeenCalledWith(
      "[Background] Failed to open popout player",
      expect.any(Error),
    );
    expect(notificationsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notification_Error_PopoutOpenFailed",
      }),
    );
  });
});
