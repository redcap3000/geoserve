/*
 *
 * Template Events
 *
 */

// Deals with navigation showing/hiding elements; going to create screen/edit screen, and geolocation button.

Template.loggedInMenu.events({
    'click .groupAdd' : function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#the_markers').hide();
        $('div#marker_edit').hide();
        $('div#groups').show();
    },
    'click .showMarkers' : function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#the_markers').show();
        if(Session.get('selected_marker'))
            $('div#marker_edit').show();
 
    },
    'click .markerEditShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#marker_edit').show();
    },
    'click .markerAddShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#marker_add').show();
        $('div#the_markers').hide();
        $('div#marker_edit').hide();
    },
    'click .settingsShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#groups').hide();
        $('div#user_settings').show();
    },
    'click .geolocate': function(evt,tmpl){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }else{
            alert('Could not geolocate');
        }
    }
});

// adds a new 'group' and stores userid as record 'owner'



// Handles edit /deleting markers
// TODO Remove all associated services when removing a marker, create server side methods for secure deletion etc.



Template.services_offered.services = function(evt,tmpl){
    if(typeof services_sub != 'undefined')
        if(services_sub.ready()){
            console.log('services offered ready');
            var q = services.find({},{});
            q = q.fetch();
            return q;
        }else
            console.log('services sub not ready');
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
        var q = markers.findOne({_id: curMarker});
       return q;
    }
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


