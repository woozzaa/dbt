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
var firstDate 	= null;
var lastDate  	= null;
var diffDays	= null;
var filepath	= '/dbt/json/finaldb3-sorted.json';

/**
 * 
 * SETTINGS
 * 
 */
var heatmapOpacity 	= 1;
var heatmapRadius 	= 20;

/**
 * [googleScript description]
 * init
 * bindUIActions
 * createMap
 * createHeatmap
 * createLayerByDate
 * calculateDays
 * getjson
 */
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
			animationScript.createOneDayLayer(googleScript.getSliderDate());
		}); 

		$('#animateHeatmap').on('click', function(){
			tempDate = googleScript.getSliderDate();
			animationScript.animateMap(tempDate);
		});
	},

	getSliderDate: function(){
		nrOfDays 	= Number($('#dateSlider').val());
		tempDate = googleScript.gettheDate(nrOfDays);
		return tempDate;
	},

	gettheDate: function(nrOfDays, theDate){
		if(typeof theDate == 'undefined'){
			console.log('in undefined');
			tempDate = new Date(firstDate);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			return tempDate;
		}else{
			console.log('defined');
			tempDate = new Date(theDate);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			return tempDate;	
		}
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
		heatmaplayer = new google.maps.visualization.HeatmapLayer({
			data: mvcitems,
			opacity: heatmapOpacity,
			radius: heatmapRadius
		});
		
		heatmaplayer.setMap(map);

	},

	/*************************************
	 * createLayerByDate
	 * ISSUES: fromDate <= tempDate hämtar dagen efter fromDate, inte samma. Dra -1 på fromDate???
	 *************************************/
	createLayerByDate: function(fromDate, toDate){
		
		var itemsByDates = [];
		fromDate = new Date(fromDate);
		toDate	 = new Date(toDate);
		fromDate = fromDate.getFullYear() + '' + fromDate.getMonth()+'' + fromDate.getDate();
		toDate = toDate.getFullYear() + ''+toDate.getMonth()+'' + toDate.getDate();
		
		// console.log(fromDate + ' ' + toDate);
		
		for(var key in items){
			// console.log(items[key]['date']);
			tempDate = new Date(items[key]['date']);
			tempDate = tempDate.getFullYear() + '' + tempDate.getMonth()+ '' + tempDate.getDate();
			// if( (fromDate.getTime() <= tempDate.getTime()) && (tempDate.getTime() <= toDate.getTime()) ){
			if( (fromDate <= tempDate) && (tempDate <= toDate)){
				// console.log('temp'+tempDate);
				// console.log(fromDate);
				// console.log(tempDate);
				itemsByDates.push(items[key]);
			}
		}

		mvcItemsByDates = new google.maps.MVCArray(itemsByDates);
		heatmaplayer.setData(mvcItemsByDates);

	},

	calculateDays: function(){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		diffDays = Math.abs((firstDate.getTime() - lastDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').attr('min', 0);
		$('#dateSlider').attr('max', diffDays);
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
					if(date < firstDate || firstDate == null){
						firstDate = new Date(date);
					}
					if(date > lastDate||lastDate == null){
						lastDate = new Date(date);
					}
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
			googleScript.createmap();
			googleScript.createHeatmap();
			googleScript.calculateDays();

		});
		
		// finaljson = $.parseJSON(finaljson);
		
	}
};

var i = 0; // for iterations
var weekday = new Array(7);
	weekday[0] = "Sön";
	weekday[1] = "Mån";
	weekday[2] = "Tis";
	weekday[3] = "Ons";
	weekday[4] = "Tors";
	weekday[5] = "Fre";
	weekday[6] = "Lör";
/**
 * [animationScript description]
 * createOneDayLayer
 * animateMap
 */
var animationScript = {

	createOneDayLayer: function(choosenDate){
		
		choosenDate = new Date(choosenDate);
		var dayType = weekday[choosenDate.getDay()];

		var day 	= choosenDate.getDate();
		if(day < 10){
			day = '0' + day;
		}
		var month 	= choosenDate.getMonth() + 1;
		if(month < 10){
			month = '0' + month;
		}
		var year 	= choosenDate.getFullYear();
		
		choosenDate = year + "-" + month + "-" + day;
		// newDateDayType = 
		// console.log(newDate);
		document.getElementById('sliderValue').innerHTML = 'Datum:	' + choosenDate + '<br>Dag:	' + dayType;
		// console.log(newDateDate);
		googleScript.createLayerByDate(choosenDate, choosenDate);	
		
	},

	createMultipleDaysLayer: function(){
		
		if(tempDate == null){
			console.log('if');
			newDate 	= new Date(firstDate);	
		}else{
			console.log('else');
			newDate = new Date(tempDate);
		}
		newDate.setDate(newDate.getDate() + nrOfDays);
	},

	animateMap: function(tempDate){
		/**
		 * Skapa egen funktion som tar in antal dagar den ska flytta fram som inparameter. Kan kallas på för varje varv i loopen härifrån samt från
		 * dateSlidern, som då skickas in ett större värde.
		 */
		// console.log('HERE');
		setTimeout(function(){
			animationScript.createOneDayLayer(tempDate);
			i++;

			if(i < diffDays){
				// console.log('in if');
				tempDat = googleScript.gettheDate(1, tempDate)
				animationScript.animateMap(tempDat);
				console.log(i + ' ' + tempDat);
			}
			else{
				i = 0;
				console.log('exited loop');
				return false;
			}
		}, 1000)
	},
};



(function(){
	googleScript.init();

	google.maps.event.addDomListener(window, 'load', googleScript.getjson);

	setTimeout(function(){
		document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 500);
	
	
})();
