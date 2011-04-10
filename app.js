var config = require('./config').settings;
var Twitter = require('twitter');

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
    access_token_secret: config.access_token_secret,
    locations: config.locations
});


function reconnect(reason) {
    console.log("reconnect for reason " + reason);
    TwitterStream.stream();
    receivedTweetFromLastCall = 1;
}

function quit(reason) {
    console.log("quit for reason " + reason);
    process.exit();
}


TwitterStream.addListener('error', function(error) {
    reconnect(error.message);
}).addListener('tweet', function(tweet) {
    receivedTweetFromLastCall += 1;
    //console.log("@" + tweet.user.screen_name + ": " + tweet.text);
    //console.dir(tweet);
}).addListener('end', function(resp) {
    reconnect("wave goodbye... " + resp.statusCode);
}).stream();

function tweet(data) {
    count++;
    if ( typeof data === 'string' )
	sys.puts(data);
    else if ( data.text && data.user && data.user.screen_name )
	sys.puts('"' + data.text + '" -- ' + data.user.screen_name);
    else if ( data.message )
	sys.puts('ERROR: ' + sys.inspect(data));
    else
	sys.puts(sys.inspect(data));
}

twitterStream.stream('statuses/filter', "locations=-180,-90,180,90", function(stream){
    stream.on('data', tweet);
});


if (false) {
    var express = require('express');
    var app = express.createServer(); 

    app.use(express.static(__dirname + '/public'));
    app.listen(Config.port, Config.ip);


    var io = require('socket.io');
    var socket = io.listen(app, {transport:['websocket', 'flashsocket', 'htmlfile', 'xhr-polling']} );
    socket.on('connection', function(client){ 
        stats.addConnection();

        var tweet2socket = function(TwitterStream) {
	    client.send(TwitterStream);
        };

        TwitterStream.addListener('tweet', tweet2socket);
        client.on('disconnect', function () {
	    TwitterStream.removeListener('tweet', tweet2socket);
            stats.removeConnection();
        });

    });

    function checkTweet() {
        if (receivedTweetFromLastCall === 0) {
            reconnect("no juice to press from last check");
        }
        receivedTweetFromLastCall = 0;
    }
}
//setInterval(checkTweet, 10000);
