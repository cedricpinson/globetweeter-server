var TwitterNode = require('twitter-node').TwitterNode;
var twit = new TwitterNode({
    user: '*', 
    password: '*',
    locations: [ -180, -90, 180, 90 ]
});

function quit(reason) {
    console.log("quit for reason " + reason);
    process.exit();
}

var receivedTweetFromLastCall = 0;

twit.addListener('error', function(error) {
    quit(error.message);
}).addListener('tweet', function(tweet) {
    receivedTweetFromLastCall += 1;
    //console.log("@" + tweet.user.screen_name + ": " + tweet.text);
    //console.dir(tweet);
}).addListener('end', function(resp) {
    quit("wave goodbye... " + resp.statusCode);
}).stream();

var express = require('express');
var app = express.createServer(); 
app.use(express.gzip());
app.use(express.staticProvider(__dirname + '/public'));
app.listen(22048, "192.168.100.231");


var io = require('socket.io');
var socket = io.listen(app, {transport:['websocket', 'flashsocket', 'htmlfile', 'xhr-polling']} );
socket.on('connection', function(client){ 
    var tweet2socket = function(twit) {
	client.send(twit);
    };
    twit.addListener('tweet', tweet2socket);
    client.on('disconnect', function () {
	twit.removeListener('tweet', tweet2socket);
    });

});

function checkTweet() {
    if (receivedTweetFromLastCall === 0) {
        quit("no juice to press from last 4 seconds");
    }
    receivedTweetFromLastCall = 0;
}

setInterval(checkTweet, 4000);
