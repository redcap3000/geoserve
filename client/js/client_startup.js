/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */
    
Meteor.startup(function(){
    locationsFilter = [];
    createMap();
    var access_token = window.location.href.split("#");
    if(access_token.length > 1 && !doesHaveAccess){
        access_token = access_token[1].split("=")[1];
        Session.set('access_token', access_token);
        var doesHaveAccess = Session.get('access_token');

    }
    // continually refreshes client feed... should probably unset this interval on destroy...
    Meteor.setInterval(function(){Session.set('user_self',false);},60 * 60 * 45);
               
    if(Meteor.userId()){
            // also use this reactive source to determine interface elements in templates...
            instaGramPosts = Meteor.subscribe("userInstaGrams", Meteor.userId());
            instaGramLocations = Meteor.subscribe("allLocations");
            
    }
    Deps.autorun(function(){
        var access_token = Session.get('access_token'), userId = Meteor.userId() ;
        if(userId && access_token ){
            // for only storing the location feed data based on what the user clicks.. maybe store to local minimongo later
            var locationsFilter = Session.get('locationsFilter');
            if(!Session.get('user_self')){
                // set this to true so deps doesn't re run while its waiting for the response...
             Session.set('user_self',true);
             Meteor.call('user_self',access_token,Meteor.userId(),
                function(error,result){
                    if(typeof error =='undefined'){
                        Session.set('user_self',result);
                         if(Meteor.userId()){
                        // should set interval elsewhere.... probably...
                            Session.set('markerSort',undefined);
                        }
                    }else{
                        console.log(error);
                }});
            }else if(locationsFilter.length > 0){
                instaGramLocationsPosts = Meteor.subscribe("locationsPosts",locationsFilter);
                insta_locations.find({id : {"$in" : locationsFilter}}).fetch().filter(function(arr){
                    // have to cascade this for now to properly generate info window on marker creation....
                    // look up associated post object and pass as data... use something else for now...
                    var location_data = insta_locations_grams.findOne({id: parseInt(arr.id)});
                    // so perhaps we ne
                    if(location_data && typeof location_data.data != 'undefined' && location_data.data.length > 0)
                        placeLocationMarker(new google.maps.LatLng(arr.latitude,arr.longitude),arr.name,parseInt(arr.id),location_data.data);
                    else
                        console.log('problem with lookup in insta_locations_grams for ' + arr.id);
                
                });
            }
        }else if(userId){
            if(!access_token){
                console.log('does not have access running authenticate...');
                Meteor.call('authenticate',
                    function(error,result){
                        if(typeof error != 'undefined'){
                            console.log('error');
                        }else
                            // redirect here...
                            // handle differently if mobile? Cookie gets lost after instagram credentials are entered
                            window.open(result, '_self', 'toolbar=0,location=0,menubar=0');
                            //window.location.replace(result);
                        });
            }
        }
    });
});