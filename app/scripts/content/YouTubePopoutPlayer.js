import { GetVideoIDFromURL, GetPlaylistIDFromURL } from "../helpers/youtube";

/**
 * Gets the video element for the primary video player on a YouTube video page
 * @returns {HTMLVideoElement}
 */
export const GetPageVideo = () => {
  console.log("[Content] YouTubePopoutPlayer GetPageVideo()");

  const video = document.querySelector("#movie_player video, #player video");

  console.log("[Content] YouTubePopoutPlayer GetPageVideo() :: Return", video);
  return video;
};

export const GetVideoPlayerInfo = () => {
  console.log("[Content] YouTubePopoutPlayer GetVideoPlayerInfo()");

  let info;

  const video = GetPageVideo();
  if (video) {
    info = {
      time: parseInt(video.currentTime, 10),
      width: video.clientWidth,
      height: video.clientHeight,
      paused: video.paused,
    };
  }

  console.log(
    "[Content] YouTubePopoutPlayer GetVideoPlayerInfo() :: Return",
    info
  );
  return info;
};

/**
 * Opens the popout player (via a request to the background script)
 * @param {object} data parameters to send with the "open-popout" action payload
 * @returns {Promise<boolean>} if the popout was opened successfully
 */
export const OpenPopoutFromContentScript = async (data) => {
  console.log("[Content] YouTubePopoutPlayer OpenPopoutFromContentScript()");

  try {
    const response = await browser.runtime.sendMessage({
      action: "open-popout",
      data,
    });

    if (response !== undefined) {
      console.log(
        '[Content] YouTubePopoutPlayer OpenPopoutFromContentScript() :: Action "open-popout" response',
        response
      );
    }

    return true;
  } catch (error) {
    console.error(
      "[Content] YouTubePopoutPlayer OpenPopoutFromContentScript() :: Error",
      error
    );
  }

  return false;
};

/**
 * Opens the popout player (via a request to the background script)
 * @returns {Promise<boolean>} if the popout was opened successfully
 */
export const OpenPopoutForPageVideo = async () => {
  console.log("[Content] YouTubePopoutPlayer OpenPopoutForPageVideo()");

  const data = {
    id: GetVideoIDFromURL(window.location.href),
    list: GetPlaylistIDFromURL(window.location.href),
  };

  const playerInfo = GetVideoPlayerInfo();
  if (playerInfo) {
    data.time = playerInfo.time;
    data.originalVideoWidth = playerInfo.width;
    data.originalVideoHeight = playerInfo.height;
  }

  const success = await OpenPopoutFromContentScript(data);

  if (success) {
    const paused = await PauseVideoPlayer();
    if (!paused) {
      console.warn("Failed to pause original video player");
    }
  }

  return success;
};

export const PauseVideoPlayer = () => {
  const video = GetPageVideo();
  if (video) {
    const promise = video.pause();
    if (promise !== undefined) {
      return promise.then(() => true).catch(() => false);
    }
  }
  return false;
};

export const PlayVideoPlayer = () => {
  const video = GetPageVideo();
  if (video) {
    const promise = video.play();
    if (promise !== undefined) {
      return promise.then(() => true).catch(() => false);
    }
  }
  return false;
};
