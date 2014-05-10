// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter

// File id = 129pYBFNzBwqEjiGoBoDRwbiJKgJ76jJ4RtxQx2C0y2M

var mapOptions 	= null;
var myCenter 	= null;
var map 		= null;
var bounds 		= null;
// var finaljson 	= null;
var items		= null;


var googleScript = {


	settings: {

	},


	init: function(){	
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


	createmaps: function(){

		myCenter = new google.maps.LatLng(64.592418,18.688387);

		mapOptions = {
			center: myCenter,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};	

		
		//Positions map

		//Places map in the right div
		map = new google.maps.Map(document.getElementById("maps"), mapOptions);
		
		console.log(items);
		mvcitems = new google.maps.MVCArray(items);
		console.log(mvcitems);
		
		var hmlayer = new google.maps.visualization.HeatmapLayer({
			data: mvcitems,
			opacity: 1,
			radius: 20
		});
		
		hmlayer.setMap(map);
		// console.log(hmlayer.getData());

		//Sätter markeringar och "zoomar" in så att kartan innefattar markeringarna. 
		//Skriver över "zoomen" man satt innan
		// sw = new google.maps.LatLng(64.571419, 18.612857);
		// ne = new google.maps.LatLng(64.621789, 18.732676);
		//var bounds = new google.maps.LatLngBounds(sw, ne);

	},

	getjson: function(){
		
		items = [];
		
		$.getJSON('/dbt/json/workex_small.json', function( data ){
			
			$.each( data, function( key, val ){
					// console.log(val);
					if(parseFloat(val['LAT']) != NaN && parseFloat(val['LNG']) != NaN){
						var lati = Number(val['LAT']);
						var lngi = Number(val['LNG']);
					}
					else{
						console.log('shit');
						return false
					}
					var tot = {};
					var loc = {};
					tot.location 	= new google.maps.LatLng(lati, lngi);
					
					// loc.lat 	= lati;
					// loc.lng 	= lngi;
					// tot.location = loc;
					tot.weight 		= Number(val['NUMBER']);
					console.log(tot);
					items.push(tot);
			});

			// console.log(items);	
			googleScript.createmaps();

		});
		
		// finaljson = $.parseJSON(finaljson);
		
	}
};



(function(){
	googleScript.init();

	google.maps.event.addDomListener(window, 'load', googleScript.getjson);

	setTimeout(function(){
		document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 2000);
	
	
})();
