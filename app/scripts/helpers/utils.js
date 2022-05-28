import { YOUTUBE_EMBED_URL } from "./constants";

/**
 * Returns the number of pixels a given percentage is for the screen (in the specified dimension)
 * @param {string} dimension a screen dimension (either "width" or "height")
 * @param {number} percentage the percentage of the screen resolution
 * @returns {number} The pixels corresponding to the specified percentage of the screen's dimension
 */
export const GetDimensionForScreenPercentage = (dimension, percentage) => {
  if (percentage > 0) {
    percentage = percentage / 100;
  }

  dimension = TitleCase(dimension);

  if (
    window &&
    window.screen &&
    window.screen[`avail${dimension}`] !== undefined
  ) {
    return parseInt(window.screen[`avail${dimension}`] * percentage, 10);
  }

  return undefined;
};

/**
 * Determines if the browser is Firefox
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getBrowserInfo
 * @returns {Promise<boolean>} `true` only if the browser is successfully identified as Firefox
 */
export const IsFirefox = async () => {
  let isFirefox = false;

  try {
    if (typeof browser.runtime.getBrowserInfo === "function") {
      const info = await browser.runtime.getBrowserInfo();

      if (info !== undefined && info !== null) {
        if (info.name !== undefined && info.name.toLowerCase() === "firefox") {
          isFirefox = true;
        }
      }
    }
  } catch (error) {
    console.warn("Failed to determine if browser is Firefox", error);
  }

  return isFirefox;
};

/**
 * Determines if the given `Location` is for a popout player
 * @param {Location} location window/document `Location`
 * @returns {boolean} whether or not the given `Location` is a popout player
 */
export const IsPopoutPlayer = (location) => {
  if (location.href.startsWith(YOUTUBE_EMBED_URL)) {
    const params = new URLSearchParams(location.search.substring(1));
    if (params.get("popout")) {
      return true;
    }
  }

  return false;
};

/**
 * Converts a `string` to Title Case
 * @param {string} string the `string` to convert to Title Case
 * @returns {string} the `string` in Title Case
 */
export const TitleCase = (string) =>
  string.replace(
    /\b\w+/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

/**
 * Computes the greatest common denominator for a pair of numbers
 * @param {number} a the first number
 * @param {number} b the second number
 * @returns {number} the greatest common denominator
 */
export const GreatestCommonDenominator = (a, b) =>
  b == 0 ? a : GreatestCommonDenominator(b, a % b);

/**
 * Returns a debounced version of the given function
 * @param {function} func the function to debounce
 * @param {number} wait the delay before executing the function
 * @param {boolean} immediate whether or not the function should execute immediately (and then debounce)
 * @returns the debounced function
 */
export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

/**
 * Returns the string value of the specified URL parameter from the given URL
 * @param {string} param the parameter name
 * @param {string} url the URL
 * @returns {string|undefined} the parameter value, or undefined
 */
export const GetParamFromURL = (param, url) => {
  if (url.includes("?")) {
    let params = new URLSearchParams(url.split("?")[1]);
    if (params.has(param)) {
      return params.get(param);
    }
  }

  return undefined;
};

/**
 * Determines if the given element is visible
 * @param {Element} elem the element to check
 * @returns {boolean} true if the element is visible
 */
export const IsVisible = (elem) =>
  elem.offsetWidth > 0 &&
  elem.offsetHeight > 0 &&
  !["none", "hidden"].includes(
    getComputedStyle(elem).getPropertyValue("display")
  );
