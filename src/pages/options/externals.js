/* global process */
const production = (process.env.NODE_ENV === 'production');

/* global module */
module.exports = [
    {
        'module': 'webextension-polyfill',
        'entry': production ? 'dist/browser-polyfill.min.js' : 'dist/browser-polyfill.js'
    },
    {
        'module': 'jquery',
        'entry': production ? 'dist/jquery.min.js' : 'dist/jquery.js'
    },
    {
        'module': 'angular',
        'entry': [
            'angular-csp.css',
            production ? 'angular.min.js' : 'angular.js'
        ]
    },
    {
        'module': 'angular-browser-i18n',
        'entry': production ? 'dist/angular-browser-i18n.min.js' : 'dist/angular-browser-i18n.js'
    },
    {
        'module': 'angular-animate',
        'entry': production ? 'angular-animate.min.js' : 'angular-animate.js'
    },
    {
        'module': 'angular-messages',
        'entry': production ? 'angular-messages.min.js' : 'angular-messages.js'
    },
    {
        'module': 'angular-sanitize',
        'entry': production ? 'angular-sanitize.min.js' : 'angular-sanitize.js'
    },
    {
        'module': 'shoelace-css',
        'entry': [
            'dist/shoelace.css',
            'dist/shoelace.js'
        ]
    },
    {
        'module': 'dialog-polyfill',
        'entry': [
            'dialog-polyfill.css',
            'dialog-polyfill.js'
        ]
    }
];
