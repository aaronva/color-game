(function () {
    'use strict';
    angular.module('colorApp', ['ngMaterial'])
        .config(config)
        .controller('mainController', mainController)
        .directive('colorPicker', colorPicker)
        .directive('paletteDisplay', paletteDisplay)
        .directive('colorMixer', colorMixer);

    function config($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    }

    function AdditiveColor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    Object.defineProperty(AdditiveColor.prototype, "hex", {
        get: function () {
            var color = "#";
            color += ("00" + this.red.toString(16)).substr(-2);
            color += ("00" + this.green.toString(16)).substr(-2);
            color += ("00" + this.blue.toString(16)).substr(-2);
            return color;
        }
    });

    Object.defineProperty(AdditiveColor.prototype, "shortName", {
        get: function () {
            var color = "";
            color += "R:" + this.red + " ";
            color += "G:" + this.green + " ";
            color += "B:" + this.blue;
            return color;
        }
    });

    function SubtractiveColor(cyan, magenta, yellow) {
        this.cyan = cyan;
        this.magenta = magenta;
        this.yellow = yellow;
    }

    Object.defineProperty(SubtractiveColor.prototype, "hex", {
        get: function () {
            var color = "#";
            color += ("00" + Math.round((1 - this.cyan) * 255).toString(16)).substr(-2);
            color += ("00" + Math.round((1 - this.magenta) * 255).toString(16)).substr(-2);
            color += ("00" + Math.round((1 - this.yellow) * 255).toString(16)).substr(-2);
            return color;
        }
    });

    Object.defineProperty(SubtractiveColor.prototype, "shortName", {
        get: function () {
            var color = "";
            color += "C:" + this.cyan + " ";
            color += "M:" + this.magenta + " ";
            color += "Y:" + this.yellow;
            return color;
        }
    });

    function mainController($scope) {
        $scope.selectedTabIndex = 0;

        $scope.currentPalette = [];
        $scope.currentColorSpace = 'subtractive';

        $scope.currentPalette.push(new SubtractiveColor(1, 0, 0));
        $scope.currentPalette.push(new SubtractiveColor(0, 1, 0));
        $scope.currentPalette.push(new SubtractiveColor(0, 0, 1));
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
            link: function (scope, element) {
                // element.addClass('');
                element.attr('layout="row"');

                console.log(scope);
                console.log(scope.palette[0].hex);
            }
        }
    }

    function MixedColor(palette, colorSpace) {
        this.palette = palette;
        this.colorSpace = colorSpace;

        this.addUnitOfColor = function (index) {
            this.weights[index]++;
        };

        this.removeUnitOfColor = function (index) {
            this.weights[index] = Math.max(this.weights[index] - 1, 0);
        };

        this.resetColors = function () {
            this.weights = [];
            for (var i = 0; i < palette.length; i++) this.weights.push(0);
        };

        this.resetColors();
    }

    Object.defineProperty(MixedColor.prototype, "result", {
        get: function () {
            if (this.colorSpace === 'additive')
                return mixAdditive(this.palette, this.weights);
            if (this.colorSpace === 'subtractive')
                return mixSubtractive(this.palette, this.weights);

            return null;
        }
    });

    Object.defineProperty(MixedColor.prototype, "hex", {
        get: function () {
            return this.result.hex;
        }
    });

    function colorMixer() {
        return {
            restrict: 'E',
            scope: {
                targetColor: '=?',
                palette: '=',
                colorSpace: '='
            },
            template: function () {
                return "<div class='color-box' style='background-color: {{ mixedColor.hex }}'></div>" +
                    "<div class='percent-color-line' layout='row' ng-show='colorSpace === \"subtractive\"' >" +
                    "   <div style='background-color: {{ color.hex }}; flex: {{ mixedColor.weights[$index] }}'" +
                    "           ng-repeat='color in palette'></div>" +
                    "</div>" +
                    "<div ng-show='colorSpace === \"subtractive\"'>" +
                    "   <md-button ng-click='addUnitOfColor($index)' class='md-fab'" +
                    "           ng-repeat='color in palette' style='background-color: {{ color.hex }}'> " +
                    "       <md-icon class='material-icons'>add</md-icon> </md-button>" +
                    "   <md-button class='md-primary md-raised' ng-click='resetColors()'>Reset</md-button>" +
                    "</div>" +
                    "<div class='additive-slider-container' ng-show='colorSpace === \"additive\"'>" +
                    "   <md-slider ng-repeat='color in palette' style='background-color: {{ color.hex }}'" +
                    "           step='.005' min='0' max='1' ng-model='mixedColor.weights[$index]'></md-slider> " +
                    "</div>";
            },
            link: function (scope, element) {
                scope.mixedColor = new MixedColor(scope.palette, scope.colorSpace);

                scope.addUnitOfColor = function (index) {
                    scope.mixedColor.addUnitOfColor(index);
                };

                scope.resetColors = function () {
                    scope.mixedColor.resetColors();
                };

                console.log(scope.mixedColor);
            }
        };
    }

    function mixAdditive(palette, weights) {
        var red = 0, green = 0, blue = 0;

        for (var i = 0; i < palette.length; i++) {
            var color = palette[i];
            red += Math.round(color.red * weights[i]);
            green += Math.round(color.green * weights[i]);
            blue += Math.round(color.blue * weights[i]);
        }

        return new AdditiveColor(red, green, blue);
    }


    function mixSubtractive(palette, weights) {
        var cyan = 0, magenta = 0, yellow = 0;
        // var cyanTotalWeight = 0, magentaTotalWeight = 0, yellowTotalWeight = 0;
        var totalWeights = 0;

        for (var i = 0; i < palette.length; i++) {
            var color = palette[i];
            cyan += color.cyan * weights[i];
            magenta += color.magenta * weights[i];
            yellow += color.yellow * weights[i];
            totalWeights += weights[i];
        }

        cyan = cyan / totalWeights;
        magenta = magenta / totalWeights;
        yellow = yellow / totalWeights;

        return new SubtractiveColor(cyan, magenta, yellow);
    }
})();