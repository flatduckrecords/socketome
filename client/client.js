var exampleSocket = new WebSocket("wss://robertmorrison.me:8080");
var i = document.getElementById("chatbox");
//var f = i.contentDocument;
//var w = i.contentWindow;
var v = document.querySelector("#talkbox").message;
//f.write('<link rel="stylesheet" type="text/css" href="chat.css">');

document.querySelector("#talkbox").addEventListener("submit", function(e){
	e.preventDefault();
	send(v.value);
	v.value = "";
});

console.log('Client start');

exampleSocket.onmessage = function (event) {
	
	var text = "";
	var msg = JSON.parse(event.data);
	var time = new Date(msg.date);
	var timeStr = time.toLocaleTimeString();
	if(msg.type == "chatter"){
		messageWrite(msg.text, 'notme', 'Client #'+msg.id);
	}	
	console.log(event.data, timeStr);
}

exampleSocket.onerror = function (event) {
	alert('error!');
}

window.onbeforeunload = function() {
	exampleSocket.close();
}

function send(message) {
	messageWrite(message, 'me', "Me");
	exampleSocket.send(message);
}

function messageWrite(message, cssclass, id) {
	var msg = document.createElement('DIV');
	msg.innerHTML = '<blockquote>' + message + '<cite>'+id+'</cite></blockquote>';
	msg.setAttribute('class', cssclass);
	i.appendChild(msg);
	i.scrollTop = i.scrollHeight;
  
}

function open(){
	exampleSocket.open();
}