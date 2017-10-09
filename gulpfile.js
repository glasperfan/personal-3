var gulp = require('gulp');
var ts = require('gulp-typescript');
const path = require('path');
require('require-dir')('./tasks');

gulp.task('default', ['build-whim-server']);
gulp.task('test', ['build-test', 'run-unit-tests']);
gulp.task('build-test', ['build-whim-server-for-tests', 'build-whim-tests']);
