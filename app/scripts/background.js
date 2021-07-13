import {
  YOUTUBE_DOMAINS,
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "./helpers/constants";
import Options from "./helpers/options";
import Popout from "./classes/Popout.class";

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

browser.commands.onCommand.addListener(async (command) => {
  console.log("YouTubePopoutPlayer() :: Command", command);

  switch (command) {
    case "open-popout-auto-close-command":
      console.log(
        "YouTubePopoutPlayer() :: Instructing Active Tab to Open Popout Player"
      );
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: await Options.GetLocalOption("advanced", "close"),
          enforceDomainRestriction: true,
        },
      });
      break;

    case "open-popout-force-close-command":
      console.log(
        "YouTubePopoutPlayer() :: Instructing Active Tab to Open Popout Player and Force-Close Original Tab"
      );
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: true,
          enforceDomainRestriction: false,
        },
      });
      break;

    case "open-popout-no-close-command":
      console.log(
        "YouTubePopoutPlayer() :: Instructing Active Tab to Open Popout Player without Closing Original Tab"
      );
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: false,
          enforceDomainRestriction: false,
        },
      });
      break;
  }
});

browser.runtime.onInstalled.addListener((details) => {
  console.log("[Background] Extension Installed/Updated", details);

  if (details.reason === "install") {
    console.log(
      "[Background] Extension Installed :: Initializing Defaults for Options"
    );
    Options.InitLocalStorageDefaults();
  } else if (details.reason === "update") {
    console.log(
      "[Background] Extension Updated :: Initializing Defaults for New Options"
    );
    Options.InitLocalStorageDefaults(false);
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  console.log("[Background] Runtime Message", message, sender);

  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout":
        return Popout.open(message.data);

      case "get-commands":
        return browser.commands.getAll();

      case "close-tab":
        return CloseTab(sender.tab.id, message.data.enforceDomainRestriction);
    }

    console.log(
      "[Background] Runtime Message :: Unhandled action",
      message.action
    );
    return;
  }
});

/**
 * Modify requests to the YouTube Embedded Player to ensure the `Referer` header is set
 * The `Referer` header is required to avoid the "Video unavailable" error in the popout player
 */
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    console.log("[Background] Web Request onBeforeSendHeaders", details);

    // only if the request is for the popout player (identified by a custom GET parameter in the query string)
    if (details.url.includes("popout=1")) {
      console.log(
        "[Background] Web Request onBeforeSendHeaders :: Request is for popout player",
        details.url
      );

      // only if the Referer header is not already set
      if (!details.requestHeaders.some((header) => header.name === "Referer")) {
        const referer = {
          name: "Referer",
          value: details.url,
        };
        console.log(
          '[Background] Web Request onBeforeSendHeaders :: Setting "Referer" header',
          referer
        );
        details.requestHeaders.push(referer);
      }
    }

    console.log(
      "[Background] Web Request onBeforeSendHeaders :: Return",
      details.requestHeaders
    );
    return {
      requestHeaders: details.requestHeaders,
    };
  },
  {
    urls: [YOUTUBE_EMBED_URL + "*", YOUTUBE_NOCOOKIE_EMBED_URL + "*"],
  },
  ["blocking", "requestHeaders"]
);

/**
 * Sends a message to the active browser tab
 * @param {Object} message the message to send to the active tab
 * @returns {Promise}
 */
function SendMessageToActiveTab(message) {
  return browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
      return Promise.all(
        tabs.map((tab) => browser.tabs.sendMessage(tab.id, message))
      );
    });
}

/**
 * Closes the specified tab
 * @param {Number} tabId the ID of the tab to close
 * @param {Boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
 * @returns {Boolean} if the tab was closed successfully
 */
async function CloseTab(tabId, enforceDomainRestriction = false) {
  console.log("[Background] CloseTab()", tabId);

  if (enforceDomainRestriction) {
    const tab = await browser.tabs.get(tabId);
    console.log("[Background] CloseTab() :: Tab", tab);

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
    console.log("[Background] CloseTab() :: Original tab domain", domain);

    if (!YOUTUBE_DOMAINS.includes(domain)) {
      console.info(
        "[Background] CloseTab() :: Original tab is NOT a YouTube domain"
      );
      return false;
    }
  }

  try {
    console.log("[Background] CloseTab() :: Closing tab");
    await browser.tabs.remove(tabId);
  } catch (error) {
    console.error("[Background] CloseTab() :: Error", error);
    return false;
  }

  console.log("[Background] CloseTab() :: Return", true);
  return true;
}
