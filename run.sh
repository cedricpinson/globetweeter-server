#!/bin/bash
#set -x

while true
do
    echo $(date) "server started"
    node app.js >>/var/log/twitter.log
    sleep 2
done
