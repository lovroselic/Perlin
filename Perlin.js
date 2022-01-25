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
    constructor(planeLimits) {
        this.amplitude = planeLimits.amp;
        this.wavelength = planeLimits.WL;
        this.width = planeLimits.width;
        this.open = planeLimits.open;
        this.x = 0;
        this.psng = new PSNG();
        this.a = this.psng.next();
        this.b = this.psng.next();
        if (this.open) {
            this.a = 0.5;
            this.b = 0.5;
        }
        this.pos = [];
        while (this.x < this.width) {
            if (this.x % this.wavelength === 0) {
                this.a = this.b;
                if (this.open && (this.x < this.wavelength || this.width - this.x <= 2 * this.wavelength)) {
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
    get() {
        return Uint16Array.from(this.pos);
    }
}


var PERLIN = {
    VERSION: "0.02.DEV",
    CSS: "color: #2ACBE8",
    INI: {
        ramp: 64
    },
    drawLine(CTX, perlin, mid, color = "#000") {
        CTX.strokeStyle = color;
        CTX.beginPath();
        CTX.moveTo(0, mid + perlin.pos[0]);
        for (let i = 1; i < perlin.pos.length; i++) {
            CTX.lineTo(i, mid + perlin.pos[i]);
        }
        CTX.stroke();
    },
    drawShape(CTX, perlin, mid, color) {
        CTX.fillStyle = color;
        CTX.strokeStyle = color;
        //let data = perlin.get();
        let data = perlin.pos;
        CTX.beginPath();
        CTX.moveTo(0, mid + data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, mid + data[i]);
        }

        console.log(CTX.canvas.width-1, CTX.canvas.height-1);
        CTX.lineTo(CTX.canvas.width - 1, CTX.canvas.height - 1);
        CTX.lineTo(0, CTX.canvas.height - 1);
        CTX.lineTo(0, mid + data[0]);

        CTX.closePath();
        CTX.stroke();
        CTX.fill();
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

//back2
let BackPlane2 = new PlaneLimits(W, 36, 0.5 * H, 0.15 * H);
let Back2PN = new PerlinNoise(BackPlane2);


//back1
let BackPlane1 = new PlaneLimits(W, 72, 0.7 * H, 0.3 * H);
let Back1PN = new PerlinNoise(BackPlane1);

//fore
let ForePlane = new PlaneLimits(W, 256, 0.95 * H, 0.5 * H, true);
let ForePerlinNoise = new PerlinNoise(ForePlane);
console.log(ForePerlinNoise);
console.log(ForePerlinNoise.get());



PERLIN.drawShape(CTX, Back2PN, BackPlane2.mid, '#888');
PERLIN.drawShape(CTX, Back1PN, BackPlane1.mid, '#444');
PERLIN.drawShape(CTX, ForePerlinNoise, ForePlane.mid, "#0E0");

PERLIN.drawLine(CTX, ForePerlinNoise, ForePlane.mid, "#0E0");
PERLIN.drawLine(CTX, Back1PN, BackPlane1.mid, '#444');
PERLIN.drawLine(CTX, Back2PN, BackPlane2.mid, '#888');



//END
console.log(`%cPERLIN ${PERLIN.VERSION} loaded.`, PERLIN.CSS);