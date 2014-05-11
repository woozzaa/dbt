// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter

// File id = 129pYBFNzBwqEjiGoBoDRwbiJKgJ76jJ4RtxQx2C0y2M


/**
 * 
 * VARIABLES
 * 
 */
var mapOptions 	= null;
var myCenter 	= null;
var map 		= null;
var bounds 		= null;
var items		= null;
var heatmaplayer= null;
var filepath	= '/dbt/json/finaldb3-sorted.json';

/**
 * 
 * SETTINGS
 * 
 */
var heatmapOpacity 	= 1;
var heatmapRadius 	= 20;

var googleScript = {


	settings: {

	},


	init: function(){	
		this.bindUIActions();
	},

	bindUIActions: function(){
		$('#moveRight').on('click', function(){
			map.panBy(-40,0);
			//alert("hello");
		});

		$('#moveLeft').on('click', function(){
			map.panBy(40, 0);
		});

		$('#toggleHeatmap').on('click', function(){
			heatmaplayer.setMap(heatmaplayer.getMap() ? null : map);	
		});

		$('#submitDates').on('click', function(){
			var fromDate = $('#fromDate').val();
			var toDate = $('#toDate').val();
			if(fromDate != null && toDate != null){
				googleScript.createLayerByDate(fromDate, toDate);	
			}
			else{
				alert('Invalid input');
			}
		});

		$('#dateSlider').mouseup(function(){
			// document.getElementById('#sliderValue').innerHTML = document.getElementById('#dateSlider').value;
			
		});
 		 

	},


	createmap: function(){

		lycksele = new google.maps.LatLng(64.592418,18.688387);

		mapOptions = {
			center: lycksele,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};	

		//Places map in the right div
		map = new google.maps.Map(document.getElementById("maps"), mapOptions);

	},

	createHeatmap: function(){
		// console.log(items); // WORKS
		mvcitems = new google.maps.MVCArray(items);
		// console.log(mvcitems); // WORKS
		
		/**
		 *
		 *	HEATMAP
		 * 
		 */
		heatmaplayer = new google.maps.visualization.HeatmapLayer({
			data: mvcitems,
			opacity: heatmapOpacity,
			radius: heatmapRadius
		});
		
		heatmaplayer.setMap(map);

		// for(var key in items){
		// 	console.log(items[key]);
		// }

	},

	/*************************************
	 * createLayerByDate
	 * ISSUES: fromDate <= tempDate hämtar dagen efter fromDate, inte samma. Dra -1 på fromDate???
	 *************************************/
	createLayerByDate: function(fromDate, toDate){
		var itemsByDates = [];
		for(var key in items){
			// console.log(items[key]['date']);
			tempDate = new Date(items[key]['date']);
			fromDate = new Date(fromDate);
			toDate	 = new Date(toDate);
			if( (fromDate <= tempDate) && (tempDate <= toDate) ){
				// console.log(items[key]);
				itemsByDates.push(items[key]);
			}
		}
		mvcItemsByDates = new google.maps.MVCArray(itemsByDates);
		heatmaplayer.setData(mvcItemsByDates);

		// heatmaplayer.setOptions({
		// 	query: {
		// 		data: itemsByDates,
		// 		opacity: heatmapOpacity,
		// 		radius: heatmapRadius
		// 	}
		// });

	},

	calculateDays: function(firstDate, lastDate){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		var firstDate = new Date(firstDate);
		var secondDate = new Date(lastDate);

		var diffDays = Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay));
		console.log(diffDays);
	},

	getjson: function(){
		
		items = [];
		
		$.getJSON(filepath, function( data ){
			var counter = 0;
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
					var date = new Date(val['DATE']);
					var day = date.getDate();
					var month = date.getMonth() + 1;
					var year = date.getFullYear();

					tot.location 	= new google.maps.LatLng(lati, lngi);
					tot.weight 		= Number(val['NUMBER']);
					tot.school		= toString(val['SCHOOL']);
					tot.date		= year + "-" + month + "-" + day;
					counter++;
					items.push(tot);
			});

			// console.log(items);	
			// console.log(counter);
			googleScript.createmap();
			googleScript.createHeatmap();

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
