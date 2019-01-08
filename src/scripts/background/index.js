import Popout from './Popout.class';

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((message, sender) => {
    console.group('[Background] Runtime Message', message, sender);

    if (message.action !== undefined) {

        switch (message.action) {
            case 'open-popout': return Popout.open(message.data);
        }

        console.group('[Background] Runtime Message :: Unhandled Action');
        return true;
    }

    console.groupEnd();
});


