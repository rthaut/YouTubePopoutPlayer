import React from "react";
import ReactDOM from "react-dom";

import OptionsApp from "./options/OptionsApp";

ReactDOM.render(<OptionsApp />, document.querySelector("#root"));

const params = new URL(document.location).searchParams;
const vendor = params.get("vendor");
if (vendor) {
  document.documentElement.classList.add(`browser-${vendor}`);
}
