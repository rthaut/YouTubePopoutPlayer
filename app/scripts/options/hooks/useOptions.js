import React from "react";

import { OPTION_DEFAULTS } from "../../helpers/constants";
import Options from "../../helpers/options";

import { ExtensionStorageContext } from "../contexts/ExtensionStorage";

export const useOptions = () => {
  const [values, saveValues] = React.useContext(ExtensionStorageContext);

  const getOptionsForDomain = (domain) => {
    const options = Options.ConvertFromStorage(values);
    return options[domain];
  };

  const setOptionsForDomain = (domain, options) => {
    saveValues(Options.ConvertForStorage({ [domain]: options }));
  };

  const getOptionForDomain = (domain, optionName) => {
    const options = Options.ConvertFromStorage(values);
    return options[domain][optionName];
  };

  const setOptionForDomain = (domain, optionName, value) => {
    saveValues(
      Options.ConvertForStorage({ [domain]: { [optionName]: value } })
    );
  };

  return {
    options: Options.ConvertFromStorage(values),
    setOptions: saveValues,
    getOptionForDomain,
    setOptionForDomain,
    getOptionsForDomain,
    setOptionsForDomain,
  };
};

export const useOptionsForDomain = (domain) => {
  const { options, setOptionsForDomain, setOptionForDomain } = useOptions();

  const getOptions = () => options?.[domain] ?? OPTION_DEFAULTS?.[domain] ?? {};

  return {
    options: getOptions(),
    setOptions: (domainOptions) => setOptionsForDomain(domain, domainOptions),
    setOption: (optionName, value) =>
      setOptionForDomain(domain, optionName, value),
  };
};
