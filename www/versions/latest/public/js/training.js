/*jshint
     esnext: true
 */
'use strict';

var Tester = function(testArea, resistorController, bands) {
    var that = this;
    var testOutput = testArea;
    that.stage = -1;
    that.desiredBands = bands === undefined ? 4 : bands;
    that.trueResult = null;
    that.resCtrl = resistorController;

/**
    internal format:
    d1-3: value equals to value in resistor table (black=0, white=9)
    multiplier: exponent to the base ten
    tolerance: [.05, .1, ..., 5, 10]% -> according to index (.05 = 0, 10 = 7)
    ppm: [5, 10, 15, 25, 50, 100]ppm -> according to index (5 = 0, 100 = 5)
*/

    var B = this.resCtrl.BANDS;
    // Digit map
    this.DMAP = {
        0: B.BLACK,
        1: B.BROWN,
        2: B.RED,
        3: B.ORANGE,
        4: B.YELLOW,
        5: B.GREEN,
        6: B.BLUE,
        7: B.VIOLET,
        8: B.GREY,
        9: B.WHITE
    };

    // Multiplier map
    this.MMAP = {
        '-2': B.SILVER,
        '-1': B.GOLD,
        '0': B.BLACK,
        '1': B.BROWN,
        '2': B.RED,
        '3': B.ORANGE,
        '4': B.YELLOW,
        '5': B.GREEN,
        '6': B.BLUE,
        '7': B.VIOLET,
    };


    // Tolerance map
    this.TMAP = {
        0: B.GREY,
        1: B.VIOLET,
        2: B.BLUE,
        3: B.GREEN,
        4: B.BROWN,
        5: B.RED,
        6: B.GOLD,
        7: B.SILVER,
    };

    this.TValMAP = ['0.05', '0.10', '0.25', '0.5', '1', '2', '5', '10'];

    // PPM Map
    this.PMAP = {
        0: B.VIOLET,
        1: B.BLUE,
        2: B.ORANGE,
        3: B.YELLOW,
        4: B.RED,
        5: B.BROWN
    };

    this.PPMS = [5, 10, 15, 25, 50, 100];

    // init view
    that.resCtrl.clearAllBands();
    $('#next_stage').on('mouseup', function() {that.nextStage();});
    $('#answer_digits, #answer_multiplier, #answer_tolerance, #answer_ppm, #next_stage')
    .on('keyup', function(e) {
        if (e.keyCode == 13) {
        that.nextStage();
        }
    });
};

/**
 * Generate a new value to test.
 * @param  {int} bands How many bands does the resistor have?
 * @return {map}       Internal representation for bands of a resistor.
 */
Tester.prototype.generateVal = function(bands) {
    var d1 = Math.floor(Math.random() * 9) + 1; // [1, 9]
    var d2 = Math.floor(Math.random() * 10); // [0, 9]
    var d3 = this.desiredBands >= 5 ? Math.floor(Math.random() * 10) : undefined;
    var multiplier = Math.floor(Math.random() * 10) - 2; // exponent to base ten
    var tolerance = Math.floor(Math.random() * 8);
    var ppm = this.desiredBands === 6 ? Math.floor(Math.random() * (this.PPMS.length)) : undefined;

    return {
        d1: d1, d2: d2, d3: d3,
        multiplier: multiplier,
        tolerance: tolerance,
        ppm: ppm
    };
};

/**
 * Calculate numerical value of resistor (no unit, no tolerance, no ppm).
 * @param  {map} internal Internal representation of resistor value.
 * @return {number}          Value of resistor in Ω.
 */
Tester.prototype.fullDigitValue = function(internal) {
    var r = internal.d1 * 10 + internal.d2;
    if (internal.d3 !== undefined) {
        r = r * 10 + internal.d3;
    }
    r *= Math.pow(10, internal.multiplier);
    return r;
};

/**
 * Formats to scientific notation: 3 digits of precision
 * with a unit (Ω), with prefix (m, k, M) and ±.
 * @param  {map} internal Internal representation of resistor state.
 * @return {string}       A correctly formatted string with unit (`150 kΩ`)
 */
Tester.prototype.scientificDigitValue = function(internal) {
    var r = internal.d1 * 10 + internal.d2;
    if (internal.d3 !== undefined) {
        r = r * 10 + internal.d3;
    }
    var m = internal.multiplier;
    while (r >= 10) {
        m += 1;
        r /= 10;
    }
    var a = (m + 6) % 3;
    if (a > 0) {
        m -= a;
        r *= Math.pow(10, a);
    }

    var units = {'-3': 'mΩ', '0': 'Ω', '3': 'kΩ', '6': 'MΩ', '9': 'GΩ'};

    var u = units[m];
    if (u === undefined) {
        alert('comparison error: ' + internal.d1 + ',' + internal.d2 + ',' +
                internal.d3 + ',' + internal.multiplier);
     }
    return r.toPrecision(3) + ' ' + u;
};

/**
 * Convenience method to stringify the internal representation.
 * @param  {map} internal Internal representation of a resistor value.
 * @return {string}       Human readable string.
 */
Tester.prototype.formatResult = function(internal) {
    var val = this.scientificDigitValue(internal);
    var tolerance = this.formatTolerance(internal);
    var ppm = this.formatPpm(internal);

    return val + ' ' + tolerance + ' ' + ppm;
};

/**
 * Format the tolerance with `±` and `%`
 * @param  {map} internal Internal representation.
 * @return {string}       Formatted tolerance.
 */
Tester.prototype.formatTolerance = function(internal) {
    return '± ' + this.TValMAP[internal.tolerance] + '%';
};

/**
 * Format PPM as string `123 ppm`.
 * @param  {map} internal Internal representation.
 * @return {string}       Formatted PPM.
 */
Tester.prototype.formatPpm = function(internal) {
    return internal.ppm === undefined ? '' : this.PPMS[internal.ppm] + ' ppm';
};

/**
 * Resets the resistor to be a bandsCount-resistor.
 * @param {int} bandsCount Number of bands (4,5,6).
 */
Tester.prototype.setToBands = function(bandsCount) {
    this.desiredBands = bandsCount;
    this.stage = -1;
    this.nextStage();
};

/**
 * "MainLoop" of application, is called when user wants next respone from app.
 * Also called at start and by setToBands. Coordinates application.
 */
Tester.prototype.nextStage = function() {
    switch (this.stage) {
        case 0:
            // read answer, check it, give feedback
            var answerDigits = parseInt(document.getElementById('answer_digits').value);
            var answerMultiplier = document.getElementById('answer_multiplier').value;
            var answerTolerance = document.getElementById('answer_tolerance').value;

            var result = this.trueResult;

            // check result
            var correctMask = {
                mantissa: true, exponent: true,
                tolerance: true, ppm: true, all: true
            };

            // check digit/multiplier
            var answerValue = answerDigits * Math.pow(10, answerMultiplier);
            var resultValue = this.fullDigitValue(result);
            var ansExp = Math.floor(Math.log10(answerValue));
            var resExp = Math.floor(Math.log10(resultValue));
            correctMask.exponent = ansExp == resExp;
            var ansMan = answerValue / Math.pow(10, ansExp);
            var resMan = resultValue / Math.pow(10, resExp);
            correctMask.mantissa = Math.abs(ansMan - resMan) < 0.0001;

            // check tolerance
            correctMask.tolerance = result.tolerance == answerTolerance;

            // check ppm
            if (this.desiredBands === 6) {
                var answerPPM = parseInt(document.getElementById('answer_ppm').value);
                correctMask.ppm = answerPPM == this.PPMS[result.ppm];
            }

            correctMask.all = correctMask.mantissa &&
                correctMask.exponent &&
                correctMask.tolerance &&
                correctMask.ppm;

            this.showResult(correctMask);

            break;
        case -1:
            // do nothing, just continue with first question
        case 1:
            // generate new question and display it
            this.trueResult = this.generateVal(this.desiredBands);
            this.showQuestion(this.trueResult);
            break;
        default:
            // TODO: unknown case
            // recover
            this.stage = -1;
    }
    this.stage += 1;
    this.stage %= 2;
};

/**
 * Controlls layout of question phase.
 * @param  {map} question Resistor value to display. (Internal representation)
 */
Tester.prototype.showQuestion = function(question) {
    this.setResistor(question);
    document.getElementById('next_stage').innerText = 'Check!';
    var ans = document.getElementById('answer_digits');
    document.getElementById('eval_answer').innerText = '';
    ans.value = '';
    ans.focus();
    if (this.desiredBands === 6) {
        document.getElementById('answer_ppm').style.display = 'inline';
        document.getElementById('answer_ppm_label').style.display = 'inline';
    } else {
        document.getElementById('answer_ppm').style.display = 'none',
        document.getElementById('answer_ppm_label').style.display = 'none';
    }

    var fVal = document.getElementById('feedback_value');
    var fTol = document.getElementById('feedback_tolerance');
    var fPpm = document.getElementById('feedback_ppm');
    fVal.style.display = 'none';
    fTol.style.display = 'none';
    fPpm.style.display = 'none';
};

/**
 * Controlls layout of result phase.
 * @param  {map} correct What did the user get right?
 * Detailed map of right/wrong values.
 */
Tester.prototype.showResult = function(correct) {
    document.getElementById('next_stage').innerText = 'Next!';
    document.getElementById('next_stage').focus();
    document.getElementById('eval_answer').innerText = correct.all === true ? '✅' : '❌';
    var val = this.scientificDigitValue(this.trueResult);
    var tolerance = this.formatTolerance(this.trueResult);
    var ppm = this.formatPpm(this.trueResult);

    var fVal = document.getElementById('feedback_value');
    var fTol = document.getElementById('feedback_tolerance');
    var fPpm = document.getElementById('feedback_ppm');

    fVal.innerText = this.scientificDigitValue(this.trueResult);
    fVal.style.color = correct.mantissa && correct.exponent ? 'green' : 'red';
    fVal.style.display = 'inline';

    fTol.innerText = this.formatTolerance(this.trueResult);
    fTol.style.color = correct.tolerance ? 'green' : 'red';
    fTol.style.display = 'inline';

    if (this.trueResult.ppm !== undefined) {
        fPpm.innerText = this.formatPpm(this.trueResult);
        fPpm.style.color = correct.ppm ? 'green' : 'red';
        fPpm.style.display = 'inline';
    }
};

/**
 * Transforms internal representation and sets SVG resistor via resCtrl.
 * @param {map} internalFormat Internal representation of resistor value.
 */
Tester.prototype.setResistor = function(internalFormat) {
    var f = internalFormat;

    var d1 = this.DMAP[f.d1];
    var d2 = this.DMAP[f.d2];
    var d3 = f.d3 === undefined ? undefined : this.DMAP[f.d3];
    var mul = this.MMAP[f.multiplier];
    var tol = this.TMAP[f.tolerance];
    var ppm = f.ppm === undefined ? undefined : this.PMAP[f.ppm];

    this.resCtrl.set(mul, tol, d1, d2, d3, ppm);
};
