var gulp        = require('gulp'),
    rjs         = require('requirejs'),
    clean       = require('gulp-clean'),
    livereload  = require('gulp-livereload'),
    watch       = require('gulp-watch'),
    server      = require('node-static'),
    runSequence = require('run-sequence'),
    less        = require('gulp-less');

function buildRequireJs (dev, callback) {
  rjs.optimize({
    baseUrl                : "src/scripts",
    include                : ['main'],
    insertRequire          : ['main'],
    findNestedDependencies : true,
    preserveLicenseComments: false,
    generateSourceMaps     : dev,
    optimize               : dev ? 'none' : 'uglify2',
    mainConfigFile         : "src/scripts/require-config.js",
    name                   : "../vendor/almond/almond",
    out                    : "build/scripts/sx-editor.js"
  }, function () {
    callback();
  }, callback);
}

/**
 * Less task.
 */
gulp.task('less', function () {
  return gulp.src('src/styles/main.less')
    .pipe(less())
    .pipe(gulp.dest('build/styles'));
});

/**
 * Static server for dev.
 */
gulp.task('server', function () {
  var file = new server.Server('./build', {
    headers: {"Access-Control-Allow-Origin": "*"}
  });

  require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response);
    }).resume();
  }).listen(8002);
});

/**
 * Copy fonts for fontawesome
 */
gulp.task('fontawesome', function () {
  return gulp.src('src/vendor/font-awesome/fonts/**').pipe(gulp.dest('build/fonts'));
});

/**
 * Clean build directory.
 */
gulp.task('clean', function () {
  return gulp.src('build', {read: false}).pipe(clean());
});

/**
 * Watch for changes.
 */
gulp.task('watch', function () {
  gulp.watch('src/scripts/**', ['requirejs.dev']);
  gulp.watch('src/templates/**', ['requirejs.dev']);
  gulp.watch('src/styles/**', ['less']);

  livereload.listen();
  gulp.watch('build/**').on('change', livereload.changed);
});

gulp.task('requirejs.dev', function (callback) {
  buildRequireJs(true, callback);
});

gulp.task('requirejs.prod', function (callback) {
  buildRequireJs(false, callback);
});

gulp.task('build', function (callback) {
  runSequence(
    'clean',
    ['less', 'requirejs.prod', 'fontawesome'],
    callback
  );
});

gulp.task('dev', function (callback) {
  runSequence(
    'clean',
    ['less', 'requirejs.dev', 'fontawesome'],
    ['watch', 'server'],
    callback
  );
});

gulp.task('default', ['dev']);
