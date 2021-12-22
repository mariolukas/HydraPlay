import {Component, ViewChild, OnInit, Input,  OnDestroy} from '@angular/core';
import {SnapcastService} from '../../services/snapcast.service';
import {MopidyPoolService, MopidyPlayer } from '../../services/mopidy.service';
import {MatTabGroup} from "@angular/material/tabs";
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy {
  mediaPanelIsOpen = false;
  volumeControlPanelIsOpen = false;
  groupControlPanel = false;

  @ViewChild('groupTabs') groupTabs: MatTabGroup;

  @Input() stream:any;
  @Input() group: any;
  @Input() showDialog: boolean = false;
  @Input() public currentState:any = MopidyPlayer.newStreamState();
  @Input() public groups: any[] = [];
  @Input() public groupVolumeSliderValue: any;
  @Input() public currentSelectedAction: string;

  public mopidy: any;
  public selectedClients: {id: string, name:string, selected:boolean }[] =[];
  public clients = [];
  public streams = [];
  public groupVolume: number;
  public currentTrackList:any = [];

  public connectedClientList: string[] = [];

  constructor( private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService ) {

  }

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 50,
    margin:  30,
    smartSpeed:10,
    animateIn: 'fadeInRight delay-2s',
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      760: {
        items: 3
      },
      1000: {
        items: 4
      }
    },
    nav: false
  }

  ngOnInit() {
    this.snapcastService.observableGroups$.subscribe((groups) =>{
      this.groups = groups;
    })
     this.connectedClientList = this.getConnectedClientNames(this.group.clients);
     this.registerToMopidyConnection(this.group.stream_id);
     this.streams = this.snapcastService.getStreams();
     this.initClientOptions();
     this.registerPlayerToSnapService(this.group);
     this.groupVolumeSliderValue = this.getGroupVolume(this.group,true);
     this.currentSelectedAction = 'player';

     this.mopidy.updateCurrentTrackList$.subscribe((trackList)=>{
         this.currentTrackList = trackList;
     });

     this.mopidy.updateCurrentTrackList();
  };

  closePanel(){
      this.volumeControlPanelIsOpen = false;
      this.mediaPanelIsOpen = false;
      this.groupControlPanel = false;
  }

  selectAction(action){
      this.currentSelectedAction = action;
  }

  ngOnDestroy(){
    this.snapcastService.unregisterPlayer(this.group.id);
  }

  public initClientOptions():void{
      this.groups.forEach((group) =>{
          group.clients.forEach((client) =>{
              let _client = {
                  id: client.id,
                  name: client.host.name,
                  selected: (this.group.id == group.id )
              }
              this.clients.push(_client);
          })
      });
  }

  public updateClientsInGroup(event){
      console.log(this.selectedClients);
      this.snapcastService.updateClientsInGroup(this.group, this.selectedClients);
  }

  getConnectedClientNames(clients):string[]{
        let names = [];
        clients.forEach(client =>{
            if(client.config.name.length > 0){
                names.push(client.config.name);
            } else {
                names.push(client.host.name);
            }
        })
        return names;
  }

  private registerToMopidyConnection(stream_id:string) {
      this.mopidy = this.mopidyPoolService.getMopidyInstanceById(stream_id);
      this.mopidy.updateCurrentState$.subscribe(state =>{
         console.log("New State: ", state);
         this.currentState = state;
      });
  }

  public editClientName(event){
      console.log(event);
      event.stopPropagation();
  }

  private registerPlayerToSnapService(group){
    this.snapcastService.registerPlayer(group.id).subscribe((event) =>{
        this.handlePlayerNotification(event);
    });
  }

  private handlePlayerNotification(event){
    switch (event.method) {
      case 'Client.OnVolumeChanged':
          console.log("Volume",event.params.volume);
          this.setClientVolume(event.params.id, event.params.volume);
          this.groupVolumeSliderValue = this.getGroupVolume(this.group, true);
          //this.client.config.volume = event.params.volume;
        break;
      default:
          console.log(event);
       break;
    }
  }

  public setClientVolume(id:number, volume:number):any{

    this.group.clients.forEach((client) =>{
        if (client.id == id){
            client.config.volume = volume;
        }
    });
  }


  public getGroupVolume(group: any, online: boolean): number {
    if (group.clients.length == 0)
        return 0;
    let group_vol: number = 0;
    let client_count: number = 0;
    for (let client of group.clients) {
        if (online && !client.connected)
            continue;
        group_vol += client.config.volume.percent;
        ++client_count;
    }
    if (client_count == 0)
        return 0;
    return group_vol / client_count;
  }

  public setGroupVolume(group: any, event:any) {

    this.groupVolume = this.groupVolumeSliderValue;
    let clientVolumes = [];

    this.group.clients.forEach((client) =>{
        clientVolumes.push(client.config.volume.percent)
    })

    let percent = event.value;
    let delta = percent - this.groupVolume;
    let ratio: number;

    if (delta < 0)
        ratio = (this.groupVolume - percent) / this.groupVolume;
    else {
        ratio = (percent - this.groupVolume) / (100 - this.groupVolume);
    }

    for (let i = 0; i < group.clients.length; ++i) {
        let new_volume = clientVolumes[i];
        if (delta < 0)
            new_volume -= ratio * clientVolumes[i];
        else
            new_volume += ratio * (100 - clientVolumes[i]);
        let client_id = group.clients[i].id;
        // TODO: use batch request to update all client volumes at once
        this.snapcastService.setVolume(client_id, new_volume, false);
    }

  }
  /**
   * Mopidy related Section
   */
  public play() {

      switch (this.currentState.playbackState) {
          case "playing":
               this.mopidy.pause();
              break;
          case "paused":
              this.mopidy.resume();
              break;
          case "stopped":
              this.mopidy.play(false);
              break;
      }
  }

  public nextTrack() {
      this.mopidy.nextTrack();
  }

  public previousTrack() {
      this.mopidy.previousTrack();
  }

  /**
   * SnapCast related Section
   */
  public updateClientVolume(id, event){
      this.snapcastService.setVolume(id, event.value, false);
  }


}
