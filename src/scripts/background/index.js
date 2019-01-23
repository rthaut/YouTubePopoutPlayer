import Options from '../../helpers/Options';
import Popout from './Popout.class';

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((message, sender) => {
    console.log('[Background] Runtime Message', message, sender);

    if (message.action !== undefined) {

        switch (message.action.toLowerCase()) {

            case 'open-popout':
                return Popout.open(message.data);

            case 'close-original-tab':
                return Popout.closeOriginalTab(sender.tab.id);

        }

        console.log('[Background] Runtime Message :: Unhandled Action');
        return true;
    }

});

browser.runtime.onInstalled.addListener(details => {
    console.log('[Background] Extension Installed', details);

    if (details.reason === 'install') {
        console.log('[Background] Extension Installed :: Initializing Defaults for All Options');
        Options.InitLocalStorageDefaults(true);
    } else if (details.reason === 'update') {
        console.log('[Background] Extension Updated :: Initializing Defaults for New Options');
        Options.InitLocalStorageDefaults(false);
    }
});
