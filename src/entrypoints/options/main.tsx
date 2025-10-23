import * as React from "react";
import { createRoot } from "react-dom/client";

import OptionsApp from "./OptionsApp";

const container = document.querySelector("#root")!;
const root = createRoot(container);
root.render(<OptionsApp />);
