import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass';
import clean from 'gulp-clean';
import fs from 'fs';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import pug from 'gulp-pug';
import autoprefixer from 'gulp-autoPrefixer';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import browserSync from 'browser-sync';

import fonter from 'gulp-fonter-2';
import ttf2woff2 from 'gulp-ttf2woff2';

const sass = gulpSass(dartSass);

const pathSrc = './src';
const pathDest = './build';
const path = {
  root: pathDest,
  html: {
    src: pathSrc + '/*.html',
    watch: pathSrc + '/**/*.html',
    dest: pathDest,
  },
  pug: {
    src: pathSrc + '/pug/*.pug',
    watch: pathSrc + '/pug/**/*.pug',
    dest: pathDest,
  },
  sass: {
    src: pathSrc + '/sass/*.{sass,scss}',
    watch: pathSrc + '/sass/**/*.{sass,scss}',
    dest: pathDest + '/css',
  },
  fonts: {
    src: pathSrc + '/fonts/*.{eot,otf,ttf,woff,woff2,svg}',
    srcTTF: pathSrc + '/fonts/*.ttf',
    watch: pathSrc + '/fonts/*.*',
    dest: pathDest + '/fonts',
  },
  img: {
    src: pathSrc + '/img/*.{png,jpg,jpeg,gif,svg}',
    srcIcons: pathSrc + '/img/icons/*.{png,gif,svg}',
    watch: pathSrc + '/img/**/*.{png,jpg,jpeg,gif,svg}',
    dest: pathDest + '/img',
  },
  sprites: {
    src: pathSrc + '/img/icons/sprites/*.svg',
    watch: pathSrc + '/img/icons/sprites/**/*.svg',
    dest: pathDest + '/img/icons/sprites',
  },
  files: {
    src: pathSrc + '/files/**/*',
    watch: pathSrc + '/files/**/*',
    dest: pathDest + '/files',
  }
};

const fileIncludeSetting = {
  prefix: '@@',
  basepath: '@file'
};

const plumberSassConfig = {
  errorHandler: notify.onError(error => ({
    title: 'SASS',
    message: error.message,
    sound: false,
  })),
};

const plumberHtmlConfig = {
  errorHandler: notify.onError(error => ({
    title: 'HTML',
    message: error.message,
    sound: false,
  })),
};

const plumberPugConfig = {
  errorHandler: notify.onError(error => ({
    title: 'PUG',
    message: error.message,
    sound: false,
  })),
};

const plumberImgConfig = {
  errorHandler: notify.onError(error => ({
    title: 'IMG',
    message: error.message,
    sound: false,
  })),
};

const plumberSpriteConfig = {
  errorHandler: notify.onError(error => ({
    title: 'SPRITE',
    message: error.message,
    sound: false,
  })),
};

const plumberFontConfig = {
  errorHandler: notify.onError(error => ({
    title: 'FONT',
    message: error.message,
    sound: false,
  })),
};

gulp.task('html', function () {
  return gulp.src(path.html.src)
    .pipe(plumber(plumberHtmlConfig))
    .pipe(fileInclude(fileIncludeSetting))
    .pipe(gulp.dest(path.html.dest))
    .pipe(browserSync.stream())
});

gulp.task('pug', function () {
  return gulp.src(path.pug.src)
    .pipe(plumber(plumberPugConfig))
    .pipe(pug({
      pretty: true,
    }))
    .pipe(gulp.dest(path.pug.dest))
    .pipe(browserSync.stream())
});

gulp.task('sass', function () {
  return gulp.src(path.sass.src, { sourcemaps: true })
    .pipe(plumber(plumberSassConfig))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(path.sass.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream())
});

gulp.task('images', function () {
  return gulp.src([path.img.src, path.img.srcIcons, '!' + path.sprites.src], { encoding: false })
    .pipe(plumber(plumberImgConfig))
    .pipe(newer(path.img.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(path.img.dest))
});

gulp.task('sprites', function () {
  return gulp.src(path.sprites.src, { encoding: false })
    .pipe(plumber(plumberSpriteConfig))
    .pipe(newer(path.sprites.dest))
    .pipe(gulp.dest(path.sprites.dest))
});

gulp.task('fonts', function () {
  return gulp.src(path.fonts.src, { encoding: false })
    .pipe(plumber(plumberFontConfig))
    .pipe(newer(path.fonts.dest))
    .pipe(fonter({
      formats: ['eot', 'woff', 'ttf']
    }))
    .pipe(gulp.dest(path.fonts.dest))
    .pipe(gulp.src(path.fonts.srcTTF, { encoding: false }))
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.fonts.dest))
});

gulp.task('files', function () {
  return gulp.src(path.files.src, { encoding: false })
    .pipe(newer(path.files.dest))
    .pipe(gulp.dest(path.files.dest))
});

gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: path.root,
    }
  });
});

gulp.task('clean', function (done) {
  if (fs.existsSync(path.root)) {
    return gulp.src(path.root, { read: false })
      .pipe(clean());
  }
  done();
});

gulp.task('watch', function () {
  gulp.watch(path.sass.watch, gulp.parallel('sass'));
  //gulp.watch(path.html.watch, gulp.parallel('html'));
  gulp.watch(path.pug.watch, gulp.parallel('pug')).on('change', browserSync.reload);
  gulp.watch([path.img.watch, '!' + path.sprites.watch], gulp.parallel('images'));
  gulp.watch(path.sprites.watch, gulp.parallel('sprites'));
  gulp.watch(path.fonts.watch, gulp.parallel('fonts'));
  gulp.watch(path.files.watch, gulp.parallel('files'));
});

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('pug', 'sass'),
  gulp.parallel('fonts', 'images', 'sprites', 'files'),
  gulp.parallel('server', 'watch')
));
