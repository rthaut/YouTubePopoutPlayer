/* eslint-env browser, jquery, webextensions */

import './options.scss';

import { OPTION_DEFAULTS } from '../../helpers/constants';
import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';

/* global angular */
const app = angular.module('OptionsApp', ['ngAnimate', 'ngMessages', 'ngSanitize', 'browser.i18n']);

app.controller('OptionsController', ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.alerts = [];

    $scope.cache = {};

    $scope.options = angular.copy(OPTION_DEFAULTS);

    $scope.resolution = window.screen.width + ' &times; ' + window.screen.height;

    /**
     * Removes an alert (and cancels the timeout, if applicable)
     * @param {Object} alert the alert object to remove
     */
    $scope.removeAlert = function (alert) {
        const alerts = $scope.alerts.filter(a => angular.equals(a, alert));

        for (const a of alerts) {
            if (a.timeout !== undefined) {
                $timeout.cancel(a.timeout);
            }
        }

        $scope.alerts = $scope.alerts.filter(a => !angular.equals(a, alert));
    };

    /**
     * Creates an alert to display inline on the form
     * @param {string} message
     * @param {string} type
     * @param {boolean} dismissible
     * @param {number} duration
     */
    $scope.createAlert = function(message, type = 'default', dismissible = true, duration = null) {
        const alert = {
            'type': type,
            'message': message,
            'dismissible': dismissible
        };

        if (duration !== null) {
            duration = parseInt(duration, 10);
            if (duration > 0) {
                alert.duration = duration;
                alert.timeout = $timeout($scope.removeAlert, duration * 1000, true, alert);
            }
        }

        // clear out any existing identical alerts
        $scope.removeAlert(alert);

        $scope.alerts.push(alert);
    };

    /**
     * Creates/reset the object structure used for caching some options within the app
     */
    var resetCache = function () {
        // create the object structure for caching dimensions
        $scope.cache.dimensions = {};
        ['pixels', 'percentage'].forEach(unit => {
            $scope.cache.dimensions[unit] = {
                'width': null,
                'height': null
            };
        });
    };

    /**
     * Caches (and restores) values related to custom dimensions when changing units
     */
    $scope.cacheDimensions = function () {
        resetCache();

        $scope.$watch('options.size.width', () => {
            if ($scope.optionsForm.width.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].width = angular.copy($scope.options.size.width);
            }
        });
        $scope.$watch('options.size.height', () => {
            if ($scope.optionsForm.height.$valid) {
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

    /**
     * Computes the greatest common denominator for a pair of numbers
     * @param {number} a the first number
     * @param {number} b the second number
     * @returns {number} the greatest common denominator
     */
    var gcd = function (a, b) {
        return (b == 0) ? a : gcd(b, a % b);
    };

    /**
     * Returns size data based on the user's custom dimension settings
     * @returns {Object} width, height, and ratio values
     */
    var getSizeData = function () {
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
    };

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
            case 'pixels':      return browser.i18n.getMessage('DimensionUnitsPixelsUnitLabel');
            case 'percentage':  return browser.i18n.getMessage('DimensionUnitsPercentageUnitLabel');
        }

        return browser.i18n.getMessage('DimensionUnitsUnknownUnitLabel');
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
                    case 'width':   return parseInt(window.screen.availWidth * 0.1, 10);
                    case 'height':  return parseInt(window.screen.availHeight * 0.1, 10);
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
                    case 'width':   return window.screen.availWidth;
                    case 'height':  return window.screen.availHeight;
                }
                break;

            case 'percentage': return 100;
        }

        return 0;
    };

    var initDialog = function (dialog) {
        /* global dialogPolyfill */
        if (typeof dialogPolyfill !== 'undefined') {
            dialogPolyfill.registerDialog(dialog);
        }
    };

    $scope.showDialog = function (id) {
        const dialog = document.querySelector(`#${id}`);
        initDialog(dialog);

        if (!dialog.open) {
            dialog.showModal();
        }
    };

    $scope.closeDialog = function (id) {
        const dialog = document.querySelector(`#${id}`);
        initDialog(dialog);

        if (dialog.open) {
            dialog.close();
        }
    };

    $scope.confirmReset = function () {
        $scope.showDialog('ResetConfirmDialog');
    };

    $scope.cancelReset = function () {
        $scope.closeDialog('ResetConfirmDialog');
    };

    /**
     * Resets all options to the extension defaults
     */
    $scope.reset = function () {
        console.log('OptionsController.reset()');

        Options.InitLocalStorageDefaults(true).then(() => {
            $scope.options = angular.copy(OPTION_DEFAULTS);
            resetCache();
            $scope.createAlert(browser.i18n.getMessage('OptionsResetSuccessMessage'), 'success', true, 5);
        }).catch(err => {
            console.error('Failed to reset settings to default values', err);
            $scope.createAlert(browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage'), 'danger', true);
        }).finally(() => {
            $scope.closeDialog('ResetConfirmDialog');
            $scope.$apply();
        });
    };

    /**
     * Saves the options to local storage
     */
    $scope.save = function () {
        console.log('OptionsController.save()');

        Options.SetLocalOptions(angular.copy($scope.options)).then(() => {
            $scope.createAlert(browser.i18n.getMessage('OptionsSaveSuccessMessage'), 'success', true, 5);
        }).catch(err => {
            console.error('Failed to save settings to local storage', err);
            $scope.createAlert(browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage'), 'danger', true);
        }).finally(() => {
            $scope.$apply();
        });
    };

}]);
