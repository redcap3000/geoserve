Meteor.publish("allMarkers",function(){
    return markers.find({},{});
});

Meteor.publish("allMarkerTypes",function(){
    return marker_types.find({},{});
});

Meteor.publish("allGroups",function(){
    return groups.find({},{});
});

Meteor.publish("allMarkerServices",function(){
    return marker_services.find({},{});
});

Meteor.publish("allServices",function(){
    return services.find({},{});
});


/* allow editing of group_codes records so long as owner is current user id


    group codes might look like:
    
    {
        _id: <mongo_id>,
        group_id : <groups._id>,
        owner : Meteor.userId(),
        hash : (string),
        salt : (string),
        permission : (admin/mod/client)
        
    }

*/
Meteor.publish("groupCodes",function(){
    return group_codes.find({owner:Meteor.userId()},{});
});

Meteor.publish("publicGroups",function(){
    return groups.find({visibility:'public'});
});
// find all 'public' markers .. i.e.. markers that belong to a public group? should i generate a listing
// of all public groups and look for markers belonging to those? in deps!!!


/*
 stores codes for a user to edit (only their own based on Meteor.userId()
 a record is created in users_group_codes every time a group is subscribed to so long as a refer code record exists and is active.


    term refers to the 'protected passphrase' that is required to grant access...
    
    Probably run salt on term and compare against hash
    
    users_group_codes
    
    {
    
        _id: <mongo_id>,
        owner: Meteor.userId();
        code_id : group_codes._id,
        term : <string>
    }

*/

Meteor.publish("usersGroupCodes",function(){
    return users_group_codes.find({owner:Meteor.userId()},{});
});



Meteor.startup(function () {
    // Pre fil the markertypes with some default types .. images are stored in /public
    if(marker_types.find({},{}).count() == 0){
        console.log('filling marker types');        
        var default_markers = [
            {
                name: 'Other',
                owner : 'sys',
                img : '/Other.png'
            },
            {
                name: 'Clinic',
                owner : 'sys',
                img : '/Clinic.png'
            },
            {
                name: 'Hospital',
                owner : 'sys',
                img : '/Hospital.png'
            },
            {
                name: 'Pharmacy',
                owner : 'sys',
                img : '/Pharmacy.png'
            },
            {
                name: 'Shelter',
                owner : 'sys',
                img : '/Shelter.png'
            }
        ];
        for(var i=0;i<default_markers.length;i++)
            console.log(marker_types.insert(default_markers[i]));
        
    }
});
 
// basic function that determines if the user can edit
Meteor.methods({
    canEdit : function(curMarker,theCollection,userId){
    console.log(curMarker + ' , ' + theCollection + ' , ' + userId);
        if(curMarker && theCollection == 'markers'){
            var q = markers.findOne({_id: curMarker, owner: userId });
        }else if(typeof theCollection != 'undefined'){
            if(theCollection == 'groups')
                // use a switch but for now support groups ? 
                var q = groups.findOne({_id:curMarker,owner:userId});
        }
        if(q){
            console.log(q);
            return q._id;
        }
        return false;
    }
});
