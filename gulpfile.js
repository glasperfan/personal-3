var gulp = require('gulp');
var ts = require('gulp-typescript');
const path = require('path');
require('require-dir')('./tasks');

gulp.task('default', ['build-whim-server']);
