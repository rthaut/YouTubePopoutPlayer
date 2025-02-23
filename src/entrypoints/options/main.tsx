import * as React from "react";
import { createRoot } from "react-dom/client";

import OptionsApp from "./OptionsApp";

const container = document.querySelector("#root")!;
const root = createRoot(container);
root.render(<OptionsApp />);

const params = new URL(window.location.href).searchParams;
const vendor = params.get("vendor");
if (vendor) {
  document.documentElement.classList.add(`browser-${vendor}`);
}
