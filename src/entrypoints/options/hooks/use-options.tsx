import React from "react";

import { OPTION_DEFAULTS, type OptionDomain } from "@/utils/constants";
import Options, {
  type GroupedOptionsType,
  type OptionsType,
} from "@/utils/options";

type OptionHook = readonly [any, (value: any) => void];
type DomainOptionsHook = {
  options: OptionsType;
  setOption: (key: string, value: any) => void;
  setOptions: (options: Partial<OptionsType>) => void;
};

interface OptionsContextType {
  // options: GroupedOptionsType;
  resetOptions: () => Promise<void>;
  useDomainOptions: (domain: OptionDomain) => DomainOptionsHook;
  useOption: (domain: OptionDomain, name: string) => OptionHook;
}

const OptionsContext = React.createContext<OptionsContextType | undefined>(
  undefined,
);

export const OptionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [optionsState, setStateOptions] =
    React.useState<GroupedOptionsType>(OPTION_DEFAULTS);

  React.useEffect(() => {
    const loadOptionsIntoState = async () => {
      const optionsFromStorage = await Options.GetLocalOptions();
      setStateOptions({
        ...optionsState,
        ...optionsFromStorage,
      });
    };

    loadOptionsIntoState();
    browser.storage.local.onChanged.addListener(loadOptionsIntoState);

    return () => {
      browser.storage.local.onChanged.removeListener(loadOptionsIntoState);
    };
  }, []);

  /**
   * Resets all options to their defaults, both in the store/state and in extension storage
   */
  const resetOptions = async () => {
    await Options.InitLocalStorageDefaults(true);
    setStateOptions(Options.ConvertFromStorage(OPTION_DEFAULTS)!);
  };

  /**
   * Utility hook for working with a specific option
   */
  const useOption = React.useCallback(
    (domain: OptionDomain, name: string) => {
      return [
        optionsState[domain][name],
        (value: any) => Options.SetLocalOption(domain, name, value),
      ] as const;
    },
    [optionsState],
  );

  /**
   * Utility hook for working with options in a specific domain
   * @param {OptionDomain} domain the domain of the grouped options
   * @returns
   */
  const useDomainOptions = React.useCallback(
    (domain: OptionDomain) => {
      return {
        options: optionsState[domain],
        setOption: (key: string, value: any) =>
          Options.SetLocalOption(domain, key, value),
        setOptions: (options: Partial<OptionsType>) =>
          Options.SetLocalOptionsForDomain(domain, options),
      };
    },
    [optionsState],
  );

  return (
    <OptionsContext.Provider
      value={{
        // options: optionsState,
        resetOptions,
        useOption,
        useDomainOptions,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptionsContext = (): OptionsContextType => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error("useOptionsContext must be used within an OptionsProvider");
  }
  return context;
};

export const useOption = (domain: OptionDomain, name: string): OptionHook => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error("useOption must be used within an OptionsProvider");
  }
  return context.useOption(domain, name);
};

export const useDomainOptions = (domain: OptionDomain): DomainOptionsHook => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error("useDomainOptions must be used within an OptionsProvider");
  }
  return context.useDomainOptions(domain);
};
