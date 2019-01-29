/* eslint-env browser, jquery, webextensions */

import './options.scss';

import { OPTION_DEFAULTS, VALID_SHORTCUT_KEYS, VALID_SHORTCUT_KEYS_DESCRIPTIONS } from '../../helpers/constants';
import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';

/* global angular */
const app = angular.module('OptionsApp', ['ngAnimate', 'ngMessages', 'ngSanitize', 'browser.i18n']);

app.filter('kbdCombo', function () {
  return function (input, tag = 'kbd') {
        if (input === undefined || input === null || !input.length) {
            return '';
        }

        return input.split('+').map(i => `<${tag}>${i}</${tag}>`).join(' + ');
  };
});

app.controller('OptionsController', ['$scope', '$timeout', 'kbdComboFilter', function ($scope, $timeout, kbdComboFilter) {

    /* BEGIN ALERTS */

    // TODO: the alerts should probably be actual custom directives with their own scope/link functionality...

    $scope.alerts = [];

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
     * @param {object} alert
     * @param {boolean} dismissible
     * @param {number} duration
     */
    $scope.createAlert = function(alert, dismissible = true, duration = null) {
        if (dismissible) {
            alert.dismissible = true;
        }

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

    $scope.$on('$destroy', function () {
        // cancel all ongoing alert timers
        for (const alert of $scope.alerts) {
            if (alert.timeout !== undefined) {
                $timeout.cancel(alert.timeout);
            }
        }
    });

    /* END ALERTS */

    /* BEGIN DIALOGS */

    // TODO: move these dialog functions into a helper/utility? that would help expose them to custom directives
    // TODO: the dialogs should probably be actual custom directives with their own scope/link functionality...

    var initDialog = function (dialog) {
        /* global dialogPolyfill */
        if (typeof dialogPolyfill !== 'undefined') {
            dialogPolyfill.registerDialog(dialog);
        }

        dialog.addEventListener('close', () => {
            document.body.style.overflowY = null;
        });

        return dialog;
    };

    $scope.showDialog = function (id) {
        const dialog = document.querySelector(`#${id}`);
        initDialog(dialog);

        if (!dialog.open) {
            document.body.style.overflowY = 'hidden';
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

    /* END DIALOGS */

    /* BEGIN SETTINGS */

    $scope.isFirefox = false;
    (async () => {
        $scope.isFirefox = await Utils.IsFirefox();
    })();

    $scope.cache = {};

    $scope.options = angular.copy(OPTION_DEFAULTS);

    $scope.resolution = window.screen.width + ' &times; ' + window.screen.height;

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
            if ($scope.optionsForm.sizeDimensionsForm.sizeWidth.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].width = angular.copy($scope.options.size.width);
            }
        });
        $scope.$watch('options.size.height', () => {
            if ($scope.optionsForm.sizeDimensionsForm.sizeHeight.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].height = angular.copy($scope.options.size.height);
            }
        });
        $scope.$watch('options.size.units', (newValue, oldValue) => {
            $scope.options.size.width = angular.copy($scope.cache.dimensions[newValue].width);
            $scope.options.size.height = angular.copy($scope.cache.dimensions[newValue].height);
        });
    };

    $scope.validateBehaviorControlsValue = function () {
        if (!['none', 'standard', 'extended'].includes($scope.options.behavior.controls)) {
            $scope.options.behavior.controls = null;
        }
    };

    $scope.validateSizeUnitsValue = function () {
        if (!['pixels', 'percentage'].includes($scope.options.size.units)) {
            $scope.options.size.units = null;
        }
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

        $scope.validateBehaviorControlsValue();
        $scope.validateSizeUnitsValue();

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
            $scope.createAlert({
                'message': browser.i18n.getMessage('OptionsResetSuccessMessage'),
                'type': 'success',
                'icon': 'check-square-o'
            }, true, 5);
            $scope.optionsForm.$setPristine();
        }).catch(err => {
            console.error('Failed to reset settings to default values', err);
            $scope.createAlert({
                'message': browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage', err.message),
                'type': 'danger',
                'icon': 'exclamation-o'
            }, true);
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
            $scope.createAlert({
                'message': browser.i18n.getMessage('OptionsSaveSuccessMessage'),
                'type': 'success',
                'icon': 'check-square-o'
            }, true, 5);
            $scope.optionsForm.$setPristine();
        }).catch(err => {
            console.error('Failed to save settings to local storage', err);
            $scope.createAlert({
                'message': browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage', err.message),
                'type': 'danger',
                'icon': 'exclamation-o'
            }, true);
        }).finally(() => {
            $scope.$apply();
        });
    };

    /* END SETTINGS */

    /* BEGIN COMMANDS */

    // TODO: move all of the command-related functionality into a custom directive?
    // aside from the dialog methods (initDialog(), showDialog(), closeDialog()), it is already self-contained

    $scope.canUpdateCommands = (typeof browser.commands.update === 'function');

    var getCommands = function () {
        browser.runtime.sendMessage({
            'action': 'get-commands'
        }).then(commands => {
            $scope.commands = commands;
        }).catch(err => {
            console.error('Failed to retrieve extension commands', err);
        }).finally(() => {
            $scope.$apply();
        });
    };
    getCommands();

    $scope.initUpdateCommandDialog = function () {
        const dialog = document.querySelector('#UpdateCommandDialog');
        initDialog(dialog);

        dialog.addEventListener('close', () => {
            removeCommandUpdateKeyListener();
            if ($scope.command !== null) {
                $scope.command = null;
                $scope.$apply();
            }
        });
    };

    var removeCommandUpdateKeyListener = function () {
        console.log('OptionsController.removeCommandUpdateKeyListener()');
        window.removeEventListener('keypress', updateCommandShortcut, false);
    };

    $scope.updateCommand = function (command) {
        $scope.showDialog('UpdateCommandDialog');
        $scope.command = command;

        // ensure we don't already have an active event listener
        removeCommandUpdateKeyListener();

        window.addEventListener('keypress', updateCommandShortcut, false);
    };

    var updateCommandShortcut = async function (event) {
        console.log('OptionsController.updateCommandShortcut()', event);

        if (event.preventDefault) {
            event.preventDefault();
        }

        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if ($scope.command === undefined || $scope.command === null) {
            console.log('No command actively being updated');
            removeCommandUpdateKeyListener();
            return;
        }

        if (event.keyCode === 27) {
            console.log('Escape key pressed');
            removeCommandUpdateKeyListener();
            return;
        }

        const key = event.code.replace('Key', '').replace('Arrow', '');
        if (!VALID_SHORTCUT_KEYS.includes(key)) {
            $scope.updateCommandError = browser.i18n.getMessage('InvalidCommandShortcutKeyPlaceholder', kbdComboFilter(key));

            const keys = [];
            VALID_SHORTCUT_KEYS_DESCRIPTIONS.forEach(description => {
                if (description.includes('-')) {
                    description = description.split('-').map(key => kbdComboFilter(key)).join('-');
                } else if (description.includes(', ')) {
                    description = description.split(', ').map(key => kbdComboFilter(key)).join(' , ');
                }
                keys.push(description);
            });

            $scope.updateCommandError += '<p>' + keys.join(' , ') + '</p>';
            $scope.$apply();
            return;
        }

        const modifiers = ['ctrl', 'alt', 'meta', 'shift'];
        let combination = '';
        let modifierCount = 0;
        modifiers.forEach(modifier => {
            if (event[modifier + 'Key']) {
                combination += modifier + '+';
                modifierCount++;
            }
        });

        if (1 > modifierCount || modifierCount > 2) {
            $scope.updateCommandError = browser.i18n.getMessage('InvalidCommandShortcutModifiers');
            $scope.updateCommandError += '<p>' + modifiers.map(Utils.TitleCase).map(key => kbdComboFilter(key)).join(' , ') + '</p>';
            $scope.$apply();
            return;
        }

        combination = Utils.TitleCase(combination) + key;

        try {
            console.log(`Setting Command "${$scope.command.name}" Shortcut`, combination);
            await browser.commands.update({
                'name': $scope.command.name,
                'shortcut': combination
            });

            delete $scope.updateCommandError;
            $scope.command.shortcut = combination;

            $scope.closeDialog('UpdateCommandDialog');
            $scope.command = null;
        } catch(err) {
            console.error('Failed to set command shortcut', err);
            $scope.updateCommandError = err;
        }

        $scope.$apply();
    };

    $scope.getCommandInstructionSubstitutions = function () {
        const substitutions = [];

        if ($scope.command !== undefined && $scope.command !== null) {
            substitutions.push($scope.command.description);
            substitutions.push(kbdComboFilter($scope.command.shortcut));
        }

        return substitutions;
    };

    $scope.$on('$destroy', function () {
        // remove the command update keypress event listener
        removeCommandUpdateKeyListener();
    });

    /* END COMMANDS */

}]);
