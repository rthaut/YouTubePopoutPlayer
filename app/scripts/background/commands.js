import Options from "../helpers/options";
import { SendMessageToActiveTab } from "./tabs";

export const OnCommandEventHandler = async (command) => {
  console.log("[Background] Command Received", command);

  // TODO: these could be handled via the background script directly (like the menu actions) IF we could get the current video player's time and dimensions...
  // that would reduce the amount of content <--> background script messaging substantially

  switch (command) {
    case "open-popout-auto-close-command":
      console.log("[Background] Instructing active tab to open popout player");
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
        "[Background] Instructing active tab to open popout player and close original tab"
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
        "[Background] Instructing active tab to open popout player without closing original tab"
      );
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: false,
          enforceDomainRestriction: false,
        },
      });
      break;

    // TODO: new commands for auto-rotating the video?
  }
};
