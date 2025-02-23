import type { Runtime } from "wxt/browser";

import Options from "@/utils/options";
import type {
  CloseTabData,
  RuntimeMessage,
  StoreDimensionsAndPositionData,
} from "@/utils/types";

import OpenPopoutPlayer, { StoreDimensionsAndPosition } from "./popout";
import { CloseTab } from "./tabs";

export const OnInstalled = async (details: { reason: string }) => {
  if (details.reason === "install") {
    Options.InitLocalStorageDefaults();
  } else if (details.reason === "update") {
    Options.InitLocalStorageDefaults(false);
  }
};

export const OnRuntimeMessage = async (
  message: RuntimeMessage,
  sender: Runtime.MessageSender,
) => {
  if (message.action !== undefined && sender.tab?.id !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout":
        return OpenPopoutPlayer({
          ...message.data,
          originTabId: sender.tab.id,
        });

      case "get-commands":
        return browser.commands.getAll();

      case "close-tab":
        return CloseTab(
          sender.tab.id,
          (message.data as CloseTabData).enforceDomainRestriction,
        );

      case "popout-closed":
      case "popout-resized":
        return StoreDimensionsAndPosition(
          message.data as StoreDimensionsAndPositionData,
        );
    }

    return;
  }
};
