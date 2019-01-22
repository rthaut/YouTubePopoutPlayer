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
         * Determines if the given Location is for a Popout Player
         * @param {Location} location window/document location
         * @returns {boolean}
         */
        'IsPopoutPlayer' : function (location) {
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
        }

    };

    return Utils;

})();

export default Utils;
