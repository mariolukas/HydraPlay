FROM debian:buster-slim

#COPY requirements.txt requirements.txt
COPY entrypoint.sh /entrypoint.sh

#======================================= MOPIDY INSTALLATION ===================================================#
RUN apt-get update  \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends  \
    ssl-cert \
    wget \
    curl \
    gcc  \
    gnupg \
    python3 \
    python3-pip \
    python3-tornado \
    python3-jinja2 \
    python3-setuptools \
    python3-crypto \
    gstreamer1.0-plugins-bad \
 && curl -L https://apt.mopidy.com/mopidy.gpg | apt-key add - \
 && curl -L https://apt.mopidy.com/mopidy.list -o /etc/apt/sources.list.d/mopidy.list \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        mopidy \
        mopidy-spotify \
        mopidy-tunein \
        mopidy-soundcloud \
 && python3 -m pip install https://github.com/natumbri/mopidy-youtube/archive/develop.zip \
 && python3 -m pip install --upgrade youtube-dl

#======================================= SNAPCAST INSTALLATION ===================================================#

ARG SNAPCASTVERSION
ARG ARCH

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libavahi-client3 \
    libavahi-common3 \
    libsoxr0 \
 && wget https://github.com/badaix/snapcast/releases/download/v${SNAPCASTVERSION}/snapserver_${SNAPCASTVERSION}-1_${ARCH}.deb \
 && dpkg -i --force-all snapserver_${SNAPCASTVERSION}-1_${ARCH}.deb \
 && apt-get -f install -y \
 && mkdir -p /root/.config/snapcast/ \
 &&	mkdir -p /hydraplay \
 &&	touch /tmp/hydra.config.json \
 &&	chmod 664 /tmp/hydra.config.json \
 && chmod a+x /entrypoint.sh \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache

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
