/* global require */
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require("webpack");

/* global module */
module.exports = {
  webpack: (config, { dev, vendor }) => {
    // copy the static declarativeNetRequest rule files
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [{
          from: 'rules*.json',
          to: config.target
        }]
      })
    );

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
