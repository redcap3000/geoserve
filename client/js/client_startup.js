/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */

Meteor.startup(function(){
    createMap();
    // continually refresh feed
       
    var access_token = window.location.href.split("#");
    
    if(access_token.length > 1 && !doesHaveAccess){
        access_token = access_token[1].split("=")[1];
        Session.set('access_token', access_token);
        var doesHaveAccess = Session.get('access_token');

    }
    Meteor.setInterval(function(){
                                console.log('unsetting user_self');
                                Session.set('user_self',false);
                                }        ,60 * 60 * 45);
                            
    if(Meteor.userId()){
            // also use this reactive source to determine interface elements in templates...
            instaGramPosts = Meteor.subscribe("userInstaGrams", Meteor.userId());
            var instaGram = Session.get('user_self');
    }
    Deps.autorun(function(){
        
        var locations = Session.get('locations_search'), access_token = Session.get('access_token'), userId = Meteor.userId() ;
        if(userId && access_token ){
            if(!Session.get('user_self')){
                // set this to true so deps doesn't re run while its waiting for the response...
             Session.set('user_self',true);

             Meteor.call('user_self',access_token,Meteor.userId(),
                function(error,result){
                    if(typeof error =='undefined'){
                        Session.set('user_self',result);
                         if(Meteor.userId()){
                        // should set interval elsewhere.... probably...
                            Session.set('markerSort',undefined);

                        }
                    }else{
                        console.log(error);
                }});
            }
            // attempt to render markers from the locations_search api call .. probably do this in the server side call back...
         
        }
        
    });
      
});