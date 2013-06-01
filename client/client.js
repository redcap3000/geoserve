/*

{
	"name" : "Test",
    "owner" : Mongo.userId()
	"type" : "Shelter",
	"loc" : [
		37.713761,
		-122.40093200000001
	],
	"_id" : "nhdSqB3TFNnuyek4i"
}
*/




marker_sub = Meteor.subscribe("allMarkers");
markers = new Meteor.Collection("markers");
/*
    marker_services = contains mongo id's refering to 'services'
    
    
    _id : <mongo_id>,
    marker_id : markers._id,
    service_id : services._id
 
*/

marker_services_sub = Meteor.subscribe("allMarkerServices");
marker_services = new Meteor.Collection("marker_services");

agencies = new Meteor.Collection("agencies");


services_sub = Meteor.subscribe("allServices");

services = new Meteor.Collection("services");


Meteor.startup(function(){
      geocoder = new google.maps.Geocoder();
      createMap();
      
      Deps.autorun(function(){
        if(marker_sub.ready()){
            console.log('marker subscription ready');
            // this sets the new loc prematurely?
            var mCheck = markers.find({},{}).fetch();
            var emCheck = mCheck.pop();
            emCheck = emCheck['loc'];
            // maybe not 'create the map new each time?
            if(typeof map === 'undefined'){
                //createMap(new google.maps.LatLng(emCheck[0],emCheck[1]));
            }else{
                var latlng = new google.maps.LatLng(emCheck[0], emCheck[1]);
                map.setCenter(latlng);
            }
            lookForMarkers();
          
        var curMarker = Session.get('selected_marker');
        if(curMarker){
        
            // probably show something that allows us to edit the selected marker?
        
        }
    }
});
      
});

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
        var new_service = tmpl.find('.add_services'),
            record = {};
            marker_id = Session.get('selected_marker');
        if(marker_id){
            console.log(new_service.options[new_service.selectedIndex]);
            record.service = new_service.options[new_service.selectedIndex].id;
            record.marker_id = marker_id;
            //alert('inserting');
            // make sure no DUPES!!
            marker_services.insert(record);
            console.log(record);
            // owner? possibly agency? not super needed...
        }else{
            alert('No selected marker to apply new service to');
        }
    },
    
    'click .del_marker_service' : function(evt,tmpl){
        marker_services.remove({_id: tmpl.find('.del_marker_service').id});
    }


});



Template.edit_marker.canEdit = function(evt,tmpl){
    var user_id = Meteor.userId(), marker_id = Session.get('selected_marker'), can_edit = Session.get('can_edit');
    
    // kinda insecure... probably destroy session if user_id isn't around ...
    if(can_edit == marker_id && user_id){
        return true;
    }else{
        if(marker_id && user_id)
        
            Meteor.call('canEdit',marker_id,user_id,function(error,result){
                if(result)
                    Session.set('can_edit',result);
            
            });
        return false;
    }

}

Template.add_marker.events({
    'click input.add_marker' : function(evt,tmpl){
    /*

        ADD NEW marker
            1) Geocode Address
            2) Store data to database for marker.

    */
        if(typeof geocoder != 'undefined' && Meteor.userId()){
            var geo_term=tmpl.find(".marker_address").value;

        
            geocoder.geocode({'address':geo_term},function(results,status){
                results = results[0];
                if(status == google.maps.GeocoderStatus.OK){
                    map.setCenter(results.geometry.location);
                    
                    var record ={};
                    record.name = tmpl.find(".marker_name").value;
                    record.type = tmpl.find(".marker_type").value;
                    record.visibility = tmpl.find(".marker_type").marker_visiblity;

                    
                    // set loc field to geometry locations given in geocoder
                    record.loc = [results.geometry.location.jb,results.geometry.location.kb];
                    // set owner field to person who created it so they may re-edit what they have created
                    record.owner = Meteor.userId();
                    markers.insert(record);
                    lookForMarkers([results.geometry.location.jb,results.geometry.location.kb]);
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
            console.log('Its all here lets make an insert. and probably hide something...');
            
            // remove fields from session to avoid accidental field duplication/reentry
        }else{
            // ask to insert a location without a geocoder?
            alert('Gmaps does not seem to be loaded');
        
        }
    }
});

Template.markers.events({
    'click input.del_marker' : function(evt,tmpl){
        markers.remove({_id:tmpl.data._id});
        // refresh the overlays
        // eventually use SESSION variable to keep track of how to filter the markers
        // based on the user settings/permissions etc.
        lookForMarkers();
    },
    'click a.edit_marker' :function(evt,tmpl){
        /* set session and show marker editor if admin*/
        console.log('edit');
        // probably use the index to look for the term eventually...
        var latlng = new google.maps.LatLng(tmpl.data.loc[0], tmpl.data.loc[1]);
        map.setCenter(latlng);
        var curMarker = Session.get('selected_marker');
        if(curMarker != tmpl.data._id){
            console.log('Session: selected_marker set to ' + tmpl.data._id);
            Session.set('selected_marker',tmpl.data._id);
            }
        
    },
    'click a.add_service':function(evt,tmpl){
        /* add a service from existing services in services collection */
    },
    'click a.new_service':function(evt,tmpl){
//        tmpl.find()
        /* add a new service - inserts new service into services */
    }
});



Template.loggedInMenu.events({
    'click .agencyAdd' : function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#agency_new').show();
 
    },
    'click .showMarkers' : function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#the_markers').show();
        if(Session.get('selected_marker'))
            $('div#marker_edit').show();
 
    },
    
    'click .markerEditShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#marker_edit').show();
    },'click .markerAddShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        $('div#marker_add').show();
        $('div#the_markers').hide();
        //    Template.loggedInMenu.rendered();
        $('div#marker_edit').hide();
    },
    'click .settingsShow': function(evt,tmpl){
        Template.loggedInMenu.rendered();
        console.log('showing settings');
        $('div#user_settings').show();
    },
    'click .geolocate': function(evt,tmpl){
        if(navigator.geolocation){
            
            var successFunction = function(success) {
                  var navLatLng = new google.maps.LatLng(success.coords.latitude, success.coords.longitude);
                  // annoying...
                  //createMap(navLatLng);
                  // send it true option to use different marker
                  placeNavMarker(navLatLng,true);
                  lookForMarkers([navLatLng.jb,navLatLng.kb]);
                };

            var errorFunction = function(success) {
                var latlng = new google.maps.LatLng(37.808631, -122.474470);
                //createMap(latlng);
                placeNavMarker(navLatLng);
            //  addAutocomplete();
                };
        
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }else{
            alert('Could not geolocate');
        }
  
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


Template.services_offered.services = function(evt,tmpl){
    var q = services.find({},{});
    q = q.fetch();
    return q;
}

Template.edit_marker.currentServices = function(evt,tmpl){
    var curMarker = Session.get('selected_marker');
   
    if(curMarker){
        var currentServ = marker_services.find({marker_id: curMarker}).fetch();
        if(currentServ){
            // next link up with services to get titles...
            for(var i = 0;i<currentServ.length;i++){
                console.log(currentServ[i].service);
                var q = services.findOne({_id: currentServ[i].service});
                if(typeof q.title != 'undefined')
                    currentServ[i].title = q.title;
                
            }
            return currentServ;
            }
    }
}


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

Template.loggedInMenu.rendered = function(evt,tmpl){
    
    $('div#marker_add').hide();
    $('div#user_settings').hide();
   // $('div#the_markers').hide();
    if(!Session.get('selected_marker'))
        $('div#marker_edit').hide();
    $('div#agency_new').hide();

};




/* BEGIN GMAPS


 TO Eventually support hiding /showing markers quickly in gmaps.. trying to get that to work properly..
 
 */

function lookForMarkers(theBox){
    console.log ('looking for markers');
    c = markers.find({}, {fields: {_id: 1}}).fetch();
    console.log(c);
    if(c.length > 0)
        for(var i=0;i<c.length;i++){
            var arr= c[i];
            if(typeof arr['loc'] != 'undefined'){
                var co = new google.maps.LatLng(arr['loc'][0], arr['loc'][1]);
                var marker_type = '';
                if(arr['type'] == 'Shelter' || arr['type'] == 'Hospital' || arr['type'] == 'Other' || arr['type'] == 'Pharmacy'){
                // default
                    marker_type = arr['type'];
                }else{
                    marker_type = undefined;
                }
                placeNavMarker(co,marker_type,function(){alert(arr['name'] + ' ' + arr['type']);});
            }
        }
}

function createMap (latLng) {
    var mapOptions = {
        disableDoubleClick: true,
        streetViewControl: false,
        scrollwheel: false,
        zoom: 15,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

};



function placeNavMarker (latLng,image,clickCallBack) {

    if(typeof image == 'undefined')
        var image = "Other.png";
    else if(typeof image == 'string'){
        // dont show this marker for the geocoded location
        var image = image + ".png";
        console.log("Should be using"+image);
    }else{
        var image = "http://gmaps-samples.googlecode.com/svn/trunk/markers/blue/blank.png";
    }
    // this map is not always there>>>?
    var new_marker = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: image
    });
    if(typeof clickCallBack == 'function')
        google.maps.event.addListener(new_marker,"click",clickCallBack);
    //currentMarkers.push( new_marker );
}
