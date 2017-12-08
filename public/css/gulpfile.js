var debug = require('gulp-debug');
var gulp = require('gulp');
var watchLess = require('gulp-watch-less');
var less = require('gulp-less');
 
gulp.task('less', function () {
	watchLess('./*.less')
	.pipe(debug())
	.pipe(less())
	.pipe(gulp.dest('./'));
});
