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

            const attrs = {};

            // custom flag for determining if the embedded player is playing within a popout window/tab
            attrs.popout = 1;

            if (list != null) {
                attrs.list = list;
            }

            attrs.autoplay = 1; // TODO: should this be configurable?

            if (time <= START_THRESHOLD) {
                console.info('[Background] Popout.open() :: Popout video will start from beginning');
                time = 0;
            }
            attrs.start = time;

            const url = this.getURL(id, attrs);

            const target = await Options.GetLocalOption('behavior', 'target');
            switch (target) {
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

            const promise = browser.tabs.create({
                'active': true,                // TODO: should this be configurable?
                'url': url
            });

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
                }
            }

            const promise = browser.windows.create({
                'width': width + WIDTH_PADDING,     // manually increasing size to account for window frame
                'height': height + HEIGHT_PADDING,  // manually increasing size to account for window frame
                // 'titlePreface': 'YTPP :: ',  // TODO: this should be configurable
                'type': 'popup',
                'url': url
            });

            console.log('[Background] Popout.openWindow() :: Return [Promise]', promise);
            return promise;
        },

        'getURL': function (id, attrs) {
            console.log('[Background] Popout.getURL()', id, attrs);

            var url = YOUTUBE_EMBED_URL + id + '?';

            if (attrs !== undefined) {
                for (var attr in attrs) {
                    url += attr + '=' + attrs[attr] + '&';
                }
                url = url.replace(/\&$/, ''); // trim trailing ampersand (&)
            }

            console.log('[Background] Popout.getURL() :: Return', url);
            return url;
        },

        'closeOriginalTab': async function (tabId) {
            console.log('[Background] Popout.closeOriginalTab()', tabId);

            let promise;

            const closeOriginal = await Options.GetLocalOption('behavior', 'closeOriginal');

            if (closeOriginal) {
                const tab = await browser.tabs.get(tabId);
                if (tab && tab.url) {
                    console.log('[Background] Popout.closeOriginalTab() :: Original tab', tab);

                    const url = new URL(tab.url);
                    const domain = url.hostname.split('.').splice(-2).join('.');
                    console.log('[Background] Popout.closeOriginalTab() :: Original tab domain', domain);

                    if (domain === 'youtube.com') {   // TODO: other YouTube domains to support?
                        console.log('[Background] Popout.closeOriginalTab() :: Closing original tab');
                        promise = browser.tabs.remove(tab.id);
                    } else {
                        console.info('[Background] Popout.closeOriginalTab() :: Original tab is NOT YouTube');
                    }
                }
            }

            console.log('[Background] Popout.closeOriginalTab() :: Return [Promise]', promise);
            return promise;
        }

    };

    return Popout;

})();

export default Popout;