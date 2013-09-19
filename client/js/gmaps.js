/* BEGIN GMAPS
 *
 *
 */

gmapsMarkers = [];

infoWindows = [];

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

placeNavMarker = function(latLng,data) {
    var image = data.image_low,likes = data.likes ,
        tags = (data.tags.length > 0  ? '\n' + data.tags.join(', ')  :false),

    
        title = data.caption;
    
    var new_marker = new google.maps.Marker({
        position: latLng,
        map: map,
        'title': title,
        icon: { url:image ,scaledSize: new google.maps.Size(50,50)} }
        );
    var infoWindow = new google.maps.InfoWindow({
        content: '<div class="infoWindow"><img src="'+image+'"/><p><b>'+data.username+'</b><strong>' + likes + '</strong>' + (title ? '<b class="instaTitle">' + title + '</b>' : '') + (tags ? '<em>' + tags + '</em>' : '' ) + '</p></div>'
    });
    
    infoWindows.push(infoWindow);
    
    google.maps.event.addListener(new_marker, 'click', function() {
        if(infoWindows.length > 0)
            infoWindows.filter(function(arr){
               arr.close(map,new_marker);
            });
        infoWindow.open(map,new_marker);
    });
    
    if(typeof map == 'undefined')
        console.log('no map for marker...');

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
            // do back end call to search for location markers?
            /*
            Meteor.call('locations_media_recent',Session.get('access_token'),theId,function(error,result){
                if(typeof error == 'undefined'){
                    console.log(result);
                }
            });
            */
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
