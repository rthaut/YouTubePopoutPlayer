const Config = (() => {
    class Config {
        constructor() {
            console.group('Config()');

            console.log('Building Defaults');
            this.defaults = {
                width: 854,
                height: 480,
                startThreshold: 5
            };
            console.log('Defaults: ', this.defaults);

            this.settings = {};
            this.loadSettings();

            console.groupEnd();
        }

        get(key) {
            return this.settings[key] || this.defaults[key] || null;
        }

        set() {
            chrome.storage.sync.set.apply(null, arguments);
        }

        loadSettings() {
            console.group('Config.loadSettings()');
            console.log('Calling storage API');

            chrome.storage.sync.get(null, (results) => {
                console.log('Got settings: ', results);
                this.settings = results;
            });

            console.groupEnd();
        }
    }
    return Config;
})();

export default Config;
