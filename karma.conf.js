module.exports = function (config) {
  'use strict'
  config.set({
    basePath: '',
    frameworks: [ 'browserify', 'jasmine' ], // include browserify first
    browsers: [ process.env.TRAVIS ? 'Chrome--no-sandbox' : 'Chrome' /*, 'Firefox' */ ],
    customLaunchers: {
      'Chrome--no-sandbox': { // TravisCI
        base: 'Chrome',
        flags: [ '--no-sandbox' ]
      }
    },
    files: [ 'spec/*.js', 'spec/*.ts' ],
    autoWatch: true,
    singleRun: true,
    plugins: [
      'karma-browserify',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'karma-spec-reporter', // output to terminal
      'karma-junit-reporter', // output to xml file
      'karma-coverage'
    ],
    preprocessors: {
      'spec/**/*.{js,ts}': [ 'browserify' ]
    },
    browserify: { // https://github.com/nikku/karma-browserify#plugins
      debug: true,
      transform: [
        [
          'browserify-istanbul', {
            'ignore': '**/spec/**',
            'instrumenterConfig': { 'embedSource': true }
          }
        ]
      ],
      plugin: [
        [ 'tsify', { 'project': 'spec' } ]
      ] /*,
      configure: function (bundle) {
        bundle.on('prebundle', function () {
          bundle.require('_cut_', { expose: '' }) // stub dependencies
        })
      } */
    },
    reporters: [ // 'progress' | 'dots' | 'kjhtml' | 'junit' | 'spec' | ' coverage'
      'spec', 'kjhtml', 'junit', 'coverage'
    ],
    coverageReporter: {
      dir: 'spec/reports/coverage',
      reporters: [
        {
          type: 'json',
          subdir: function (browser) {
            return browser.toLowerCase().split(/[ /-]/)[0];
          },
          file: 'coverage.json'
        }
      ]
    },
    junitReporter: {
      outputDir: 'spec/reports',
      outputFile: undefined, // filename based on browser name
      suite: 'unit'
    },
    // config.{LOG_DISABLE,LOG_ERROR,LOG_WARN,LOG_INFO,LOG_DEBUG}
    logLevel: config.LOG_INFO
  })
}