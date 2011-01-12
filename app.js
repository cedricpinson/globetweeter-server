var TwitterNode = require('twitter-node').TwitterNode;
var twit = new TwitterNode({
    user: 'statistweets', 
    password: 'TwitterPsc80',
    locations: [ -180, -90, 180, 90 ]
});

twit.addListener('error', function(error) {
	console.log(error.message);
    }).addListener('tweet', function(tweet) {
//console.log("@" + tweet.user.screen_name + ": " + tweet.text);
//console.dir(tweet);
	}).addListener('end', function(resp) {
		console.log("wave goodbye... " + resp.statusCode);
	    
	    }).stream();

var express = require('express');
var app = express.createServer(); 
app.use(express.gzip());
app.use(express.staticProvider(__dirname + '/public'));
app.listen(22048, "192.168.100.231");


var io = require('socket.io');   
var socket = io.listen(app, {transport:['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'xhr-multipart']} );
socket.on('connection', function(client){ 
	var tweet2socket = function(twit) {
	    client.send(twit);
	};
	twit.addListener('tweet', tweet2socket);	
	client.on('disconnect', function () {
		twit.removeListener('tweet', tweet2socket);
	    });

    });