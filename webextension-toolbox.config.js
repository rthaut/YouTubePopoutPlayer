/* global require */
const webpack = require("webpack");

/* global module */
module.exports = {
  webpack: (config, { vendor }) => {
    // TODO: it would be nice to drop the polyfill, but it seems chrome still only recognizes the `chrome` namespace...
    if (["chrome", "opera", "edge"].includes(vendor)) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          browser: "webextension-polyfill",
        })
      );
    }

    return config;
  },
};
