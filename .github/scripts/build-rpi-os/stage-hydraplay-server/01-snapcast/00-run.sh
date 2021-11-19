#!/bin/bash -e

# add Mopidy key  to apt
on_chroot << EOF

wget https://github.com/badaix/snapcast/releases/download/v0.25.0/snapserver_0.25.0-1_armhf.deb
dpkg -i --force-all snapserver_0.25.0-1_armhf.deb

EOF