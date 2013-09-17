/* BEGIN GMAPS
 *
 *
 */

gmapsMarkers = [];

locationsMarkers = [];


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
//    console.log(new_marker);
    gmapsMarkers.push(new_marker);
};

placeLocationMarker = function(latLng,title,theId){
     if(typeof latLng == 'object' && typeof title != 'undefined' && theId != 'undefined'){
        lMarkerExists = false;
        locationsMarkers.filter(function(arr){
            if(arr.instaId == theId){
                lMarkerExists = true;
                return;
            }
        });
        if(!lMarkerExists){
            var new_marker = new google.maps.Marker({
                instaId : theId,
                position: latLng,
                map: map,
                'title': title }
                );
            
            locationsMarkers.push(new_marker);
        }else{
            console.log('avoiding duplicate marker');
        }
    }
// just use default markers these are for when people click on an image and want nearby things...
}

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
