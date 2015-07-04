/* global __dirname */

var assert = require("assert");
var dted = require('../index.js');


describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
        });
    });
});



describe('dtedtile', function () {
    describe('#getLonIndexOf()', function () {
        it('should return a valid lon-index', function (done) {
            var tileFetcher = new dted.FileSystemTileFetcher(__dirname + '/../examples');

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
            var tileFetcher = new dted.FileSystemTileFetcher(__dirname + '/../examples');

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
            var terrain = new dted.Terrain(new dted.FileSystemTileFetcher(__dirname + '/../examples'));
            terrain.fetchTileAt(52.5, 8.125, function (err, tile) {
                if (tile === undefined)
                    done();
                else
                    throw new Error('No error has been thrown');
            });
        });
    });

    describe('#fetchTileAt()', function () {
        it('should return valid tile, when providing lat/lon-values for existing tile', function (done) {
            var terrain = new dted.Terrain(new dted.FileSystemTileFetcher(__dirname + '/../examples'));
            terrain.fetchTileAt(53.5, 8.125, function (err, tile) {
                if (tile !== undefined)
                    done();
                else
                    throw new Error('tile is undefined');
            });
        });
    });

    describe('#getAltitudeAt()', function () {
        it('should return valid altitude at the given lat/lon-position', function (done) {
            var terrain = new dted.Terrain(new dted.FileSystemTileFetcher(__dirname + '/../examples'));
            terrain.getAltitudeAt(53.5, 8.5, function (err, altitude) {
                if (err)
                    throw err;
                assert.equal(altitude, 1);
                done();
            });
        });
    });
});
