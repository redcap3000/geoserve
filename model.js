
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

}

markers = new Meteor.Collection("markers");
markers.allow(default_permissions);

marker_services = new Meteor.Collection("marker_services");
marker_services.allow(default_permissions);

marker_types = new Meteor.Collection("marker_types");
marker_types.allow(default_permissions);

groups = new Meteor.Collection("groups");

groups.allow(default_permissions);

// stores various codes associated with a group; i.e. multiple codes could refer to the same group and grant different types of access

group_codes = new Meteor.Collection("group_codes");

// to store a users authorized subscriptiion to a group based on group codes, would contain fields that could refer to a users editing capability
users_group_codes = new Meteor.Collection("users_group_codes");

agencies = new Meteor.Collection("agencies");

services = new Meteor.Collection("services");
services.allow(default_permissions);