import type { Browser } from "wxt/browser";

// Background-only browser API shapes. Shared message payload types belong in utils/types.

export type FirefoxCookieStoreData = {
  cookieStoreId?: string;
};

export type PopoutOriginContext = {
  cookieStoreId?: FirefoxCookieStoreData["cookieStoreId"];
  incognito?: boolean;
  windowId?: number;
};

export type PopoutTabCreateData = Browser.tabs.CreateProperties &
  FirefoxCookieStoreData;

export type PopoutWindowCreateData = Browser.windows.CreateData &
  FirefoxCookieStoreData & {
    titlePreface?: string;
  };

/**
 * Normalized description of a successful popout open, returned by `OpenPopoutPlayer()`.
 * A `null` return indicates the popout was not opened.
 */
export type PopoutOpenResult = {
  /** the configured target for the open (matches the user's `behavior.target` option) */
  target: "tab" | "window";
  /** whether an existing popout window/tab was reused instead of creating a new one */
  reused: boolean;
  /** the ID(s) of the popout tab(s) that were opened or reused (empty for new popup windows) */
  tabIds: number[];
  /** the ID(s) of the window(s) containing the popout */
  windowIds: number[];
};
