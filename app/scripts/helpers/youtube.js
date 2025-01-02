import { GetParamFromURL } from "./utils";

export const VideoIDRegEx = /(?:(?:v=)|(?:\/shorts\/))([^\?\&\/]{11})/;

export const VideoLinkOrEmbedRegEx =
  /(?:(?:v=)|(?:\/embed\/)|(?:\/shorts\/)|(?:\/youtu\.be\/))([^\?\&\/]{11})/;

/**
 * Indicates if the given URL is for a YouTube video
 * @param {string} url a URL to check
 * @param {boolean} [external=true] if the test pattern should include link and embed formats
 * @returns {boolean} true if the URL is for a YouTube video
 */
export const IsVideoURL = (url, external = true) =>
  (external ? VideoLinkOrEmbedRegEx : VideoIDRegEx).test(url);

/**
 * Gets the YouTube video ID from the given YouTube URL
 * @param {string} url a valid YouTube URL
 * @param {boolean} [external=true] if the test pattern should include link and embed formats
 * @returns {string} the video ID
 */
export const GetVideoIDFromURL = (url, external = true) => {
  let id = null;

  const result = (external ? VideoLinkOrEmbedRegEx : VideoIDRegEx).exec(url);
  if (result && result[1]) {
    id = result[1];
  }

  return id;
};

/**
 * Gets the YouTube playlist ID from the given YouTube URL
 * @param {string} url a valid YouTube URL
 * @returns {string} the playlist ID
 */
export const GetPlaylistIDFromURL = (url) => {
  const id = GetParamFromURL("list", url);
  return id;
};

/**
 * Gets the YouTube video IDs in the current playlist from the DOM
 * @return {string[]} the video IDs
 */
export const GetPlaylistVideoIDsFromDOM = () => {
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
        .map((elem) => GetParamFromURL("v", elem.getAttribute("href")))
        .filter(Boolean),
    ),
  );

  return IDs;
};
