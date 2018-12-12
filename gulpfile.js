/* global require */
const gulp = require('gulp');

// additional native gulp packages
const del = require('del');
const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');

// load all plugins from package development dependencies
const $ = require('gulp-load-plugins')({
    'scope': ['devDependencies'],
    'pattern': ['*'],
    'rename': {
        'gulp-browser-i18n-localize': 'localize',
        'gulp-if': 'gulpIf',
        'rollup-stream': 'rollup',
        'run-sequence': 'sequence',
        'vinyl-buffer': 'buffer',
        'vinyl-source-stream': 'source',
    },
    'postRequireTransforms': {
        'uglify': function (uglify) {
            return uglify = require('gulp-uglify/composer')(require('uglify-es'), console);
        }
    }
});



/* ==================== CONFIGURATION ==================== */

// vendor libraries needed for core functionality
const vendor = [
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
];

// default options for various plugins
const options = {
    // options for compressing JS files
    'uglify': {
        'compress': {
            'drop_console': true
        },
        'mangle': true,
        'output': {
            'comments': 'some'
        }
    }
};

const _folders = {
    'locales': './_locales',
    'scripts': './lib/scripts',
};



/* ==================== HELPER FUNCTIONS ==================== */

/**
 * Get the names of all immediate folders within the supplied directory
 * @param {string} dir - the path to the directory
 * @returns {string[]} - the names of immediate folders within the directory
 */
function folders(dir) {
    return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
}



/* ====================  BUILD TASKS  ==================== */

gulp.task('clean', () => {
    return del(['./dist/*'])
        .catch((error) => {
            console.error(error);
        });
});


// ==========================================
// build & lint tasks, broken into components
// ==========================================


gulp.task('build:locales', () => {
    return merge(folders(_folders.locales).map((folder) => {
        return $.pump([
            gulp.src(path.join(_folders.locales, folder, '**/*.json')),
            $.mergeJson({
                'fileName': 'messages.json'
            }),
            gulp.dest(path.join('./dist/webextension/_locales', folder)),
        ]);
    }));
});


/**
 * Creates multiple resized PNG versions of the SVG logo files
 */
gulp.task('build:logo', () => {
    const manifest = require('./manifest.json');
    const icons = manifest.icons;
    return merge(Object.keys(icons).map((size) => {
        return $.pump([
            gulp.src(['./resources/logo.svg']),
            $.svg2png({ 'width': size, 'height': size }),
            $.rename(icons[size]),
            gulp.dest('./dist/webextension'),
        ]);
    }));
});


gulp.task('build:manifest', () => {
    return $.pump([
        gulp.src(['./manifest.json']),
        $.ejs({
            'package': require('./package.json')
        }),
        $.rename('manifest.json'),
        gulp.dest('./dist/webextension'),
    ]);
});

gulp.task('build:options', () => {
    return $.pump([
        gulp.src(['./options.html', './options.js']),
        gulp.dest('./dist/webextension'),
    ])
});


gulp.task('lint:scripts', () => {
    return $.pump([
        gulp.src(path.join(_folders.scripts, '**/*.js')),
        $.eslint({
            'fix': true
        }),
        $.eslint.format(),
    ]);
});
gulp.task('build:scripts', ['lint:scripts'], () => {
    const package = require('./package.json');
    return merge(folders(_folders.scripts).map((folder) => {
        return $.pump([
            // use rollup to generate a single file from all of the includes
            $.rollup({
                'input': path.join(_folders.scripts, folder, 'index.js'),
                'format': 'iife',
                'name': package.title.replace(/\s/g, '')
            }),
            $.source(folder + '.js'),
            $.buffer(),

            // insert the header
            $.header(fs.readFileSync('./banners/webextension.txt', 'utf8'), {
                'package': package
            }),

            // output the non-minified version now
            gulp.dest('./dist/webextension/scripts'),

            // output the minified version appended with ".min"
            $.uglify(options.uglify),

            $.rename({
                'suffix': '.min'
            }),
            gulp.dest('./dist/webextension/scripts'),
        ]);
    }));
});


gulp.task('build:vendor', () => {
    return $.pump([
        gulp.src(vendor),
        gulp.dest('./dist/webextension/vendor'),
    ]);
});


// ========================
// package/distribute tasks
// ========================

gulp.task('dist:source', () => {
    return $.pump([
        gulp.src([
            './.vscode/**/*',
            './_locales/**/*',
            './banners/**/*',
            './lib/**/*',
            './resources/logo.svg',
            './.editorconfig',
            './.eslintrc.js',
            './LICENSE',
            './README.md',
            './gulpfile.js',
            './manifest.json',
            './package.json'
        ], {
            'base': './'
        }),
        $.zip('source.zip'),
        gulp.dest('./dist'),
    ]);
});

/**
 * Generates a userscript file from the built content.js file from the web extension
 * TODO: this is just kind of... odd. It might be better to make a "build:userscript" (based on "build:scripts") instead
 */
gulp.task('dist:userscript', () => {
    const package = require('./package.json');
    return $.pump([
        // use 2 streams to grab the web extension output files, then merge the streams
        merge(
            // grab the non-minified version from the web extension directory and rename it in the stream
            $.pump([
                gulp.src(['./dist/webextension/scripts/content.js']),
                $.rename({
                    'basename': package.name.replace(/\-/g, '_') + '.user',
                }),
            ]),
            // grab the minified version from the web extension directory and rename it in the stream
            $.pump([
                gulp.src(['./dist/webextension/scripts/content.min.js']),
                $.rename({
                    'basename': package.name.replace(/\-/g, '_') + '.user',
                    'suffix': '.min'
                }),
            ])
        ),

        // insert the header
        $.header(fs.readFileSync('./banners/userscript.txt', 'utf8'), {
            'package': package
        }),

        // replace the browser.i18n.getMessage() calls with the actual localized strings
        $.localize({
            'localesDir': './dist/webextension/_locales',
            'locales': ['en'],
            'schema': false
        }),

        gulp.dest('./dist/userscript'),
    ]);
});

gulp.task('dist:webextension', () => {
    const package = require('./package.json');
    return $.pump([
        gulp.src(['./dist/webextension/**/*', '!Thumbs.db']),
        $.zip(package.name + '.zip'),
        gulp.dest('./dist'),
    ]);
});


// =========================
// primary development tasks
// =========================

gulp.task('lint', [
    'lint:scripts',
]);

gulp.task('build', [
    'build:locales',
    'build:logo',
    'build:manifest',
    'build:scripts',
    'build:vendor',
    'build:options',
]);

gulp.task('dist', (callback) => {
    options.uglify.compress.drop_console = true;

    $.sequence('clean', 'build', 'dist:userscript', 'dist:webextension', callback);
});

gulp.task('watch', ['build'], () => {
    options.uglify.compress.drop_console = false;

    gulp.watch('./manifest.json', ['build:manifest']);
    gulp.watch('./resources/logo.svg', ['build:logo']);
    gulp.watch(path.join(_folders.locales, '/**/*'), ['build:locales']);
    gulp.watch(path.join(_folders.scripts, '/**/*.js'), ['build:scripts']);
});

// default task (alias build)
gulp.task('default', ['build']);
