import { ApplyOriginTabContextToDataObject } from "@/entrypoints/background/tabs";
import { describe, expect, it } from "vitest";

describe("ApplyOriginTabContextToDataObject", () => {
  it("adds selected private window and cookie store context", () => {
    const data = ApplyOriginTabContextToDataObject(
      { url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      {
        cookieStoreId: "firefox-private",
        incognito: true,
        windowId: 123,
      },
      {
        includeCookieStoreId: true,
        includeIncognito: true,
        includeWindowId: true,
      },
    );

    expect(data).toEqual({
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      cookieStoreId: "firefox-private",
      incognito: true,
      windowId: 123,
    });
  });

  it("only adds explicitly requested context values", () => {
    const data = ApplyOriginTabContextToDataObject(
      { url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      {
        cookieStoreId: "firefox-container-1",
        incognito: false,
        windowId: 456,
      },
      {
        includeCookieStoreId: true,
      },
    );

    expect(data).toEqual({
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      cookieStoreId: "firefox-container-1",
    });
  });
});
