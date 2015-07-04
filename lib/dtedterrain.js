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


/* global module, __dirname */
var dted = require('./dtedtile');

module.exports.FileSystemTileFetcher = function (basePath) {
    'use strict';
    var fs = require('fs');

    this.fetchTile = function (name, callback) {
        fs.readFile(basePath + '/' + name + '.dt0', function (err, data) {
            callback(new dted.Tile(data), err);
        });
    };
};


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

    this.makeTileName = function (lat, lon) {
        return makeLonTileName(lon) + '/' + makeLatTileName(lat);
    };
    
    var cacheTile = function(nameOfTile, tile) {
        tileCache[nameOfTile] = tile;
    };

    var getTile = function(nameOfTile) {
        return tileCache[nameOfTile];
    };

    this.fetchTileAt = function (lat, lon, callback) {
        // e008/n53
        var nameOfTile = this.makeTileName(lat, lon);
        
        if (getTile(nameOfTile) === undefined) {
            tilefetcher.fetchTile(nameOfTile, function(tile, err) {
                if(err === undefined) {
                    cacheTile(nameOfTile, tile);
                }
                callback(tile, err);
            });
        }
        else {
            callback(tileCache[nameOfTile]);
        }
    }.bind(this);

    this.getAltitudeAt = function (lat, lon, callback) {
        // e008/n53
        var nameOfTile = this.makeTileName(lat, lon);
        
        if (tileCache[nameOfTile] === undefined) {
            tilefetcher.fetchTileTo(nameOfTile, this);
        }
    };
};