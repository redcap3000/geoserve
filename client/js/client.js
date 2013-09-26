/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 */

/* Template click events.. for sorting manipulations */

Template.nav.events = {
    "click #mFilterLikes": function(evt,tmpl){
        Session.set("markerSort", {likes:-1});
    },
    "click #mFilterLastChange": function(evt,tmpl){
        Session.set("markerSort", {lastHit:-1});
    },
    "click #mFilterDate": function(evt,tmpl){
        Session.set("markerSort", {id:-1});
    },
    "click #mFilterDefault": function(evt,tmpl){
        Session.set("markerSort", undefined);
    }
    
};

/* Handlebar template functions */

Template.nav.instaPostReady =function(){
    return !Session.equals("user_self",false);
};
Template.nav.hasInstaCode =  function(){
    return (Session.get("access_token")?true:false);
};

Template.nav.getStatus = function(){
    return Session.get("status");
};


Template.loggedInMenu.instaMarkers = function(){
    // default filter ...
    var filter = {};
    if(!Session.equals("markerSort",undefined)){
        // does this work?
        filter.sort = Session.get("markerSort");
    }else{
        filter.sort = {id:-1,lastHit:1,likes:-1};
        
    }
    filter.locations = 0;
    return insta_grams.find({},filter);
}

Template.loggedInMenu.hasInstaCode = function(){
    return (Session.get("access_token")?true:false);
};


/* set center of map to latest instaMarker */
Template.map.rendered = function(){

    if(typeof map != "undefined" && typeof gmapsMarkers[0] != "undefined" && typeof map_set != true){
                   var get_pos = gmapsMarkers[0].getPosition();
        console.log('rendered');
                   if(get_pos){
                        alert('setting center');
                       setMapCenter(get_pos);
                       // to hopefully avoid resetting the map center every time the geo feed is updated?
                       map_set = true;
                   }
                }

    

}


/*
 *  Instagram Users' friends feed (instaMarkers)
 *
 */

Template.instaMarker = {
    events : {
        /*
         * Click event that centers map to marker (for instaMarkers), also closes any open infowindows.
         *
         */
        "click .focus_marker" : function(evt,tmpl){
            closeInfoWindows();
            setMapCenter([this.lat,this.lon]);
        }
    },
    rendered :
        function(){
            placeNavMarker(new google.maps.LatLng(this.data.lat,this.data.lon),this.data );
            // find and destroy any related markers in locationsMarkers ?
            this.gone = undefined;
        }
    ,
    destroyed:
        function(){
            if(typeof this.gone === "undefined"){
                // giving it a timeout set to the value of the timeout that does the geo feed refresh..
                updateStatus("Please wait while feed is refreshed.",60 * 60 * 45);
                // also force a refresh of the geo feed ?
                // keep the location markers ? do we need to refresh locations frequently?
                gmapsMarkers.filter(function(arr){
                    return arr.setMap(null);
                });
                this.gone = true;
                updateGeofeed();
                
            }
            // if one gets destroyed then avoid the others from following suit ?
        },
    // dom elements to avoid rerendering if things change... 
    preserve : ["img",".instaUser",".instaTitle","p"]
};

/* Clear out map/markers if public view renders ...  might need some work */
Template.public_view = {
    rendered :
        function(){
            map = undefined;
            gmapsMarkers = [];
            infoWindows = [];
            locationsMarkers = [];
        },
    destroyed :
        function(){
            if(typeof map == "undefined")
                createMap();
        }
};
