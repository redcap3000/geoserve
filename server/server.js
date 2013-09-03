Meteor.publish("userInstaGrams",function(userId){
    console.log(this.userId);
    if(this.userId != null){
        console.log(insta_grams.find({owner:userId}));
        return insta_grams.find({owner:this.userId});
    }
    else
        return false;
        
});
//


    instaFilter =
    function(arr){
        if(arr.location != null){
            var the_owner = this.userId;
            if(the_owner == null || !the_owner){
                the_owner = Meteor.userId();
                
            }
    // this is checking if insta_grams is present client/side so it gets reinserted! wait for the insta_grams collection to be ready?
            var existing_check = insta_grams.findOne({id:arr.id,owner:this.userId});
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
            
            if(typeof insertUserId != 'undefined')
                r.owner = insertUserId;
            else if(Meteor.userId())
            // owner saved as null WTF?
                r.owner = Meteor.userId();
            else if(this.userId)
                r.owner = this.userId;
            if(typeof r.owner != 'undefined' && r.owner != null){
                console.log(insta_grams.insert(r));
            }else{
                console.log('no owner for record!!');
            }
        }
        }

    };

// should allow to filter nearly any response from instaGram and store it ...? hope scopes are ok for this !


// basic function that determines if the user can edit
Meteor.methods({

           
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
                'code' : code
            
            }};
//            this.unblock();
            var request = HTTP.get(base_url,url_params,function(error,result){if(result) return result;});
            
            /*
            var request = Meteor.http.post(base_url,url_params,function(error,result){
                        if(result){
                            return result;
                        }
            });                */

            }else{
                console.log('Could not initalize settings, was meteor deployed with --settings deploy_settings.json');
            }
        return false;
    },
    
     user_self : function(access_token,count,min_id,max_id){
            if(typeof access_token != 'undefined'){
                var base_url = 'https://api.instagram.com/v1/users/self/feed?access_token=' + access_token;
               
                try{
               
//                    this.unblock();
                    var request = HTTP.get(base_url);
                    if(request.statusCode === 200 && typeof request.data != 'undefined'){
                        if(typeof request.data.data != 'undefined'){
                            // filter data
                            var result = [];
                            if(typeof request.data.pagination.next_url != 'undefined')
                            Meteor.call('user_self_backlog',request.data.pagination.next_url,
                                function(error,result){
                                    if (result){
                                        //console.log(result.pagination);
                                        console.log('success');
                                  
                                    }
                                    else if(typeof error != undefined)
                                        console.log(error);
                                }
                            );
                            request.data.data.filter(function(arr){
        if(arr.location != null){

    // this is checking if insta_grams is present client/side so it gets reinserted! wait for the insta_grams collection to be ready?
            var existing_check = insta_grams.findOne({id:arr.id,owner:Meteor.userId()});
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
            
            if(typeof insertUserId != 'undefined')
                r.owner = insertUserId;
            else if(Meteor.userId())
            // owner saved as null WTF?
                r.owner = Meteor.userId();
            else if(this.userId)
                r.owner = this.userId;
            if(typeof r.owner != 'undefined' && r.owner != null){
                console.log(insta_grams.insert(r));
            }else{
                console.log('no owner for record!!');
            }
        }
        }

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
//        this.unblock();
        // this is for the filter functions that often forget what the user is for
        // async calls... probably bug meteor about this?
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
                                console.log('recursing');
                        Meteor.call('user_self_backlog',request.data.pagination.next_url,Meteor.userId());
                    }
                   
                    request.data.data.filter(function(arr){
        console.log('insta filter');
        console.log(this.userId);
        console.log(Meteor.userId());
        if(arr.location != null){
        
    // this is checking if insta_grams is present client/side so it gets reinserted! wait for the insta_grams collection to be ready?
            var existing_check = insta_grams.findOne({id:arr.id,owner:Meteor.userId()});
        if(existing_check){
        
        
            if(arr.likes != null && existing_check.likes != arr.likes.count){
                insta_grams.update(existing_check._id,{"$set" :{ likes : arr.likes.count}});
            }
        }else{

            console.log(arr.id);
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
            
            if(typeof insertUserId != 'undefined')
                r.owner = insertUserId;
            else if(Meteor.userId())
            // owner saved as null WTF?
                r.owner = Meteor.userId();
            else if(this.userId)
                r.owner = this.userId;
            if(typeof r.owner != 'undefined' && r.owner != null){
                console.log(insta_grams.insert(r));
            }else{
                console.log('no owner for record!!');
            }
        }
        }

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