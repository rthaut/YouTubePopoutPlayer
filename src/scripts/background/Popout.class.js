import { YOUTUBE_EMBED_URL, START_THRESHOLD } from '../../helpers/constants';
import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';

const Popout = (() => {

    const WIDTH_PADDING = 16;   // TODO: find a way to calculate this (or make it configurable)
    const HEIGHT_PADDING = 40;  // TODO: find a way to calculate this (or make it configurable)

    const Popout = {

        'open': async function ({ id, list, time, width, height }) {
            console.log('[Background] Popout.open()', id, list, time, width, height);

            let promise;

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
                    console.warn('[Background] Popout.open() :: Invalid value for controls option', behavior.controls);
                    // use values for "standard" configuration
                    params.controls = 1;
                    params.modestbranding = 0;
                    break;
            }

            params.controls = (behavior.controls === 'none') ? 0 : 1;

            if (time <= START_THRESHOLD) {
                console.info('[Background] Popout.open() :: Popout video will start from beginning');
                time = 0;
            }
            params.start = time;

            if (list !== undefined && list !== null) {
                // `list` is the identifier for either: playlist, search, or user_uploads
                params.list = list;

                // TODO: handle the other two list types (search and user_uploads)
                // this will likely need to come from the original URL (when it is parsed in the content script)
                if (list.startsWith('PL')) {
                    params.listType = 'playlist';
                }
            } else if (behavior.loop) {
                // `playlist` is a comma-separated list of video IDs to play
                // to loop a single video, the playlist parameter value must be set to the video's ID
                params.playlist = id;
            }

            const url = this.getURL(id, params);

            switch (behavior.target.toLowerCase()) {
                case 'tab':
                    promise = this.openTab(url);
                    break;

                case 'window':
                default:
                    promise = this.openWindow(url, width, height);
                    break;
            }

            console.log('[Background] Popout.open() :: Return [Promise]', promise);
            return promise;
        },

        'openTab': function (url) {
            console.log('[Background] Popout.openTab()', url);

            const createData = {
                'active': true,     // TODO: should this be configurable?
                'url': url
            };

            console.log('[Background] Popout.openTab() :: Creating Tab', createData);
            const promise = browser.tabs.create(createData);

            console.log('[Background] Popout.openTab() :: Return [Promise]', promise);
            return promise;
        },

        'openWindow': async function (url, width, height) {
            console.log('[Background] Popout.openWindow()', url, width, height);

            const size = await Options.GetLocalOptionsForDomain('size');
            console.log('[Background] Popout.openWindow() :: Size options', size);

            if (size.mode.toLowerCase() === 'custom') {
                switch (size.units.toLowerCase()) {
                    case 'pixels':
                        width = size.width;
                        height = size.height;
                        break;

                    case 'percentage':
                        width = Utils.GetDimensionForScreenPercentage('Width', size.width);
                        height = Utils.GetDimensionForScreenPercentage('Height', size.height);
                        break;

                    default:
                        console.warn('[Background] Popout.openWindow() :: Invalid value for "size.units" option', size.units);
                        // do nothing; use the original video player's dimensions instead
                        break;
                }
            }

            const createData = {
                'width': width + WIDTH_PADDING,     // manually increasing size to account for window frame
                'height': height + HEIGHT_PADDING,  // manually increasing size to account for window frame
                'type': 'popup',
                'url': url
            };

            const isFirefox = await Utils.IsFirefox();

            if (isFirefox) {
                createData.titlePreface = await Options.GetLocalOption('advanced', 'title');
            }

            console.log('[Background] Popout.openWindow() :: Creating Window', createData);
            const promise = browser.windows.create(createData);

            console.log('[Background] Popout.openWindow() :: Return [Promise]', promise);
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

            let url = YOUTUBE_EMBED_URL + id;

            if (params !== undefined && params !== null) {
                url += '?' + new URLSearchParams(params).toString();
            }

            console.log('[Background] Popout.getURL() :: Return', url);
            return url;
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
