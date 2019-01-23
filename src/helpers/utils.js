const Utils = (() => {

    const Utils = {

        'GetDimensionForScreenPercentage': function (dimension, percentage) {
            if (percentage > 0) {
                percentage = (percentage / 100);
            }

            return parseInt(window.screen[`avail${dimension}`] * percentage, 10);
        },

        'TitleCase': function (str) {
            return str.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }

    };

    return Utils;

})();

export default Utils;
