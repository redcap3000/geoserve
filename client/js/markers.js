
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
		    console.log(status);
                results = results[0];
                if(status == google.maps.GeocoderStatus.OK){
			console.log(results);
                    map.setCenter(results.geometry.location);
                    var record ={};
                    record.name = tmpl.find(".marker_name").value;
                    record.type = tmpl.find(".marker_type").value;
                    record.group = tmpl.find(".marker_group").value;
                    // set loc field to geometry locations given in geocoder
                    record.loc = [results.geometry.location.mb,results.geometry.location.nb];
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
    'click input.del_marker' : function(){
        markers.remove({_id:this._id});
    },
    'click .del_marker_service' : function(){
        marker_services.remove({_id: this._id});
    },
    
    'click button.new_service' : function(evt,tmpl){
        if(Meteor.userId()){
            var new_service = tmpl.find('.new_service_input').value,
            record = {title:new_service,owner:Meteor.userId()};
            services.insert(record);
        }else{
            alert('Must be logged in to create new services to add to markers');
        }
        console.log(record);
    },
    'click button.add_service' : function(evt,tmpl){
        console.log('adding this service');
        var new_service = tmpl.find('.add_services'),
            record = {},
            marker_id = Session.get('selected_marker');
        if(marker_id){
            record.service = new_service.options[new_service.selectedIndex].id;
            record.marker_id = marker_id,
            record.owner = Meteor.userId()
            // make sure no DUPES!!
            marker_services.insert(record);
            // owner? possibly agency? not super needed...
        }else{
            alert('No selected marker to apply new service to');
        }
    }
};

// handles creating a new service (adding it to the services collection)
// adding a service to a marker (creating a record in marker_services that refers to the other collections)
// removing a service from a marker (removing the record from marker_services)


/*
 *
 *
 *   Template Functions
 *
 */



Template.edit_marker.canEdit = function(evt,tmpl){
    var user_id = Meteor.userId(), marker_id = Session.get('selected_marker'), can_edit = Session.get('can_edit');
    // kinda insecure... probably destroy session if user_id isn't around ...
    if(can_edit == marker_id && user_id)
        return true;
    else if(marker_id && user_id)
        Meteor.call('canEdit',marker_id,function(error,result){ if(result) Session.set('can_edit',result); });
    return false;
}



Template.add_marker.userGroups = Template.group_menu.userGroups;

Template.add_marker.markerTypes = function(evt,tmpl){
    var q = marker_types.find({},{});
    q = q.fetch();
    return q;
};

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

Template.marker_services.currentServices = Template.edit_marker.currentServices;

/* 
 *
 *
 *   Logged in menu template functions  to generate menu for markers, and also to handle the selected marker
 *   session
 *
 */

Template.edit_marker.rendered = function(evt,tmpl){
    $('div#groups').hide();
}
