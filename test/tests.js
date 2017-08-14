/* global __dirname */

var assert = require("assert");
var dted = require('../index.js');
var path = require('path');


var createFileSystemTileFetcher = function() {
    return new dted.FileSystemTileFetcher(path.join(__dirname, '..', 'examples'));
};


var roundDigits = function (x, digits) {
    var multiplier = Math.pow(10.0, digits);
    return Math.round(x * multiplier) / multiplier;
};


describe('dtedtile', function () {
    describe('#getLonIndexOf()', function () {
        it('should return a valid lon-index', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;

                var actual = tile.getLonIndexOf(8.5);
                var expected = 30;

                assert.equal(expected, actual);

                done();
            });
        });
    });

    describe('#getLatIndexOf()', function () {
        it('should return a valid lat-index', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;

                var actual = tile.getLatIndexOf(53.5);
                var expected = 60;

                assert.equal(expected, actual);

                done();
            });
        });
    });

    describe('#getAltitudeAtIndex()', function () {
        it('should return valid altitude at the given lat/lon-index', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;

                var idxLat = tile.getLatIndexOf(53.5);
                var idxLon = tile.getLonIndexOf(8.125);
                var actual = tile.getAltitudeAtIndex(idxLat, idxLon);
                var expected = 0;

                assert.equal(expected, actual);

                done();
            });
        });
    });

    describe('#getLatitudeCount()', function () {
        it('should return the number of latitude values', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;

                var actual = tile.getLatitudeCount();
                var expected = 121;

                assert.equal(expected, actual);

                done();
            });
        });
    });

    describe('#getLongitudeCount()', function () {
        it('should return the number of longitude values', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;

                var actual = tile.getLongitudeCount();
                var expected = 61;

                assert.equal(expected, actual);

                done();
            });
        });
    });

    describe('#getCellData()', function () {
        it('should return the coords of the other corner', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;

                var cell = tile.getCellData();
                var actualLat = cell.latOfCorner;
                var actualLon = cell.lonOfCorner;
                var expectedLat = 54;
                var expectedLon = 9;

                assert.equal(actualLat, expectedLat);
                assert.equal(actualLon, expectedLon);

                done();
            });
        });
    });
/*
    describe('#getLonIndexOf()', function () {
        it('should throw an exception if index is not in this cell', function (done) {
            var tileFetcher = createFileSystemTileFetcher();

            tileFetcher.fetchTile('e008/n53', function (err, tile) {
                if (err)
                    throw err;
                
                try {
                    tile.getLonIndexOf(9.0);
                    
                }
                catch(err) {
                    done();
                }
            });
        });
    });
*/
});



describe('dtedterrain', function () {
    describe('#makeTileName()', function () {
        it('should return valid tilename, when providing lat/lon-values', function () {
            var terrain = new dted.Terrain();
            var tileName = terrain.makeTileName(53.5, 8.125);

            assert.equal(tileName, 'e008/n53');
        });
    });

    describe('#makeTileName()', function () {
        it('should return valid tilename, when providing lat/lon-values', function () {
            var terrain = new dted.Terrain();
            var tileName = terrain.makeTileName(-53.5, 8.125);

            assert.equal(tileName, 'e008/s54');
        });
    });

    describe('#makeTileName()', function () {
        it('should return valid tilename, when providing lat/lon-values', function () {
            var terrain = new dted.Terrain();
            var tileName = terrain.makeTileName(-53.5, -8.125);

            assert.equal(tileName, 'w009/s54');
        });
    });

    describe('#makeTileName()', function () {
        it('should return valid tilename, when providing lat/lon-values', function () {
            var terrain = new dted.Terrain();
            var tileName = terrain.makeTileName(53.5, -8.125);

            assert.equal(tileName, 'w009/n53');
        });
    });

    describe('#fetchTileAt()', function () {
        it('should return undefined, when providing lat/lon-values for not existing tile', function (done) {
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            terrain.fetchTileAt(52.5, 8.125, function (err, tile) {
                if (tile === undefined)
                    done();
                else
                    throw new Error('No error has been thrown');
            });
        });
    });

    describe('#fetchTileAt() with callback', function () {
        it('should return valid tile, when providing lat/lon-values for existing tile', function (done) {
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            terrain.fetchTileAt(53.5, 8.125, function (err, tile) {
                if (tile !== undefined)
                    done();
                else
                    throw new Error('tile is undefined');
            });
        });
    });

    describe('#fetchTileAt() with promise', function () {
        it('should return valid tile, when providing lat/lon-values for existing tile', function (done) {
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            terrain.fetchTileAt(53.5, 8.125).then(function (tile) {
                if (tile !== undefined)
                    done();
            }, function(err) {
                console.log('tile is undefined');
	    });
        });
    });

    describe('#getAltitudeAt() with callback', function () {
        it('should return valid altitude at the given lat/lon-position', function (done) {
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            terrain.getAltitudeAt(53.5, 8.5, function (err, altitude) {
                if (err)
                    throw err;
                assert.equal(altitude, 1);
                done();
            });
        });
    });

    describe('#getAltitudeAt() with promise', function () {
        it('should return valid altitude at the given lat/lon-position', function () { // No done here, otherwise it does not work
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            return terrain.getAltitudeAt(53.5, 8.5).then(function(altitude) {
                assert.equal(altitude, 1);
            });
        });
    });
    
    
    
    describe('getInterpolatedAltitudeAt() in tile', function () {
        it('should return an interpolated altitude at the given lat/lon-position', function () {// No done here, otherwise it does not work
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            return terrain.getInterpolatedAltitudeAt(53.50415, 8.55833).then(function(altitude) {
		assert.equal(roundDigits(altitude, 2), 1.5);
            });
        });
    });
    
    describe('getInterpolatedAltitudeAt() at not existing tile', function () {
        it('should return an interpolated altitude at the given lat/lon-position', function () {// No done here, otherwise it does not work
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            return terrain.getInterpolatedAltitudeAt(13.0, 13.0).then(function(altitude) {
		assert.equal(roundDigits(altitude, 2), 0);
            });
        });
    });
    
    describe('getInterpolatedAltitudeAt() at edge of tile', function () {
        it('should return an interpolated altitude at the given lat/lon-position', function () {// No done here, otherwise it does not work
            var terrain = new dted.Terrain(createFileSystemTileFetcher());
            return terrain.getInterpolatedAltitudeAt(53.0, 8.0).then(function(altitude) {
		assert.equal(roundDigits(altitude, 2), 7);
            });
        });
    });
    
});
