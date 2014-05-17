// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter


// File id = 129pYBFNzBwqEjiGoBoDRwbiJKgJ76jJ4RtxQx2C0y2M
// http://patorjk.com/software/taag/#p=display&f=Colossal&t=FOOTER


/**
 * 
 * VARIABLES
 * 
 */
var mapOptions 		= null;
var myCenter 		= null;
var map 			= null;
var bounds 			= null;

var schoolinfoArray	= null;
var datesArray		= null;
var polylineArray 	= null;

var heatmaplayer 	= null;
var polylineslayer 	= null;
var markers 		= null;

var firstDate 		= null;
var lastDate  		= null;
var diffDays		= null;
var dates_fp		= '/dbt/json/dates.json';
var schoolinfo_fp 	= '/dbt/json/schoolinfo.json';
var connections_fp 	= '/dbt/json/schoolconnections.json';

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

		$('#togglePolylines').on('click', function(){
			if(polylineslayer.getVisible()){
				polylineslayer.setVisible(false);
			}else{
				polylineslayer.setVisible(true);
			}
		});

		$('#toggleMarkers').on('click', function(){
			// console.log('in toggle', markers.getZIndex());
			if(markers.getVisible()){
				markers.setVisible(false);
			}else{
				markers.setVisible(true);
			}
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
			var theDate = UIScript.getSliderDate();
			var schoolid = UIScript.getSchoolId();
			objectScript.createPolyArray(theDate, theDate, schoolid);
		}); 

		$('#animateHeatmap').on('click', function(){
			tempDate = UIScript.getSliderDate();
			animationScript.startAnimation(tempDate);
		});

		$('#stopAnimation').on('click', function(){
			animationScript.stopAnimation();
		});

		$('#schoolDropdown').on('change', function(){
			var theDate = UIScript.getSliderDate();
			var schoolid = UIScript.getSchoolId();
			objectScript.createPolyArray(theDate, theDate, schoolid);
		});
	},


	createmap: function(){

		lycksele = new google.maps.LatLng(64.592418,18.688387);

		mapOptions = {
			center: lycksele,
			zoom: 13,
			scrollwheel: false,
			streetViewControl: false,
			draggable: true,
			zoomControl:true,
		    zoomControlOptions: {
		      style:google.maps.ZoomControlStyle.SMALL
		    },
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
			radius: heatmapRadius,
		});
		
		heatmaplayer.setMap(map);
		// googleScript.createMarkers();
	},

	createPolylines: function(polyarray){

		// polyarray = [new google.maps.LatLng(64.5996781, 18.7096914),
		// new google.maps.LatLng(64.5846476, 18.6705204),
		// new google.maps.LatLng(64.6005173, 18.7061959)];
		console.log('polyarray: ', polyarray);
		
		// if(typeof polyarray == 'undefined'){
		// 	var firstStep = UIScript.getSliderDate();
		// 	console.log('polyarray undefined, fixing', firstStep);
		// 	objectScript.createPolyArray(firstStep, firstStep);
		// }
		// else{

		polylineslayer = new google.maps.Polyline({
			path1: polyarray,
			strokeColor: '#2980b9',
			strokeOpacity: 1.0,
			strokeWeight: 2,
			editable: false,
			geodesic: true,
		});

		polylineslayer.setMap(map);	

		// }

	},

	/*************************************
	 * createLayerByDate
	 * ISSUES: fromDate <= tempDate hämtar dagen efter fromDate, inte samma. Dra -1 på fromDate???
	 *************************************/
	createLayerByDate: function(fromDate, toDate){
		// items = [];
		
		// console.log(datesArray);
		// console.log(fromDate, toDate);
		fromDate = objectScript.dateFixer(fromDate);
		toDate = objectScript.dateFixer(toDate);
		// console.log(fromDate, toDate);

		var mvcarray = [];
		
		$.each( datesArray, function ( key, val){
			
			var tempDate = objectScript.dateFixer(val['date']);
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

	createMarkers: function(){
		var image = {
			url: 'img/bluedot.png',
			size: new google.maps.Size(7,7),
			anchor: new google.maps.Point(3.5,3.5),
		};

		var shape = {

		};
		// objectScript.printObjects();
		// console.log('schooLLat', tempus);
		for(i = 0; i < schoolinfoArray.length; i++){
			// var schollocation = objectScript.getSchoolInformation('location', i, 'schoolid');
			markers = new google.maps.Marker({
				position: objectScript.getSchoolInformation('location', i, 'schoolid'),
				map: map,
				zIndex: 10,
				icon: image,
			});
		}
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

	printObjects: function(){
		console.log('schoolinfoArray', schoolinfoArray);
		console.log('datesArray', datesArray);
		console.log('polylineArray', polylineArray);
	},

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
			tempDate = new Date(firstDate);
			// console.log('in undefined', nrOfDays);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			return tempDate;
		}else{
			// console.log('defined');
			tempDate = new Date(theDate);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			return tempDate;	
		}
	},

	createPolyArray: function(fromDate, toDate, schoolid){

		var theSchool = schoolid;
		// console.log('theSchool', theSchool);
		var polyarray = [];

		theSchoolLocation = objectScript.getSchoolInformation('location', theSchool, 'schoolid');

		fromDate = new Date(fromDate);
		toDate = new Date(toDate);
		console.log('In createPolyArray with dates: ', fromDate, toDate);

		$.each( polylineArray, function (key, val){

			if(val['owner'] == theSchoolLocation){

				fromtemp = val['fromdate'];
				totemp = val['todate'];
				
				if((fromtemp <= fromDate) && (totemp > toDate)){

					
					var destination = val['destination'];
					var owner = val['owner'];
					polyarray.push(owner);
					polyarray.push(destination);
					
					
				} // if fromtemp <= fromDate
								
			} // if val

		}); // .each

		if(polylineslayer == null){
			console.log('polylineslayer is null')
			googleScript.createPolylines(polyarray);
		}else{
			console.log('setting new path');
			console.log('new polyarray: ', polyarray);
			polylineslayer.setPath(polyarray);
		}

	},

	dateFixer: function(tempDate){
		tempDate = new Date(tempDate);
		// console.log('new date: ', tempDate);
		tempDate = tempDate.getFullYear() + '' + (tempDate.getMonth()+1) + '' +  tempDate.getDate();
		return tempDate;
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
		// console.log('nr of days', tempDate);
		return tempDate;
	},

	setSliderDate: function(setDate){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		var sliderval = Math.abs((firstDate.getTime() - setDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').val(sliderval);
	},

	getSchoolId: function(){
		var dropDownId = Number($('#schoolDropdown').val());
		return dropDownId;
	},

	calculateDays: function(){
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		diffDays = Math.abs((firstDate.getTime() - lastDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').attr('min', 0);
		$('#dateSlider').attr('max', diffDays);
	},

};


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
var timer = null;
/**
 * [animationScript description]
 * createOneDayLayer
 * animateMap
 */
var animationScript = {

	createOneDayLayer: function(choosenDate){
		
		choosenDate = new Date(choosenDate);
		var dayType = animationScript.getWeekday(choosenDate);
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
		objectScript.createPolyArray(choosenDate, choosenDate);
		
	},

	getWeekday: function(theDate){
		theDate = new Date(theDate);
		var dayType = weekday[theDate.getDay()];
		return dayType;
	},

	/**
	 * [createMultipleDaysLayer description]          				 FUNCTION NOT USED
	 * @return {[type]} [description]
	 */
	createMultipleDaysLayer: function(){
		
		if(tempDate == null){
			// console.log('if');
			newDate 	= new Date(firstDate);	
		}else{
			// console.log('else');
			newDate = new Date(tempDate);
		}
		newDate.setDate(newDate.getDate() + nrOfDays);
	},

	startAnimation: function(tempDate, sliderval){
		var i = Number($('#dateSlider').val());
		var interval = 1;
		// timer = 1000;

		myTimer = setInterval(function(){
			i++;
			var daytype = animationScript.getWeekday(tempDate);

			if(daytype == 'Lör' || daytype == 'Sön'){
				tempDate = objectScript.gettheDate(2, tempDate);
			}

			if(i <= diffDays && diffDays != null){
				animationScript.animateMap(tempDate);
				tempDate = objectScript.gettheDate(interval, tempDate)
				// console.log(i + ' ' + diffDays);
				UIScript.setSliderDate(tempDate);
				
				var schoolid = UIScript.getSchoolId();
				objectScript.createPolyArray(tempDate, tempDate, schoolid);

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
		// console.log(i + ' ' + tempDate);	
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
	
	getSchoolinfoJson: function(){
		
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
			console.log('getSchoolinfoJson DONE');
			jsonScript.getDatesJson();


		});
	},

	getDatesJson: function(){

		datesArray = [];

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

			// console.log('dates');
			// console.log(firstDate, lastDate);
			// console.log(datesArray);
			// googleScript.createHeatmap();
			UIScript.calculateDays();
			var startDate = UIScript.getSliderDate();
			// console.log('createing startdate', startDate);
			googleScript.createLayerByDate(startDate, startDate);
			console.log('getDatesJson DONE')
			jsonScript.getConnectionJson();

			

		});
	},

	getConnectionJson: function(){

		polylineArray = [];

		$.getJSON(connections_fp, function(data){
			// console.log(data);
			$.each( data, function( key, val ){
				
				var tot = {};

				var ownerLocation = objectScript.getSchoolInformation('location', val['OWNER'], 'schoolid');
				var destinationLocation = objectScript.getSchoolInformation('location', val['DESTINATION'], 'schoolid');

				tot.owner = ownerLocation;
				tot.destination = destinationLocation;
				tot.fromdate = new Date(val['FROMDATE']);
				tot.todate = new Date(val['TODATE']);

				polylineArray.push(tot);

			});

			var startDate = UIScript.getSliderDate();
			console.log('getConnectionJson DONE');
			var schoolid = UIScript.getSchoolId();
			objectScript.createPolyArray(startDate, startDate, schoolid);

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

	google.maps.event.addDomListener(window, 'load', jsonScript.getSchoolinfoJson);

	setTimeout(function(){
		document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 1500);
	
	
})();
