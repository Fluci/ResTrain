/*jshint
     esnext: true
 */
'use strict';

var getSVGContent = function(parent) {
    if (parent.contentDocument) {
        return parent.contentDocument;
    } else {
        var svg = null;
        try {
            svg = parent.getSVGDocument();
        } catch (e) {}
        return svg;
    }
};

var ResistorController = function(svgContent) {
    var that = this;
    that.svg = svgContent;
    that.bandsCount = null;

    that.highestBand = 12;
    /**
        tweak position for nice layout
    */
    that.bandMap = {
        4: {1: 1, 2: 3, 3: 5, 4: 8},
        5: {1: 1, 2: 3, 3: 5, 4: 7, 5: 9},
        6: {1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11}
    };

   this.BANDS = {
       BLACK: 0,
       BROWN: 1,
       RED: 2,
       ORANGE: 3,
       YELLOW: 4,
       GREEN: 5,
       BLUE: 6,
       VIOLET: 7,
       GREY: 8,
       WHITE: 9,
       SILVER: 10,
       GOLD: 11
   };

    /**
        ID of gradient in SVG.
    */
    this.SVGBAND = {
        0: 'bandblack',
        1: 'bandbrown',
        2: 'bandred',
        3: 'bandorange',
        4: 'bandyellow',
        5: 'bandgreen',
        6: 'bandblue',
        7: 'bandviolet',
        8: 'bandgrey',
        9: 'bandwhite',
        10: 'bandsilver',
        11: 'bandgold'
    };
};
/**
 * Hide all bands on the resistor graphic.
 */
ResistorController.prototype.clearAllBands = function() {
    for (var i = 1; i <= this.highestBand; i += 1) {
        this.setSVGBand(i, undefined);
    }
};

/**
 * Gets a list of bands and changes the svg accordingly.
 * @param {number} multiplier Band color for exponent ring.
 * @param {number} tol Band color for tolerance ring.
 * @param {number} d1  Band color for first digit of mantissa.
 * @param {number} d2  Band color for second digit of mantissa.
 * @param {number} d3  Band color for third digit of mantissa, optional.
 *                     (implies 5 or 6 banded resistor)
 * @param {number} ppm Band color for PPM ring, optional.
 *                    (implies 6 banded resistor)
 */
ResistorController.prototype.set = function(multiplier, tol, d1, d2, d3, ppm) {
    this.clearAllBands();

    if (d3 === undefined) {
        this.bandsCount = 4;
        this.setBand(1, d1);
        this.setBand(2, d2);
        this.setBand(3, multiplier);
        this.setBand(4, tol);
    } else if (ppm === undefined) {
        this.bandsCount = 5;
        this.setBand(1, d1);
        this.setBand(2, d2);
        this.setBand(3, d3);
        this.setBand(4, multiplier);
        this.setBand(5, tol);
    } else {
        this.bandsCount = 6;
        this.setBand(1, d1);
        this.setBand(2, d2);
        this.setBand(3, d3);
        this.setBand(4, multiplier);
        this.setBand(5, tol);
        this.setBand(6, ppm);
    }
};

/**
 * Depending on `bandsCount`, this function maps the band position to
 * the corresponding band in the image.
 * @param {number} pos Position of band to be manipulated
 * assuming given this.bandsCount
 * @param {number} color Which color should the band get? See this.BANDS.
 */
ResistorController.prototype.setBand = function(pos, color) {
    this.setSVGBand(this.bandMap[this.bandsCount][pos], color);
};

/**
 * Gives the band at position `svgPos` (e.g. 11 (coming from bandMap))
 * the color `color` (e.g. BANDS.BLACK).
 * @param {number} svgPos Number index given in SVG graphic (3 in resband3)
 * @param {number} color  Color chosen from this.BANDS.
 */
ResistorController.prototype.setSVGBand = function(svgPos, color) {
    var bandId = 'resband' + svgPos;
    var bandEl = this.svg.getElementById(bandId);
    var col = this.SVGBAND[color];
    if (col === undefined) {
        bandEl.style.display = 'none';
    } else {
        bandEl.style.display = '';
        bandEl.style.fill = 'url(#' + col + ')';
    }
};
