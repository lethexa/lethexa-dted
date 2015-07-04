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
    var uhlStartIndex = 0;
    var uhlSize = 80;
    var uhl = buffer.toString('ascii', 0, 3);
    if (uhl !== 'UHL')
        throw new Error('invalid file format, UHL not found');

    var parseOriginValue = function (origin) {
        var deg = parseInt(origin.substring(0, 3), 10);
        var min = parseInt(origin.substring(3, 5), 10);
        var sec = parseInt(origin.substring(5, 7), 10);
        var hemi = origin.substring(7, 8);
        var value = deg + min / 60.0 + sec / 3600;
        return hemi === 'S' || hemi === 'W' ? -value : value;
    };

    var parse10thSeconds = function (value) {
        return (parseInt(value, 10) / 10.0) / 3600.0;
    };

    var lonOfOrigin = parseOriginValue(buffer.toString('ascii', 4, 12));
    var latOfOrigin = parseOriginValue(buffer.toString('ascii', 12, 20));
    var lonDelta = parse10thSeconds(buffer.toString('ascii', 20, 24));
    var latDelta = parse10thSeconds(buffer.toString('ascii', 24, 28));
    var absVertAcc = buffer.toString('ascii', 28, 32);
    var securityCode = buffer.toString('ascii', 32, 35);
    var uniqueRef = buffer.toString('ascii', 35, 47);
    var numLonLines = parseInt(buffer.toString('ascii', 47, 51), 10);
    var numLatLines = parseInt(buffer.toString('ascii', 51, 55), 10);
    var multipleAccuracy = buffer.toString('ascii', 55, 56);

    var dsiStartIndex = uhlStartIndex + uhlSize;
    var dsiSize = 648;
    var dsi = buffer.toString('ascii', dsiStartIndex, dsiStartIndex + 3);
    if (dsi !== 'DSI')
        throw new Error('invalid file format, DSI not found');

    var accStartIndex = dsiStartIndex + dsiSize;
    var accSize = 2700;
    var acc = buffer.toString('ascii', accStartIndex, accStartIndex + 3);
    if (acc !== 'ACC')
        throw new Error('invalid file format, ACC not found');

    var lonArray = [];
    var elevationStartIndex = accStartIndex + accSize;
    var elevationSize = 8 + numLatLines * 2 + 4;
    for (var i = 0; i < numLonLines; i++) {
        var elevStart = elevationStartIndex + i * elevationSize + 8; // Ohne header
        var latArray = [];
        
        for (var j = 0; j < numLatLines; j++) {
            var altitude = buffer.readUInt16BE(elevStart+j*2);
            if((altitude & 0x8000) !== 0)
            {
                altitude = -(altitude & 0x7FFF);
            }
            latArray.push(altitude);
        }
        lonArray.push(latArray);
    }
    
    
    this.getLonIndexOf = function( lon ) {
        var lonDiff = lon - lonOfOrigin;
        var index = Math.floor(numLonLines * lonDiff);
        return index;
    };
    
    this.getLatIndexOf = function( lat ) {
        var latDiff = lat - latOfOrigin;
        var index = Math.floor(latDiff / latDelta);
        return index;
    };

    this.getAltitudeAt = function(lat, lon) {
        var latIndex = this.getLatIndexOf(lat);
        var lonIndex = this.getLonIndexOf(lon);
        return altitudes[lonIndex][latIndex];
    }.bind(this);

    this.getCellData = function() {
        return {
            latOfOrigin: latOfOrigin,
            lonOfOrigin: lonOfOrigin,
            latDelta: latDelta,
            lonDelta: lonDelta,
            numLatLines: numLatLines,
            numLonLines: numLonLines,
            altitudes: lonArray
        };
    };
};
