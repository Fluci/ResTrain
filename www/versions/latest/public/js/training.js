
var Tester = function(testArea, bands) {
    var that = this;
    var testOutput = testArea;
    that.stage = -1;
    that.desiredBands = bands === undefined ? 4 : bands;
    that.trueResult = null;
    that.resCtrl = new ResistorController(getSVGContent (document.getElementById('resistor')));

/**
    internal format:
    d1-3: value equals to value in resistor table (black=0, white=9)
    multiplier: exponent to the base ten
    tolerance: [.05, .1, .25, .5, 1, 2, 5, 10]% -> according to index (.05 = 0, 10 = 7)
    ppm: [5, 10, 15, 25, 50, 100]ppm -> according to index (5 = 0, 100 = 5)
*/

    var B = this.resCtrl.BANDS;
    // Digit map
    var DMAP = {};
    DMAP[0] = B.BLACK;
    DMAP[1] = B.BROWN;
    DMAP[2] = B.RED;
    DMAP[3] = B.ORANGE;
    DMAP[4] = B.YELLOW;
    DMAP[5] = B.GREEN;
    DMAP[6] = B.BLUE;
    DMAP[7] = B.VIOLET;
    DMAP[8] = B.GREY;
    DMAP[9] = B.WHITE;
    this.DMAP = DMAP;

    // Multiplier map
    var MMAP = {};
    MMAP['-2'] = B.SILVER;
    MMAP['-1'] = B.GOLD;
    MMAP['0'] = B.BLACK;
    MMAP['1'] = B.BROWN;
    MMAP['2'] = B.RED;
    MMAP['3'] = B.ORANGE;
    MMAP['4'] = B.YELLOW;
    MMAP['5'] = B.GREEN;
    MMAP['6'] = B.BLUE;
    MMAP['7'] = B.VIOLET;
    this.MMAP = MMAP;

    // Tolerance map
    var TMAP = {};
    TMAP[0] = B.GREY;
    TMAP[1] = B.VIOLET;
    TMAP[2] = B.BLUE;
    TMAP[3] = B.GREEN;
    TMAP[4] = B.BROWN;
    TMAP[5] = B.RED;
    TMAP[6] = B.GOLD;
    TMAP[7] = B.SILVER;
    this.TMAP = TMAP;

    // PPM Map
    var PMAP = {};
    PMAP[0] = B.VIOLET;
    PMAP[1] = B.BLUE;
    PMAP[2] = B.ORANGE;
    PMAP[3] = B.YELLOW;
    PMAP[4] = B.RED;
    PMAP[5] = B.BROWN;
    this.PMAP = PMAP;

    this.PPMS = [5, 10, 15, 25, 50, 100];

    // init view
    that.resCtrl.clearAllBands();
    $("#next_stage").on('mouseup', function(e){that.nextStage();});
    $("#answer_digits, #answer_multiplier, #answer_tolerance, #answer_ppm, #next_stage").on('keyup', function (e) {
        if (e.keyCode == 13) {
        that.nextStage();
        }
    });
}

/**
    Reads a user's text formulation and tries to transform it into standard format.
*/

Tester.prototype.ohmParse = function(str) {
    var numGroups = /([\d',.]+\D+)/ig;
    var match = numGroups.exec(str);
    var matches = [];
    while(match !== null) {
        matches[matches.length] = match[0];
        match = numGroups.exec(str);
    }

    // first group defines digits and multiplier
    // second groups defines tolerance
    var tolerance = parseFloat(matches[1]);

    // third group defines ppm
    var ppm = parseFloat(matches[2]);
    // ignore rest

    return {d1: 1, d2: 1, d3: undefined, multiplier: 1, tolerance: 1, ppm: undefined};
}

/**
    Generate a new value to test.
*/
Tester.prototype.generateVal = function(bands) {
    var d1 = Math.floor(Math.random() * 9)+1; // [1, 9]
    var d2 = Math.floor(Math.random() * 10); // [0, 9]
    var d3 = this.desiredBands >= 5 ? Math.floor(Math.random() * 10) : undefined;
    var multiplier = Math.floor(Math.random() * 10) - 2; // exponent to base ten
    var tolerance = Math.floor(Math.random() * 8);
    var ppm = this.desiredBands === 6 ? Math.floor(Math.random() * (this.PPMS.length)) : undefined;

    return {d1: d1, d2: d2, d3: d3, multiplier: multiplier, tolerance: tolerance, ppm: ppm};
}

Tester.prototype.fullDigitValue = function(internal) {
    var r = internal.d1*10 + internal.d2;
    if(internal.d3 !== undefined) {
        r = r*10 + internal.d3;
    }
    r *= Math.pow(10, internal.multiplier);
    return r;
}

/**
    Formats to scientific notation: 3 digits of precision with a unit (Ω) with prefix (m, k, M) and ±.
*/
Tester.prototype.scientificDigitValue = function(internal) {
    var r = internal.d1*10 + internal.d2;
    if(internal.d3 !== undefined) {
        r = r*10 + internal.d3;
    }
    var m = internal.multiplier;
    while(r >= 10){
        m += 1;
        r /= 10;
    }
    var a = (m+6)%3;
    if(a > 0){
        m -= a;
        r *= Math.pow(10, a);
    }

    var units = {'-3': 'mΩ', '0': 'Ω', '3': 'kΩ', '6': 'MΩ', '9': 'GΩ'};

    var u = units[m];
    if(u === undefined) {alert('comparison error: ' + internal.d1 + ',' + internal.d2 + ',' + internal.d3 + ',' + internal.multiplier);}
    return r.toPrecision(3) + ' ' + u;
};

Tester.prototype.formatResult = function(internal) {
    var val = this.scientificDigitValue(internal);
    var tolerance = this.formatTolerance(internal);
    var ppm = this.formatPpm(internal);

    return val + ' ' + tolerance + ' ' + ppm;
}

Tester.prototype.formatTolerance = function(internal) {
    var t = ['0.05', '0.10', '0.25', '0.5', '1', '2', '5', '10'];
    return '± ' + t[internal.tolerance] + '%';
}

Tester.prototype.formatPpm = function(internal) {
    return internal.ppm === undefined ? '' : this.PPMS[internal.ppm] + ' ppm';
}

Tester.prototype.setToBands = function(bandsCount) {
    this.desiredBands = bandsCount;
    this.stage = -1;
    this.nextStage();
}

Tester.prototype.nextStage = function() {
    switch (this.stage) {
        case 0:
            // read answer, check it, give feedback
            var answerDigits = parseInt(document.getElementById('answer_digits').value);
            var answerMultiplier = document.getElementById('answer_multiplier').value;
            var answerTolerance = document.getElementById('answer_tolerance').value;

            var result = this.trueResult;

            // check result
            var correctMask = {mantissa: true, exponent: true, tolerance: true, ppm: true, all: true};

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
            if(this.desiredBands === 6) {
                var answerPPM = parseInt(document.getElementById('answer_ppm').value);
                correctMask.ppm = answerPPM == this.PPMS[result.ppm];
            }

            correctMask.all = correctMask.mantissa && correctMask.exponent && correctMask.tolerance && correctMask.ppm;

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
}

Tester.prototype.showQuestion = function(question) {
    this.setResistor(question);
    document.getElementById('next_stage').innerText = 'Check!';
    var ans = document.getElementById('answer_digits');
    document.getElementById('eval_answer').innerText = '';
    ans.value = '';
    ans.focus();
    if(this.desiredBands === 6) {
        document.getElementById('answer_ppm').style.display = 'inline';
        document.getElementById('answer_ppm_label').style.display = 'inline';
    } else {
        document.getElementById('answer_ppm').style.display = 'none',
        document.getElementById('answer_ppm_label').style.display = 'none';
    }
    // document.getElementById('true_result').innerText = this.formatResult(this.trueResult);

    var fVal = document.getElementById('feedback_value');
    var fTol = document.getElementById('feedback_tolerance');
    var fPpm = document.getElementById('feedback_ppm');
    fVal.style.display = 'none';
    fTol.style.display = 'none';
    fPpm.style.display = 'none';
};

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

    if(this.trueResult.ppm !== undefined) {
        fPpm.innerText = this.formatPpm(this.trueResult);
        fPpm.style.color = correct.ppm ? 'green' : 'red';
        fPpm.style.display = 'inline';
    }
};

Tester.prototype.setResistor = function(internalFormat){
    var f = internalFormat;

    var d1 = this.DMAP[f.d1];
    var d2 = this.DMAP[f.d2];
    var d3 = f.d3 === undefined ? undefined : this.DMAP[f.d3];
    var mul = this.MMAP[f.multiplier];
    var tol = this.TMAP[f.tolerance];
    var ppm = f.ppm === undefined ? undefined : this.PMAP[f.ppm];

    this.resCtrl.set(mul, tol, d1, d2, d3, ppm);
};
