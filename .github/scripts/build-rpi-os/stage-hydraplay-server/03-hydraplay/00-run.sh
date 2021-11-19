#!/bin/bash -e

# install python requirements.
on_chroot << EOF

pip3 install tornado jinja2

# install hydraplay
mkdir -p /home/hydraplay
cd /home/hydraplay
git clone https://github.com/mariolukas/HydraPlay
cd HydraPlay
python3 setup.py install

# install default config file
mkdir /etc/hydraplay
cp /home/hydraplay/HydraPlay/src/extras/hydraplay.config.json /etc/hydraplay/.

# configure log folders
mkdir /var/log/hydraplay
touch /var/log/hydraplay/hydraplay.log
chmod 644 /var/log/hydraplay/hydraplay.log

# configure logroate
cp /home/hydraplay/HydraPlay/src/extras/hydraplay.logrotate /etc/logrotate.d/.

# install and enable service script
cp /home/hydraplay/HydraPlay/src/extras/hydraplay.service /etc/systemd/system/hydraplay.service
systemctl enable hydraplay

EOF