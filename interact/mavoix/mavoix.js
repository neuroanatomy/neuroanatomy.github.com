var speech=window.speechSynthesis;
var voices=speech.getVoices();
var myvoice={
	library:[],
	collection:[],
	log:[],
	state:{
		showLibrary:false,
		showCollection:[],
		showStatistics:false,
		selectedCollection:""
	}
};
var dbroot="http://siphonophore.org/Interact/php/interact.php";
var count=0;

//startFirebug();

function displayInterface() {
	var flag=0;
	for(var i=0;i<myvoice.state.showCollection.length;i++) {
		myvoice.state.showCollection[i]?$('#cid'+i).show():$('#cid'+i).hide();
		flag+=myvoice.state.showCollection[i];
	}
	flag?$('#collections').show():$('#collections').hide();
	myvoice.state.showLibrary?$('#library').show():$('#library').hide();
	myvoice.state.showStatistics?$('#statistics').show():$('#statistics').hide();
}

$('#show-lib').click(function(){
	for(var i=0;i<myvoice.state.showCollection.length;i++)
		myvoice.state.showCollection[i]=false;
	myvoice.state.showLibrary=true;
	myvoice.state.showStatistics=false;
	displayInterface();
});
$('#show-stats').click(function(){
	for(var i=0;i<myvoice.state.showCollection.length;i++)
		myvoice.state.showCollection[i]=false;
	myvoice.state.showLibrary=false;
	myvoice.state.showStatistics=true;
	displayInterface();
	displayStatistics();
});

$("#add-lib").click(function(){
	// add action to library
	var name=prompt("Action name:");
	var h=hash(name);
	var a={id:h,name:name}
	if(indexOfAction(myvoice.library,a)>=0) {
		alert("Action exists already in the library");
		return;
	}
	addActionToLibrary(a);
});
$("#add-col").click(function(){
	// action to add collection to interface
	var name=prompt("Collection name:");
	var h=hash(name);
	var c={id:h,name:name}
	if(indexOfAction(myvoice.collection,c)>=0) {
		alert("Collection exists already");
		return;
	}
	addCollection(c);
});
$("#play").click(function() {
	var arr=$("#voice .action");
	var i=0;
	var f=function(val) {
		$(arr[val])
		.animate({width:"210px",height:"210px",marginLeft:"-=5px",marginTop:"-=5px"},"fast")
		.animate({width:"200px",height:"200px",marginLeft:"+=5px",marginTop:"+=5px"},"fast");
		
		var utterance=new SpeechSynthesisUtterance($(arr[val]).find("span").text());
		//utterance.voice=speech.getVoices()[5]; //51
		
		utterance.voice = speech.getVoices().filter(function(voice) { return voice.name == 'Amelie'; })[0];
		console.log(utterance.voice);

		speech.speak(utterance);

		val++;		
		setTimeout(function(){if(val<arr.length) f(val);},500);
	}
	f(0);
});
$("#clear").click(function() {
	var arr=$("#voice .action");
	for(var i=0;i<arr.length;i++) {
		var cid=$(arr[i]).attr('data-cid');
		var el=$(arr[i]).detach();
		$("#"+cid).append(el);
	}
});

function indexOfAction(arr,elem) {
	for(var i=0;i<arr.length;i++) {
		if(arr[i].id==elem.id)
			return i;
	}
	return undefined;
}
function indexOfCollection(cid) {
	for(var i=0;i<myvoice.collection.length;i++) {
		if(myvoice.collection[i].cid==cid)
			return i;
	}
	return undefined;
}
function hash(str) {
	var i,v0,v1,abc="0123456789" +"abcdefghijklmnopqrstuvwxyz" +"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	v0=0;
	for(i=0;i<str.length;i++) {
		v1=str.charCodeAt(i);
		v0+=v0+v0^v1;
	}
	var sz=abc.length,v,res="";
	for(i=0;i<5;i++) {
		v1=parseInt(v0/sz);
		v=Math.abs(v0-v1*sz);
		res+=abc[v];
		v0=v1;
	}
	return res;
}
function hashColor(name) {
    //if(debug) console.log("> regionHashColor");

	var h=0,h1;
	for(var i=0;i<name.length;i++) {
		h1=name.charCodeAt(i);
		h+=h+h^h1;
	}
    var color = {};

    // add some randomness
    h = Math.sin(h++)*10000;
    h = 0xffffff*(h-Math.floor(h));

    color.red = h&0xff;
    color.green = (h&0xff00)>>8;
    color.blue = (h&0xff0000)>>16;
    
    color.red = parseInt(255*0.6+color.red*0.4);
    color.green = parseInt(255*0.6+color.green*0.4);
    color.blue = parseInt(255*0.6+color.blue*0.4);
    console.log(color);
    return color;
}

function startFirebug() {
	var fb = document.createElement('script');
	fb.type = 'text/javascript';
	fb.src = 'https://getfirebug.com/firebug-lite.js#startOpened';
	document.getElementsByTagName('body')[0].appendChild(fb);
}

function addCollection(obj) {
	// add collection to interface
	// todo: code to add the collection div with id=cid, and
	// the tab button with data-cid= the numeic part of the cid
	var cid="cid"+count;
	var name="Collection "+(count+1);
	var color;
	if(obj) {
		if(obj.cid) cid=obj.cid;
		if(obj.name) name=obj.name;
		if(obj.color) color=obj.color;
	}
	myvoice.collection.push({
		cid:cid,
		name:name,
		hash:hash(name),
		actions:[]
	});
	myvoice.state.showCollection.push(false);
	
	if(!color) color=hashColor(name);
	// add collection content div
	$("#content").prepend([
		"<div class='collection'",
		"ondrop='drop(event)' ",
		"ondragover='dragOver(event)' ",
		"ondragleave='dragLeave(event)' ",
		"style='background-color:rgb("+color.red+","+color.green+","+color.blue+")'",
		"id='",cid,"'>",
		"</div>"].join(""));
	
	// add collection tab button
	$("#tabs").prepend([
		"<button class='show-col' ",
		"onclick='showCollection(this)' ",
		"style='background-color:rgb("+color.red+","+color.green+","+color.blue+")'",
		"data-cid=",count,">",
		name,
		"</button>"
	].join(""));
	
	count++;
	return cid;
}
function showCollection(c) {
	var cid="cid"+$(c).data("cid");
	var j=indexOfCollection(cid);
	myvoice.state.selectedCollection=cid;
	for(var i=0;i<myvoice.state.showCollection.length;i++)
		myvoice.state.showCollection[i]=false;
	myvoice.state.showCollection[j]=true;
	displayInterface();
};

function drag(ev) {
	$(ev.target).closest("div").attr("id","moving");
    ev.dataTransfer.setData("text", "moving");
    ev.dataTransfer.setData("cid", $(ev.srcElement).closest("div").attr("data-cid"));
}
function dragOver(ev) {
    ev.preventDefault();
    $(ev.currentTarget).addClass("pressed");
}
function dragLeave(ev) {
    ev.preventDefault();
    $(ev.currentTarget).removeClass("pressed");
}
function drop(ev) {
	ev.preventDefault();
	var cid = ev.dataTransfer.getData("cid");
	var srcid = ev.dataTransfer.getData("text");
	var dstid=$(ev.currentTarget).attr('id');
	var j=indexOfCollection(cid);
	var collection=myvoice.collection[j].actions;
    
	var action=collection[indexOfAction(collection,{id:$("#"+srcid).data().id})];
	var destName;
	var i=indexOfCollection(dstid);
	if(i) {
		destName=myvoice.collection[i].name;
	} else {
		destName="Voice Zone";
	}
	var action={actionID:action.id,actionName:action.name,destID:dstid,destName:destName,time:new Date()}; // todo: more meaningful and stable information about the collection
	myvoice.log.push(action);
	$.ajax({
		url:dbroot,
		type:"POST",
		data:{
			"action":"save",
			"origin":JSON.stringify("myvoice-dev"),
			"key":"action",
			"value":JSON.stringify(action)
		},
		success: function(data) {
			console.log("< interactSave: logged action "+action);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("< interactSave: ERROR: "+textStatus+" "+errorThrown);
		}
	});

	var el=$("#"+srcid).detach();
	$("#"+dstid).append(el);
    $("#"+dstid).removeClass("pressed");
    $("#"+srcid).removeAttr('id');
}

function addActionToCollection(a,cid) {
	var i=indexOfCollection(cid);

	myvoice.collection[i].actions.push(a);
	
	var newAction=$("#action-template").clone();
	newAction.removeAttr('id');
	newAction.addClass(a.id);
	newAction.attr({'data-id':a.id});
	newAction.find("span.name").text(a.name);
	newAction.find("img").attr("src","library/"+a.id+"/"+a.id+".png");
	newAction.appendTo(".collection#"+cid);
	
	newAction.find('.edit-lib').click(function(){
		alert("[This should allow to edit the action, its icon for example]")
	});
	
	newAction.attr({
		draggable:true,
		ondragstart:'drag(event)',
		"data-cid":cid
	});


/*
	var newAction=$('#library .'+a.id);
	newAction.find('.add-col').attr('disabled',true);
	var collectionAction=newAction.clone(true).appendTo(".collection#"+cid);
	
	collectionAction.attr({
		draggable:true,
		ondragstart:'drag(event)',
		"data-cid":cid
	});
*/
}

function displayStatistics() {
	var i;
	$('#statistics').html('<table>');
	for(i=0;i<myvoice.log.length;i++) {
		var time=new Date(myvoice.log[i].time);
		$('#statistics').append(
			'<tr>'+
			'<td>'+myvoice.log[i].actionID+'</td>'+
			'<td>'+myvoice.log[i].actionName+'</td>'+
			'<td>'+myvoice.log[i].destID+'</td>'+
			'<td>'+myvoice.log[i].destName+'</td>'+
			'<td>'+time.toTimeString()+'</td>'+
			'</tr>');
	}
	$('#statistics').append('</table>');
}
/*
function configure(stored) {
	console.log(stored);
	var i;

	// add actions to library
	for(i=0;i<stored.library.length;i++) {
		addActionToLibrary(stored.library[i]);
	}
	// add collections and its actions
	for(i in stored.collection) {
		var c=stored.collection[i];
		addCollection(c);
		for(j in stored.collection[i].actions) {
			addActionToCollection(stored.collection[i].actions[j],c.cid);
		}
	}
	myvoice.state=stored.state;
	// load log
	myvoice.log=stored.log;
}
*/
function enterLogin() {
	var n=$("#user-name").val();
	var p=$("#user-password").val();
	
	if(n=="demo" && p=="or die") {
		loadUser();
	}
}

/*$(window).bind('load', function() {*/
function loadUser() {
	localStorage.mavoix=JSON.stringify(new Date());

	$("#splash").remove();
	$("#tabs").show();
	$("#content").show();
	displayInterface();

	/*
	var stored=localStorage.getItem('myvoice');
	if(stored!=undefined) {
		console.log(stored);
		stored=JSON.parse(stored);
		configure(stored);
	}
	else
		$('body').append('localStorage is empty<br/>');
	myvoice.state.selectedCollection=myvoice.collection[0].cid;
	displayInterface();
	*/
	myvoice.state.showCollection=[];
	myvoice.log=[];

	$.getJSON("config.json",function(data) {
		var i;
		for(i=0;i<data.collections.length;i++) {
			var c=data.collections[i];
			addCollection(c);
			for(j=0;j<c.images.length;j++) {
				addActionToCollection(c.images[j],c.cid);
			}
		}
		var cid=data.defaults.collection;
		var j=indexOfCollection(cid);
		myvoice.state.selectedCollection=cid;
		for(var i=0;i<myvoice.state.showCollection.length;i++)
			myvoice.state.showCollection[i]=false;
		myvoice.state.showCollection[j]=true;
		displayInterface();
	});
}
$(window).unload(function(){
	localStorage.setItem('myvoice',JSON.stringify(myvoice));
});

// If last login is more recent than 2 hours, just enter
var date_last=null;
var date_now=new Date();
if(localStorage.mavoix) {
	date_last=new Date(JSON.parse(localStorage.mavoix));
}
if(date_last && date_now) {
	var diff_in_hours=(date_now-date_last)/1000/60/60;
	if(diff_in_hours<1)
		loadUser();
}

