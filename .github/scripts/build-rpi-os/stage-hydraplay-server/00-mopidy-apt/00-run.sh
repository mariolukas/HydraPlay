#!/bin/bash -e

# add Mopidy key  to apt
on_chroot curl -L https://apt.mopidy.com/mopidy.gpg | apt-key add -
on_chroot << EOF

# add Mopidy source list to apt
on_chroot curl -L https://apt.mopidy.com/mopidy.list -o /etc/apt/sources.list.d/mopidy.list
on_chroot << EOF

apt-get update
apt-get dist-upgrade -y

EOF