// for hiding the loginto instagram button ..


Template.nav.instaPostReady =function(){
    return !Session.equals("user_self",false);
};
Template.nav.hasInstaCode =  function(){
    return (Session.get("access_token")?true:false);
};


Template.nav.events = {
    'click .instaLogin' : function () {
            var doesHaveAccess = Session.get('access_token');
            if(!doesHaveAccess){
                Meteor.call('authenticate',
                    function(error,result){
                        if(typeof error != 'undefined'){
                            console.log('error');
                        }else
                            // redirect here...
                           window.location.replace(result);
                        });
            }else if(doesHaveAccess){
                Meteor.call('request_auth_code',doesHaveAccess,Meteor.settings.redirect_uri,
                    function(error,result){
                        if(typeof error =='undefined'){
                            Session.set('access_token',result.access_token);
                            Session.set('user_info',result.user);
                            Session.set('user_self',false);
                            // do default call for user feed ... to populate map with markers...
                            // set the interval to continually fetch new results ??
                            
                        }else
                            console.log(error);
                    }
                );
            }
        },
    'click .user_self' : function(){
        var access_token = Session.get('access_token');
         if(access_token && Session.get('user_self')){
             Session.set('user_self',false);
        }
    },
    'click #mFilterLikes': function(evt,tmpl){
        Session.set('markerSort', {likes:-1});
    },
    'click #mFilterLastChange': function(evt,tmpl){
        console.log('last hit');
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
    return insta_grams.find({},filter);
}

Template.instaMarker.events = {
    "click .focus_marker" : function(){
        setMapCenter([this.lat,this.lon]);
    }
}
/*
 *  Place nav marker and setup google marker with a basic thing of its text .. only run this once? Need to figure
 *  out how to update this with the latest data .... could do a check on 'rendered' to see if it has changed or not from
 *  previous values ?
 */
Template.instaMarker.created = function(){
       placeNavMarker(new google.maps.LatLng(this.data.lat,this.data.lon),this.data.image_thumb,this.data.likes + ' likes' + (this.data.tags.length > 0  ? '\n' + this.data.tags.join(', ')  :'') );
};

Template.loggedInMenu.destroyed = function(){
    map = undefined;
    gmapsMarkers = [];
};

Template.instaMarker.destroyed = function(){
        if(gmapsMarkers.length > 0){
            var pTitle = this.data.likes + ' likes' + (this.data.tags.length > 0  ? '\n' + this.data.tags.join(', ')  :''),killIndex = false;
            gmapsMarkers.filter(function(arr,i){
                if(typeof arr != 'undefined' && arr != undefined)
                    if(arr.title == pTitle){
                        arr.setMap(null);
                        killIndex = i;
                        }
            
            });
            if(killIndex !== false)
                gmapsMarkers[killIndex] = undefined;
        }
 
};
Template.instaMarker.rendered = function(){
//    console.log(firstMarker);
        if(typeof map != 'undefined' && typeof firstMarker != 'undefined'){
            setMapCenter(firstMarker);
            firstMarker = undefined;
        }else{
            firstMarker = [this.data.lat,this.data.lon];
        }

};

Template.instaMarker.preserve = ['img','.instaUser'];