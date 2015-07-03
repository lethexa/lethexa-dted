/*
 * Copyright (c) 2015, Tim Leerhoff <tleerhof@web.de>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


/* global module */

module.exports.Tile = function (buffer) {
    'use strict';
    var uhl = buffer.toString('ascii', 0, 3);
    if (uhl !== 'UHL')
        throw new Error('invalid file format');

    var parseOriginValue = function (origin) {
        var deg = parseInt(origin.substring(0, 3), 10);
        var min = parseInt(origin.substring(3, 5), 10);
        var sec = parseInt(origin.substring(5, 7), 10);
        var hemi = origin.substring(7, 8);
        var value = deg + min / 60.0 + sec / 3600;
        return hemi === 'S' || hemi === 'W' ? -value : value;
    };

    var lonOfOrigin = parseOriginValue(buffer.toString('ascii', 4, 12));
    var latOfOrigin = parseOriginValue(buffer.toString('ascii', 12, 20));
    var lonDelta = buffer.toString('ascii', 20, 24);
    var latDelta = buffer.toString('ascii', 24, 28);
    var absVertAcc = buffer.toString('ascii', 28, 32);
    var securityCode = buffer.toString('ascii', 32, 35);
    var uniqueRef = buffer.toString('ascii', 35, 47);
    var numLonLines = parseInt(buffer.toString('ascii', 47, 51), 10);
    var numLatLines = parseInt(buffer.toString('ascii', 51, 55), 10);
    var multipleAccuracy = buffer.toString('ascii', 55, 56);


    console.log(uhl);
    console.log(lonOfOrigin);
    console.log(latOfOrigin);
    console.log(lonDelta);
    console.log(latDelta);
    console.log(absVertAcc);
    console.log(securityCode);
    console.log(uniqueRef);
    console.log(numLonLines);
    console.log(numLatLines);
    console.log(multipleAccuracy);
    /*
     truct UHLStruct
     {
     char uhl[3];              // recognition sentinel - should be "UHL"
     char dummy;               // additional byte
     char longitude_origin[8]; // longitude in DDDMMSSH at origin (LLC)
     char latitude_origin[8];  // latitude in DDDMMSSH at origin (LLC)
     char delta_longitude[4];  // longitude increments in 10ths of seconds
     char delta_latitude[4];   // latitude increments in 10ths of seconds
     char vertical_accuracy[4];// absolute vertical accuracy (meters)
     char security_code[3];    // if this is T, S, or C, then you can't look at the data
     char unique_reference[12];
     char num_long_lines[4];   // number of longitude lines
     char num_lat_lines[4];    // number of latitude points per longitude line
     char multiple_accuracy;   // 0 - single, 1 - multiple
     char reserved[24];
     };
     */
};
