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
var polylineslayer 	= [];
var markers 		= [];
var lines			= [];

var firstDate 		= null;
var lastDate  		= null;
var diffDays		= null;
var dates_fp		= '/dbt/json/dates.json';
var schoolinfo_fp 	= '/dbt/json/schoolinfoNew.json';
var schoolinfo_fp_old = '/dbt/json/schoolinfo.json';
var connections_fp 	= '/dbt/json/schoolconnections.json';

/**
 * 
 * SETTINGS
 * 
 */
var heatmapOpacity 	= 1;
var heatmapRadius 	= 20;
var percent 		= true;
var weekday = new Array(7);
	weekday[0] = "Sön";
	weekday[1] = "Mån";
	weekday[2] = "Tis";
	weekday[3] = "Ons";
	weekday[4] = "Tors";
	weekday[5] = "Fre";
	weekday[6] = "Lör";

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
		$('#toggleHeatmap').on('click', function(){
			heatmaplayer.setMap(heatmaplayer.getMap() ? null : map);	
		});

		$('#togglePolylines').on('click', function(){
			if(polylineslayer.getVisible()){
				polylineslayer.setVisible(false);
			}else{
				polylineslayer.setVisible(true);
			}
			console.log('Toggled polyline. NOT');
		});

		$('#toggleMarkers').on('click', function(){
			if(markers[1].getVisible()){
				for(i = 0; i < markers.length; i++){
					markers[i].setVisible(false);	
				}
				console.log('setting false');
				
			}else{
				
				for(i = 0; i < markers.length; i++){
					markers[i].setVisible(true);		
				}
				console.log('setting true');
			}
		});

		$('#submitDates').on('click', function(){
			var fromDate = $('#fromDate').val();
			var toDate = $('#toDate').val();
			
			if(fromDate != null && toDate != null)
			{	
				console.log('Setting sliderDate from submitDates');
				UIScript.setSliderDate(fromDate);
				UIScript.setInformation();
				googleScript.createLayerByDate(fromDate, toDate);
			}
			else
			{
				alert('Invalid input');
			}
		});

		$('#dateSlider').mouseup(function(){
			UIScript.setInformation();
		}); 

		$('#animateHeatmap').on('click', function(){
			tempDate = UIScript.getSliderDate();
			animationScript.startAnimation(tempDate);
		});

		$('#stopAnimation').on('click', function(){
			animationScript.stopAnimation();
		});

		$('#schoolDropdown').on('change', function(){
			UIScript.setInformation();
		});

		$('#percent').change(function() {
			if($(this).is(":checked")) {
				percent = true;
			}else{
				percent = false;
			}
			animationScript.createOneDayLayer(UIScript.getSliderDate());
			// $('#textbox1').val($(this).is(':checked'));        
	});
	},


	createmap: function(){

		var mapstyling3 = [
		{"featureType":"landscape","stylers":[{"hue":"#F1FF00"},{"saturation":-27.4},{"lightness":9.4},{"gamma":1}]},
		{"featureType":"road.highway","stylers":[{"hue":"#0099FF"},{"saturation":-20},{"lightness":36.4},{"gamma":1}]},
		{"featureType":"road.arterial","stylers":[{"hue":"#00FF4F"},{"saturation":0},{"lightness":0},{"gamma":1}]},
		{"featureType":"road.local","stylers":[{"hue":"#FFB300"},{"saturation":-38},{"lightness":11.2},{"gamma":0}]},
		{"featureType":"water","stylers":[{"hue":"#00B6FF"},{"saturation":4.2},{"gamma":0}]},
		{"featureType":"poi","stylers":[{"hue":"#9FFF00"},{"saturation":0},{"lightness":0},{"gamma":1}]}];

		lycksele = new google.maps.LatLng(64.592418,18.688387);

		mapOptions = {
			center: lycksele,
			zoom: 13,
			scrollwheel: false,
			streetViewControl: false,
			draggable: true,
			styles: mapstyling3,
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

		heatmaplayer = new google.maps.visualization.HeatmapLayer({
			data: mvcarray,
			opacity: heatmapOpacity,
			radius: heatmapRadius,
		});
		
		heatmaplayer.setMap(map);
		googleScript.createMarkers();
	},

	createPolylines: function(polyarrayDest, polyarrayHome, polyarrayWeights){
		// console.log('polyarray: ', polyarrayDest, polyarrayHome, polyarrayWeights);	

		var red 	= 'FF2000';
		var orange 	= 'FFA000';
		var yellow 	= 'FFF000';
		var semigreen = 'C0FF00';
		var green 	= '4BF000';


		for(i = 0; i < polylineslayer.length; i++){
			polylineslayer[i].setMap(null);
		}

		for(i = 0; i < polyarrayDest.length; i++)
		{	
			var weight = polyarrayWeights[i];
			
			if(weight <= 3) color = green;
			else if(weight > 3 && weight <= 6) color = semigreen;
			else if(weight > 6 && weight <= 9) color = yellow;
			else if(weight > 9 && weight <= 13) color = orange;
			else color = red;

			polylineslayer[i] = new google.maps.Polyline({
				path: [polyarrayDest[i], polyarrayHome[0]],
				strokeColor: color,
				strokeOpacity: 1.0,
				strokeWeight: 4,//polyarrayWeights[i],
				visible: true,
			});
			polylineslayer[i].setMap(map);
		}
		

	},

	/*************************************
	 * createLayerByDate
	 * ISSUES: fromDate <= tempDate hämtar dagen efter fromDate, inte samma. Dra -1 på fromDate???
	 * Är ISSUES fortf en issue. I don't know. Well..fuck.
	 *************************************/
	createLayerByDate: function(fromDate, toDate){
		fromDate = objectScript.dateFixer(fromDate);
		toDate = objectScript.dateFixer(toDate);

		var mvcarray = [];
		var oldkidsTotal = null;
		
		$.each( datesArray, function (key, val)
		{
			
			var tempDate = objectScript.dateFixer(val['date']);

			if(tempDate >= fromDate && tempDate <= toDate)
			{
				var tot = {};
				var returnValue = objectScript.getSchoolInformation('location', val['schoolid'], 'schoolid');
				var sickKids = val['weight'];
				// console.log('createLayerByDate sickkids: ', sickKids);
				
				
				if(percent == true)
				{
					var kidsTotal	= objectScript.getSchoolInformation('totalkids', val['schoolid'], 'schoolid');
					// console.log('createLayerByDate kidsTotal: ', kidsTotal, val['schoolid']);
					
					if(kidsTotal > oldkidsTotal || oldkidsTotal == null){
						oldkidsTotal = kidsTotal;
					}
					else
					{
						kidsTotal = oldkidsTotal;
					}

					sickKids = (sickKids / kidsTotal) * 100;

				}

				// console.log('createLayerByDate weight: ', sickKids);
				// console.log('date: ', tempDate);
				// console.log('--------------------------')
				tot.location 	= returnValue;
				tot.weight 		= sickKids;
				mvcarray.push(tot);

			}
			
		});

		mvcarray = new google.maps.MVCArray(mvcarray);
		if(heatmaplayer == null)
		{
			googleScript.createHeatmap(mvcarray);
		}
		else
		{
			heatmaplayer.setData(mvcarray);	
		}
		
		// googleScript.createHeatmap(mvcarray);

	},

	createMarkers: function(){
		var image = {

			url: 	'img/bluedot.png',
			size: 	new google.maps.Size(7,7),
			anchor: new google.maps.Point(3.5,3.5),

		};

		var shape = {};
		var markerdata = [];
		
		for(i = 0; i < schoolinfoArray.length; i++)
		{
			var marker = [];
			var schoollocation 	= schoolinfoArray[i]['location'];
			var schoolname 		= schoolinfoArray[i]['schoolname'];
			var id 				= schoolinfoArray[i]['schoolid'];
			// console.log(schoolinfoArray[i])
			marker.push(schoollocation);
			marker.push(schoolname);
			marker.push(id);
			// marker.push(totkids);
			markerdata.push(marker);
		}
		// objectScript.printObjects();
		// console.log('schooLLat', tempus);
		for(i = 0; i < markerdata.length; i++)
		{
			marker = markerdata[i];

			markers[i] = new google.maps.Marker
			({
				map: 		map,
				position: 	marker[0],
				zIndex: 	10,
				icon: 		image,
				school: 	marker[1],
				id: 		marker[2],
				// kids: 		marker[2]
			});

			google.maps.event.addListener(markers[i], 'click', function(point)
			{
				// console.log(this.school, this.id);
				UIScript.setSchoolInformation(this.id);
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

	getDatesInformation: function(schoolid){
		if($(url).last()[0] == "index.html")
		{
			fromDate = objectScript.dateFixer(UIScript.getSliderDate());
		}
		else
		{
			fromDate = objectScript.dateFixer(UIScript.getFromDate());
		}
		
		toDate = fromDate;		
		var returnValue = 0;
		// console.log('schoolid', schoolid);

		$.each( datesArray, function (key, val)
		{
			var tempDate = objectScript.dateFixer(val['date']);

			if((tempDate >= fromDate && tempDate <= toDate) && (val['schoolid'] == schoolid))
			{
				returnValue = val['weight'];
				return false;
			}
		});
		return returnValue;

	},

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

		console.log('recognizer: ', recognizer);
		if((recognizerType == 'schoolid' )|| (recognizerType == 'schoolname') (recognizerType == 'totalkids') || (recognizerType == 'location'))
		{   
			var returnValue = null;

			if(infoType != 'totalkids')
			{
				$.each(schoolinfoArray, function(key, val)
				{
					if(val[recognizerType] == recognizer)
					{
						returnValue = val[infoType];
						return false;
					}
				});
				return returnValue;	
			}

			else if(infoType == 'totalkids') // if infoType (requested datatype) is totalkids
			{
				if($(url).last()[0] == "index.html")
				{
					var sliderDate = objectScript.dateFixer(UIScript.getSliderDate());
				}
				else
				{
					var sliderDate = objectScript.dateFixer(UIScript.getFromDate());
				}
				//Loops through all schools
				$.each(schoolinfoArray, function(key, val)
				{
					// if requested school is recognized, get the kidSum
					if(val[recognizerType] == recognizer)
					{
						// Loops through kidSums.
						$.each(val['totalkids'], function(keys, vals){

							fromdate = objectScript.dateFixer(vals['FROMDATE']);
							todate = objectScript.dateFixer(vals['TODATE']);
							console.log('dates: ', fromdate, sliderDate);
							console.log('todate: ', todate);
							// if datematch is found, return kidSum
							if(fromdate <= sliderDate && sliderDate <= todate)
							{
								returnValue = vals['KIDSUM'];
								return false;
							}
						});	
					}
					
				});

				return returnValue;
			}
			else
			{
				console.log('Sumsin is wong');
				return null;
			}
			

		}
		else
		{
			console.log('Sumsin is weely wong');
			return null;
		}
		
	},

	/**
	 * [gettheDate description]
	 * @param  {[type]} nrOfDays [description]
	 * @param  {[type]} theDate  [description]
	 * @return {[type]}          [description]
	 */
	getFutureDate: function(nrOfDays, theDate){
		if(typeof theDate == 'undefined')
		{
			tempDate = new Date(firstDate);
			// console.log('in undefined', nrOfDays);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			return tempDate;
		}
		else
		{
			// console.log('defined');
			tempDate = new Date(theDate);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			return tempDate;	
		}
	},

	createPolyArray: function(fromDate, toDate, schoolid){

		var polyarrayDest	 = [];
		var polyarrayHome 	 = [];
		var polyArrayWeights = [];
		var strokeW 		 = 0;
		theSchoolLocation 	 = objectScript.getSchoolInformation('location', schoolid, 'schoolid');

		fromDate = new Date(fromDate);
		toDate 	 = new Date(toDate);
		// console.log('In createPolyArray with dates: ', fromDate, toDate, schoolid);

		$.each( polylineArray, function (key, val)
		{
			if(val['owner'] == theSchoolLocation)
			{

				fromtemp = val['fromdate'];
				totemp = val['todate'];
				
				if((fromtemp <= fromDate) && (totemp > toDate))
				{
					var destination = val['destination'];
					var owner = val['owner'];
					
					polyarrayHome = [owner];
					
					if(!destination.equals(owner)){
					
						var index = polyarrayDest.indexOf(destination);
						if(index != -1)
						{
							polyArrayWeights[index] += 1;
						}
						else
						{
							var weight = 1;
							polyArrayWeights.push(weight);
							polyarrayDest.push(destination);	
						}
						
					}

				}
								
			}

		});

		googleScript.createPolylines(polyarrayDest, polyarrayHome, polyArrayWeights);

	},

	dateFixer: function(tempDate){
		tempDate = new Date(tempDate);
		var year = tempDate.getFullYear();
		var month = tempDate.getMonth()+1;
		var day = tempDate.getDate();
		if(day < 10) {day = '0' + day};
		if(month < 10){month = '0' + month};
		tempDate = year + '' + month + '' + day;
		// tempDate = tempDate.getFullYear() + '' + (tempDate.getMonth()+1) + '' +  tempDate.getDate();
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

	init: function(){
		UIScript.setSchoolBoxInformation();	
	},

	setSchoolInformation: function(schoolid){

		var totkids = objectScript.getSchoolInformation('totalkids', schoolid, 'schoolid');
		var schoolname = objectScript.getSchoolInformation('schoolname', schoolid, 'schoolid');
		var schoolloc = objectScript.getSchoolInformation('location', schoolid, 'schoolid');
		var sickkids = objectScript.getDatesInformation(schoolid);

		console.log('school location: ', schoolloc);
		// console.log('sick kids:', sickkids);
		
		document.getElementById('schoolname').innerHTML = schoolname;
		document.getElementById('schoolkids').innerHTML = totkids;
		document.getElementById('sickkids').innerHTML 	= sickkids;
		
		UIScript.setSchoolId(schoolid);
	},

	setInformation: function(){
		var theDate = UIScript.getSliderDate();
		var schoolid = UIScript.getSchoolId();
		var daytype = animationScript.getWeekday(theDate);

		if(daytype == 'Lör')
		{
			theDate = objectScript.getFutureDate(2, theDate);
		}
		else if(daytype == 'Sön')
		{
			theDate = objectScript.getFutureDate(1, theDate);
		}
		animationScript.createOneDayLayer(theDate);
		// console.log('UIScript setInformation calling for createPolyArray');
		// objectScript.createPolyArray(theDate, theDate, schoolid);
		// UIScript.setSchoolInformation(schoolid);


	},

	/**
	 * [setSchoolBoxInformation description]
	 * UNUSED FUNCTION FOR NOW
	 */
	setSchoolBoxInformation: function(){
		objectScript.printObjects();
		var totkids = objectScript.getSchoolInformation('totalkids', 1, 'schoolid');
		console.log('Schoolbox ', totkids);

		for(i = 1; i <= 6; i++){

			var totkids = objectScript.getSchoolInformation('totalkids', i, 'schoolid');
			var schoolname = objectScript.getSchoolInformation('schoolname', i, 'schoolid');
			// var schoolloc = objectScript.getSchoolInformation('location', i, 'schoolid');
			var sickkids = objectScript.getDatesInformation(i);

			$('.schoolBox:nth-child('+i+') .schoolheader').html(''+schoolname);
			$('.schoolBox:nth-child('+i+') .schoolkids span').html(''+totkids);
			$('.schoolBox:nth-child('+i+') .sickkids span').html(''+sickkids);

		}
	},
	
	getSliderDate: function(){
		nrOfDays 	= Number($('#dateSlider').val());
		tempDate = objectScript.getFutureDate(nrOfDays);
		return tempDate;
	},

	setSliderDate: function(setDate){
		setDate = new Date(setDate);
		var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
		var sliderval = Math.abs((firstDate.getTime() - setDate.getTime())/(oneDay));
		// console.log(diffDays);
		$('#dateSlider').val(sliderval);
	},

	getSchoolId: function(){
		return Number($('#schoolDropdown').val());;
	},

	setSchoolId: function(schoolid){
		$('#schoolDropdown').val(schoolid);
	},

	getFromDate: function(){
		return $('#fromDate').val();
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

		if(day < 10)
		{
			day = '0' + day;
		}
		if(month < 10)
		{
			month = '0' + month;
		}
		
		var year 	= choosenDate.getFullYear();
		
		choosenDate = year + "-" + month + "-" + day;
		if(document.getElementById('sliderValue') != null){
			document.getElementById('sliderValue').innerHTML = 'Datum:	' + choosenDate + '<br>Dag:	' + dayType;	
		}
		

		googleScript.createLayerByDate(choosenDate, choosenDate);	
		// console.log('createOneDayLayer calling for createPolyArray');

		objectScript.createPolyArray(choosenDate, choosenDate, UIScript.getSchoolId());
		
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
		
		if(tempDate == null)
		{
			newDate 	= new Date(firstDate);	
		}
		else
		{
			newDate = new Date(tempDate);
		}
		
		newDate.setDate(newDate.getDate() + nrOfDays);
	},

	startAnimation: function(tempDate){
		var i = Number($('#dateSlider').val());
		var interval = 1;

		myTimer = setInterval(function()
		{
			i++;
			var daytype = animationScript.getWeekday(tempDate);

			/*
			Will detect Saturday först, and therefore skip Sunday automatically. If start 
			is on a Sunday, it will be monday within a second (shieeet...)
			 */
			if(daytype == 'Lör')
			{
				tempDate = objectScript.getFutureDate(2, tempDate);
			}

			if(i <= diffDays && diffDays != null)
			{
				animationScript.animateMap(tempDate);
				tempDate = objectScript.getFutureDate(interval, tempDate)
				UIScript.setSliderDate(tempDate);
				
				var schoolid = UIScript.getSchoolId();
				objectScript.createPolyArray(tempDate, tempDate, schoolid);
				// UIScript.setSchoolInformation(schoolid);
			}
			else
			{
				animationScript.stopAnimation();
			}

		}, 1000);
	},

	stopAnimation: function(){
		clearInterval(myTimer);
		console.log('STOP. Hammertime.');
	},

	animateMap: function(tempDate){
		animationScript.createOneDayLayer(tempDate);
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
		url = document.URL.split('/');
		
		if($(url).last()[0] == "index.html"){
			googleScript.createmap();
		}

		
		// INFO ABOUT SCHOOLS: Has: id, school, lat, lng, Kidsum depending on date
		$.getJSON(schoolinfo_fp, function( data )
		{
			$.each( data, function( key, val )
			{
				
				if(parseFloat(val['LAT']) != NaN && parseFloat(val['LNG']) != NaN)
				{
					var lati = Number( val['LAT'] );
					var lngi = Number( val['LNG'] );
				}
				else
				{
					console.log('shit');
					return false
				}

				var schools = {};

				schools.schoolid 	= Number(val['ID']);
				schools.schoolname 	= val['SCHOOL'];
				schools.totalkids 	= val['KIDSUM'];
				schools.location 	= new google.maps.LatLng(lati, lngi);

				// var kids = {}

				// var kids = $.parseJSON(val['KIDSUM']);

				schoolinfoArray.push(schools);

			});

			console.log('getSchoolinfoJson DONE');
			jsonScript.getDatesJson();
		});
	},

	getDatesJson: function(){

		datesArray = [];

		// SICK KIDS PER DAY AND SCHOOL
		// has: date, schoolid, number
		$.getJSON(dates_fp, function( data )
		{
			$.each( data, function( key, val )
			{
				var tot = {};
				var date = new Date( val['DATE'] );

				if(date < firstDate || firstDate == null)
				{
					firstDate = new Date(date);
				}

				if(date > lastDate || lastDate == null)
				{
					lastDate = new Date(date);
				}

				var day 		= date.getDate();
				var month 		= date.getMonth() + 1;
				var year 		= date.getFullYear();

				tot.weight 		= Number(val['NUMBER']);
				tot.schoolid	= Number(val['SCHOOLID']);
				tot.date		= year + "-" + month + "-" + day;
				datesArray.push(tot);
			});

			// console.log('calling UIScript.calculateDays');
			UIScript.calculateDays();
			var startDate = UIScript.getSliderDate();

			// console.log('calling googleScript.createLayerByDate');
			
			googleScript.createLayerByDate(startDate, startDate);	
			
			console.log('getDatesJson DONE')
			jsonScript.getConnectionJson();
		});
	},

	getConnectionJson: function(){

		polylineArray = [];

		$.getJSON(connections_fp, function(data)
		{
			$.each( data, function(key, val)
			{	
				var tot = {};

				var ownerLocation = objectScript.getSchoolInformation('location', val['OWNER'], 'schoolid');
				var destinationLocation = objectScript.getSchoolInformation('location', val['DESTINATION'], 'schoolid');

				tot.owner = ownerLocation;
				tot.destination = destinationLocation;
				tot.fromdate = new Date(val['FROMDATE']);
				tot.todate = new Date(val['TODATE']);

				polylineArray.push(tot);

			});
			console.log('getConnectionJson DONE');
			// console.log('calling jsonScript.startUpStuff');
			jsonScript.startUpStuff();			
		});
	},

	startUpStuff: function(){
		// polylineslayer.setVisible(false); 
		var startDate = UIScript.getSliderDate();
		var schoolid = 22;
		UIScript.setSchoolId(schoolid);
		// console.log('calling objectScript.createPolyArray');
		// objectScript.createPolyArray(startDate, startDate, schoolid);
		UIScript.setInformation();

		if($(url).last()[0] == "statistik.html"){
			UIScript.init();
		}
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
