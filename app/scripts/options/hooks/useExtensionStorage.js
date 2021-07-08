import React from "react";

import { useEffectOnce } from "react-use";

/**
 * Hook for using a single value from extension storage
 * @param {string} type the type of extension storage area
 * @param {string} key the key of the storage value
 * @returns {[*, function]} the specified storage value and a function to update its value
 */
export const useExtensionStorageSingle = (type, key = "") => {
  const [value, setValue] = React.useState(null);

  const onStorageChangedHandler = (changes, areaName) => {
    if (areaName !== type) {
      return;
    }

    if (Object.keys(changes).includes(key)) {
      setValue(changes[key].newValue);
    }
  };

  useEffectOnce(() => {
    browser.storage[type].get(key).then((data) => {
      setValue(Object.keys(data).includes(key) ? data[key] : undefined);
    });

    if (!browser.storage.onChanged.hasListener(onStorageChangedHandler)) {
      browser.storage.onChanged.addListener(onStorageChangedHandler);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onStorageChangedHandler)) {
        browser.storage.onChanged.removeListener(onStorageChangedHandler);
      }
    };
  });

  const saveValue = (newValue) =>
    browser.storage[type].set({ [key]: newValue });

  return [value, saveValue];
};

/**
 * Hook for using multiple values from extension storage
 * @param {string} type the type of extension storage area
 * @param {object|[string]} keys the keys of the storage value, either as an object or an array of strings
 * @returns {[*, function]} the specified storage values and a function to update their values
 */
export const useExtensionStorage = (type, keys = null) => {
  const [values, setValues] = React.useState(null);

  const onChangedHandler = (changes, areaName) => {
    if (areaName !== type) {
      return;
    }

    const newValues = {};
    for (let item of Object.keys(changes)) {
      newValues[item] = changes[item].newValue;
    }

    setValues((oldValues) => ({
      ...oldValues,
      ...newValues,
    }));
  };

  useEffectOnce(() => {
    browser.storage[type].get(keys).then(setValues);

    if (!browser.storage.onChanged.hasListener(onChangedHandler)) {
      browser.storage.onChanged.addListener(onChangedHandler);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onChangedHandler)) {
        browser.storage.onChanged.removeListener(onChangedHandler);
      }
    };
  });

  const saveValues = (newValues) => {
    browser.storage[type].set(newValues);
  };

  return [values, saveValues];
};
