#!/bin/bash

#configure haproxy +ssl
cat /etc/ssl/certs/ssl-cert-snakeoil.pem /etc/ssl/private/ssl-cert-snakeoil.key > /etc/ssl/snakeoil.pem
envsubst < /templates/haproxy.conf.tmpl > /etc/haproxy/haproxy.conf
mkdir -p /run/haproxy/ && haproxy -f /etc/haproxy/haproxy.conf &

for ((i=1;i<=$NUMBER_OF_STREAMS;i++));
do 
    # Generate mopidy configs and start stream for instance
    export MPD_PORT=$(( 6600 + $i ))
    export HTTP_PORT=$(( 6680 + $i ))
    export STREAM_FIFO="stream_"$i".fifo"

    # create stream variable for snapcast server config
    CURRENT_STREAM="
    stream = pipe:///tmp/${STREAM_FIFO}?name=STREAM${i}&mode=create
    "    

    SNAP_STREAM_CONFIG=$SNAP_STREAM_CONFIG$CURRENT_STREAM

    # generate mopidy configs from mopidy config template
    envsubst < /templates/mopidy.conf.tmpl > /etc/mopidy/mopidy_stream_${i}.conf
   
done;


# generate Snapcast server config from template
export SNAPCAST_STREAMS=$SNAP_STREAM_CONFIG
envsubst < /templates/snapserver.conf.tmpl > /etc/snapserver.conf

# start snapserver ( before mopidy because it creates the pipes)
snapserver &

# start mopidy intances... 
for ((i=1;i<=$NUMBER_OF_STREAMS;i++));
do 
 /usr/bin/mopidy --quiet --config /etc/mopidy/mopidy_stream_$i.conf &
done;

# start websockify
websockify 8080 --wrap-mode=respawn 127.0.0.1:1705 --web=/hydraplay 