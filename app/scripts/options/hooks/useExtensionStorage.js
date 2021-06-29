import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const useExtensionStorage = ({ type, key, initialValue = undefined }) => {
  const [value, setValue] = useState(null);

  const onChangedHandler = (changes, areaName) => {
    if (areaName === type && Object.keys(changes).includes(key)) {
      setValue(changes[key]?.newValue);
    }
  };

  const saveValue = (newValue) =>
    browser.storage[type]?.set({ [key]: newValue });

  useEffect(() => {
    browser.storage[type]?.get(key).then((data) => {
      setValue(data[key] ?? initialValue);
    });

    if (!browser.storage.onChanged.hasListener(onChangedHandler)) {
      browser.storage.onChanged.addListener(onChangedHandler);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onChangedHandler)) {
        browser.storage.onChanged.removeListener(onChangedHandler);
      }
    };
  }, []);

  return [value, saveValue];
};

useExtensionStorage.propTypes = {
  type: PropTypes.oneOf(["sync", "local", "managed"]).isRequired,
  key: PropTypes.string.isRequired,
  initialValue: PropTypes.any,
};

export default useExtensionStorage;
