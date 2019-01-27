/* global process */
const env = process.env.NODE_ENV || 'development';

/* global require */
const gulp = require('gulp');

const pkg = require('./package.json');
const cfg = require('./gulp.config.json');

// additional native gulp packages
const fs = require('fs');
const path = require('path');

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');

// load all plugins from package development dependencies
const $ = require('gulp-load-plugins')({
    'scope': ['devDependencies'],
    'pattern': ['*'],
    'rename': {
        'ansi-colors': 'colors',
        'fancy-log': 'log',
        'merge-stream': 'merge',
        'rollup-stream': 'rollup',
        'vinyl-buffer': 'buffer',
        'vinyl-source-stream': 'source',
    },
    'postRequireTransforms': {
        'print': print => print.default,
        'uglify': uglify => require('gulp-uglify/composer')(require('uglify-es'), console)
    }
});



/* ==================== HELPER FUNCTIONS ==================== */

/**
 * Get the names of all immediate folders within the supplied directory
 * @param {string} dir  the path to the directory
 * @returns {string[]} the names of immediate folders within the directory
 */
function folders(dir) {
    return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
}

/**
 * Lints all JavaScript files within the supplied directory
 * @param {string} dir the path to the directory
 * @param {Boolean} [fix=true] indicates if eslint should attempt to fix errors
 * @param {Boolean} [failOnError=true] indicates if eslint should fail if there are any unfixed errors
 */
function lintJS(dir, fix = true, failOnError = true) {
    return $.pump([
        gulp.src(`${dir}/**/*.js`),
        $.eslint({
            'fix': fix
        }),
        $.eslint.format(),
        $.if(failOnError, $.eslint.failOnError()),
    ],
    err => { if (err) $.log.error(`${$.colors.red('Function Error [\'lint\']')}: ${err.message}`); });
}

/**
 * Lints all JSON files within the supplied directory
 * @param {string} dir the path to the directory
 * @param {Boolean} [failOnError=true] indicates if jsonlint should fail if there are any unfixed errors
 */
function lintJSON(dir, failOnError = true) {
    return $.pump([
        gulp.src(`${dir}/**/*.json`),
        $.jsonlint(),
        $.jsonlint.reporter(file => {
            $.log.error('File ' + file.path + ' is not valid JSON.');
        }),
        $.if(failOnError, $.jsonlint.failOnError()),
    ],
    err => { if (err) $.log.error(`${$.colors.red('Function Error [\'lint\']')}: ${err.message}`); });
}

/**
 * Returns a configuration object for webpack for the supplied directory
 * @param {string} dir the path to a directory
 * @returns {Object} a webpack config
 */
function getWebpackConfig(dir) {
    // NOTE: the webpack.config.js file contains basic configuration that does not require any dynamic values
    const config = require(`${dir}/webpack.config.${env}.js`);

    const entry = config.entry || {};
    const plugins = config.plugins || [];

    folders(dir).map((folder) => {
        const entryHTML = `${dir}/${folder}/${folder}.html`;
        const entryJS = `${dir}/${folder}/${folder}.js`;

        // define an entry point for each folder that has a matching .js and .html files
        if (fs.existsSync(entryJS) && fs.existsSync(entryHTML)) {
            entry[folder] = entryJS;

            // one html-webpack-plugin instance is needed for each entry point, as the plugin does not support template strings
            // (see: https://github.com/jantimon/html-webpack-plugin/issues/218#issuecomment-183066602)
            plugins.push(new HtmlWebpackPlugin({
                'template': entryHTML,
                'chunks': [folder],     // ensure this instance only builds when processing the corresponding folder's entry point
                'filename': `${folder}/${folder}.html`  // equivalent to '[name]/[name].html'
            }));

            // copy external/vendor files needed for each entry point
            if (fs.existsSync(`${dir}/${folder}/externals.js`)) {
                plugins.push(new HtmlWebpackExternalsPlugin({
                    'externals': require(`${dir}/${folder}/externals.js`),
                    'outputPath': '../vendor',
                    'publicPath': '../',
                    'files': [`${folder}/${folder}.html`]
                }));
            }
        }

    });

    return Object.assign(config, { 'entry': entry, 'plugins': plugins });
}



/* ====================  BUILD TASKS  ==================== */

gulp.task('minify', function minify() {
    return $.pump([
        $.merge([
            $.pump([
                gulp.src(['./dist/*/scripts/*.js']),
                $.uglify(cfg.plugin_options.uglify),
            ]),
        ]),
        $.header(fs.readFileSync('./src/banner.txt', 'utf8'), {
            'pkg': pkg
        }),
        gulp.dest('./dist')
    ],
    err => { if (err) $.log.error(`${$.colors.red('Task Error [\'minify\']')}: ${err.message}`); });
});


// ==========================================
// build & lint tasks, broken into components
// ==========================================

gulp.task('lint:helpers', function lint_helpers() {
    return lintJS(cfg.source_folders.helpers, true, (env === 'production'));
});


gulp.task('build:images', function build_images() {
    return $.pump([
        gulp.src([`${cfg.source_folders.images}/**/*.{png,svg}`]),
        ...Object.keys(cfg.supported_browsers).map(browser => gulp.dest(`./dist/${browser}/images`)),
    ],
    err => { if (err) $.log.error(`${$.colors.red('Task Error [\'build:images\']')}: ${err.message}`); });
});


/**
 * Creates multiple resized PNG versions of the SVG logo files
 */
gulp.task('build:logos', function build_logos() {
    //TODO: handle the icons/sizes defined in page_action.default_icon for Edge
    const manifest = JSON.parse(fs.readFileSync(`${cfg.source_folders.manifests}/manifest.shared.json`));
    const icons = manifest.icons;
    return $.merge(Object.keys(icons).map(size => {
        const file = path.basename(icons[size], '.png').replace(/\-\d+/, '');
        return $.pump([
            gulp.src([`${cfg.source_folders.images}/logo/${file}.svg`]),
            $.svg2png({
                'width': size,
                'height': size
            }),
            $.rename(icons[size]),  // the name includes the relative path structure (from the manifest to the icon)
            ...Object.keys(cfg.supported_browsers).map(browser => gulp.dest(`./dist/${browser}`)),
        ],
        err => { if (err) $.log.error(`${$.colors.red('Task Error [\'build:logos\']')}: ${err.message}`); });
    }));
});


gulp.task('build:locales', function build_locales() {
    return $.merge(folders(cfg.source_folders.locales).map(folder => {
        return $.pump([
            gulp.src([`${cfg.source_folders.locales}/${folder}/**/*.json`]),
            $.mergeJson({ 'fileName': 'messages.json' }),
            ...Object.keys(cfg.supported_browsers).map(browser => gulp.dest(`./dist/${browser}/_locales/${folder}`)),
        ],
        err => { if (err) $.log.error(`${$.colors.red('Task Error [\'build:locales\']')}: ${err.message}`); });
    }));
});

gulp.task('lint:manifest', function lint_manifest() {
    return lintJSON(cfg.source_folders.manifests, (env === 'production'));
});
gulp.task('build:manifest', gulp.series('lint:manifest', function build_manifest() {
    return $.merge(Object.keys(cfg.supported_browsers).map(browser => {
        return $.pump([
            gulp.src([
                `${cfg.source_folders.manifests}/manifest.shared.json`,
                `${cfg.source_folders.manifests}/manifest.${browser}.json`,
            ]),
            $.mergeJson({ 'fileName': 'manifest.json' }),
            $.ejs({ 'pkg': pkg }),
            gulp.dest(`./dist/${browser}`),
        ],
        err => { if (err) $.log.error(`${$.colors.red('Task Error [\'build:manifest\']')}: ${err.message}`); });
    }));
}));


gulp.task('lint:pages', function lint_pages() {
    return lintJS(cfg.source_folders.pages, true, (env === 'production'));
});
gulp.task('build:pages', gulp.series('lint:pages', function build_pages() {
    const config = getWebpackConfig(cfg.source_folders.pages);

    return $.pump([
        $.webpackStream(config, $.webpack),
        ...Object.keys(cfg.supported_browsers).map(browser => gulp.dest(`./dist/${browser}/pages`)),
    ],
    err => { if (err) $.log.error(`${$.colors.red('Task Error [\'build:pages\']')}: ${err.message}`); });
}));


gulp.task('lint:scripts', gulp.series('lint:helpers', function lint_scripts() {
    return lintJS(cfg.source_folders.scripts, true, (env === 'production'));
}));
gulp.task('build:scripts', gulp.series('lint:scripts', function build_scripts() {
    return $.merge(folders(cfg.source_folders.scripts).map(folder => {
        return $.pump([
            $.rollup({
                'input': `${cfg.source_folders.scripts}/${folder}/index.js`,
                'format': 'iife',
                'name': pkg.title.replace(/\s/g, '')
            }),
            $.source(folder + '.js'),
            $.buffer(),
            ...Object.keys(cfg.supported_browsers).map(browser => gulp.dest(`./dist/${browser}/scripts`)),
        ],
        err => { if (err) $.log.error(`${$.colors.red('Task Error [\'build:scripts\']')}: ${err.message}`); });
    }));
}));


// TODO: should this use gulp functionality instead (i.e. `gulp.src`, `gulp.dest`, etc.)?
// TODO: should this be a prerequisite for the 'build:scripts' task?
gulp.task('copy:scripts:vendor', gulp.series('build:manifest', function copy_scripts_vendor(done) {
    Object.keys(cfg.supported_browsers).map(browser => {
        const manifest = JSON.parse(fs.readFileSync(`./dist/${browser}/manifest.json`));
        let files = [];

        // get list of vendor files for content scripts
        manifest.content_scripts.forEach(script => {
            files = files.concat(files, script.js.filter(file => file.indexOf('vendor/') === 0));
        });

        // get list of vendor files for background scripts
        files = files.concat(files, manifest.background.scripts.filter(file => file.indexOf('vendor/') === 0));

        // de-duplicate the file list
        files = Array.from(new Set(files));
        //$.log.info(`Vendor Files (${browser}):\n\t- ` + files.join('\n\t- '));

        files.forEach(file => {
            const src = path.resolve(file.replace('vendor/', 'node_modules/'));
            const dest = path.resolve(`./dist/${browser}/${file}`);
            if (fs.existsSync(src) && !fs.existsSync(dest)) {
                //$.log.info(`Copying "${src}" to "${dest}"`);
                if (!fs.existsSync(path.dirname(dest))) {
                    fs.mkdirSync(path.dirname(dest), { 'recursive': true });
                }
                fs.copyFileSync(src, dest);
            }
        });
    });

    done();
}));


// ========================
// package/distribute tasks
// ========================
gulp.task('zip', function zip() {
    return $.merge(Object.keys(cfg.supported_browsers).map(browser => {
        return $.pump([
            gulp.src([`./dist/${browser}/**/*`, '!Thumbs.db']),
            $.zip(`${pkg.name}-${browser}.zip`),
            gulp.dest('./dist'),
        ],
        err => { if (err) $.log.error(`${$.colors.red('Task Error [\'zip\']')}: ${err.message}`); });
    }));
});


// =========================
// primary development tasks
// =========================

gulp.task('lint', gulp.parallel(
    'lint:helpers',
    'lint:pages',
    'lint:scripts'
));

gulp.task('build', gulp.parallel(
    'build:images',
    'build:logos',
    'build:locales',
    'build:manifest',
    'build:pages',
    'build:scripts',
    'copy:scripts:vendor'
));

gulp.task('watch', function watch(done) {
    // TODO: it would be nice to only rebuild the modified files per watch, but that requires a way to pass them to the build task
    gulp.watch(`${cfg.source_folders.images}/**/*.{png,svg}`, gulp.task('build:images'));
    gulp.watch(`${cfg.source_folders.images}/logo/*.svg`, gulp.task('build:logos'));
    gulp.watch(`${cfg.source_folders.locales}/**/*`, gulp.task('build:locales'));
    gulp.watch(`${cfg.source_folders.manifests}/**/*`, gulp.series('build:manifest', 'build:logos'));
    gulp.watch(`${cfg.source_folders.pages}/**/*`, gulp.task('build:pages'));
    gulp.watch([
        `${cfg.source_folders.helpers}/**/*.js`,
        `${ cfg.source_folders.scripts }/**/*.js`,
    ], gulp.task('build:scripts'));

    done();
});

gulp.task('build:development', gulp.task('build'));
gulp.task('build:production', gulp.series('build', 'minify'));

gulp.task('debug', gulp.series('build:development', 'watch'));

gulp.task('package', gulp.series('build:production', 'zip'));
