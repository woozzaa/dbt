// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter



var mapOptions = null;
var myCenter = null;
var map = null;
var bounds = null;

var googleScript = {


	settings: {

	},


	init: function(){
		this.initialize();
		this.startit();
		this.bindUIActions();
	},

	bindUIActions: function(){
		$('#moveRight').on('click', function(){
			map.panBy(40,40);
			//alert("hello");
		});

		$('#moveLeft').on('click', function(){
			map.panBy(-40, -40);
		});
	},


	initialize: function(){
		mapOptions = {
			center: myCenter,
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};	

		myCenter = new google.maps.LatLng(64.592418,18.688387);
		//Positions map

		//Places map in the right div
		map = new google.maps.Map(document.getElementById("maps"), mapOptions);

		var layer = new google.maps.FusionTablesLayer({
			query: {
				select: 'ABSENCES',
				from: '1OqKOavsRoQSHBxt0v40jf9iBJ0WTpESP5pQj3Ukb',
				// where: 'ABSENCES > 2'
			}
			// heatmap: {
			// 	enabled: heatmap.checked,
			// }
		});

		google.maps.event.addDomListener(document.getElementById('heatmap'),
            'click', function() {
              var heatmap = document.getElementById('heatmap');
              layer.setOptions({
                heatmap: {
                  enabled: heatmap.checked
                }
              });
        });

		layer.setMap(map);

		//Sätter markeringar och "zoomar" in så att kartan innefattar markeringarna. 
		//Skriver över "zoomen" man satt innan
		// sw = new google.maps.LatLng(64.571419, 18.612857);
		// ne = new google.maps.LatLng(64.621789, 18.732676);
		//var bounds = new google.maps.LatLngBounds(sw, ne);

	},


	startit: function(){
		
	},
};



(function(){
	
	googleScript.init();
	google.maps.event.addDomListener(window, 'load', googleScript.initialize);
	googleScript.startit();

	setTimeout(function(){
		document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 2000);
	
	
})();
