import {
  YOUTUBE_EMBED_URL,
  YOUTUBE_NOCOOKIE_EMBED_URL,
} from "../helpers/constants";

/**
 * Returns the `filter` object for the specified web request event
 * @param {string} eventName name of the web request event
 * @returns {object} the `filter` object
 */
export const GetFilter = (eventName) => {
  console.log("[Background] GetFilters()", eventName);

  const filter = {};

  switch (eventName) {
    default:
      filter["urls"] = [
        YOUTUBE_EMBED_URL + "*",
        YOUTUBE_NOCOOKIE_EMBED_URL + "*",
      ];
      break;
  }

  console.log("[Background] GetFilters() :: Return", filter);
  return filter;
};

/**
 * Returns the `extraInfoSpec` options for the specified web request event
 * @param {string} eventName name of the web request event
 * @returns {string[]} the `extraInfoSpec` options
 */
export const GetExtraInfoSpec = (eventName) => {
  console.log("[Background] GetExtraInfoSpec()", eventName);

  const extraInfoSpec = [];

  /**
   * Adds the `extraHeaders` option for browsers that need it to set certain headers
   */
  const _addExtraHeadersOption = () => {
    if (
      Object.prototype.hasOwnProperty.call(
        chrome?.webRequest?.OnBeforeSendHeadersOptions,
        "EXTRA_HEADERS"
      )
    ) {
      extraInfoSpec.push("extraHeaders");
    }
  };

  switch (eventName) {
    case "onBeforeSendHeaders":
      extraInfoSpec.push("blocking", "requestHeaders");
      _addExtraHeadersOption();
      break;

    case "onSendHeaders":
      extraInfoSpec.push("requestHeaders");
      _addExtraHeadersOption();
      break;
  }

  console.log("[Background] GetExtraInfoSpec() :: Return", extraInfoSpec);
  return extraInfoSpec;
};

/**
 * Modifies requests to the YouTube Embedded Player to ensure the necessary headers are set
 * @param {object} details details of the request
 */
export const OnBeforeSendHeaders = (details) => {
  console.log("[Background] OnBeforeSendHeaders()", details);

  const url = new URL(details.url);
  let { requestHeaders } = details;

  const HasHeader = (name) =>
    requestHeaders.some(
      (header) => header.name.toLowerCase() === name.toLowerCase()
    );

  const AddHeader = (header) => {
    if (!HasHeader(header.name)) {
      console.log(
        `[Background] OnBeforeSendHeaders() :: Setting "${header.name}" header`,
        header
      );
      requestHeaders.push(header);
    }
  };

  // only if the request is for the popout player (identified by a custom GET parameter in the query string)
  if (parseInt(url.searchParams.get("popout"), 10) === 1) {
    console.log(
      "[Background] OnBeforeSendHeaders() :: Request is for popout player",
      url
    );

    // the `Referer` header is required to avoid the "Video unavailable" error in the popout player
    AddHeader({
      name: "Referer",
      value: url.origin + url.pathname,
    });

    // AddHeader({
    //   name: "Host",
    //   value: url.hostname,
    // });
  }

  console.group("[Background] OnBeforeSendHeaders() :: Return");
  console.table(requestHeaders, ["name", "value"]);
  console.groupEnd();

  return {
    requestHeaders,
  };
};

/**
 * Logs the headers that are actually sent in the request (for debugging)
 * @param {object} details details of the request
 */
export const OnSendHeaders = ({ requestHeaders }) => {
  console.group("[Background] OnSendHeaders() :: Request Headers");
  console.table(requestHeaders, ["name", "value"]);
  console.groupEnd();
};
