import Options from "../helpers/options";
import { SendMessageToActiveTab } from "./tabs";

export const OnCommandEventHandler = async (command) => {
  console.log("[Background] Command Received", command);

  switch (command) {
    case "open-popout-auto-close-command":
      console.log("[Background] Instructing Active Tab to Open Popout Player");
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
        "[Background] Instructing Active Tab to Open Popout Player and Close Original Tab"
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
        "[Background] Instructing Active Tab to Open Popout Player without Closing Original Tab"
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
};
