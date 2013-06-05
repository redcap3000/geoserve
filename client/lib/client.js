/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */

Meteor.startup(function(){
    createMap();
    marker_sub = Meteor.subscribe("allMarkers");
    Deps.autorun(function(){
        if(marker_sub.ready()){
            groups_sub = Meteor.subscribe("allGroups"),
            marker_types_sub = Meteor.subscribe("allMarkerTypes"),
            services_sub = Meteor.subscribe("allServices");

            if(marker_types_sub.ready() && groups_sub.ready() && services_sub.ready()){
                // this sets the new loc prematurely?
                var curMarker = Session.get('selected_marker');
                if(curMarker){
                    // load marker services and all services - but also need to trigger this when creating a new record...
                   if(typeof marker_services_sub == 'undefined'){
                        marker_services_sub = Meteor.subscribe("allMarkerServices");
                        var q = markers.findOne({_id:curMarker}).loc;
                        setMapCenter(q);
                        lookForMarkers();
                    }else if(marker_services_sub.ready()){
                        console.log('cur marker set inside of autorun');
                        var q = markers.findOne({_id: curMarker});
                        if(q)
                            if(typeof q['loc'] != 'undefined')
                                setMapCenter(q['loc']);
                            else{
                                console.log('problem with mongo loc query');
                                setMapCenter([0,0]);
                            }
                        lookForMarkers();
                    }
                // probably show something that allows us to edit the selected marker?
                }else{
                    var mCheck = markers.find({},{}).fetch();
                    // maybe not 'create the map new each time?
                    if(typeof map === 'undefined' && !mCheck){
                        createMap();
                        setMapCenter([0,0]);
                    }else if (mCheck){
                        var emCheck = mCheck.pop();
                        if(typeof emCheck != 'undefined')
                            emCheck = emCheck['loc'];
                        else{
                            alert('It appears you are running geoserve for the first time!');
                            // ideally show the add marker screen
                            emCheck = [0,0];
                        }
                        setMapCenter(emCheck);
                    }else
                        setMapCenter([0,0]);
                    lookForMarkers();
                }
            }
        }
    });
      
});

/*
 *   END Meteor.startup()
 */

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

Template.add_group.events({
    'click input.add_group': function(evt,tmpl){
        var record ={},elements = tmpl.findAll(".group_visibility"),checked_element = undefined;
        record.owner = Meteor.userId();
        record.name = tmpl.find(".group_title").value;
        record.desc = tmpl.find(".group_desc").value;
        
        // properly determines the checked element for similarlly classed values
        for (var i=0, len=elements.length; i<len; ++i)
            if (elements[i].checked) var checked_element =  elements[i].value;
        
        record.visibility = (typeof checked_element !== 'undefined'? checked_element: 'private');
        
        var record_id = groups.insert(record);
        Session.set('selected_group',record_id);

    }
});


// adds a new marker from title/address + group, geocodes it and stores x,y
// TODO : Interactive screen if multiple addresses are returned in geolookup - more rhobust address completion etc.

Template.add_marker.events({
    'click input.add_marker' : function(evt,tmpl){
    /*

        ADD NEW marker
            1) Geocode Address
            2) Store data to database for marker.

    */
        if(typeof geocoder == 'undefined'){
              geocoder = new google.maps.Geocoder();
              console.log('trying to make geocoder');
              console.log(geocoder);
 
        }
        if(typeof geocoder != 'undefined' && Meteor.userId()){
            var geo_term=tmpl.find(".marker_address").value;
            geocoder.geocode({'address':geo_term},function(results,status){
                results = results[0];
                if(status == google.maps.GeocoderStatus.OK){
                    map.setCenter(results.geometry.location);
                    var record ={};
                    record.name = tmpl.find(".marker_name").value;
                    record.type = tmpl.find(".marker_type").value;
                    record.group = tmpl.find(".marker_group").value;
                    // set loc field to geometry locations given in geocoder
                    record.loc = [results.geometry.location.jb,results.geometry.location.kb];
                    // set owner field to person who created it so they may re-edit what they have created
                    record.owner = Meteor.userId();
                    console.log(record);
                    var record_id = markers.insert(record);
                    
                    Session.set('selected_marker',record_id);
                    lookForMarkers();
                    //lookForMarkers([results.geometry.location.jb,results.geometry.location.kb]);
                    //document.getElementById('.marker_address').value = '';
                }else{
                /*
                    Would you like to insert this marker anyway?
                */
                    alert('Could not geocode location.. please check for internet connection');
                    // show input fields..
                }
            });
            // From here let server build the marker and update client.
            $('#marker_add').hide();
            
            // show the button to add another marker
            $('.markerAddShow').show();
            
            // remove fields from session to avoid accidental field duplication/reentry
        }else if(!Meteor.userId()){
            alert('You must be logged in before you can add new markers');
        }
        else{
            // ask to insert a location without a geocoder?
            alert('Gmaps does not seem to be loaded');
        
        }
    }
});

// Handles edit /deleting markers
// TODO Remove all associated services when removing a marker, create server side methods for secure deletion etc.

Template.groups.events({
    'click .edit_group': function(evt,tmpl){
        console.log('edit group');
        // weird bug.. click was only getting the first classed element...
        if(!Session.equals('selected_group',evt.target.id))
            Session.set('selected_group',evt.target.id);
    },
    // DELETE A GROUP!
    'click input.del_group': function(evt,tmpl){
        console.log('delete this group');
        var group_id = evt.target.id;
        
        if( group_id && typeof group_id === 'string' && group_id != ''){
            groups.remove({_id:group_id});
            //var q = groups.remove({_id:group_id,owner:Meteor.userId()});
        }
    }
}
);

Template.markers.events({
    'click input.del_marker' : function(evt,tmpl){
        markers.remove({_id:tmpl.data._id});
        $('#marker_add'),show();
    },
    'click a.edit_marker' :function(evt,tmpl){
        /* set session and show marker editor if admin*/
        // probably use the index to look for the term eventually...
        var latlng = new google.maps.LatLng(tmpl.data.loc[0], tmpl.data.loc[1]);
        map.setCenter(latlng);
        var curMarker = Session.get('selected_marker');
        if(curMarker != tmpl.data._id){
            console.log('Session: selected_marker set to ' + tmpl.data._id);
            Session.set('selected_marker',tmpl.data._id);
        }
        $('div#groups').hide();
    }
});

Template.edit_marker.events = {
    'click input.del_marker' : function(evt,tmpl){
        markers.remove({_id:tmpl.data._id});
        // refresh the overlays
        // eventually use SESSION variable to keep track of how to filter the markers
        // based on the user settings/permissions etc.
        lookForMarkers();
    },
    'click .del_marker_service' : function(evt,tmpl){
        marker_services.remove({_id: tmpl.find('.del_marker_service').id});
    }
};

// handles creating a new service (adding it to the services collection)
// adding a service to a marker (creating a record in marker_services that refers to the other collections)
// removing a service from a marker (removing the record from marker_services)

Template.services_offered.events({
    'click input.new_service' : function(evt,tmpl){
        if(Meteor.userId()){
            var new_service = tmpl.find('.new_service_input').value,
            record = {title:new_service,owner:Meteor.userId()};
            services.insert(record);
        }else{
            alert('Must be logged in to create new services to add to markers');
        }
        console.log(record);
    },
    'click input.add_service' : function(evt,tmpl){
        console.log('adding this service');
        var new_service = tmpl.find('.add_services'),
            record = {},
            marker_id = Session.get('selected_marker');
        if(marker_id){
            record.service = new_service.options[new_service.selectedIndex].id;
            record.marker_id = marker_id;
            // make sure no DUPES!!
            marker_services.insert(record);
            // owner? possibly agency? not super needed...
        }else{
            alert('No selected marker to apply new service to');
        }
    },
    'click .del_marker_service' : function(evt,tmpl){
        marker_services.remove({_id: tmpl.find('.del_marker_service').id});
    }
});

/*
 *
 *
 *   Template Functions
 *
 */

Template.groups.selectedGroup = function(evt,tmpl){
    var group_id = Session.get('selected_group');
    console.log('in selected group');
    if(Meteor.userId() && group_id){
        var q =groups.findOne({_id: group_id }), q2=group_codes.find({owner:Meteor.userId(),group_id:group_id});
        q2 = q2.fetch();
        if(q2.length > 0)
            // return the codes so template renders them ...
            console.log(q2);
        else
            console.log('no codes');
        return q;
    }
};

Template.groups.selected_visibility = function(evt,tmpl){
    // check to see if element is selected or not ?
    var group_id = Session.get('selected_group');
    if(Meteor.userId() && group_id){
        // just return entire html block with the select menu and the appropriate value selected SUCH A PITA!!!
        for(var n = 0,vis = ['public','private','invite'],result='',q=groups.findOne({_id: group_id},{visibility:1}); n< vis.length;n++)
            result += '<input type="radio" name="group_visbility" class="span group_visibility" id="gv_'+vis[n]+'" value="'+vis[n]+'" '+(vis[n] == q.visibility ? ' CHECKED ':'' )+'  ><label>'+vis[n]+'</label>';

        
        return result;
    }
}

Template.editor_group.selectedGroup = Template.groups.selectedGroup;

Template.edit_marker.canEdit = function(evt,tmpl){
    var user_id = Meteor.userId(), marker_id = Session.get('selected_marker'), can_edit = Session.get('can_edit');
    // kinda insecure... probably destroy session if user_id isn't around ...
    if(can_edit == marker_id && user_id)
        return true;
    else if(marker_id && user_id)
        Meteor.call('canEdit',marker_id,function(error,result){ if(result) Session.set('can_edit',result); });
    return false;
}

Template.group_menu.userGroups = function(evt,tmpl){
    var q = groups.find({'owner' : Meteor.userId()});
    q = q.fetch();
    return q;
};

Template.add_marker.userGroups = Template.group_menu.userGroups;

Template.add_marker.markerTypes = function(evt,tmpl){
    var q = marker_types.find({},{});
    q = q.fetch();
    return q;
};

Template.services_offered.services = function(evt,tmpl){
    if(typeof services_sub != 'undefined')
        if(services_sub.ready()){
            var q = services.find({},{});
            q = q.fetch();
            return q;
        }else
            console.log('services sub not ready');
};

Template.edit_marker.currentServices = function(evt,tmpl){
    var curMarker = Session.get('selected_marker');
    if(curMarker){
        var currentServ = marker_services.find({marker_id: curMarker});
        currentServ = currentServ.fetch();
        if(currentServ){
            // next link up with services to get titles...
            for(var i = 0;i<currentServ.length;i++){
                var q = services.findOne({_id: currentServ[i].service});
                if(typeof q.title != 'undefined')
                    currentServ[i].title = q.title;
            }
            return currentServ;
        }
    }
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

Template.edit_marker.rendered = function(evt,tmpl){
    $('div#groups').hide();
}
