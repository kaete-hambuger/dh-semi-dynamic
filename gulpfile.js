'use strict';

// Set global configuration
var config = {
	dist: 'www',
	globalMockDataJson: './src/global-data.json',
	handlebarsPages: './src/pages/**/*.hbs',
	handlebarsTarget: './www'
};

// Load gulp plugins
var handlebars = require('gulp-compile-handlebars');
var runSequence = require('run-sequence').use(gulp);
var gulp = require('gulp');
var fs = require('fs');
var data = require('gulp-data');
var rename = require('gulp-rename');

// Add default task
gulp.task('default', function(cb) {
  	runSequence(
		'compileStaticHtml'
  	)}
);

// Compile dynamic handlebars templates to static HTML
gulp.task('compileStaticHtml', function() {
  var globalMockDataJson = JSON.parse(fs.readFileSync(config.globalMockDataJson));

  //del.sync(config.handlebarsTarget + '/**/*');

  //var partialDirs = helpers.createHandleBarsPartialDirList(config.handlebarsPartials);


  return gulp.src(config.handlebarsPages)
  	.pipe(data(function(file) {
      // require data from json file with the same name
      return JSON.parse(fs.readFileSync(file.path.replace('hbs', 'json')));
    }))
    .pipe(handlebars(globalMockDataJson,
      {
        batch: ['./src/partials']
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
    .pipe(gulp.dest(config.handlebarsTarget));
    //.on('end', browserSync.reload);
});

/*// Helper functions
function getSubDirectories(srcPath) {
  	return fs.readdirSync(srcPath).filter(function(file) {
    	return fs.statSync(path.join(srcPath, file)).isDirectory();
  	})
};

function createHandleBarsPartialDirList(handlebarsPartials) {
	var subPartialDirs = this.getSubDirectories(handlebarsPartials);
	var partialDirs = [];

	for (var i = 0; i < subPartialDirs.length; i++) {
		var partialDir = handlebarsPartials + subPartialDirs[i] + '/';
		partialDirs.push(partialDir);
	}

	// add partials base dir
	partialDirs.push(handlebarsPartials);

	return partialDirs;
}	*/