var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var es = require('event-stream');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var streamify = require('streamify');

gulp.task('clean', function() {
    return gulp.src('dist/')
    .pipe(clean());
});

// gulp.task('jshint', function() {
//     return gulp.src('src/js/**/*.js')
//     .pipe(jshint())
//     .pipe(jshint.reporter('default'));
// });

gulp.task('browserify', function() {
    return browserify('./app/js/main.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(uglify())
        .on("error", gutil.log)
        .pipe(gulp.dest('./dist/js/'));
});

// gulp.task('uglify', function() {
//     return gulp.src('./build/temp/app_temp.js')    
//     .pipe(rename('app.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('dist/js'));
// });

// gulp.task('htmlmin', function() {
//     return gulp.src('app/js/**/*.html')
//     .pipe(htmlmin({collapseWhitespace: true}))
//     .pipe(gulp.dest('dist/view'));
// });

// gulp.task('cssmin', function() {
//     return gulp.src('src/css/**/*.css')
//     .pipe(cleanCSS())
//     .pipe(concat('styles.min.css'))
//     .pipe(gulp.dest('dist/css'));
// });

gulp.task('copy', function () {
    return gulp.src(['app/lib/**/*.js', 'app/css/**/*.css', 'app/fonts/**/*', 'app/js/**/*.html', 'app/*.html'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', function(cb) {
    return runSequence('clean', 'browserify', 'copy', cb)
})