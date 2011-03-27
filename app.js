var Config = require('./config').settings;
var TwitterNode = require('twitter-node').TwitterNode;

var receivedTweetFromLastCall = 0;
var Stats = {};
(function() {
    var currentNumberConnectedClients = 0;

    Stats.addConnection = function() {
        currentNumberConnectedClients += 1;
        console.log("Current Nb Connection " + currentNumberConnectedClients);
    };
    Stats.removeConnection = function () {
        currentNumberConnectedClients -= 1;
        console.log("Current Nb Connection " + currentNumberConnectedClients);
    };
})();

var TwitterStream = new TwitterNode({
    user: Config.user, 
    password: Config.password,
    locations: Config.locations
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

var express = require('express');
var app = express.createServer(); 
//app.use(express.gzip());
app.use(express.static(__dirname + '/public'));
app.listen(Config.port, Config.ip);


var io = require('socket.io');
var socket = io.listen(app, {transport:['websocket', 'flashsocket', 'htmlfile', 'xhr-polling']} );
socket.on('connection', function(client){ 
    Stats.addConnection();

    var tweet2socket = function(TwitterStream) {
	client.send(TwitterStream);
    };

    TwitterStream.addListener('tweet', tweet2socket);
    client.on('disconnect', function () {
	TwitterStream.removeListener('tweet', tweet2socket);
        Stats.removeConnection();
    });

});

function checkTweet() {
    if (receivedTweetFromLastCall === 0) {
        reconnect("no juice to press from last check");
    }
    receivedTweetFromLastCall = 0;
}

setInterval(checkTweet, 10000);
