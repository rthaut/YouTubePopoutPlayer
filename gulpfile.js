var gulp = require('gulp');

var del = require('del');
var fs = require('fs');
var sequence = require('run-sequence');

var concat = require('gulp-concat');
var ejs = require("gulp-ejs")
var gulpIf = require('gulp-if');
var header = require('gulp-header');
var stripDebug = require('gulp-strip-debug');

var composer = require('gulp-uglify/composer');
var uglify = composer(require('uglify-es'), console);

var crx = require('gulp-crx-pack');
var zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// set to TRUE to enable console messages in JS output files
const DEBUG = false;

// all scripts directly contributing to the core deviantART Filter functionality
// order is important: base classes > custom filter classes > main class > index.js
var core = [
    './lib/js/HTML5Player.class.js',
    './lib/js/YouTubePopoutPlayer.class.js',
    './lib/js/index.js'
];

// load in package JSON as object for variables & EJS templates
var package = require('./package.json');



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
gulp.task('clean', [
    'clean:userscript',
    'clean:webextension'
]);

// task for building the userscript version
gulp.task('build:userscript', function () {
    return gulp.src(core)
        .pipe(gulpIf(!DEBUG, stripDebug()))
        .pipe(uglify({ mangle: false }))
        .pipe(concat(package.name.replace(/\-/g, '_') + '.user.js'))
        .pipe(header(fs.readFileSync('./banners/userscript.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/userscript'));
});

// tasks for building the WebExtension version
gulp.task('build:webextension:js', function () {
    return gulp.src(core)
        .pipe(concat(package.name + '.js'))
        .pipe(gulpIf(!DEBUG, stripDebug()))
        .pipe(uglify({ mangle: false }))
        .pipe(header(fs.readFileSync('./banners/webextension.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/webextension/js'));
});
gulp.task('build:webextension:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({ package: package }))
        .pipe(gulp.dest('./dist/webextension'));
});
gulp.task('build:webextension:icons', function () {
    return gulp.src(['./resources/icons/**/*.png'])
        .pipe(gulp.dest('./dist/webextension/icons'));
});
gulp.task('build:webextension', function (callback) {
    sequence(
        'clean:webextension',
        ['build:webextension:js', 'build:webextension:icons', 'build:webextension:manifest'],
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

// task for building everything
gulp.task('build', ['build:userscript', 'build:webextension']);

// default task: cleans and builds everything
gulp.task('default', function (callback) {
    sequence('clean', 'build', callback);
});
