/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */

"use strict";


/**
 * *************************************************************************
 * class defs from TERRAIN
 * *************************************************************************
 */

class PlaneLimits {
    constructor(width = null, leftStop = 0, rightStop = null, open = true) {
        /**
         * open: if true you could move out of bounds, if right stop not set
         * open: if false, bounds not required, steepness will keep hero in the world
         * left, right stop: cant move object acis over the boundary, assumption: object (hero) has at least one ax
         */

        this.width = width;
        this.leftStop = leftStop;
        this.rightStop = rightStop || this.width;
        this.open = open;
    }
}

class ConstructionLimits {
    constructor(wawelength = 64, drawMaxHeight = null, drawMinHeight = null) {
        /**
         * maxSlope: max slope that can be generated
         * min, max height: don't generate above, below this limit
         */
        if (drawMaxHeight === null || drawMinHeight === null) {
            throw "ConstructionLimits: Required arguments not provided!";
        }
        this.WL = wawelength;
        this.drawMaxHeight = Math.floor(drawMaxHeight);
        this.drawMinHeight = Math.floor(drawMinHeight);
        this.mid = Math.floor((this.drawMaxHeight + this.drawMinHeight) / 2);
        this.amp = this.drawMaxHeight - this.drawMinHeight;
    }
}

/**
 * *************************************************************************
 * class defs
 * *************************************************************************
 */
class PSNG {
    constructor() {
        this.M = 4294967296;
        this.A = 1664525;
        this.C = 1;
        this.Z = Math.floor(Math.random() * this.M);
    }
    next() {
        this.Z = (this.A * this.Z + this.C) % this.M;
        return this.Z / this.M - 0.5;
    }
}
class PerlinNoise {
    constructor(amplitude, wavelength, width, open = false) {
        this.amplitude = amplitude;
        this.wavelength = wavelength;
        this.width = width;
        this.x = 0;
        this.psng = new PSNG();
        this.a = this.psng.next();
        this.b = this.psng.next();
        if (open) {
            this.a = 0.5;
            this.b = 0.5;
        }
        this.pos = [];
        while (this.x < this.width) {
            if (this.x % this.wavelength === 0) {
                this.a = this.b;
                if (open && (this.x < this.wavelength || this.width - this.x <= 2 * this.wavelength)) {
                    this.b = 0.5;
                } else {
                    this.b = this.psng.next();
                }
                this.pos.push(this.a * this.amplitude);
            } else {
                this.pos.push(this.interplolate() * this.amplitude);
            }
            this.x++;
        }
    }
    interplolate() {
        let ft = Math.PI * ((this.x % this.wavelength) / this.wavelength);
        let f = (1 - Math.cos(ft)) * 0.5;
        return this.a * (1 - f) + this.b * f;
    }
}

var PERLIN = {
    VERSION: "0.00.01.DEV",
    CSS: "color: #2ACBE8",
    INI: {
        ramp: 64
    },
    drawLine(CTX, perlin, mid, color = "#000") {
        /**
         * debug version
         */
        CTX.strokeStyle = color;
        CTX.moveTo(0, mid + perlin.pos[0]);
        for (let i = 1; i < perlin.pos.length; i++) {
            CTX.lineTo(i, mid + perlin.pos[i]);
        }
        CTX.stroke();
    },
};


/**
 * *************************************************************************
 * test drivers
 * https://codepen.io/OliverBalfour/pen/JXbGxy?editors=0010
 * https://codepen.io/OliverBalfour/pen/QNyKEE?editors=0010
 * https://codepen.io/OliverBalfour/post/procedural-generation-part-1-1d-perlin-noise
 * https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/procedural-patterns-noise-part-1/creating-simple-1D-noise
 * *************************************************************************
 */


////////////////////////////
console.clear();
console.log("Perlin starts");
let W = 6400;
let H = 768;
$("#canvas").append(`<canvas id = "C1" width="${W}" height="${H}"></canvas>`);
let CTX = $(`#C1`)[0].getContext("2d");
CTX.fillStyle = "lightblue";
CTX.fillRect(0, 0, W, H);

////////////////////////////
let PL = new PlaneLimits(W);
//let CL = new ConstructionLimits(64, Math.floor(0.1 * H), Math.floor(0.8 * H));
//let CL = new ConstructionLimits(96, Math.floor(0.1 * H), Math.floor(0.8 * H));

//fore plane
let CL = new ConstructionLimits(256, 0.95 * H, 0.5 * H);
console.log(PL, CL);

//let PN = new PerlinNoise(CL.amp, CL.WL, PL.width);
let PN = new PerlinNoise(CL.amp, CL.WL, PL.width, true);
console.log(PN);
PERLIN.drawLine(CTX, PN, CL.mid);
//END
console.log(`%cPERLIN ${PERLIN.VERSION} loaded.`, PERLIN.CSS);