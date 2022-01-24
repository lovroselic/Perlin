/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/**
 * *************************************************************************
 * class defs
 * *************************************************************************
 */


/**
 * *************************************************************************
 * test drivers
 * *************************************************************************
 */


console.clear();
console.log("Perlin starts");
let W = 1280;
let H = 768;
$("#canvas").append(`<canvas id = "C1" width="${W}" height="${H}"></canvas>`);
let CTX = $(`#C1`)[0].getContext("2d");
CTX.fillStyle = "lightblue";
CTX.fillRect(0, 0, W, H);

