export const YOUTUBE_DOMAIN = "youtube.com";
export const YOUTUBE_NOCOOKIE_DOMAIN = "youtube-nocookie.com";
export const YOUTUBE_DOMAINS = [YOUTUBE_DOMAIN, YOUTUBE_NOCOOKIE_DOMAIN];

export const YOUTUBE_EMBED_URL = `https://www.${YOUTUBE_DOMAIN}/embed/`;
export const YOUTUBE_NOCOOKIE_EMBED_URL = `https://www.${YOUTUBE_NOCOOKIE_DOMAIN}/embed/`;

export const YOUTUBE_VIDEO_URL_PATTERNS = [
  "*://youtu.be/*",
  "*://*.youtube.com/live/*",
  "*://*.youtube.com/shorts/*",
  "*://*.youtube.com/watch?*",
] as const;
export const YOUTUBE_PLAYLIST_URL_PATTERNS = [
  "*://youtu.be/*list=*",
  "*://*.youtube.com/playlist?*list=*",
  "*://*.youtube.com/shorts/*list=*",
  "*://*.youtube.com/watch?*list=*",
] as const;

export const START_THRESHOLD = 5; // TODO: should this be configurable?

export const OPTION_DEFAULTS = {
  behavior: {
    target: "window",
    reuseWindowsTabs: false,
    controls: "standard",
    autoplay: true,
    resumePlayback: true,
    loop: false,
    showRotationButtons: true,
    showRotationMenus: false,
  },
  size: {
    mode: "current",
    units: "pixels",
    width: 854,
    height: 480,
  },
  position: {
    mode: "auto",
    top: 0,
    left: 0,
  },
  advanced: {
    close: false,
    background: false,
    noCookieDomain: false,
    title: "",
    contextualIdentity: false,
    autoOpen: false,
  },
} as const;
export type OptionDomain = keyof typeof OPTION_DEFAULTS;

export const OPTIONS_BEHAVIOR_TARGET_VALUES = ["window", "tab"] as const;
export const OPTIONS_BEHAVIOR_CONTROLS_VALUES = [
  "none",
  "standard",
  "extended",
] as const;
export const OPTIONS_SIZE_MODE_VALUES = [
  "current",
  "previous",
  "maximized",
  "custom",
] as const;
export const OPTIONS_SIZE_UNITS_VALUES = ["pixels", "percentage"] as const;
export const OPTIONS_POSITION_MODE_VALUES = [
  "auto",
  "previous",
  "custom",
] as const;
