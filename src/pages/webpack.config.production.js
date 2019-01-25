/* eslint-env node */
const merge = require('webpack-merge');
const common = require('./webpack.config.common.js');

const uglifyOptions = require('../../gulp.config.json').plugin_options.uglify;

const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    'mode': 'production',
    'devtool': 'none',
    'optimization': {
        'minimizer': [
            new TerserPlugin({
                'terserOptions': uglifyOptions
            }),
        ],
    }
});
