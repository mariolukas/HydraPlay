#!/bin/bash -e

# add Mopidy key  to apt
on_chroot wget https://github.com/badaix/snapcast/releases/download/v${SNAPCASTVERSION}/snapserver_0.25.0-1_armhf.deb
on_chroot << EOF

on_chroot dpkg -i --force-all snapserver_0.25.0-1_armhf.deb
on_chroot << EOF

EOF