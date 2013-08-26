/*
 *
 * Template Events
 *
 */

// Deals with navigation showing/hiding elements; going to create screen/edit screen, and geolocation button.

// for hiding the loginto instagram button ..
Template.nav.hasInstaCode = function(){
    return (Session.get('access_token') ? true : false);
}
Template.nav.instaPostsReady = function(){
    return !Session.equals("user_self",false);
}
Template.nav.events = {'click .instaLogin' : function () {
            var doesHaveAccess = Session.get('access_token');
            if(!doesHaveAccess){
                Meteor.call('authenticate',
                    function(error,result){
                        if(typeof error != 'undefined'){
                            console.log('error');
                        }else
                            // redirect here...
                           window.location.replace(result);
                        });
                        }else if(doesHaveAccess){
                            Meteor.call('request_auth_code',doesHaveAccess,Meteor.settings.redirect_uri,
                                function(error,result){
                                    if(typeof error =='undefined'){
                                        Session.set('access_token',result.access_token);
                                        Session.set('user_info',result.user);
                                        // do default call for user feed ... to populate map with markers...
                                        
                                        Meteor.call('user_self',result.access_token,function(error,result){
                                                if(typeof error =='undefined'){
                                                    Session.set('user_self',result);
                                                }else{
                                                   // alert('error');
                                                    console.log(error);
                                            }}
                                        );
                                        
                                        
                                    }else
                                        console.log(error);
                                }
                            );
                        }
        },
        'click .user_self' : function(){
            var access_token = Session.get('access_token');
            //var user_feed = Session.get('user_self');
            // only run this if 
             if(access_token){
                Session.set('user_self',false);
                 Meteor.call('user_self',access_token,function(error,result){
                                    if(typeof error =='undefined'){
                                        Session.set('user_self',result);
                                    }else{
                                       // alert('error');
                                        console.log(error);
                                }}
                                );
            }
            
        }
    }

Template.loggedInMenu.instaMarkers = function(){
// check if marker sub is ready?
    return insta_grams.find({},{sort:{id: -1}});
}

Template.instaMarker.events = {

    "click .focus_marker" : function(){
        setMapCenter([this.lat,this.lon]);
    }
}

