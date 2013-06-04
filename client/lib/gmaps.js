/* BEGIN GMAPS
 *
 *
 */

 
window.google = window.google || {};
google.maps = google.maps || {};
(function() {
  
  function getScript(src) {
    document.write('<' + 'script src="' + src + '"' +
                   ' type="text/javascript"><' + '/script>');
  }
  
  var modules = google.maps.modules = {};
  google.maps.__gjsload__ = function(name, text) {
    modules[name] = text;
  };
  
  google.maps.Load = function(apiLoad) {
    delete google.maps.Load;
    apiLoad([0.009999999776482582,[[["https://mts0.googleapis.com/vt?lyrs=m@218000000\u0026src=api\u0026hl=en-US\u0026","https://mts1.googleapis.com/vt?lyrs=m@218000000\u0026src=api\u0026hl=en-US\u0026"],null,null,null,null,"m@218000000"],[["https://khms0.googleapis.com/kh?v=130\u0026hl=en-US\u0026","https://khms1.googleapis.com/kh?v=130\u0026hl=en-US\u0026"],null,null,null,1,"130"],[["https://mts0.googleapis.com/vt?lyrs=h@218000000\u0026src=api\u0026hl=en-US\u0026","https://mts1.googleapis.com/vt?lyrs=h@218000000\u0026src=api\u0026hl=en-US\u0026"],null,null,"imgtp=png32\u0026",null,"h@218000000"],[["https://mts0.googleapis.com/vt?lyrs=t@131,r@218000000\u0026src=api\u0026hl=en-US\u0026","https://mts1.googleapis.com/vt?lyrs=t@131,r@218000000\u0026src=api\u0026hl=en-US\u0026"],null,null,null,null,"t@131,r@218000000"],null,null,[["https://cbks0.googleapis.com/cbk?","https://cbks1.googleapis.com/cbk?"]],[["https://khms0.googleapis.com/kh?v=76\u0026hl=en-US\u0026","https://khms1.googleapis.com/kh?v=76\u0026hl=en-US\u0026"],null,null,null,null,"76"],[["https://mts0.googleapis.com/mapslt?hl=en-US\u0026","https://mts1.googleapis.com/mapslt?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt/ft?hl=en-US\u0026","https://mts1.googleapis.com/mapslt/ft?hl=en-US\u0026"]],[["https://mts0.googleapis.com/vt?hl=en-US\u0026","https://mts1.googleapis.com/vt?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt/loom?hl=en-US\u0026","https://mts1.googleapis.com/mapslt/loom?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt?hl=en-US\u0026","https://mts1.googleapis.com/mapslt?hl=en-US\u0026"]],[["https://mts0.googleapis.com/mapslt/ft?hl=en-US\u0026","https://mts1.googleapis.com/mapslt/ft?hl=en-US\u0026"]]],["en-US","US",null,0,null,null,"https://maps.gstatic.com/mapfiles/","https://csi.gstatic.com","https://maps.googleapis.com","https://maps.googleapis.com"],["https://maps.gstatic.com/intl/en_us/mapfiles/api-3/13/2","3.13.2"],[348155197],1.0,null,null,null,null,1,"",null,null,1,"https://khms.googleapis.com/mz?v=130\u0026",null,"https://earthbuilder.googleapis.com","https://earthbuilder.googleapis.com",null,"https://mts.googleapis.com/vt/icon"], loadScriptTime);
  };
  var loadScriptTime = (new Date).getTime();
  getScript("/main.js");
})();
 
     lookForMarkers = function(theBox){
        c = markers.find({}, {fields: {_id: 1}}).fetch();
        if(c.length > 0)
            for(var i=0;i<c.length;i++){
                var arr= c[i];
                if(typeof arr['loc'] != 'undefined'){
                    var co = new google.maps.LatLng(arr['loc'][0], arr['loc'][1]), marker_type = '';
                    if(arr['type'] == 'Shelter' || arr['type'] == 'Hospital' || arr['type'] == 'Other' || arr['type'] == 'Pharmacy')
                    // default
                        marker_type = arr['type'];
                    else
                        marker_type = undefined;
                    placeNavMarker(co,marker_type,function(){alert(arr['name'] + ' ' + arr['type']);});
                }
            }
    };

    createMap = function(latLng) {
        var mapOptions = {
            disableDoubleClick: true,
            streetViewControl: false,
            scrollwheel: false,
            zoom: 15,
            center: latLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    };

    placeNavMarker = function(latLng,image,clickCallBack) {
        if(typeof image == 'undefined')
            var image = "Other.png";
        else if(typeof image == 'string')
        // dont show this marker for the geocoded location
            var image = image + ".png";
        else
            var image = "http://gmaps-samples.googlecode.com/svn/trunk/markers/blue/blank.png";
        // this map is not always there>>>?
        var new_marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: image
            });
        if(typeof clickCallBack == 'function')
            google.maps.event.addListener(new_marker,"click",clickCallBack);
    };
    
/*
 *
 * END GMAPS
 *
 */