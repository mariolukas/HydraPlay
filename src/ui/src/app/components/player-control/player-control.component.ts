import {Component, Input, OnInit} from '@angular/core';
import {SnapcastService} from "../../services/snapcast.service";
import {MopidyPlayer, MopidyPoolService} from "../../services/mopidy.service";

@Component({
  selector: 'app-player-control',
  templateUrl: './player-control.component.html',
  styleUrls: ['./player-control.component.scss']
})
export class PlayerControlComponent implements OnInit {

  @Input() public groupVolumeSliderValue: any;
  @Input() public group: any;
  @Input() public currentState:any = MopidyPlayer.newStreamState();
  public groupVolume: number;
  public mopidy$: any;
  public currentTrackList:any = [];

  constructor(private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService) { }

  ngOnInit(): void {
      this.registerToMopidyConnection(this.group.stream_id);
      this.registerPlayerToSnapService(this.group);

      this.groupVolumeSliderValue = this.getGroupVolume(this.group,true);

      this.mopidy$.updatePlayerState$.subscribe(playerState =>{
         this.currentState = playerState;
      });
  }

  public setRandom(value: boolean){
     this.mopidy$.setRandom(value);
  }

  public setRepeat(value: boolean){
     this.mopidy$.setRepeat(value);
  }


  public setClientVolume(id:number, volume:number):any{

    this.group.clients.forEach((client) =>{
        if (client.id == id){
            client.config.volume = volume;
        }
    });
  }

  /**
   * SnapCast related Section
   */
  public updateClientVolume(id, event){
      this.snapcastService.setVolume(id, event.value, false);
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

  public setVolume(group, volume){
      this.setGroupVolume(group, {value: volume});
      this.groupVolumeSliderValue = volume;
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

  private handleSnapCastNotification(event){
    switch (event.method) {
      case 'Client.OnVolumeChanged':
          console.log("Volume",event.params.volume);

              this.setClientVolume(event.params.id, event.params.volume);
              this.groupVolumeSliderValue = this.getGroupVolume(this.group, true);

        break;
    }
  }

  private registerPlayerToSnapService(group){
    this.snapcastService.registerPlayer(group.id).subscribe((event) =>{
        this.handleSnapCastNotification(event);
    });
  }

  private registerToMopidyConnection(stream_id:string) {
      this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(stream_id);
  }

  /**
   * * Mopidy related Section
   * */
  public play() {

      switch (this.currentState.playbackState) {
          case "playing":
               this.mopidy$.pause();
              break;
          case "paused":
              this.mopidy$.resume();
              break;
          case "stopped":
              this.mopidy$.play();
              break;
      }
  }

  public nextTrack() {
      this.mopidy$.nextTrack();
  }

  public previousTrack() {
      this.mopidy$.previousTrack();
  }
}
