module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "webextensions": true
    },
    "globals": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 8
    },
    "rules": {
        "curly": ["error", "multi-line"],
        "no-console": "off",
        "no-unused-vars": ["error", {
            "vars": "local",
            "args": "none"
        }],
        "no-useless-escape": "off",
        "prefer-const": ["error"],
        "semi": ["error", "always"],
        "quotes": ["error", "single"],
        "quote-props": ["error", "always"]
    }
}
