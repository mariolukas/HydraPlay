#!/bin/bash -e

on_chroot << EOF

curl -L https://apt.mopidy.com/mopidy.gpg | apt-key add -
# add Mopidy source list to apt
curl -L https://apt.mopidy.com/mopidy.list -o /etc/apt/sources.list.d/mopidy.list


apt-get update
apt-get dist-upgrade -y
EOF