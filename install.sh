#!/bin/bash

SNAPCAST_ARCH=$(dpkg --print-architecture)
SNAPCASTVERSION=0.26.0
clear

# Set up the shell variables for colors
# http://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux
yellow=`tput setaf 3`;
green=`tput setaf 2`;
clear=`tput sgr0`;


echo "${green}"
echo "============================================"
echo ""
echo "Install Required Packages"
echo ""
echo "============================================"
echo "${clear}"

apt-get update

apt-get install -y ssl-cert \
    wget \
    curl \
    gcc  \
    gnupg \
    zip \
    ca-certificates \
    python3 \
    python3-pip \
    python3-crypto \
    python3-setuptools \
    python3-pykka  \
    python3-gst-1.0 \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-tools


echo "${green}"
echo "============================================"
echo ""
echo "Configure Mopidy Repository"
echo ""
echo "============================================"
echo "${clear}"

mkdir -p /usr/local/share/keyrings
wget -q -O /usr/local/share/keyrings/mopidy-archive-keyring.gpg https://apt.mopidy.com/mopidy.gpg
wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/buster.list


echo "${green}"
echo "============================================"
echo ""
echo "Install Mopidy & Extensions from deb Packages"
echo ""
echo "============================================"
echo "${clear}"

apt-get update
apt-get install -y \
        mopidy \
        mopidy-tunein \
        mopidy-soundcloud

echo "${green}"
echo "============================================"
echo ""
echo "Install Mopidy additional Extensions from PyPi"
echo ""
echo "============================================"
echo "${clear}"

python3 -m pip install https://github.com/natumbri/mopidy-youtube/archive/develop.zip
python3 -m pip install --upgrade youtube-dl
python3 -m pip install Mopidy-Bandcamp
python3 -m pip install jinja2 tornado

echo "${green}"
echo "============================================"
echo ""
echo "Install Snapcast Server"
echo ""
echo "============================================"
echo "${clear}"

apt-get update
apt-get install libavahi-client3 libavahi-common3 libatomic1
wget https://github.com/badaix/snapcast/releases/download/v${SNAPCASTVERSION}/snapserver_${SNAPCASTVERSION}-1_${SNAPCAST_ARCH}.deb
dpkg -i --force-all snapserver_${SNAPCASTVERSION}-1_${SNAPCAST_ARCH}.deb
apt-get -f install -y

# install spotify workaround
# Install mopidy-spotify-gstspotify (Hack, not released yet!)
# (https://github.com/kingosticks/mopidy-spotify/tree/gstspotifysrc-hack)

echo "${green}"
echo "============================================"
echo ""
echo "Install Spotify Workaround"
echo ""
echo "============================================"
echo "${clear}"

curl -sLO https://github.com/mariolukas/gst-plugins-rs-builder/releases/download/2023-01-25/gst-plugin-spotify_0.9.8_amd64.deb
dpkg -i gst-plugin-spotify_0.9.7_amd64.deb
git clone --depth 1 -b gstspotifysrc-hack https://github.com/kingosticks/mopidy-spotify.git mopidy-spotify
cd mopidy-spotify
python3 setup.py install
cd ..
rm -rf mopidy-spotify

echo "${green}"
echo "============================================"
echo ""
echo "Install HydraPlay"
echo ""
echo "============================================"
echo "${clear}"

cd  tmp
mkdir source
cd source

curl -s https://api.github.com/repos/mariolukas/HydraPlay/releases/latest \
| grep "hydraplay-.*zip" \
| cut -d : -f 2,3 \
| tr -d \" \
| wget -qi -

unzip *.zip

python3 setup.py install

echo "${green}"
echo "============================================"
echo ""
echo "Installation Finished."
echo ""
echo "============================================"
echo "${clear}"

tail -F /dev/null