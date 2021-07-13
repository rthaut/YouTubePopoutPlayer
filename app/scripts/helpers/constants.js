export const YOUTUBE_DOMAIN = "youtube.com";
export const YOUTUBE_NOCOOKIE_DOMAIN = "youtube-nocookie.com";
export const YOUTUBE_DOMAINS = [YOUTUBE_DOMAIN, YOUTUBE_NOCOOKIE_DOMAIN];

export const YOUTUBE_EMBED_URL = `https://www.${YOUTUBE_DOMAIN}/embed/`;
export const YOUTUBE_NOCOOKIE_EMBED_URL = `https://www.${YOUTUBE_NOCOOKIE_DOMAIN}/embed/`;

export const START_THRESHOLD = 5; // TODO: should this be configurable?

export const OPTION_DEFAULTS = {
  behavior: {
    target: "window",
    controls: "standard",
    autoplay: true,
    loop: false,
  },
  size: {
    mode: "current",
    units: "pixels",
    width: 854,
    height: 480,
  },
  advanced: {
    close: false,
    title: "",
  },
};

export const OPTIONS_BEHAVIOR_TARGET_VALUES = ["window", "tab"];
export const OPTIONS_BEHAVIOR_CONTROLS_VALUES = [
  "none",
  "standard",
  "extended",
];
export const OPTIONS_SIZE_MODE_VALUES = ["current", "custom"];
export const OPTIONS_SIZE_UNITS_VALUES = ["pixels", "percentage"];
