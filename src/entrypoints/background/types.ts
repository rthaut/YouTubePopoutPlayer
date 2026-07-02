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
