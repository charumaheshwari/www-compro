'use strict';

var gulp = require('gulp');

module.exports = function(options) {

  function startExpressServer() {
    require('../src/server/app');        
  }
  
  gulp.task('serve', ['watch'], function () {
    var nodemon = require('gulp-nodemon');
    nodemon({ script: './src/server/app.js'
          , ext: 'js'
          , env: { 'DLS_UNCOMPRESSED_MODE': true }
          , watch: ['src/server/']
    })
  });
  
  gulp.task('serve:dist', ['build'], function () {
    startExpressServer();
  });

  gulp.task('heroku',function(){
    startExpressServer();
  })

};
