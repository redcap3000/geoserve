/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */

Meteor.startup(function(){
    createMap();
    var marker_sub = Meteor.subscribe("allMarkers"),
    groups_sub = Meteor.subscribe("allGroups"),
    marker_types_sub = Meteor.subscribe("allMarkerTypes"),
    services_sub = Meteor.subscribe("allServices"),
    marker_services_sub = Meteor.subscribe("allMarkerServices");

    Deps.autorun(function(){
        //    if(marker_sub.ready() && marker_types_sub.ready() && groups_sub.ready() && services_sub.ready() && marker_services_sub.ready()){
                // this sets the new loc prematurely?
                var curMarker = Session.get('selected_marker');
                if(curMarker){
                    // load marker services and all services - but also need to trigger this when creating a new record...
                    var q = markers.findOne({_id: curMarker});
                    if(q)
                        if(typeof q['loc'] != 'undefined')
                            setMapCenter(q['loc']);
                        else{
                            console.log('problem with mongo loc query');
                            setMapCenter([0,0]);
                        }
                    lookForMarkers();
                
                // probably show something that allows us to edit the selected marker?
                }else{
                    // console.log('else');
                    var mCheck = markers.find({},{}).fetch();
                    // maybe not 'create the map new each time?
                    if(typeof map === 'undefined' && !mCheck){
                        createMap();
                        setMapCenter([0,0]);
                    }else if (mCheck){
                        var emCheck = mCheck.pop();
                        if(typeof emCheck != 'undefined')
                            emCheck = emCheck['loc'];
                        else{
                            //alert('It appears you are running geoserve for the first time!');
                            // ideally show the add marker screen
                            emCheck = [0,0];
                        }
                        setMapCenter(emCheck);
                    }else
                        setMapCenter([0,0]);
                    lookForMarkers();
                }
                
                /* instagram stuff */
                
                var access_token = window.location.href.split("#");
                if(access_token.length > 1 && !doesHaveAccess){
                    var doesHaveAccess = Session.get('access_token');
                    access_token = access_token[1].split("=")[1];
    //                access_token = access_token[1];
                    Session.set('access_token', access_token);
                 // forward to new place without the ugly code in the url?
                }
    });
      
});

/*
 *   END Meteor.startup()
 */