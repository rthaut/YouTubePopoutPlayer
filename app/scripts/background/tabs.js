import { YOUTUBE_DOMAINS } from "../helpers/constants";

/**
 * Closes the specified tab
 * @param {Number} tabId the ID of the tab to close
 * @param {Boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 * @returns {Boolean} if the tab was closed successfully
 */
export const CloseTab = async (tabId, enforceDomainRestriction = false) => {
  if (enforceDomainRestriction) {
    const tab = await browser.tabs.get(tabId);

    if (!tab || tab?.url === undefined) {
      // if the "tabs" permission is not granted, the tab object does NOT include the `url` property
      // we cannot request that permission now, as we might be outside a synchronous user input handler
      console.error(
        '[Background] CloseTab() :: Unable to determine if original window/tab should be closed (likely due to the "tabs" permission not being granted)'
      );
      return false;
    }

    const url = new URL(tab.url);
    const domain = url.hostname.split(".").splice(-2).join(".");

    if (!YOUTUBE_DOMAINS.includes(domain)) {
      console.info(
        "[Background] CloseTab() :: Original tab is NOT a YouTube domain"
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
 * @param {Object} message the message to send to the active tab
 * @returns {Promise}
 */
export const SendMessageToActiveTab = async (message) => {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  return await Promise.all(
    tabs.map((tab) => browser.tabs.sendMessage(tab.id, message))
  );
};

/**
 * Gets the active browser tab
 * @returns {Promise<object>}
 */
export const GetActiveTab = async () => {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs.length > 0 ? tabs[0] : null;
};

/**
 * Gets the value of the `cookieStoreId` property of the specified tab
 * @param {number} tabId the ID of the tab
 * @returns {string|null} the `cookieStoreId` property value or `null` if unavailable
 */
export const GetCookieStoreIDForTab = async (tabId) => {
  console.log("[Background] GetCookieStoreIDForTab()", tabId);

  if (isNaN(tabId) || parseInt(tabId, 10) <= 0) {
    return null;
  }

  const tab = await browser.tabs.get(tabId);
  console.log("[Background] GetCookieStoreIDForTab() :: Tab", tab);

  if (!Object.prototype.hasOwnProperty.call(tab, "cookieStoreId")) {
    console.warn(
      "[Background] GetCookieStoreIDForTab() :: Tab data is missing cookieStoreId property"
    );
    return null;
  }

  console.log(
    "[Background] GetCookieStoreIDForTab() :: Return",
    tab.cookieStoreId
  );
  return tab.cookieStoreId;
};
