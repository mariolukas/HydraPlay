# HydraPlay
HydraPlay is a multiroom audio player which can control multiple mopidy instances controlled by a snapcast installation.
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.6.

The project is inspired by a project i have seen on [Youtube](https://www.youtube.com/watch?v=Lmr58F8gSs8&t=100s)
I found some of the Authors (Ryan Detzel) code on [GitLab](https://gitlab.com/ryandetzel/music-all/tree/master/src).
I used the html and css parts of the original code form the project. The rest of the code is new. It is Angular and 
TypeScript based.

<center>

<div float: center'>
  <img style="width: 400px" width="400px" src="doc/images/changestream.gif"></img>
</div>

<div float: center'>
  <img style="width: 400px" width="400px" src="doc/images/library.png"></img>
</div>

</center>

I decided to use JSONRPC as protocl, cause both mopidy and snapcast speak JSONRPC by default.
The original project used some MQTT parts. But i never figured out how the snapcast communication
was established.

## Getting Stated

The fastest way for getting this setup running is to use the `hydracontrol` bash script
in the `hydracontrol` folder. This script provides some options for automatic config file
generation. 

Note: The part for building the application by `hydracontrol` is not ready yet. You need to 
build the Application by yourself until it is part of the script.
Read the [Details](doc/detailed.md) section for a detailed configuration overview.

[Further information on how it works.](https://www.mariolukas.de/2019/07/hydraplay-open-source-multiroom-audio/)

