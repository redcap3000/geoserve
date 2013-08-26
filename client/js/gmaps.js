/* BEGIN GMAPS
 *
 *
 */

lookForMarkers = function(theBox){
    c = markers.find({}, {fields: {_id: 1}}).fetch();
    if(c.length > 0)
        for(var i=0;i<c.length;i++){
            var arr= c[i];
            if(typeof arr['loc'] != 'undefined'){
                var co = new google.maps.LatLng(arr['loc'][0], arr['loc'][1]), marker_type = '';
                if(arr['type'] == 'Shelter' || arr['type'] == 'Hospital' || arr['type'] == 'Other' || arr['type'] == 'Pharmacy')
                // default
                    marker_type = arr['type'];
                else
                    marker_type = undefined;
                placeNavMarker(co,marker_type,function(){alert(arr['name'] + ' ' + arr['type']);});
            }
        }
};

createMap = function(latLng) {
    var mapOptions = {
        disableDoubleClick: true,
        streetViewControl: false,
        scrollwheel: false,
        zoom: 15,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
};

placeNavMarker = function(latLng,image,title,clickCallBack) {
        var image = image;
//        var image = "http://gmaps-samples.googlecode.com/svn/trunk/markers/blue/blank.png";
    // this map is not always there>>>?
    if(typeof title == 'undefined')
        title =null;
    
    
    var new_marker = new google.maps.Marker({
        position: latLng,
        map: map,
        'title': title,
        icon: { url:image ,scaledSize: new google.maps.Size(50,50)} }
        );
    
    
    if(typeof clickCallBack == 'function')
        google.maps.event.addListener(new_marker,"click",clickCallBack);
};

setMapCenter = function(q){
    map.setCenter(new google.maps.LatLng(q[0],q[1]));
}
   
// GMAPS Geocoder success/error functions

successFunction = function(success) {
          var navLatLng = new google.maps.LatLng(success.coords.latitude, success.coords.longitude);
          // annoying...
          //createMap(navLatLng);
          // send it true option to use different marker
     map.setCenter( new google.maps.LatLng([success.coords.latitude, success.coords.longitude]));
          placeNavMarker(navLatLng,true);

          lookForMarkers([navLatLng.jb,navLatLng.kb]);
        },

errorFunction = function(success) {
    // set this to a default location? define it somewhere...?
    var navLatLng = new google.maps.LatLng(37.808631, -122.474470);
    //createMap(latlng);
    placeNavMarker(navLatLng);
//  addAutocomplete();
    };

/*
 *
 * END GMAPS
 *
 */
