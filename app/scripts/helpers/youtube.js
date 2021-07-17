/**
 * Gets the YouTube video ID from the given YouTube URL
 * @param {String} url a valid YouTube URL
 * @return {String} the video ID
 */
export const GetVideoIDFromURL = (url) => {
  console.group("GetVideoIDFromURL()");

  let id = null;

  const result = new RegExp(
    /(?:(?:v=)|(?:\/embed\/)|(?:\/youtu\.be\/))([^\?\&\/]{11})/
  ).exec(url);
  console.log("RegExp Result", result);

  if (result && result[1]) {
    id = result[1];
  }

  console.log("Return", id);
  console.groupEnd();
  return id;
};

/**
 * Gets the YouTube playlist ID from the given YouTube URL
 * @param {String} url a valid YouTube URL
 * @return {String} the playlist ID
 */
export const GetPlaylistIDFromURL = (url) => {
  console.group("GetPlaylistIDFromURL()");

  let id = null;

  url = new URL(url);
  if (url.searchParams !== undefined && url.searchParams !== null) {
    id = url.searchParams.get("list");
  }

  console.log("Return", id);
  console.groupEnd();
  return id;
};
