import { OnCommandEventHandler } from "./background/commands";
import { InitMenus } from "./background/menus";
import { OpenPopoutBackgroundHelper } from "./background/popout";
import { OnInstalled, OnRuntimeMessage } from "./background/runtime";
import {
  GetExtraInfoSpec,
  GetFilter,
  OnBeforeSendHeaders,
  OnSendHeaders,
} from "./background/webRequest";
import Options from "./helpers/options";
import { IsVideoURL } from "./helpers/youtube";

browser.browserAction.onClicked.addListener(() => {
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else {
    browser.management
      .getSelf()
      .then(({ optionsUrl: url }) =>
        browser.windows.create({ url, type: "popup" }),
      );
  }
});

browser.commands.onCommand.addListener(OnCommandEventHandler);

browser.runtime.onInstalled.addListener(OnInstalled);

browser.runtime.onMessage.addListener(OnRuntimeMessage);

browser.webRequest.onBeforeSendHeaders.addListener(
  OnBeforeSendHeaders,
  GetFilter("onBeforeSendHeaders"),
  GetExtraInfoSpec("onBeforeSendHeaders"),
);

browser.webRequest.onSendHeaders.addListener(
  OnSendHeaders,
  GetFilter("onSendHeaders"),
  GetExtraInfoSpec("onSendHeaders"),
);

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url && IsVideoURL(changeInfo.url, false)) {
    if (await Options.GetLocalOption("advanced", "autoOpen")) {
      OpenPopoutBackgroundHelper(changeInfo.url, tabId, false);
    }
  }
});

InitMenus();
