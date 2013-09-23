Meteor.publish("userInstaGrams",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return insta_grams.find({owner:userId},{id:1,caption:1,likes:1,lat:1,lon:1,tags:1,link:1,username:1,image_low:1,image_thumb:1,caption_id:1,created_time:1,last_hit:1});
    }
    else
        return false;
});

Meteor.publish("allLocations",function(){
// eventually use geojson to only get locations near by? automagically ... ?
    return insta_locations.find({},{});
});

Meteor.publish("locationsPosts",function(){
// eventually use geojson to only get locations near by? automagically ... ?
    //console.log(this.added("insta_locations_grams"));
    return insta_locations_grams.find({},{});
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
     request_auth_code : function(code){
        
        var settings = Meteor.settings;
        if(typeof settings.client_id !== 'undefined'){
            var client_id = settings.client_id;
            var client_secret = settings.secret;
            var redirect_uri = settings.redirect_uri;
        
            var base_url = 'https://api.instagram.com/oauth/access_token';
            // does NOT like the slashes....
            var url_params = { params:{
                'client_id' : client_id,
                'client_secret' : client_secret,
                'grant_type' : 'authorization_code',
                'redirect_uri' : redirect_uri,
                'code' : code}}

            var request = HTTP.get(base_url,url_params,function(error,result){if(result) return result;});

            }else{
                console.log('Could not initalize settings, was meteor deployed with --settings deploy_settings.json');
            }
        return false;
    },
     locations_search : function(access_token,lat,lng,postId){
            if(typeof access_token != 'undefined' && typeof lat != 'undefined' && typeof lng != 'undefined' && typeof postId != 'undefined'){
                  //  console.log('search');
                // query server side database for cooards? this is kinda weird way to store data sets... data will be repeated incessantly...
                // shall i round lat and lng ?
                var locations_check = insta_grams.findOne({_id : postId, locations: {"$exists":true}},{locations:1});
                console.log(locations_check);
                if(typeof locations_check == 'undefined'){
                    console.log('undefined2');
                    var base_url = 'https://api.instagram.com/v1/locations/search?lat='+lat+'&distance=1&lng='+lng+'&access_token=' + access_token;
                   console.log(base_url);
                    try{
                        var request = HTTP.get(base_url);
                        if(request.statusCode === 200 && typeof request.data != 'undefined'){
                            if(typeof request.data.data != 'undefined'){
                                // filter data
                                //console.log(request.data);
                                var locations_result = [];
                                 request.data.data.filter(function(arr){
                                    arr.id = parseInt(arr.id);
                                    locations_result.push(insta_locations.insert(arr));
                                    Meteor.call("locations_media_recent",access_token,arr.id,function(error,result){
                                        result.id = parseInt(arr.id);
                                        console.log(insta_locations_grams.insert(result));
                                    });
                                    // take arr and begin lookup and store that insta_locations_posts ?
                                    
                                 });
                                  console.log(locations_result);
                                 console.log(insta_grams.update(postId,
                                    {"$set" :{
                                         locations : locations_result}
                                    }
                                 ));
                                // return from local database ???
                                
                                return request.data.data;
                                //return true;
                       
                            }else{
               
                                    console.log('should not be happening');
                                  console.log(insta_grams.update(postId,
                                    {"$set" :{
                                         locations : request.data}
                                    }
                                 ));
               
                                console.log(request.data);
                                return request.data;
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