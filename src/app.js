(function () {
    'use strict';
    angular.module('colorApp', ['ngMaterial'])
        .config(config)
        .controller('mainController', mainController)
        .directive('colorPicker', colorPicker)
        .directive('paletteDisplay', paletteDisplayDirective)
        .directive('colorMixer', colorMixerDirective)
        .directive('mixingGame', mixingGameDirective);

    function config($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    }

    function AdditiveColor(red, green, blue) {
        this.red = red ? red : 0;
        this.green = green ? green : 0;
        this.blue = blue ? blue : 0;


        this.percMatch = function (other) {
            var absDiff = 0;

            absDiff += Math.abs(this.red - other.red);
            absDiff += Math.abs(this.green - other.green);
            absDiff += Math.abs(this.blue - other.blue);

            return 1 - absDiff / (255 * 3);
        }
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

        this.percMatch = function (other) {
            var absDiff = 0;

            absDiff += Math.abs(this.cyan - other.cyan);
            absDiff += Math.abs(this.magenta - other.magenta);
            absDiff += Math.abs(this.yellow - other.yellow);

            return 1 - absDiff / 3;
        }
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

    function premadeAdditivePalettes() {
        var premadePalettes = [];

        var primaryPalette = {
            name: 'Primary Colors',
            description: 'These are the primary colors that can be used to create any color in additive space',
            palette: []
        };

        primaryPalette.palette.push(new AdditiveColor(255, 0, 0));
        primaryPalette.palette.push(new AdditiveColor(0, 255, 0));
        primaryPalette.palette.push(new AdditiveColor(0, 0, 255));

        premadePalettes.push(primaryPalette);

        var whiteTintedLight = {
            name: 'Mostly White Light',
            // description: 'These are the primary colors that can be used to create any color in additive space',
            palette: []
        };

        whiteTintedLight.palette.push(new AdditiveColor(255, 150, 150));
        whiteTintedLight.palette.push(new AdditiveColor(150, 255, 150));
        whiteTintedLight.palette.push(new AdditiveColor(150, 150, 255));

        premadePalettes.push(whiteTintedLight);

        var noBlueLight = {
            name: 'No Pure Blue Light',
            // description: 'These are the primary colors that can be used to create any color in additive space',
            palette: []
        };

        noBlueLight.palette.push(new AdditiveColor(255, 0, 0));
        noBlueLight.palette.push(new AdditiveColor(0, 255, 0));
        noBlueLight.palette.push(new AdditiveColor(0, 255, 150));
        noBlueLight.palette.push(new AdditiveColor(255, 0, 150));

        premadePalettes.push(noBlueLight);


        return premadePalettes;
    }

    function premadeSubtractivePalettes() {
        var premadePalettes = [];

        var primaryPalette = {
            name: 'Primary Colors',
            description: 'These are the primary colors that can be used to create any color in subtractive space',
            palette: []
        };

        primaryPalette.palette.push(new SubtractiveColor(1, 0, 0));
        primaryPalette.palette.push(new SubtractiveColor(0, 1, 0));
        primaryPalette.palette.push(new SubtractiveColor(0, 0, 1));
        premadePalettes.push(primaryPalette);

        var primaryPalettePlusBlack = {
            name: 'CMYK',
            description: 'This is the standard primary set with the addition of black',
            palette: []
        };

        primaryPalettePlusBlack.palette.push(new SubtractiveColor(1, 0, 0));
        primaryPalettePlusBlack.palette.push(new SubtractiveColor(0, 1, 0));
        primaryPalettePlusBlack.palette.push(new SubtractiveColor(0, 0, 1));
        primaryPalettePlusBlack.palette.push(new SubtractiveColor(1, 1, 1));
        premadePalettes.push(primaryPalettePlusBlack);

        var classicPaintersPalette = {
            name: 'Split Primary Palette',
            // description: 'This is a standard painter\'s palette from before magenta was easily processed',
            palette: []
        };

        classicPaintersPalette.palette.push(new SubtractiveColor(0, 0.05, 1)); // Warm Yellow
        classicPaintersPalette.palette.push(new SubtractiveColor(.1, 0, 1)); // Cadmium Yellow
        classicPaintersPalette.palette.push(new SubtractiveColor(0, 1, .80)); // Warm Red
        classicPaintersPalette.palette.push(new SubtractiveColor(0, .80, 1)); // Cool Red
        classicPaintersPalette.palette.push(new SubtractiveColor(0.7, 1, 0)); // Warm Blue
        classicPaintersPalette.palette.push(new SubtractiveColor(1, 0.7, 0)); // Cool Blue
        premadePalettes.push(classicPaintersPalette);

        return premadePalettes;
    }

    function mainController($scope) {
        var premadePalettes = {
            additive: premadeAdditivePalettes(),
            subtractive: premadeSubtractivePalettes()
        };

        $scope.selectedTabIndex = 0;

        $scope.currentPalette = [];
        $scope.currentColorSpace = 'subtractive';

        $scope.$watch('currentColorSpace', function (value) {
            $scope.currentPalette = [];

            $scope.premadePalettes = premadePalettes[$scope.currentColorSpace];
        });

        $scope.selectPremadePalette = function (index) {
            $scope.currentPalette.splice(0, $scope.currentPalette.length);
            // $scope.currentPalette.concat(angular.copy($scope.premadePalettes[index].palette));
            for (var i = 0; i < $scope.premadePalettes[index].palette.length; i++) {
                $scope.currentPalette.push($scope.premadePalettes[index].palette[i]);
            }
        };

        $scope.premadePalettes = premadePalettes[$scope.currentColorSpace];

        $scope.gameDifficulty = 1;

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

    function paletteDisplayDirective() {
        return {
            restrict: 'E',
            scope: {
                palette: '=',
                title: '=',
                editable: '=?'
            },
            template: function () {
                return "<span>{{ title }}:</span>" +
                    "<div ng-hide='editable' class='color-bubble md-whiteframe-2dp' style='background-color: {{ color.hex }}'" +
                    "ng-repeat='color in palette'></div>" +
                    "<md-button ng-show='editable' ng-repeat='color in palette' ng-click='remove($index)' " +
                    "class='md-fab color-bubble' style='background-color: {{ color.hex }}'>" +
                    "<md-icon class='material-icons'>remove</md-icon>" +
                    "<md-tooltip md-direction='bottom'>{{color.shortName}}</md-tooltip>" +
                    "</md-button>";
            },
            link: function (scope, element) {
                // element.addClass('');
                element.attr('layout="row"');

                scope.remove = function (index) {
                    console.log('Deleting stuff');
                    scope.palette.splice(index, 1);
                }
            }
        }
    }

    function gcd(a, b) {
        return !b ? a : gcd(b, a % b);
    }

    function MixedColor(palette, colorSpace) {
        this.palette = palette;
        this.colorSpace = colorSpace;
        this.weightsSum = 0;

        this.addUnitOfColor = function (index, units) {
            if (units === undefined)
                units = 1;

            this.weightsSum += units;
            this.weights[index] += units;
        };

        this.removeUnitOfColor = function (index, units) {
            if (units === undefined)
                units = 1;

            this.weights[index] -= units;
            this.weightsSum -= units;

            if (this.weights[index] < 0)
                this.addUnitOfColor(index, 0 - this.weights[index]);

        };

        this.resetColors = function () {
            this.weights = [];
            for (var i = 0; i < palette.length; i++) this.weights.push(0);
        };

        // this.reduce = function () {
        //     var i;
        //
        //     var weightsGdc = this.weightsSum;
        //
        //     for (i = 0; i < this.weights.length; i++) {
        //         weightsGdc = gcd(this.weights[i], weightsGdc);
        //     }
        // };

        this.difference = function (other) {
            // Assumes same palette
            var weightsDifference = [], i;

            for (i = 0; i < this.palette.length; i++) {
                weightsDifference.push(this.weights[i] - other.weights[i]);
            }

            return weightsDifference;
        };

        this.similarity = function (other) {
            // Assumes same palette
            var weightsDifference = [], i, absoluteDifference = 0;

            for (i = 0; i < this.palette.length; i++) {
                absoluteDifference += Math.abs(this.weights[i] - other.weights[i]);
            }

            return absoluteDifference / this.weightsSum;
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

    function colorMixerDirective() {
        return {
            restrict: 'E',
            scope: {
                targetColor: '=?',
                mixedColor: '=?',
                palette: '=',
                colorSpace: '='
            },
            template: function () {
                return "<div class='color-box-container' layout='row' flex>" +
                    "   <div flex class='color-box' style='background-color: {{ mixedColor.hex }}'>" +
                    "       <div ng-hide='targetColor' class='color-indicator' ng-show='mixedColor'>{{mixedColor.result.shortName}}</div>" +
                    "   </div>" +
                    "   <div flex class='color-box' ng-show='targetColor' style='background-color: {{ targetColor.hex }}'>" +
                    "   </div>" +
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
                    "   <md-button ng-hide='targetColor' class='md-raised' ng-click='addToPalette()'>Add to Palette</md-button>" +
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

    function mixingGameDirective() {
        return {
            restrict: 'E',
            scope: {
                palette: '=',
                colorSpace: '=',
                difficulty: '='
            },
            template: "<div layout='row' layout-align='begin center'>" +
            // "   <label>Difficulty:</label>" +
            "   <md-input-container flex='60'>" +
            "       <label>Difficulty</label>" +
            "       <md-select ng-model='difficulty'> " +
            "           <md-option value='0'> Easy</md-option> " +
            "          <md-option value='1'> Medium</md-option> " +
            "           <md-option value='2'> Hard</md-option> " +
            "           <md-option value='3'> Very Hard</md-option> " +
            "      </md-select>" +
            "   </md-input-container>" +
            "   <span style='min-width: 6em;'>" +
            "       <span>Match: </span>" +
            "       <span ng-show='score() <= minThreshold' class='failed-match'>???</span>" +
            "       <span ng-hide='score() <= minThreshold'>{{ score() | number:2 }}%</span>" +
            "   </span>" +
            "   <md-button flex class='md-raised' ng-click='newTarget()'>New Target</md-button>" +
            "</div>" +
            "<color-mixer layout='column' flex target-color='targetColor' mixed-color='mixedColor' palette='palette' color-space='colorSpace'></color-mixer>",
            link: function (scope) {
                const threshold = [
                    50,
                    80,
                    90,
                    99
                ];

                scope.targetColor = generateTarget(scope.palette, scope.colorSpace, scope.difficulty);

                scope.minThreshold = threshold[scope.difficulty];

                scope.newTarget = function () {
                    scope.targetColor = generateTarget(scope.palette, scope.colorSpace, scope.difficulty);
                    scope.mixedColor.resetColors();
                    scope.minThreshold = threshold[scope.difficulty];
                };

                scope.$watch('palette.length', function () {
                    scope.targetColor = generateTarget(scope.palette, scope.colorSpace, scope.difficulty);
                    scope.mixedColor.resetColors();
                });

                scope.$watch('difficulty', function (value) {
                    scope.targetColor = generateTarget(scope.palette, scope.colorSpace, scope.difficulty);
                    scope.mixedColor.resetColors();
                });

                scope.score = function () {
                    if (!scope.targetColor) return '-';
                    return scope.targetColor.result.percMatch(scope.mixedColor.result) * 100;
                }
            }
        }
    }

    function generateTarget(palette, colorSpace, difficulty) {
        if (!palette.length)
            return null;

        if (colorSpace === 'subtractive')
            return generateSubtractiveTarget(palette, difficulty);
        if (colorSpace === 'additive')
            return generateAdditiveTarget(palette, difficulty);

        return null;
    }

    function generateSubtractiveTarget(palette, difficulty) {
        const difficultyGrid = [
            {
                minAllocations: 2,
                maxAllocations: 2
            },
            {
                minAllocations: 3,
                maxAllocations: 4
            },
            {
                minAllocations: 4,
                maxAllocations: 7
            },
            {
                minAllocations: 6,
                maxAllocations: 10
            }
        ];


        const minAllocations = difficultyGrid[difficulty].minAllocations;
        const maxAllocations = difficultyGrid[difficulty].maxAllocations;

        var startingAllocationUnits = Math.round((maxAllocations - minAllocations + 1) * Math.random() + minAllocations);
        var allocationUnit = startingAllocationUnits;
        var i, random, units;

        var mixer = new MixedColor(palette, 'subtractive');

        for (i = 0; i < palette.length - 1; i++) {
            random = Math.random() * .8;
            units = Math.min(Math.round(startingAllocationUnits * random), allocationUnit);
            if (units === startingAllocationUnits) units--;
            mixer.addUnitOfColor(i, units);
            allocationUnit -= units;
        }

        if (allocationUnit === startingAllocationUnits) // If we failed to allocate any units, repeat
            return generateSubtractiveTarget(palette, difficulty);

        mixer.addUnitOfColor(palette.length - 1, allocationUnit); // Add remaining units to last color.

        return mixer;
    }

    function generateAdditiveTarget(palette, difficulty) {
        const difficultyGrid = [
            {
                denominator: 1,
                bonusSkipChance: .3
            },
            {
                denominator: 2,
                bonusSkipChance: .4
            },
            {
                denominator: 6,
                bonusSkipChance: .3
            },
            {
                denominator: 10,
                bonusSkipChance: .2
            }
        ];

        const denominator = difficultyGrid[difficulty].denominator;
        const bonusSkipChance = difficultyGrid[difficulty].bonusSkipChance;

        var numerator, i, units, isBlack = true;

        var mixer = new MixedColor(palette, 'additive');

        for (i = 0; i < palette.length; i++) {
            if (Math.random() < bonusSkipChance) continue;

            numerator = Math.round((denominator + 1) * Math.random());

            units = numerator / denominator;

            isBlack = units > 0 ? false : isBlack;

            mixer.addUnitOfColor(i, units);
        }

        if (isBlack) return generateAdditiveTarget(palette, difficulty); // Don't return absolute black

        return mixer;
    }

})();





