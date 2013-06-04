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
    canEdit : function(curMarker,theCollection){
        if(curMarker && typeof theCollection == 'undefined'){
            console.log('findoning one');
            var q = markers.findOne({_id: curMarker, owner: Meteor.userId()});

        }else if(typeof theCollection != 'undefined'){
            if(theCollection == 'groups')
                // use a switch but for now support groups ?
                var q = groups.findOne({_id:curMarker,owner:Meteor.userId()});
                //else if(theCollection ==''){
                //   var q = groups.findOne({_id:curMarker,owner:Meteor.userId()});
        }
        if(q){
            console.log(q);
            return q._id;
        }
        return false;
    }
});
