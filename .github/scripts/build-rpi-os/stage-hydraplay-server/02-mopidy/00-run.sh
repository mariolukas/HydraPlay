#!/bin/bash -e
# add Mopidy key  to apt
on_chroot << EOF

apt-get update
apt-get dist-upgrade -y

EOF