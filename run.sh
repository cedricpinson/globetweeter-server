#!/bin/bash
#set -x

export NODE_PATH=/root/twitter-node/lib
cd /root/node-twitter-socketio/

while true
do
    echo $(date) "server started"
    node app.js >>/var/log/twitter.log
    sleep 2
done
