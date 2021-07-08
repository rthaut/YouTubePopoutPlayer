import React from "react";
import PropTypes from "prop-types";

import { useExtensionStorage } from "../hooks/useExtensionStorage";

import { OPTION_DEFAULTS } from "../../helpers/constants";
import Options from "../../helpers/options";

export const ExtensionStorageContext = React.createContext();

export const ExtensionStorageProvider = ({ children }) => {
  const [values, saveValues] = useExtensionStorage(
    "local",
    Options.ConvertForStorage(OPTION_DEFAULTS)
  );

  return React.createElement(
    ExtensionStorageContext.Provider,
    { value: [values, saveValues] },
    children
  );
};

ExtensionStorageProvider.propTypes = {
  children: PropTypes.node,
};

ExtensionStorageProvider.whyDidYouRender = true;
