import {
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "./helpers/constants";
import { OnCommandEventHandler } from "./background/commands";
import { InitMenus } from "./background/menus";
import { OnInstalled, OnRuntimeMessage } from "./background/runtime";
import { OnBeforeSendHeaders } from "./background/webRequest";

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

browser.commands.onCommand.addListener(OnCommandEventHandler);

browser.runtime.onInstalled.addListener(OnInstalled);

browser.runtime.onMessage.addListener(OnRuntimeMessage);

browser.webRequest.onBeforeSendHeaders.addListener(
  OnBeforeSendHeaders,
  {
    urls: [YOUTUBE_EMBED_URL + "*", YOUTUBE_NOCOOKIE_EMBED_URL + "*"],
  },
  ["blocking", "requestHeaders"]
);

InitMenus();
