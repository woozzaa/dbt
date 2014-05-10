// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter

// File id = 129pYBFNzBwqEjiGoBoDRwbiJKgJ76jJ4RtxQx2C0y2M

var mapOptions 	= null;
var myCenter 	= null;
var map 		= null;
var bounds 		= null;
var finaljson 	= null

var googleScript = {


	settings: {

	},


	init: function(){
		this.initialize();
		this.startit();
		this.bindUIActions();
		this.getjson();
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

		//Sätter markeringar och "zoomar" in så att kartan innefattar markeringarna. 
		//Skriver över "zoomen" man satt innan
		// sw = new google.maps.LatLng(64.571419, 18.612857);
		// ne = new google.maps.LatLng(64.621789, 18.732676);
		//var bounds = new google.maps.LatLngBounds(sw, ne);

	},

	getjson: function(){
		
		var items = [];
		
		$.getJSON('/dbt/json/workex_small.json', function( data ){
			
			var counter = 0;
			$.each( data, function( key, val ){
					// console.log(val);
					var tot = {};
					tot.location 	= "new google.maps.LatLng(val['LAT'], val['LNG'])";
					tot.weight		= val['NUMBER'];
					console.log(tot);
					// items.push(tot + ',');
			});

			// console.log(items);

		});
		
		// finaljson = $.parseJSON(finaljson);
		
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
