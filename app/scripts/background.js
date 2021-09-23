import { OnCommandEventHandler } from "./background/commands";
import { InitMenus } from "./background/menus";
import { OnInstalled, OnRuntimeMessage } from "./background/runtime";
import {
  GetExtraInfoSpec,
  GetFilter,
  OnBeforeSendHeaders,
  OnSendHeaders,
} from "./background/webRequest";

browser.browserAction.onClicked.addListener(() => {
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else {
    browser.management
      .getSelf()
      .then(({ optionsUrl: url }) =>
        browser.windows.create({ url, type: "popup" })
      );
  }
});

browser.commands.onCommand.addListener(OnCommandEventHandler);

browser.runtime.onInstalled.addListener(OnInstalled);

browser.runtime.onMessage.addListener(OnRuntimeMessage);

browser.webRequest.onBeforeSendHeaders.addListener(
  OnBeforeSendHeaders,
  GetFilter("onBeforeSendHeaders"),
  GetExtraInfoSpec("onBeforeSendHeaders")
);

browser.webRequest.onSendHeaders.addListener(
  OnSendHeaders,
  GetFilter("onSendHeaders"),
  GetExtraInfoSpec("onSendHeaders")
);

InitMenus();
