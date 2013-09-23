/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 */

Template.nav.instaPostReady =function(){
    return !Session.equals("user_self",false);
};
Template.nav.hasInstaCode =  function(){
    return (Session.get("access_token")?true:false);
};

Template.loggedInMenu.hasInstaCode = function(){
    return (Session.get("access_token")?true:false);
};


Template.nav.events = {
    'click #mFilterLikes': function(evt,tmpl){
        Session.set('markerSort', {likes:-1});
    },
    'click #mFilterLastChange': function(evt,tmpl){
        Session.set('markerSort', {lastHit:-1});
    },
    'click #mFilterDate': function(evt,tmpl){
        Session.set('markerSort', {id:-1});
    },
    'click #mFilterDefault': function(evt,tmpl){
        Session.set('markerSort', undefined);
    }
    
};

/*
 *  these are the 'main' markers ... do some stuff with session and sorting next ?
 *
 */

Template.loggedInMenu.instaMarkers = function(){
    // default filter ...
    var filter = {};
    if(!Session.equals('markerSort',undefined)){
        // does this work?
        filter.sort = Session.get('markerSort');
    }else{
        filter.sort = {id:-1,lastHit:1,likes:-1};
        
    }
    
    filter.locations = 0;
    return insta_grams.find({},filter);
}

Template.instaMarker.events = {
    "click .focus_marker" : function(){
             closeInfoWindows();
        setMapCenter([this.lat,this.lon]);
    }
}
/*
 *  Place nav marker and setup google marker with a basic thing of its text .. only run this once? Need to figure
 *  out how to update this with the latest data .... could do a check on 'rendered' to see if it has changed or not from
 *  previous values ?
 */
Template.instaMarker.created = function(){
    placeNavMarker(new google.maps.LatLng(this.data.lat,this.data.lon),this.data );

};
Template.public_view.rendered = function(){
    map = undefined;
    gmapsMarkers = [];
    infoWindows = [];
    locationsMarkers = [];
};

Template.public_view.destroyed = function(){
    createMap();
};

Template.loggedInMenu.rendered = function(){
    if(typeof map != 'undefined' && typeof gmapsMarkers[0] != 'undefined'){
//        console.log(gmapsMarkers[0].getPosition());
       var get_pos = gmapsMarkers[0].getPosition();
       if(get_pos)
        setMapCenter(get_pos);
    }
}


Template.instaMarker.preserve = ['img','.instaUser'];