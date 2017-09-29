var gulp = require('gulp');
var gulpFn = require('gulp-fn');
var ts = require('gulp-typescript');
var textTransformation = require('gulp-text-simple');
var sourcemaps = require('gulp-sourcemaps');
const path = require('path');

const rootDir = path.join(__filename, '..', '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');
const appDir = path.join(srcDir, 'app');
const whimAppDir = path.join(appDir, 'whim');
const whimAppModelsDir = path.join(whimAppDir, 'models');
const serverDir = path.join(srcDir, 'server');
const whimServerDir = path.join(serverDir, 'whim');
const whimServerSrcDir = path.join(whimServerDir, 'src')
const whimServerDistDir = path.join(whimServerDir, 'dist');
const whimServerModelsDir = path.join(whimServerSrcDir, 'models');

const tsConfig = path.join(whimServerDir, 'tsconfig.json');
var tsProject = ts.createProject(tsConfig);

gulp.task('build-whim-server', function () {
  var tsFiles = path.join(whimServerSrcDir, '**/*.ts');
  return gulp.src(tsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('../src'))
    .pipe(gulp.dest(whimServerDistDir));
});

gulp.task('apigen', function () {
  var tsFiles = path.join(whimServerModelsDir, '**/*.ts');
  return gulp.src(tsFiles).pipe(gulp.dest(whimAppModelsDir))
});
