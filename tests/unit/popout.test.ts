import type { Browser } from "wxt/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OPTION_DEFAULTS } from "@/utils/constants";

const mocks = vi.hoisted(() => ({
  getActiveTab: vi.fn(),
  getPopoutPlayerTabs: vi.fn(),
  updatePopoutPlayerTab: vi.fn(),
  getLocalOption: vi.fn(),
  getLocalOptionsForDomain: vi.fn(),
}));

vi.mock("@/entrypoints/background/tabs", () => ({
  AddContextualIdentityToDataObject: vi.fn(async (data) => data),
  CloseTab: vi.fn(),
  GetActiveTab: mocks.getActiveTab,
  GetPopoutPlayerTabs: mocks.getPopoutPlayerTabs,
  UpdatePopoutPlayerTab: mocks.updatePopoutPlayerTab,
}));

vi.mock("@/utils/options", () => ({
  default: {
    GetLocalOption: mocks.getLocalOption,
    GetLocalOptionsForDomain: mocks.getLocalOptionsForDomain,
  },
}));

const createTab = (id: number): Browser.tabs.Tab => ({
  active: false,
  autoDiscardable: true,
  discarded: false,
  frozen: false,
  groupId: -1,
  highlighted: false,
  id,
  incognito: false,
  index: 0,
  pinned: false,
  selected: false,
  windowId: 456,
});

describe("OpenPopoutPlayer", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    { openInBackground: false, expectedActive: true },
    { openInBackground: true, expectedActive: false },
  ])(
    "updates reused popout tabs with active=$expectedActive when openInBackground=$openInBackground",
    async ({ openInBackground, expectedActive }) => {
      const tabs = [createTab(123), createTab(124)];
      mocks.getLocalOptionsForDomain.mockResolvedValue({
        ...OPTION_DEFAULTS.behavior,
        reuseWindowsTabs: true,
      });
      mocks.getLocalOption.mockImplementation(
        async (domain: string, option: string) => {
          if (domain === "advanced" && option === "background") {
            return openInBackground;
          }

          if (domain === "advanced" && option === "noCookieDomain") {
            return false;
          }

          if (domain === "behavior" && option === "reuseWindowsTabs") {
            return true;
          }

          throw new Error(`Unexpected option lookup: ${domain}.${option}`);
        },
      );
      mocks.getPopoutPlayerTabs.mockResolvedValue(tabs);
      mocks.updatePopoutPlayerTab.mockResolvedValue({ id: 123 });

      const { OpenPopoutPlayer } = await import(
        "@/entrypoints/background/popout"
      );

      await OpenPopoutPlayer({
        id: "dQw4w9WgXcQ",
        originTabId: 99,
      });

      expect(mocks.getPopoutPlayerTabs).toHaveBeenCalledWith(99);
      expect(mocks.updatePopoutPlayerTab).toHaveBeenCalledTimes(2);
      for (const tab of tabs) {
        expect(mocks.updatePopoutPlayerTab).toHaveBeenCalledWith(
          tab,
          expect.stringContaining("https://www.youtube.com/embed/dQw4w9WgXcQ?"),
          expectedActive,
        );
      }
    },
  );
});
