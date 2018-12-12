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
            browser.storage.sync.set.apply(null, arguments);
        }

        loadSettings() {
            console.group('Config.loadSettings()');
            console.log('Calling storage API');

            var getting = browser.storage.sync.get();
            getting.then(
                (results) => {
                    console.log('Got results: ', results);
                    this.settings = results
                },
                (error) => {console.log(`Error: ${error}`)}
            );
            
            console.groupEnd();
        }
    }
    return Config;
})();

export default Config;
