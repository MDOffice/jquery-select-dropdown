var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    del = require('del'),
    babel = require('gulp-babel');

var csso = require('gulp-csso'),
    csscomb = require('gulp-csscomb');

var paths = {
    scripts: './src/js/*.js',
    styles: './src/scss/*.css'
};


gulp.task('connect', function () {
    connect.server({
        root: ['examples'],
        port: 9000,
        livereload: true
    });
    console.log('Server listening on http://localhost:9000');
});

gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('jquery-select-dropdown.js'))
        .on('error', gutil.log) // Если есть ошибки, выводим и продолжаем
        .pipe(uglify())
        .pipe(gulp.dest('./examples/scripts'))
        .pipe(connect.reload());
});

gulp.task('scripts-deploy', function () {
    return gulp.src(paths.scripts)
        .pipe(concat('jquery-select-dropdown.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('styles', function () {
    return gulp.src(paths.styles)
    /*.pipe(sass({
     errLogToConsole: true,
     includePaths: [
     'app/styles/scss/'
     ]
     }))
     .pipe(autoprefixer({
     browsers: autoPrefixBrowserList,
     cascade:  true
     }))*/
        .on('error', gutil.log)
        .pipe(csscomb())
        .pipe(concat('jquery-select-dropdown.css'))
        .pipe(csso())
        .pipe(gulp.dest('examples/styles'))
        .pipe(connect.reload());
});

gulp.task('styles-deploy', function () {
    return gulp.src(paths.styles)
    /*.pipe(sass({
     includePaths: [
     'app/styles/scss',
     ]
     }))
     .pipe(autoprefixer({
     browsers: autoPrefixBrowserList,
     cascade:  true
     }))*/
        .pipe(csscomb())
        .pipe(concat('jquery-select-dropdown.css'))
        .pipe(csso())
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('clean', function () {
    del(['dist']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['connect', 'scripts', 'styles'], function () {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.styles, ['styles']);
});

gulp.task('deploy', ['clean', 'scripts-deploy', 'styles-deploy'], function () {
});