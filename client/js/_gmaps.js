/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 
 BEGIN GMAPS
 *
 *
 */

Meteor.startup(function(){

gmapsMarkers = [];

infoWindows = [];

locationsMarkers = [];

closeInfoWindows = function(){if(infoWindows.length > 0)
            return infoWindows.filter(function(arr){
               arr.close();
               return false;
            });}

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
        closeInfoWindows();
        // how to issue template event?
 
         if(typeof new_marker.wasClicked == 'undefined' && typeof data.locations == 'undefined') {
            // find stuff near it ..
            var access_token = Session.get('access_token');
            
            if(access_token){
                Meteor.call('locations_search',access_token,data.lat,data.lon,data._id,
                            function(error,result){
                                if(typeof error =='undefined' && typeof result != 'undefined'){
                                    console.log('did a location search...');
                                    // how do we resubscribe???
                                    var lookups = [];
                                    result.filter(function(arr){
                                        lookups.push(arr.id);
                                    }
                                    );
                            
                                 insta_locations.find({id : {"$in" : lookups}}).fetch().filter(function(arr){
                                    // have to cascade this for now to properly generate info window on marker creation....
                                    // look up associated post object and pass as data... use something else for now...
                                    var location_data = insta_locations_grams.findOne({id: parseInt(arr.id)});
                                    // so perhaps we ne
                                    if(location_data && typeof location_data.data != 'undefined' && location_data.data.length > 0)
                                        placeLocationMarker(new google.maps.LatLng(arr.latitude,arr.longitude),arr.name,parseInt(arr.id),location_data.data);
                                    //else
                                    //    console.log('problem with lookup in insta_locations_grams for ' + arr.id);
                                
                                });

                            
                            
                                    Session.set('locationsFilter',lookups);
                                    return true;
                                    // do default call for user feed ... to populate map with markers...
                                    // set the interval to continually fetch new results ??
                                }else{
                                    new_marker.wasClicked = false;
                                    console.log('Please reclick to retry locations search');
                                    // maybe attempt to make call again?
                                }
                            }
                );
               
            }
            new_marker.wasClicked = true;
        }else if(typeof new_marker.wasClicked == 'undefined' && typeof data.locations != 'undefined'){
            console.log('local search..');
            locationsFilter = [];
            // first modify add the sub for the locations_posts to avoid getting everything ?
            
            data.locations.filter(function(arr){
                if(locationsFilter.indexOf(arr) == -1){
                    locationsFilter.push(arr);
                }
            });
            
            console.log(locationsFilter);
            Session.set('locationsFilter',locationsFilter);
            // do we need to run this find?
            new_marker.wasClicked = true;

        }

        infoWindow.open(map,new_marker);
    });
    
    if(typeof map == 'undefined')
        console.log('no map for marker...');

    gmapsMarkers.push(new_marker);
       

};

placeLocationMarker = function(latLng,title,theId,theData){
     if(typeof latLng == 'object' && typeof title != 'undefined' && theId != 'undefined'){
        lMarkerExists = false;
        locationsMarkers.filter(function(arr){
            if(arr.instaId == theId){
                lMarkerExists = true;
                return;
            }
        });
        // hmm
        if(!lMarkerExists && typeof theData != 'undefined'){
            var theInfoWindow = '<ul class="locInfoContainer"><li class="title"><h1>' + title + '</h1></li>';
            
                if(typeof theData == 'object'){
                theData.filter(function(arr){

                    theInfoWindow = theInfoWindow + '<li class="locInfoWindow"><a href="'+arr.link+'" target="_new"><img alt="image" src="'+arr.images.low_resolution.url+'"/></a><div id="'+arr.id+'" class="instaLocPost"><h5>'+arr.user.username+ ' ' + arr.likes.count+ '</h5>' + (arr.caption != null && typeof arr.caption.text != 'undefined' && arr.caption.text != '' ? "<p>" + arr.caption.text + "</p>" : "") + '</div></li>';
                    
                });
                }else{
                    theInfoWindow = theData;
                }
                var infoWindow2 = new google.maps.InfoWindow({
                    content: theInfoWindow + "</ul>"
                });
            infoWindows.push(infoWindow2);
            
            var new_marker2 = new google.maps.Marker({
                instaId : theId,
                position: latLng,
                map: map,
                'title': title }
                );

            google.maps.event.addListener(new_marker2, 'click', function() {
                closeInfoWindows();
                infoWindow2.setOptions({maxWidth:615});

                infoWindow2.open(map,new_marker2);
            });
            
            locationsMarkers.push(new_marker2);
        }else if(lMarkerExists){
            console.log('avoiding duplicate marker');
        }else{
        // look up data ???
            var locationGrams = insta_locations_grams.findOne({id : theId},{data:1});
            if(locationGrams && typeof locationGrams.data != 'undefined' && locationGrams.data.length > 0)
                placeLocationMarker(latLng,title,theId,locationGrams.data)
            else
                console.log('problem with insta_locations_grams query or length is zero');
        }
    }
}

setMapCenter = function(q){
    map.setCenter((typeof q == 'object' && q.length == 2? new google.maps.LatLng(q[0],q[1]) : (typeof q == 'object' ? q: new google.maps.LatLng(0,0))));
}
 });
/*
 *
 * END GMAPS
 *
 */
