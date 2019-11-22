#!/bin/bash
pulseaudio --log-level=4 --log-target=stderr -v &
snapclient -h snapserver