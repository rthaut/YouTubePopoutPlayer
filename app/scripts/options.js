import React from "react";

/* global process */
if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

import ReactDOM from "react-dom";

import OptionsApp from "./options/OptionsApp";

ReactDOM.render(<OptionsApp />, document.querySelector("#root"));

const params = new URL(document.location).searchParams;
const vendor = params.get("vendor");
if (vendor) {
  document.documentElement.classList.add(`browser-${vendor}`);
}
