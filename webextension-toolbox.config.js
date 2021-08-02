/* global require */
const TerserPlugin = require("terser-webpack-plugin");

/* global module */
module.exports = {
  webpack: (config, { dev }) => {
    config.optimization = {
      ...config.optimization,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              pure_funcs: [
                // drop all console functions except errors
                "console.assert",
                "console.clear",
                "console.count",
                "console.countReset",
                "console.debug",
                "console.dir",
                "console.dirxml",
                //"console.error",
                //"console.exception",
                "console.group",
                "console.groupCollapsed",
                "console.groupEnd",
                "console.info",
                "console.log",
                "console.profile",
                "console.profileEnd",
                "console.table",
                "console.time",
                "console.timeEnd",
                "console.timeLog",
                "console.timeStamp",
                "console.trace",
                "console.warn",
              ],
            },
          },
        }),
      ],
    };

    return config;
  },
};
