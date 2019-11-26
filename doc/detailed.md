The general setup (in my case) consists of:

Hardware: 
- 1 Raspberry Pi as [SnapCast Server](https://github.com/badaix/snapcast)
- N Raspberry Pi as [SnapCast Client](https://github.com/badaix/snapcast)

Software on Server: 
- Pulseaudio Server
- Snapcast Server
- N Mopidy instances

Software on Clients: 
- Snapcast Client

 
A simple configuration of the whole system will follow soon... (maybe also a docker container for the sever setup)

## How the setup works

<div float: center'>
  <img src="doc/images/hydra_setup.png"></img>
</div>


## Getting started

### Server Setup

The following guide assumes that you have a Raspberry Pi 3 with a fresh installation of Raspbian. It describes how to configure
two mopidy instances (streams) with one snapcast server and multiple clients. 

#### Installing Snapserver

Downlaod the latest Snapcast Server Package from GitHub. 
  
 ```$ wget https://github.com/badaix/snapcast/releases/download/v0.17.0/snapserver_0.15.0_armhf.deb ```
  
Install the Package and it dependencies. 

 ```$ sudo dpkg -i snapclient_0.17.0_armhf.deb ```
 
 ```$ sudo apt-get -f install```

Configuration of Snapcast server for the streams. In this case we will have 3 Mopidiy instances. If you need more streams, simply add them. Open the Snapserver configuraiton with 

 ``` $ sudo nano /etc/default/snapserver```
  
and modify the following line 

  ```SNAPSERVER_OPTS="-d -s pipe:///tmp/mopidy2.fifo?name=mopidy2&mode=create -s pipe:///tmp/mopidy1.fifo?name=mopidy1&mode=create"```

Afterwards restart Snapserver. Snapserver is now configured and ready. Additionally you can add it so systemd auto start.

#### Installing Pulseaudio

Install the Pulseaudio package by 

  ```$ sudo apt-get install pulseaudio```

Also Pulseaudio needs some configurations. Just open the file ``` /etc/pulse/system.pa ```
and add the following lines to it. 

``` 
    load-module module-pipe-sink file=/tmp/mopidy2.fifo sink_name=mopidy2
    load-module module-pipe-sink file=/tmp/mopidy1.fifo sink_name=mopidy1
    set-default-sink mopidy1
```
Save and close the file. If there is no systemd configuration, add a file called ``` /etc/systemd/system/pulseaudio.service``` with the following 
content

```
[Unit]
Description=PA
After=network.target sound.target

[Service]
ExecStart=/usr/bin/pulseaudio --system --realtime --disallow-exit --no-cpu-limit 
#ExecStart=/usr/bin/pulseaudio --system

# allow MPD to use real-time priority 50
LimitRTPRIO=50
LimitRTTIME=infinity

# disallow writing to /usr, /bin, /sbin, ...
ProtectSystem=yes

[Install]
WantedBy=multi-user.target
```

And add pulseaudio to the system start routine. 

```$ sudo systemctl enable pulseaudio ```


Start Pulseaudio with 

```$ sudo systemctl start pulseaudio ```

Pulseaudio is now ready to use. 


#### Installing Mopidy Instances

Next you need to configure the mopidy instances. Each instance will provide one 
stream with different sources. In this example i will show the configuration for one
instance. You can easily add more instances by increasing the instance number 
or renaming the instance. Keep in mind that you need to add new instances to the pulseaudio
and snapserver config as well. 

It is nessesary to add a new souce for having all mopidy packages. First add the key to 
apt key manager. 

```
wget -q -O - https://apt.mopidy.com/mopidy.gpg | sudo apt-key add -
```

Then add the new package list. 

```
sudo wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/stretch.list
```

Update your packages with

```
sudo apt-get update
```

Finally mopidy can be installed by using the pacakge manager. We also install 
the tunein and spotify plugin. 

``` apt-get install mopidy mopidy-tunein mopidy-spotify```

Now we need to create a new configuration for a stream we will call the stream mopidy1. 
Where 1 ist the mentioned stream number in the descripton above. Just create a new file 
with the following command. For each mopidy instance two port are used. One for the daemon
itself. The other port is used for http connections and websockets. You need to increase
the port numbers! The daemon port starts with 6601. The http port with 6681. If you need
to run more than 80 mopidy instances ( why? ) keep in mind to shift the http ports to 
a higer starting port. 

```
echo '
[core]
cache_dir = /var/cache/mopidy
config_dir = /etc/mopidy
data_dir = /var/lib/mopidy

[logging]
config_file = /etc/mopidy/logging.conf
debug_file = /var/log/mopidy/mopidy-debug.log

[local]
media_dir = /var/lib/mopidy/media

[m3u]
playlists_dir = /var/lib/mopidy/playlists

[audio]
output = audioresample ! audioconvert ! audio/x-raw,rate=48000,channels=2,format=S16LE ! wavenc ! filesink location=/tmp/mopidy1.fifo

[mpd]
enabled = true
hostname = 0.0.0.0
port=6601

[spotify]
username = <your spotify user>
password = <your spotify secret>
client_id = <your spotify cliend id>
client_secret = <your spotify client secret>

[http]
enabled = true
hostname =  0.0.0.0
port=6681
zeroconf = Mopidy 1

[musicbox_webclient]
enabled = true
musicbox = true

[tunein]
timeout = 5000
' > /etc/mopidy/mopidy1.conf

```

We are almost done. You need to add systemd configuration for starting and stopping the
mopidy intance. Just create a file called ```/etc/systemd/system/mopidy_1.service``` with
the following content

```
[Unit]
Description=Mopidy_1
After=network.target sound.target

[Service]
#EnvironmentFile=/etc/default/mopidy
ExecStart=/usr/bin/mopidy --quiet --config /etc/mopidy/mopidy1.conf

# allow MPD to use real-time priority 50
LimitRTPRIO=50
LimitRTTIME=infinity

# disallow writing to /usr, /bin, /sbin, ...
ProtectSystem=yes

[Install]
WantedBy=multi-user.target
```
  
You need one file for each mopidy intace. Last but not least add it to the autostart
of your OS. 

```
$ sudo systemctl enable mopidy_1
```  

You can start/stop/restart the mopidy instance manually by using the following commands

```
$ sudo systemctl start mopidy_1

$ sudo systemctl stop mopidy_1

$ sudo systemctl restart mopidy_1

```

#### Configure HydraPlay
Finally we need to tell HydraPlay where it can find all the configured stuff. 
Simply open the file ```environments/environment.ts``` in your HydraPlayer folder. 
Change the ports and ip addressed to your needs. Thats all. 

HydraPlay needs to be build from source. 
1. go to hydraplay source folder
2. call `npm install` ( you will need node installed on the host/pi)
3. call `ng build` 
4. after the build you will find the application in the `dist`folder.
5. `dist` folder needs to be known by the snapcast.conf file. 
6. edit snapcast conf file and add the location if your `dist` folder to the
   http section.
  
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


### MacOS
It can be helpful if you run a docker container with snapclient locally for development. 
For this you need to run pulseaudio tcp stream to tansmit the adio to/from the container.
This will describe how to setup pulseaudio on MacOS.

#### install pulseaudio
brew install pulseaudio

#### Start daemon
pulseaudio --load=module-native-protocol-tcp --exit-idle-time=-1 --daemon

#### Check if daemon is running.
pulseaudio --check -v

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Credits
- Ryan Detzel ( For inspireing the project and his work on css and html on GitLab)