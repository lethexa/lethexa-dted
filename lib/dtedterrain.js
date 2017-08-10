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

/* global module, __dirname, process */
var dted = require('./dtedtile');
var path = require('path');


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
        var filename = path.join(basePath, name + '.dt0');
        fs.readFile(filename, function (err, data) {
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

    /**
     * Creates a tilename from lat/lon-coordinates
     * @method makeTileName
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {Number} The longitude-value in decimal-degrees
     * @return {String} The name in format: e008/n53
     */
    this.makeTileName = function (lat, lon) {
        return makeLonTileName(lon) + '/' + makeLatTileName(lat);
    };

    var cacheTile = function (nameOfTile, tile) {
        tileCache[nameOfTile] = tile;
    };

    var getTile = function (nameOfTile) {
        return tileCache[nameOfTile];
    };
    
    /**
     * Fetches a tile from cache or datasource  and calls the callback-function with it.
     * @method fetchTileAt
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {number} The longitude-value in decimal-degrees
     * @param callback {function(err, tile)} The tile for lat/lon is loaded and given to the callback      
     * @example
        var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.fetchTileAt( 53.5, 8.125, function(err, tile) {
		if(err)
			throw err;
		console.log(tile);
	});
     */
    this.fetchTileAt = function (lat, lon, callback) {
        var nameOfTile = this.makeTileName(lat, lon);
        var existingTile = getTile(nameOfTile);
        if(existingTile) {
            process.nextTick(function() {
                callback(null, existingTile);
            });
        }
        else {
            tilefetcher.fetchTile(nameOfTile, function (err, tile) {
                if (err) {
                    callback(err, undefined);
                }
                else
                {
                    cacheTile(nameOfTile, tile);
                    callback(null, tile);
                }
            });
        }
    }.bind(this);

    /**
     * Reads the altitude at the given position in the tile
     * @method fetchTileAt
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {number} The longitude-value in decimal-degrees
     * @param callback {function(err, alt)} The tile for lat/lon is loaded and given to the callback      
     * @example
	var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.getAltitudeAt( 53.5, 8.125, function(err, alt) {
		if(err)
			throw err;
		console.log(alt);
	});
     */
    this.getAltitudeAt = function (lat, lon, callback) {
        this.fetchTileAt(lat, lon, function(err, tile) {
	    if(err)
		callback(err);
	    else
		callback(err, tile.getAltitudeAt(lat, lon));
        });
    };
};
