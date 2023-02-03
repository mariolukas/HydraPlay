FROM debian:bullseye-slim as hydraplay
ARG TARGETARCH

#======================================= MOPIDY INSTALLATION ===================================================#
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ssl-cert \
    wget \
    curl \
    gcc  \
    gnupg \
    git \
    unzip \
    jq \
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
    libgirepository1.0-dev \
 && mkdir -p /usr/local/share/keyrings \
 && wget -q -O /usr/local/share/keyrings/mopidy-archive-keyring.gpg https://apt.mopidy.com/mopidy.gpg \
 && wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/buster.list \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        mopidy \
        mopidy-spotify \
        mopidy-tunein \
        mopidy-soundcloud \
 && python3 -m pip install setuptools \
 && python3 -m pip install https://github.com/natumbri/mopidy-youtube/archive/develop.zip \
 && python3 -m pip install --upgrade youtube-dl \
 && python3 -m pip install Mopidy-Bandcamp \
 && python3 -m pip install Mopidy-Local \
 && python3 -m pip install jinja2 tornado \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache

#======================================= INSTALL SPOTIFY WORKAROUND ==============================================#

# Install mopidy-spotify-gstspotify (Hack, not released yet!)
# (https://github.com/kingosticks/mopidy-spotify/tree/gstspotifysrc-hack)

RUN export GST_ARCH=$TARGETARCH \
  && if [ "$TARGETARCH" = "arm" ]; then GST_ARCH=${TARGETARCH}hf; fi \
  && curl -sLO https://github.com/mariolukas/gst-plugins-rs-builder/releases/download/2023-01-26/gst-plugin-spotify_0.9.8_${GST_ARCH}.deb \
  && dpkg -i gst-plugin-spotify_0.9.8_${GST_ARCH}.deb \
  && git clone --depth 1 -b gstspotifysrc-hack https://github.com/kingosticks/mopidy-spotify.git mopidy-spotify \
  && cd mopidy-spotify \
  && python3 setup.py install \
  && cd .. \
  && rm -rf mopidy-spotify

#======================================= HYDRAPLAY INSTALLATION ==================================================#

RUN export LATEST_RELEASE_VER=$(curl -sL https://api.github.com/repos/mariolukas/HydraPlay/releases/latest | jq -r ".tag_name") \
 && export LATEST_RELEASE_ZIP=$(curl -sL https://api.github.com/repos/mariolukas/HydraPlay/releases/latest | jq -r ".assets[].browser_download_url") \
 && wget ${LATEST_RELEASE_ZIP} \
 && mkdir -p /tmp/hydraplay \
 && mkdir -p /app \
 && unzip hydraplay-${LATEST_RELEASE_VER}.zip "src/*" -d /tmp/hydraplay/ \
 && cp -R /tmp/hydraplay/src/* /app/. \
 && rm hydraplay-${LATEST_RELEASE_VER}.zip \
 && rm -R /tmp/hydraplay

#======================================= SNAPCAST INSTALLATION ===================================================#

ARG SNAPCASTVERSION=0.26.0
ARG TARGETARCH

COPY docker/entrypoint.sh /entrypoint.sh
COPY src/hydraplay.sh /app/hydraplay.sh

RUN export SNAPCAST_ARCH=$TARGETARCH \
 && if [ "$TARGETARCH" = "arm" ]; then SNAPCAST_ARCH=${TARGETARCH}hf; fi \
 && apt-get update \
 && apt-get install -y libavahi-client3 libavahi-common3 libatomic1 \
 && wget https://github.com/badaix/snapcast/releases/download/v${SNAPCASTVERSION}/snapserver_${SNAPCASTVERSION}-1_${SNAPCAST_ARCH}.deb \
 && dpkg -i --force-all snapserver_${SNAPCASTVERSION}-1_${SNAPCAST_ARCH}.deb \
 && apt-get -f install -y\
 && mkdir -p /media \
 && mkdir -p /root/.config/snapcast/ \
 &&	touch /tmp/hydra.config.json \
 &&	chmod 664 /tmp/hydra.config.json \
 && chmod a+x /app/hydraplay.sh \
 && chmod a+x /entrypoint.sh \
 && apt-get remove -y  \
    wget \
    git \
    curl \
    jq \
    unzip \
    gcc \
    python3-pip \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache

#======================================= General Docker configs ===================================================#

EXPOSE 1705
EXPOSE 1704
EXPOSE 6670-6699
EXPOSE 8080
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]
