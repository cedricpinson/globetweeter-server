var socket = new io.Socket(document.location.hostname);
socket.connect();
socket.on('message', function(message){
	$('<p>').text(message.user.name + ': ' + message.text).prependTo('#tweets')
    });
