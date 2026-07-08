import type { Browser } from "wxt/browser";

import {
  POPOUT_PLAYER_PARAM_NAME,
  YOUTUBE_DOMAINS,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "@/utils/constants";
import { IsFirefox } from "@/utils/misc";
import Options from "@/utils/options";

import type { FirefoxCookieStoreData, PopoutOriginContext } from "./types";

const HasCookieStoreIdProperty = (
  tab: Browser.tabs.Tab,
): tab is Browser.tabs.Tab & FirefoxCookieStoreData =>
  Object.prototype.hasOwnProperty.call(tab, "cookieStoreId");

const ShouldUseContextualIdentity = async () =>
  (await IsFirefox()) &&
  (await Options.GetLocalOption("advanced", "contextualIdentity"));

export const TabMatchesPopoutOriginContext = (
  tab: Browser.tabs.Tab,
  originContext: PopoutOriginContext | null,
  sameWindowOnly: boolean,
) => {
  if (originContext === null) {
    return true;
  }

  if (
    typeof originContext.incognito === "boolean" &&
    tab.incognito !== originContext.incognito
  ) {
    return false;
  }

  if (
    sameWindowOnly &&
    typeof originContext.windowId === "number" &&
    tab.windowId !== originContext.windowId
  ) {
    return false;
  }

  if (originContext.cookieStoreId !== undefined) {
    return (
      HasCookieStoreIdProperty(tab) &&
      tab.cookieStoreId === originContext.cookieStoreId
    );
  }

  return true;
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
 * @param {number} originTabId the original tab ID
 * @param {boolean} sameWindowOnly if matching tabs must be in the origin window
 * @returns {Promise<Tabs.Tab[]>} the popout player tabs
 */
export const GetPopoutPlayerTabs = async (
  originTabId = -1,
  sameWindowOnly: boolean = false,
): Promise<Browser.tabs.Tab[]> => {
  const originContext = await GetPopoutOriginContext(originTabId);
  const tabs = await browser.tabs.query({
    url: [YOUTUBE_EMBED_URL, YOUTUBE_NOCOOKIE_EMBED_URL].map(
      (url) => url + `*?*${POPOUT_PLAYER_PARAM_NAME}=1*`,
    ),
  });

  return tabs.filter((tab) =>
    TabMatchesPopoutOriginContext(tab, originContext, sameWindowOnly),
  );
};

/**
 * Updates an existing popout player tab with the given URL.
 * @param {Browser.tabs.Tab} tab the existing popout player tab
 * @param {string} url the updated popout player URL
 * @param {boolean} [active] indicates if the tab should become active
 * @returns {Promise<Browser.tabs.Tab | undefined>}
 */
export const UpdatePopoutPlayerTab = async (
  tab: Browser.tabs.Tab,
  url: string,
  active: boolean = true,
): Promise<Browser.tabs.Tab | undefined> => {
  const updatedTab = await browser.tabs.update(tab.id, {
    ...(active ? { active: true } : {}),
    url,
  });

  if (active && tab.windowId !== undefined) {
    await browser.windows.update(tab.windowId, {
      focused: true,
    });
  }

  return updatedTab;
};

/**
 * Gets the relevant popout context for the specified origin tab.
 * @param {number} tabId the ID of the tab
 * @returns tab context values, or null if unavailable
 */
export const GetPopoutOriginContext = async (
  tabId: number,
): Promise<PopoutOriginContext | null> => {
  if (isNaN(tabId) || +tabId <= 0) {
    return null;
  }

  let tab: Browser.tabs.Tab;
  try {
    tab = await browser.tabs.get(tabId);
  } catch (error) {
    console.warn(
      "[Background] GetPopoutOriginContext() :: Failed to get original tab",
      error,
    );
    return null;
  }

  const context: PopoutOriginContext = {
    incognito: tab.incognito,
    windowId: tab.windowId,
  };

  if (!(await ShouldUseContextualIdentity())) {
    return context;
  }

  if (!HasCookieStoreIdProperty(tab) || !tab.cookieStoreId) {
    console.warn(
      "[Background] GetPopoutOriginContext() :: Failed to get cookie store ID from original tab",
    );
    return context;
  }

  context.cookieStoreId = tab.cookieStoreId;

  return context;
};
