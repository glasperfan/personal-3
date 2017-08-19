var gulp = require('gulp');
var ts = require('gulp-typescript');
const path = require('path');

const rootDir = path.join(__filename, '..', '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');
const serverDir = path.join(srcDir, 'server');
const whimServerDir = path.join(serverDir, 'whim');
const whimServerJSDir = path.join(whimServerDir, 'js');

const tsConfig = path.join(whimServerDir, 'tsconfig.json');
var tsProject = ts.createProject(tsConfig);

gulp.task('build-whim-server', function () {
  var tsFiles = path.join(whimServerDir, '*.ts');
  return gulp.src(path.join(tsFiles))
    .pipe(tsProject())
    .pipe(gulp.dest(whimServerJSDir));
});
