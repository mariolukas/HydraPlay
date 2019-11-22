# Reference : #https://github.com/opsxcq/docker-mopidy

FROM ubuntu:latest

RUN apt-get update && apt-get install apt-utils wget locales gettext-base git -y

ARG SNAPCASTVERSION=0.16.0

#======================================= MOPIDY INSTALLATION ====================================================#

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    pulseaudio websockify haproxy ssl-cert\
    curl gcc gnupg python python-pip python-crypto python-pykka \
    python-gst-1.0 \
    gstreamer1.0-plugins-bad gstreamer1.0-plugins-good gstreamer1.0-plugins-ugly gstreamer1.0-tools && \
    curl -L https://apt.mopidy.com/mopidy.gpg | apt-key add - && \
    curl -L https://apt.mopidy.com/mopidy.list -o /etc/apt/sources.list.d/mopidy.list && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    mopidy mopidy-soundcloud mopidy-spotify

RUN curl -L https://bootstrap.pypa.io/get-pip.py | python - && \
    pip install -U six && \
    pip install \
        Mopidy-Spotify \
        Mopidy-TuneIn \
        Mopidy-Local-Images


# User configuration
RUN useradd --system --uid 666 -M --shell /usr/sbin/nologin music && \
    mkdir -p /home/music/.config/mopidy/ && \
    mkdir /output /music &&\
    mkdir -p /hydraplay &&\
    mkdir -p /scripts &&\
    mkdir -p /templates

RUN chown -R music:music /home/music /output /music

#======================================= SNAPCAST INSTALLATION ===================================================#

RUN wget 'https://github.com/badaix/snapcast/releases/download/v'$SNAPCASTVERSION'/snapserver_'$SNAPCASTVERSION'_amd64.deb'

RUN dpkg -i --force-all 'snapserver_'$SNAPCASTVERSION'_amd64.deb'
RUN apt-get -f install -y

RUN mkdir -p /root/.config/snapcast/


#======================================= HydraPlay INSTALLATION ===================================================#

WORKDIR /tmp

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install nodejs && \
    npm install -g @angular/cli &&\
    git clone https://github.com/mariolukas/HydraPlay.git &&\
    cd HydraPlay && npm install && ng build && \
    cp -R /tmp/HydraPlay/dist/multiroom-snapcast-ui/* /hydraplay/.

#======================================= General Docker configs ===================================================#

RUN locale-gen en_US.UTF-8  
ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8  

EXPOSE 80
EXPOSE 443
EXPOSE 6600-6699
EXPOSE 1704

VOLUME /music
VOLUME /downloaded

WORKDIR /music

ENTRYPOINT ["/scripts/startup_server.sh"]