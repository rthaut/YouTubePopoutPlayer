/**
 * Modify requests to the YouTube Embedded Player to ensure the `Referer` header is set
 * The `Referer` header is required to avoid the "Video unavailable" error in the popout player
 */
export const OnBeforeSendHeaders = (details) => {
  console.log("[Background] OnBeforeSendHeaders()", details);

  // only if the request is for the popout player (identified by a custom GET parameter in the query string)
  if (details.url.includes("popout=1")) {
    console.log(
      "[Background] OnBeforeSendHeaders() :: Request is for popout player",
      details.url
    );

    // only if the Referer header is not already set
    if (
      !details.requestHeaders.some(
        (header) => header.name.toLowerCase() === "referer"
      )
    ) {
      const referer = {
        name: "Referer",
        value: details.url,
      };
      console.log(
        '[Background] OnBeforeSendHeaders() :: Setting "Referer" header',
        referer
      );
      details.requestHeaders.push(referer);
    }
  }

  console.log(
    "[Background] OnBeforeSendHeaders() :: Return",
    details.requestHeaders
  );
  return {
    requestHeaders: details.requestHeaders,
  };
};
