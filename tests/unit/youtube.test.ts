import { describe, expect, it } from "vitest";

import { GetVideoIDFromURL, IsVideoURL } from "@/utils/youtube";

const VIDEO_ID = "dQw4w9WgXcQ";

describe("YouTube URL utilities", () => {
  describe("GetVideoIDFromURL", () => {
    it.each([
      ["watch URL", `https://www.youtube.com/watch?v=${VIDEO_ID}`],
      [
        "watch URL with preceding query params",
        `https://www.youtube.com/watch?feature=share&v=${VIDEO_ID}&t=42`,
      ],
      ["live URL", `https://www.youtube.com/live/${VIDEO_ID}`],
      ["shorts URL", `https://www.youtube.com/shorts/${VIDEO_ID}`],
      ["embed URL", `https://www.youtube.com/embed/${VIDEO_ID}`],
      [
        "nocookie embed URL",
        `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
      ],
      ["short link URL", `https://youtu.be/${VIDEO_ID}`],
    ])("extracts the video ID from a supported %s", (_name, url) => {
      expect(GetVideoIDFromURL(url)).toBe(VIDEO_ID);
    });

    it.each([
      [`https://www.youtube.com/watch?v=${VIDEO_ID}&list=PL123`],
      [`https://www.youtube.com/watch?v=${VIDEO_ID}?feature=share`],
      [`https://www.youtube.com/watch?v=${VIDEO_ID}/extra`],
      [`https://www.youtube.com/live/${VIDEO_ID}?feature=share`],
      [`https://www.youtube.com/shorts/${VIDEO_ID}&feature=share`],
      [`https://www.youtube.com/embed/${VIDEO_ID}/related`],
      [`https://youtu.be/${VIDEO_ID}?si=share-token`],
    ])("stops the video ID before URL delimiters in %s", (url) => {
      expect(GetVideoIDFromURL(url)).toBe(VIDEO_ID);
    });

    it.each([
      ["too short", `https://www.youtube.com/watch?v=${VIDEO_ID.slice(0, 10)}`],
      ["too long", `https://www.youtube.com/watch?v=${VIDEO_ID}x`],
      ["playlist only", "https://www.youtube.com/playlist?list=PL123"],
      ["non-YouTube watch URL", `https://example.com/watch?v=${VIDEO_ID}`],
      ["non-YouTube live URL", `https://example.com/live/${VIDEO_ID}`],
      [
        "YouTube-looking subdomain on another host",
        `https://youtube.com.example.com/watch?v=${VIDEO_ID}`,
      ],
    ])("does not extract an ID from an invalid %s", (_name, url) => {
      expect(GetVideoIDFromURL(url)).toBeUndefined();
    });

    it.each([
      [`https://www.youtube.com/embed/${VIDEO_ID}`],
      [`https://youtu.be/${VIDEO_ID}`],
    ])("excludes external-only URLs when external is false: %s", (url) => {
      expect(GetVideoIDFromURL(url, false)).toBeUndefined();
    });
  });

  describe("IsVideoURL", () => {
    it.each([
      [`https://www.youtube.com/watch?v=${VIDEO_ID}`],
      [`https://www.youtube.com/live/${VIDEO_ID}`],
      [`https://www.youtube.com/shorts/${VIDEO_ID}`],
      [`https://www.youtube.com/embed/${VIDEO_ID}`],
      [`https://youtu.be/${VIDEO_ID}`],
    ])("returns true for supported video URLs: %s", (url) => {
      expect(IsVideoURL(url)).toBe(true);
    });

    it.each([
      [`https://www.youtube.com/watch?v=${VIDEO_ID}`],
      [`https://www.youtube.com/live/${VIDEO_ID}`],
      [`https://www.youtube.com/shorts/${VIDEO_ID}`],
    ])("keeps native YouTube URLs when external is false: %s", (url) => {
      expect(IsVideoURL(url, false)).toBe(true);
    });

    it.each([
      [`https://www.youtube.com/embed/${VIDEO_ID}`],
      [`https://youtu.be/${VIDEO_ID}`],
    ])("excludes external-only URLs when external is false: %s", (url) => {
      expect(IsVideoURL(url, false)).toBe(false);
    });

    it.each([
      [`https://www.youtube.com/playlist?list=PL123`],
      [`https://example.com/watch?v=${VIDEO_ID}`],
      [`https://www.youtube.com/watch?v=${VIDEO_ID}x`],
    ])("returns false for unsupported URLs: %s", (url) => {
      expect(IsVideoURL(url)).toBe(false);
    });
  });
});
