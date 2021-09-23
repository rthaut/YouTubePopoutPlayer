import { GetParamFromURL } from "./utils";

/**
 * Gets the YouTube video ID from the given YouTube URL
 * @param {string} url a valid YouTube URL
 * @return {string} the video ID
 */
export const GetVideoIDFromURL = (url) => {
  // console.group("GetVideoIDFromURL()");

  let id = null;

  const result = new RegExp(
    /(?:(?:v=)|(?:\/embed\/)|(?:\/youtu\.be\/))([^\?\&\/]{11})/
  ).exec(url);
  // console.log("RegExp Result", result);

  if (result && result[1]) {
    id = result[1];
  }

  // console.log("Return", id);
  // console.groupEnd();
  return id;
};

/**
 * Gets the YouTube playlist ID from the given YouTube URL
 * @param {string} url a valid YouTube URL
 * @return {string} the playlist ID
 */
export const GetPlaylistIDFromURL = (url) => {
  // console.group("GetPlaylistIDFromURL()");

  const id = GetParamFromURL("list", url);

  // console.log("Return", id);
  // console.groupEnd();
  return id;
};

/**
 * Gets the YouTube video IDs in the current playlist from the DOM
 * @return {string[]} the video IDs
 */
export const GetPlaylistVideoIDsFromDOM = () => {
  // console.group("GetPlaylistVideoIDsFromDOM()");

  const IDs = Array.from(
    new Set(
      Array.from(
        document.querySelectorAll(
          [
            'ytd-playlist-panel-renderer a[href*="v="]',
            'ytd-playlist-video-list-renderer a[href*="v="]',
          ].join(",")
        )
      )
        .map((elem) => GetParamFromURL("v", elem.getAttribute("href")))
        .filter(Boolean)
    )
  );

  // console.log("Return", IDs);
  // console.groupEnd();
  return IDs;
};
