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
var Promise = require('promise');


/**
 * A class for fetching DTED-tiles from the filesystem
 * @class FileSystemTileFetcher
 * @constructor
 * @param basePath The basepath of the DTED-files.
 */
module.exports.FileSystemTileFetcher = function (basePath) {
    'use strict';
    var fs = require('fs');
	var self = this;

    this.fetchTile = function (name, callback) {
	return self.fetchTileWithSuffix(name, 2, callback).catch(function () {
		return self.fetchTileWithSuffix(name, 1, callback);
	}).catch(function () {
		return self.fetchTileWithSuffix(name, 0, callback);
	});
    };

    this.fetchTileWithSuffix = function (name, suffix, callback) {
	return new Promise(function(resolve, reject) {
	    var filename = path.join(basePath, name + '.dt' + suffix);
	    fs.readFile(filename, function (err, data) {
		if(err) {
		    if(callback)
			callback(err);
		    reject(err);
		} else {
		    var tile = new dted.Tile(data);
		    if(callback)
			callback(null, tile);
		    resolve(tile);
		}
	    });
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
    var self = this;

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
    
    var loadTileAt = function (lat, lon) {
	return new Promise(function(resolve, reject) {
	    var nameOfTile = self.makeTileName(lat, lon);
	    var existingTile = getTile(nameOfTile);
	    if(existingTile) {
		process.nextTick(function() {
		    resolve(existingTile);
		});
	    }
	    else {
		tilefetcher.fetchTile(nameOfTile).then(function (tile) {
		    cacheTile(nameOfTile, tile);
		    resolve(tile);
		}, function(err) {
		    reject(err);
		});
	    }
	});
    };
    
    /**
     * Fetches a tile from cache or datasource  and calls the callback-function with it.
     * @method fetchTileAt
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {number} The longitude-value in decimal-degrees
     * @param callback {function(err, tile)} The tile for lat/lon is loaded and given to the callback      
     * @return a promise.
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
	return new Promise(function(resolve, reject) {
	    loadTileAt(lat, lon).then(function(tile) {
		if(callback)
		    callback(null, tile);
		resolve(tile);
	    }, function(err) {
		if(callback)
		    callback(err, undefined);
		reject(err);
	    });
	});
    };

    /**
     * Reads the altitude at the given position in the tile nearest to a datapoint.
     * @method getAltitudeAt
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {number} The longitude-value in decimal-degrees
     * @param callback {function(err, alt)} The tile for lat/lon is loaded and given to the callback      
     * @return a promise.
     * @example
	var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.getAltitudeAt( 53.5, 8.125, function(err, alt) {
		if(err)
			throw err;
		console.log(alt);
	});
	
	// or with promise...
	
	terrain.getAltitudeAt( 53.5, 8.125).then(functiofetchTileAtn(alt) {
	      console.log(alt);
	}, function(err) {
	      console.error(err);
	});
     */
/*
    this.getAltitudeAt = function (lat, lon, callback) {
	this.fetchTileAt(lat, lon, function(err, tile) {
	    if(err) {
		callback(err);
		reject(err);
	    } else {
		var altitude = tile.getAltitudeAt(lat, lon);
		callback(err, altitude);
	    }
	});
    };
*/
    this.getAltitudeAt = function (lat, lon, callback) {
	return new Promise(function(resolve, reject) {
	    self.fetchTileAt(lat, lon).then(function(tile) {
		var altitude = tile.getAltitudeAt(lat, lon);
		if(callback) {
		    callback(null, altitude);
		}
		resolve(altitude);
	    }, function(err) {
		if(callback)
		    callback(err);
		reject(err);
	    });
	});
    };


    var interpolateAltitude = function(alt1, alt2, factor) {
	return alt1 + factor * (alt2 - alt1);
    };
    
    /**
     * Generated an interpolated altitude at the given position.
     * @method getInterpolatedAltitudeAt
     * @param lat {number} The latitude-value in decimal-degrees
     * @param lon {number} The longitude-value in decimal-degrees
     * @return a promise.
     * @example
	var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.getInterpolatedAltitudeAt( 53.5, 8.125).then(function(alt) {
	      console.log(alt);
	}, function(err) {
	      console.error(err);
	});
     */
    this.getInterpolatedAltitudeAt = function (lat, lon) {
	return new Promise(function(resolve, reject) {
	    self.fetchTileAt(lat, lon).then(function(tile) {
	        var tileData = tile.getCellData();
	      
		var latDiff = lat - tileData.latOfOrigin;
		var lonDiff = lon - tileData.lonOfOrigin;
		var latRel = latDiff / tileData.latDelta;
		var lonRel = lonDiff / tileData.lonDelta;
		var latIndex = Math.floor(latRel);
		var lonIndex = Math.floor(lonRel);
		var latRelFrac = latRel - latIndex;
		var lonRelFrac = lonRel - lonIndex;
	      
		var alt00 = tile.getAltitudeAtIndex(latIndex, lonIndex);
		var alt01 = tile.getAltitudeAtIndex(latIndex, lonIndex+1);
		var alt10 = tile.getAltitudeAtIndex(latIndex+1, lonIndex);
		var alt11 = tile.getAltitudeAtIndex(latIndex+1, lonIndex+1);
		var latalt1 = interpolateAltitude(alt00, alt01, lonRelFrac);
		var latalt2 = interpolateAltitude(alt10, alt11, lonRelFrac);
		
		var altitude = interpolateAltitude(latalt1, latalt2, latRelFrac); 
		resolve(altitude);
	    }, function(err) {
		resolve(0.0);
	    });
	});
    };
};
