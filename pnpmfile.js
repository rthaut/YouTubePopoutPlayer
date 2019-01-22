/* global module */
module.exports = {
    'hooks': {
        readPackage(pkg) {
            switch (pkg.name) {
                case 'web-ext':
                    pkg.dependencies['colors'] = '*';
                    pkg.dependencies['es6-promise'] = '*';
                    pkg.dependencies['js-select'] = '*';
                    pkg.dependencies['eslint-plugin-no-unsafe-innerhtml'] = '*';
                    break;
            }
            return pkg;
        }
    }
};
