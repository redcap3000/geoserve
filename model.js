markers = new Meteor.Collection("markers");

marker_services = new Meteor.Collection("marker_services");

marker_types = new Meteor.Collection("marker_types");

groups = new Meteor.Collection("groups");

// stores various codes associated with a group; i.e. multiple codes could refer to the same group and grant different types of access

group_codes = new Meteor.Collection("group_codes");

// to store a users authorized subscriptiion to a group based on group codes, would contain fields that could refer to a users editing capability
users_group_codes = new Meteor.Collection("users_group_codes");

agencies = new Meteor.Collection("agencies");

services = new Meteor.Collection("services");


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