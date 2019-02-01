import { YOUTUBE_EMBED_URL, START_THRESHOLD } from '../../helpers/constants';
import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';

const Popout = (() => {

    const WIDTH_PADDING = 16;   // TODO: find a way to calculate this (or make it configurable)
    const HEIGHT_PADDING = 40;  // TODO: find a way to calculate this (or make it configurable)

    const Popout = {

        'open': async function (data) {
            console.log('[Background] Popout.open()', data);

            data = await this.getPopoutPlayerData(data);

            let promise;

            const target = await Options.GetLocalOption('experimental', 'target');
            switch (target.toLowerCase()) {
                case 'tab':
                    promise = this.openInNewTab(data.url);
                    break;

                case 'window':
                default:
                    promise = this.openInNewWindow(data.url, data.width, data.height);
                    break;
            }

            console.log('[Background] Popout.open() :: Return [Promise]', promise);
            return promise;
        },

        /**
         * Opens an Embedded Player in a new tab
         * @param {string} url the URL of the Embedded Player to open in a new window
         * @returns {Promise}
         */
        'openInNewTab': function (url) {
            console.log('[Background] Popout.openInNewTab()', url);

            const tabData = {
                'active': true,     // TODO: should this be configurable?
                'url': url
            };

            console.log('[Background] Popout.openInNewTab() :: Creating Tab', tabData);
            const promise = browser.tabs.create(tabData);

            console.log('[Background] Popout.openInNewTab() :: Return [Promise]', promise);
            return promise;
        },

        /**
         * Opens an Embedded Player in a new window (optionally matching the size of the original video player)
         * @param {string} url the URL of the Embedded Player to open in a new window
         * @param {number} width the width for the popout video player
         * @param {number} height the height for the popout video player
         * @returns {Promise}
         */
        'openInNewWindow': async function (url, width, height) {
            console.log('[Background] Popout.openInNewWindow()', url, width, height);

            const windowData = {
                'width': width + WIDTH_PADDING,     // manually increasing size to account for window frame
                'height': height + HEIGHT_PADDING,  // manually increasing size to account for window frame
                'type': 'popup',
                'url': url
            };

            const isFirefox = await Utils.IsFirefox();

            if (isFirefox) {
                windowData.titlePreface = await Options.GetLocalOption('experimental', 'title');
            }

            console.log('[Background] Popout.openInNewWindow() :: Creating Window', windowData);
            const promise = browser.windows.create(windowData);

            console.log('[Background] Popout.openInNewWindow() :: Return [Promise]', promise);
            return promise;
        },

        /**
         * Gets the URL for the popout player given a video ID and optional URL parameters
         * @param {string} id the video ID
         * @param {Object} [params] URL parameters
         * @returns {string} the full URL for the popout player
         */
        'getURL': function (id, params = null) {
            console.log('[Background] Popout.getURL()', id, params);

            // TODO: if autoplay is disabled, we can omit the video ID from the path; as long as either `playlist` or `list` has a value, the Embedded Player will use it when the user clicks play (for single videos, this will prevent it appearing as a playlist with 2 videos, even though it is just the same video twice)
            // TODO: there may be some other edge cases to consider, like setting the start time with autoplay disabled

            let url = YOUTUBE_EMBED_URL + id;

            if (params !== undefined && params !== null) {
                url += '?' + new URLSearchParams(params).toString();
            }

            console.log('[Background] Popout.getURL() :: Return', url);
            return url;
        },

        /**
         * Gets the data needed to open a popout player, using some data from the original video player
         * @param {object} data data from the original video player ({id, list, time, width, height})
         * @returns {object} the data needed to open a popout player
         */
        'getPopoutPlayerData': async function ({ id, list, time, width, height }) {
            console.log('[Background] Popout.getPopoutPlayerData()', id, list, time, width, height);

            // https://developers.google.com/youtube/player_parameters
            const params = {};

            // custom flag for determining if the embedded player is playing within a popout window/tab
            params.popout = 1;

            const behavior = await Options.GetLocalOptionsForDomain('behavior');

            ['autoplay', 'loop'].forEach(param => {
                params[param] = behavior[param] ? 1 : 0;   // convert true/false to 1/0 for URL params
            });

            switch (behavior.controls.toLowerCase()) {
                case 'none':
                    params.controls = 0;
                    params.modestbranding = 1;
                    break;

                case 'standard':
                    params.controls = 1;
                    params.modestbranding = 0;
                    break;

                case 'extended':
                    params.controls = 1;
                    params.modestbranding = 0;
                    break;

                default:
                    console.warn('[Background] Popout.getPopoutPlayerData() :: Invalid value for controls option', behavior.controls);
                    // use values for "standard" configuration
                    params.controls = 1;
                    params.modestbranding = 0;
                    break;
            }

            params.controls = (behavior.controls === 'none') ? 0 : 1;

            if (time <= START_THRESHOLD) {
                console.info('[Background] Popout.getPopoutPlayerData() :: Popout video will start from beginning');
                time = 0;
            }
            params.start = time;

            if (list !== undefined && list !== null) {
                // `list` is the identifier for either: playlist, search, or user_uploads
                params.list = list;
            } else if (behavior.loop) {
                // `playlist` is a comma-separated list of video IDs to play
                // to loop a single video, the playlist parameter value must be set to the video's ID
                params.playlist = id;
            }

            const url = this.getURL(id, params);

            const size = await this.getPopoutPlayerSize(width, height);

            const data = {
                'url': url,
                'width': size.width,
                'height': size.height
            };

            console.log('[Background] Popout.getPopoutPlayerData() :: Return', data);
            return data;
        },

        /**
         * Gets the size (width and height) that the popout player should be
         * @param {number} width the width of the original video player
         * @param {number} height the height of the original video player
         * @returns {object} the width and height for the popout player
         */
        'getPopoutPlayerSize': async function (width, height) {
            console.log('[Background] Popout.getPopoutPlayerSize()', width, height);

            const sizeOptions = await Options.GetLocalOptionsForDomain('size');
            console.log('[Background] Popout.getPopoutPlayerSize() :: Size options', sizeOptions);

            if (sizeOptions.mode.toLowerCase() === 'custom') {
                switch (sizeOptions.units.toLowerCase()) {
                    case 'pixels':
                        width = sizeOptions.width;
                        height = sizeOptions.height;
                        break;

                    case 'percentage':
                        width = Utils.GetDimensionForScreenPercentage('Width', sizeOptions.width);
                        height = Utils.GetDimensionForScreenPercentage('Height', sizeOptions.height);
                        break;

                    default:
                        console.warn('[Background] Popout.getPopoutSize() :: Invalid value for "size.units" option', sizeOptions.units);
                        // do nothing; use the original video player's dimensions instead
                        break;
                }
            }

            const size = {
                'width': width,
                'height': height
            };

            console.log('[Background] Popout.getPopoutPlayerSize() :: Return', size);
            return size;
        },

        'closeOriginalTab': async function (tabId) {
            console.log('[Background] Popout.closeOriginalTab()', tabId);

            const closeOriginalWindowTab = await Options.GetLocalOption('advanced', 'close');

            if (closeOriginalWindowTab) {
                const tab = await browser.tabs.get(tabId);
                if (tab && tab.url) {
                    console.log('[Background] Popout.closeOriginalTab() :: Original tab', tab);

                    const url = new URL(tab.url);
                    const domain = url.hostname.split('.').splice(-2).join('.');
                    console.log('[Background] Popout.closeOriginalTab() :: Original tab domain', domain);

                    if (domain === 'youtube.com') {   // TODO: other YouTube domains to support?
                        console.log('[Background] Popout.closeOriginalTab() :: Closing original tab');
                        const promise = browser.tabs.remove(tab.id);

                        console.log('[Background] Popout.closeOriginalTab() :: Return [Promise]', promise);
                        return promise;
                    } else {
                        console.info('[Background] Popout.closeOriginalTab() :: Original tab is NOT YouTube');
                    }
                }
            }

            return;
        }

    };

    return Popout;

})();

export default Popout;
