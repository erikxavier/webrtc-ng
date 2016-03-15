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

gulp.task('clean', function() {
    return gulp.src('dist/')
    .pipe(clean());
});

gulp.task('jshint', function() {
    return gulp.src('src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
    return gulp.src(['src/js/**/*.js', 'src/lib/**/*.js'])    
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('htmlmin', function() {
    return gulp.src('src/view/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/view'));
});

gulp.task('cssmin', function() {
    return gulp.src('src/css/**/*.css')
    .pipe(cleanCSS())
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('copy', function () {
    return gulp.src('src/index-prod.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', function(cb) {
    return runSequence('clean', ['jshint', 'uglify', 'htmlmin', 'cssmin', 'copy'], cb)
})