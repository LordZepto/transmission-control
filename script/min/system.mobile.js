var system={version:"0.5 Beta",codeupdate:"20130909",config:{autoReload:true,reloadStep:5E3,pageSize:30,defaultSelectNode:null},lang:null,reloading:false,autoReloadTimer:null,downloadDir:"",islocal:false,B64:new Base64,currentTorrentId:0,currentContentPage:"home",currentContentConfig:null,control:{tree:null,torrentlist:null},serverConfig:null,serverSessionStats:null,torrentListChecked:false,debug:function(a,b){window.console&&window.console.log&&window.console.log(a,b)},setlang:function(a,b){a||(a=
this.config.defaultLang?this.config.defaultLang:navigator.language||navigator.browserLanguage);a||(a="zh-CN");if(a.indexOf("-")!=-1)a=a.split("-")[0].toLocaleLowerCase()+"-"+a.split("-")[1].toLocaleUpperCase();this.languages[a]||(a="en");$.getScript("lang/"+a+".js",function(){system.lang=$.extend(true,system.defaultLang,system.lang);system.resetLangText();b&&b()})},resetLangText:function(){var a=$("*[system-lang]");$.each(a,function(b,c){var d=$(c).attr("system-lang");$(c).html(eval("system.lang."+
d))})},init:function(a){this.readConfig();transmission.options.getFolders=false;this.lang==null?this.setlang(a,function(){system.initdata()}):this.initdata()},initdata:function(){$(document).attr("title",this.lang.system.title+" "+this.version);this.control.torrentlist=$("#torrent-list");this.connect()},readConfig:function(){var a=cookies.get("transmission-web-control");if($.isPlainObject(a))this.config=$.extend(this.config,a)},saveConfig:function(){cookies.set("transmission-web-control",this.config,
100)},connect:function(){transmission.on.torrentCountChange=function(){system.reloadTorrentBaseInfos()};transmission.on.postError=function(){};transmission.init({islocal:true},function(){system.reloadSession(true);system.getServerStatus()})},reloadSession:function(){transmission.getSession(function(a){system.serverConfig=a;a["alt-speed-enabled"]==true?$("#status_alt_speed").show():$("#status_alt_speed").hide();system.downloadDir=a["download-dir"];parseInt(system.serverConfig["rpc-version"])>=15?transmission.getFreeSpace(system.downloadDir,
function(b){system.serverConfig["download-dir-free-space"]=b.arguments["size-bytes"];system.showFreeSpace(b.arguments["size-bytes"])}):system.showFreeSpace(system.serverConfig["download-dir-free-space"])})},showFreeSpace:function(a){a=a;a=a==-1?system.lang["public"]["text-unknown"]:formatSize(a);$("#status_freespace").text(a)},getServerStatus:function(){if(!this.reloading){clearTimeout(this.autoReloadTimer);this.reloading=true;transmission.getStatus(function(a){system.reloading=false;$("#status_downloadspeed").html(formatSize(a.downloadSpeed,
false,"speed"));$("#status_uploadspeed").html(formatSize(a.uploadSpeed,false,"speed"));system.serverSessionStats=a})}},reloadTorrentBaseInfos:function(a){if(!this.reloading){clearTimeout(this.autoReloadTimer);this.reloading=true;var b={trackers:transmission.trackers,folders:transmission.torrents.folders};transmission.torrents.getallids(function(c){var d=[],e;for(e in c)d.push(c[e].id);c=transmission.torrents.getErrorIds(d,true);c.length>0?transmission.torrents.getallids(function(){system.resetTorrentInfos(b)},
c):system.resetTorrentInfos(b)},a)}},resetTorrentInfos:function(){transmission.torrents.status[transmission._status.stopped]?this.updateCount("paused",transmission.torrents.status[transmission._status.stopped].length):this.updateCount("paused",0);transmission.torrents.status[transmission._status.seed]?this.updateCount("sending",transmission.torrents.status[transmission._status.seed].length):this.updateCount("sending",0);transmission.torrents.status[transmission._status.check]?this.updateCount("check",
transmission.torrents.status[transmission._status.check].length):this.updateCount("check",0);transmission.torrents.status[transmission._status.download]?this.updateCount("downloading",transmission.torrents.status[transmission._status.download].length):this.updateCount("downloading",0);this.updateCount("actively",transmission.torrents.actively.length);this.updateCount("error",transmission.torrents.error.length);this.updateCount("warning",transmission.torrents.warning.length);system.reloading=false;
if(system.config.autoReload)system.autoReloadTimer=setTimeout(function(){system.reloadData()},system.config.reloadStep);this.updateCount("all",transmission.torrents.count);if(this.currentContentPage=="torrent-list"){var a=this.currentContentConfig;a.reload=true;this.showContent(a)}},updateCount:function(a,b){var c=$("#count-"+a);c.text(b);b==0?c.hide():c.show()},reloadData:function(){this.reloadSession();this.reloading=false;this.getServerStatus();this.reloading=false;this.reloadTorrentBaseInfos()},
showContent:function(a){var b={page:"",type:"",data:"",title:this.lang.system.title,reload:false,callback:null},c=null;if(typeof a=="string"){b.page=a;c=b}else c=jQuery.extend(b,a);if(!(c.page==this.currentContentPage&&!c.reload)){$("#content-"+c.page).show();c.page!=this.currentContentPage&&$("#content-"+this.currentContentPage).hide();$("#torrent-page-bar").hide();this.torrentListChecked||$("#torrent-toolbar").hide();this.currentContentPage=c.page;switch(c.type){case "torrent-list":c.title=this.lang.tree[c.data];
this.loadTorrentToList({target:c.data})}$("#page-title").text(c.title);c.reload=false;this.currentContentConfig=c;c.callback&&c.callback()}},getTorrentFromType:function(a){var b=null;switch(a){case "torrent-all":case "all":case "servers":b=transmission.torrents.all;break;case "paused":b=transmission.torrents.status[transmission._status.stopped];break;case "sending":b=transmission.torrents.status[transmission._status.seed];break;case "seedwait":b=transmission.torrents.status[transmission._status.seedwait];
break;case "check":b=transmission.torrents.status[transmission._status.check];break;case "checkwait":b=transmission.torrents.status[transmission._status.checkwait];break;case "downloading":b=transmission.torrents.status[transmission._status.download];break;case "downloadwait":b=transmission.torrents.status[transmission._status.downloadwait];break;case "actively":b=transmission.torrents.actively;break;case "error":b=transmission.torrents.error;break;case "warning":b=transmission.torrents.warning;break;
case "search-result":b=transmission.torrents.searchResult}return b},loadTorrentToList:function(a){if(!this.torrentListChecked)if(transmission.torrents.all){jQuery.extend({node:null,page:1,target:"all"},a);if(a.target){var b=this.getTorrentFromType(a.target);this.config.defaultSelectNode=a.target;this.saveConfig();var c=[];this.control.torrentlist.empty();for(var d in b)if(b[d]){var e=parseFloat(b[d].percentDone*100).toFixed(2),f=this.lang.torrent["status-text"][b[d].status];if(b[d].error!=0)f="<span class='text-status-error'>"+
f+"</span>";else if(b[d].warning)f="<span class='text-status-warning' title='"+b[d].warning+"'>"+f+"</span>";e={id:b[d].id,name:this.getTorrentNameBar(b[d]),totalSize:b[d].totalSize,percentDone:this.getTorrentProgressBar(e,b[d]),percentDoneNumber:e,status:f,addedDate:formatLongTime(b[d].addedDate),completeSize:b[d].totalSize-b[d].leftUntilDone,rateDownload:b[d].rateDownload,rateUpload:b[d].rateUpload,leecherCount:b[d].leecher,seederCount:b[d].seeder,uploadRatio:b[d].uploadRatio,uploadedEver:b[d].uploadedEver};
c.push(e)}if(c.length==0)setTimeout(function(){system.showContent("home")},100);else{if(this.torrentPager.onGotoPage==null)this.torrentPager.onGotoPage=function(g){system.control.torrentlist.empty();$("#torrent-toolbar").hide();for(var h in g)system.appendTorrentToList(g[h])};this.torrentPager.setDatas(c,a.target)}}}},appendTorrentToList:function(a){var b=$("<input id='torrent-"+a.id+"' type='checkbox'/>").attr("inited",0),c=$("<label for='torrent-"+a.id+"'>"+a.name+a.percentDone+"<span class='torrent-list-infos'>↓"+
formatSize(a.rateDownload,false,"speed")+" ↑"+formatSize(a.rateUpload,false,"speed")+"|"+formatSize(a.completeSize)+"/"+formatSize(a.totalSize)+"</span></label>");b.click(function(){system.changeTorrentToolbar(this,a)});c.appendTo(b);b.appendTo(this.control.torrentlist);b.checkboxradio({theme:"c"})},getTorrentNameBar:function(a){var b="",c=a.name;switch(a.status){case transmission._status.stopped:b="iconlabel icon-pause-small";break;case transmission._status.check:b="iconlabel icon-checking";break;
case transmission._status.download:b="iconlabel icon-down";break;case transmission._status.seed:b="iconlabel icon-up";break;case transmission._status.seedwait:case transmission._status.downloadwait:case transmission._status.checkwait:b="iconlabel icon-wait"}if(a.warning){b="iconlabel icon-warning-type1";c+="\n\n"+this.lang["public"]["text-info"]+": "+a.warning}if(a.error!=0){b="iconlabel icon-exclamation";c+="\n\n"+this.lang["public"]["text-info"]+": "+a.errorString}return'<span class="'+b+'" title="'+
c+'">'+a.name+"</span>"},getTorrentProgressBar:function(a,b){a+="%";var c="";switch(b.status){case transmission._status.stopped:c="torrent-progress-stop";break;case transmission._status.checkwait:case transmission._status.check:c="torrent-progress-check";break;case transmission._status.downloadwait:case transmission._status.download:c="torrent-progress-download";break;case transmission._status.seedwait:case transmission._status.seed:c="torrent-progress-seed"}if(b.warning)c="torrent-progress-warning";
if(b.error!=0)c="torrent-progress-error";return'<div class="torrent-progress" title="'+a+'"><div class="torrent-progress-text">'+a+'</div><div class="torrent-progress-bar '+c+'" style="width:'+a+';"></div></div>'},changeTorrentToolbar:function(a,b){if(this.control.torrentlist.find("input:checked").length>0){this.torrentListChecked=true;$("#torrent-toolbar").show()}else{this.torrentListChecked=false;$("#torrent-toolbar").hide()}this.currentTorrentId=b.id},torrentPager:{datas:null,pageSize:30,pageNumber:0,
pageCount:0,count:0,onGotoPage:null,currentDatas:null,pageBar:null,controls:{prev:null,next:null,number:null},head:"",init:function(a){this.pageBar=$("#torrent-page-bar");this.controls.next=this.pageBar.find("#page-next");this.controls.next.click(function(){system.torrentPager.gotoPage("next")});this.controls.prev=this.pageBar.find("#page-prev");this.controls.prev.click(function(){system.torrentPager.gotoPage("prev")});this.controls.number=this.pageBar.find("#page-number");a&&this.setDatas(a)},setDatas:function(a,
b){this.datas||this.init();this.datas=a;this.pageBar.show();this.count=this.datas.length;this.pageCount=parseInt(this.count/this.pageSize);this.count%this.pageSize>0&&this.pageCount++;this.pageCount==1&&this.pageBar.hide();this.head==b?this.gotoPage():this.gotoPage(1);this.head=b},gotoPage:function(a){if(typeof a=="number")this.pageNumber=a;else switch(a){case "next":this.pageNumber++;break;case "prev":this.pageNumber--}if(this.pageNumber>this.pageCount)this.pageNumber=this.pageCount;if(this.pageNumber<
1)this.pageNumber=1;a=(this.pageNumber-1)*parseInt(this.pageSize);var b=a+parseInt(this.pageSize);this.currentDatas=this.datas.slice(a,b);this.controls.number.text(this.pageNumber+"/"+this.pageCount);this.pageNumber>1?this.controls.prev.show():this.controls.prev.hide();this.pageNumber<this.pageCount?this.controls.next.show():this.controls.next.hide();this.onGotoPage&&this.onGotoPage(this.currentDatas)}},changeSelectedTorrentStatus:function(a,b){var c=this.control.torrentlist.find("input:checked"),
d=[];a||(a="start");for(var e=0;e<c.length;e++)d.push(parseInt(c[e].id.replace("torrent-","")));if(d.length>0){switch(a){case "remove":return;case "verify":if(rows.length==1){if(transmission.torrents.all[d[0].id].percentDone>0)if(confirm(system.lang.toolbar.tip["recheck-confirm"])==false)return}else if(confirm(system.lang.toolbar.tip["recheck-confirm"])==false)return}b=$(b);b.attr("disabled",true);transmission.exec({method:"torrent-"+a,arguments:{ids:d}},function(){b.attr("disabled",false);system.reloadTorrentBaseInfos()})}},
addTorrentsToServer:function(a,b,c,d,e){var f=b-a.length,g=a.shift();if(g){this.showStatus(this.lang.system.status.queue,b-f+1);transmission.addTorrentFromUrl(g,d,c,function(){system.addTorrentsToServer(a,b,c,d,e)})}else{this.showStatus(this.lang.system.status.queuefinish);this.getServerStatus();e&&e()}},showStatus:function(a,b){if(a){$("#status").show();$("#status-msg").html(a);$.isNumeric(b)?$("#status-count").html(b).show():$("#status-count").hide()}else $("#status").hide()}};
$(document).ready(function(){$.getScript("lang/_languages.js",function(){system.init(location.search.getQueryString("lang"))})});
