// for hiding the loginto instagram button ..

Template.nav.instaPostReady = function(){
    return !Session.equals("user_self",false);
};
Template.nav.hasInstaCode = function(){
    return (Session.get('access_token') ? true : false);
};

Meteor.startup(
    function(){

        if(Meteor.userId()){
            Meteor.setInterval(function(){
                Session.set('user_self',false);
                }        ,60 * 60 * 30);
        }
                   
    }
);


Template.nav.events = {
    'click .instaLogin' : function () {
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
                                        // set the interval to continually fetch new results ??
                                        
                                        
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
};

Template.loggedInMenu.instaMarkers = function(){
// check if marker sub is ready?
    return insta_grams.find({},{sort:{id: -1}});
}

Template.instaMarker.events = {
    "click .focus_marker" : function(){
        setMapCenter([this.lat,this.lon]);
    }
}

Template.instaMarker.created = function(){
//console.log(this.data);
       placeNavMarker(new google.maps.LatLng(this.data.lat,this.data.lon),this.data.image_thumb,this.data.likes + ' likes' + (this.data.tags.length > 0  ? '\n' + this.data.tags.join(', ')  :'') );
}

Template.instaMarker.preserve = ['img','.instaUser'];