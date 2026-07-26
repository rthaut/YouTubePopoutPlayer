import { OpenPopoutFromContentScript } from "@/entrypoints/content/player";
import { afterEach, describe, expect, it, vi } from "vitest";

const StubRuntimeSendMessage = (response: unknown) => {
  const sendMessage = vi.fn().mockResolvedValue(response);

  vi.stubGlobal("browser", {
    runtime: {
      sendMessage,
    },
  });

  return sendMessage;
};

describe("OpenPopoutFromContentScript", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    [{ id: 123 }, true],
    [[], true],
    [true, true],
    [null, false],
    [undefined, false],
    [false, false],
  ])("maps background response %p to opened=%p", async (response, expected) => {
    const sendMessage = StubRuntimeSendMessage(response);

    await expect(OpenPopoutFromContentScript({ id: "video" })).resolves.toBe(
      expected,
    );
    expect(sendMessage).toHaveBeenCalledWith({
      action: "open-popout",
      data: { id: "video" },
    });
  });

  it("returns false when messaging the background fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendMessage = vi.fn().mockRejectedValue(new Error("send failed"));
    vi.stubGlobal("browser", {
      runtime: {
        sendMessage,
      },
    });

    await expect(OpenPopoutFromContentScript({ id: "video" })).resolves.toBe(
      false,
    );
    expect(error).toHaveBeenCalledWith(
      "[Content] YouTubePopoutPlayer OpenPopoutFromContentScript() :: Error",
      expect.any(Error),
    );
  });
});
