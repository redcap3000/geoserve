if (Meteor.isServer) {
  self= this;

  
    groups = new Meteor.Collection("groups");

    markers = new Meteor.Collection("markers");

    marker_types = new Meteor.Collection("marker_types");

    
    marker_services = new Meteor.Collection("marker_services");

    services = new Meteor.Collection("services");


    
    markers.allow({
    
        insert: function(userId,doc){
            return (userId && doc.owner === userId);
        },
        update: function(userId,doc,fields,modifier){
            return doc.owner === userId;
        },
        remove: function(userId,doc){
            return doc.owner === userId;
        },
        fetch: ['owner']
        
    
    });
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

    /*
        marker_services = contains mongo id's refering to 'services'
        
        
        _id : <mongo_id>,
        marker_id : markers._id,
        service_id : services._id
     
    */
 //   marker_services = new Meteor.Collection("marker_services");
    
    

//    agencies = new Meteor.Collection("agencies");

   // services = new Meteor.Collection("services");

  //markers._ensureIndex({ loc : "2d" });

  //Org = new Meteor.Collection('Org');

  //users = new Meteor.Collection("user");

  Meteor.startup(function () {
    // theres no org..
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
        
        for(var i=0;i<default_markers.length;i++){
            console.log(marker_types.insert(default_markers[i]));
        }
        
    }

 });
 
   Meteor.methods({
    isLoggedIn : function(uid){
    
    },
    isAdmin : function(uid){
        // do we have session here?
        console.log(Session);
        return true;
    },
    canEdit : function(curMarker){
        if(curMarker){
            var q = markers.findOne({_id: curMarker, owner: Meteor.userId()});
            
           if(q){

            console.log(q);

            return q._id;
            
            }
        }
        return false;
    },
    findMarker : function(x,y){
        console.log(x);
        console.log(y);
         markers._ensureIndex({ loc : "2d" });
         var theCenter = [[x,y],.1];
         // returns everything
         var r = markers.find({ loc : { "$geoWithin" : { "$center" : theCenter }}}).fetch();
         console.log(r.length);
        return r;
    },
    findmarkers : function(){
        console.log('finding markers');
        var c = markers.find({},{}).fetch();
        c.filter(function(arr){
            console.log(arr);
        });
        return markers.find({},{}).fetch();
    },
    markersIndex : function(){
        console.log('finding markers index');
        var c = markers.find({},{}).fetch(),r=[];
        c.filter(function(arr){
            console.log(arr);
            var x = {}
            // use underscore for this..
            x._id = arr._id;
            x.marker_name = arr.marker_name;
            r.push(x);
        });
        return r;
    }
  });
}