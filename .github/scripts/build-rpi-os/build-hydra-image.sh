#!/bin/bash

IMAGE_TYPE=$1
# get pi-gen sources
git clone https://github.com/RPi-Distro/pi-gen
cd pi-gen
git fetch && git fetch --tags
git checkout 2021-05-07-raspbian-buster
cd ..

touch ./pi-gen/stage3/SKIP
touch ./pi-gen/stage4/SKIP
touch ./pi-gen/stage5/SKIP

touch ./pi-gen/stage4/SKIP_IMAGES
touch ./pi-gen/stage5/SKIP_IMAGES

sed -i 's/:bullseye/:buster/' ./pi-gen/build-docker.sh
sed -i 's/:bullseye/:buster/' ./pi-gen/Dockerfile

# modifiy orignal build script
#export HYDRAPLAY_STAGE="${HYDRAPLAY_STAGE:-testing}"
#export ENABLE_SWAPPING="${ENABLE_SWAPPING:-1}"

#copy config
cp config.$IMAGE_TYPE pi-gen/config

# copy hydraplay stage
cp -a -R stage-hydraplay-$IMAGE_TYPE/. pi-gen/stage-hydraplay/

echo $OSTYPE

case "$OSTYPE" in
  darwin*)
	echo "Preparing sed to work with OSX"
	sed -i -e 's/sed -r/sed -E/g' pi-gen/build-docker.sh
	echo "patching pi-gen/scripts/dependencies_check for OSX"
  patch -f -u pi-gen/scripts/dependencies_check -i patch/dependencies_check.patch
	;;
esac

cd pi-gen
./build-docker.sh
