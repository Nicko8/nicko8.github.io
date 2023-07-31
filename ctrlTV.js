//-----------------------------------------------
//Version Private v01
//    支持 YS Lan地址 （支持同Lan网段）
//-----------------------------------------------
  
  //⓪①②③④⑤⑥⑦⑧⑨⑩ 
  
  const DEBUG_FLAG = true
  
  //这个配合Chome_Crx插件content.js，所以也是hard code
  const DEF_XY_HOST = 'ka.sino.tw:23678'
  const LAN_XY_HOST = '192.168.2.15:5678'
  const MY_HOST = 'ka.sino.tw'
  const LAN_HOST = '192.168.2.8'
  
  //const ALI_TEMP_FLD_URL = 'http://192.168.20.36:5244/d/XY_AL_Temp/XY-Temp/'
  const ALI_TEMP_FLD_URL = 'http://ka.sino.tw:30123/d/Others/AL_XY_TEMP/XY-Temp/'
  const LAN_TEMP_FLD_URL = 'http://192.168.2.8:30123/d/Others/AL_XY_TEMP/XY-Temp/'  
  
  const IMG_MX_SAVE_FLD =  "tmp_imgs/MX_FZC.png" 
  
  const MX_DOT_NUM = 17  //intent的局限，Mvlink 只允许最多17个 point(.) 字符，不然 拉不起来。但nplayer没问题
  const NP_URL_PATN = 'nplayer-<MVURL>'
  const MX_URL_PATN = 'intent:<MVURL>#Intent;package=com.mxtech.videoplayer.ad;end'
  const MXP_URL_PATN = 'intent:<MVURL>#Intent;package=com.mxtech.videoplayer.pro;end'
  
  const XP_URL_PATN = 'intent:<MVURL>#Intent;package=video.player.videoplayer;end'
  var DEF_PLAYER = 'MX'
  var PLAY_TAGS = ['NP', 'MX', 'XP']
  var PLAY_URLS = [NP_URL_PATN, MX_URL_PATN, XP_URL_PATN]
  
  // Players = Nplayer[NP],  MXPlayer (MX) /Pro,  XPlayer(XP)
  var defPlayer = ''  
  
  var sHttpResp = ''
  var mvLink = ''
  var pMvDispText = '' 

  var defMVUrl = ''
  var preMVUrl = ''
  var npMVUrl = ''
  
  var trigCount = 1 
  //var hour = 0
  var min = 0
  var sec = 0  
  
  var bInit = false 
   
  var curPlayerIndex = 0
  var cPlayerTags = ['', '', '']
	 
  var MVLink_Xiaoya = true
  var bLocalNet = false
  var bDot17Issue = false
  
  var sSAVE_FLD_URL = ALI_TEMP_FLD_URL
  var Resume_Temp_Fld_ID = -1  //用转存链打开，提示完后，恢复回原来的字符
	
//-------------------------------------------------------------------------------

function DoInit() {
	
	bInit = true
	$("StatePic").src= "tmp_imgs/running.gif"            
	
	//$('divSetup').style.visibility = "hidden"
 
	bLocalNet = location.host.indexOf('192.168.2.') >= 0
	if (bLocalNet)
	   sSAVE_FLD_URL = LAN_TEMP_FLD_URL
	log('[Init] 转存目录为: ' + sSAVE_FLD_URL)   
	Upd_Players_Img()	
	
}

function Init_HttpResp(sHttp) {
		
	if (!UpdMvLink(sHttp))
		return	
	Upd_Screen_Title('Last ')	
}

function Do_HandlePush(sHttp) { 
 
	if (!UpdMvLink(sHttp))
		return

	Upd_Screen_Title('Playing ')  
		
	if (bDot17Issue && defPlayer != 'NP') {
		log('[Do_HandlePush] 改为呼叫Nplayer')	
		openApp(npMVUrl)
	} else
		openApp(defMVUrl)
	 
	if (bDot17Issue)
	   UpdScreen()

	function UpdScreen() {		 
		 
		 //1.不判断host是否小雅了，因为Url已经坏了
		 msgItem = $('idFullPath')
		 msgItem.className = 'STY_Key'
		 
		 if (sSAVE_FLD_URL == '') 
			$('idFullPath').innerHTML = '注意: 此视频只能由 NPlayer 播放'			 	 
		 else		 
		    $('idFullPath').innerHTML = '路径错误！请转存字幕，待转存目录更新后, 按①重试'
		 
	}		
		
}

function UpdMvLink(sHttp)
{
	if (sHttp.substring(2, 3) != '-') {      //verify mvLink		
		alert('Skipped invalid Http resp:' + sHttp)
		return false
	}
	
	sHttpResp = sHttp
		
	if (preMVUrl != defMVUrl)  {
	    preMVUrl = defMVUrl	
	}	

	bDot17Issue = false

	//log('[UpdMvLink] http = ' + sHttpResp)

	npMVUrl = repLanUrl(sHttpResp.substring(3))
	mvLink = npMVUrl.substring(8)		
	
	defMVUrl = getCallPlayerUrl(defPlayer) 
	
	log('[UpdMvLink] defMVUrl = ' + defMVUrl)
			
	Upd_Players_Url()	
	Upd_Players_Img()
	
	return true
	
	function repLanUrl(url)
	{ 
		if (bLocalNet) 
		{
		   if (isXiaoyaLink(url))
			  return url.replace(DEF_XY_HOST, LAN_XY_HOST)					 
		   else
		      return url.replace(MY_HOST, LAN_HOST)					 
		}
		return url	
	}		
}


function Open_Url_In_Temp_Folder() {

	 Resume_Temp_Fld_ID = 2		 //2个计时后恢复
	 
	 if (sSAVE_FLD_URL == '' || defPlayer == 'NP' || !isXiaoyaLink(mvLink))  { 	
	    log('[Open_Url_In_Temp_Folder] Cancelled') 	
	    $('swcXY').innerText = '不支持，已取消'	    
		return		 
	 }	 
	 
	 mUrl = sSAVE_FLD_URL + getMvAbsFName()
	  
	 log('[Open_Url_In_Temp_Folder] opening: ' + mUrl )	 
	 $('swcXY').innerText = '正在打开...' 
	 $('imgDefPlayer').src = IMG_MX_SAVE_FLD 
	  
	 openApp(getCallPlayerUrlEx(defPlayer, mUrl))
	
}

function Fix_17Dot_CallUrl(playerTag) {
   
	  if (sSAVE_FLD_URL != '' && playerTag != 'NP' && mvLink.indexOf(sSAVE_FLD_URL) < 0 )  { 
	  
		// count dot number
		dotNum = 0
		for (i=0; i<=mvLink.length; i++) {    	
			if (mvLink[i] == '.')
				dotNum++
		}
					 
		if (dotNum > MX_DOT_NUM) {				
			bDot17Issue = true 
			log('[Fix_17Dot_CallUrl] Dot number = ' + dotNum )
			return sSAVE_FLD_URL + getMvAbsFName() 
		}  	
	  } 	
	  return mvLink	

}
 

//function openApp(url, push=false) Android 4.4 不支持
function openApp(url) {
     
  //document.location.href=
  if (url != '')
	  self.location = url
  
} 
   

function Upd_Screen_Title(pText)
{ 	
 	//Upd previous Movie
 	$('pmv').innerHTML = pMvDispText
 	
	UpdTitle()
	UpdFullPath()	

	function UpdTitle() 
	{	 
		s = getMvAbsFName()
		s = decodeURI(s)
		
		num = sHttpResp.substring(0,2)
		if (!isNaN(num)) 
			s = '[' + num + '] - ' + s 
			
		p = s.lastIndexOf('.')				
		if(p>0) 
			s = s.substring(0, p) 
		
	    pMvDispText = s.substring(0, 100)	   
	    $('idTitle').innerHTML = pText + s.substring(0, 35)   
		 
	}
	
	function UpdFullPath() {
		//upd full path + FN for the movie
		s = sHttpResp.substring(20)        // remove http
		p = s.indexOf('/') +1
		s = decodeURI(s.substring(p))     // change to Chinese
		s = s.replaceAll('/' , ' / ')
			
		// Option - 连续剧关键信息提取 S01E0 / E01 		    
		  // SE = s.match(/\S(S\d\dE\d\d).\S/)[1];
		  //s = s.substring(0, 40)
			
		$('idFullPath').innerHTML = s 	
		$('idFullPath').className = 'STY_FullPath'	    

	} 
} 
 
 
function Auto_Refresh_HttpLink() {
	 
	var xmlHttp = null;
	if (window.ActiveXObject) {
		// IE6, IE5 浏览器执行代码
		xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else if (window.XMLHttpRequest) {
		// IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
		xmlHttp = new XMLHttpRequest();
	}
	 
	//2.如果实例化成功，就调用open（）方法：
	if (xmlHttp != null) {	    
		xmlHttp.open("get", "TVPush/MV_" + Push_ID + ".txt", true);
		xmlHttp.setRequestHeader("If-Modified-Since", "0");      // prevent cache
		xmlHttp.send();
		xmlHttp.onreadystatechange = chkResult; //设置回调函数   		              
	}
	
	function chkResult() {
		 
        if ((trigCount >= 2) && !bInit)
         	DoInit()

		if (xmlHttp.readyState == 4) { //4表示执行完成
		if (xmlHttp.status == 200) { //200表示执行成功. Apache 可以成功，本地不行			
			
        if (sHttpResp == '')   
			Init_HttpResp(xmlHttp.responseText)
		else if (sHttpResp != xmlHttp.responseText)
			Do_HandlePush(xmlHttp.responseText)
		 	
	}  }  }	 
}

// ====== configration ============
function ShowSetup()
{	
	
	$('divSetup').style.visibility="visible"
	opt1 = $('stPlayer1')
	opt1.innerText = opt1.innerText.replace('xxx', getPlayerName(getPlayerTag(1)))
	$('stPlayer2').innerText = $('stPlayer2').innerText.replace('xxx', getPlayerName(getPlayerTag(2)))
	$('stDefPlayer').innerHTML = $('stDefPlayer').innerHTML.replace('xxx', getPlayerName(defPlayer))
	
	opt1.focus()

}

// ============== Lib functions =========== 

function isXiaoyaLink(url) {
	return url.indexOf(DEF_XY_HOST) > 0 || url.indexOf(LAN_XY_HOST) > 0
}

function getMvAbsFName()
{
	p = mvLink.lastIndexOf('/')
	if(p>0)  {
		s = mvLink.substring(p+1) 		 	
		return s 
	}
	return ''
  
}     


function Upd_Players_Url() {	
	
	SetPlayerImg('DefPlayer', defPlayer, getCallPlayerUrl(defPlayer))
	tag = getPlayerTag(1)
	SetPlayerImg('Player1', tag, getCallPlayerUrl(tag))
	tag = getPlayerTag(2)
	SetPlayerImg('Player2', tag, getCallPlayerUrl(tag))
	 
} 

function Auto_Upd_Screen_Time() {
	 sec = sec+2
	 if (sec > 59)  {
		sec = 0
		min++	     
	 }
			  
	 // 低版本的安卓貌似不支持这个 padStart函数 
	 //lb.innerHTML = min.toString().padStart(2, 0) + ' : ' + sec.toString().padStart(2, 0)  )
	 // Update Time
	 
	 $('tSta').innerHTML = min + ' : ' + sec	
			 	
}

function Auto_Resume() {
	
	// 自动恢复			 
	 if (Resume_Temp_Fld_ID >= 0) {			 	  
		  Resume_Temp_Fld_ID--			 	  
	 }  
	 
	 if (Resume_Temp_Fld_ID == 0) {
		$('swcXY').innerText = '⑤ ➟ 用转存链打开'		
		if ($('ADefPlayer').href.indexOf(sSAVE_FLD_URL) < 0)		 
			SetPlayerImg('DefPlayer', defPlayer, '') 			 	
	 }		
	 
}
//按次序拿到Player 的Tag名，跳过默认
function getPlayerTag(Player_Index) {
	
	if (cPlayerTags[Player_Index] != '')
		return cPlayerTags[Player_Index]
		
	i = 1
	for (var v in PLAY_TAGS) {		
		if (PLAY_TAGS[v] != defPlayer) {
			if (i == Player_Index) {
				cPlayerTags[i] = PLAY_TAGS[v]
				return PLAY_TAGS[v]	
			}
			i++			
		}
	}
	
	return ''
}
 

function getCallPlayerUrl(Player_Tag) {
	
   return getCallPlayerUrlEx(Player_Tag, '')
      
}

function getCallPlayerUrlEx(Player_Tag, mvUrl) {
	 
	if (Player_Tag == '')	
		return ''
		 
	/*  安卓4.4 默认浏览器 不支持
	i = PLAY_TAGS.findIndex((item) => {
		return item == Player_Tag;
	});  */
	
	for (var v in PLAY_TAGS) {		
		if (PLAY_TAGS[v] == Player_Tag) {
			if (mvUrl == '')
				mvUrl = Fix_17Dot_CallUrl(Player_Tag)
			return PLAY_URLS[v].replace('<MVURL>', mvUrl) 			 
		}
	} 
}

// Setup Url/Image src only when Url is empty
function SetPlayerImg(sID, playerTag, callUrl) {
	
	//log('[SetPlayerImg] sID /PlayerTag = ' + sID + ' / '+ PlayerTag)
	
	AItem = $('A'+sID)
	if (AItem && (callUrl != '')) {
		AItem.href = callUrl
		//log('[SetPlayerImg] url = ' + url)
		return
	}
	
	img = $('img'+sID)
	if (img && (playerTag != '')) {
		if (bDot17Issue && playerTag.indexOf('MX')==0 ) 
		    img.src = IMG_MX_SAVE_FLD
		else
			img.src= "tmp_imgs/" + playerTag + ".webp" 
	}
	
}

function getPlayerName(pTag)
{
	if(pTag == 'NP')
		return 'nPlayer'
	if(pTag == 'MX')
		return 'MX Player'
	if(pTag == 'MXP')
		return 'MX Player Pro'
	if(pTag == 'MXS')
		return 'MX Player Silver'
	if(pTag == 'XP')
		return 'XPlayer'
			
}


function Upd_Players_Img() {	
	
	SetPlayerImg('DefPlayer', defPlayer, '')
	SetPlayerImg('Player1', getPlayerTag(1), '')
	SetPlayerImg('Player2', getPlayerTag(2), '')
	
}


function setupDefPlayer(id) { 
 
	setCookie('DefPlayer', getPlayerTag(id), 300)
	 
	$('stTitle').innerText = "完成!"
	
	//$('divSetup').style.visibility="hidden"
	//location.reload()
	
	setTimeout(function() {
		location.reload()		 
	}, 500); 
	
}

// Cookies 
function setCookie(key,value,t){
    var oDate=new Date();
    oDate.setDate(oDate.getDate()+t);
    document.cookie=key+"="+value+"; expires="+oDate.toDateString();
}

function getCookieValue(key){
    var arr1=document.cookie.split("; ");  //由于cookie是通过一个分号+空格的形式串联起来的，所以这里需要先按分号空格截断,变成[name=Jack,pwd=123456,age=22]数组类型；
    for(var i=0;i<arr1.length;i++){
        var arr2=arr1[i].split("=");  //通过=截断，把name=Jack截断成[name,Jack]数组；
        if(arr2[0]==key){
            return decodeURI(arr2[1]);
        }
    }
    
    return ''
}


 function getUrlParam(key) {
 
      const search = window.location.search.substring(1);
      try {
           return new URLSearchParams(search).get(key|| '');
      } catch (err) {
         const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
         const par = search.match(reg);
         if (par != null) return decodeURI(par[2]); return null;
      }
  }
  
  
function log(msg)
{
	if (DEBUG_FLAG) {		
		 console.log(msg)
	}
}


 String.prototype.replaceAll = function(s1,s2){ 
     return this.replace(new RegExp(s1,"gm"),s2); 
 }
 
function $(id){ return document.getElementById(id); }

// ================= Event ================

function SetTimer() {  

   setInterval(function() {			 

	 Auto_Refresh_HttpLink()
	 	 
	 Auto_Upd_Screen_Time()	
	 Auto_Resume() 

	 if (trigCount > 1000)
			trigCount = 10					
	 trigCount++
	 
    }, 2000);
}    

 document.onkeydown = function(event)  {
   
    var  e = event  || window.event || arguments.callee.caller.arguments[0]; 
       
    if (e.keyCode == 13) { // 按 Enter
		//setup    
    } 
    
    if (e.keyCode == 49) { // 按 1
		openApp(defMVUrl)      
    }    
    
    if (e.keyCode == 50) { // 按 2  
		openApp(preMVUrl) 	           
    }      
    
    if (e.keyCode == 53) { // 按 5  		   
	   Open_Url_In_Temp_Folder() 
    }      
    
    divShowSetup = $('divSetup').style.visibility == "visible"
    if (e.keyCode == 48) { // 按 0
		if (divShowSetup)
			$('divSetup').style.visibility = "hidden"
		else
			ShowSetup() 
    }

    if (e.keyCode == 27) { // 按 ESC
		 
		  
    }
    if (e.keyCode == 55) { // 按 7  
			if (divShowSetup) {
				
				 setupDefPlayer(1)
				
			} else {
				link = $('APlayer1')
				if (link) {
					link.click()
				}       
			}
    }  
    if (e.keyCode == 56) { // 按 8 
			if (divShowSetup) {
					
					setupDefPlayer(2)
					
			} else {		
				link = $('APlayer2')
				if (link) {
					link.click()
				}
			}	
    }      
}
         
        
// ================ Script start ====================

  // set MX / MX Pro
  pMX = getUrlParam('mx')
  if (pMX == 'MXP') {
  	  DEF_PLAYER = 'MXP'
      PLAY_TAGS[1] = 'MXP'
      PLAY_URLS[1] = MXP_URL_PATN
  	  log('Set MX player to MX Pro')
 }
   
  defPlayer = getCookieValue('DefPlayer')
  if (defPlayer == '')
	  defPlayer = DEF_PLAYER
	else 
	  log('[Cookie] DefPlayer = ' + defPlayer)
	  	
  Push_ID = getUrlParam('id')
  log('ID: ' + Push_ID)
  if (Push_ID == null) {
  	
  	log('Push ID empty')
  	var ret = prompt('请输入您的ID', 'gs1')
	if(ret !== null && ret != '') {	　
		 location.href = location.href  + '?id=' + ret		 
	} else  {
		alert('不允许空ID, 刷新后再输入!')			 
	}	 	
  }
  

  if (Push_ID != null)
	SetTimer()	  
	 

  
