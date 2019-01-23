import { MSG_REGEX } from '../../helpers/constants';
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
    console.log('[Background] Extension Installed/Updated', details);

    // using the __MSG_ + messageName + __ format for Command Descriptions in the manifest.json doesn't work...
    // so instead we explicitly update them all whenever the extension is installed or updated
    // (Bugzilla Bug Report: https://bugzilla.mozilla.org/show_bug.cgi?id=1272130)
    if (['install', 'update'].includes(details.reason)) {
        InternationalizeCommandDescriptions();
    }

    if (details.reason === 'install') {
        console.log('[Background] Extension Installed :: Initializing Defaults for Options');
        Options.InitLocalStorageDefaults();
    } else if (details.reason === 'update') {
        console.log('[Background] Extension Updated :: Initializing Defaults for New Options');
        Options.InitLocalStorageDefaults(false);
    }
});

browser.runtime.onMessage.addListener((message, sender) => {
    console.log('[Background] Runtime Message', message, sender);

    if (message.action !== undefined) {

        switch (message.action.toLowerCase()) {

            case 'open-popout':
                return Popout.open(message.data);

            case 'get-commands':
                return browser.commands.getAll();

        }

        console.log('[Background] Runtime Message :: Unhandled Action');
        return;
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

/**
 * Internationalizes command descriptions (if they are specified using the __MSG_ + messageName + __ format in the manifest.json)
 */
async function InternationalizeCommandDescriptions() {
    console.log('[Background] InternationalizeCommandDescriptions() :: Can Reset Commands?', typeof browser.commands.reset === 'function');
    if (typeof browser.commands.reset === 'function') {
        const commands = await browser.commands.getAll();
        for (const command of commands) {
            console.log(`[Background] InternationalizeCommandDescriptions() :: Processing "${command.name}" command`, command);

            // reset the command to the default values from the manifest.json
            await browser.commands.reset(command.name);

            // now retrieve the value from the reset command
            // (it would be SUPER HELPFUL if browser.commands.reset() returned the reset command in the promise)
            let description = await browser.commands.getAll().then(commands => {
                return commands.find(c => c.name === command.name).description;
            });
            console.log(`[Background] InternationalizeCommandDescriptions() :: Default "${command.name}" description`, description);

            // if the description matches the __MSG_ + messageName + __ format, retrieve the internationalized string from _locales
            const msg = MSG_REGEX.exec(description);
            if (msg && msg[1]) {
                description = browser.i18n.getMessage(msg[1]);
                console.log(`[Background] InternationalizeCommandDescriptions() :: Internationalized "${command.name}" command description`, description);
            }

            // update the command (using the original shortcut and new description), effectively undoing the browser.commands.reset()
            // but ensuring the description is up-to-date with the manifest.json and the corresponding internationalized string
            browser.commands.update({
                'name': command.name,
                'description': description,
                'shortcut': command.shortcut
            });
        }
    }
}
