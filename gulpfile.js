var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    sass = require('gulp-ruby-sass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    minifyJSON = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat');

var env,
    coffeeSources,
    outputDir,
    jsSources,
    sassSources,
    htmlSources,
    jsonSources,
    allSources,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env == 'development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

coffeeSources   = ['components/coffee/tagline.coffee'];
jsSources       = ['components/scripts/*.js'];
sassSources     = ['components/sass/style.scss'];
htmlSources     = [outputDir + '*.html'];
jsonSources     = [outputDir + 'js/*.json'];
allSources      = coffeeSources.concat(jsSources).concat(sassSources).concat(htmlSources);

gulp.task('coffee', function () {
    gulp.src(coffeeSources)
        .pipe(coffee({
            bare: true
        }).on('error', gutil.log))
        .pipe(gulp.dest('components/scripts'));
});

gulp.task('js', function () {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});

gulp.task('compass', function () {
    gulp.src(sassSources)
        .pipe(compass({
            css: outputDir + 'css',
            sass: 'components/sass',
            image: outputDir + 'images',
            style: sassStyle,
            comments: true
        }))
        .on('error', gutil.log)
        .pipe(connect.reload())
});

gulp.task('watch', function () {
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch('components/sass/*.scss', ['compass']);
    gulp.watch(htmlSources, ['html']);
    gulp.watch(jsonSources, ['json']);
    gulp.watch('builds/development/images/**/*.*', ['images']);
});

gulp.task('connect', function () {
    connect.server({
        root: outputDir,
        livereload: true
    })
});

gulp.task('html', function () {
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload())
})

gulp.task('json', function () {
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env === 'production', minifyJSON()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'js')))
        .pipe(connect.reload())
})

gulp.task('images', function () {
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        })))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload())
})

gulp.task('default', ['images', 'coffee', 'js', 'html', 'json', 'compass', 'connect', 'watch']);