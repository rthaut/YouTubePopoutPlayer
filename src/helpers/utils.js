import { YOUTUBE_EMBED_URL } from './constants';

const Utils = (() => {

    const Utils = {

        'GetDimensionForScreenPercentage': function (dimension, percentage) {
            if (percentage > 0) {
                percentage = (percentage / 100);
            }

            return parseInt(window.screen[`avail${dimension}`] * percentage, 10);
        },

        /**
        * Determines if the browser is Firefox
        * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getBrowserInfo
        * @returns {boolean}
        */
        'IsFirefox': async function () {
            console.group('Utils.IsFirefox()');

            let isFirefox = false;

            try {
                if (typeof browser.runtime.getBrowserInfo === 'function') {
                    const info = await browser.runtime.getBrowserInfo();

                    if (info !== undefined && info !== null) {
                        console.log('Browser information', info);

                        if (info.name !== undefined && info.name.toLowerCase() === 'firefox') {
                            console.log('Browser is Firefox');
                            isFirefox = true;
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to determine browser info', error);
            }

            console.log('Return', isFirefox);
            console.groupEnd();
            return isFirefox;
        },

        /**
         * Determines if the given Location is for a Popout Player
         * @param {Location} location window/document location
         * @returns {boolean}
         */
        'IsPopoutPlayer': function (location) {
            console.group('Utils.IsPopoutPlayer()', location);

            if (location.href.startsWith(YOUTUBE_EMBED_URL)) {
                const params = new URLSearchParams(location.search.substring(1));
                console.log('URL Search Params', params);

                if (params.get('popout')) {
                    console.log('Return', true);
                    console.groupEnd();
                    return true;
                }
            }

            console.log('Return', false);
            console.groupEnd();
            return false;
        },

        'TitleCase': function (str) {
            return str.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }

    };

    return Utils;

})();

export default Utils;
