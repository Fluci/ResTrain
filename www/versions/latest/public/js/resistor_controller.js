
function getSVGContent(parent) {
	if (parent.contentDocument) {
		return parent.contentDocument;
	} else {
		var svg = null;
		try {
			svg = parent.getSVGDocument();
		} catch(e) {}
		return svg;
	}
}

ResistorController = function(svgContent) {
	var that = this;
	that.svg = svgContent;
	that.bandsCount = null;

	var highestBand = 12;
	/**
		tweak position for nice layout
	*/
	var bandMap = {
		4: {1: 1, 2: 3, 3: 5, 4: 8},
		5: {1: 1, 2: 3, 3: 5, 4: 7, 5: 9},
		6: {1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11}
	}

   BANDS = {};
   BANDS.BLACK = 0;
   BANDS.BROWN = 1;
   BANDS.RED = 2;
   BANDS.ORANGE = 3;
   BANDS.YELLOW = 4;
   BANDS.GREEN = 5;
   BANDS.BLUE = 6;
   BANDS.VIOLET = 7;
   BANDS.GREY = 8;
   BANDS.WHITE = 9;
   BANDS.SILVER = 10;
   BANDS.GOLD = 11;

   this.BANDS = BANDS;

	/**
		ID of gradient in SVG.
	*/
	SVGBAND = {};
	SVGBAND[0] = 'bandblack';
	SVGBAND[1] = 'bandbrown';
	SVGBAND[2] = 'bandred';
	SVGBAND[3] = 'bandorange';
	SVGBAND[4] = 'bandyellow';
	SVGBAND[5] = 'bandgreen';
	SVGBAND[6] = 'bandblue';
	SVGBAND[7] = 'bandviolet';
	SVGBAND[8] = 'bandgrey';
	SVGBAND[9] = 'bandwhite';
	SVGBAND[10] = 'bandsilver';
	SVGBAND[11] = 'bandgold';

	that.clearAllBands = function() {
		for(var i = 1; i <= highestBand; i += 1) {
			setSVGBand(i, undefined);
		}
	};

	/**
	Gets a list of bands and changes the svg accordingly.
	d1-d3 are the digit bands.
	d3 and ppm are optional.
	*/
	that.set = function(multiplier, tol, d1, d2, d3, ppm) {
		this.clearAllBands();

		if(d3 === undefined) {
			that.bandsCount = 4;
			setBand(1, d1);
			setBand(2, d2);
			setBand(3, multiplier);
			setBand(4, tol);
		} else if (ppm === undefined) {
			that.bandsCount = 5;
			setBand(1, d1);
			setBand(2, d2);
			setBand(3, d3);
			setBand(4, multiplier);
			setBand(5, tol);
		} else {
			that.bandsCount = 6;
			setBand(1, d1);
			setBand(2, d2);
			setBand(3, d3);
			setBand(4, multiplier);
			setBand(5, tol);
			setBand(6, ppm);
		}
	}
	/**
	Depending on `bandsCount`, this function maps the band position to the right band in the image.
	*/
	var setBand = function(pos, color) {
		setSVGBand(bandMap[that.bandsCount][pos], color);
	}

	var setSVGBand = function(svgPos, color) {
		var bandId = 'resband' + svgPos;
		var bandEl = that.svg.getElementById(bandId);
		var col = SVGBAND[color];
		if (col === undefined) {
			bandEl.style.display = 'none';
		} else {
			bandEl.style.display = '';
			bandEl.style.fill = 'url(#' + col + ')';
		}
	}
}
