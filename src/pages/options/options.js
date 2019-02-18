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

    $scope.hideMainContent = function () {
        return $scope.command || $scope.confirmReset;
    };

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
    $scope.createAlert = function (alert, dismissible = true, duration = null) {
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
            if ($scope.SizeCustomDimensionsForm.SizeWidth.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].width = angular.copy($scope.options.size.width);
            }
        });
        $scope.$watch('options.size.height', () => {
            if ($scope.SizeCustomDimensionsForm.SizeHeight.$valid) {
                $scope.cache.dimensions[$scope.options.size.units].height = angular.copy($scope.options.size.height);
            }
        });
        $scope.$watch('options.size.units', (units) => {
            $scope.options.size.width = angular.copy($scope.cache.dimensions[units].width);
            $scope.options.size.height = angular.copy($scope.cache.dimensions[units].height);
        });
    };

    var validateBehaviorControlsValue = function () {
        if (!['none', 'standard', 'extended'].includes($scope.options.behavior.controls)) {
            $scope.options.behavior.controls = null;
        }
    };

    var validateSizeUnitsValue = function () {
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

        validateBehaviorControlsValue();
        validateSizeUnitsValue();

        // once the options have been loaded and converted, setup the cache for dimensions
        $scope.cacheDimensions();

        $scope.$apply();
    };
    $scope.load();

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
            $scope.OptionsForm.$setPristine();
        }).catch(err => {
            console.error('Failed to reset settings to default values', err);
            $scope.createAlert({
                'message': browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage', err.message),
                'type': 'danger',
                'icon': 'exclamation-o'
            }, true);
        }).finally(() => {
            $scope.confirmReset = false;
            $scope.$apply();
        });
    };

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
        }

        if ((parseInt(width, 10) > 0) && (parseInt(height, 10) > 0)) {
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

    /**
     * Requests/removes the specified permission(s); must be invoked synchronously from a user input handler
     * @param {object} $elem the form element for the option
     * @param {object} request the permissions request object
     * @param {string} name the name of the option to save
     */
    $scope.togglePermission = function ($elem, request, name) {
        console.log('OptionsController.togglePermission()', $elem, request);

        // set the `permissions` validation property as pending
        $elem.$setValidity('permissions', undefined);

        let promise;
        if ($elem.$modelValue) {
            console.log('OptionsController.togglePermission() :: Requesting permission(s)', request);
            promise = browser.permissions.request(request);
        } else {
            console.log('OptionsController.togglePermission() :: Removing permission(s)', request);
            promise = browser.permissions.remove(request);
        }

        promise.then(response => {
            console.log('OptionsController.togglePermission() :: Permissions promise response', response);
            $elem.$setValidity('permissions', response);
            if (response) {
                $scope.saveOption(name, $elem);
            }
        }).catch(error => {
            console.error('OptionsController.togglePermission() :: Permissions promise error', error);
            $elem.$setValidity('permissions', false);
        }).finally(() => {
            $scope.$apply();
        });
    };

    /**
     * Save a single option to local storage
     * @param {string} name the name of the option to save
     * @param {object} $elem the form element for the option
     * @param {mixed} [value=null] the value to set for the option (uses the form element's $modelValue by default)
     */
    $scope.saveOption = function (name, $elem, value = null) {
        console.log('OptionsController.saveOption()', name, $elem, value);

        if ($elem.$valid && !$elem.$pending) {
            const option = {};
            option[name] = (value !== null) ? value : $elem.$modelValue;
            Options.SetLocalOptions(option, false).then(() => {
                $elem.$setPristine();
            }).catch(err => {
                console.error('Failed to save setting to local storage', err);
                $scope.createAlert({
                    'message': browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage', err.message),
                    'type': 'danger',
                    'icon': 'exclamation-o'
                }, true);
            }).finally(() => {
                $scope.$apply();
            });
        }
    };

    /**
     * Saves all options for the given domain to local storage
     * @param {string} domain the domain of the options to save
     * @param {object} $elem the form element for the option
     */
    $scope.saveOptions = function (domain, $elem) {
        console.log('OptionsController.saveOptions()', domain, $elem);

        if ($elem.$valid && !$elem.$pending) {
            const options = {};
            Object.keys($scope.options[domain]).forEach(option => {
                options[`${domain}.${option}`] = $scope.options[domain][option];
            });
            Options.SetLocalOptions(options, false).then(() => {
                $elem.$setPristine();
            }).catch(err => {
                console.error('Failed to save setting to local storage', err);
                $scope.createAlert({
                    'message': browser.i18n.getMessage('OptionsSaveErrorPlaceholderMessage', err.message),
                    'type': 'danger',
                    'icon': 'exclamation-o'
                }, true);
            }).finally(() => {
                $scope.$apply();
            });
        }
    };

    /* END SETTINGS */

    /* BEGIN COMMANDS */

    // TODO: move all of the command-related functionality into a custom directive?

    $scope.canUpdateCommands = (typeof browser.commands.update === 'function');

    var getCommands = function () {
        browser.runtime.sendMessage({
            'action': 'get-commands'
        }).then(commands => {
            $scope.commands = commands;
        }).catch(error => {
            console.error('Failed to retrieve extension commands', error);
        }).finally(() => {
            $scope.$apply();
        });
    };
    getCommands();

    var addCommandUpdateKeyListener = function () {
        console.log('OptionsController.addCommandUpdateKeyListener()');
        window.addEventListener('keydown', updateCommandShortcut, false);
    };

    var removeCommandUpdateKeyListener = function () {
        console.log('OptionsController.removeCommandUpdateKeyListener()');
        window.removeEventListener('keydown', updateCommandShortcut, false);
    };

    $scope.updateCommand = function (command) {
        console.log('OptionsController.updateCommand()', command);

        $scope.command = command;

        // ensure we don't already have an active event listener
        removeCommandUpdateKeyListener();

        addCommandUpdateKeyListener();
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

        const modifiers = ['Control', 'Alt', 'Shift', 'Meta'];
        if (modifiers.includes(event.key)) {
            console.log(`Event is for ${event.key} Modifier`);
            return;
        }

        if (event.keyCode === 27) {
            console.log('Escape key pressed');
            removeCommandUpdateKeyListener();
            delete $scope.updateCommandError;
            delete $scope.command;
            $scope.$apply();
            return;
        }

        const modifierKeys = ['ctrl', 'alt', 'meta', 'shift'];
        let combination = '';
        let modifierCount = 0;
        modifierKeys.forEach(modifier => {
            if (event[modifier + 'Key']) {
                combination += modifier + '+';
                modifierCount++;
            }
        });

        if (1 > modifierCount || modifierCount > 2) {
            $scope.updateCommandError = browser.i18n.getMessage('InvalidCommandShortcutModifiers');
            $scope.updateCommandError += '<p>' + modifierKeys.map(Utils.TitleCase).map(key => kbdComboFilter(key)).join(' , ') + '</p>';
            $scope.$apply();
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

        combination = Utils.TitleCase(combination) + key;

        try {
            console.log(`Setting Command "${$scope.command.name}" Shortcut`, combination);
            await browser.commands.update({
                'name': $scope.command.name,
                'shortcut': combination
            });

            delete $scope.updateCommandError;
            delete $scope.command;
            getCommands();
        } catch (err) {
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
