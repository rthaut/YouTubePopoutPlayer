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
        }

    };

    return Utils;

})();

export default Utils;
