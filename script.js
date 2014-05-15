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
						                                    888          .d8888b.                   d8b          888    
						                                    888         d88P  Y88b                  Y8P          888    
						                                    888         Y88b.                                    888    
						 .d88b.   .d88b.   .d88b.   .d88b.  888  .d88b.  "Y888b.    .d8888b 888d888 888 88888b.  888888 
						d88P"88b d88""88b d88""88b d88P"88b 888 d8P  Y8b    "Y88b. d88P"    888P"   888 888 "88b 888    
						888  888 888  888 888  888 888  888 888 88888888      "888 888      888     888 888  888 888    
						Y88b 888 Y88..88P Y88..88P Y88b 888 888 Y8b.    Y88b  d88P Y88b.    888     888 888 d88P Y88b.  
						 "Y88888  "Y88P"   "Y88P"   "Y88888 888  "Y8888  "Y8888P"   "Y8888P 888     888 88888P"   "Y888 
						     888                        888                                             888             
						Y8b d88P                   Y8b d88P                                             888             
						 "Y88P"                     "Y88P"                                              888                       
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
			animationScript.createOneDayLayer(UIScript.getSliderDate()); //createOneDayLayer == AnimationScript
		}); 

		$('#animateHeatmap').on('click', function(){
			tempDate = UIScript.getSliderDate();
			animationScript.startAnimation(tempDate, Number($('#dateSlider').val()));
		});

		$('#stopAnimation').on('click', function(){
			animationScript.stopAnimation();
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

	createHeatmap: function(mvcarray){

		// objectScript.createHeatPoints();
		// console.log(schoolinfoArray); // WORKS
		// mvcitems = new google.maps.MVCArray(schoolinfoArray);
		// console.log(mvcitems); // WORKS
		heatmaplayer = new google.maps.visualization.HeatmapLayer({
			data: mvcarray,
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
		// items = [];
		
		// console.log(datesArray);
		console.log(fromDate, toDate);
		fromDate = new Date(fromDate);
		toDate = new Date(toDate);
		console.log(fromDate, toDate);

		fromDate = fromDate.getFullYear() + '' + fromDate.getMonth()+'' + fromDate.getDate();
		
		toDate = toDate.getFullYear() + ''+toDate.getMonth()+'' + toDate.getDate();
		console.log(fromDate, toDate);

		var mvcarray = [];
		
		$.each( datesArray, function ( key, val){
			
			var tempDate = new Date(val['date']);

			tempDate = tempDate.getFullYear() + '' + tempDate.getMonth() + '' +  tempDate.getDate();
			// console.log(tempDate);
			// if((tempDate >= fromDate) && (tempDate <= toDate)){
			if(tempDate >= fromDate && tempDate <= toDate){
				// console.log('found date');
				var tot = {};
				var returnValue = objectScript.getSchoolInformation('location', val['schoolid'], 'schoolid');

				tot.location 	= returnValue;
				tot.weight 		= val['weight'];
				mvcarray.push(tot);
			}
			
		});

		mvcarray = new google.maps.MVCArray(mvcarray);
		if(heatmaplayer == null){
			googleScript.createHeatmap(mvcarray);
		}else{
			heatmaplayer.setData(mvcarray);	
		}
		
		// googleScript.createHeatmap(mvcarray);

	},

};

/*
						         888       d8b                   888    .d8888b.                   d8b          888    
						         888       Y8P                   888   d88P  Y88b                  Y8P          888    
						         888                             888   Y88b.                                    888    
						 .d88b.  88888b.  8888  .d88b.   .d8888b 888888 "Y888b.    .d8888b 888d888 888 88888b.  888888 
						d88""88b 888 "88b "888 d8P  Y8b d88P"    888       "Y88b. d88P"    888P"   888 888 "88b 888    
						888  888 888  888  888 88888888 888      888         "888 888      888     888 888  888 888    
						Y88..88P 888 d88P  888 Y8b.     Y88b.    Y88b. Y88b  d88P Y88b.    888     888 888 d88P Y88b.  
						 "Y88P"  88888P"   888  "Y8888   "Y8888P  "Y888 "Y8888P"   "Y8888P 888     888 88888P"   "Y888 
						                   888                                                         888             
						                  d88P                                                         888             
						                888P"                                                          888             
 */

var objectScript = {

	/**
	 * [getSchoolInformation gets value from schoolinfoArray. Return value depends on input]
	 * @param  {[type]} infoType       [what type of info from the object is requested]
	 * @param  {[type]} recognizer     [id, name, or similar value that can identify the correct object]
	 * @param  {[type]} recognizerType [the type of requested value. Is either schoolid, schoolname, totalkids or location]
	 * @return {[type]}                [returns requested information]
	 */
	getSchoolInformation: function(infoType, recognizer, recognizerType){

		if((recognizerType == 'schoolid' )|| (recognizerType == 'schoolname') (recognizerType == 'totalkids') || (recognizerType == 'location')) { //   
			var returnValue = null;

			$.each(schoolinfoArray, function(key, val){

				if(val[recognizerType] == recognizer){
					returnValue = val[infoType];
					return false;
				}

			});

			return returnValue;

		}else{
			console.log('ififif');
			return null;
		}
		
	},

	/**
	 * [gettheDate description]
	 * @param  {[type]} nrOfDays [description]
	 * @param  {[type]} theDate  [description]
	 * @return {[type]}          [description]
	 */
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
};

/*
								888     888 8888888 .d8888b.                   d8b          888    
								888     888   888  d88P  Y88b                  Y8P          888    
								888     888   888  Y88b.                                    888    
								888     888   888   "Y888b.    .d8888b 888d888 888 88888b.  888888 
								888     888   888      "Y88b. d88P"    888P"   888 888 "88b 888    
								888     888   888        "888 888      888     888 888  888 888    
								Y88b. .d88P   888  Y88b  d88P Y88b.    888     888 888 d88P Y88b.  
								 "Y88888P"  8888888 "Y8888P"   "Y8888P 888     888 88888P"   "Y888 
								                                                   888             
								                                                   888             
								                                                   888             
 */

var UIScript = {
	
	getSliderDate: function(){
		nrOfDays 	= Number($('#dateSlider').val());
		tempDate = objectScript.gettheDate(nrOfDays);
		return tempDate;
	},

	setSliderDate: function(setDate){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		var sliderval = Math.abs((firstDate.getTime() - setDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').val(sliderval);
	},

	calculateDays: function(){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		diffDays = Math.abs((firstDate.getTime() - lastDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').attr('min', 0);
		$('#dateSlider').attr('max', diffDays);
	},

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
					                  d8b                        888    d8b                    .d8888b.                   d8b          888    
					                  Y8P                        888    Y8P                   d88P  Y88b                  Y8P          888    
					                                             888                          Y88b.                                    888    
					 8888b.  88888b.  888 88888b.d88b.   8888b.  888888 888  .d88b.  88888b.   "Y888b.    .d8888b 888d888 888 88888b.  888888 
					    "88b 888 "88b 888 888 "888 "88b     "88b 888    888 d88""88b 888 "88b     "Y88b. d88P"    888P"   888 888 "88b 888    
					.d888888 888  888 888 888  888  888 .d888888 888    888 888  888 888  888       "888 888      888     888 888  888 888    
					888  888 888  888 888 888  888  888 888  888 Y88b.  888 Y88..88P 888  888 Y88b  d88P Y88b.    888     888 888 d88P Y88b.  
					"Y888888 888  888 888 888  888  888 "Y888888  "Y888 888  "Y88P"  888  888  "Y8888P"   "Y8888P 888     888 88888P"   "Y888 
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
		var month 	= choosenDate.getMonth() + 1;

		if(day < 10){
			day = '0' + day;
		}
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

	/**
	 * [createMultipleDaysLayer description]
	 * @return {[type]} [description]
	 */
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
		var interval = 1;
		
		myTimer = setInterval(function(){
			
			i++;
			
			if(i <= diffDays && diffDays != null){
				animationScript.animateMap(tempDate);
				tempDate = objectScript.gettheDate(interval, tempDate)
				// console.log(i + ' ' + diffDays);
				UIScript.setSliderDate(tempDate);
			}else{
				// console.log(i + ' ' + diffDays);
				animationScript.stopAnimation();
			}

		}, 1000);
	},

	stopAnimation: function(){
		clearInterval(myTimer);
		console.log('STOP. Hammertime.');
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
									  888888  .d8888b.   .d88888b.  888b    888 
									    "88b d88P  Y88b d88P" "Y88b 8888b   888 
									     888 Y88b.      888     888 88888b  888 
									     888  "Y888b.   888     888 888Y88b 888 
									     888     "Y88b. 888     888 888 Y88b888 
									     888       "888 888     888 888  Y88888 
									     88P Y88b  d88P Y88b. .d88P 888   Y8888 
									     888  "Y8888P"   "Y88888P"  888    Y888 
									   .d88P                                    
									 .d88P"                                     
									888P"                                       
 */

var jsonScript = {
	getjson: function(){
		
		datesArray = [];
		schoolinfoArray = [];
		googleScript.createmap();
		
		// INFO ABOUT SCHOOLS: Has: id, school, kidsum, lat, lng
		$.getJSON(schoolinfo_fp, function( data ){
			$.each( data, function( key, val ){
				
				if(parseFloat(val['LAT']) != NaN && parseFloat(val['LNG']) != NaN){
					var lati = Number( val['LAT'] );
				 	var lngi = Number( val['LNG'] );
				}else{
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
			// console.log('schoolinfo: ');
			// console.log(schoolinfoArray);
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
			console.log(firstDate, lastDate);
			// console.log(datesArray);
			// googleScript.createHeatmap();
			var startDate = UIScript.getSliderDate();
			googleScript.createLayerByDate(startDate, startDate);
			UIScript.calculateDays();

		});
		
		// finaljson = $.parseJSON(finaljson);
		
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

	google.maps.event.addDomListener(window, 'load', jsonScript.getjson);

	setTimeout(function(){
		document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 500);
	
	
})();
