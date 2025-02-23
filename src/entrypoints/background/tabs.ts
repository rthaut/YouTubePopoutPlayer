import type { Tabs } from "wxt/browser";

import {
  YOUTUBE_DOMAINS,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "@/utils/constants";
import { IsFirefox } from "@/utils/misc";
import Options from "@/utils/options";

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
export const GetActiveTab = async (): Promise<Tabs.Tab | null> => {
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
): Promise<Tabs.Tab[]> =>
  browser.tabs.query(
    await AddContextualIdentityToDataObject(
      {
        url: [YOUTUBE_EMBED_URL, YOUTUBE_NOCOOKIE_EMBED_URL].map(
          (url) => url + "*?*popout=1*",
        ),
      },
      originTabId,
    ),
  );

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

  if (!Object.prototype.hasOwnProperty.call(tab, "cookieStoreId")) {
    console.warn(
      "[Background] GetCookieStoreIDForTab() :: Tab data is missing cookieStoreId property",
    );
    return;
  }

  return tab.cookieStoreId;
};

/**
 * Adds the contextual identify properties to the given window/tab data object (if appropriate)
 * @param {Tabs.QueryQueryInfoType} data an object for use in a window/tab function
 * @param {number} originTabId the original tab ID (of which to match the contextual identify)
 * @returns {Promise<Tabs.QueryQueryInfoType>} modified window/tab data object
 */
export const AddContextualIdentityToDataObject = async <
  T extends Tabs.QueryQueryInfoType | Tabs.CreateCreatePropertiesType,
>(
  data: T,
  originTabId: number = -1,
): Promise<T> => {
  try {
    const isFirefox = await IsFirefox();
    const useContextualIdentity = await Options.GetLocalOption(
      "advanced",
      "contextualIdentity",
    );

    if (isFirefox && useContextualIdentity) {
      const cookieStoreId = await GetCookieStoreIDForTab(originTabId);
      if (cookieStoreId) {
        data.cookieStoreId = cookieStoreId;
      } else {
        console.warn(
          "[Background] AddContextualIdentityToObjectData() :: Failed to get cookie store ID from original tab",
        );
      }
    }
  } catch (error) {
    console.error(
      "Failed to add contextual identity to window/tab data object",
      error,
    );
  }

  return data;
};
