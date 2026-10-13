import { createElement } from "react";
import {
  useDomainOptions,
  useOption,
  useOptionsContext,
} from "@/entrypoints/options/hooks/use-options";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

const renderWithoutProvider = (useHook: () => unknown) => {
  const Component = () => {
    useHook();
    return null;
  };
  return () => renderToString(createElement(Component));
};

describe("options hooks outside an OptionsProvider", () => {
  it("useOptionsContext throws a helpful error", () => {
    expect(renderWithoutProvider(() => useOptionsContext())).toThrow(
      "useOptionsContext must be used within an OptionsProvider",
    );
  });

  it("useOption throws a helpful error", () => {
    expect(
      renderWithoutProvider(() => useOption("behavior", "controls")),
    ).toThrow("useOption must be used within an OptionsProvider");
  });

  it("useDomainOptions throws a helpful error", () => {
    expect(renderWithoutProvider(() => useDomainOptions("behavior"))).toThrow(
      "useDomainOptions must be used within an OptionsProvider",
    );
  });
});
