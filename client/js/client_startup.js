/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */

Meteor.startup(function(){
    createMap();

    Deps.autorun(function(){
        if(Meteor.userId()){
            // also use this reactive source to determine interface elements in templates...
            instaGramPosts = Meteor.subscribe("userInstaGrams");

            var access_token = window.location.href.split("#");
            if(access_token.length > 1 && !doesHaveAccess){
                var doesHaveAccess = Session.get('access_token');
                access_token = access_token[1].split("=")[1];
                Session.set('access_token', access_token);
            }
            
            var instaGram = Session.get('user_self');
        }
      if(Meteor.userId() && Session.get('access_token') && !Session.get('user_self')){
        // this might be BADD! get user feed on login !
            var access_token = Session.get('access_token');
            // make first call ..
             if(access_token)
                 Meteor.call('user_self',access_token,function(error,result){
                                    if(typeof error =='undefined'){
                                        Session.set('user_self',result);
                                    }else{
                                       // alert('error');
                                        console.log(error);
                                }}
                                );
        }
    });
      
});