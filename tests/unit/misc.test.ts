import { afterEach, describe, expect, it, vi } from "vitest";

import { debounce } from "@/utils/misc";

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
