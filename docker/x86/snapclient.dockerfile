FROM ubuntu:latest

ARG SNAPCASTVERSION=0.16.0

RUN apt-get update && apt-get install -y \
    wget \
	alsa-utils \
	libasound2 \
	libasound2-plugins \
	pulseaudio \
	pulseaudio-utils \
    libavahi-client-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/pulseaudio
RUN useradd --create-home --home-dir $HOME pulseaudio \
	&& usermod -aG audio,pulse,pulse-access pulseaudio \
	&& chown -R pulseaudio:pulseaudio $HOME

COPY config/default.pa /etc/pulse/default.pa
COPY config/client.conf /etc/pulse/client.conf
COPY config/daemon.conf /etc/pulse/daemon.conf

RUN mkdir -p /scripts

RUN wget 'https://github.com/badaix/snapcast/releases/download/v'$SNAPCASTVERSION'/snapclient_'$SNAPCASTVERSION'_amd64.deb' --no-check-certificate

RUN dpkg -i --force-all 'snapclient_'$SNAPCASTVERSION'_amd64.deb'

ENTRYPOINT ["/scripts/startup_client.sh"]

WORKDIR $HOME
USER pulseaudio
#ENTRYPOINT [ "pulseaudio" ]
#CMD [ "--log-level=4", "--log-target=stderr", "-v" ]
