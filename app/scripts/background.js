import {
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "./helpers/constants";
import Options from "./helpers/options";
import Popout from "./classes/Popout.class";

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

browser.commands.onCommand.addListener((command) => {
  console.log("YouTubePopoutPlayer() :: Command", command);

  switch (command) {
    case "open-popout":
      console.log(
        "YouTubePopoutPlayer() :: Instructing Active Tab to Open Popout Player"
      );
      SendMessageToActiveTab({
        action: "open-popout-command",
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

      case "close-original-tab":
        return Popout.closeOriginalTab(sender.tab.id);
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
