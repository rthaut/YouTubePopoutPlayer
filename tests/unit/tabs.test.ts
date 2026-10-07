import type { Browser } from "wxt/browser";
import { UpdatePopoutPlayerTab } from "@/entrypoints/background/tabs";
import { afterEach, describe, expect, it, vi } from "vitest";

const createTab = (): Browser.tabs.Tab => ({
  active: false,
  autoDiscardable: true,
  discarded: false,
  frozen: false,
  groupId: -1,
  highlighted: false,
  id: 123,
  incognito: false,
  index: 0,
  pinned: false,
  selected: false,
  windowId: 456,
});

describe("UpdatePopoutPlayerTab", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, "browser");
  });

  it("activates the reused tab and focuses its window when active", async () => {
    const updateTab = vi.fn().mockResolvedValue({ id: 123 });
    const updateWindow = vi.fn().mockResolvedValue({ id: 456 });
    vi.stubGlobal("browser", {
      tabs: {
        update: updateTab,
      },
      windows: {
        update: updateWindow,
      },
    });

    await UpdatePopoutPlayerTab(
      createTab(),
      "https://www.youtube.com/embed/dQw4w9WgXcQ?popout=1",
      true,
    );

    expect(updateTab).toHaveBeenCalledWith(123, {
      active: true,
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?popout=1",
    });
    expect(updateWindow).toHaveBeenCalledWith(456, { focused: true });
  });

  it("updates the reused tab in the background without changing focus", async () => {
    const updateTab = vi.fn().mockResolvedValue({ id: 123 });
    const updateWindow = vi.fn().mockResolvedValue({ id: 456 });
    vi.stubGlobal("browser", {
      tabs: {
        update: updateTab,
      },
      windows: {
        update: updateWindow,
      },
    });

    await UpdatePopoutPlayerTab(
      createTab(),
      "https://www.youtube.com/embed/dQw4w9WgXcQ?popout=1",
      false,
    );

    expect(updateTab).toHaveBeenCalledWith(123, {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?popout=1",
    });
    expect(updateWindow).not.toHaveBeenCalled();
  });
});
