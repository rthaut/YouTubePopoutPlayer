import { IsVisible } from "../helpers/utils";
import { GetVideoIDFromURL, GetPlaylistIDFromURL } from "../helpers/youtube";

/**
 * Gets the video element for the primary video player on a YouTube video page
 * @returns {HTMLVideoElement}
 */
export const GetPageVideo = () => {
  console.log("[Content] YouTubePopoutPlayer GetPageVideo()");

  const videos = document.querySelectorAll(
    "#shorts-player video, #movie_player video, #player video"
  );

  for (const video of videos) {
    if (IsVisible(video)) {
      console.log(
        "[Content] YouTubePopoutPlayer GetPageVideo() :: Return",
        video
      );
      return video;
    }
  }

  console.warn(
    "[Content] YouTubePopoutPlayer GetPageVideo() :: Failed to Get Video Player"
  );
  return undefined;
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
  console.log(
    "[Content] YouTubePopoutPlayer OpenPopoutFromContentScript()",
    data
  );

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
 * @param {object} [data={}] optional data to pass to background script, overrides gathered data
 * @returns {Promise<boolean>} if the popout was opened successfully
 */
export const OpenPopoutForPageVideo = async (data = {}) => {
  console.log("[Content] YouTubePopoutPlayer OpenPopoutForPageVideo()", data);

  const id = GetVideoIDFromURL(window.location.href);
  const list = GetPlaylistIDFromURL(window.location.href);

  const {
    time,
    width: originalVideoWidth,
    height: originalVideoHeight,
  } = GetVideoPlayerInfo() ?? {};

  const success = await OpenPopoutFromContentScript({
    id,
    list,
    time,
    originalVideoWidth,
    originalVideoHeight,
    ...data,
  });

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
