#!/bin/bash
if ! pgrep -x "avahi-daemon" > /dev/null
then
    ./avahi.sh &
else
    echo "avahi-daemon already running"
fi

python3 /hydraplay/main.py