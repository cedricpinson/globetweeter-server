#!/bin/bash
#set -x

export NODE_PATH=/root/twitter-node/lib
cd /root/node-twitter-socketio/

while true
do
    ps ax >/tmp/ps
    grep 'node app.js' /tmp/ps
    if [ $? != "0" ]
    then
	echo $(date) "server seems down restart it"
	node app.js >>/var/log/twitter.log &
    else
	echo $(date) "server still running"
    fi
    #exit 0
    sleep 10
done
