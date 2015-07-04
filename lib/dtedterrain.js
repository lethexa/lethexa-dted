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


/* global module, __dirname, process */
var dted = require('./dtedtile');


/**
 * A class for fetching DTED-tiles from the filesystem
 * @class FileSystemTileFetcher
 * @constructor
 * @param basePath The basepath of the DTED-files.
 */
module.exports.FileSystemTileFetcher = function (basePath) {
    'use strict';
    var fs = require('fs');

    this.fetchTile = function (name, callback) {
        var fileName = basePath + '/' + name + '.dt0';
        fs.readFile(fileName, function (err, data) {
            if(err)
                callback(err);
            else
                callback(undefined, new dted.Tile(data));
        });
    };
};


/**
 * DTED-Terrain class for transparent fetching of DTED-tiles
 * @class Terrain
 * @constructor
 * @param tilefetcher The object which is fetching the tiles.
 */
module.exports.Terrain = function (tilefetcher) {
    'use strict';
    var tileCache = {};

    var makeLonTileName = function (lon) {
        var lonValue = Math.abs(Math.floor(lon));
        var nameOfTile = lonValue;
        if (lonValue < 100)
            nameOfTile = '0' + nameOfTile;
        if (lonValue < 10)
            nameOfTile = '0' + nameOfTile;
        return lon > 0.0 ? 'e' + nameOfTile : 'w' + nameOfTile;
    };

    var makeLatTileName = function (lat) {
        var latValue = Math.abs(Math.floor(lat));
        var nameOfTile = latValue;
        if (latValue < 10)
            nameOfTile = '0' + nameOfTile;
        return lat > 0.0 ? 'n' + nameOfTile : 's' + nameOfTile;
    };

    // Format: e008/n53
    this.makeTileName = function (lat, lon) {
        return makeLonTileName(lon) + '/' + makeLatTileName(lat);
    };

    var cacheTile = function (nameOfTile, tile) {
        tileCache[nameOfTile] = tile;
    };

    var getTile = function (nameOfTile) {
        return tileCache[nameOfTile];
    };

    this.fetchTileAt = function (lat, lon, tileCallback) {
        var nameOfTile = this.makeTileName(lat, lon);
        var existingTile = getTile(nameOfTile);
        if(existingTile) {
            process.nextTick(function() {
                tileCallback(null, existingTile);
            });
        }
        else {
            tilefetcher.fetchTile(nameOfTile, function (err, tile) {
                if (err) {
                    tileCallback(err, undefined);
                }
                else
                {
                    cacheTile(nameOfTile, tile);
                    tileCallback(null, tile);
                }
            });
        }
    }.bind(this);

    /**
     * Reads the altitude at the given position in the tile
     * 
     * @param {number} lat The latitude in decimal-degrees
     * @param {number} lon The longitude in decimal-degrees
     * @param {function} altitudeCallback with the given altitude
     * @returns {undefined}
     */
    this.getAltitudeAt = function (lat, lon, altitudeCallback) {
        this.fetchTileAt(lat, lon, function(err, tile) {
            altitudeCallback(err, tile.getAltitudeAt(lat, lon));
        });
    };
};