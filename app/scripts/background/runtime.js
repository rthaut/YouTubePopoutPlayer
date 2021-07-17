import Options from "../helpers/options";
import OpenPopoutPlayer from "./popout";
import { CloseTab } from "./tabs";

export const OnInstalled = async (details) => {
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
};

export const OnRuntimeMessage = async (message, sender) => {
  console.log("[Background] Runtime Message", message, sender);

  if (message.action !== undefined) {
    switch (message.action.toLowerCase()) {
      case "open-popout":
        return OpenPopoutPlayer(message.data);

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
};
