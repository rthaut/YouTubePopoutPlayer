import { START_THRESHOLD, YOUTUBE_EMBED_URL } from "../helpers/constants";
import Options from "../helpers/options";
import Utils from "../helpers/utils";

const Popout = (() => {
  const WIDTH_PADDING = 16; // TODO: find a way to calculate this (or make it configurable)
  const HEIGHT_PADDING = 40; // TODO: find a way to calculate this (or make it configurable)

  const Popout = {
    open: async function ({ id, list, time, width, height }) {
      console.log("[Background] Popout.open()", id, list, time, width, height);

      // https://developers.google.com/youtube/player_parameters
      const params = {};

      // custom flag for determining if the embedded player is playing within a popout window/tab
      params.popout = 1;

      const behavior = await Options.GetLocalOptionsForDomain("behavior");
      console.log("[Background] Popout.open() :: Behavior options", behavior);

      ["autoplay", "loop"].forEach((param) => {
        params[param] = behavior[param] ? 1 : 0; // convert true/false to 1/0 for URL params
      });

      switch (behavior.controls.toLowerCase()) {
        case "none":
          params.controls = 0;
          params.modestbranding = 1;
          break;

        case "standard":
          params.controls = 1;
          params.modestbranding = 0;
          break;

        case "extended":
          params.controls = 1;
          params.modestbranding = 0;
          break;

        default:
          console.warn(
            '[Background] Popout.open() :: Invalid value for "behavior.controls" option',
            behavior.controls
          );
          // use values for "standard" configuration
          params.controls = 1;
          params.modestbranding = 0;
          break;
      }

      if (time <= START_THRESHOLD) {
        console.info(
          "[Background] Popout.open() :: Popout video will start from beginning"
        );
        time = 0;
      }
      params.start = time;

      if (list !== undefined && list !== null) {
        // `list` is the identifier for either: playlist, search, or user_uploads
        params.list = list;
      } else if (behavior.loop) {
        // `playlist` is a comma-separated list of video IDs to play
        // to loop a single video, the playlist parameter value must be set to the video's ID
        params.playlist = id;
      }

      const url = this.getURL(id, params);

      let result;
      switch (behavior.target.toLowerCase()) {
        case "tab":
          result = this.openTab(url);
          break;

        case "window":
        default:
          result = this.openWindow(url, width, height);
          break;
      }

      console.log("[Background] Popout.open() :: Return", result);
      return result;
    },

    /**
     * Opens an Embedded Player in a new tab
     * @param {string} url the URL of the Embedded Player to open in a new window
     * @returns {Promise}
     */
    openTab: async function (url) {
      console.log("[Background] Popout.openTab()", url);

      const createData = {
        active: true, // TODO: should this be configurable?
        url,
      };

      console.log("[Background] Popout.openTab() :: Creating Tab", createData);
      const result = await browser.tabs.create(createData);

      console.log("[Background] Popout.openTab() :: Return", result);
      return result;
    },

    /**
     * Opens an Embedded Player in a new window (optionally matching the size of the original video player)
     * @param {string} url the URL of the Embedded Player to open in a new window
     * @param {number} width the width of the original video player
     * @param {number} height the height of the original video player
     * @returns {Promise}
     */
    openWindow: async function (url, width, height) {
      console.log("[Background] Popout.openWindow()", url, width, height);

      const size = await Options.GetLocalOptionsForDomain("size");
      console.log("[Background] Popout.openWindow() :: Size options", size);

      if (size.mode.toLowerCase() === "custom") {
        switch (size.units.toLowerCase()) {
          case "pixels":
            width = size.width;
            height = size.height;
            break;

          case "percentage":
            width = Utils.GetDimensionForScreenPercentage("Width", size.width);
            height = Utils.GetDimensionForScreenPercentage(
              "Height",
              size.height
            );
            break;

          default:
            console.warn(
              '[Background] Popout.openWindow() :: Invalid value for "size.units" option',
              size.units
            );
            // do nothing; use the original video player's dimensions instead
            break;
        }
      }

      const createData = {
        width: width + WIDTH_PADDING, // manually increasing size to account for window frame
        height: height + HEIGHT_PADDING, // manually increasing size to account for window frame
        type: "popup",
        url,
      };

      const isFirefox = await Utils.IsFirefox();

      if (isFirefox) {
        createData.titlePreface = await Options.GetLocalOption(
          "advanced",
          "title"
        );
      }

      console.log(
        "[Background] Popout.openWindow() :: Creating Window",
        createData
      );
      const result = await browser.windows.create(createData);

      console.log("[Background] Popout.openWindow() :: Return", result);
      return result;
    },

    /**
     * Gets the URL for the popout player given a video ID and optional URL parameters
     * @param {string} id the video ID
     * @param {Object} [params] URL parameters
     * @returns {string} the full URL for the popout player
     */
    getURL: function (id, params = null) {
      console.log("[Background] Popout.getURL()", id, params);

      // TODO: if autoplay is disabled, we can omit the video ID from the path; as long as either `playlist` or `list` has a value, the Embedded Player will use it when the user clicks play (for single videos, this will prevent it appearing as a playlist with 2 videos, even though it is just the same video twice)
      // TODO: there may be some other edge cases to consider, like setting the start time with autoplay disabled

      let url = YOUTUBE_EMBED_URL + id;

      if (params !== undefined && params !== null) {
        url += "?" + new URLSearchParams(params).toString();
      }

      console.log("[Background] Popout.getURL() :: Return", url);
      return url;
    },
  };

  return Popout;
})();

export default Popout;
