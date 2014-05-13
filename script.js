// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter


// File id = 129pYBFNzBwqEjiGoBoDRwbiJKgJ76jJ4RtxQx2C0y2M
// http://patorjk.com/software/taag/#p=display&f=Colossal&t=FOOTER


/**
 * 
 * VARIABLES
 * 
 */
var mapOptions 	= null;
var myCenter 	= null;
var map 		= null;
var bounds 		= null;
var schoolinfoArray	= null;
var datesArray	= null;
var heatmaplayer= null;
var firstDate 	= null;
var lastDate  	= null;
var diffDays	= null;
var dates_fp	= '/dbt/json/dates.json';
var schoolinfo_fp = '/dbt/json/schoolinfo.json';

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


 /**
						 .d8888b.                             888          .d8888b.                   d8b          888    
						d88P  Y88b                            888         d88P  Y88b                  Y8P          888    
						888    888                            888         Y88b.                                    888    
						888         .d88b.   .d88b.   .d88b.  888  .d88b.  "Y888b.    .d8888b 888d888 888 88888b.  888888 
						888  88888 d88""88b d88""88b d88P"88b 888 d8P  Y8b    "Y88b. d88P"    888P"   888 888 "88b 888    
						888    888 888  888 888  888 888  888 888 88888888      "888 888      888     888 888  888 888    
						Y88b  d88P Y88..88P Y88..88P Y88b 888 888 Y8b.    Y88b  d88P Y88b.    888     888 888 d88P Y88b.  
						 "Y8888P88  "Y88P"   "Y88P"   "Y88888 888  "Y8888  "Y8888P"   "Y8888P 888     888 88888P"   "Y888 
						                                  888                                             888             
						                             Y8b d88P                                             888             
						                              "Y88P"                                              888             
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
			animationScript.startAnimation(tempDate, Number($('#dateSlider').val()));
		});

		$('#stopAnimation').on('click', function(){
			animationScript.stopAnimation();
		});
	},

	getSliderDate: function(){
		nrOfDays 	= Number($('#dateSlider').val());
		tempDate = googleScript.gettheDate(nrOfDays);
		return tempDate;
	},

	setSliderDate: function(setDate){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		var sliderval = Math.abs((firstDate.getTime() - setDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').val(sliderval);
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
			tempDate = tempDate.getFullYear() + '' + tempDate.getMonth() + '' + tempDate.getDate();
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

	getSchoolLocation: function(schoolid){
		var schoolloc = null;	

		$.each( schoolinfoArray, function(key, val){
			if( val['schoolid'] == schoolid){
				schoolloc = val['location'];
				return false;
			}
		});

		return schoolloc;
	},

	calculateDays: function(){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		diffDays = Math.abs((firstDate.getTime() - lastDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').attr('min', 0);
		$('#dateSlider').attr('max', diffDays);
	},

	getjson: function(){
		
		datesArray = [];
		schoolinfoArray = [];
		// googleScript.createmap();
		
		// INFO ABOUT SCHOOLS: Has: id, school, kidsum, lat, lng
		$.getJSON(schoolinfo_fp, function( data ){
			$.each( data, function( key, val ){
				
				if(parseFloat(val['LAT']) != NaN && parseFloat(val['LNG']) != NaN){
					var lati = Number( val['LAT'] );
				 	var lngi = Number( val['LNG']) ;
				}
				else{
					console.log('shit');
					return false
				}

				var schools = {};

				schools.schoolid 	= Number(val['ID']);
				schools.schoolname 	= val['SCHOOL'];
				schools.totalkids 	= Number(val['KIDSUM']);
				schools.location 	= new google.maps.LatLng(lati, lngi);

				schoolinfoArray.push(schools);

			});
			console.log('schoolinfo: ');
			console.log(schoolinfoArray);
		});


		// SICK KIDS PER DAY AND SCHOOL
		// has: date, schoolid, number
		$.getJSON(dates_fp, function( data ){
			// var counter = 0;
			$.each( data, function( key, val ){
					// console.log(val);
				var tot = {};
				// var loc = {};
				var date = new Date( val['DATE'] );

				if(date < firstDate || firstDate == null){
					firstDate = new Date(date);
				}

				if(date > lastDate || lastDate == null){
					lastDate = new Date(date);
				}

				var day 		= date.getDate();
				var month 		= date.getMonth() + 1;
				var year 		= date.getFullYear();

				tot.weight 		= Number(val['NUMBER']);
				tot.schoolid	= Number(val['SCHOOLID']);
				tot.date		= year + "-" + month + "-" + day;
				// counter++;
				datesArray.push(tot);
			});

			console.log('dates');
			console.log(datesArray);
			// googleScript.createHeatmap();
			// googleScript.calculateDays();

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
var myTimer = null;


/*
			       d8888          d8b                        888    d8b                    .d8888b.                   d8b          888    
			      d88888          Y8P                        888    Y8P                   d88P  Y88b                  Y8P          888    
			     d88P888                                     888                          Y88b.                                    888    
			    d88P 888 88888b.  888 88888b.d88b.   8888b.  888888 888  .d88b.  88888b.   "Y888b.    .d8888b 888d888 888 88888b.  888888 
			   d88P  888 888 "88b 888 888 "888 "88b     "88b 888    888 d88""88b 888 "88b     "Y88b. d88P"    888P"   888 888 "88b 888    
			  d88P   888 888  888 888 888  888  888 .d888888 888    888 888  888 888  888       "888 888      888     888 888  888 888    
			 d8888888888 888  888 888 888  888  888 888  888 Y88b.  888 Y88..88P 888  888 Y88b  d88P Y88b.    888     888 888 d88P Y88b.  
			d88P     888 888  888 888 888  888  888 "Y888888  "Y888 888  "Y88P"  888  888  "Y8888P"   "Y8888P 888     888 88888P"   "Y888 
			                                                                                                              888             
			                                                                                                              888             
			                                                                                                              888             
 */


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

	startAnimation: function(tempDate, sliderval){
		var i = sliderval;
		
		myTimer = setInterval(function(){
			
			i++;
			
			if(i <= diffDays && diffDays != null){
				animationScript.animateMap(tempDate);
				tempDate = googleScript.gettheDate(1, tempDate)
				console.log(i + ' ' + diffDays);
				googleScript.setSliderDate(tempDate);
			}else{
				console.log(i + ' ' + diffDays);
				animationScript.stopAnimation();
			}

		}, 1000);
	},

	stopAnimation: function(){
		clearInterval(myTimer);
		console.log('stop. Hammertime.');
	},

	animateMap: function(tempDate){
		/**
		 * Skapa egen funktion som tar in antal dagar den ska flytta fram som inparameter. Kan kallas på för varje varv i loopen härifrån samt från
		 * dateSlidern, som då skickas in ett större värde.
		 */
		
		animationScript.createOneDayLayer(tempDate);
		console.log(i + ' ' + tempDate);	
	},
};


/*
															8888888888 888b    888 8888888b.  
															888        8888b   888 888  "Y88b 
															888        88888b  888 888    888 
															8888888    888Y88b 888 888    888 
															888        888 Y88b888 888    888 
															888        888  Y88888 888    888 
															888        888   Y8888 888  .d88P 
															8888888888 888    Y888 8888888P"  
 */

(function(){
	googleScript.init();

	google.maps.event.addDomListener(window, 'load', googleScript.getjson);

	setTimeout(function(){
		document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 500);
	
	
})();
