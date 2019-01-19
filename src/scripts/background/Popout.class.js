import { YOUTUBE_EMBED_URL, START_THRESHOLD } from '../../helpers/constants';
import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';

const Popout = (() => {

    const Popout = {

        'open': async function ({ id, list, time, width, height }) {
            console.log('[Background] Popout.open()', id, list, time, width, height);

            const attrs = {};

            if (list != null) {
                attrs.list = list;
            }

            attrs.autoplay = 1; // TODO: should this be configurable?

            if (time <= START_THRESHOLD) {
                console.info('Popout video will start from beginning');
                time = 0;
            }
            attrs.start = time;

            const url = this.getURL(id, attrs);

            const target = await Options.GetLocalOption('behavior', 'target');
            let promise;
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
            console.log('[Background] Popout.openWindow() :: Size Options', size);

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
                // 'alwaysOnTop': true,         // TODO: not supported in Firefox, maybe supported in Chrome?
                'width': width,
                'height': height,               // TODO: it seems this needs to account for the window's frame (title bar)
                // 'titlePreface': 'YTPP :: ',  // TODO: this should be configurable
                'type': 'popup',                // TODO: should this be configurable?
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
        }

    };

    return Popout;

})();

export default Popout;
