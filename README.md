# About HydraPlay
HydraPlay is a multiroom audio server with web client which can control multiple Mopidy instances controlled by a Snapcast installation. Hydraplay consists of two
components. A server which is written in Python. The server generates all the needed configs and starts the [Mopidy](https://mopidy.com/) and [Snapcast](https://github.com/badaix/snapcast) instance(s).

HydraPlay was inspired by a project i have seen on [Youtube](https://www.youtube.com/watch?v=Lmr58F8gSs8&t=100s) by Ryan Detzel. 

*This project is still under development, some things might be unstable*

## Screenshots
The scnreenshots below show two connected players and a configuration with two (default value) mopidy instances. 
<center>

### Player controls<br>
<div style="text-align: center">
  <img style="width: 500px" src="doc/images/screen1.png"></img><br><br>
</div>

### Stream/Zone controls<br>
<div style="text-align: center">
  <img style="width: 500px" src="doc/images/screen2.png"></img><br><br>
</div>

### Playlist controls<br>
<div style="text-align: center">
  <img style="width: 500px" src="doc/images/screen3.png"></img><br><br>
</div>
</center>


## Getting Started

The easiest way to get it running is by using docker. Just checkout the source code from GitHub and change into the folder. Be sure that you have docker and docker-compose installed. Build the docker image by calling:

```
docker-compose build
```

Make a copy of the file `hydra.example.json` and rename it to `hydra.private.json`. This file contains all needed configurations for the setup. 

Open the file in an editor and make your changes. If you want to enable Spotify you need a client_id and client_secret. Just follow the instructions of the [Mopidy Spotify extension](https://mopidy.com/ext/spotify/). Add the cliendId, client secret and your Spotify login credentials to the config. Enable Spotify and  save all changes.

Now you are able to start the server with:

```
docker-compose up
```

Connect your SnapClients to the server by running

```
snapclient -h <server_ip>
```

Open a Browser and goto:

```
http://<your_server_ip>:<port_in_configuration>
```

## Running on a Raspberry Pi
*Docker*

You are also able to run HydraPlay by using docker on a Rasperry Pi. You need to change
the following line in docker-compose.yaml from 

```
dockerfile: Dockerfile
```

to 

```
dockerfile: Dockerfile.armhf
```

afterwards follow the steps in *Getting Started*.

*Native*
TODO

## Configuration
TODO

## Details 
You can find a [blog  post.](https://www.mariolukas.de/2019/07/hydraplay-open-source-multiroom-audio/) which i wrote a couple of years ago when i started the project. A lot of things changed since the first setup. But it will give you and idea on how it works under the hood.


### Known Issues
* mdns/avahi does not work within docker. You need to start your clients with  the -h <ip_address_of_server> parameter.
* Play/Pause button will not change back after a track was completed. Somehow there is no Mopidy event incomming for EndOfTrack.

### Not Implemented yet

- [x] remove track from tracklist
- [ ] change tracklist order
- [ ] save tracklist as playlist
- [ ] load playlists
- [ ] add message when no client is connected (until now only a black screen appears)
- [ ] change client names

### Credits
This project would not have been possible without all the work on [Snapcast](https://github.com/badaix/snapcast) and [Mopidy](https://mopidy.com/)! Special thanks to Ryan Detzel for the inspiration.

### Community and Support 

[Join](https://discord.gg/xs9CKfbpuY) us at Discord (https://discord.gg/xs9CKfbpuY).

### Donations

If you like my work and want to support it, feel free to leave a donation.

<center>
<a href="https://www.paypal.com/donate?hosted_button_id=FHPTBZ43KZGSU">
  <img width="200" src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png" alt="Donate with PayPal" />
</a>
</center>




