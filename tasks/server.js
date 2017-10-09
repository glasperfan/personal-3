var gulp = require('gulp');
var gulpFn = require('gulp-fn');
var ts = require('gulp-typescript');
var textTransformation = require('gulp-text-simple');
var sourcemaps = require('gulp-sourcemaps');
var gulpMocha = require('gulp-mocha');
const path = require('path');
var exec = require('child_process').exec;

const rootDir = path.join(__filename, '..', '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');
const appDir = path.join(srcDir, 'app');
const whimAppDir = path.join(appDir, 'whim');
const whimAppModelsDir = path.join(whimAppDir, 'models');
const serverDir = path.join(srcDir, 'server');
const whimServerDir = path.join(serverDir, 'whim');
const whimServerSrcDir = path.join(whimServerDir, 'src');
const whimServerTestDir = path.join(whimServerDir, 'test');
const whimServerDistDir = path.join(whimServerDir, 'dist');
const whimServerModelsDir = path.join(whimServerSrcDir, 'models');

const tsConfig = path.join(whimServerDir, 'tsconfig.json');
var tsProjectServer = ts.createProject(tsConfig);
var tsProjectTest = ts.createProject(tsConfig);

gulp.task('build-whim-server', function () {
  var tsFiles = path.join(whimServerSrcDir, '**/*.ts');
  return gulp.src(tsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProjectServer())
    .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '..\src' }))
    .pipe(gulp.dest(whimServerDistDir));
});

gulp.task('apigen', function () {
  var tsFiles = path.join(whimServerModelsDir, '**/*.ts');
  return gulp.src(tsFiles).pipe(gulp.dest(whimAppModelsDir))
});

gulp.task('build-whim-server-for-tests', function () {
  var tsFiles = path.join(whimServerSrcDir, '**/*.ts');
  return gulp.src(tsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProjectServer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(whimServerSrcDir));
});

gulp.task('build-whim-tests', function () {
  var tsFiles = path.join(whimServerTestDir, '**/*.ts');
  return gulp.src(tsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProjectTest())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(whimServerTestDir))
});

gulp.task('run-unit-tests', function () {
  exec('mocha "**/*.js" --colors --reporter=spec', { cwd: whimServerTestDir }, (err, stdout, stderr) => { console.log(stdout); });
});
