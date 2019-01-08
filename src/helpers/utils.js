const Utils = (() => {

    const Utils = {

        'GetDimensionForScreenPercentage': function (dimension, percentage) {
            if (percentage > 0) {
                percentage = (percentage / 100);
            }

            return parseInt(window.screen[`avail${dimension}`] * percentage, 10);
        }

    };

    return Utils;

})();

export default Utils;
