import type { Browser } from "wxt/browser";

import {
  POPOUT_PLAYER_PARAM_NAME,
  YOUTUBE_DOMAINS,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "@/utils/constants";
import { IsFirefox } from "@/utils/misc";
import Options from "@/utils/options";

import { ShowBasicNotification } from "./notifications";

type FirefoxCookieStoreContext = {
  cookieStoreId?: string;
};

export type OriginTabContext = {
  cookieStoreId?: FirefoxCookieStoreContext["cookieStoreId"];
  incognito?: boolean;
  windowId?: number;
};

export type TabContextOptions = {
  includeCookieStoreId?: boolean;
  includeIncognito?: boolean;
  includeWindowId?: boolean;
};

type OriginTabContextOptions = {
  notifyOnMissingContextualIdentity?: boolean;
};

type ContextDataObject = FirefoxCookieStoreContext &
  Pick<Browser.windows.CreateData, "incognito"> &
  Pick<Browser.tabs.CreateProperties, "windowId">;

type ContextDataTarget = Partial<ContextDataObject>;

export type FirefoxTabCreateProperties = Browser.tabs.CreateProperties &
  FirefoxCookieStoreContext;

export type FirefoxTabsQueryInfo = Browser.tabs.QueryInfo &
  FirefoxCookieStoreContext;

export type FirefoxWindowCreateData = Browser.windows.CreateData &
  FirefoxCookieStoreContext & {
    titlePreface?: string;
  };

const HasCookieStoreIdProperty = (
  tab: Browser.tabs.Tab,
): tab is Browser.tabs.Tab & FirefoxCookieStoreContext =>
  Object.prototype.hasOwnProperty.call(tab, "cookieStoreId");

const ShowContextualIdentityWarningNotification = async () => {
  await ShowBasicNotification({
    message: browser.i18n.getMessage(
      "Notification_Warning_ContextualIdentityNotPreserved",
    ),
  });
};

const WarnAboutMissingContextualIdentity = async (
  message: string,
  options: OriginTabContextOptions = {},
  error?: unknown,
) => {
  if (error === undefined) {
    console.warn(message);
  } else {
    console.warn(message, error);
  }

  if (options.notifyOnMissingContextualIdentity) {
    await ShowContextualIdentityWarningNotification();
  }
};

/**
 * Closes the specified tab
 * @param {number} tabId the ID of the tab to close
 * @param {boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 * @returns {Promise<boolean>} if the tab was closed successfully
 */
export const CloseTab = async (
  tabId: number,
  enforceDomainRestriction: boolean = false,
): Promise<boolean> => {
  if (enforceDomainRestriction) {
    const tab = await browser.tabs.get(tabId);

    if (!tab || tab?.url === undefined) {
      // if the "tabs" permission is not granted, the tab object does NOT include the `url` property
      // we cannot request that permission now, as we might be outside a synchronous user input handler
      console.error(
        '[Background] CloseTab() :: Unable to determine if original window/tab should be closed (likely due to the "tabs" permission not being granted)',
      );
      return false;
    }

    const url = new URL(tab.url);
    const domain = url.hostname.split(".").splice(-2).join(".");

    if (!YOUTUBE_DOMAINS.includes(domain)) {
      console.info(
        "[Background] CloseTab() :: Original tab is NOT a YouTube domain",
      );
      return false;
    }
  }

  try {
    await browser.tabs.remove(tabId);
  } catch (error) {
    console.error("[Background] CloseTab() :: Error", error);
    return false;
  }

  return true;
};

/**
 * Sends a message to the active browser tab
 * @param {object} message the message to send to the active tab
 * @returns {Promise<unknown[]>}
 */
export const SendMessageToActiveTab = async (
  message: object,
): Promise<unknown[]> => {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  return await Promise.all(
    tabs
      .filter((tab) => tab.id !== undefined)
      .map((tab) => browser.tabs.sendMessage(tab.id!, message)),
  );
};

/**
 * Gets the active browser tab
 * @returns {Promise<Tabs.Tab | null>} the active browser tab
 */
export const GetActiveTab = async (): Promise<Browser.tabs.Tab | null> => {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs.length > 0 ? tabs[0] : null;
};

/**
 * Gets all existing popout player tabs
 * @returns {Promise<Tabs.Tab[]>} the popout player tabs
 */
export const GetPopoutPlayerTabs = async (
  originTabId = -1,
): Promise<Browser.tabs.Tab[]> => {
  const queryInfo: FirefoxTabsQueryInfo = {
    url: [YOUTUBE_EMBED_URL, YOUTUBE_NOCOOKIE_EMBED_URL].map(
      (url) => url + `*?*${POPOUT_PLAYER_PARAM_NAME}=1*`,
    ),
  };

  return browser.tabs.query(
    await AddContextualIdentityToDataObject(queryInfo, originTabId),
  );
};

/**
 * Gets the value of the `cookieStoreId` property of the specified tab
 * @param {number} tabId the ID of the tab
 * @returns {Promise<string | undefined>} the `cookieStoreId` property value or `undefined` if unavailable
 */
export const GetCookieStoreIDForTab = async (
  tabId: number,
): Promise<string | undefined> => {
  if (isNaN(tabId) || +tabId <= 0) {
    return;
  }

  const tab = await browser.tabs.get(tabId);

  if (!HasCookieStoreIdProperty(tab)) {
    console.warn(
      "[Background] GetCookieStoreIDForTab() :: Tab data is missing cookieStoreId property",
    );
    return;
  }

  return tab.cookieStoreId;
};

/**
 * Gets the relevant window/privacy/container context for the specified tab.
 * @param {number} tabId the ID of the tab
 * @returns tab context values, or an empty object if unavailable
 */
export const GetOriginTabContext = async (
  tabId: number,
  options: OriginTabContextOptions = {},
): Promise<OriginTabContext> => {
  if (isNaN(tabId) || +tabId <= 0) {
    return {};
  }

  const useContextualIdentity =
    (await IsFirefox()) &&
    (await Options.GetLocalOption("advanced", "contextualIdentity"));

  let tab: Browser.tabs.Tab;
  try {
    tab = await browser.tabs.get(tabId);
  } catch (error) {
    if (useContextualIdentity) {
      await WarnAboutMissingContextualIdentity(
        "[Background] GetOriginTabContext() :: Failed to get original tab; contextual identity could not be preserved",
        options,
        error,
      );
    } else {
      console.warn(
        "[Background] GetOriginTabContext() :: Failed to get original tab",
        error,
      );
    }
    return {};
  }

  const context: OriginTabContext = {
    incognito: tab.incognito,
    windowId: tab.windowId,
  };

  if (!useContextualIdentity) {
    return context;
  }

  if (!HasCookieStoreIdProperty(tab) || !tab.cookieStoreId) {
    await WarnAboutMissingContextualIdentity(
      "[Background] GetOriginTabContext() :: Failed to get cookie store ID from original tab",
      options,
    );
    return context;
  }

  context.cookieStoreId = tab.cookieStoreId;

  return context;
};

/**
 * Adds selected context values from an origin tab to browser tab/window creation data.
 */
export const ApplyOriginTabContextToDataObject = <T extends object>(
  data: T & ContextDataTarget,
  context: OriginTabContext,
  options: TabContextOptions = {},
): T & ContextDataTarget => {
  if (options.includeCookieStoreId && context.cookieStoreId) {
    data.cookieStoreId = context.cookieStoreId;
  }

  if (options.includeIncognito && typeof context.incognito === "boolean") {
    data.incognito = context.incognito;
  }

  if (options.includeWindowId && typeof context.windowId === "number") {
    data.windowId = context.windowId;
  }

  return data;
};

/**
 * Adds the contextual identify properties to the given window/tab data object (if appropriate)
 * @param data an object for use in a window/tab function
 * @param {number} originTabId the original tab ID (of which to match the contextual identify)
 * @returns modified window/tab data object
 */
export const AddContextualIdentityToDataObject = async <T extends object>(
  data: T & ContextDataTarget,
  originTabId: number = -1,
  options: Omit<TabContextOptions, "includeCookieStoreId"> &
    OriginTabContextOptions = {},
): Promise<T & ContextDataTarget> => {
  try {
    const context = await GetOriginTabContext(originTabId, {
      notifyOnMissingContextualIdentity:
        options.notifyOnMissingContextualIdentity,
    });

    return ApplyOriginTabContextToDataObject(data, context, {
      ...options,
      includeCookieStoreId: true,
    });
  } catch (error) {
    console.error(
      "Failed to add contextual identity to window/tab data object",
      error,
    );
  }

  return data;
};
