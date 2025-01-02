import { OPTION_DEFAULTS } from "./constants";

const Options = (() => {
  /**
   * @param {string} type the type of writable storage (`sync`, `local`, or `managed`)
   * @param {boolean} [defaults=true] indicates if the default value(s) should be returned for missing key(s)
   * @returns {Promise<object>}
   */
  const GetAllFromStorage = async function (type = "local", defaults = true) {
    const options = Options.ConvertForStorage(OPTION_DEFAULTS);
    const keys = defaults ? options : Object.keys(options);
    return browser.storage[type].get(keys);
  };

  const Options = {
    /**
     * Resets all options in local storage to their default values
     * @param {boolean} [reset=false] indicates if local storage should be reset
     */
    InitLocalStorageDefaults: async function (reset = false) {
      const defaults = this.ConvertForStorage(
        Object.assign({}, OPTION_DEFAULTS),
      );

      if (reset) {
        await browser.storage.local.clear();
        await browser.storage.local.set(defaults);
      } else {
        const options = await GetAllFromStorage("local", false);

        const promises = [];

        Object.keys(defaults).forEach((option) => {
          if (options[option] === undefined || options[option] === null) {
            const opt = {};
            opt[option] = defaults[option];
            promises.push(browser.storage.local.set(opt));
          }
        });

        Object.keys(options).forEach((option) => {
          if (defaults[option] === undefined || defaults[option] === null) {
            promises.push(browser.storage.local.remove(option));
          }
        });

        await Promise.all(promises);
      }
    },

    /**
     * Converts options in a nested structure to a flat structure
     * @param {object} options the options to convert
     * @returns {object} the converted options
     */
    ConvertForStorage: function (options) {
      if (
        options === undefined ||
        options === null ||
        !Object.keys(options).length
      ) {
        return null;
      }

      const result = {};

      Object.keys(options).forEach((domain) => {
        Object.keys(options[domain]).forEach((name) => {
          result[`${domain}.${name}`] = options[domain][name];
        });
      });
      return result;
    },

    /**
     * Converts options in a flat structure to a nested structure
     * @param {object} options the options to convert
     * @returns {object} the converted options
     */
    ConvertFromStorage: function (options) {
      if (
        options === undefined ||
        options === null ||
        !Object.keys(options).length
      ) {
        return null;
      }

      const result = {};

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
     * @returns {Promise<*>} the value of an option from local storage
     */
    GetLocalOption: async function (domain, name) {
      const options = await this.GetLocalOptionsForDomain(domain);
      return options[name];
    },

    /**
     * Saves the value of an option to local storage
     * @param {string} domain the domain of the option
     * @param {string} name the name of the option
     */
    SetLocalOption: async function (domain, name, value) {
      const option = this.ConvertForStorage(
        Object.assign({}, { [domain]: { [name]: value } }),
      );

      await browser.storage.local.set(option);
    },

    /**
     * Returns all options (as an object) from local storage
     * @returns {Promise<object>}
     */
    GetLocalOptions: async function () {
      let options = await GetAllFromStorage("local");
      options = Object.assign({}, this.ConvertFromStorage(options));
      return options;
    },

    /**
     * Returns all options (as an object) for the specified domain from local storage
     * @param {string} domain the domain of the options
     * @returns {Promise<object>}
     */
    GetLocalOptionsForDomain: async function (domain) {
      let options = await this.GetLocalOptions();
      options = Object.assign({}, options[domain]);
      return options;
    },

    /**
     * Saves the options to local storage
     * @param {Promise<object>} options options (in a nested structure)
     */
    SetLocalOptionsForDomain: async function (domain, options) {
      options = this.ConvertForStorage(
        Object.assign({}, { [domain]: options }),
      );

      await browser.storage.local.set(options);
    },
  };

  return Options;
})();

export default Options;
