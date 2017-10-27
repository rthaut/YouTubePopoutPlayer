/* global require */
const gulp = require('gulp');

const del = require('del');
const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');
const sequence = require('run-sequence');

const concat = require('gulp-concat');
const ejs = require('gulp-ejs');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');
const header = require('gulp-header');
const localize = require('gulp-browser-i18n-localize');

const composer = require('gulp-uglify/composer');
const uglify = composer(require('uglify-es'), console);

const crx = require('gulp-crx-pack');
const zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// vendor libraries needed for core functionality
const vendor = [
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
];

// additional includes (custom libraries, classes, etc.)
const includes = [

];

// load in package JSON as object for variables & EJS templates
const package = require('./package.json');

// default options for various plugins
const options = {
    // options for compiling LESS to CSS
    'less': {
        'paths': 'node_modules',
        'outputStyle': 'compressed',
        'sourceMap': false
    },
    // options for compressing JS files
    'uglify': {
        'compress': {
            'drop_console': true
        },
        'mangle': true
    }
};

const _folders = {
    'locales': './_locales',
    'scripts': './lib/scripts'
};



/* ====================  BUILD TASKS  ==================== */


// tasks for cleaning the build directories
gulp.task('clean:userscript', function () {
    return del(['./dist/userscript/*'])
        .catch(function (error) {
            console.warn(error);
        });
});
gulp.task('clean:webextension', function () {
    return del(['./dist/webextension/*'])
        .catch(function (error) {
            console.warn(error);
        });
});

//task for linting the script files
gulp.task('lint:scripts', function () {
    return gulp.src(path.join(_folders.scripts, '**/*.js'))
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format());
});

// task for building the userscript version
gulp.task('build:userscript', function () {
    return gulp.src(path.join(_folders.scripts, '**/*.js'))
        .pipe(uglify(options.uglify))
        .pipe(concat(package.name.replace(/\-/g, '_') + '.user.js'))
        .pipe(header(fs.readFileSync('./banners/userscript.txt', 'utf8'), {
            'package': package
        }))
        .pipe(localize({
            'schema': '/$locale/$filename.$ext'
        }))
        .pipe(gulp.dest('./dist/userscript'));
});

// tasks for building the WebExtension version
gulp.task('build:webextension:scripts', ['lint:scripts'], function () {
    return merge(
            gulp.src(includes)
            .pipe(gulpIf('!*.min.js', uglify({
                'mangle': false
            }))),
            gulp.src(path.join(_folders.scripts, '**/*.js'))
            .pipe(concat(package.name + '.js'))
            .pipe(uglify(options.uglify))
            .pipe(header(fs.readFileSync('./banners/webextension.txt', 'utf8'), {
                'package': package
            }))
        )
        .pipe(gulp.dest('./dist/webextension/scripts'));
});
gulp.task('build:webextension:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({
            'package': package
        }))
        .pipe(gulp.dest('./dist/webextension'));
});
gulp.task('build:webextension:locales', function () {
    return gulp.src(['./_locales/**/*.json'])
        .pipe(gulp.dest('./dist/webextension/_locales'));
});
gulp.task('build:webextension:logo', function () {
    return gulp.src(['./resources/logo.svg'])
        .pipe(gulp.dest('./dist/webextension'));
});
gulp.task('build:webextension', function (callback) {
    sequence(
        ['build:webextension:scripts', 'build:webextension:logo', 'build:webextension:locales', 'build:webextension:manifest'], ['zip:webextension', 'crx:webextension'],
        callback
    );
});

gulp.task('build:vendor', function () {
    return gulp.src(vendor)
        .pipe(gulp.dest('./dist/vendor'));
});

// tasks for packaging the WebExtension for distribution
gulp.task('zip:webextension', function () {
    return gulp.src(['./dist/webextension/**/*', '!Thumbs.db'])
        .pipe(zip(package.name + '.zip'))
        .pipe(gulp.dest('./dist'));
});
gulp.task('crx:webextension', function () {
    return gulp.src(['./dist/webextension', '!Thumbs.db'])
        .pipe(crx({
            'privateKey': fs.readFileSync('./certs/' + package.name + '.pem', 'utf8'),
            'filename': package.name + '.crx'
        }))
        .pipe(gulp.dest('./dist'));
});

// task to rebuild everything on changes to core files
gulp.task('watch', ['build'], function () {
    options.uglify.drop_console = false;
    return gulp.watch(path.join(_folders.scripts, '**/*.*'), ['build']);
});

// task to rebuild the userscript version on changes to core files
gulp.task('watch:userscript', ['build:userscript'], function () {
    return gulp.watch(path.join(_folders.scripts, '**/*.*'), ['build:userscript']);
});

// task to rebuild the WebExtension version on changes to core files
gulp.task('watch:webextension', ['build:webextension'], function () {
    return gulp.watch(path.join(_folders.scripts, '**/*.*'), ['build:webextension']);
});

// task for cleaning everything
gulp.task('clean', ['clean:userscript', 'clean:webextension']);

// task for building everything
gulp.task('build', ['build:userscript', 'build:webextension']);

// default task: cleans and builds everything
gulp.task('default', function (callback) {
    sequence('clean', 'build', callback);
});
