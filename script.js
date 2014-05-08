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
		this.moveRight();
	},


	initialize: function(){
		mapOptions = {
		 	center: myCenter,
		  	zoom: 14,
		  	mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		fusionOptions = {
			select: '',
			from: '', 
		}

		myCenter = new google.maps.LatLng(64.592418,18.688387);
		//Positions map

		//Places map in the right div
		map = new google.maps.Map(document.getElementById("maps"),
		    mapOptions);

		//Sätter markeringar och "zoomar" in så att kartan innefattar markeringarna. 
		//Skriver över "zoomen" man satt innan
		// sw = new google.maps.LatLng(64.571419, 18.612857);
		// ne = new google.maps.LatLng(64.621789, 18.732676);
		//var bounds = new google.maps.LatLngBounds(sw, ne);

	},


	startit: function(){
		
	},

	

	moveRight: function(){
		console.log("in func");
		$('#moveButton').on('click', function(){
			map.panBy(40,40);
			//alert("hello");
		});
	}

};



(function(){
	googleScript.init();
	google.maps.event.addDomListener(window, 'load', googleScript.initialize);
	setTimeOut(function(){

	}, 1000);
	googleScript.startit();
})();
