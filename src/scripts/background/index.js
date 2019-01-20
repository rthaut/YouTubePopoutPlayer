import Options from '../../helpers/Options';
import Popout from './Popout.class';

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.commands.onCommand.addListener(command => {
    console.log('YouTubePopoutPlayer() :: Command', command);

    switch (command) {

        case 'open-popout':
            console.log('YouTubePopoutPlayer() :: Instructing Active Tab to Open Popout Player');
            SendMessageToActiveTab({
                'action': 'open-popout-command'
            });
            break;

    }
});

browser.runtime.onInstalled.addListener(details => {
    console.log('[Background] Extension Installed', details);

    if (details.reason === 'install') {
        console.log('[Background] Extension Installed :: Initializing Defaults for Options');
        Options.InitLocalStorageDefaults();
    }
});

browser.runtime.onMessage.addListener((message, sender) => {
    console.log('[Background] Runtime Message', message, sender);

    if (message.action !== undefined) {

        switch (message.action.toLowerCase()) {

            case 'open-popout':
                return Popout.open(message.data);

        }

        console.log('[Background] Runtime Message :: Unhandled Action');
        return true;
    }
});

/**
 * Sends a message to the active browser tab
 * @param {Object} message the message to send to the active tab
 * @returns {Promise}
 */
function SendMessageToActiveTab(message) {
    return browser.tabs.query({
        'currentWindow': true,
        'active': true
    }).then(tabs => {
        return Promise.all(tabs.map(tab => browser.tabs.sendMessage(tab.id, message)));
    });
}
