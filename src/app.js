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
        this.red = red ? red : 0;
        this.green = green ? green : 0;
        this.blue = blue ? blue : 0;
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
        this.cyan = cyan ? cyan : 0;
        this.magenta = magenta ? magenta : 0;
        this.yellow = yellow ? yellow : 0;
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
            color += "C:" + this.cyan.toFixed(2) + " ";
            color += "M:" + this.magenta.toFixed(2) + " ";
            color += "Y:" + this.yellow.toFixed(2);
            return color;
        }
    });

    function mainController($scope) {
        $scope.selectedTabIndex = 0;

        $scope.currentPalette = [];
        $scope.currentColorSpace = 'subtractive';

        $scope.$watch('currentColorSpace', function () {
            $scope.currentPalette = [];
        });

        $scope.addColorToPalette = function (color) {
            $scope.currentPalette.push(color);
        }
    }

    function colorPicker() {
        return {
            restrict: 'E',
            scope: {
                colorSpace: '=',
                saveColor: '&'
            },
            template: function () {
                return "<div>Color Picker</div>" +
                    "<div class='md-whiteframe-2dp large color-bubble' style='background-color: {{color.hex}}'></div>" +
                    "<div ng-show='colorSpace === \"additive\"' layout='row'>" +
                    "   <md-input-container flex> " +
                    "       <label>Red</label> <input ng-model='color.red' type='number' min='0' max='255' step='5'> " +
                    "   </md-input-container>" +
                    "   <md-input-container flex> " +
                    "       <label>Green</label> <input ng-model='color.green' type='number' min='0' max='255' step='5'> " +
                    "   </md-input-container>" +
                    "   <md-input-container flex> " +
                    "       <label>Blue</label> <input ng-model='color.blue' type='number' min='0' max='255' step='5'> " +
                    "   </md-input-container>" +
                    "</div>" +
                    "<div ng-show='colorSpace === \"subtractive\"' layout='row'>" +
                    "   <md-input-container flex> " +
                    "       <label>Cyan</label> <input ng-model='color.cyan' type='number' min='0' max='1' step='0.05'>" +
                    "   </md-input-container>" +
                    "   <md-input-container flex> " +
                    "       <label>Magenta</label> <input ng-model='color.magenta' type='number' min='0' max='1' step='0.05'>" +
                    "   </md-input-container>" +
                    "   <md-input-container flex> " +
                    "       <label>Yellow</label> <input ng-model='color.yellow' type='number' min='0' max='1' step='0.05'>" +
                    "   </md-input-container>" +
                    "</div>" +
                    "<md-button class='md-primary md-raised' ng-click='add()'>Add</md-button>";
            },
            link: function (scope) {
                scope.$watch('colorSpace', function (colorSpace) {
                    if (colorSpace === 'additive')
                        scope.color = new AdditiveColor(0, 0, 0);
                    if (colorSpace === 'subtractive')
                        scope.color = new SubtractiveColor(0, 0, 0);
                });

                scope.add = function () {
                    scope.saveColor({color: scope.color});
                    if (scope.colorSpace === 'additive')
                        scope.color = new AdditiveColor(0, 0, 0);
                    if (scope.colorSpace === 'subtractive')
                        scope.color = new SubtractiveColor(0, 0, 0);
                }

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
                return "<span>{{ title }}:</span><md-button ng-repeat='color in palette' ng-click='remove($index)'" +
                    "class='md-fab color-bubble' style='background-color: {{ color.hex }}'>" +
                    "<md-icon class='material-icons'>remove</md-icon>" +
                    "<md-tooltip md-direction='bottom'>{{color.shortName}}</md-tooltip>" +
                    "</md-button>";
            },
            link: function (scope, element) {
                // element.addClass('');
                element.attr('layout="row"');

                console.log('Doing stuff');

                scope.remove = function (index) {
                    console.log('Deleting stuff');
                    scope.palette.splice(index, 1);
                }
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
                return "<div class='color-box' style='background-color: {{ mixedColor.hex }}'>" +
                    "   <div class='color-indicator' ng-show='mixedColor'>{{mixedColor.result.shortName}}</div>" +
                    "</div>" +
                    "<div class='percent-color-line' layout='row' ng-show='colorSpace === \"subtractive\"' >" +
                    "   <div style='background-color: {{ color.hex }}; flex: {{ mixedColor.weights[$index] }}'" +
                    "           ng-repeat='color in palette'></div>" +
                    "</div>" +
                    "<div ng-show='colorSpace === \"subtractive\"'>" +
                    "   <md-button ng-click='addUnitOfColor($index)' class='md-fab'" +
                    "           ng-repeat='color in palette' style='background-color: {{ color.hex }}'> " +
                    "       <md-icon class='material-icons'>add</md-icon> </md-button>" +
                    "</div>" +
                    "<div class='additive-slider-container' ng-show='colorSpace === \"additive\"'>" +
                    "   <md-slider ng-repeat='color in palette' style='background-color: {{ color.hex }}'" +
                    "           step='.005' min='0' max='1' ng-model='mixedColor.weights[$index]'></md-slider> " +
                    "</div>" +
                    "<div>" +
                    "   <md-button class='md-primary md-raised' ng-click='resetColors()'>Reset</md-button>" +
                    "   <md-button class='md-raised' ng-click='addToPalette()'>Add to Palette</md-button>" +
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

                scope.$watch('palette.length', function () {
                    scope.mixedColor.resetColors();
                });

                scope.$watch('colorSpace', function () {
                    scope.mixedColor = new MixedColor(scope.palette, scope.colorSpace);
                });

                scope.addToPalette = function () {
                    scope.palette.push(angular.copy(scope.mixedColor.result));
                }
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

        red = Math.min(red, 255);
        green = Math.min(green, 255);
        blue = Math.min(blue, 255);

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