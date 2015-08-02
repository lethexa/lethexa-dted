Installation
------------

        npm install
        grunt

Usage
-----

	var dted = require('lethexa-dted');

	var fetcher = new dted.FileSystemTileFetcher('./dted');
	var terrain = new dted.Terrain(fetcher);

	terrain.fetchTileAt(lat, lon, function(err, tile) {
		console.log(tile);
	});

	terrain.getAltitudeAt(lat, lon, function(err, alt) {
		console.log('Altitude: ', alt);
	});
 
