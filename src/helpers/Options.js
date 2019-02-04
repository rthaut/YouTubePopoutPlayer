import { OPTION_DEFAULTS } from '../helpers/constants';

const Options = (() => {

    const Options = {

        /**
         * Resets all options in local storage to their default values
         * @param {boolean} [reset=false] indicates if local storage should be reset
         * @returns {Promise}
         */
        'InitLocalStorageDefaults': function (reset = false) {
            console.log('Options.InitDefaults()');

            const defaults = this.ConvertForStorage(Object.assign({}, OPTION_DEFAULTS));

            if (reset) {
                console.log('Options.InitDefaults() :: Setting all options to default values', defaults);
                return browser.storage.local.clear().then(() => {
                    return browser.storage.local.set(defaults);
                });
            } else {
                return browser.storage.local.get().then((options) => {
                    const promises = [];
                    Object.keys(defaults).forEach(option => {
                        if (options[option] === undefined || options[option] === null) {
                            console.log(`Options.InitDefaults() :: Setting "${option}" to default value`, defaults[option]);

                            const opt = {};
                            opt[option] = defaults[option];
                            promises.push(browser.storage.local.set(opt));
                        }
                    });

                    Object.keys(options).forEach(option => {
                        if (defaults[option] === undefined || defaults[option] === null) {
                            console.log(`Options.InitDefaults() :: Removing unknown option "${option}"`);

                            promises.push(browser.storage.local.remove(option));
                        }
                    });

                    return Promise.all(promises);
                });
            }
        },

        /**
         * Converts options in a nested structure to a flat structure
         * @param {Object} options the options to convert
         * @returns {Object} the converted options
         */
        'ConvertForStorage': function (options) {
            console.log('Options.ConvertForStorage()', options);

            if (options === undefined || options === null || !Object.keys(options).length) {
                console.log('Options.ConvertForStorage() :: Return', null);
                return null;
            }

            const result = {};

            Object.keys(options).forEach(domain => {
                Object.keys(options[domain]).forEach(opt => {
                    result[`${domain}.${opt}`] = options[domain][opt];
                });
            });

            console.log('Options.ConvertForStorage() :: Return', result);
            return result;
        },

        /**
         * Converts options in a flat structure to a nested structure
         * @param {Object} options the options to convert
         * @returns {Object} the converted options
         */
        'ConvertFromStorage': function (options) {
            console.log('Options.ConvertFromStorage()', options);

            if (options === undefined || options === null || !Object.keys(options).length) {
                console.log('Options.ConvertFromStorage() :: Return', null);
                return null;
            }

            const result = {};

            var domain, opt;
            Object.keys(options).forEach(option => {
                if (option.includes('.')) {
                    // handle options should be stored in the format [domain].[key]
                    [domain, opt] = option.split('.');

                    if (result[domain] === undefined) {
                        result[domain] = {};
                    }

                    result[domain][opt] = options[option];
                } else {
                    // handle options that don't have a domain
                    result[option] = options[option];
                }
            });

            console.log('Options.ConvertFromStorage() :: Return', result);
            return result;
        },

        /**
         * Returns the value of an option from local storage
         * @param {string} domain the domain of the option
         * @param {string} name the name of the option
         * @returns {*}
         */
        'GetLocalOption': async function (domain, name) {
            console.log('Options.GetLocalOption()', domain, name);

            const key = `${domain}.${name}`;
            const option = await browser.storage.local.get(key);

            console.log('Options.GetLocalOption() :: Return', option[key]);
            return option[key];
        },

        /**
         * Returns all options (as an object) for the specified domain from local storage
         * @param {string} domain the domain of the options
         * @returns {Object}
         */
        'GetLocalOptionsForDomain': async function (domain) {
            console.log('Options.GetLocalOptionsForDomain()', domain);

            let options;

            options = await browser.storage.local.get();
            options = Object.assign({}, this.ConvertFromStorage(options));
            options = Object.assign({}, options[domain]);

            console.log('Options.GetLocalOptionsForDomain() :: Return', options);
            return options;
        },

        /**
         * Saves the options to local storage
         * @param {Object} options options (in a nested structure)
         * @returns {Promise}
         */
        'SetLocalOptions': function (options, convertForStorage = true) {
            console.log('Options.SetLocalOptions()', options);

            if (convertForStorage) {
                options = this.ConvertForStorage(Object.assign({}, options));
            }

            return browser.storage.local.set(options);
        }

        // TODO: create helper method for saving an option to storage? maybe multiple methods for both structures?
    };

    return Options;

})();

export default Options;
