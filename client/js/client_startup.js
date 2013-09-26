/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 */
         map_set = false;

Meteor.startup(function(){
    // continually refreshes client feed... should probably unset this interval on destroy...
    // setting to values to destroy and possibly recreate them .. specifically if the insta_grams db gets 'refreshed'
    
    // for hiding the status window performance implication?   
    Session.set('map_set',false);
    updateGeofeed = function(timeout){
        console.log('update geofeed');
        if(typeof timeout == 'undefined'){
        // 5 mintutes right?
            timeout = 60*60*(60* 5);
        }
        if(typeof geofeedInterval != 'undefined'){
            Meteor.clearInterval(geofeedInterval);
            geofeedInterval = undefined;
        }
        
        Session.set('user_self',false);

    // set the session to force the feed to update NOW!
        var geofeedInterval = Meteor.setInterval(function(){Session.set('user_self',false);},timeout);

        
        
        
    }
    
    updateStatus = function(status,newTimeout){
        if(typeof newTimeout == 'undefined'){
            newTimeout = 4800;
        }
        if(typeof statusInterval != 'undefined'){
            Meteor.clearInterval(statusInterval);
            statusInterval = undefined;
        
//            Session.set('status',status + '\n' +         Session.get('status'));
        }
        statusInterval = Meteor.setInterval(function(){Session.set('status','');},newTimeout);
    };
    
    Deps.autorun(function(){
        if(typeof geofeedInterval == 'undefined' && !Session.get('user_self')){
            
    
            //

    
        }
    
        if(typeof map != "undefined" && typeof gmapsMarkers[0] != "undefined" && Session.equals('map_set',false)){
                   var get_pos = gmapsMarkers[0].getPosition();
                   if(get_pos){
                       console.log('setting center');
                       setMapCenter(get_pos);
                       // to hopefully avoid resetting the map center every time the geo feed is updated?
                       Session.set('map_set',true);
                   }
                }
    
       var access_token = window.location.href.split("#");
        if(access_token.length > 1 && Meteor.userId()){
            access_token = access_token[1].split("=")[1];
            Session.set('access_token', access_token);
            var doesHaveAccess = Session.get('access_token');
        }else if(access_token.length >1){
            // get rid of token if logged out
            window.location.replace('/');
        }
        if(Meteor.userId()){
//            if(typeof map == 'undefined'){
//                createMap();
                
//                updateGeofeed();
//            }
            var locationsFilter = Session.get('locationsFilter');
            // also use this reactive source to determine interface elements in templates...
            updateStatus('Getting locations');
            instaGramPosts = Meteor.subscribe("userInstaGrams", Meteor.userId());
            instaGramLocationsPosts = Meteor.subscribe("locationsPosts",locationsFilter);
        }
        var access_token = Session.get('access_token'), userId = Meteor.userId() ;
        if(userId && access_token ){
            // for only storing the location feed data based on what the user clicks.. maybe store to local minimongo later
            
            if(!Session.get('user_self')){
            // set this to true so deps doesn't re run while its waiting for the response...
             Session.set('user_self',true);
             Meteor.call('user_self',access_token,Meteor.userId(),
                function(error,result){
                    if(typeof error =='undefined'){
                        updateStatus("Geofeed obtained");
                        Session.set('user_self',result);
                         if(Meteor.userId()){
                        // should set interval elsewhere.... probably...
                            Session.set('markerSort',undefined);
                        }
                    }else{
                        console.log(error);
                }});
            }else if(locationsFilter){
                instaGramLocations = Meteor.subscribe("allLocations",locationsFilter);
                updateStatus('Building location markers.');
                if(locationsFilter.length > 0 && instaGramLocations.ready()){
                    insta_locations.find({id : {"$in" : locationsFilter}}).fetch().filter(function(arr,i){
                        if(i == 0){
                            updateStatus("Placing location markers.");
                        }
                        // have to cascade this for now to properly generate info window on marker creation....
                        // look up associated post object and pass as data... use something else for now...
                        var location_data = insta_locations_grams.findOne({id: parseInt(arr.id)});
                        if(location_data && typeof location_data.data != 'undefined' && location_data.data.length > 0)
                            placeLocationMarker(new google.maps.LatLng(arr.latitude,arr.longitude),arr.name,parseInt(arr.id),location_data.data);
                    });
                }
            }
        }else if(userId){
            if(!access_token){
                updateStatus("Authenticating");
                Meteor.call('authenticate',
                    function(error,result){
                        if(typeof error != 'undefined'){
                            updateStatus("Problem with authentication call.");
                            console.log('error');
                        }else
                            // redirect here...
                            // handle differently if mobile? Cookie gets lost after instagram credentials are entered
                            updateStatus("Redirecting to instagram");

                            window.open(result, '_self', 'toolbar=0,location=0,menubar=0');
                            //window.location.replace(result);
                        });
            }
        }
    });
});