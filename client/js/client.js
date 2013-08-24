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
Template.nav.instaCurrentMarkers = function(){
    alert('insta current markers');
        return Session.get('instaCurrentMarkers');
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
                                        
                                        
                                    }else
                                        console.log(error);
                                }
                            );
                        }
        },
        'click .user_self' : function(){
            var access_token = Session.get('access_token');
            var user_feed = Session.get('user_self');
             if(access_token && !user_feed)
                 Meteor.call('user_self',access_token,function(error,result){
                                    if(typeof error =='undefined'){
                                        Session.set('user_self',result);
                                    }else{
                                       // alert('error');
                                        console.log(error);
                                }}
                                );
             else
                return user_feed;
            
        }
    }

Template.loggedInMenu.instaMarkers = function(){
// check if marker sub is ready?
    return insta_grams.find();
}

Template.instaMarker.events = {

    "click a.focus_marker" : function(){
        setMapCenter([this.lat,this.lon]);
    }
}

