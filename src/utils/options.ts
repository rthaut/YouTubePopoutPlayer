import { OPTION_DEFAULTS } from "@/utils/constants";

export type GroupedOptionsType = Record<string, Record<string, any>>;
export type OptionsType = Record<string, any>;

const Options = (() => {
  /**
   * @param {"sync" | "local" | "managed"} type the type of writable storage (`sync`, `local`, or `managed`)
   * @param {boolean} [useDefaults=true] indicates if the default value(s) should be returned for missing key(s)
   * @returns {Promise<OptionsType>}
   */
  const GetAllFromStorage = async function (
    type: "sync" | "local" | "managed" = "local",
    useDefaults: boolean = true,
  ): Promise<OptionsType> {
    const defaultOptions = Options.ConvertForStorage(OPTION_DEFAULTS)!;
    const keys = useDefaults ? defaultOptions : Object.keys(defaultOptions);
    return browser.storage[type].get(keys);
  };

  const Options = {
    /**
     * Resets all options in local storage to their default values
     * @param {boolean} [reset=false] indicates if local storage should be reset
     */
    InitLocalStorageDefaults: async function (reset: boolean = false) {
      const defaultOptions = this.ConvertForStorage(
        Object.assign({}, OPTION_DEFAULTS),
      )!;

      if (reset) {
        await browser.storage.local.clear();
        await browser.storage.local.set(defaultOptions);
      } else {
        const options = await GetAllFromStorage("local", false);

        const promises: Promise<void>[] = [];

        Object.keys(defaultOptions).forEach((option) => {
          if (options[option] === undefined || options[option] === null) {
            const opt: OptionsType = {};
            opt[option] = defaultOptions[option];
            promises.push(browser.storage.local.set(opt));
          }
        });

        Object.keys(options).forEach((option) => {
          if (
            defaultOptions[option] === undefined ||
            defaultOptions[option] === null
          ) {
            promises.push(browser.storage.local.remove(option));
          }
        });

        await Promise.all(promises);
      }
    },

    /**
     * Converts options in a nested structure to a flat structure
     * @param {GroupedOptionsType} options the options to convert
     * @returns {OptionsType | null} the converted options
     */
    ConvertForStorage: function (
      options: GroupedOptionsType,
    ): OptionsType | null {
      if (
        options === undefined ||
        options === null ||
        !Object.keys(options).length
      ) {
        return null;
      }

      const result: OptionsType = {};

      Object.keys(options).forEach((domain) => {
        Object.keys(options[domain]).forEach((name) => {
          result[`${domain}.${name}`] = options[domain][name];
        });
      });

      return result;
    },

    /**
     * Converts options in a flat structure to a nested structure
     * @param {OptionsType} options the options to convert
     * @returns {GroupedOptionsType | null} the converted options
     */
    ConvertFromStorage: function (
      options: OptionsType,
    ): GroupedOptionsType | null {
      if (
        options === undefined ||
        options === null ||
        !Object.keys(options).length
      ) {
        return null;
      }

      const result: GroupedOptionsType = {};

      var domain, opt;
      Object.keys(options).forEach((option) => {
        if (option.includes(".")) {
          // handle options should be stored in the format [domain].[key]
          [domain, opt] = option.split(".");

          if (result[domain] === undefined) {
            result[domain] = {};
          }

          result[domain][opt] = options[option];
        } else {
          // handle options that don't have a domain
          result[option] = options[option];
        }
      });
      return result;
    },

    /**
     * Returns the value of an option from local storage
     * @param {string} domain the domain of the option
     * @param {string} name the name of the option
     * @returns {Promise<any>} the value of an option from local storage
     */
    GetLocalOption: async function (
      domain: string,
      name: string,
    ): Promise<any> {
      const options = await this.GetLocalOptionsForDomain(domain);
      return options[name];
    },

    /**
     * Saves the value of an option to local storage
     * @param {string} domain the domain of the option
     * @param {string} name the name of the option
     */
    SetLocalOption: async function (domain: string, name: string, value: any) {
      const option = this.ConvertForStorage(
        Object.assign({}, { [domain]: { [name]: value } }),
      );

      if (option !== null) {
        await browser.storage.local.set(option);
      }
    },

    /**
     * Returns all options (as an object) from local storage
     * @returns {Promise<GroupedOptionsType>}
     */
    GetLocalOptions: async function (): Promise<GroupedOptionsType> {
      let options = await GetAllFromStorage("local");
      options = Object.assign({}, this.ConvertFromStorage(options));
      return options;
    },

    /**
     * Returns all options (as an object) for the specified domain from local storage
     * @param {string} domain the domain of the options
     * @returns {Promise<OptionsType>}
     */
    GetLocalOptionsForDomain: async function (
      domain: string,
    ): Promise<OptionsType> {
      let options = await this.GetLocalOptions();
      options = Object.assign({}, options[domain]);
      return options;
    },

    /**
     * Saves the options to local storage
     * @param {Promise<GroupedOptionsType>} options options (in a nested structure)
     */
    SetLocalOptionsForDomain: async function (
      domain: keyof GroupedOptionsType,
      options: OptionsType,
    ) {
      const convertedOptions = this.ConvertForStorage(
        Object.assign({}, { [domain]: options }),
      );

      if (convertedOptions !== null) {
        await browser.storage.local.set(convertedOptions);
      }
    },
  };

  return Options;
})();

export default Options;
