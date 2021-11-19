#!/bin/bash

set -e

AVAHI_HOST=${AVAHI_HOST:-"docker-default"}
AVAHI_DOMAIN=${AVAHI_DOMAIN:-"local"}

sed -i -e "s/^#host-name=.*/host-name=${AVAHI_HOST}/" /etc/avahi/avahi-daemon.conf
sed -i -e "s/^#domain-name=.*/domain-name=${AVAHI_DOMAIN}/" /etc/avahi/avahi-daemon.conf

#/usr/sbin/avahi-daemon &
/hydraplay/hydraplay.sh --config /tmp/hydra.config.json

