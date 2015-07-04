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
        it('should return valid tile, when providing lat/lon-values', function () {
            var terrain = new dted.Terrain(new dted.FileSystemTileFetcher(__dirname + '/../examples'));
            terrain.fetchTileAt(53.5, -8.125, function (tile, err) {
                if (tile !== undefined)
                    done();
                else
                    throw new Error('tile is undefined');
            });
        });
    });
});
