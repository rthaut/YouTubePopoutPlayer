import { afterEach, describe, expect, it, vi } from "vitest";

import { POPOUT_PLAYER_PARAM_NAME } from "@/utils/constants";
import { debounce, IsPopoutPlayerURL } from "@/utils/misc";

describe("debounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs once after the wait time with the latest arguments and context", () => {
    vi.useFakeTimers();

    const calls: Array<[string, string]> = [];
    const context = { label: "context" };
    const debounced = debounce(function (this: typeof context, value: string) {
      calls.push([this.label, value]);
    }, 100);

    debounced.call(context, "first");
    debounced.call(context, "second");

    vi.advanceTimersByTime(99);
    expect(calls).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(calls).toEqual([["context", "second"]]);
  });

  it("runs immediately once and suppresses repeated calls until the wait time passes", () => {
    vi.useFakeTimers();

    const func = vi.fn();
    const debounced = debounce(func, 100, true);

    debounced("first");
    debounced("second");

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenLastCalledWith("first");

    vi.advanceTimersByTime(100);
    debounced("third");

    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenLastCalledWith("third");
  });
});

describe("popout player URL utilities", () => {
  const popoutParam = `${POPOUT_PLAYER_PARAM_NAME}=1`;

  it.each([
    [
      "YouTube embed",
      `https://www.youtube.com/embed/dQw4w9WgXcQ?${popoutParam}`,
    ],
    [
      "YouTube embed with previous params",
      `https://www.youtube.com/embed/dQw4w9WgXcQ?start=30&${popoutParam}`,
    ],
    [
      "YouTube embed subdomain",
      `https://music.youtube.com/embed/dQw4w9WgXcQ?${popoutParam}`,
    ],
    [
      "YouTube nocookie embed",
      `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?${popoutParam}`,
    ],
  ])("detects a popout player URL for a %s", (_name, url) => {
    expect(IsPopoutPlayerURL(url)).toBe(true);
  });

  it.each([
    [
      "normal YouTube embed",
      "https://www.youtube.com/embed/dQw4w9WgXcQ?start=30",
    ],
    [
      "normal YouTube nocookie embed",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    ],
    [
      "YouTube watch URL with popout param",
      `https://www.youtube.com/watch?v=dQw4w9WgXcQ&${popoutParam}`,
    ],
    [
      "YouTube short URL with popout param",
      `https://youtu.be/dQw4w9WgXcQ?${popoutParam}`,
    ],
    [
      "YouTube embed with the wrong popout param",
      "https://www.youtube.com/embed/dQw4w9WgXcQ?popout=1",
    ],
    [
      "YouTube-looking domain",
      `https://www.youtube.com.example.com/embed/dQw4w9WgXcQ?${popoutParam}`,
    ],
    ["invalid URL", "not a URL"],
  ])("does not detect a popout player URL for a %s", (_name, url) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(IsPopoutPlayerURL(url)).toBe(false);

    warn.mockRestore();
  });
});
