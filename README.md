Installation
------------

        npm install
        grunt

Usage of Terrain
----------------

	var dted = require('lethexa-dted');

	var fetcher = new dted.FileSystemTileFetcher('./dted');
	var terrain = new dted.Terrain(fetcher);

	terrain.fetchTileAt(lat, lon, function(err, tile) {
		console.log('Altitude: ', tile.getAltitudeAt(lat, lon));
	});

	terrain.getAltitudeAt(lat, lon, function(err, alt) {
		console.log('Altitude: ', alt);
	});


Usage of Tile
-------------

	var dted = require('lethexa-dted');

	var buffer = ...dted-data...
	var tile = dted.Tile( buffer );
	
	// Iterate all altitude-values and their position
	tile.forEachPosition( function(lat, lon, alt) {
		console.log('Position: ', lat, lon, alt);
	});

	// Find the next altitude-value
	var alt = tile.getAltitudeAt(lat, lon);


Contributors
------------

* Tim Leerhoff <tleerhof@web.de>
 
