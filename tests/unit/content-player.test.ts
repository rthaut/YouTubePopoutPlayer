import {
  DidBackgroundOpenPopout,
  OpenPopoutFromContentScript,
  ShouldCloseTabAfterPopoutOpen,
} from "@/entrypoints/content/player";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("content popout open result handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [{ id: 123 }, true],
    [[], true],
    [true, true],
    [null, false],
    [undefined, false],
    [false, false],
  ])("maps background response %p to opened=%p", (response, expected) => {
    expect(DidBackgroundOpenPopout(response)).toBe(expected);
  });

  it("returns false when the background reports no opened popout", async () => {
    const sendMessage = vi.fn().mockResolvedValue(null);
    vi.stubGlobal("browser", {
      runtime: {
        sendMessage,
      },
    });

    await expect(OpenPopoutFromContentScript({ id: "video" })).resolves.toBe(
      false,
    );
    expect(sendMessage).toHaveBeenCalledWith({
      action: "open-popout",
      data: { id: "video" },
    });
  });

  it("only closes the origin tab after a confirmed popout open", () => {
    expect(ShouldCloseTabAfterPopoutOpen(true, true)).toBe(true);
    expect(ShouldCloseTabAfterPopoutOpen(false, true)).toBe(false);
    expect(ShouldCloseTabAfterPopoutOpen(true, false)).toBe(false);
  });
});
