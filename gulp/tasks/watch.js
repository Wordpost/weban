module.exports = function() {
	$.gulp.task('watch', function() {
		$.gulp.watch($.path.watch.html, $.gulp.series('html'));
		$.gulp.watch($.path.watch.sass, $.gulp.series('sass'));
		$.gulp.watch($.path.watch.jslibs, $.gulp.series('js-libs'));
		$.gulp.watch($.path.watch.jsCustom, $.gulp.series('js-custom'));
		$.gulp.watch($.path.watch.jsFile, $.gulp.series('js-file'));
		$.gulp.watch($.path.watch.img, $.gulp.series('img'));
		$.gulp.watch($.path.watch.sprites, $.gulp.series('sprites'));
		$.gulp.watch($.path.watch.svg, $.gulp.series('svg'));
		$.gulp.watch($.path.watch.svg, $.gulp.series('svg-sass'));
		$.gulp.watch($.path.watch.fonts, $.gulp.series('fonts'));
	});
};