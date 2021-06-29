export const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";
export const YOUTUBE_NOCOOKIE_EMBED_URL =
  "https://www.youtube-nocookie.com/embed/";

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

export const MSG_REGEX = new RegExp(/^__MSG_(\S+)__$/, "gi");
