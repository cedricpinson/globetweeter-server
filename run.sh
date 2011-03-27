#!/bin/bash
#set -x

export NODE_PATH=twitter-node/lib

while true
do
    echo $(date) "server started"
    node app.js >>/var/log/twitter.log
    sleep 2
done
