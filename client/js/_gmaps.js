/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 
 BEGIN GMAPS
 *
 *
 */

Meteor.startup(function(){

gmapsMarkers = [],infoWindows = [],locationsMarkers = [],
closeInfoWindows = function(){if(infoWindows.length > 0)
            return infoWindows.filter(function(arr){
               arr.close();
               return false;
            });},
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
},
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
                Session.set('status','Looking up nearby markers.');
                Meteor.call('locations_search',access_token,data.lat,data.lon,data._id,
                            function(error,result){
                                if(typeof error =='undefined' && typeof result != 'undefined'){
                                    Session.set('status','Downloading marker feeds.');
                                    var lookups = [],dontPush = false;
                                    result.filter(
                                        function(arr){
                                            var intId = parseInt(arr);
                                            /* 
                                             * doing a check on local global variable locations markers to avoid sending
                                             * id's that are absolutely known to exist on screen
                                             * this also occurs later.. probably try to turn this into a function or mayyybe use underscore?
                                             */
                                            if(locationsMarkers.length > 0){
                                                locationsMarkers.filter(function(arr2,index){
                                                    if(arr2.instaId == intId){
                                                        dontPush = true;
                                                        return false;
                                                    }
                                                    if(index == (result.length - 1) && dontPush !== true){
                                                        // push the id for the lookup!
                                                        lookups.push(intId);
                                                    }
                                                });
                                            }else{
                                                lookups.push(intId);
                                            }
                                        }
                                    );
                                    Session.set('locationsFilter',lookups);
                                    return true;
                                    // do default call for user feed ... to populate map with markers...
                                    // set the interval to continually fetch new results ??
                                }else{
                                    new_marker.wasClicked = false;
                                    Session.set('status','Insta api returned an error on locations search.')
                                    // maybe attempt to make call again?
                                }
                            }
                );
               
            }
            new_marker.wasClicked = true;
        }else if(typeof new_marker.wasClicked == 'undefined' && typeof data.locations != 'undefined'){
            // first modify add the sub for the locations_posts to avoid getting everything ?
            var toPush = [];
            data.locations.filter(
                function(theId,index){
                    var dontPush = false;
                    locationsMarkers.filter(function(arr,index2){
                        if(dontPush === false && arr.id == theId){
                            dontPush = true;
                            return false;
                        }
                    });
                    if(dontPush == false){
                        toPush.push(theId);
                    }
                }
            );
            if(toPush.length > 0)
                Session.set('locationsFilter',toPush);
            // do we need to run this find?
            new_marker.wasClicked = true;
        }
        infoWindow.open(map,new_marker);
    });

    gmapsMarkers.push(new_marker);
},
placeLocationMarker = function(latLng,title,theId,theData){
     if(typeof latLng == 'object' && typeof title != 'undefined' && theId != 'undefined'){
        lMarkerExists = false;
        // can i make this locationMarkers.filter faster??
        locationsMarkers.filter(function(arr){
            if(arr.instaId == theId){
                lMarkerExists = true;
                return;
            }
        });
        if(!lMarkerExists && typeof theData != 'undefined'){
            var theInfoWindow = '<ul class="locInfoContainer"><li class="title"><h1>' + title + '</h1></li>';
            
                if(typeof theData == 'object'){
                theData.filter(function(arr){
                    theInfoWindow = theInfoWindow + '<li class="locInfoWindow"><a href="'+arr.link+'" target="_new"><img alt="image" src="'+arr.image+'"/></a><div id="'+arr.id+'" class="instaLocPost"><h5>'+arr.user+ ' ' + arr.likes+ '</h5>' + (arr.caption != null && typeof arr.caption != 'undefined' && arr.caption != '' ? "<p>" + arr.caption + "</p>" : "") + '</div></li>';
                    
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
            // do nothing catch without having to write a bunch of extra logic
            ;
        }else{
        // look up data ???
            var locationGrams = insta_locations_grams.findOne({id : theId},{data:1});
            if(locationGrams && typeof locationGrams.data != 'undefined' && locationGrams.data.length > 0)
                placeLocationMarker(latLng,title,theId,locationGrams.data)
            else
                console.log('problem with insta_locations_grams query or length is zero');
        }
    }
},
// takes either array with two integers (x,y) or a google maps LatLng object.
setMapCenter = function(q){
    if(typeof map == 'undefined' && Meteor.userId()){
        createMap();
    }
    map.setCenter((typeof q == 'object' && q.length == 2? new google.maps.LatLng(q[0],q[1]) : (typeof q == 'object' ? q: new google.maps.LatLng(0,0))));
}
 });
/*
 *
 * END GMAPS
 *
 */
