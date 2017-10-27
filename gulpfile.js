/* global require */
const gulp = require('gulp');
const rollup = require('rollup-stream');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const del = require('del');
const fs = require('fs');
const path = require('path');
const sequence = require('run-sequence');

const concat = require('gulp-concat');
const ejs = require('gulp-ejs');
const eslint = require('gulp-eslint');
const folders = require('gulp-folders');
const gulpIf = require('gulp-if');
const header = require('gulp-header');
const localize = require('gulp-browser-i18n-localize');
const rename = require('gulp-rename');

const composer = require('gulp-uglify/composer');
const uglify = composer(require('uglify-es'), console);

const crx = require('gulp-crx-pack');
const zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// additional includes (custom libraries, classes, etc.)
const includes = [
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
];

// load in package JSON as object for variables & EJS templates
const package = require('./package.json');

// default options for various plugins
const options = {
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

gulp.task('clean', function () {
    return del(['./dist/*'])
        .catch(function (error) {
            console.warn(error);
        });
});


// ==========================================
// build & lint tasks, broken into components
// ==========================================

gulp.task('build:includes', function () {
    return gulp.src(includes)
        .pipe(gulp.dest('./dist/webextension/scripts'));
});


gulp.task('build:locales', function () {
    return gulp.src(path.join(_folders.locales, '/**/*.json'))
        .pipe(gulp.dest('./dist/webextension/_locales'));
});


gulp.task('build:logo', function () {
    return gulp.src(['./resources/logo.svg'])
        .pipe(gulp.dest('./dist/webextension'));
});


gulp.task('build:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({
            'package': package
        }))
        .pipe(gulp.dest('./dist/webextension'));
});


gulp.task('lint:scripts', function () {
    return gulp.src(path.join(_folders.scripts, '**/*.js'))
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format());
});
gulp.task('build:scripts', ['lint:scripts'], folders(_folders.scripts, function (folder) {
    return rollup({
            'input': path.join(_folders.scripts, folder, 'index.js'),
            'format': 'iife',
            'name': package.title.replace(/\s/g, ''),
        })
        .pipe(source(folder + '.js'))
        .pipe(buffer())
        .pipe(uglify(options.uglify))
        .pipe(header(fs.readFileSync('./banners/webextension.txt', 'utf8'), {
            'package': package
        }))
        .pipe(gulp.dest('./dist/webextension/scripts'));
}));

// task for building a userscript
gulp.task('build:userscript', ['build:scripts'], function () {
    return gulp.src('./dist/webextension/scripts/content.js')
        .pipe(rename(package.name.replace(/\-/g, '_')))
        .pipe(header(fs.readFileSync('./banners/userscript.txt', 'utf8'), {
            'package': package
        }))
        .pipe(localize({
            'locales': ['en'],
            'schema': false
        }))
        .pipe(gulp.dest('./dist/userscript'));
});


// ========================
// package/distribute tasks
// ========================

gulp.task('zip', function (callback) {
    return gulp.src(['./dist/webextension/**/*', '!Thumbs.db'])
        .pipe(zip(package.name + '.zip'))
        .pipe(gulp.dest('./dist'));
});
gulp.task('crx', function () {
    return gulp.src(['./dist/webextension/chrome', '!Thumbs.db'])
        .pipe(crx({
            'privateKey': fs.readFileSync('./certs/' + package.name + '.pem', 'utf8'),
            'filename': package.name + '.crx'
        }))
        .pipe(gulp.dest('./dist'));
});


// =========================
// primary development tasks
// =========================

gulp.task('lint', function (callback) {
    sequence(
        ['lint:components', 'lint:helpers', 'lint:pages', 'lint:scripts'],
        callback
    );
});

gulp.task('build', ['clean'], function (callback) {
    sequence(
        ['build:logo', 'build:locales', 'build:manifest'],
        ['build:includes', 'build:scripts'],
        ['build:userscript'],
        ['zip', 'crx'],
        callback
    );
});

gulp.task('watch', ['build'], function () {
    options.uglify.compress.drop_console = false;

    gulp.watch(includes, ['build:includes']);
    gulp.watch(path.join(_folders.locales, '/**/*.json'), ['build:locales']);
    gulp.watch('./manifest.json', ['build:manifest']);
    gulp.watch(path.join(_folders.scripts, '/**/*.js'), ['build:scripts', 'build:userscript']);
});

// default task (alias build)
gulp.task('default', ['build']);
