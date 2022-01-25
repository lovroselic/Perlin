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
    constructor(width = null, wawelength = 64, drawMaxHeight = null, drawMinHeight = null, open = false, leftStop = 0, rightStop = null) {

        if (width === null || drawMaxHeight === null || drawMinHeight === null) {
            throw "ConstructionLimits: Required arguments not provided!";
        }
        this.width = width;
        this.leftStop = leftStop;
        this.rightStop = rightStop || this.width;
        this.open = open;
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
    constructor(planeLimits, divisor = 1) {
        this.planeLimits = planeLimits;
        this.divisor = divisor;
        this.x = 0;
        this.psng = new PSNG();
        this.a = this.psng.next();
        this.b = this.psng.next();
        if (this.planeLimits.open) {
            this.a = 0.5;
            this.b = 0.5;
        }
        this.pos = [];
        while (this.x < this.planeLimits.width) {
            if (this.x % (this.planeLimits.WL/ this.divisor) === 0) {
                this.a = this.b;
                if (this.planeLimits.open &&
                    (this.x < this.planeLimits.WL / this.divisor || this.planeLimits.width - this.x <= 2 * (this.planeLimits.WL / this.divisor))) {
                    this.b = 0.5;
                } else {
                    this.b = this.psng.next();
                }
                this.pos.push(this.a * this.planeLimits.amp / (this.divisor ** PERLIN.INI.divisor_exponent));
            } else {
                this.pos.push(this.interpolate() * this.planeLimits.amp / (this.divisor ** PERLIN.INI.divisor_exponent));
            }
            this.x++;
        }
    }
    interpolate() {
        let ft = Math.PI * ((this.x % (this.planeLimits.WL / this.divisor)) / (this.planeLimits.WL / this.divisor));
        let f = (1 - Math.cos(ft)) * 0.5;
        return this.a * (1 - f) + this.b * f;
    }
    smoothStep() {
        let t = (this.x % (this.planeLimits.WL / this.divisor)) / (this.planeLimits.WL / this.divisor);
        let f = 6 * t ** 5 - 15 * t ** 4 + 10 * t ** 3;
        return this.a * (1 - f) + this.b * f;
    }
    get() {
        return Uint16Array.from(this.pos.map(x => Math.round(x + this.planeLimits.mid)));
    }
}

var PERLIN = {
    VERSION: "0.05.DEV",
    CSS: "color: #2ACBE8",
    INI: {
        divisor_base: 2,
        divisor_exponent: 2.1,
    },
    drawLine(CTX, data, color = "#000") {
        CTX.strokeStyle = color;
        CTX.beginPath();
        CTX.moveTo(0, data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, data[i]);
        }
        CTX.stroke();
    },
    drawShape(CTX, data, color) {
        CTX.fillStyle = color;
        CTX.strokeStyle = color;
        CTX.beginPath();
        CTX.moveTo(0, data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, data[i]);
        }
        CTX.lineTo(CTX.canvas.width - 1, CTX.canvas.height - 1);
        CTX.lineTo(0, CTX.canvas.height - 1);
        CTX.lineTo(0, data[0]);
        CTX.closePath();
        CTX.stroke();
        CTX.fill();
    },
    generateNoise(planeLimits, octaves) {
        let results = [];
        for (let i = 0; i < octaves; i++) {
            let divisor = PERLIN.INI.divisor_base ** i;
            let perlin = new PerlinNoise(planeLimits, divisor);
            results.push(perlin.pos);
        }
        return results;
    },
    combineNoise(perlins) {
        let LN = perlins[0].length;
        let summed = [];
        for (let i = 0; i < LN; i++) {
            let total = 0;
            for (let j = 0; j < perlins.length; j++) {
                total += perlins[j][i];
            }
            summed.push(total);
        }
        return summed;
    },
    getNoise(planeLimits, octaves) {
        let noise = this.combineNoise(this.generateNoise(planeLimits, octaves));
        return Uint16Array.from(noise.map(x => x + planeLimits.mid));
    }
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

//back2
let BackPlane2 = new PlaneLimits(W, 64, 0.5 * H, 0.15 * H);
let Back2PN = PERLIN.getNoise(BackPlane2, 3);

//back1
let BackPlane1 = new PlaneLimits(W, 96, 0.7 * H, 0.3 * H);
let Back1PN = PERLIN.getNoise(BackPlane1, 3);

//fore
let ForePlane = new PlaneLimits(W, 256, 0.95 * H, 0.5 * H, true);
let ForePerlinNoise = PERLIN.getNoise(ForePlane, 1);





PERLIN.drawShape(CTX, Back2PN, '#888');
PERLIN.drawShape(CTX, Back1PN, '#444');
PERLIN.drawShape(CTX, ForePerlinNoise, "#0E0");

/*
PERLIN.drawLine(CTX, ForePerlinNoise, "#0E0");
PERLIN.drawLine(CTX, Back1PN, '#444');
PERLIN.drawLine(CTX, Back2PN, '#888');
*/



//END
console.log(`%cPERLIN ${PERLIN.VERSION} loaded.`, PERLIN.CSS);