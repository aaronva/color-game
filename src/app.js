(function () {
    'use strict';
    angular.module('colorApp', ['ngMaterial'])
        .controller('mainController', mainController)
        .directive('colorPicker', colorPicker)
        .directive('paletteDisplay', paletteDisplay);

    function AdditiveColor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    Object.defineProperty(AdditiveColor.prototype, "hex", {
        get: function hex() {
            var color = "#";
            color += ("00" + this.red.toString(16)).substr(-2);
            color += ("00" + this.green.toString(16)).substr(-2);
            color += ("00" + this.blue.toString(16)).substr(-2);
            return color;
        }
    });

    Object.defineProperty(AdditiveColor.prototype, "shortName", {
        get: function hex() {
            var color = "";
            color += "R:" + this.red + " ";
            color += "G:" + this.green + " ";
            color += "B:" + this.blue ;
            return color;
        }
    });

    function mainController($scope) {
        $scope.selectedTabIndex = 0;

        $scope.currentPalette = [];

        $scope.currentPalette.push(new AdditiveColor(255, 0, 0));
        $scope.currentPalette.push(new AdditiveColor(0, 255, 0));
        $scope.currentPalette.push(new AdditiveColor(0, 0, 255));
    }

    function colorPicker() {
        return {
            restrict: 'E',
            scope: {
                colorSpace: '='
            },
            template: function () {
                return "<div>Color Picker</div>";
            }
        }
    }

    function paletteDisplay() {
        return {
            restrict: 'E',
            scope: {
                palette: '=',
                title: '='
            },
            template: function () {
                return "<span>{{ title }}:</span><div ng-repeat='color in palette' " +
                    "class='color-bubble md-whiteframe-2dp' style='background-color: {{ color.hex }}'>" +
                    "<md-tooltip md-direction='bottom'>{{color.shortName}}</md-tooltip></div>";
            },
            controller: function ($scope, $element) {
                // element.addClass('');
                $element.attr('layout="row"');

                console.log($scope);
                console.log($scope.palette[0].hex);
            }
        }
    }
})();