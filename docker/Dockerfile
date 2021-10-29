FROM ubuntu:latest
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install wget avahi-daemon avahi-utils dbus libnss-mdns haproxy supervisor iputils-ping apt-utils wget git -y

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ssl-cert \
    curl gcc gnupg python3 python3-pip python3-crypto python3-pykka coreutils \
    python3-gst-1.0 \
    gstreamer1.0-plugins-bad gstreamer1.0-plugins-good gstreamer1.0-plugins-ugly gstreamer1.0-tools

RUN curl -L https://apt.mopidy.com/mopidy.gpg | apt-key add - \
 && curl -L https://apt.mopidy.com/mopidy.list -o /etc/apt/sources.list.d/mopidy.list \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        mopidy \
        mopidy-spotify \
        mopidy-tunein \
        mopidy-soundcloud



#======================================= SNAPCAST INSTALLATION ===================================================#

ARG SNAPCASTVERSION

RUN wget https://github.com/badaix/snapcast/releases/download/v${SNAPCASTVERSION}/snapserver_${SNAPCASTVERSION}-1_amd64.deb

RUN dpkg -i --force-all snapserver_${SNAPCASTVERSION}-1_amd64.deb
RUN apt-get -f install -y

#======================================= HydraPlay Docker configs ===================================================#

RUN pip3 install tornado jinja2
RUN mkdir -p /root/.config/snapcast/ && \
	mkdir -p /hydraplay

#======================================= General Docker configs ===================================================#

#COPY requirements.txt requirements.txt
COPY entrypoint.sh /entrypoint.sh
COPY avahi.sh /avahi.sh
#COPY config/avahi-daemon.conf /etc/avahi/avahi-daemon.conf
RUN chmod a+x /entrypoint.sh
RUN chmod a+x /avahi.sh

VOLUME /var/run/dbus

EXPOSE 1705
EXPOSE 1704
EXPOSE 6600-6700
EXPOSE 8080
EXPOSE 80
EXPOSE 443
EXPOSE 5353
EXPOSE 32768-61000


ENTRYPOINT ["/entrypoint.sh"]