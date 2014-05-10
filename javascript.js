var map, layer;

function initialize() {
  var lycksele = new google.maps.LatLng(64.592418,18.688387);

  map = new google.maps.Map(document.getElementById('maps'), {
    center: lycksele,
    zoom: 13
  });

  // layer = new google.maps.FusionTablesLayer({
  //   query: {
  //     select: LOCATION,
  //     from: '1OqKOavsRoQSHBxt0v40jf9iBJ0WTpESP5pQj3Ukb'
  //   }
  // });

  // layer.setMap(map);

}

// google.maps.event.addDomListener(window, 'load', initialize);
$(document).on('pageload', function() {
  initialize();
});