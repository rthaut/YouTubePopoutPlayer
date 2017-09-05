var gulp = require('gulp');

var del = require('del');
var fs = require('fs');
var merge = require('merge-stream');
var sequence = require('run-sequence');

var concat = require('gulp-concat');
var ejs = require("gulp-ejs")
var gulpIf = require('gulp-if');
var header = require('gulp-header');
var localize = require('gulp-browser-i18n-localize');

var composer = require('gulp-uglify/composer');
var uglify = composer(require('uglify-es'), console);

var crx = require('gulp-crx-pack');
var zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// set to TRUE to enable console messages in JS output files
const DEBUG = false;

// all scripts directly contributing to the core YouTube Popout Player functionality
// order is important: base classes > index.js
var core = [
    './lib/js/HTML5Player.class.js',
    './lib/js/YouTubePopoutPlayer.class.js',
    './lib/js/index.js'
];

// additional scripts used by YouTube Popout Player
var includes = [
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
];

// load in package JSON as object for variables & EJS templates
var package = require('./package.json');

// default options for various plugins
var options = {
    // uglify options for all non-minified JS files
    uglify: {
        compress: {
            drop_console: !DEBUG
        },
        mangle: false,
        output: {
            beautify: true,
            bracketize: true
        }
    }
};



/* ====================  BUILD TASKS  ==================== */


// tasks for cleaning the build directories
gulp.task('clean:userscript', function () {
    return del(['./dist/userscript/*'])
        .catch(function (error) {
            console.warn(error)
        });
});
gulp.task('clean:webextension', function () {
    return del(['./dist/webextension/*'])
        .catch(function (error) {
            console.warn(error)
        });
});

// task for building the userscript version
gulp.task('build:userscript', ['clean:userscript'], function () {
    return gulp.src(core)
        .pipe(localize({ schema: false }))
        .pipe(uglify(options.uglify))
        .pipe(concat(package.name.replace(/\-/g, '_') + '.user.js'))
        .pipe(header(fs.readFileSync('./banners/userscript.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/userscript'));
});

// tasks for building the WebExtension version
gulp.task('build:webextension:js', function () {
    return merge(
        gulp.src(includes)
            .pipe(gulpIf('!*.min.js', uglify({ mangle: false }))),
        gulp.src(core)
            .pipe(concat(package.name + '.js'))
            .pipe(uglify(options.uglify))
            .pipe(header(fs.readFileSync('./banners/webextension.txt', 'utf8'), { package: package }))
    )
        .pipe(gulp.dest('./dist/webextension/js'));
});
gulp.task('build:webextension:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({ package: package }))
        .pipe(gulp.dest('./dist/webextension'));
});
gulp.task('build:webextension:locales', function () {
    return gulp.src(['./locales/**/*.json'])
        .pipe(gulp.dest('./dist/webextension/_locales'));
});
gulp.task('build:webextension:icons', function () {
    return gulp.src(['./resources/icons/**/*.png'])
        .pipe(gulp.dest('./dist/webextension/icons'));
});
gulp.task('build:webextension', ['clean:webextension'], function (callback) {
    sequence(
        ['build:webextension:js', 'build:webextension:icons', 'build:webextension:locales', 'build:webextension:manifest'],
        ['zip:webextension', 'crx:webextension'],
        callback
    );
});

// tasks for packaging the WebExtension for distribution
gulp.task('zip:webextension', function (callback) {
    return gulp.src(['./dist/webextension/**/*', '!Thumbs.db'])
        .pipe(zip(package.name + '.zip'))
        .pipe(gulp.dest('./dist'))
});
gulp.task('crx:webextension', function () {
    return gulp.src(['./dist/webextension', '!Thumbs.db'])
        .pipe(crx({
            privateKey: fs.readFileSync('./certs/' + package.name + '.pem', 'utf8'),
            filename: package.name + '.crx'
        }))
        .pipe(gulp.dest('./dist'))
});

// task for cleaning everything
gulp.task('clean', ['clean:userscript', 'clean:webextension']);

// task for building everything
gulp.task('build', ['build:userscript', 'build:webextension']);

// default task: alias gulp:build
gulp.task('default', ['build']);
