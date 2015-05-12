var s_ajaxListener = new Object();
s_ajaxListener.tempOpen = XMLHttpRequest.prototype.open;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.send;
s_ajaxListener.callback = function () {
	// this.method :the ajax method used
	// this.url    :the url of the requested script (including query string, if any) (urlencoded)
	// this.data   :the data sent, if any ex: foo=bar&a=b (urlencoded)
	
	//alert(this.url + ' ' + this.data);
	console.log(this.url);
}

XMLHttpRequest.prototype.open = function(a,b) {
	if (!a) var a='';
	if (!b) var b='';
	s_ajaxListener.tempOpen.apply(this, arguments);
	s_ajaxListener.method = a;
	s_ajaxListener.url = b;
	if (a.toLowerCase() == 'get') {
		s_ajaxListener.data = b.split('?');
		s_ajaxListener.data = s_ajaxListener.data[1];
	}
}

XMLHttpRequest.prototype.send = function(a,b) {
	if (!a) var a='';
	if (!b) var b='';
	s_ajaxListener.tempSend.apply(this, arguments);
	if(s_ajaxListener.method.toLowerCase() == 'post')s_ajaxListener.data = a;
	s_ajaxListener.callback();
}




window.onerror = function(message, url, lineNumber) {
	//console.log("Error: "+message+" in "+url+" at line "+lineNumber);
	alert("Error: "+message+" in "+url+" at line "+lineNumber);
	
}
















pagesTracker = [];
pagesTracker.push('main_page');
var pushNotification;
getUsersRequest = '';
checkNewMessagesRequest = '';
newMessages = '';



var app = { 
	
	pictureSource : '',
	destinationType : '',
	encodingType : '',	
	backPage : '',
	currentPageId : '',
	currentPageWrapper : '',
	recentScrollPos : '',
	
	action : '',
	requestUrl : '',
	requestMethod : '',
	response : '',
	responseItemsNumber : '',
	pageNumber : '',
	itemsPerPage : 30,
	container : '', 
	template : '',
	statAction : '',
	searchFuncsMainCall: '',
	sort: '',
	
	
	profileGroupTemplate : '',
	profileLineTemplate : '',
	profileLineTemplate2 : '',
	
	userId : '',
	gcmDeviceId : '',
	imageId : '',
	positionSaved : false,
	logged: false,
	exit: false,
	
	EULA: false,
	gallery: false,

	
		
	init: function(){
		
		//navigator.splashscreen.hide();	
		//navigator.splashscreen.show();
		
		//FullScreenImage.showImageURL('images/login_form_bg.jpg','images/login_form_bg1.jpg');
		//window.open('
		//return;
		
		//app.photoSwipe();
		//return;
		
		app.ajaxSetup();		
		app.pictureSource = navigator.camera.PictureSourceType;
		app.destinationType = navigator.camera.DestinationType;
		app.encodingType = navigator.camera.EncodingType;
		$('#mainContainer').css({'height':$('#mainContainer').css('min-height')+' !important'});
		
		if(window.localStorage.getItem('EULA') == "accepted"){
			app.EULA = true;
		}
		
		app.chooseMainPage();

		
		
		//$('#header').css({'height':$(window).height()*0.12+'px !important'});
		//$('.appPage').css({'padding-top':parseInt($(window).height()*0.12)+'px !important'});
		//$('.appPage .ui-content').css({'padding-top':parseInt($(window).height()*0.02)+'px !important'});
	},
	

	ajaxSetup: function(){
		
		$.ajaxSetup({
			dataType: 'json',
			type: 'Get',
			timeout: 50000,
			beforeSend: function(xhr){
					
				var user = window.localStorage.getItem("user");
				var pass = window.localStorage.getItem("pass");
				
				if(user == '' && pass == ''){
					user = 'nouser';
					pass = 'nopass';
				}
					
				console.log(user);
				console.log(pass);
					
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );
			},
			statusCode:{
				
				403: function(response, textStatus, xhr){
					app.stopLoading();
					app.showPage('login_page');
					//document.removeEventListener("backbutton", app.back, false);
					//app.printUsers();
					
					if(app.exit===false){
						app.alert('הכנסת מידע שגוי, אנא נסה שנית');
					}
					
				}
		
			},
			
			error: function(response, textStatus, errorThrown){
				app.stopLoading();				
				//alert(response.status + ':' + errorThrown );
			},
			
			complete: function(response, status, jqXHR){
				//alert(response.status);
				app.stopLoading();
			},
		});		
	},
	
	alert: function(message){
		navigator.notification.alert(
			message,
			function(){},
			'Notification',
			'Ok'
		);
	},
	
	logout:function(){
		
		$(window).unbind('scroll');
		clearTimeout(newMessages);
		app.startLoading();
		
		pagesTracker = [];
		pagesTracker.push('login_page');
		app.exit = true;
		
		
		if(checkNewMessagesRequest != ''){
			checkNewMessagesRequest.abort();
			console.log("Abort checkNewMessagesRequest");
		}
		
		if(getUsersRequest != ''){
			getUsersRequest.abort();
			console.log("Abort getUsersRequest");
		}
		
		$.ajax({				
			url: 'http://m.gobaby.co.il/api/v2/user/logout',			
			success: function(data, status){	
				//alert(JSON.stringify(data));
				if(data.logout == 1){					
					app.logged = false;	
					//$('#top_right_buttons').css({'display':'table'});
					app.positionSaved = false;
					window.localStorage.setItem("userId", "");
					window.localStorage.setItem("user", "");
					window.localStorage.setItem("pass", "");
					app.UIHandler();
					app.ajaxSetup();
					app.stopLoading();
				}				
			}
		});
	},
	
	UIHandler: function(){
		
		//document.removeEventListener("backbutton", app.back, false);
		
		if(app.logged === false){
			var userInput = decodeURIComponent( escape(window.localStorage.getItem("userInput")) );
			if(userInput != 'null')
				$('.user_input').find('input').val(userInput);
			
			$('.appPage').hide();
			$('.new_mes').hide();
			$("#login_page").show();  
			$('#back').hide();
			$('#logout').hide();
			$('#contact').hide();
			$('#sign_up').show();
			//app.printUsers();
			app.currentPageId = 'login_page';
			app.currentPageWrapper = $('#'+app.currentPageId);
		}
		else{
			$('.appPage').hide();
			$("#main_page").show();					
			$('#back').hide();
			$('#logout').show();
			$('#sign_up').hide();
			//$('#contact').show();								 
			app.currentPageId = 'main_page';
			app.currentPageWrapper = $('#'+app.currentPageId);
			
		}
	},
	
	loggedUserInit: function(){
		app.searchFuncsMainCall = true;		
		app.setBannerDestination();
		app.checkNewMessages();					
		//app.pushNotificationInit();
		app.sendUserPosition();
	},
	
	startLoading: function(){
		$('.loading').show();
	},
	
	stopLoading: function(){
		$('.loading').hide();
	},
	
	chooseMainPage: function(){
		
		pagesTracker = [];
		pagesTracker.push('main_page');
		app.startLoading();
		
		
		console.log(app.EULA);
		
		if(app.EULA === false){
			app.showPage('EULA_page');
			$('#back').hide();
			app.stopLoading();
			return;
		}
	
		$.ajax({ 
			url: 'http://m.gobaby.co.il/api/v2/user/login',
			error: function(response){				
				//alert(JSON.stringify(response));
			},
			statusCode:{
				403: function(response, status, xhr){
					app.logged = false;
					app.UIHandler();
				}
			},
			success: function(data, status){
				if(data.userId > 0){
			        app.logged = true;
					window.localStorage.setItem("userId", data.userId);
					app.UIHandler();
					app.loggedUserInit();
					$(window).unbind("scroll");
					window.scrollTo(0, 0);
				}		
			}
		});		
	},
	
	acceptEULA: function(accept){
	
		if(accept === true){
			window.localStorage.setItem("EULA", "accepted");
			app.EULA = true;
			app.chooseMainPage();
		}
	},
	
	setBannerDestination: function(){
		$.ajax({				
			url: 'http://m.gobaby.co.il/api/v2/user/banner',			
			success: function(response, status){
				app.response = response;
				//alert(JSON.stringify(app.response));   
				$('#bannerLink').attr("onclick",app.response.banner.func);
				if(app.response.banner.src!==''){
					$('#why_subscr').find('.ui-btn').hide();
					if($('#bannerLink').find("img").size()===0)
						$('#why_subscr').append('<img src="'+app.response.banner.src+'" />');
					else{
						$('#bannerLink').find("img").attr("src",app.response.banner.src);
						$('#bannerLink').find("img").show();
					}
				}else{
					$('#bannerLink').find("img").hide();
					$('#why_subscr').find('.ui-btn').show();
				}
			}
		});
	},
	
	
	
	sendAuthData: function(){		
		var user = $("#authForm .email").val(); 
		var pass = $("#authForm .password").val();
		app.exit = false;
		
		user = unescape(encodeURIComponent(user));
		pass = unescape(encodeURIComponent(pass));
		
		window.localStorage.setItem("user",user);
		window.localStorage.setItem("pass",pass);
		
		$.ajax({				
			url: 'http://m.gobaby.co.il/api/v2/user/login',			
			beforeSend: function(xhr){
				user = window.localStorage.getItem("user");
				pass = window.localStorage.getItem("pass");
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );				
			},
			success: function(data, status){				
				if(data.userId > 0){	
					app.logged = true;	
					app.ajaxSetup();
					app.showPage('main_page');	
					$('#logout').show();
					window.localStorage.setItem("userId", data.userId);	
					window.localStorage.setItem("userInput", user);
					app.loggedUserInit();					
				}
			}
		});
	},
	
	sendUserPosition: function(){		
		if(app.positionSaved === false){			
			navigator.geolocation.getCurrentPosition(app.persistUserPosition, app.userPositionError);
		}
	},
	
	persistUserPosition: function(position){		
		var data = {
			longitude: position.coords.longitude,
			latitude: position.coords.latitude
		};
			
		//alert(JSON.stringify(data));
		//return;
		
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/user/location',
			type: 'Post',
			data:JSON.stringify(data),
			success: function(response){
				app.response = response;
				app.positionSaved = app.response.result;			
			}
		});
	},
	
	userPositionError: function(error){
		/*
		alert('code: '    + error.code    + '\n' +
	          'message: ' + error.message + '\n'
		);
		 */
	},
	
	printUsers: function(){
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/users/recently_visited/2',
			success: function(data, status){
				for ( var i = 0; i < data.users.length; i++) {
					$("#udp_"+i).find(".user_photo_wrap .user_photo").attr("src",data.users[i].mainImage);
					$("#udp_"+i).find("span").text(data.users[i].nickName);
					$("#udp_"+i).find(".address").text(data.users[i].city);
				}				
				//$(".user_data_preview").slideToggle("slow");
				$(".user_data_preview").show();			
			}
		});
	},
	
	contact: function(){		
		//window.location.href = 'http://dating4disabled.com/contact.asp';		
	},
		
	pushNotificationInit: function(){

		try{ 
        	pushNotification = window.plugins.pushNotification;
        	if (device.platform == 'android' || device.platform == 'Android') {
				//alert('registering android'); 
            	pushNotification.register(app.regSuccessGCM, app.regErrorGCM, {"senderID":"48205136182","ecb":"app.onNotificationGCM"});		// required!
            	
			}
        }
		catch(err){ 
			txt="There was an error on this page.\n\n"; 
			txt+="Error description: " + err.message + "\n\n"; 
			alert(txt); 
		} 
		
	},	
	
	// handle GCM notifications for Android
    onNotificationGCM: function(e) {    	
    	//alert(1);   
    	//console.log('EVENT -> RECEIVED:' + e.event);        
        switch( e.event ){
            case 'registered':            
            	//alert("registered");
			if ( e.regid.length > 0 ){
				// Your GCM push server needs to know the regID before it can push to this device
				// here is where you might want to send it the regID for later use.
				//alert("REGISTERED -> REGID:" + e.regid);
				
				app.gcmDeviceId = e.regid;
				app.persistGcmDeviceId();
			}
            break;
            
            
            case 'message':
            	// if this flag is set, this notification happened while we were in the foreground.
            	// you might want to play a sound to get the user's attention, throw up a dialog, etc.
            	if (e.foreground){
					// if the notification contains a soundname, play it.
					//var my_media = new Media("/android_asset/www/"+e.soundname);
					//my_media.play();
            		
            		if(app.currentPageId == 'messenger_page'){
            			app.getMessenger();            			
            		}
            		
            		
            		app.checkNewMessages();
            		
				}
				else
				{	// otherwise we were launched because the user touched a notification in the notification tray.
					
					if (e.coldstart){
						console.log('COLDSTART NOTIFICATION');
						app.getMessenger();
					}	
					else{
						console.log('--BACKGROUND NOTIFICATION--');
						app.getMessenger();
					}	
					
					//app.getMessenger();
				}					
            	//console.log('MESSAGE -> MSG: ' + e.payload.message);
            	//console.log('MESSAGE -> MSGCNT: ' + e.payload.msgcnt);            	
            	//alert(e.payload.message);
            	
            	  
            	
            	
            break;
            
            case 'error':
            	console.log('ERROR -> MSG:' + e.msg);
            break;
            
            default:
            	console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
        }
    },
    
    persistGcmDeviceId: function(){
    	$.ajax({				
			url: 'http://m.gobaby.co.il/api/v2/user/gcmDeviceId',
			type: 'Post',
			data: JSON.stringify({			
				gcmDeviceId: app.gcmDeviceId 
			}),
			success: function(data, status){				
				//alert(data.persisting);
			}
		});
    	
    },
    
    tokenHandler: function(result) {
        //console.log('success:'+ result);        
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
    },
	
    regSuccessGCM: function (result) {
    	//alert('success:'+ result);     
    },
    
    regErrorGCM: function (error) {
    	//alert('error:'+ error);        
    },
	
	back: function(){		
		
		//app.startLoading();
		$(window).unbind("scroll");
		window.scrollTo(0, 0);
		//alert(pagesTracker);
		pagesTracker.splice(pagesTracker.length-1,1);
		//alert(pagesTracker);
		var prevPage = pagesTracker[pagesTracker.length-1];		
		//alert(prevPage); 
		
		if(typeof prevPage == "undefined" || prevPage == "main_page" ||  prevPage == "login_page"){
			//$('#top_right_buttons').css({'display':'table'});
			//app.showPage('main_page');
			app.chooseMainPage();
		}else
			app.showPage(prevPage);
		
		if(app.currentPageId == 'users_list_page'){
			app.template = $('#userDataTemplate').html();
			window.scrollTo(0, app.recentScrollPos);
			app.setScrollEventHandler();
		}
		app.searchFuncsMainCall = true;
		app.stopLoading();
	},
	
	showPage: function(page){		
		app.currentPageId = page;
		app.currentPageWrapper = $('#'+app.currentPageId);
		app.container = app.currentPageWrapper.find('.content_wrap');
		if(pagesTracker.indexOf(app.currentPageId)!=-1){			
			pagesTracker.splice(pagesTracker.length-1,pagesTracker.indexOf(app.currentPageId));
			
		}
		if(pagesTracker.indexOf(app.currentPageId) == -1){
			pagesTracker.push(app.currentPageId);
		}		
		$('.appPage').hide();
		//alert('1');
		app.currentPageWrapper.show();		
		
		if(app.currentPageId == 'main_page'){
			$('#back').hide();
			$('#sign_up').hide();
			//$('#contact').show();			
		}
		else if(app.currentPageId == 'login_page'){
			//$('#top_right_buttons').css({'display':'table'});			
			$('#back').hide();
			$('#sign_up').show();
			//$('#contact').hide(); 
		}		
		else{
			//$('#top_right_buttons').css({'display':'block'});
			$('#back').show();
			$('#sign_up').hide();
			//$('#contact').hide();  
			//document.addEventListener("backbutton", app.back, false);
		}
		
		$(window).unbind("scroll");
		
	},
	
	sortByDistance: function(){
		app.sort = 'distance';		
		$('#sortByDistance').hide();
		$('#sortByEntranceTime').show();
		app.chooseSearchFunction();		
	},
	
	sortByEntranceTime: function(){
		app.sort = '';		
		$('#sortByEntranceTime').hide();
		$('#sortByDistance').show();		
		app.chooseSearchFunction();
	},
	
	chooseSearchFunction: function(){
		
		app.searchFuncsMainCall = false;
		
		if(app.action == 'getOnlineNow'){					
			app.getOnlineNow();			
		}			
		else if(app.action == 'getSearchResults'){
			app.search();
		}
		else if(app.action == 'getStatResults'){
			app.getStatUsers(app.statAction);
		}
	},
	
	getOnlineNow: function(){
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.append('<h1>תוצאות</h1><div class="dots"></div>');
		app.action = 'getOnlineNow';
		app.pageNumber = 1;
		app.getUsers();
	},
	
 
	getUsers: function(){
		
		if(app.pageNumber == 1){
			app.startLoading();
		}
		//alert(555);
		
		if(app.searchFuncsMainCall === true && app.positionSaved === true){
			$('#sortByEntranceTime').hide();			
			$('#sortByDistance').show();
			app.sort = '';
		}
		//alert(app.sort);
		if(app.action == 'getOnlineNow'){					
			app.requestUrl = 'http://m.gobaby.co.il/api/v2/users/online/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
			//alert(app.requestUrl);
		}	
		else if(app.action == 'getSearchResults'){
			//var countryCode = $('#countries_list').val();
			var region = $('.regionsList select').val();
			var ageFrom = $(".age_1 select").val();
			var ageTo = $(".age_2 select").val();			
			var nickName = $('.nickName').val();
			var userGender=$('.gen select').val();
			var sexPref='';
			$('.sexPreferenceList input:checked').each(function(){
				if(sexPref!='')sexPref+=',';
				sexPref+=$(this).val();
			});			
			
			app.requestUrl = 'http://m.gobaby.co.il/api/v2/users/search/region:'+region+'/age:'+ageFrom+'-'+ageTo+'/userGender:'+userGender+'/nickName:'+nickName+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sexPreference:'+sexPref+'/sort:'+app.sort;;
		}	
		else if(app.action == 'getStatResults'){					
			app.requestUrl = 'http://m.gobaby.co.il/api/v2/user/statistics/'+app.statAction+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}
		
		getUsersRequest = $.ajax({						
			url: app.requestUrl,
			timeout:10000,
			success: function(response, status){
				app.response = response;
				//alert(JSON.stringify(app.response));				
				app.displayUsers();
			}//,
			//error:function(err){
			//	alert(JSON.stringify(err));	
			//}
		});
	},	
	
	
	displayUsers: function() {
		//app.container.parent('div').append('<h1>תוצאות</h1>');
		
		console.log(JSON.stringify(app.response));
		
		for(var i in app.response.users.items){
			var currentTemplate = app.template; 
			var user = app.response.users.items[i];
			currentTemplate = currentTemplate.replace("[USERNICK]",user.nickName);
			currentTemplate = currentTemplate.replace("[AGE]",user.age);
			//currentTemplate = currentTemplate.replace("[COUNTRY]",user.country+',');
			currentTemplate = currentTemplate.replace("[CITY]",user.city);
			currentTemplate = currentTemplate.replace("[IMAGE]",user.mainImage);			
			currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,user.nickName);										
			currentTemplate = currentTemplate.replace("[USER_ID]", user.id);	
			//var aboutUser = '';
			//if(typeof(user.about) === 'string'){   
			//	if(user.about.length > 90){
			//		aboutUser = user.about.substring(0,90)+'...';
			//	}
			//	else{
			//		aboutUser = user.about;
			//	}
			//}
			
			if(user.about == null)
				user.about='';
			
			currentTemplate = currentTemplate.replace("[ABOUT]", user.about);			
			app.container.append(currentTemplate);			
			var currentUserNode = app.container.find(".user_data:last-child");			
			currentUserNode.find(".user_short_txt").attr("onclick","app.getUserProfile("+user.id+");");
			currentUserNode.find(".user_photo_wrap").attr("onclick","app.getUserProfile("+user.id+");");
			if(user.isNew == 1){						
				currentUserNode.find(".blue_star").show();
			}					
			if(user.isPaying == 1){						
				currentUserNode.find(".special3").show();
			}
			if(user.isOnline == 1){						
				currentUserNode.find(".on2").show();				
			}else{
				currentUserNode.find(".on").show();
			}
			if(user.id==window.localStorage.getItem("userId")){
				currentUserNode.find('.send_mes').hide();
			}
			if(user.distance != ""){						
				currentUserNode.find(".distance_value").show().find("span").html(user.distance);
			}			
		}
		//setTimeout(app.stopLoading(), 10000);
		//app.stopLoading();
		app.responseItemsNumber = app.response.users.itemsNumber;
		app.setScrollEventHandler();
	},	
	
		
	setScrollEventHandler: function(){
		$(window).scroll(function(){
						 
			var min=600;
			if($(this).width()>767)min=1250;
			app.recentScrollPos = $(this).scrollTop();
			if(app.recentScrollPos >= app.container.height()-min){						
				$(this).unbind("scroll");				
				if(app.responseItemsNumber == app.itemsPerPage){					
					app.pageNumber++;					
					app.getUsers();
				}
			}
		});
	},
	
	getMyProfileData: function(){		
		app.startLoading();
		$("#upload_image").click(function(){		
			$("#statistics").hide();
			//$("#uploadDiv").css({"background":"#fff"});
			$("#uploadDiv").show();
			
			$('#get_stat_div').show();
			$('#upload_image_div').hide();
		});
		$("#get_stat").click(function(){		
			$("#statistics").show();			
			$("#uploadDiv").hide();
			
			$('#get_stat_div').hide();
			$('#upload_image_div').show();			
		});	
		var userId = window.localStorage.getItem("userId");		
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/user/profile/'+userId,						
			success: function(user, status, xhr){
				//alert( JSON.stringify(user));
				app.showPage('my_profile_page');
				app.container = app.currentPageWrapper.find('.myProfileWrap');		
				app.container.find('.txt strong').html(user.nickName+', <span>'+user.age+'</span>');			
				app.container.find('.txt strong').siblings('span').text(user.city); 
				app.container.find('.txt').append(user.about);			
				app.container.find('.user_pic img').attr("src",user.mainImage);		
				if(user.isPaying==1){
					app.container.find(".special4").show();
				}				
				console.log(JSON.stringify(user));
				//return;
				var addedToFriends = user.statistics.fav;  
				var contactedYou = user.statistics.contactedme;
				var contacted = user.statistics.contacted;
				var addedToBlackList = user.statistics.black;
				var addedYouToFriends = user.statistics.favedme;
				var lookedMe = user.statistics.lookedme;
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(0).find(".stat_value").text(addedToFriends);    
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(1).find(".stat_value").text(contactedYou);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(2).find(".stat_value").text(contacted);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(1).find(".stat_value").text(addedToBlackList);
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(0).find(".stat_value").text(addedYouToFriends);				
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(2).find(".stat_value").text(lookedMe);
				app.stopLoading();				
			}
		});
	},	
	
	getStatUsers: function(statAction){		
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.pageNumber = 1;
		app.action = 'getStatResults';
		app.statAction = statAction;		
		app.getUsers();
	},
	
	recovery: function(){
		app.showPage('recovery_page');
		app.currentPageWrapper.find('#user').val('');
	},
	
	sendRecovery: function(){
		var mail = app.currentPageWrapper.find('#user').val();
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
        if (!(email_pattern.test(mail))) {
            alert('נא להזין כתובת דוא"ל חוקית');
            return false;
        }
        $.ajax({
        	url: 'http://m.gobaby.co.il/api/v2/recovery/'+mail,
        	success: function(response){
        		//alert(JSON.stringify(response));
        		if(!response.err)
        			app.currentPageWrapper.find('#user').val('');
        		alert(response.text);
        	},
        	error: function(err){
        		//alert(JSON.stringify(err));
        		app.currentPageWrapper.find('#user').val('');
				alert('סיסמה נשלחה לכתובת המייל שהזנת');
			}
        });
	},
	
	getSearchForm: function(){				
		app.startLoading();
		app.showPage('search_form_page');
		app.getRegions();
		app.getSexPreference();
		//$("#regions_wrap").hide();
		//app.getCountries();		
		var html = '<select>';
		for(var i = 18; i <= 80; i++){			
			html = html + '<option value="' + i + '"">' + i + '</option>';
		}		
		html = html + '</select>';		
		
		$(".age_1").html(html);				
		$(".age_1").trigger("create");
		
		var html = '<select>';
		var sel = '';
		for(var i = 19; i <= 80; i++){
			if(i == 40) sel = ' selected="selected"';
			else sel = '';
			html = html + '<option value="' + i + '"' + sel + '>' + i + '</option>';
		}
		html = html + '</select>';				
		$(".age_2").html(html);
		$(".age_2").trigger("create");
		app.stopLoading();
	},
		
	getSexPreference: function(){
		$.ajax({			
			url: 'http://m.gobaby.co.il/api/v2/list/sexPref',						
			success: function(list, status, xhr){							
			   
				//alert( JSON.stringify(list));
					
				if(app.currentPageId == 'register_page'){
					var html = '<select name="sexPrefId" id="sexPrefId">';
			        for(var i in list.items){
			            var item = list.items[i];
						html = html + '<option value="' + item[0]  + '">' + item[1] + '</option>';
			        }
					html = html + '</select>';
			   
					$(".sex_preference_list").html(html).trigger("create");
			   
				}else if(app.currentPageId == 'search_form_page'){
			        var html = '<fieldset data-role="controlgroup">';
					for(var i in list.items){
			            var item = list.items[i];
						html = html + '<input name="sexPrefId" type="checkbox" id="check-sex' + item[0]  + '" value="' + item[0]  + '"><label for="check-sex' + item[0]  + '">' + item[1] + '</label>';
			        }
			         html = html + '</fieldset>';
					$(".sexPreferenceList").html(html).trigger("create");
				}
			   
			   
				
			}
		
		});
	},
	
	injectCountries: function(html, container){
		container.html(html);
		container.trigger('create');
		container.find("option[value='US']").insertBefore(container.find("option:eq(0)"));
		container.find("option[value='CA']").insertBefore(container.find("option:eq(1)"));
		container.find("option[value='AU']").insertBefore(container.find("option:eq(2)"));
		container.find("option[value='GB']").insertBefore(container.find("option:eq(3)"));
		container.val(container.find("option:first").val()).selectmenu("refresh");
	},
	
	getRegions: function(){
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/list/regions',						
			success: function(list, status, xhr){							
				var html = '<select name="regionCode">';
				if(app.currentPageId == 'search_form_page'){
					html = html + '<option value="">לא חשוב</option>';
				}				
				app.container.find(".regionsList").html('');
				//app.container.find("#cities_wrap").hide();
				//app.container.find(".citiesList").html('');
				if(list.itemsNumber > 0){
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.itemId + '">' + item.itemName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".regionsList").html(html).trigger('create');				
					//app.container.find("#regions_wrap").show();
					/*
					if(app.currentPageId == 'register_page'){
						app.container.find('.regionsList select').change(function(){
							app.getCities(app.container.find("#countries_list").val(),$(this).val());
						});
					}
					*/	
				}
				else{
					var html = '<input type="text" name="cityName" id="cityName" />';
					app.container.find(".citiesList").html(html);
					app.container.find("#cities_wrap").show();
				}
				
			}
		});
	},
	/*
	getCities: function(countryCode,regionCode){
		$.ajax({
			url: 'http://m.shedate.co.il/api/v2/list/cities/'+countryCode+'/'+regionCode,						
			success: function(list, status, xhr){
				app.container.find("#cities_wrap").hide();				
				if(list.itemsNumber > 0){
					var html = '<select name="cityName">';
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.cityName + '">' + item.cityName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".citiesList").html(html).trigger('create');				
					app.container.find("#cities_wrap").show();				
				}
				else{
					if(countryCode != 'US'){   
						var html = '<input type="text" name="cityName" id="cityName" />';
						app.container.find(".citiesList").html(html);
						app.container.find("#cities_wrap").show();
					}
				}
			}
		});
	},
	*/
	
	sendRegData: function(){
		if(app.formIsValid()){
			app.startLoading();
			var data = JSON.stringify(
				$('#regForm').serializeObject()
			);
			$.ajax({
				url: 'http://m.gobaby.co.il/api/v2/user',
				type: 'Post',
				data: data,
				success: function(response){
					app.response = response;
					//alert( JSON.stringify(app.response));
					app.stopLoading();
					if(app.response.result > 0){
						var user = app.container.find("#userEmail").val(); 
						var pass = app.container.find("#userPass").val();						
						window.localStorage.setItem("user",user);
						window.localStorage.setItem("pass",pass);
						window.localStorage.setItem("userId", app.response.result);
						app.ajaxSetup(); 						
						app.getRegStep();
					}
					else{
						app.alert(app.response.err);
					}    
				}
			});
			
			
		}
		
	},	
		
	getRegStep: function(){
		//$('#test_test_page').show();
		app.showPage('upload_image_page');
		app.container.find('.regInfo').text('אתם רשאים כעת להעלות תמונה בפורמט JPEG לפרופיל שלכם');  // Also you may upload an image in your profile now.
		window.scrollTo(0,0);
		
	},
	
	formIsValid: function(){
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);		
		if (!(email_pattern.test($('#userEmail').val()))) {
			alert('דוא"ל שגוי');
			$('#userEmail').focus();
			return false;
		}
		/*if ($('#userEmail').val() != $('#userEmail2').val()) {
			alert("Error in retyped email");
			$('#userEmail2').focus();
			return false;
		}*/
		if ($('#userPass').val().length < 4 || $('#userPass').val().length > 12) {
			alert("סיסמה שגויה (אמור להיות 4-12 סימנים)");
			$('#userPass').focus();
			return false;
		}
		if ($('#userPass').val() != $('#userPass2').val()) {
			alert("טעות בסיסמה שנית");
			$('#userPass2').focus();
			return false;
		}
		
		if ($('#userNick').val().length < 3) {
			alert('כינוי שגוי (אמור להיות 3 סימנים לפחות)');
			//$('#userNic').focus();
			return false;
		}
		
		if($('#d').val().length == 0 || $('#m').val().length == 0 || $('#y').val().length == 0){
			alert('תאריך לידה שגוי');
			return false;
		}
		if($('#userCity').val().length == 0){
			alert('עיר שגויה');
			return false;
		}
		
		if($('#aboutMe').val().length < 10){
			alert('על עצמי שגוי (אמור להיות 10 סימנים לפחות)');
			return false;
		}
		
		if($('#lookingFor').val().length < 10){
			alert('מה אני מחפש/ת (אמור להיות 10 סימנים לפחות)');
			return false;
		}
		/*if($('#confirm option:selected').val() != "1"){
			alert('Please check confirmation box');
			return false;
		}*/
		
		
		
		
		
		
		return true;
	},
	
	search: function(pageNumber){
		app.showPage('users_list_page');		
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.html('');
		app.container.append('<h1>תוצאות</h1><div class="dots"></div>');
		app.pageNumber = 1;
		app.action = 'getSearchResults';
		app.getUsers();
	},
	
	getUserProfile: function(userId){
		
		if(getUsersRequest != ''){
			getUsersRequest.abort();
			console.log("Abort getUsersRequest");
			app.pageNumber--;
		}
		
		if(userId==window.localStorage.getItem("userId")){app.getMyProfileData(); return;}
		app.ajaxSetup();
		app.startLoading();	
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/user/profile/'+userId,
			type: 'Get',
			success: function(user, status, xhr){
				console.log( JSON.stringify(user));
				$('.my-gallery').html('');
			   
				app.showPage('user_profile_page');
			   

				window.scrollTo(0, 0);
				var detailsContainer = app.container.find('#user_details');
				app.container.find('#pic1, #pic2, #pic3').attr("src","");
			   
				app.container.find(".special3, .blue_star, .on5, .on1, .pic_wrap").hide();
				//app.container.find('.pic_wrap').addClass("left").removeClass("center");
				//app.container.find('#pic1').parent('a').addClass("fancybox");
				app.container.find("h1 span").text(user.nickName);
			   
			   
			   
  /*
			   if(user.mainImage.url == "http://m.gobaby.co.il/images/0.jpg"
				|| user.mainImage.url == "http://m.gobaby.co.il/images/1.jpg"){
					app.container.find('#pic1').parent('a').attr("href","#");
				}
   */
			   if(user.mainImage.size.length){
			       $('.noPicture').hide();
			       var userPhotoTemplate = $('#userPhotoTemplate').html().replace(/\[ID\]/g,'pic1');
				   $(userPhotoTemplate).appendTo('.my-gallery');
                   app.container.find('#pic1').attr("src",user.mainImage.url).parent('a').attr({"href":user.mainImage.url, "data-size": user.mainImage.size});
			       app.container.find('.pic_wrap').eq(0).show();
			   }
			   else{
     			   $('.noPicture img').attr("src",user.mainImage.url);
				   $('.noPicture').show();
			   }
				
			   
				
			   
			   
			   /*
				app.container.find('.fancybox').fancybox();
				if(typeof user.otherImages[0] !== "undefined"){
					//alert(user.otherImages[0]);
					app.container
						.find('.pic_wrap').eq(1).show()
						.find("img").attr("src",user.otherImages[0])
						.parent('a')
						.attr({"href":user.otherImages[0], "rel":"images_"+user.userId});
				}else{
					app.container.find('.pic_wrap').eq(0).addClass("center").removeClass("left");
				}
				if(typeof user.otherImages[1] !== "undefined"){
					//alert(user.otherImages[1]);
					app.container.find('.pic_wrap').eq(2).show()
						.find("img").attr("src",user.otherImages[1])
						.parent('a').attr({"href":user.otherImages[1], "rel":"images_"+user.userId});
				}
				
				*/
			   
			   
			   if(typeof user.otherImages[0] !== "undefined"){
			       app.proccessUserPhotoHtml(user,1);
			   
			   }else{
			       app.container.find('.pic_wrap').addClass("center");
			   }
			   
			   if(typeof user.otherImages[1] !== "undefined"){
				   app.proccessUserPhotoHtml(user,2);
			   }
			   
			   
			   initPhotoSwipeFromDOM('.my-gallery');
			   
			   
			   
				if(user.isPaying == 1){
					app.container.find(".special3").show();
				}
				if(user.isNew == 1){
					app.container.find(".blue_star").show();
				}				
				if(user.isOnline == 1){
					app.container.find(".on5").show();					
				}else{
					app.container.find(".on1").show();
				}
				if(user.distance != ""){						
					app.container.find(".distance_value").show().css({'right':($('#user_pictures .pic_wrap').width()*0.9-$('#user_pictures .distance_value').width())/2+'px'}).find("span").html(user.distance);
				}else{
					app.container.find(".distance_value").hide().find("span").html(user.distance);
				}
				app.profileGroupTemplate = $('#userProfileGroupTemplate').html();
				app.profileLineTemplate = $('#userProfileLineTemplate').html();
				app.profileLineTemplate2 = $('#userProfileLineTemplate2').html();
				var profileButtonsTemplate = $('#userProfileButtonsTemplate').html();
				profileButtonsTemplate = profileButtonsTemplate.replace(/\[USERNICK\]/g,user.nickName);									
				profileButtonsTemplate = profileButtonsTemplate.replace("[USER_ID]", user.userId);
				//profileButtonsTemplate.insertBefore(detailsContainer);
				var html = profileButtonsTemplate;	
				
				if(!((user.eyesColor== undefined || user.eyesColor=='') && (user.bodyType== undefined || user.bodyType=='') && (user.hairColor== undefined || user.hairColor=='') && (user.hairLength== undefined || user.hairLength=='') && (user.breast== undefined || user.breast=='')))
					html = html + app.getProfileGroup("מראה חיצוני");
				if(user.eyesColor!== undefined && user.eyesColor!=='')html = html + app.getProfileLine("צבע עיניים", user.eyesColor);
				if(user.bodyType!== undefined && user.bodyType!=='')html = html + app.getProfileLine("מבנה גוף", user.bodyType);
				if(user.hairColor!== undefined && user.hairColor!=='')html = html + app.getProfileLine("צבע שיער", user.hairColor);
				if(user.hairLength!== undefined && user.hairLength!=='')html = html + app.getProfileLine("תסרוקת", user.hairLength);
				if(user.breast!== undefined && user.breast!=='')html = html + app.getProfileLine("גודל חזה", user.breast);
				html = html + app.getProfileGroup("מידע בסיסי");
				//html = html + app.getProfileLine("Nickname", user.nickName);
				if(user.age!== undefined && user.age!=='')html = html + app.getProfileLine("גיל", user.age);
				if(user.sexPreference!== undefined && user.sexPreference!=='')html = html + app.getProfileLine("נטיה מינית", user.sexPreference);
				if(user.experience!== undefined && user.experience!='')html = html + app.getProfileLine("נסיון עם נשים", user.experience);	
				if(user.region!== undefined && user.region!=='')html = html + app.getProfileLine("אזור מגורים", user.region);
				if(user.city!== undefined && user.city!=='')html = html + app.getProfileLine("עיר", user.city);
				if(user.smoking!== undefined && user.smoking!=='')html = html + app.getProfileLine("עישון", user.smoking);
				if(user.education!== undefined && user.education!=='')html = html + app.getProfileLine("השכלה", user.education);
				if(user.occupation!== undefined && user.occupation!=='')html = html + app.getProfileLine("עיסוק", user.occupation);
				if(user.portability!== undefined && user.portability!=='')html = html + app.getProfileLine("נכונות להעתקת מקום מגורים", user.portability);
				if(user.income!== undefined && user.income!=='')html = html + app.getProfileLine("הכנסה", user.income);
				html = html + app.getProfileLine("ילדים", user.children);
				if(user.maritalStatus!== undefined && user.maritalStatus!=='')html = html + app.getProfileLine("מצב משפחתי", user.maritalStatus);
				//if(user.economy!== undefined && user.economy!=='')html = html + app.getProfileLine("מצבי הכלכלי", user.economy);
				if(user.faith!== undefined && user.faith!=='')html = html + app.getProfileLine("זיקה לדת", user.faith);
				if(user.faithRelations!== undefined && user.faithRelations!=='')html = html + app.getProfileLine("דת", user.faithRelations);
				if(user.ethnicity!== undefined && user.ethnicity!=='')html = html + app.getProfileLine("מוצא", user.ethnicity);
				//html = html + app.getProfileLine("Region", user.region);				
				//html = html + app.getProfileLine("Country", user.country);
				if(user.about!== undefined && user.about!=='' && user.about!=null){
					html = html + app.getProfileGroup("מעט עלי");				
					html = html + app.getProfileLine("", user.about);
				}
				if(user.lookingFor!== undefined && user.lookingFor!=='' && user.lookingFor!=null){
					html = html + app.getProfileGroup("אני מחפש/ת");
					html = html + app.getProfileLine("", user.lookingFor);
				}
				//if((user.hobbies!== undefined && user.hobbies!=='')&&(user.music!== undefined && user.music!=='')){				
				//	html = html + app.getProfileGroup("עוד קצת עלי");
				//	if(user.hobbies!== undefined && user.hobbies!=='')html = html + app.getProfileLine("תחומי העניין שלי", user.hobbies);
				//	if(user.music!== undefined && user.music!=='')html = html + app.getProfileLine("המוסיקה שלי", user.music);
				//}
				detailsContainer.html(html);
				app.stopLoading();				
			}
		});
	},
	
	
	proccessUserPhotoHtml: function(user,index){
		
		var userPhotoTemplate = $('#userPhotoTemplate').html().replace(/\[ID\]/g,'pic' + index + 1);
		$(userPhotoTemplate).appendTo('.my-gallery');
		
		var imageSize = (user.otherImages[index-1].size.length) ? user.otherImages[index-1].size : '1x1' ;
		
		console.log("SIZE of " + user.otherImages[index-1].url + ":" + imageSize);
		
		app.container
		.find('.pic_wrap')
		.css({"float": "left"})
		.eq(index)
		.show()
		.find('img')
		.show()
		.attr("src",user.otherImages[index-1].url)
		.parent('a')
		.attr({"href": user.otherImages[index-1].url, "data-size": imageSize});
	},
	
	
	getProfileGroup: function(groupName){
		var group = app.profileGroupTemplate;
		return group.replace("[GROUP_NAME]", groupName);
	},
	
	getProfileLine: function(lineName, lineValue){
		if(lineName != ""){
			var line = app.profileLineTemplate;
			line = line.replace("[LINE_NAME]", lineName);			
		}
		else{
			var line = app.profileLineTemplate2;
		}
		line = line.replace("[LINE_VALUE]", lineValue);
		return line;
	},
	
	getMessenger: function(){		
		app.startLoading();		
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/user/contacts',									
			success: function(response){
				//alert(JSON.stringify(response));
				app.response = response;				
				//if(pagesTracker.indexOf('messenger_page')!=-1){
				//	pagesTracker.splice(pagesTracker.length-pagesTracker.indexOf('messenger_page'),pagesTracker.indexOf('messenger_page'));
				//}
				app.showPage('messenger_page');
				app.container = app.currentPageWrapper.find('.chats_wrap');
				app.container.html('');				
				app.template = $('#messengerTemplate').html();
				for(var i in app.response.allChats){
					var currentTemplate = app.template; 
					var chat = app.response.allChats[i];
					currentTemplate = currentTemplate.replace("[IMAGE]",chat.user.mainImage);
					currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,chat.user.nickName);
					currentTemplate = currentTemplate.replace("[RECENT_MESSAGE]",chat.recentMessage.text);
					currentTemplate = currentTemplate.replace("[DATE]", chat.recentMessage.date);					
					currentTemplate = currentTemplate.replace("[USER_ID]", chat.user.userId);
					app.container.append(currentTemplate);
					if(chat.newMessagesCount > 0||chat. user.isPaying == 1){
						var currentUserNode = app.container.find(":last-child");
						if(chat.newMessagesCount > 0)currentUserNode.find(".new_mes_count").html(chat.newMessagesCount).show();
						if(chat.user.isPaying == 1)currentUserNode.find(".special2").show();
					}
				}
				app.stopLoading();
			}
		});
	},
	
	getChat: function(chatWith, userNick){
		if(chatWith===window.localStorage.getItem("userId")){app.getMyProfileData(); return;}
		app.chatWith = chatWith;
		app.startLoading();
		$.ajax({
			url: 'http://m.gobaby.co.il/api/v2/user/chat/'+app.chatWith,									
			success: function(response){				
				app.response = response;
				//alert(JSON.stringify(app.response));
				app.showPage('chat_page');
				window.scrollTo(0, 0);
				app.container = app.currentPageWrapper.find('.chat_wrap');
				app.container.html('');
				app.template = $('#chatMessageTemplate').html();				
				app.currentPageWrapper.find('.content_wrap').find("h1 span").text(userNick).attr('onclick','app.getUserProfile(\''+chatWith+'\')');
				var html = app.buildChat();
				app.container.html(html);
				app.subscribtionButtonHandler();
				app.refreshChat();
				app.stopLoading();
			}
		});
	},
	
	subscribtionButtonHandler: function(){
		if(app.response.chat.abilityReadingMessages == 0){					
			app.container.find('.message_in .buySubscr').show();
		}
	},
	
	buildChat: function(){
		var html = '';
		var k = 1;
		var appendToMessage = '';
		
		console.log(JSON.stringify(app.response));
				
		for(var i in app.response.chat.items){					
			var currentTemplate = app.template; 
			var message = app.response.chat.items[i];
			
			if(app.chatWith == message.from){
				var messageType = "message_in";				
			} 
			else 
				var messageType = "message_out";
			
			if(from == message.from) k--;
			
			if(k % 2 == 0){
				messageFloat = "right";
				info = "info_right";
			} 
			else{
				messageFloat = "left";
				info = "info_left";
			}
			
			currentTemplate = currentTemplate.replace("[MESSAGE]", message.text);
			currentTemplate = currentTemplate.replace("[DATE]", message.date);
			currentTemplate = currentTemplate.replace("[TIME]", message.time);
			currentTemplate = currentTemplate.replace("[MESSAGE_TYPE]", messageType);
			currentTemplate = currentTemplate.replace("[MESSAGE_FLOAT]", messageFloat);
			currentTemplate = currentTemplate.replace("[INFO]", info);
			
			html = html + currentTemplate;
			
			var from = message.from;
			
			k++;
		}
		
		return html;
	},	
	
	sendMessage: function(){		
		var message = $('#message').val();		
		if(message.length > 0){
			$('#message').val('');			
			$.ajax({
				url: 'http://m.gobaby.co.il/api/v2/user/chat/'+app.chatWith,
				type: 'Post',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({			
					message: message 
				}),
				success: function(response){
					app.response = response;
					var html = app.buildChat();
					app.container.html(html);
					app.subscribtionButtonHandler();
					app.refreshChat();
				}
			});
		
		}
	},
	
	
	refreshChat: function(){
		if(app.currentPageId == 'chat_page'){
			$.ajax({
				url: 'http://m.gobaby.co.il/api/v2/user/chat/'+app.chatWith+'/refresh',
				type: 'Get',
				complete: function(response, status, jqXHR){					
					//app.stopLoading();
				},
				success: function(response){
					if(app.currentPageId == 'chat_page'){						
						if(response.chat != false){											
							if(app.currentPageId == 'chat_page'){
								app.response = response;
								var html = app.buildChat();
								app.container.html(html);	
								app.subscribtionButtonHandler();
							}
						}
						refresh = setTimeout(app.refreshChat, 100);
					}
				}
			});
		}
		else{
			clearTimeout(refresh);
		}
		
	},
	
	checkNewMessages: function(){
		checkNewMessagesRequest = $.ajax({
			url: 'http://m.gobaby.co.il/api/v2/user/newMessagesCount',
			type: 'Get',
			complete: function(response, status, jqXHR){					
				//app.stopLoading();
			},
			success: function(response){
				//app.response = response;
				if(app.currentPageId!='login_page'){
					$('.appPage .ui-content').css({'padding-top':parseInt($(window).height()*0.02)+'px !important'});
					if(response.newMessagesCount > 0&&app.currentPageId!='login_page'){
						var count = response.newMessagesCount;
						$('.new_mes_count2, #new_mes_count').html(count);
						$(".new_mes, #new_mes_count").show();
						$('#main_page .content_wrap').css({'margin-top':'0'});
					}
					else{
						$('.new_mes, #new_mes_count').hide();					
						$('#main_page .content_wrap').css({'margin-top':'0 !important'});
					}
					newMessages = setTimeout(app.checkNewMessages, 10000);
				}
			}
		});
		
	},
	
	getSubscription: function(){
	/*
		var userId = window.localStorage.getItem("userId");
		var ref = window.open('http://www.shedate.co.il/newpayment/?userId='+userId+'&app=1', '_blank', 'location=yes');
		*/
	
		app.startLoading();
	
		app.showPage('subscription_page');
		$('input[type="radio"]').removeAttr("checked");
		IAP.initialize();
	
		$(".subscr").click(function(){
			$(".subscr_left").removeClass("subscr_sel");
			$(this).find("input").attr("checked","checked");
			$(this).find(".subscr_left").addClass("subscr_sel");
		});
	
	},
	
	confirmDeleteImage: function(imageId){
		app.imageId = imageId;		
		navigator.notification.confirm(
				'Delete this image?',  // message
		        app.deleteImageChoice,              // callback to invoke with index of button pressed		       
		        'Confirmation',            // title
		        'Confirm,Cancel'          // buttonLabels
		 );
	},
	
	deleteImageChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.deleteImage();
		}
	},
	
	deleteImage: function(){
		app.requestUrl = 'http://m.gobaby.co.il/api/v2/user/images/delete/' + app.imageId,
		app.requestMethod = 'Post';
		app.getUserImages();
	},
	
	displayUserImages: function(){
		app.requestUrl = 'http://m.gobaby.co.il/api/v2/user/images';
		app.requestMethod = 'Get';
		app.getUserImages();
	},
	
	getUserImages: function(){
		$('.imagesButtonsWrap').hide();
		$.ajax({
			url: app.requestUrl,
			type: app.requestMethod,			
			success: function(response){
								
				app.response = response;
				app.showPage('delete_images_page');
				app.container = app.currentPageWrapper.find('.imagesListWrap');
				app.container.html('');
				app.template = $('#editImageTemplate').html();
				window.scrollTo(0,0);
				
				//alert(JSON.stringify(app.response));				
				if(app.response.images.itemsNumber < 4)
					$('.imagesButtonsWrap').show();
				
				for(var i in app.response.images.items){					
					var currentTemplate = app.template; 
					var image = app.response.images.items[i];					
					currentTemplate = currentTemplate.replace("[IMAGE]", image.url);
					currentTemplate = currentTemplate.replace("[IMAGE_ID]", image.id);
					app.container.append(currentTemplate);					
					var currentImageNode = app.container.find('.userImageWrap:last-child');
															
					if(image.isValid == 1)
						currentImageNode.find('.imageStatus').html("אושר").css({"color":"green"});
					else						
						currentImageNode.find('.imageStatus').html("עדיין לא אושר").css({"color":"red"});					
					
				}
				
				//app.container.trigger('create');
			}
		});
	},
	
	capturePhoto: function(sourceType, destinationType){
		// Take picture using device camera and retrieve image as base64-encoded string	
		var options = {
			quality: 100, 
			destinationType: app.destinationType.FILE_URI,
			sourceType: sourceType,
			encodingType: app.encodingType.JPEG,
			targetWidth: 600,
			targetHeight: 600,		
			saveToPhotoAlbum: false,
			chunkedMode:true,
			correctOrientation: true
		};
		
		navigator.camera.getPicture(app.onPhotoDataSuccess, app.onPhotoDataFail, options);
		
	},
	
	onPhotoDataSuccess: function(imageURI) {		
		app.startLoading();
		
		/*
		$("#myNewPhoto").attr("src","data:image/jpeg;base64," + imageURI);
		$('#myNewPhoto').Jcrop({
			onChange: showPreview,
			onSelect: showPreview,
			aspectRatio: 1
		});
		*/
		app.uploadPhoto(imageURI); 
	},
	
	onPhotoDataFail: function() {
		
	},
	
	uploadPhoto: function(imageURI){
		var user = window.localStorage.getItem("user");
		var pass = window.localStorage.getItem("pass");		
		var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";
        options.headers = {"Authorization": "Basic " + btoa ( user + ":" + pass)}; 
        
        var ft = new FileTransfer();
        ft.upload(
        	imageURI, 
        	encodeURI("http://m.gobaby.co.il/api/v2/user/image"), 
        	app.uploadSuccess, 
        	app.uploadFailure,
	        options
	    );
	},
	
	
	uploadSuccess: function(r){
		//console.log("Code = " + r.responseCode);
        //console.log("Response = " + r.response);
        //console.log("Sent = " + r.bytesSent);
        
		//alert(r.response);
        //return;
		
		app.stopLoading();
		
		app.response = JSON.parse(r.response);
		if(app.response.status.code == 0){
			navigator.notification.confirm(
				app.response.status.message + '. לחץי על כפתור "נהל תמונות" על מנת למחוק תמונות',  // message
		        app.manageImagesChoice,              // callback to invoke with index of button pressed		       
		        'Notification',            // title
		        'נהל תמונות,ביטול'          // buttonLabels
		    );
		}else if(app.response.status.code == 1){
			app.alert(app.response.status.message);
		}
		
		if(app.currentPageId == 'delete_images_page'){
			app.displayUserImages();
		}
		
	},
	
	manageImagesChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.displayUserImages();
		}
	},
	
	
	uploadFailure: function(error){
		app.stopLoading(); 
		app.alert("התרחשה שגיאה. נסה שנית בבקשה.");
	},
	

	
getEditProfile: function(){
	
	$.ajax({
		   url: 'http://m.gobaby.co.il/api/v2/user/data',
		   error: function(response){
		   console.log(JSON.stringify(response));
		   },
		   success: function(response){
		   user = response.user;
		   //alert(JSON.stringify(response));
		   app.showPage('edit_profile_page');
		   app.container = app.currentPageWrapper.find('.edit_wrap');
		   app.container.html('');
		   app.template = $('#userEditProfileTemplate').html();
		   app.template = app.template.replace(/\[userNick\]/g,user.userNick);
		   app.template = app.template.replace(/\[userPass\]/g,user.userPass);
		   app.template = app.template.replace(/\[userEmail\]/g,user.userEmail);
		   app.template = app.template.replace(/\[userCity\]/g,user.userCity);
		   
		   if(user.userAboutMe == null)
					user.userAboutMe='';
		   
		   if(user.userLookingFor == null)
					user.userLookingFor='';
		   
		   app.template = app.template.replace(/\[userAboutMe\]/g,user.userAboutMe);
		   app.template = app.template.replace(/\[userLookingFor\]/g,user.userLookingFor);
		   //app.template = app.template.replace(/\[userfName\]/g,user.userfName);
		   //app.template = app.template.replace(/\[userlName\]/g,user.userlName);
		   app.template = app.template.replace(/\[Y\]/g,user.Y);
		   app.template = app.template.replace(/\[n\]/g,user.n);
		   app.template = app.template.replace(/\[j\]/g,user.j);
		   
		   
		   app.container.html(app.template).trigger('create');
		   app.getRegions();
		   $('#userBirth').html(app.getBithDate()).trigger('create');
		   
		   
		   
		   //app.container.find('.userGender').html(app.getuserGender()).trigger('create');
		   },
		   error: function(err){
		   //alert(JSON.stringify(err));
		   }
		   });
},
	
saveProf: function (el,tag){
	var name = '';
	var val = '';
	var input = $(el).parent().find(tag);
	if(input.size()=='3'){
		var er=false;
		val = input.eq(2).val()+'-'+input.eq(1).val()+'-'+input.eq(0).val();
		//console.log(val);
		//return;
		input.each(function(index){
				   //if(index!='0')val=val+'-';
				   //val=val+$(this).val();
				   if($(this).val().length==0){
				   alert('אנא תמאו ת. לידה');
				   er=true;
				   }
				   });
		if(er)return false;
		name = 'userBirthday0';
	}else{
		name = input.attr('name');
		val = input.val();
	}
	//alert(name+'='+val);//return false;
	if(name == 'userPass'){
		if(val.length < 4){
			alert('סיסמה קצרה מדי');
			return false;
		}
		
		if($('#editedUserPass2').val() !== val){
			alert('מספר נתונים אינם תקינים: סיסמה או סיסמה שנית');
			return false;
		}
		
	}
	if((val.length < 3 && tag!='select') || (val.length==0 && tag=='select')){
		alert($(el).parent().parent().prev().find('span').text()+' קצר מדי');
		return false;
	}
	var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
	if (!(email_pattern.test(val))&&name=='userEmail') {
		alert("כתובת הדואר האלקטרוני שהזנת אינה תקינה");
		return false;
	}
	
	if(name == 'userPass'){
		if(val.length < 4){
			alert('סיסמה קצרה מדי');
			return false;
		}
		
		if($('#editedUserPass2').val() !== val){
			alert('מספר נתונים אינם תקינים: סיסמה או סיסמה שנית');
			return false;
		}
		
	}
	
	if(name == 'userLookingFor'){
		if(val.length < 10){
			alert('אני מחפש/ת קצר מדי');
			return false;
		}
	}
	
	if(name == 'userAboutMe'){
		if(val.length < 10){
			alert('על עצמי קצר מדי');
			return false;
		}
	}

	
	
	
	
	
	if($(el).parent().find('.userFailed').length > 0&&$(el).parent().find('.userFailed').is(":visible"))
		return false;
	
	
	
	app.startLoading();
	//alert(name+'='+val);
	
	console.log("Abort checkNewMessagesRequest");
	checkNewMessagesRequest.abort();
	clearTimeout(newMessages);

	
	
	$.ajax({
		   url: 'http://m.gobaby.co.il/api/v2/user/data',
		   //dataType: 'json',
		   type: 'post',
		   data: JSON.stringify({name:name,val:val}),
		   contentType: "application/json; charset=utf-8",
		   success : function(res){
		   
		   console.log("Abort checkNewMessagesRequest");
		   checkNewMessagesRequest.abort();
		   clearTimeout(newMessages);

		   
		   var user = app.container.find("#userNick").val();
		   var pass = app.container.find("#editedUserPass").val();
		   console.log("USERNAME: " + user);
		   console.log("PASSWORD: " + pass);
		   user = unescape(encodeURIComponent(user));
		   pass = unescape(encodeURIComponent(pass));
		   window.localStorage.setItem("user",user);
		   window.localStorage.setItem("pass",pass);
		   


		   
		   
		   //console.log("_________________________________________----------");
		   
		   
		   
		   app.ajaxSetup();
		   app.checkNewMessages();
		   
		   app.stopLoading();
		   //alert(JSON.stringify(res)); return false;
		   
		   if(res.err == '1'){
		   //check(input.attr('id'),val);
		   alert(res.text);
		   $(el).parent().find('.input').css({'background':'red'});
		   }else if(res.res == '1'){
		   //alert(val);
		   alert('עדכון נשמר');
		   if(tag=='select'&&name!='userBirthday0'){
		   val = $(el).parent().find('.ui-select span').eq(1).text();
		   //alert(val);
		   }
		   //if(val=='0'&&name=='userGender')val = 'אישה';
		   //if(val=='1'&&name=='userGender')val = 'גבר';
		   
		   if(name=='userBirthday0') val=val.replace(/-/g,' / ');
		   if(name=='userPass')
		   $(el).parent().next().find('input').val(val);
		   else
		   $(el).parent().next().find('div').text(val);
		   $('.save').hide();
		   $('.edit').show();
		   }
		   },
		   error: function(err){
		   app.stopLoading();
		   alert(JSON.stringify(err));
		   $('.save').hide();
		   $('.edit').show();
		   }
		   });
},
	
editProf: function (el){
	var name = $(el).attr('name');
	if(name=='edit'){
		$('.save').hide();
		$('.edit').show();
		//alert($('.sf_sel_wrap .edit').size());
		$(el).parent().hide().prev().show();
	}else{
		$(el).parent().hide().next('.edit').show();
	}
},
	
	
	
	register: function(){
		app.showPage('register_page');
		$('#birthDate').html(app.getBithDate()).trigger('create');
		app.getRegions();
		//app.getCities();		
		app.getSexPreference();
	},
	
	
	getBithDate: function(){
		var html;
		var curYear = new Date().getFullYear();		
		html = '<div style="min-width:30%;float: right;">';
			html = html + '<select name="userBirthday_y" id="y">';
				html = html + '<option value="">Y</option>';
				for (var i = curYear - 18; i >=1940 ; i--) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';
		html = html + '</div>';
		
		html = html + '<div style="min-width:30%;float: right;">';
			html = html + '<select name="userBirthday_m" id="m">';
				html = html + '<option value="">M</option>';
				for (var i = 1; i <= 12; i++) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
		
		html = html + '<div style="min-width:30%;float: right;">';
			html = html + '<select name="userBirthday_d" id="d">';
				html = html + '<option value="">D</option>';
				for (var i = 1; i <= 31; i++) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}
			html = html + '</select>';
		html = html + '</div>';
		//alert(html);
		return html;
	},
	
		
	dump: function(obj) {
	    var out = '';
	    for (var i in obj) {
	        out += i + ": " + obj[i] + "\n";
	    }
	    alert(out);
	}	
	
		
};


//document.addEventListener("deviceready", app.init, false);

function showPreview(coords)
{
	var rx = 100 / coords.w;
	var ry = 100 / coords.h;

	$('#preview').css({
		width: Math.round(rx * 500) + 'px',
		height: Math.round(ry * 370) + 'px',
		marginLeft: '-' + Math.round(rx * coords.x) + 'px',
		marginTop: '-' + Math.round(ry * coords.y) + 'px'
	});
}


$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


function onBodyLoad(){
	//initFastButtons();
	document.addEventListener("deviceready", app.init, false);
}

window.addEventListener('load', function() {
	new FastClick(document.body);
}, false);