#!/bin/bash
SNAPCASTVERSION=0.16.0
NUMBER_OF_STREAMS=3

####
# Installs all required packages and software.
##
install_requirements(){
  apt-get update
  apt-get insteall mopidy mopidy-soundcloud mopidy-spotify pulseaudio websockify wget
  wget 'https://github.com/badaix/snapcast/releases/download/v'$SNAPCASTVERSION'/snapserver_'$SNAPCASTVERSION'_armhf.deb'
  dpkg -i --force-all 'snapserver_'$SNAPCASTVERSION'_armhf.deb'
  apt-get -f install -y
  rm snapserver_'$SNAPCASTVERSION'_armhf.deb
}

####
# checks if a systemd service is installed
##
systemctl-exists() {
  [ $(systemctl list-unit-files "${1}*" | wc -l) -gt 3 ]
}


systemctl-is-running(){
 echo $1 is $(systemctl show -p SubState --value $1)
}

create_hydramopidy_service() {
 echo "Creating HydraMopidy Service..." 
 envsubst < templates/hydramopidy@.service.tmpl > /etc/systemd/system/hydramopidy@.service
}

####
# Creates websockify service
##
create_hydraplay_service(){
 echo "Creating HydraPlay (websockify) Service..."   	
 envsubst < templates/hydraplay.service.tmpl > /etc/systemd/system/hydraplay.service
}

####
# Generates n mopidy configs and one snapcast config depending on the 
# number of streams (aka mopidy instances)
##
create_mopidy_snapserver_config(){
  stop_services

  read  -n 1 -p "How many mopidy instances (streams)?: " NUMBER_OF_STREAMS
  echo "\n "


  echo "###################################################"
  echo "### Creating configs for mopidy and snapcast... ###"
  echo "###################################################"

  # cleanup remove old stream configs
  rm /etc/mopidy/mopidy_stream_*.conf
  rm /tmp/stream_*.fifo

  IP_ADDRESS=$(ip route get 1 | awk '{print $NF;exit}')

  SNAP_OPTS_CONFIG="-d"

  for ((i=1;i<=$NUMBER_OF_STREAMS;i++));
  do 
      # Generate mopidy configs and start stream for instance
      export MPD_PORT=$(( 6600 + $i ))
      export HTTP_PORT=$(( 6680 + $i ))
      export STREAM_FIFO="stream_"$i".fifo"
      export HTTP_IP=$IP_ADDRESS

      touch /tmp/${STREAM_FIFO}

      # create stream variable for snapcast server config
      CURRENT_OPTS_STREAM=" -s pipe:///tmp/${STREAM_FIFO}?name=STREAM${i}&mode=read"

      CURRENT_STREAM="
stream = pipe:///tmp/${STREAM_FIFO}?name=STREAM${i}&mode=read"

      SNAP_OPTS_CONFIG=$SNAP_OPTS_CONFIG$CURRENT_OPTS_STREAM

      SNAP_STREAM_CONFIG=$SNAP_STREAM_CONFIG$CURRENT_STREAM

      echo " -- Writing /etc/mopidy/mopidy_stream_${i}.conf"
      # generate mopidy configs from mopidy config template
      envsubst < templates/mopidy.conf.tmpl > /etc/mopidy/mopidy_stream_${i}.conf  
  done;

  echo " -- Writing /etc/snapserver.conf"
  # generate Snapcast server config from template
  export SNAPCAST_STREAMS=$SNAP_STREAM_CONFIG
  envsubst < templates/snapserver.conf.tmpl > /etc/snapserver.conf

  export STREAM_OPTS=$SNAP_OPTS_CONFIG
  envsubst < templates/snapserver.tmpl > /etc/default/snapserver

  envsubst < templates/snapserver.service.tmpl > /etc/systemd/system/snapserver.service

  systemctl daemon-reload

  if [ ! -f /var/lib/snapserver/server.json ]; then
     touch /var/lib/snapserver/server.json
  fi;

  chmod 777 /var/lib/snapserver/server.json

  start_services
  echo "All Services configured and started."

}

####
# Stops Services and creates service when it not exists...
##
stop_services(){

  echo "################################"
  echo "### Stopping all services... ###"
  echo "################################"

  echo " -- Stopping snapserver.service ..."
  systemctl-exists snapserver.service && systemctl stop snapserver

  echo " -- Stopping pulseaudio.server ..."
  systemctl-exists pulseaudio.service && systemctl stop pulseaudio

  # stops and dsiables the default mopidy instance if exists
  echo " -- Stopping mopidy.service ..."
  if systemctl-exists mopidy.service ;then
      systemctl stop mopidy
      systemctl disable mopidy
  fi;

  # stops and disables default websockify if exists...
  if systemctl-exists websockify.service ;then
     systemctl stop websockify
     systemctl disable websockify
  fi;


  if systemctl-exists hydramopidy@.service ;then
    # start all hydramoipy instnaces... (aka streams)
    for ((i=1;i<=$NUMBER_OF_STREAMS;i++));
    do
        systemctl stop hydramopidy@$i.service
    done;
  else
    create_hydramopidy_service
  fi;

  if systemctl-exists hydraplay.service ;then
     systemctl stop hydraplay
  else
     create_hydraplay_service
  fi;

}

####
# Starts Services...
##
start_services(){

  echo "#############################"
  echo "### Starting Services ... ###"
  echo "#############################"

  echo " -- Starting snapcast.service ..."
  systemctl start pulseaudio


  echo " -- Starting mopidy.service ..."
  # start all hydramoipy instnaces... (aka streams)
  for ((i=1;i<=$NUMBER_OF_STREAMS;i++));
  do
      systemctl start hydramopidy@$i.service
  done;

  systemctl start snapserver

  echo " -- Starting hydraplay.service ..."
  systemctl start hydraplay


}

pause(){
  read -n 1 -s -r -p "Press any key to continue"
}


# main menu
show_menus() {
  clear
  
  if [ "$EUID" -ne 0 ]
    then echo "Please run with sudo"
    exit 1
  fi

 

  echo " _               _            "        
  echo "| |             | |           " 
  echo "| |__  _   _  __| |_ __ __ _. "  
  echo "| '_ \| | | |/ _\` |  __/ _\` | "
  echo "| | | | |_| | (_| | | | (_| | "
  echo "|_| |_|\__, |\__,_|_|  \__,_| "
  echo "        __/ |                 "
  echo "       |___/    CONTROL v.0.1 "
  echo " "
  echo " "
  echo "0. Install requierements"
  echo "1. Stop"
  echo "2. Start"
  echo "3. Configure"
  echo "4. Exit"
}

read_options(){
  local choice
  read -p "Enter choice [ 1 - 3] " choice
  case $choice in
    0) install_requirements
       pause ;;
    1) stop_services
       pause ;;
    2) start_services
       pause ;;
    3) create_mopidy_snapserver_config
       pause ;;
    4) exit 0;;
    *) echo -e "${RED}Error...${STD}" && sleep 2
  esac
}

 
# ----------------------------------------------
# Trap CTRL+C, CTRL+Z and quit singles
# ----------------------------------------------
trap '' SIGINT SIGQUIT SIGTSTP
 

while true
do
  show_menus
  read_options
done


# stop all services...
#stop_services

# (re)create configs... 
#create_mopidy_snapserver_config

# start all services...
#start_services


#configure haproxy +ssl
#envsubst < /templates/haproxy.conf.tmpl > /etc/haproxy/haproxy.conf
#mkdir -p /run/haproxy/ && haproxy -f /etc/haproxy/haproxy.conf &


# start mopidy intances... 
#for ((i=1;i<=$NUMBER_OF_STREAMS;i++));
#do 
# /usr/bin/mopidy --quiet --config /etc/mopidy/mopidy_stream_$i.conf &
#done;

# start websockify

