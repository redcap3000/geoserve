
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



// stores various codes associated with a group; i.e. multiple codes could refer to the same group and grant different types of access


// maybe make this a minimongo collection ONLY?
insta_grams = new Meteor.Collection("insta_grams");

insta_grams.allow(default_permissions);