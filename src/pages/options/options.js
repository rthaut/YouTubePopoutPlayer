/* eslint-env browser, jquery, webextensions */

import './options.scss';

import { OPTION_DEFAULTS } from '../../helpers/constants';
import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';

/* global angular */
const app = angular.module('OptionsApp', ['ngMessages', 'ngSanitize']);

app.controller('OptionsController', ['$scope', function ($scope) {

    $scope.cache = {};
    $scope.options = OPTION_DEFAULTS;
    $scope.resolution = window.screen.width + ' &times; ' + window.screen.height;

    /**
     * Caches (and restores) values related to custom dimensions when changing units
     */
    $scope.cacheDimensions = function () {

        // create the object structure for caching dimensions
        $scope.cache.dimensions = {};
        ['pixels', 'percentage'].forEach(unit => {
            $scope.cache.dimensions[unit] = {
                'width': null,
                'height': null
            };
        });

        $scope.$watch('options.size.width', () => {
            if ($scope.form.width.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].width = angular.copy($scope.options.size.width);
            }
        });
        $scope.$watch('options.size.height', () => {
            if ($scope.form.height.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].height = angular.copy($scope.options.size.height);
            }
        });
        $scope.$watch('options.size.units', (newValue, oldValue) => {
            $scope.options.size.width = angular.copy($scope.cache.dimensions[newValue].width);
            $scope.options.size.height = angular.copy($scope.cache.dimensions[newValue].height);
        });
    };

    /**
     * Loads the options from local storage
     */
    $scope.load = async function () {
        console.log('OptionsController.load()');

        const _stored = await browser.storage.local.get();
        console.log('OptionsController.load() :: Options from Local Storage', _stored);

        // convert flat options into nested options object
        const _options = Options.ConvertFromStorage(angular.copy(_stored));
        console.log('OptionsController.save() :: Options in structured format', _options);

        $scope.options = Object.assign({}, $scope.options, _options);
        console.log('OptionsController.load() :: Options', $scope.options);

        // once the options have been loaded and converted, setup the cache for dimensions
        $scope.cacheDimensions();

        $scope.$apply();
    };
    $scope.load();

    function gcd(a, b) {
        return (b == 0) ? a : gcd(b, a % b);
    }

    /**
     * Returns size data based on the user's custom dimension settings
     * @returns {Object} width, height, and ratio values
     */
    function getSizeData() {
        let width = angular.copy($scope.options.size.width);
        let height = angular.copy($scope.options.size.height);
        let ratio;

        if ((parseInt(width, 10) > 0) && (parseInt(height, 10) > 0)) {
            if ($scope.options.size.units.toLowerCase() === 'percentage') {
                width = Utils.GetDimensionForScreenPercentage('Width', width);
                height = Utils.GetDimensionForScreenPercentage('Height', height);
            }

            ratio = gcd(width, height);
        }

        return {
            'width': width,
            'height': height,
            'ratio': ratio
        };
    }

    /**
     * Used to show certain calculated properties about the custom size
     * @param {string} property the name of the property to return
     * @returns {string} the formatted string for the requested property
     */
    $scope.showInfo = function (property) {
        let result = 'N/A';

        const { width, height, ratio } = getSizeData();

        if (width && height && ratio) {
            switch (property.toLowerCase()) {
                case 'aspectratio':
                    result = width / ratio + ':' + height / ratio;
                    break;

                case 'dimensions':
                    result = width + ' &times; ' + height;
                    break;
            }

        }

        return result;
    };

    /**
     * Handles showing the size units next to the width and height input fields
     * TODO: the return values probably need to support i18n
     * @returns {string}
     */
    $scope.sizeUnits = function () {
        switch ($scope.options.size.units.toLowerCase()) {
            case 'pixels':
                return 'px';
            case 'percentage':
                return '%';
            default:
                return '?';
        }
    };

    /**
     * Determines the minimum size for the width and/or height input fields based on the selected units
     * @param {string} dimension either "width" or "height"
     * @returns {number}
     */
    $scope.sizeMin = function (dimension) {
        switch ($scope.options.size.units.toLowerCase()) {
            case 'pixels':
                switch (dimension.toLowerCase()) {
                    case 'width': return parseInt(window.screen.availWidth * 0.1, 10);
                    case 'height': return parseInt(window.screen.availHeight * 0.1, 10);
                }
                break;

            case 'percentage': return 10;
        }

        return 0;
    };

    /**
     * Determines the maximum size for the width and/or height input fields based on the selected units
     * @param {string} dimension either "width" or "height"
     * @returns {number}
     */
    $scope.sizeMax = function (dimension) {
        switch ($scope.options.size.units.toLowerCase()) {
            case 'pixels':
                switch (dimension.toLowerCase()) {
                    case 'width': return window.screen.availWidth;
                    case 'height': return window.screen.availHeight;
                }
                break;

            case 'percentage': return 100;
        }

        return 0;
    };

    /**
     * Resets all options to the extension defaults
     * TODO: if this method is going to stay, it currently does NOT refresh the $scope for some reason...
     */
    $scope.reset = function () {
        console.log('OptionsController.clear()');

        // TODO: confirm() is bad; replace with a modal
        if (window.confirm('Are you sure you want to clear local storage?')) {
            browser.storage.local.clear().then(() => {
                $scope.load();
                // TODO: alert() is bad; replace with a modal (or an alert div)
                window.alert('Local storage cleared successfully');
            });
        }
    };

    /**
     * Saves the options to local storage
     */
    $scope.save = function () {
        console.log('OptionsController.save()');

        // convert nested objects into top level properties
        const _options = Options.ConvertForStorage(angular.copy($scope.options));
        console.log('OptionsController.save() :: Options to save to Local Storage', _options);

        browser.storage.local.set(_options).then(() => {
            // TODO: alert() is bad; replace with a modal (or an alert div)
            window.alert('All settings saved to local storage');
        }).catch(err => {
            console.error('Failed to save settings to local storage', err);
            // TODO: alert() is bad; replace with a modal (or an alert div)
            window.alert('Failed to save settings to local storage: ' + err);
        });
    };

}]);
