angular.module('Options', ['ngMessages']).controller('OptionsCTRL', [
    '$scope',
    function ($scope) {
        $scope.options = {
            'behavior': {
                'target': 'window'
            },
            'size': {
                'mode': 'current',
                'units': 'pixels',
                'height': 0,
                'width': 0
            },
        };

        $scope.aspectRatio = function () {
            function gcd(a, b) {
                return (b == 0) ? a : gcd(b, a % b);
            }

            if ((parseInt($scope.options.size.width, 10) > 0) && (parseInt($scope.options.size.height, 10) > 0)) {
                var width = $scope.options.size.width;
                var height = $scope.options.size.height;
                var ratio = gcd(width, height);
                return width / ratio + ':' + height / ratio;
            }

            return 'N/A';
        };

        $scope.sizeUnits = function () {
            switch ($scope.options.size.units.toLowerCase()) {
                case 'pixels': return 'px';
                case 'percentage': return '%';
                default: return '?';
            }
        };

        $scope.sizeMax = function (dimension) {
            switch ($scope.options.size.units.toLowerCase()) {
                case 'pixels':
                    switch (dimension.toLowerCase()) {
                        case 'width':
                        case 'height':
                        default:
                            return '';   // TODO: this should limit to the user's screen resolution
                    }

                case 'percentage':
                    return '100';

                default:
                    return '?';
            }
        };
    }
]);
