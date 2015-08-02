/* global module */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
	        url: '<%= pkg.homepage %>',
                options: {
		    exclude: '',
                    paths: ['./', 'lib/'],
                    outdir: 'doc/'
                }
            }
        },
        jshint: {
            all: ['lib/*.js', '*.js']
        },
        
        mochacli: {
          options: {
            reporter: "nyan",
            ui: "tdd"
          },
          all: ["test/tests.js"]
        }    
    });

    grunt.loadNpmTasks("grunt-mocha-cli");
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('test', ['mochacli']);
    grunt.registerTask('default', ['jshint', 'mochacli', 'yuidoc']);
    grunt.registerTask('jenkins', ['jshint', 'mochacli', 'yuidoc']);
};
