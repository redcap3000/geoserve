/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */

Meteor.startup(function(){
    createMap();

    Deps.autorun(function(){
        //    if(marker_sub.ready() && marker_types_sub.ready() && groups_sub.ready() && services_sub.ready() && marker_services_sub.ready()){
                // this sets the new loc prematurely?
                               
                /* instagram stuff */
                    instaGramPosts = Meteor.subscribe("userInstaGrams");

                var access_token = window.location.href.split("#");
                if(access_token.length > 1 && !doesHaveAccess){
                    var doesHaveAccess = Session.get('access_token');
                    access_token = access_token[1].split("=")[1];
    //                access_token = access_token[1];
                    Session.set('access_token', access_token);
                 // forward to new place without the ugly code in the url?
                }
                
                var instaGram = Session.get('user_self');
                var instaCurrentMarkers = Session.get('instaCurrentMarkers');
              //  console.log(instaGram);
                if(instaGram && !instaCurrentMarkers){
                    var instaLocations = [], instaThumbnails = [];
                    instaGram.filter(function(arr){
        
//                        console.log(arr.location.latitude);
                        if(arr.location != null){
//                            placeNavMarker()
                            placeNavMarker(new google.maps.LatLng(arr.location.latitude,arr.location.longitude),arr.images.thumbnail.url, function(){$(arr.id).toggle()});
                            var r = {
                                id : arr.id,
                                username : arr.user.username,
                                link : arr.link,
                                created_time : arr.created_time,
                                image_low : arr.images.low_resolution.url,
                                image_standard : arr.images.standard_resolution.url,
                                images_thumbnail : arr.images.standard_resolution.url,
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
                            
                            // check if r.id and Meteor.userId() do not exist before insertion ..
                            
                            console.log(insta_grams.findOne({id:r.id}));
                            var existing_check = insta_grams.findOne({id:r.id});
                            console.log(existing_check);
                            if(!insta_grams.findOne({id:r.id})){
                                r.lat = arr.location.latitude;
                                r.lon = arr.location.longitude;
                                r.owner = Meteor.userId();
                                insta_grams.insert(r);
                            }else{
                                // verif any updates to object..
                                if(arr.likes != null && existing_check.likes != arr.likes.count){
                                    console.log('updating likes ..');
                                    console.log(existing_check.likes);
                                    console.log(arr.likes)
                                    console.log(insta_grams.update(existing_check._id,{"$set" :{ likes : arr.likes.count}}));
                                }else{
                                    console.log('likes same.. ');
                                }
                            
                                console.log('exists');
                            }
                            instaLocations.push({id: arr.id,x:arr.location.latitude,y:arr.location.longitude});
                        }
                    });
//                    console.log(instaLocations);
                    instaGram = Session.set('instaCurrentMarkers',instaLocations);
  //                  console.log(instaThumbnails);
                }else if(instaGram && instaCurrentMarkers){
                    //
                }
                
    });
      
});