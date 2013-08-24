Meteor.publish("userInstaGrams",function(){
    return insta_grams.find({owner:this.userId});
    
});
Meteor.publish("usersGroupCodes",function(){
    return users_group_codes.find({owner:Meteor.userId()},{});
});




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
            this.unblock();
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
                console.log(base_url);
                this.unblock();
                var request = HTTP.get(base_url);
                if(request.statusCode === 200 && typeof request.data != 'undefined'){
               
                    console.log(request);
               
                    if(typeof request.data.data != 'undefined'){
                        return request.data.data;
               
                    }else{
                        return request.data;
                    }
                   }
               else{
                    console.log('problem with request');
                    console.log(request);
               
               }
               }
            else
                return {error:'Access token required for user_self'};
            
        }
    
    }
   );
