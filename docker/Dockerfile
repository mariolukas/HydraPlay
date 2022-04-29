FROM node:16-alpine as build-frontend

RUN mkdir -p /ui

WORKDIR /ui

COPY src/ui/package.json /ui
COPY src/ui/package-lock.json /ui
COPY src/hydraplay /hydraplay
RUN npm install -g @angular/cli -g --silent

RUN npm ci

COPY src/ui /ui

RUN ng build


FROM debian:bullseye-slim as hydraplay

#======================================= MOPIDY INSTALLATION ===================================================#
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ssl-cert \
    wget \
    curl \
    gcc  \
    gnupg \
    ca-certificates \
    python3 \
    python3-pip \
    python3-cryptography \
    python3-setuptools \
    python3-pykka  \
    python3-gst-1.0 \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-tools \
 && mkdir -p /usr/local/share/keyrings \
 && wget -q -O /usr/local/share/keyrings/mopidy-archive-keyring.gpg https://apt.mopidy.com/mopidy.gpg \
 && wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/buster.list \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        mopidy \
        mopidy-spotify \
        mopidy-tunein \
        mopidy-soundcloud \
 && python3 -m pip install https://github.com/natumbri/mopidy-youtube/archive/develop.zip \
 && python3 -m pip install --upgrade youtube-dl \
 && python3 -m pip install Mopidy-Bandcamp \
 && python3 -m pip install jinja2 tornado \
 && apt-get remove -y \
    curl \
    gcc \
    python3-pip \
    python3-setuptools \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache

#======================================= SNAPCAST INSTALLATION ===================================================#

ARG SNAPCASTVERSION=0.26.0
ARG TARGETARCH

COPY docker/entrypoint.sh /entrypoint.sh
COPY src/hydraplay.sh /app/hydraplay.sh

RUN export SNAPCAST_ARCH=$TARGETARCH \
 && if [ "$TARGETARCH" = "arm" ]; then SNAPCAST_ARCH=${TARGETARCH}hf; fi \
 && apt-get update \
 && apt-get install libavahi-client3 libavahi-common3 libatomic1 \
 && wget https://github.com/badaix/snapcast/releases/download/v${SNAPCASTVERSION}/snapserver_${SNAPCASTVERSION}-1_${SNAPCAST_ARCH}.deb \
 && dpkg -i --force-all snapserver_${SNAPCASTVERSION}-1_${SNAPCAST_ARCH}.deb \
 && apt-get -f install -y\
 && mkdir -p /app \
 && mkdir -p /root/.config/snapcast/ \
 &&	touch /tmp/hydra.config.json \
 &&	chmod 664 /tmp/hydra.config.json \
 && chmod a+x /app/hydraplay.sh \
 && chmod a+x /entrypoint.sh \
 && apt-get remove -y  \
    wget \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache

COPY --from=0 /hydraplay /app/hydraplay

#======================================= General Docker configs ===================================================#

EXPOSE 1705
EXPOSE 1704
EXPOSE 6000-7000
EXPOSE 8080
EXPOSE 80
EXPOSE 443
EXPOSE 5353
EXPOSE 32768-61000

ENTRYPOINT ["/entrypoint.sh"]
