#!/bin/bash

/usr/bin/mopidy --quiet --config /etc/mopidy/mopidy-stream1.conf &
/usr/bin/mopidy --quiet --config /etc/mopidy/mopidy-stream2.conf &
/usr/bin/mopidy --quiet --config /etc/mopidy/mopidy-stream3.conf &
snapserver