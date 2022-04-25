import create from "zustand";

import { OPTION_DEFAULTS } from "../../helpers/constants";
import Options from "../../helpers/options";

export const STORAGE_TYPE = "local";

export const createOptionsStore = (type) => {
  const options = Options.ConvertForStorage(OPTION_DEFAULTS);

  // NOTES:
  // 1.) Currently options do not have getters, though that could be a useful/necessary enhancement in the future.
  //      Instead, options are read directly from state as direct properties on the state object (per Zustand standards).
  //      This requires:
  //        a) Setting the initial values in state synchronously (by using hard-coded defaults)
  //        b) Loading the values from extension storage (async) and setting them into state when the store is first created
  //      The major drawback to this approach is that IF the options are set/changed from outside of this store,
  //      the React App will become out of sync until a manual page reload occurs.
  //      This would be an issue when the Options page is open AND extension storage is updated from some other source,
  //      like the background script setting/resetting options programmatically,
  //      or in the future if we make the synchronize the options between browsers
  // 2.) Do NOT manipulate state without also updating the extension storage (use `setOption()` or `setOptions()`).
  //      Anything that functions as a setter for a value in state needs to use `browser.storage[type].set`,
  //      otherwise the change won't actually go into storage and thus won't be used by the extension's scripts.
  // 3.) This does NOT use Zustand's "persist" middleware (which can be pointed to extension storage quite easily),
  //      as that would persist the entire state as a single object in one entry within extension storage,
  //      rather than persisting each property of state into its own individual storage entry, which is what we need.

  const store = create((set) => {
    /**
     * Resets all options to their defaults, both in the store/state and in extension storage
     */
    const reset = async () => {
      await Options.InitLocalStorageDefaults(true);
      set(options);
    };

    /**
     * Sets an option's value, both in the store/state and in extension storage
     * @param {string} domain the option's domain
     * @param {string} name the name of the option
     * @param {*} value the value of the option
     */
    const setOption = async (domain, name, value) => {
      await browser.storage[type].set({ [`${domain}.${name}`]: value });
      set((state) => ({
        ...state,
        [`${domain}.${name}`]: value,
      }));
    };

    /**
     * Sets multiple options (from an object), both in the store/state and in extension storage
     * @param {object} options the options to set
     */
    const setOptions = async (options) => {
      options = Options.ConvertForStorage(options);
      await browser.storage[type].set(options);
      set((state) => ({
        ...state,
        ...options,
      }));
    };

    return {
      ...options,
      reset,
      setOption,
      setOptions,
    };
  });

  // load the values from storage asynchronously and populate them into the store/state
  // NOTE: this does NOT use a defined setter, as we don't need to update extension storage
  browser.storage[type].get(options).then(store.setState);

  // do NOT await loading of the values from storage; we want that to happen in the background
  return store;
};

const useOptionsStore = createOptionsStore(STORAGE_TYPE);

/**
 * Hook for getting and setting options within a specified domain
 * @param {string} domain the domain of the options
 * @returns {[object, object]} the options (with values) and setter methods for setting one or multiple options
 */
export const useOptionsForDomain = (domain) => {
  // this gets all the options from the store/state,
  // then filters down to just the ones for the given domain,
  // then removes the domain prefix from each key,
  // resulting in an object with just the option names and values
  const options = useOptionsStore((state) =>
    Object.fromEntries(
      Object.entries(state)
        .filter(([key]) => key.startsWith(domain + "."))
        .map(([key, value]) => [key.replace(domain + ".", ""), value])
    )
  );

  // set note #2 above - these wrapper methods must use the custom methods from the created store/state,
  // rather than the `useOptionsStore.setState()` method (which would NOT commit the changes to extension storage).
  const setOptionInState = useOptionsStore((state) => state.setOption);
  const setOptionsInState = useOptionsStore((state) => state.setOptions);
  const setOptionForDomain = (name, value) =>
    setOptionInState(domain, name, value);
  const setOptionsForDomain = (options) =>
    setOptionsInState({ [domain]: options });

  return [
    options,
    { setOption: setOptionForDomain, setOptions: setOptionsForDomain },
  ];
};

/**
 * Hook for getting and setting the value of an option
 * @param {string} domain the domain of the option
 * @param {string} name the name of the option
 * @returns {[*, function]} the option's value and a setter method
 */
export const useOption = (domain, name) => {
  const value = useOptionsStore((state) => state[`${domain}.${name}`]);
  const setOption = useOptionsStore((state) => state.setOption);

  // set note #2 above - this wrapper method must use the custom method from the created store/state,
  // rather than the `useOptionsStore.setState()` method (which would NOT commit the changes to extension storage).
  const setValue = (value) => setOption(domain, name, value);

  return [value, setValue];
};

export default useOptionsStore;
