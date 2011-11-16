var config = require('./config').settings;
var Twitter = require('twitter');
var sys = require('sys');
var streamError = false;
var receivedTweetFromLastCall = 0;
var stats = {};
(function() {
    var currentNumberConnectedClients = 0;

    stats.addConnection = function() {
        currentNumberConnectedClients += 1;
        console.log("Current Nb Connection " + currentNumberConnectedClients);
    };
    stats.removeConnection = function () {
        currentNumberConnectedClients -= 1;
        console.log("Current Nb Connection " + currentNumberConnectedClients);
    };
})();

var twitterStream = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
    //locations: config.locations
});

var clients = [];

function tweet(data) 
{
    receivedTweetFromLastCall += 1;
    if ( typeof data === 'string' )
	sys.puts(data);
    else if ( data.text && data.user && data.user.screen_name ) {
	for ( var i = 0, l = clients.length; i < l; i++) {
	    var f = clients[clients[i]];
	    f(data);
	}
	//sys.puts(user.screen_name);
	//sys.puts('"' + data.text + '" -- ' + data.user.screen_name);
    } else if ( data.message )
	sys.puts('ERROR: ' + sys.inspect(data));
    else
	sys.puts(sys.inspect(data));
}

function reconnect(reason) {
    console.log("would need to reconnect for reason " + reason);
    process.exit();
    //connect();
    //receivedTweetFromLastCall = 1;
}


//statuses/filter
//twitterStream.stream('statuses/filter', config.filters, function(stream) {
twitterStream.stream('statuses/filter', {locations: "-180,-90,180,90"}, function(stream) {

    stream.addListener('error', function(error) {
	console.log("error : " + sys.inspect(error));
	streamError = true;
    });
    stream.addListener('end', function() {
	reconnect("wave goodbye... ");
	process.exit();
    });
    stream.addListener('data', tweet);

});


var express = require('express');
var app = express.createServer(); 

app.use(express.static(__dirname + '/public'));
app.listen(config.port, config.ip);


if (false) {
    var io = require('socket.io');
    var socket = io.listen(app, {transport:['websocket', 'flashsocket']} );
    socket.on('connection', function(client){
	console.log("connection - current clients " + clients.length);

	if (streamError) {
	    client.disconnect();
	}

	stats.addConnection();

	var tweet2socket = function(tweet) {
	    client.send(tweet);
	};

	clients.push(client.id);
	clients[client.id] = tweet2socket;
	client.on('disconnect', function () {
	    for ( var i = 0, l = clients.length; i < l; i++) {
		if (clients[i] === client.id) {
		    clients.splice(i, 1);
		}
	    }
	    delete clients[client.id];
	    console.log("disconnect - current clients " + clients.length);
            stats.removeConnection();
	});

    });
}

function checkTweet() {
    if (receivedTweetFromLastCall === 0) {
        reconnect("no juice to press from last check");
    }
    receivedTweetFromLastCall = 0;
}

setInterval(checkTweet, 10000);
