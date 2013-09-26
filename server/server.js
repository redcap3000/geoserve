/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 */
Meteor.publish("userInstaGrams",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return insta_grams.find({owner:userId},{id:1,caption:1,likes:1,lat:1,lon:1,tags:1,link:1,username:1,image_low:1,image_thumb:1,caption_id:1,created_time:1,last_hit:1,locations:1});
    }
    else
        return false;
});

Meteor.publish("allLocations",function(idFilter){
// eventually use geojson to only get locations near by? automagically ... ?
    if(typeof idFilter == 'undefined' || typeof idFilter != 'object' ||  !idFilter){
    // no filter
        return false;
        }
    else{
        return insta_locations.find({id: {"$in" : idFilter}});
        }
});

Meteor.publish("locationsPosts",function(theFilter){
// the filter refers to an array with ID's of the grams to retreve ...
// eventually use geojson to only get locations near by? automagically ... ?
    //console.log(this.added("insta_locations_grams"));\// tooo much DATA
    if(typeof theFilter != 'undefined' && theFilter != null)
        if(theFilter.length > 0)
            return insta_locations_grams.find({id:{"$in" : theFilter}},{});
    else{
        console.log('no locations to load... from filter');
    }
});

Meteor.methods({
    instaInsert : function(the_owner,arr){
         if(arr.location != null){
            if(the_owner == null || !the_owner) {
                console.log('** OTHER OWNER**');
                return false;
            }
            // this is checking if insta_grams is present client/side so it gets reinserted! wait for the insta_grams collection to be ready?
            var existing_check = insta_grams.findOne({id:arr.id,owner:the_owner});
            if(existing_check){
                if(arr.likes != null && existing_check.likes != arr.likes.count){
                    var the_time = new Date().getTime();
                    insta_grams.update(existing_check._id,
                        {"$set" :
                            { likes : arr.likes.count,
                             last_hit : the_time}
                        }
                    );
                }
            }else{
                var created_time = parseInt(arr.created_time);
                var r = {
                    id : arr.id,
                    username : arr.user.username,
                    link : arr.link,
                    created_time : parseInt(arr.created_time),
                    last_hit : created_time,
                    image_low : arr.images.low_resolution.url,
                    image_standard : arr.images.standard_resolution.url,
                    image_thumb : arr.images.thumbnail.url,
                    type : arr.type
                };
                
                if(arr.caption != null){
                    r.caption = arr.caption.text,
                    r.caption_id = parseInt(arr.caption.id);
                }
                
                if(arr.tags != null){
                    r.tags = arr.tags;
                }
                
                if(arr.likes != null){
                     r.likes = arr.likes.count;
                }
                r.lat = arr.location.latitude;
                r.lon = arr.location.longitude;
                
                r.owner = the_owner;
               
                if(typeof r.owner != 'undefined'){
                    insta_grams.insert(r);
                }else{
                    console.log('no owner for record!!');
                }
            }
        }

    },
           
     authenticate : function(client_id){
        var settings = Meteor.settings;
        if(typeof settings.redirect_uri != 'undefined'){
            var redirect_uri = settings.redirect_uri,
            client_id = settings.client_id;

            if(typeof settings.client_id !== 'undefined'){
                if(typeof client_id != 'undefined' && typeof redirect_uri != 'undefined')
                    return 'https://api.instagram.com/oauth/authorize/?client_id='+client_id+'&redirect_uri='+redirect_uri+'&response_type=token';
                else
                    return {error: 'missing client id and/or redirect uri'};
            }else
                console.log('Could not initalize settings, was meteor deployed with --settings deploy_settings.json');
            }
        },
     locations_search : function(access_token,lat,lng,postId){
            if(typeof access_token != 'undefined' && typeof lat != 'undefined' && typeof lng != 'undefined' && typeof postId != 'undefined'){
                // query server side database for cooards? this is kinda weird way to store data sets... data will be repeated incessantly...
                // shall i round lat and lng ?
                var locations_check = insta_grams.findOne({_id : postId, locations: {"$exists":true}},{locations:1});
                if(typeof locations_check == 'undefined'){
                    //console.log('undefined2');
                    var base_url = 'https://api.instagram.com/v1/locations/search?lat='+lat+'&distance=1&lng='+lng+'&access_token=' + access_token;
                   console.log(base_url);
                    try{
                        var request = HTTP.get(base_url);
                        if(request.statusCode === 200 && typeof request.data != 'undefined'){
                            if(typeof request.data.data != 'undefined'){
                                // filter data
                                var locations_result = [];
                                 request.data.data.filter(function(arr){
                                    arr.id = parseInt(arr.id);
                                    // check to see its not already there....
                                    var instaCheck = insta_locations.findOne({id:arr.id},{id:1});
                                    if(!instaCheck){
                                        insta_locations.insert(arr);
                                        Meteor.call("locations_media_recent",access_token,arr.id,function(error,result){
                                            console.log(arr.id);
                                            /*
                                                attempt to make this object MUCH smaller ... maybe pregenerate some html?
                                            */
                                            if(typeof result != 'undefined'){
                                                var cpy = {};
                                                cpy.id = arr.id;
                                                
                                                cpy.data = result.data;
                                                var new_data = [];
                                                
                                                cpy.data.filter(function(obj){
                                                    
                                                    var new_obj = {};
                                                    new_obj.user = obj.user.username,
//                                                    new_obj.lat = obj.location.latitude,
//                                                    new_obj.lon = obj.location.longitude,
                                                    new_obj.location_id = obj.location.id,
                                                    new_obj.created_time = obj.created_time,
                                                    new_obj.link = obj.link,
                                                    new_obj.likes = obj.likes.count,
                                                    new_obj.image =  obj.images.low_resolution.url,
                                                    new_obj.id = obj.id;
                                                    
                                                    
                                                    if(obj.caption != null){
                                                        new_obj.caption = obj.caption.text;
                                                        new_obj.caption_id = obj.caption_id;
                                                    }
                                                    
                                                    new_data.push(new_obj);
                                                    
                                                });
                                                cpy.data = new_data;
                                                insta_locations_grams.insert(cpy);
                                            }else{
                                                console.log('problem with request result...');
                                            }
                                            // so this inserts things .. new record for each user need to do a 'does this exist check' first... probably...
                                        });
                                        locations_result.push(arr.id);
                                    
                                    }
                                    
                                 });
                                // updated associated post with list of location ID's as organized via instagram api (not the mongo id)
                                 if(locations_result.length > 0){
                                     insta_grams.update({_id:postId},
                                        {"$set" :{
                                             locations : locations_result}
                                        }
                                     );
                                }
                                // return from local database ???
                                return locations_result;
                            }
                       // set the interval if not already set ? 
                           }
                       else{
                            console.log('problem with request');
                            console.log(request);
                       }
                   }catch(e){
                    console.log('prob with locations_search call');
                    console.log(e);
                   }
                   
                }else{
                    console.log('not enough data?');
                    return locations_check.locations;
                }
               }
            else
                return {error:'Access token required for user_self'};
            
        }
     ,
     locations_media_recent : function(access_token,locationId){
             if(typeof access_token != 'undefined' && typeof locationId != 'undefined'){
                var base_url = 'https://api.instagram.com/v1/locations/' + locationId + '/media/recent?access_token=' + access_token;
               
               try{
                    var request = HTTP.get(base_url);
                    if(request.statusCode === 200 && typeof request.data != 'undefined'){
                        return request.data;
               
                    }
               }catch(e){
                  console.log('prob with locations_meda_recent call');
                console.log(e);
               }
               
            }
     },
     user_self : function(access_token,client_id,count,min_id,max_id){
        // do a check to determine if access_token matches value that could be stored for client id instead
        // of continually logging in/out....
            if(typeof access_token != 'undefined' && typeof client_id != 'undefined'){
                var base_url = 'https://api.instagram.com/v1/users/self/feed?access_token=' + access_token;
                try{
                    var request = HTTP.get(base_url);
                    if(request.statusCode === 200 && typeof request.data != 'undefined'){
                        if(typeof request.data.data != 'undefined'){
                            // filter data
                            var result = [];
                            if(typeof request.data.pagination.next_url != 'undefined')
                            Meteor.call('user_self_backlog',request.data.pagination.next_url,client_id,
                                function(error,result){
                                    if (result){
                                        return true;
                                    }
                                    else if(typeof error != undefined)
                                        console.log(error);
                                }
                            );
                            request.data.data.filter(function(arr){
                                Meteor.call('instaInsert',client_id,arr);
                            });
                            return true;
                   
                        }else{
                            return request.data;
                        }
                   // set the interval if not already set ? 
                       }
                   else{
                        console.log('problem with request');
                        console.log(request);
                   }
               }catch(e){
                console.log('prob with user_self call');
                console.log(e);
               }
               }
            else
                return {error:'Access token required for user_self'};
            
        },
     user_self_backlog : function(url,userId){
     // especially helpful if we have the pagination url
        // this is for the filter functions that often forget what the user is for
        if(typeof userId != 'undefined'){
            insertUserId = userId;
        }else{
            insertUserId = undefined;
        }
        try{
            var request = HTTP.get(url);
            if(request.statusCode === 200 && typeof request.data != 'undefined'){
                if(typeof request.data.data != 'undefined'){
                // filter data
                    var result = [];
                    if(typeof request.data.pagination.next_url != 'undefined'){
                        // wait a bit to not overwhelm server...
                        Meteor.call('user_self_backlog',request.data.pagination.next_url,userId);
                    }
                   
                    request.data.data.filter(function(arr){
                        Meteor.call('instaInsert',userId,arr);
                    });
                    return true;
           
                }else{
                console.log('returning request data');
                    return request.data;
                }
           // set the interval if not already set ? 
               }
           else{
                console.log('problem with request');
                console.log(request);
               return true;
           
           }
        }catch(e){
            console.log('error');
            console.log(e);
            // just return true to help out with program flow...
            return true;
        }
        }
    }
   );