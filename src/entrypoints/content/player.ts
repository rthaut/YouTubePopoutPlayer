import { IsVisible } from "@/utils/misc";
import { GetPlaylistIDFromURL, GetVideoIDFromURL } from "@/utils/youtube";

/**
 * Gets the video element for the primary video player on a YouTube video page
 * @returns {HTMLVideoElement | undefined}
 */
export const GetPageVideo = (): HTMLVideoElement | undefined => {
  const videos = document.querySelectorAll(
    "#shorts-player video, #movie_player video, #player video",
  );

  for (const video of videos) {
    if (IsVisible(video as HTMLElement)) {
      return video as HTMLVideoElement;
    }
  }

  console.warn(
    "[Content] YouTubePopoutPlayer GetPageVideo() :: Failed to Get Video Player",
  );
  return undefined;
};

export const GetVideoPlayerInfo = () => {
  let info;

  const video = GetPageVideo();
  if (video) {
    info = {
      time: Math.floor(video.currentTime),
      width: video.clientWidth,
      height: video.clientHeight,
      paused: video.paused,
    };
  }

  return info;
};

/**
 * Opens the popout player (via a request to the background script)
 * @param {object} data parameters to send with the "open-popout" action payload
 * @returns {Promise<boolean>} if the popout was opened successfully
 */
export const OpenPopoutFromContentScript = async (
  data: object,
): Promise<boolean> => {
  try {
    await browser.runtime.sendMessage({
      action: "open-popout",
      data,
    });

    return true;
  } catch (error) {
    console.error(
      "[Content] YouTubePopoutPlayer OpenPopoutFromContentScript() :: Error",
      error,
    );
  }

  return false;
};

/**
 * Opens the popout player (via a request to the background script)
 * @param {object} [data={}] optional data to pass to background script, overrides gathered data
 * @returns {Promise<boolean>} if the popout was opened successfully
 */
export const OpenPopoutForPageVideo = async (
  data: object = {},
): Promise<boolean> => {
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

/**
 * Rotates the video player (by adjusting the `data-ytp-rotation` attribute on the HTML tag)
 * @param {number} rotationAmount the amount (in degrees) by which to rotate the video
 */
export const RotateVideoPlayer = (rotationAmount: number = 0) => {
  const currentRotation = +(
    document.documentElement.getAttribute("data-ytp-rotation") ?? 0
  );
  const newRotation = currentRotation + rotationAmount;
  const fixedRotation = (newRotation + 360) % 360; // convert to positive rotation between 0-360
  document.documentElement.setAttribute(
    "data-ytp-rotation",
    fixedRotation.toString(),
  );
};

export const PauseVideoPlayer = () => {
  const video = GetPageVideo();
  if (video) {
    video.pause();
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
