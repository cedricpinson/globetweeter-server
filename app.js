var TwitterNode = require('twitter-node').TwitterNode;
var twit = new TwitterNode({
	user: 'username', 
	password: 'password',
	locations: [ -12, 36.1, 27.3, 62.44 ]
    });
twit.addListener('error', function(error) {
	console.log(error.message);
    }).addListener('tweet', function(tweet) {
	    //console.log("@" + tweet.user.screen_name + ": " + tweet.text);
	}).addListener('end', function(resp) {
		console.log("wave goodbye... " + resp.statusCode);
	    }).stream();

var express = require('express');
var app = express.createServer(); 
app.use(express.staticProvider(__dirname + '/public'));
app.listen(3000);


var io = require('socket.io');   
var socket = io.listen(app);
socket.on('connection', function(client){ 
	var tweet2socket = function(twit) {
	    client.send(twit);
	};
	twit.addListener('tweet', tweet2socket);	
	client.on('disconnect', function () {
		twit.removeListener('tweet', tweet2socket);
	    });

    });