import Options from "@/utils/options";

import { SendMessageToActiveTab } from "./tabs";

export const OnCommandEventHandler = async (command: string) => {
  // TODO: these "open-popout-*" commands could be handled via the background script directly (like the menu actions)
  // *IF* we could get the current video player's time and dimensions...
  // doing so would reduce the amount of content <--> background script messaging substantially

  switch (command) {
    case "open-popout-auto-close-command":
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: await Options.GetLocalOption("advanced", "close"),
          enforceDomainRestriction: true,
        },
      });
      break;

    case "open-popout-force-close-command":
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: true,
          enforceDomainRestriction: false,
        },
      });
      break;

    case "open-popout-no-close-command":
      SendMessageToActiveTab({
        action: "open-popout-via-command",
        data: {
          closeTab: false,
          enforceDomainRestriction: false,
        },
      });
      break;

    case "rotate-video-left":
      SendMessageToActiveTab({
        action: "rotate-video-player",
        data: {
          rotationAmount: -90,
        },
      });
      break;

    case "rotate-video-right":
      SendMessageToActiveTab({
        action: "rotate-video-player",
        data: {
          rotationAmount: +90,
        },
      });
      break;
  }
};
