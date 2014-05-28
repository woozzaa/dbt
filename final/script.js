// Lycksele: 64.592418,18.688387
// Polyline = linjer mellan punkter


// File id = 129pYBFNzBwqEjiGoBoDRwbiJKgJ76jJ4RtxQx2C0y2M
// http://patorjk.com/software/taag/#p=display&f=Colossal&t=FOOTER


/**
 * VARIABLES
 */
var mapOptions 		= null;
var myCenter 		= null;
var map 			= null;
var bounds 			= null;

var schoolinfoArray	= null;
var datesArray		= null;
var polylineArray 	= null;

var chartarray 		= [];
var lineChart 		= null;

var heatmaplayer 	= null;
var polylineslayer 	= [];
var markers 		= [];
var lines			= [];

var firstDate 		= null;
var lastDate  		= null;
var diffDays		= null;

var dates_fp		= '/dbt/final/json/dates.json';
var schoolinfo_fp 	= '/dbt/final/json/schoolinfoNew.json';
var connections_fp 	= '/dbt/final/json/schoolconnections.json';

/**
 * SETTINGS
 */
var heatmapOpacity 	= 1;
var heatmapRadius 	= 20;
var percent 		= true;
var polyVisible 	= true;
var weekday 		= new Array(7);
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
			// heatmaplayer.setMap(heatmaplayer.getMap() ? null : map);	
			if(heatmaplayer.getMap() == null)
			{
				heatmaplayer.setMap(map);
				document.getElementById('toggleHeatmap').style.backgroundColor = "#2ecc71";
			}
			else
			{
				heatmaplayer.setMap(null);
				document.getElementById('toggleHeatmap').style.backgroundColor = "#bdc3c7";
			}
		});

		$('#togglePolylines').on('click', function(){
			if(polylineslayer[1].getVisible())
			{
				for(var i = 0; i < polylineslayer.length; i++)
				{
					polylineslayer[i].setVisible(false);
					polyVisible = false;
				}
				document.getElementById('togglePolylines').style.backgroundColor = "#bdc3c7";

			}else{
				for(var i = 0; i < polylineslayer.length; i++)
				{
					polylineslayer[i].setVisible(true);
					polyVisible = true;
				}
				document.getElementById('togglePolylines').style.backgroundColor = "#2ecc71";
			}
			console.log('Toggled polyline. NOT');
		});

		$('#toggleMarkers').on('click', function(){
			if(markers[1].getVisible()){
				for(var i = 0; i < markers.length; i++){
					markers[i].setVisible(false);	
				}
				console.log('Markers Off');
				document.getElementById('toggleMarkers').style.backgroundColor = "#bdc3c7";
				
			}else{
				
				for(var i = 0; i < markers.length; i++){
					markers[i].setVisible(true);		
				}
				console.log('Markers On');
				document.getElementById('toggleMarkers').style.backgroundColor = "#2ecc71";
			}
		});

		$('#infoForm input').on('change', function(){
			var radioVal = $('input[name=infotype]:checked', '#infoForm').val();
			if(radioVal == 'summarized')
			{
				console.log('in summ');
				$.ajax({
					url: 'summarized.html', 
					dataType: 'text',
					success: function(result){
						document.getElementById('schoolInformation').innerHTML = result;
						chartarray = [];
						UIScript.setLineChart();
					}
				});
			}
			else if(radioVal == 'perSchool')
			{
				console.log('in perschool');
				$.ajax({
					url: 'perschool.html', 
					dataType: 'text',
					success: function(result){
						// console.log(result);
						document.getElementById('schoolInformation').innerHTML = result;
						lineChart = null;
						UIScript.setSchoolBoxInformation();
					}
				});
			}
			else
			{
				alert('Sum sin wong in ladiobuttons');
			}
		});

		/*
			Change to check link instead of value from input field
		 */
		$('#submitDates').on('click', function(){
			var fromDate = $('#fromDate').val();
			var toDate = $('#toDate').val();
			
			if($(url).last()[0] != "graph.html")
			{	
				console.log('Setting sliderDate from submitDates');
				UIScript.setSliderDate(fromDate);
				// UIScript.setInformation();
				UIScript.setDateInformation(fromDate);
				googleScript.createLayerByDate(fromDate, toDate);
			}
			else
			{
				var radioVal = $('input[name=infotype]:checked', '#infoForm').val();
				if(radioVal == 'summarized')
				{
					UIScript.setLineChart();
				}
				else if(radioVal = 'perSchool')
				{
					UIScript.setSchoolBoxInformation();
				}
			}
			
		});

		$('#prevDay').on('click', function(){
			
			var tempDate = new Date(UIScript.getFromDate());
			var diff = tempDate.getDay() - 1;
			var startday = objectScript.getFutureDate(-diff, tempDate);

			var theDate = objectScript.getFutureDate(-7, UIScript.getFromDate());
			var daytype = animationScript.getWeekday(theDate);
			if(daytype == 'Lör')
			{
				theDate = objectScript.getFutureDate(-1, theDate);
			}
			else if(daytype == 'Sön')
			{
				theDate = objectScript.getFutureDate(-2, theDate);
			}
			// console.log('theday', theDate);
			UIScript.setFromDate(theDate);
			var radioVal = $('input[name=infotype]:checked', '#infoForm').val();
			if(radioVal == 'summarized')
			{
				UIScript.setLineChart();
			}
			else if(radioVal = 'perSchool')
			{
				UIScript.setSchoolBoxInformation();
			}

		});

		$('#nextDay').on('click', function(){
			var tempDate = new Date(UIScript.getFromDate());
			var diff = tempDate.getDay() - 1;
			var startday = objectScript.getFutureDate(-diff, tempDate);

			var theDate = objectScript.getFutureDate(7, UIScript.getFromDate());
			var daytype = animationScript.getWeekday(theDate);
			if(daytype == 'Lör')
			{
				theDate = objectScript.getFutureDate(2, theDate);
			}
			else if(daytype == 'Sön')
			{
				theDate = objectScript.getFutureDate(1, theDate);
			}
			// console.log('theday', theDate);
			UIScript.setFromDate(theDate);
			var radioVal = $('input[name=infotype]:checked', '#infoForm').val();
			if(radioVal == 'summarized')
			{
				UIScript.setLineChart();
			}
			else if(radioVal = 'perSchool')
			{
				UIScript.setSchoolBoxInformation();
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

		$('#percent').on('click', function() {
			if(!percent) {
				percent = true;
				document.getElementById('percent').style.backgroundColor = "#2ecc71";
			}else{
				percent = false;
				document.getElementById('percent').style.backgroundColor = "#bdc3c7";
			}
			animationScript.createOneDayLayer(UIScript.getSliderDate());      
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

		var red 	= '#FF2000';
		var orange 	= '#FFA000';
		var yellow 	= '#FFF000';
		var semigreen = '#C0FF00';
		var green 	= '#4BF000';


		for(var i = 0; i < polylineslayer.length; i++){
			polylineslayer[i].setMap(null);
		}

		for(var i = 0; i < polyarrayDest.length; i++)
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
				visible: polyVisible,
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
		
		for(var i = 0; i < schoolinfoArray.length; i++)
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
		for(var i = 0; i < markerdata.length; i++)
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

	/**
	 * [getDatesInformation gets nr of sick kids at a choosen Date]
	 * @param  {[type]} schoolid [id of school requested]
	 * @param  {[type]} someDate [requested date]
	 * @return {[type]}          [int, nr of sick children]
	 */
	getDatesInformation: function(schoolid, someDate){
		
		if(someDate === undefined)
		{
			if($(url).last()[0] != "graph.html")
			{
				fromDate = objectScript.dateFixer(UIScript.getSliderDate());
			}
			else
			{
				fromDate = objectScript.dateFixer(UIScript.getFromDate());
			}
		}
		else
		{
			fromDate = objectScript.dateFixer(someDate);
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
				if($(url).last()[0] == "map.html")
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
			tempDate = new Date(theDate);
			tempDate.setDate(tempDate.getDate() + nrOfDays);
			var daytype = animationScript.getWeekday(tempDate);
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

	calcSickKids: function(fromDate, toDate){
		console.log('theDates: ', fromDate, toDate);
		// theDate = objectScript.dateFixer(theDate);
		// console.log('theDate: ', theDate);
		var sickSum = 0;
		var datalist = [];
		var futureTemp = fromDate;

		fromDate = objectScript.dateFixer(fromDate);
		toDate = objectScript.dateFixer(toDate);
		var tempDate = fromDate;
		

		console.log('from + to', fromDate, toDate);

		while(tempDate <= toDate)
		{
			$.each( datesArray, function (key, val)
			{
				
				var listDate = objectScript.dateFixer(val['date']);
				var dayDate = objectScript.dateFixer(val['date'], true);
				
				if(animationScript.getWeekday(dayDate) != 'Lör' && animationScript.getWeekday(dayDate) != 'Sön')
				{

					if(listDate >= tempDate && listDate <= tempDate)
					{
						// console.log('daytype: ', animationScript.getWeekday(dayDate));
						sickSum = sickSum + val['weight'];
					}	
				}

				
				
			});
			// console.log('sicksuM: ', sickSum);
			datalist.push(sickSum);
			sickSum = 0;
			// console.log('futuretemp: ', futureTemp);
			futureTemp = objectScript.getFutureDate(1, futureTemp);	

			if(animationScript.getWeekday(futureTemp) == 'Lör')
			{
				futureTemp = objectScript.getFutureDate(2, futureTemp);	
			}

			
			tempDate = objectScript.dateFixer(futureTemp);
			
			// console.log('tempDate new ', tempDate, futureTemp);
		}

		console.log('in b4 return');
		return datalist;

	},

	dateFixer: function(tempDate, hyphen){
		tempDate = new Date(tempDate);

		var year = tempDate.getFullYear();
		var month = tempDate.getMonth()+1;
		var day = tempDate.getDate();

		if(day < 10) {day = '0' + day};
		if(month < 10){month = '0' + month};

		if(typeof hyphen == 'undefined' || hyphen == false)
		{
			tempDate = year + '' + month + '' + day;
		}
		else if(hyphen == true)
		{
			tempDate = year + '-' + month + '-' + day;
		}
		else
		{
			console.log('dateFixer false value, probably hyphen');
			return false;
		}
		
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

		var radioVal = $('input[name=infotype]:checked', '#infoForm').val();
		if(radioVal == 'summarized')
		{
			// console.log('in summ');
			$.ajax({
				url: 'summarized.html', 
				dataType: 'text',
				success: function(result){
					document.getElementById('schoolInformation').innerHTML = result;
					// document.getElementById("toDate").style.visibility= "visible";
					// document.getElementById("toDatep").style.visibility= "visible";
					// chartarray = [];
					UIScript.setLineChart();
				}
			});
		}
		else if(radioVal == 'perSchool')
		{
			// console.log('in perschool');
			$.ajax({
				url: 'perschool.html', 
				dataType: 'text',
				success: function(result){
					document.getElementById('schoolInformation').innerHTML = result;
					// document.getElementById("toDate").style.visibility= "hidden";
					// document.getElementById("toDatep").style.visibility= "hidden";
					UIScript.setSchoolBoxInformation();
				}
			});
		}
		else
		{
			alert('Sum sin wong in ladiobuttons');
		}
		
	},

	setSchoolInformation: function(schoolid){

		var totkids 	= objectScript.getSchoolInformation('totalkids', schoolid, 'schoolid');
		var schoolname 	= objectScript.getSchoolInformation('schoolname', schoolid, 'schoolid');
		var schoolloc 	= objectScript.getSchoolInformation('location', schoolid, 'schoolid');
		var sickkids 	= objectScript.getDatesInformation(schoolid);

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
		// console.log('UIScript.setInformation calling getFutureDate');
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
	 */
	setSchoolBoxInformation: function(){
		// objectScript.printObjects();

		for(var i = 1; i <= 27; i++){ //27 ist för 3 annars
			// console.log(' in loop: ', i);

			var totkids = objectScript.getSchoolInformation('totalkids', i, 'schoolid');
			var schoolname = objectScript.getSchoolInformation('schoolname', i, 'schoolid');
			// var schoolloc = objectScript.getSchoolInformation('location', i, 'schoolid');
			var sickkids = objectScript.getDatesInformation(i);
			var sickpercent = Math.round((sickkids / totkids) * 10000) / 100;

			$('.schoolBox:nth-child('+i+') .schoolheader').html(''+schoolname);
			$('.schoolBox:nth-child('+i+') .schoolkids span').html(''+totkids + ' st');
			$('.schoolBox:nth-child('+i+') .sickkids span').html(''+sickkids + ' st');
			$('.schoolBox:nth-child('+i+') .sickkids2 span').html(''+sickpercent + ' %');
			
			UIScript.setSchoolBoxChart(i);

			var dayType = animationScript.getWeekday(UIScript.getFromDate());

		}
		
	},

	// create array as variable name and index it with schoolid
	setSchoolBoxChart: function(schoolid){
		
		// console.log('in setSchoolBoxChart with: ', schoolid);

		var list = [];
		var datalist = [];
		var datalistlastweek = [];
		var tempDate = new Date(UIScript.getFromDate());
		var diff = tempDate.getDay() - 1;
		var startday = objectScript.getFutureDate(-diff, tempDate);
		var lastweek = objectScript.getFutureDate(-7, startday);
		// console.log('last week', startday, lastweek);

		for(var i = 0; i < 5; i++)
		{
			var sickPeeps = objectScript.getDatesInformation(schoolid, startday);
			datalist.push(sickPeeps);

			var sickPeepsLastweek = objectScript.getDatesInformation(schoolid, lastweek);
			datalistlastweek.push(sickPeepsLastweek);

			// console.log('sick peeps: ', sickPeeps, startday, i);
			startday = objectScript.getFutureDate(1, startday);
			lastweek = objectScript.getFutureDate(1, lastweek);
		}

		dict = {fillColor: "#3498db", data : datalist};
		dict2 = {fillColor: "#2ecc71", data : datalistlastweek};
		list.push(dict2);
		list.push(dict);
		

		console.log('dict: ', dict);

		var maxval = Math.max.apply(Math, datalist) + 1;
		var stepWidth = Math.round((maxval/4));
		var data = {
			labels : ['Mån', 'Tis', 'Ons', 'Tors', 'Fre'],
			datasets : list, 
		}

		var options = {
			//Boolean - If we want to override with a hard coded scale
			scaleOverride: true,
			//** Required if scaleOverride is true **
			//Number - The number of steps in a hard coded scale
			scaleSteps: 5,
			//Number - The value jump in the hard coded scale
			scaleStepWidth: stepWidth,
			//Number - The scale starting value
			scaleStartValue: 0,
			
			scaleShowGridLines: false,

		}

		// console.log('options: ', maxval, options);

		if(chartarray[schoolid] == null)
		{
			// console.log('Creating new Chart');
			var ctx = document.getElementById('weekChart' + schoolid).getContext("2d");
			ctx.canvas.width = 270;
			ctx.canvas.height = 160;
			var myChart = new Chart(ctx);
			chartarray[schoolid] = myChart;
			chartarray[schoolid].Bar(data, options);	
		}
		else
		{
			// console.log('Using old Chart', chartarray[schoolid]);
			chartarray[schoolid].Bar(data, options);	
		}

		return true;
		
	},

	setLineChart: function(){

		var fromDate = objectScript.dateFixer(UIScript.getFromDate(), true);
		var toDate = objectScript.dateFixer(objectScript.getFutureDate(30, fromDate), true);
		// var toDate = objectScript.dateFixer(UIScript.getToDate(), true);
		var labelarray = [];
		var datalist = objectScript.calcSickKids(fromDate, toDate);
		
		console.log('datalist return: ', datalist);
		
		for(var i = 1; i <= datalist.length; i++){
			labelarray.push(i);
		}

		var data = {
			labels : labelarray,
			datasets : [
				{
					fillColor : "rgba(52, 152, 219,1.0)",
					strokeColor : "rgba(41, 128, 185,1.0)",
					lineColor : "rgba(41, 128, 185,1.0)",
					pointStrokeColor : "#fff",
					data : datalist,
				}
			],
		}

		var options = {
			scaleFontSize : 8,
			scaleFontStyle : 'medium',
			scaleShowGridLines : true,
			pointDotRadius : 2,
			scaleLineWidth: 1,
		}
		console.log('linechart = ', lineChart);
		if(lineChart == null)
		{
			var ctx = document.getElementById('sickLines').getContext("2d");	
			ctx.canvas.width = 800;
			ctx.canvas.height = 400;
			lineChart = new Chart(ctx);
			lineChart.Line(data, options);
			console.log('creating new linechart');
		}
		else
		{

			lineChart.Line(data, options);
			console.log('using old linechart', lineChart);
		}
		
	},
	
	getSliderDate: function(){

		nrOfDays 	= Number($('#dateSlider').val());
		// console.log('UIScript.getSliderDate calling getFutureDate');
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

	getToDate: function(){
		return $('#toDate').val();
	},

	setFromDate: function(theDate){
		theDate = objectScript.dateFixer(theDate, true);
		$('#fromDate').val(theDate);
	},

	setToDate: function(theDate){
		theDate = objectScript.dateFixer(theDate, true);
		$('#toDate').val(theDate);
	},

	setDateInformation: function(choosenDate){
		var dayType = animationScript.getWeekday(choosenDate);
		choosenDate = objectScript.dateFixer(new Date(choosenDate), true);
		if(document.getElementById('sliderValue') != null)
		{
			document.getElementById('sliderValue').innerHTML = dayType + ', ' + choosenDate;	
		}
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
		
		choosenDate = objectScript.dateFixer(new Date(choosenDate), true);
			
		UIScript.setDateInformation(choosenDate);

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
			console.log('startAnimation calling getFutureDate');
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
		
		if($(url).last()[0] != "graph.html"){
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

				date = objectScript.dateFixer(date, true);
				tot.weight 		= Number(val['NUMBER']);
				tot.schoolid	= Number(val['SCHOOLID']);
				tot.date		= date;
				datesArray.push(tot);
			});

			// console.log('calling UIScript.calculateDays');
			UIScript.calculateDays();
			if($(url).last()[0] != "graph.html"){
				var startDate = UIScript.getSliderDate();
			}

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
		console.log($(url).last());
		if($(url).last()[0] == "" || $(url).last()[0] == "map.html")
		{
			console.log('startting google app');
			// var startDate = UIScript.getSliderDate();
			var startDate = '2013-06-20';
			UIScript.setSliderDate(startDate);
			var schoolid = 1;
			UIScript.setSchoolId(schoolid);
			UIScript.setInformation();
		}

		else if($(url).last()[0] == "graph.html"){
			UIScript.init();
		}
		else
		{
			console.log('Unknown page');
			alert('Unknow page @startUpStuff');
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

	//fires up the buttons n stuff
	googleScript.init();

	//Starts first reading of json-files
	google.maps.event.addDomListener(window, 'load', jsonScript.getSchoolinfoJson);

	setTimeout(function(){
		// document.getElementById('information').innerHTML = 'Sidan har laddats';
	}, 1500);
	
	
})();
