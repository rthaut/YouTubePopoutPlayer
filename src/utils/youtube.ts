import { GetParamFromURL } from "@/utils/misc";

const VIDEO_ID_PATTERN = String.raw`([^?&/#]{11})(?=$|[?&/#])`;
const YOUTUBE_HOST_PATTERN = String.raw`(?:[a-z0-9-]+\.)*youtube\.com`;
const YOUTUBE_LINK_OR_EMBED_HOST_PATTERN = String.raw`(?:(?:[a-z0-9-]+\.)*youtube(?:-nocookie)?\.com|(?:www\.)?youtu\.be)`;
const URL_PREFIX_PATTERN = String.raw`^(?:https?:\/\/)?`;
const WATCH_PARAM_PATTERN = String.raw`watch\?(?:[^#&]*&)*v=`;

export const VideoIDRegEx = new RegExp(
  String.raw`${URL_PREFIX_PATTERN}${YOUTUBE_HOST_PATTERN}\/(?:(?:${WATCH_PARAM_PATTERN})|(?:live\/)|(?:shorts\/))${VIDEO_ID_PATTERN}`,
  "i",
);

export const VideoLinkOrEmbedRegEx = new RegExp(
  String.raw`${URL_PREFIX_PATTERN}(?:(?:${YOUTUBE_LINK_OR_EMBED_HOST_PATTERN}\/(?:(?:${WATCH_PARAM_PATTERN})|(?:embed\/)|(?:live\/)|(?:shorts\/)))|(?:(?:www\.)?youtu\.be\/))${VIDEO_ID_PATTERN}`,
  "i",
);

/**
 * Indicates if the given URL is for a YouTube video
 * @param {string} url a URL to check
 * @param {boolean} [external=true] if the test pattern should include link and embed formats
 * @returns {boolean} true if the URL is for a YouTube video
 */
export const IsVideoURL = (url: string, external: boolean = true): boolean =>
  (external ? VideoLinkOrEmbedRegEx : VideoIDRegEx).test(url);

/**
 * Gets the YouTube video ID from the given YouTube URL
 * @param {string} url a valid YouTube URL
 * @param {boolean} [external=true] if the test pattern should include link and embed formats
 * @returns {string|undefined} the video ID
 */
export const GetVideoIDFromURL = (
  url: string,
  external: boolean = true,
): string | undefined => {
  let id = undefined;

  const result = (external ? VideoLinkOrEmbedRegEx : VideoIDRegEx).exec(url);
  if (result && result[1]) {
    id = result[1];
  }

  return id;
};

/**
 * Gets the YouTube playlist ID from the given YouTube URL
 * @param {string} url a valid YouTube URL
 * @returns {string | undefined} the playlist ID
 */
export const GetPlaylistIDFromURL = (url: string): string | undefined => {
  const id = GetParamFromURL("list", url);
  return id ?? undefined;
};

/**
 * Gets the YouTube video IDs in the current playlist from the DOM
 * @return {string[]} the video IDs
 */
export const GetPlaylistVideoIDsFromDOM = (): string[] => {
  const IDs = Array.from(
    new Set(
      Array.from(
        document.querySelectorAll(
          [
            'ytd-playlist-panel-renderer a[href*="v="]',
            'ytd-playlist-video-list-renderer a[href*="v="]',
          ].join(","),
        ),
      )
        .map((elem) => GetParamFromURL("v", elem.getAttribute("href") ?? ""))
        .filter(Boolean),
    ),
  );

  return IDs.filter((id) => id !== undefined && id !== null);
};
