/*
 *
 * Template Events
 *
 */

// Deals with navigation showing/hiding elements; going to create screen/edit screen, and geolocation button.

// for hiding the loginto instagram button ..
Template.nav.hasInstaCode = function(){
    return (Session.get('access_token') ? true : false);
}
Template.nav.events = {'click .instaLogin' : function () {
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
                                    }else
                                        console.log(error);
                                }
                            );
                        }
        }
    }


Template.loggedInMenu.events({
    'click a.groupAdd' : function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#the_markers').hide();
        $('div#marker_edit').hide();
        $('div#groups').show();
    },
    'click a.showMarkers' : function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#the_markers').show();
        if(Session.get('selected_marker'))
            $('div#marker_edit').show();
 
    },
    'click a.markerEditShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#marker_edit').show();
    },
    'click a.markerAddShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#marker_add').show();
        $('div#the_markers').hide();
        $('div#marker_edit').hide();
    },
    'click a.settingsShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#user_settings').show();
    },
    'click a.geolocate': function(evt,tmpl){
        if(navigator.geolocation){
//            alert('geolcating..');
//            console.log(navigator.geolocation);
            navigator.geolocation.getCurrentPosition(function(success){Session.set('geoResult',success);}, function(error){Session.set('geoError',error)});
        }else{
            alert('Could not geolocate');
        }
    },
      
});

// adds a new 'group' and stores userid as record 'owner'



// Handles edit /deleting markers
// TODO Remove all associated services when removing a marker, create server side methods for secure deletion etc.



Template.services_offered.services = function(evt,tmpl){
    return services.find({},{});
};

/*
 *
 *
 *   Logged in menu template functions  to generate menu for markers, and also to handle the selected marker
 *   session
 *
 */

Template.loggedInMenu.marker_index = function(evt,tmpl){
// get User. something to filter this find
    return markers.find({},{});
};


Template.loggedInMenu.selectedMarker = function(evt,tmpl){
    var curMarker = Session.get('selected_marker');
    if(curMarker){
        return markers.findOne({_id: curMarker});
    }
    return [];
}

/* 
 *
 *
 *  Template rendered functions
 *
 */
Template.loggedInMenu.rendered = function(evt,tmpl){
    $('div#marker_add').hide();
    $('div#user_settings').hide();
    if(!Session.get('selected_group'))
        $('div#groups').hide();
    if(!Session.get('selected_marker'))
        $('div#marker_edit').hide();

};


