Meteor.publish("userInstaGrams",function(userId){
    if(typeof userId != "undefined" && userId != null){
        console.log(userId);
        return insta_grams.find({owner:userId});
    }
    else
        return false;
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