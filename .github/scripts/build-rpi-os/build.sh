#!/bin/bash
USE_DOCKER=$2
IMAGE_TYPE=$1
# get pi-gen sources
git clone https://github.com/RPi-Distro/pi-gen
cd pi-gen
git fetch && git fetch --tags
git checkout 2021-05-07-raspbian-buster
cd ..

touch pi-gen/stage5/SKIP_IMAGES
touch pi-gen/stage5/SKIP

touch pi-gen/stage4/SKIP_IMAGES
touch pi-gen/stage4/SKIP

# modifiy orignal build script
#${ echo -n 'export FABSCANPI_STAGE="\$\{FABSCANPI_STAGE:-testing\}"\n export ENABLE_SWAPPING="\$\{ENABLE_SWAPPING:-1\}"\n'; cat build.sh; } > pi-gen/build.sh
export FABSCANPI_STAGE="${FABSCANPI_STAGE:-testing}"
export ENABLE_SWAPPING="${ENABLE_SWAPPING:-1}"

#copy config
cp config.$IMAGE_TYPE pi-gen/config

# copy fabscan stage
cp -R stage-hydraplay-$IMAGE_TYPE pi-gen/stage-fabscan

echo $OSTYPE

case "$OSTYPE" in
  darwin*)
	echo "Preparing sed to work with OSX"
	sed -i -e 's/sed -r/sed -E/g' pi-gen/build-docker.sh
	;;
esac

echo "Running build...."
cd pi-gen
if [[ $USE_DOCKER == "docker" ]]
then
  ./build-docker.sh
else
  ./build.sh
fi