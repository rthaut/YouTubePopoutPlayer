import Options from "../helpers/options";
import OpenPopoutPlayer, { StoreDimensionsAndPosition } from "./popout";
import { CloseTab } from "./tabs";

export const OnInstalled = async (details) => {
  console.log("[Background] Extension Installed/Updated", details);

  if (details.reason === "install") {
    console.log(
      "[Background] Extension Installed :: Initializing defaults for all options"
    );
    Options.InitLocalStorageDefaults();
  } else if (details.reason === "update") {
    console.log(
      "[Background] Extension Updated :: Initializing defaults for new options"
    );
    Options.InitLocalStorageDefaults(false);
  }
};

export const OnRuntimeMessage = async (message, sender) => {
  console.log("[Background] Runtime Message", message, sender);

  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout":
        return OpenPopoutPlayer({
          ...message.data,
          originTabId: sender.tab.id,
        });

      case "get-commands":
        return browser.commands.getAll();

      case "close-tab":
        return CloseTab(sender.tab.id, message.data.enforceDomainRestriction);

      case "popout-closed":
      case "popout-resized":
        return StoreDimensionsAndPosition(message.data);
    }

    console.log(
      "[Background] Runtime Message :: Unhandled action",
      message.action
    );
    return;
  }
};
