import { POPOUT_PLAYER_PARAM_NAME, YOUTUBE_DOMAINS } from "@/utils/constants";

/**
 * Returns the number of pixels a given percentage is for the screen (in the specified dimension)
 * @param {"Width" | "Height"} dimension a screen dimension (either "width" or "height")
 * @param {number} percentage the percentage of the screen resolution
 * @returns {number | undefined} The pixels corresponding to the specified percentage of the screen's dimension
 */
// TODO: ideally this would never return `undefined`, as we are forcing it (!) in some places
export const GetDimensionForScreenPercentage = (
  dimension: "Width" | "Height",
  percentage: number,
): number | undefined => {
  if (percentage > 0) {
    percentage = percentage / 100;
  }

  if (
    window &&
    window.screen &&
    window.screen[`avail${dimension}`] !== undefined
  ) {
    return Math.floor(window.screen[`avail${dimension}`] * percentage);
  }

  return undefined;
};

/**
 * Determines if the browser is Firefox
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getBrowserInfo
 * @returns {Promise<boolean>} `true` only if the browser is successfully identified as Firefox
 */
export const IsFirefox = async (): Promise<boolean> => {
  let isFirefox = false;

  try {
    const runtime = browser.runtime as typeof browser.runtime & {
      getBrowserInfo?: () => Promise<{ name?: string } | undefined>;
    };
    const getBrowserInfo = runtime.getBrowserInfo;
    if (typeof getBrowserInfo === "function") {
      const info = await getBrowserInfo.call(runtime);

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
 * Determines if the given URL is for a popout player
 * @param {string} url the URL to check
 * @returns {boolean} whether or not the URL is for a popout player
 */
export const IsPopoutPlayerURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isYouTubeDomain = YOUTUBE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );

    return (
      isYouTubeDomain &&
      parsed.pathname.startsWith("/embed/") &&
      parsed.searchParams.has(POPOUT_PLAYER_PARAM_NAME)
    );
  } catch (error) {
    console.warn("Failed to parse URL while checking popout player", error);
    return false;
  }
};

/**
 * Converts a `string` to Title Case
 * @param {string} string the `string` to convert to Title Case
 * @returns {string} the `string` in Title Case
 */
export const TitleCase = (string: string): string =>
  string.replace(
    /\b\w+/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );

/**
 * Computes the greatest common denominator for a pair of numbers
 * @param {number} a the first number
 * @param {number} b the second number
 * @returns {number} the greatest common denominator
 */
export const GreatestCommonDenominator = (a: number, b: number): number =>
  b == 0 ? a : GreatestCommonDenominator(b, a % b);

/**
 * Returns a debounced version of the given function
 * @param {function} func the function to debounce
 * @param {number} wait the delay before executing the function
 * @param {boolean} [immediate=false] whether or not the function should execute immediately (and then debounce)
 * @returns the debounced function
 */
export function debounce<TThis, TArgs extends unknown[]>(
  func: (this: TThis, ...args: TArgs) => void,
  wait: number,
  immediate: boolean = false,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: TThis, ...args: TArgs) {
    const callNow = immediate && timeout === undefined;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;

      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
}

/**
 * Returns the string value of the specified URL parameter from the given URL
 * @param {string} param the parameter name
 * @param {string} url the URL
 * @returns {string | null} the parameter value, or null
 */
export const GetParamFromURL = (param: string, url: string): string | null => {
  if (url.includes("?")) {
    const params = new URLSearchParams(url.split("?")[1]);
    if (params.has(param)) {
      return params.get(param);
    }
  }

  return null;
};

/**
 * Determines if the given element is visible
 * @param {Element} elem the element to check
 * @returns {boolean} true if the element is visible
 */
export const IsVisible = (elem: HTMLElement): boolean =>
  elem.offsetWidth > 0 &&
  elem.offsetHeight > 0 &&
  !["none", "hidden"].includes(
    getComputedStyle(elem).getPropertyValue("display"),
  );
