import { GetPlayerVideoID } from "@/entrypoints/content/player";
import { afterEach, describe, expect, it, vi } from "vitest";

const VIDEO_ID = "YuMdsHIXatY";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GetPlayerVideoID", () => {
  it("reads the loaded video ID from the player title link", () => {
    const querySelector = vi.fn(() => ({
      href: `https://www.youtube.com/watch?v=${VIDEO_ID}&list=PL123`,
    }));
    vi.stubGlobal("document", { querySelector });

    expect(GetPlayerVideoID()).toBe(VIDEO_ID);
    expect(querySelector).toHaveBeenCalledWith(".ytp-title-link[href]");
  });

  it("returns undefined when the player has no title link", () => {
    vi.stubGlobal("document", { querySelector: vi.fn(() => null) });

    expect(GetPlayerVideoID()).toBeUndefined();
  });
});
