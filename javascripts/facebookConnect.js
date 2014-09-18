//facebook connect
var fb = {
  config :{
  // CONFIG VARS: 

    app_id : '651451488214484', 

    use_xfbml : true,

    extendPermissions : 'publish_stream,create_event,read_friendlists,email' , 
    // info: http://developers.facebook.com/docs/reference/api/permissions/

    locale : 'es_ES' 
    // all locales in: http://www.facebook.com/translations/FacebookLocales.xml

  // END CONFIG VARS
  },
  perms : [],
  hasPerm : function (perm) { for(var i=0, l=fb.perms.length; i<l; i++) { if(fb.perms[i] == perm) {return true;}} return false; },
  logged : false,
  user : false, // when login, is a user object: http://developers.facebook.com/docs/reference/api/user
  login : function (callback){
    FB.login(function(r) {
      
      if (r.status == 'connected') {
      	var access_token = FB.getAuthResponse()['accessToken'];
      	alert(access_token);
        FB.api('/me/permissions',function(perm){
          fb.logged = true;
		  fb.perms = [];
		  for(i in perm.data[0])
		  {
			if (perm.data[0][i] == 1)
			{
				fb.perms.push(i);
			}
		  }
        });	   
		fb.getUser(callback);
      } else {
        fb.logged = false;
        fb.perms = [];
		callback();
      }
    },{scope:fb.config.extendPermissions});
    return false;
  },
  syncLogin : function (callback){
    if (!callback) callback = function(){};
    FB.getLoginStatus(function(r) {
      if (r.status == 'connected' ) { 
        FB.api('/me/permissions',function(perm){
          fb.logged = true;
		  fb.perms = [];
		  for(i in perm.data[0])
		  {
			if (perm.data[0][i] == 1)
			{
				fb.perms.push(i);
			}
		  }
        });	   
        fb.getUser(callback);
        return true;
      } else {
        fb.logged = false;
        callback();
        return false;
      }
    });
  },
  logout : function(callback) {FB.logout(callback);},
  getUser : function(callback){
    FB.api('/me', function(r){
      var user = r;
      user.picture = "https://graph.facebook.com/"+user.id+"/picture";
      fb.user=user; callback(user); 
    }); 
  },
  getFriendList : function(){
		//get array of friends
		    FB.api('/me/friends', function(response) {
		        console.log(response);
		        var divContainer=$('#facebook-friends');
		        for(i=0;i<4;i++)//for(i=0;i<response.data.length;i++)
		            {
		                $(document.createElement("img")).attr({ src: 'https://graph.facebook.com/'+response.data[i].id+'/picture', title: response.data[i].name ,onClick:'alert("You poked "+this.title);'})
		                .appendTo(divContainer);
		            }
		    }); 
		  },
  publish : function (publishObj,callback,noReTry,url) {
  // publishObj: http://developers.facebook.com/docs/reference/api/post   
    if (fb.logged && fb.hasPerm('publish_stream'))
    { 
      FB.api(url, 'post', publishObj, function(response) {
      if (!response || response.error) {
        callback(false, response);
      } else {
        callback(true, response);
      }
      });
      return true;
    }
    else
    { 
      if (!noReTry)
      	return fb.login(function() { return fb.publish(publishObj,callback,1)});
      else
      {
        callback(false, null);
        return false;
      }
    }
  },
  readyFuncs : [],
  ready: function(func){fb.readyFuncs.push(func)},
  launchReadyFuncs : function () {for(var i=0,l=fb.readyFuncs.length;i<l;i++){fb.readyFuncs[i]();};}
}
// Funcion para logarse con Facebook.
	function login() {
	  fb.login(function(data){ 
	    if (fb.logged) {
		   
	    } else {
	      alert("No se pudo identificar al usuario");
	    }
	  });
	};

	// Funcion para publicar un mensaje en tu muro
	function publish () {
	    fb.publish({
	      message : "Probando la vaquita",
	      picture : "http://blog.ikhuerta.com/wp-content/themes/ikhuerta3/images/ikhuerta.jpg",
	      link : "http://blog.ikhuerta.com/simple-facebook-graph-javascript-sdk",
	      name : "Simple Facebook Graph Javascript SDK",
	      description : "Facebook Graph es una nueva forma de conectar tu web Facebook. Con este script es muy fácil conseguirlo :)"
	    },function(published){ 
	      if (published)
	       alert("publicado!");
	      else
	       alert("No publicado :(, seguramente porque no estas identificado o no diste permisos");
	    }, false, 'me/feed');  
	}

	function createEvent() {
	    fb.publish({
	      privacy_type : "SECRET",
	      name : "Hagamos una vaquita",
	      start_time : "2013-05-31T00:52:01+0000",
	      description : $("#description").val()
	    },function(published, response){ 
	      if (published){
	       	alert("publicado!");
	       	FB.api('/'+response.id+'/invited?users=1089675556', 'post', null, null);
	       }
	      else
	       alert("No publicado :(, seguramente porque no estas identificado o no diste permisos");
	    }, false, 'me/events');  
}
