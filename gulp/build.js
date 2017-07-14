'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});
var lazypipe = require('lazypipe');
var through = require('through2');


module.exports = function(options) {
  gulp.task('partials', function () {
    return gulp.src([
      options.src + '/app/**/*.html',
      options.tmp + '/serve/app/**/*.html'
    ])
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe($.angularTemplatecache('templateCacheHtml.js', {
        module: 'app',
        root: '/app'
      }))
      .pipe(gulp.dest(options.tmp + '/partials/'));
  });

  gulp.task('html', ['inject', 'partials'], function () {
    var partialsInjectFile = gulp.src(options.tmp + '/partials/templateCacheHtml.js', { read: false });
    var partialsInjectOptions = {
      starttag: '<!-- inject:partials -->',
      ignorePath: options.tmp + '/partials',
      addRootSlash: false
    };

    var htmlFilter = $.filter('*.hbs', {restore: true});
    var jsFilter = $.filter('**/*.js', {restore: true});
    var cssFilter = $.filter('**/*.css', {restore: true});
    var assets;

    return gulp.src(options.tmp + '/serve/*.hbs')
      .pipe($.inject(partialsInjectFile, partialsInjectOptions))
      // Adding lazypipe for creating source maps
      .pipe(assets = $.useref.assets({}, lazypipe().pipe($.sourcemaps.init, { loadMaps: true })))
      .pipe($.rev())
      .pipe(jsFilter)
      .pipe($.ngAnnotate({gulpWarnings: false}))
      .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', options.errorHandler('Uglify'))
       
       // Generate Sourcemaps for uglified and concatenated APP JS file
      .pipe($.sourcemaps.write(".", {addComment: false}))
      .pipe(jsFilter.restore)
      .pipe(through.obj(function(file,enc,cb){

        /* Rename the map file to remove Hash. This will allow to easily 
          read map files in backend. */

        if(file.path.indexOf('.js.map') != -1) {
          file.path = file.path.substring(0,file.path.lastIndexOf('-')) + '.map';
        }
        cb(null,file)
      }))
      .pipe(cssFilter)
      .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
      .pipe($.replace('../../bower_components/font-awesome/fonts', '../fonts'))
      .pipe($.replace('../../bower_components/open-sans-fontface/fonts', '../fonts/open-sans'))
      .pipe($.csso())
      .pipe(cssFilter.restore)
      .pipe(assets.restore())
      .pipe($.useref())
      .pipe($.revReplace())
      .pipe(htmlFilter)
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true,
        conditionals: true
      }))
      .pipe(htmlFilter.restore)
      .pipe(gulp.dest(options.dist + '/'))
      .pipe($.size({ title: options.dist + '/', showFiles: true }));

  });


  // Only applies for fonts from bower dependencies
  // Custom fonts are handled by the "other" task
  gulp.task('fonts', function () {
    var stream = gulp.src([options.wiredep.directory + '/**/*.{eot,svg,ttf,woff,woff2}'], {base: 'bower_components/'})
      .pipe($.filter(['**', '!open-sans-fontface/**']))
      .pipe($.flatten())
      .pipe(gulp.dest(options.dist + '/fonts/'));


    gulp.src([options.wiredep.directory + '/open-sans-fontface/**/*.{eot,svg,ttf,woff,woff2}'], {
      base: 'bower_components/open-sans-fontface/fonts/'
    })
      .pipe(gulp.dest(options.dist + '/fonts/open-sans'));

    return stream;
  });

  gulp.task('other', function () {
    return gulp.src([
      options.src + '/**/*',
      '!' + options.src + '/app/**/*.{html,hbs,css,js,scss}'
    ])
      .pipe(gulp.dest(options.dist + '/'));
  });

  gulp.task('clean', function (done) {
    $.del([options.dist + '/', options.tmp + '/'], done);
  });

  gulp.task('build', ['html', 'fonts', 'other']);
};
