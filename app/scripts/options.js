import React from "react";

import whyDidYouRender from "@welldone-software/why-did-you-render";

/* global process */
if (process.env.NODE_ENV === "development") {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

import ReactDOM from "react-dom";

import OptionsApp from "./options/OptionsApp";

ReactDOM.render(<OptionsApp />, document.querySelector("#root"));