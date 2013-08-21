

// adds a new 'group' and stores userid as record 'owner'

Template.add_group.events({
    'click button.add_group': function(evt,tmpl){
        var record ={},elements = tmpl.findAll(".group_visibility"),checked_element = undefined;
        record.owner = Meteor.userId();
        record.name = tmpl.find(".group_title").value;
        record.desc = tmpl.find(".group_desc").value;
        
        // properly determines the checked element for similarlly classed values
        for (var i=0, len=elements.length; i<len; ++i)
            if (elements[i].checked) var checked_element =  elements[i].value;
        
        record.visibility = (typeof checked_element !== 'undefined'? checked_element: 'private');
        
        var record_id = groups.insert(record);
        Session.set('selected_group',record_id);

    }
});


// Handles edit /deleting markers
// TODO Remove all associated services when removing a marker, create server side methods for secure deletion etc.

Template.groups.events({
    'click .edit_group': function(evt,tmpl){
        console.log('edit group');
        // weird bug.. click was only getting the first classed element...
        if(!Session.equals('selected_group',evt.target.id))
            Session.set('selected_group',evt.target.id);
    },
    // DELETE A GROUP!
    'click input.del_group': function(evt,tmpl){
        console.log('delete this group');
        var group_id = evt.target.id;
        
        if( group_id && typeof group_id === 'string' && group_id != ''){
            groups.remove({_id:group_id});
            //var q = groups.remove({_id:group_id,owner:Meteor.userId()});
        }
    }
}
);
// handles creating a new service (adding it to the services collection)
// adding a service to a marker (creating a record in marker_services that refers to the other collections)
// removing a service from a marker (removing the record from marker_services)


/*
 *
 *
 *   Template Functions
 *
 */

Template.groups.selectedGroup = function(evt,tmpl){
    var group_id = Session.get('selected_group');
    console.log('in selected group');
    if(Meteor.userId() && group_id){
        var q =groups.findOne({_id: group_id }), q2=group_codes.find({owner:Meteor.userId(),group_id:group_id});
        q2 = q2.fetch();
        if(q2.length > 0)
            // return the codes so template renders them ...
            console.log(q2);
        else
            console.log('no codes');
        return q;
    }
};

Template.groups.selected_visibility = function(evt,tmpl){
    // check to see if element is selected or not ?
    var group_id = Session.get('selected_group');
    if(Meteor.userId() && group_id){
        // just return entire html block with the select menu and the appropriate value selected SUCH A PITA!!!
        for(var n = 0,vis = ['public','private','invite'],result='',q=groups.findOne({_id: group_id},{visibility:1}); n< vis.length;n++)
            result += '<label class="radio inline"><input type="radio" name="group_visbility" class="group_visibility" id="gv_'+vis[n]+'" value="'+vis[n]+'" '+(vis[n] == q.visibility ? ' CHECKED ':'' )+'  >'+vis[n]+'</label>';

        
        return result;
    }
}

Template.editor_group.selectedGroup = Template.groups.selectedGroup;

Template.group_menu.userGroups = function(evt,tmpl){
    var q = groups.find({'owner' : Meteor.userId()});
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



Template.marker_services.currentServices = Template.edit_marker.currentServices;



Template.groups.rendered = function(evt,tmpl){
//alert('groups rendered');
            $('.add_group').hide();

};
