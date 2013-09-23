
var default_permissions = {
    insert:function(userId,doc){
        return (userId && doc.owner === userId);
    },
    update:function(userId,doc,fields,modifier){
        return doc.owner === userId;
    },
    remove:function(userId,doc){
        return doc.owner === userId;
    },
    fetch: ['owner']
};

var read_only_permissions = {
    insert:function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    }
    
};


// stores various codes associated with a group; i.e. multiple codes could refer to the same group and grant different types of access


// maybe make this a minimongo collection ONLY?
insta_grams = new Meteor.Collection("insta_grams");

// use this to store basic location data and hopefully to avoid having
// too many identical objects (store mongo id of location inside of insta_grams
// insta locations is server side only and does not store any user info... only 'public' feed stuff
insta_locations = new Meteor.Collection("insta_locations");

insta_grams.allow(default_permissions);

// only server can remove theses...

insta_locations.deny(read_only_permissions);

// for data associated with a location ...
insta_locations_grams = new Meteor.Collection("insta_locations_grams");

insta_locations_grams.deny(read_only_permissions);