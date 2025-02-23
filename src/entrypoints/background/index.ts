import Options from "@/utils/options";
import type { RuntimeMessage } from "@/utils/types";
import { IsVideoURL } from "@/utils/youtube";

import { OnCommandEventHandler } from "./commands";
import { InitMenus } from "./menus";
import { OpenPopoutBackgroundHelper } from "./popout";
import { OnInstalled, OnRuntimeMessage } from "./runtime";

export default defineBackground(() => {
  (
    browser.pageAction ??
    browser.action ??
    browser.browserAction
  ).onClicked.addListener(() => {
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

  browser.runtime.onMessage.addListener((message, sender) =>
    OnRuntimeMessage(message as RuntimeMessage, sender),
  );

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.url && IsVideoURL(changeInfo.url, false)) {
      if (await Options.GetLocalOption("advanced", "autoOpen")) {
        OpenPopoutBackgroundHelper(changeInfo.url, tabId, false);
      }
    }
  });

  InitMenus();
});
