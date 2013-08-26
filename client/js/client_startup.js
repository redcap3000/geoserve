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
        if(Meteor.userId() && instaGram && instaGramPosts.ready()){
            var instaLocations = [], instaThumbnails = [];
            instaGram.filter(function(arr){
                if(arr.location != null){
                    placeNavMarker(new google.maps.LatLng(arr.location.latitude,arr.location.longitude),arr.images.thumbnail.url, function(){$(arr.id).toggle()});
                    // this is checking if insta_grams is present client/side so it gets reinserted! wait for the insta_grams collection to be ready?
                    var existing_check = insta_grams.findOne({id:arr.id});
                    if(existing_check){
                        if(arr.likes != null && existing_check.likes != arr.likes.count){
                            insta_grams.update(existing_check._id,{"$set" :{ likes : arr.likes.count}});
                        }
                    }else{
                        var r = {
                            id : arr.id,
                            username : arr.user.username,
                            link : arr.link,
                            created_time : arr.created_time,
                            image_low : arr.images.low_resolution.url,
                            image_standard : arr.images.standard_resolution.url,
                            image_thumb : arr.images.thumbnail.url,
                            type : arr.type
                        };
                        
                        if(arr.caption != null){
                            r.caption = arr.caption.text,
                            r.caption_id = arr.caption.id;
                        }
                        
                        if(arr.tags != null){
                            r.tags = arr.tags;
                        }
                        
                        if(arr.likes != null){
                             r.likes = arr.likes.count;
                        }
                        r.lat = arr.location.latitude;
                        r.lon = arr.location.longitude;
                        r.owner = Meteor.userId();
                        insta_grams.insert(r);
                    
                        // verif any updates to object..
                    
                    }
              }
            });
        }else if(Meteor.userId() && Session.get('access_token') && !Session.get('user_self')){
        // this might be BADD! get user feed on login !
            var access_token = Session.get('access_token');
            // make first call ..
             if(access_token)
                 Meteor.call('user_self',access_token,function(error,result){
                            console.log('caaling user_self');
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