/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 */
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
},
read_only_permissions = {
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

/*
 *   insta_grams            = users geo-active feed, stored via owner ID
 *   insta_locations        = public collection with locations first looked up via location id stored in insta_grams.locations ( [int,int,int] )
 *   insta_locations_grams  = feeds from insta_locations, stored via insta_location id
 */

insta_grams = new Meteor.Collection("insta_grams"),insta_locations = new Meteor.Collection("insta_locations"),insta_locations_grams = new Meteor.Collection("insta_locations_grams");

insta_grams.allow(default_permissions);
insta_locations.deny(read_only_permissions);
insta_locations_grams.deny(read_only_permissions);