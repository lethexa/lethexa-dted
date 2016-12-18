/*
The MIT License (MIT)

Copyright (c) 2015 Tim Leerhoff <tleerhof@web.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


/* global module */


/**
 * A class for representing a DTED-tile.
 * This class parses a buffer and extracts the important parameters + the altitude-values
 * @class Tile
 * @constructor
 * @param buffer {buffer} The buffer to parse
 */
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

    var minAltitude = 1000000;
    var maxAltitude = -1000000;
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
            if(altitude < minAltitude) minAltitude = altitude;
            if(altitude > maxAltitude) maxAltitude = altitude;
            latArray.push(altitude);
        }
        lonArray.push(latArray);
    }

    /**
     * @method getMaxAltitude
     * @return {number} the maximum altitude of the tile
     */
    this.getMaxAltitude = function() {
        return maxAltitude;
    };    
    
    /**
     * @method getMinAltitude
     * @return {number} the minimum altitude of the tile
     */
    this.getMinAltitude = function() {
        return minAltitude;
    };    
    
    /**
     * @method getLonIndexOf
     * @param lon {number} The longitude-value in decimal-degrees
     * @return {number} the index of the longitude-value in the tile
     */
    this.getLonIndexOf = function( lon ) {
        var lonDiff = lon - lonOfOrigin;
        var index = Math.floor(numLonLines * lonDiff);
        if((index < 0) || (index > numLonLines-1))
            throw Error('Longitude ' + lon + ', index=' + index + ' not in cell');
        return index;
    };
    
    /**
     * @method getLatIndexOf
     * @param lat {number} The latitude-value in decimal-degrees
     * @return {number} the index of the latitude-value in the tile
     */
    this.getLatIndexOf = function( lat ) {
        var latDiff = lat - latOfOrigin;
        var index = Math.floor(latDiff / latDelta);
        if((index < 0) || (index > numLatLines-1))
            throw Error('Latitude ' + lat + ', index=' + index + ' not in cell');
        return index;
    };
    
    /**
     * @method getAltitudeAt
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {number} The longitude-value in decimal-degrees
     * @return {number} the altitude of the position in the tile.
     */
    this.getAltitudeAt = function(lat, lon) {
        var latIndex = this.getLatIndexOf(lat);
        var lonIndex = this.getLonIndexOf(lon);
        return this.getAltitudeAtIndex(latIndex, lonIndex);
    };
        
    /**
     * @method getAltitudeAtIndex
     * @param latIndex {number} The latitude-index in the cell [0..numLatLines]
     * @param lonIndex {number} The longitude-index in the cell [0..numLatLines]
     * @return {number} the altitude of the position in the tile.
     */
    this.getAltitudeAtIndex = function(latIndex, lonIndex) {
        return lonArray[lonIndex][latIndex];
    };
        
    /**
     * The number of latitude values in this cell.
     * @method getLatitudeCount
     * @return {number} the number of latitude values in this cell.
     */
    this.getLatitudeCount = function() {
        return numLatLines;
    };
        
    /**
     * The number of longitude values in this cell.
     * @method getLongitudeCount
     * @return {number} the number of longitude values in this cell.
     */
    this.getLongitudeCount = function() {
        return numLonLines;
    };

    /**
     * The altitudes are stored lat then lon
     * @method getCellData
     * @return {object} all relevant data of the tile     
     */
    this.getCellData = function() {
        var ptLat2 = latOfOrigin + latDelta * (numLatLines-1);
        var ptLon2 = lonOfOrigin + lonDelta * (numLonLines-1);
        return {
            latOfOrigin: latOfOrigin,
            lonOfOrigin: lonOfOrigin,
            latOfCorner: ptLat2,
            lonOfCorner: ptLon2,
            latDelta: latDelta,
            lonDelta: lonDelta,
            numLatLines: numLatLines,
            numLonLines: numLonLines,
            minAltitude: minAltitude, 
            maxAltitude: maxAltitude,
            altitudes: lonArray,
            bbox: [lonOfOrigin, latOfOrigin, ptLon2, ptLat2]
        };
    };
    
    /**
     * @method forEachPosition
     * @param callback {function(lat,lon,alt)} Called for every altitude-value of the tile      
     */
    this.forEachPosition = function( callback ) {
        for(var i = 0;i<numLonLines;i++) {
            var lon = lonOfOrigin + i * lonDelta;
            var latLine = lonArray[i];
            for(var j = 0;j<numLatLines;j++) {
                var lat = latOfOrigin + j * latDelta;
                var alt = latLine[j];
                
                callback(lat, lon, alt);
            }
        }
    };
    
};
