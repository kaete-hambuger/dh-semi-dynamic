'use strict';

// Set global configuration
var config = {
	dist: 'www',
	styles: 'www/css/style.css',
	handlebarsGlobalData: './src/global-data.json',
	handlebarsAll: './src/**/*.{hbs,json}',
	handlebarsPages: './src/pages/**/*.hbs',
	handlebarsPartials: './src/partials',
	handlebarsTarget: './www'
};

// Load gulp plugins
var handlebars = require('gulp-compile-handlebars');
var runSequence = require('run-sequence').use(gulp);
var gulp = require('gulp');
var fs = require('fs');
var data = require('gulp-data');
var rename = require('gulp-rename');
var del = require('del');
var watch = require('gulp-watch');
var browserSync = require('browser-sync');
var modRewrite = require('connect-modrewrite');

// Add default task
gulp.task('default', function(cb) {
  	runSequence(
		'compileStaticHtml',
    'browserSync',
		'watch'
  	)}
);

// Watch for changes and reload task
gulp.task('watch', function(cb) {
  watch(config.styles, function() {
    gulp.start('compileStaticHtml')
      .on('end', cb);
  });
  watch(config.handlebarsAll, function() {
    gulp.start('compileStaticHtml')
      .on('end', cb);
  });
});

// BrowserSync
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: './www',
      livereload: true,
      middleware: [
        // redirect html requests to handlebars out folder for development
        modRewrite([
          // redirect all html files
          '^\/([^\/]*\.html)$ /$1',
          // redirect root (http://localhost/)
          '^/$ /index.html [L]'
        ])
      ]
    }
  });
});


// Compile dynamic handlebars templates to static HTML
gulp.task('compileStaticHtml', function() {
  var globalMockDataJson = JSON.parse(fs.readFileSync(config.handlebarsGlobalData));

  del.sync(config.handlebarsTarget + '/**/*');

  return gulp.src(config.handlebarsPages)
  	.pipe(data(function(file) {
      // require data from json file with the same name
      return JSON.parse(fs.readFileSync(file.path.replace('hbs', 'json')));
    }))
    .pipe(handlebars(globalMockDataJson,
      {
        batch: [config.handlebarsPartials]
      }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(rename(function(path) {
      // instead of using folders for the output prefix the filename
      // with the dirname. This allows us to use folders for development
      if (path.dirname !== '.') {
        path.basename = path.dirname.replace('/', '-') + '-' + path.basename;
        path.dirname = '.';
      }

    }))
    .pipe(gulp.dest(config.handlebarsTarget))
    .on('end', browserSync.reload);
});