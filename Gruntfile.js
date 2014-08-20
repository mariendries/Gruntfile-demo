module.exports = function(grunt) {

	var npmDependencies = require('./package.json').devDependencies;

	// Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({

		// Merge SVG's from folder, enables us to use a SVG sprite
		svgstore: {
	    options: {
	      prefix : 'icon-', // This will prefix each ID
	      svg:{
	      	style:"display:none"
	      },
	      cleanup:['fill', 'style', 'stroke', 'fill-rule', 'clip-rule']
	    },
	    default : {
	      files: {
	        'app/img/icons.svg': ['app/img/svg/*.svg'],
	      },
	    },
	  },

		// grunt-express will serve the files from the folders listed in `bases`
    // on specified `port` and `hostname`
		express: {
			all: {
				options: {
					port: 9000,
					hostname: "0.0.0.0",
					bases: "app/", // Replace with the directory you want the files served from
												// Make sure you don't use `.` or `..` in the path as Express
												// is likely to return 403 Forbidden responses if you do
												// http://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
					livereload: true
				}
			}
		},

		// grunt-open will open your browser at the project's URL
		open: {
			all: {
				// Gets the port from the connect configuration
				path: 'http://localhost:<%= express.all.options.port%>'
			}
		},

		// clean the dist folder
		clean: ["dist", ".tmp"],

		// Copy files from app to dist
		copy: {
			main: {
				expand: true,
				cwd: 'app/',
				src: ['**', '.htaccess', '!.sass-cache', '!bower_components/**', '!js/**', '!sass*/**','!.bowerrc', '!bower.json', '!config.rb', '!img/svg'],
				dest: 'dist/'
			}
		},

		useminPrepare: {
			html: 'app/index.html'
		},

		usemin: {
			html: ['dist/index.html']
		},

		uglify: {
			options: {
				report: 'min',
				mangle: false
			}
		},

		// Watches for changes and runs tasks
		watch : {
			compass : {
				files : ['app/sass/**/*.scss'],
				tasks : ['compass:dev'],
				options : {
					livereload : true
				}
			},
			svg : {
				files : ['app/img/svg/*.svg'],
				tasks : ['svgstore']
			},
			all : {
				files: ['views/**/*.html'],
				options: {
					livereload: true
				}
			}
		},

		// JsHint your javascript
		jshint : {
			all : ['app/js/*.js', '!**/modernizr.js', '!**/*.min.js', '!**/vendor/**/*.js'],
			options : {
				browser: true,
				curly: false,
				eqeqeq: false,
				eqnull: true,
				expr: true,
				immed: true,
				newcap: true,
				noarg: true,
				smarttabs: true,
				sub: true,
				undef: false,
				globalstrict: true,
				globals :{
					angular: false
				}
			}
		},
		// Compiles Sass to CSS and generates necessary files if requested
		compass : {
			options: {
				sassDir: 'app/sass',
				cssDir: 'app/css',
				imagesDir: 'app/img',
				javascriptsDir: 'app/js',
				extensionsDir: 'app/sass/sass-extensions',
			},
	    production: {
	      options: {
        	generatedImagesDir: 'app/images/generated'
	      }
	    },
	    dev: {
	        options: {
	            debugInfo: true
	        }
	    }
    },

		// Image min
		imagemin : {
			production : {
				files : [
					{
						expand: true,
						cwd: 'app/img',
						src: '**/*.{png,jpg,jpeg}',
						dest: 'app/img'
					}
				]
			}
		},

		// SVG min
		svgmin: {
			production : {
				files: [
					{
						expand: true,
						cwd: 'app/img',
						src: '**/*.svg',
						dest: 'app/img'
					}
				]
			}
		},
	});

	// Default task
	grunt.registerTask('default', ['server']);

	// Creates the `server` task
  grunt.registerTask('server', [
    'express',
    'open',
    'watch'
  ]);

	// Build task
	grunt.registerTask('build', ['jshint', 'compass:production', 'imagemin:production', 'clean', 'copy', 'useminPrepare', 'concat', 'uglify', 'usemin']);

	// Template Setup Task
	grunt.registerTask('setup', function() {
		var arr = [];
		arr.push['compass:dev'];
		arr.push('bower-install');
	});

	// Run bower install
	grunt.registerTask('bower-install', function() {
		var done = this.async();
		var bower = require('bower').commands;
		bower.install().on('end', function(data) {
			done();
		}).on('data', function(data) {
			console.log(data);
		}).on('error', function(err) {
			console.error(err);
			done();
		});
	});

};
