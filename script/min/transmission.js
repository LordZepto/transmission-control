var transmission={SessionId:"",isInitialized:false,host:"",port:"9091",path:"/transmission/rpc",rpcpath:"../rpc",fullpath:"",on:{torrentCountChange:null,postError:null},username:"",password:"",_status:{stopped:0,checkwait:1,check:2,downloadwait:3,download:4,seedwait:5,seed:6,actively:101},options:{getFolders:true,getTarckers:true},headers:{},trackers:{},islocal:false,downloadDirs:[],getSessionId:function(b,a){jQuery.ajax({type:"POST",url:this.fullpath,error:function(d){var c="";if(d.status===409&&
(c=d.getResponseHeader("X-Transmission-Session-Id"))){b.isInitialized=true;b.SessionId=c;b.headers["X-Transmission-Session-Id"]=c;a&&a()}},headers:this.headers})},init:function(b,a){jQuery.extend(this,b);if(this.username&&this.password)this.headers.Authorization="Basic "+(new Base64).encode(this.username+":"+this.password);this.fullpath=this.rpcpath;this.getSessionId(this,a)},exec:function(b,a,d){if(!this.isInitialized)return false;var c={method:"",arguments:{},tag:""};jQuery.extend(c,b);var g={type:"POST",
url:this.fullpath,dataType:"json",data:JSON.stringify(c),success:function(f){a&&a(f,d)},error:function(f){var e="";if(f.status===409&&(e=f.getResponseHeader("X-Transmission-Session-Id"))){transmission.SessionId=e;transmission.headers["X-Transmission-Session-Id"]=e;jQuery.ajax(g)}else transmission.on.postError&&transmission.on.postError(f)},headers:this.headers};jQuery.ajax(g)},getStatus:function(b){this.exec({method:"session-stats"},function(a){if(a.result=="success"){b&&b(a.arguments);if(transmission.torrents.count!=
a.arguments.torrentCount||transmission.torrents.activeTorrentCount!=a.arguments.activeTorrentCount||transmission.torrents.pausedTorrentCount!=a.arguments.pausedTorrentCount){transmission.torrents.count=a.arguments.torrentCount;transmission.torrents.activeTorrentCount=a.arguments.activeTorrentCount;transmission.torrents.pausedTorrentCount=a.arguments.pausedTorrentCount;transmission._onTorrentCountChange()}}})},getSession:function(b){this.exec({method:"session-get"},function(a){a.result=="success"&&
b&&b(a.arguments)})},addTorrentFromUrl:function(b,a,d,c){if(b.match(/^[0-9a-f]{40}$/i))b="magnet:?xt=urn:btih:"+b;this.exec({method:"torrent-add",arguments:{filename:b,"download-dir":a,paused:!d}},function(g){switch(g.result){case "success":c&&c(g.arguments["torrent-added"]);break;default:c&&c(g.result)}})},addTorrentFromFile:function(b,a,d,c,g){var f=new FileReader;f.onload=function(e){e=e.target.result;var h=e.indexOf("base64,");if(h!=-1){e=e.substring(h+7);transmission.exec({method:"torrent-add",
arguments:{metainfo:e,"download-dir":a,paused:d}},function(i){switch(i.result){case "success":c&&c(i.arguments["torrent-added"],g);break;case "duplicate torrent":c&&c("duplicate")}})}};f.readAsDataURL(b)},_onTorrentCountChange:function(){this.torrents.loadSimpleInfo=false;this.on.torrentCountChange&&this.on.torrentCountChange()},removeTorrent:function(b,a,d){this.exec({method:"torrent-remove",arguments:{ids:b,"delete-local-data":a}},function(c){d&&d(c.result)})},getFreeSpace:function(b,a){this.exec({method:"free-space",
arguments:{path:b}},function(d){a&&a(d)})},updateBlocklist:function(b){this.exec({method:"blocklist-update"},function(a){b&&b(a.result)})}};