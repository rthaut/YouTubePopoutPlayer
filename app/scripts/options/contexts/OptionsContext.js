import React from "react";
import PropTypes from "prop-types";

import { OPTION_DEFAULTS } from "../../helpers/constants";
import Options from "../../helpers/options";

export const OptionsContext = React.createContext([OPTION_DEFAULTS, () => {}]);

export const OptionsProvider = ({ children }) => {
  const [options, setOptions] = React.useState(OPTION_DEFAULTS);

  React.useEffect(() => {
    (async () => {
      const options = await Options.GetLocalOptions();
      setOptions(options);
    })();
  }, []);

  return (
    <OptionsContext.Provider value={[options, setOptions]}>
      {children}
    </OptionsContext.Provider>
  );
};

OptionsProvider.propTypes = {
  children: PropTypes.node,
};

export const useOptions = () => {
  const [options, setOptions] = React.useContext(OptionsContext);

  const getOptionsForDomain = (domain) => options[domain];

  const setOptionsForDomain = (domain, domainOptions) => {
    setOptions((options) => ({
      ...options,
      [domain]: domainOptions,
    }));

    Options.SetLocalOptionsForDomain(domain, domainOptions);
  };

  const getOptionForDomain = (domain, optionName) =>
    options[domain][optionName];

  const setOptionForDomain = (domain, optionName, value) => {
    const domainOptions = {
      ...options[domain],
      [optionName]: value,
    };

    setOptionsForDomain(domain, domainOptions);
  };

  return {
    options,
    getOptionForDomain,
    setOptionForDomain,
    getOptionsForDomain,
    setOptionsForDomain,
  };
};

export const useOptionsForDomain = (domain) => {
  const {
    options,
    getOptionsForDomain,
    setOptionsForDomain,
    setOptionForDomain,
  } = useOptions();

  return {
    options: options[domain],
    getOptions: () => getOptionsForDomain(domain),
    setOptions: (domainOptions) => setOptionsForDomain(domain, domainOptions),
    setOption: (optionName, value) =>
      setOptionForDomain(domain, optionName, value),
  };
};
