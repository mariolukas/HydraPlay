import { Input, Component, Attribute, OnInit } from '@angular/core';
import {MopidyPoolService} from '../../services/mopidy.service';
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'trackItem',
  templateUrl: './trackItem.component.html',
  styleUrls: ['./trackItem.component.scss']
})
export class TrackItemComponent implements OnInit {

  @Input() pTrack: any;
  @Input() group: any;
  @Input() cover: string;
  @Input() coverThumb : string;


  isActiveTrack: boolean = false;

  private mopidy$: any;
  constructor(@Attribute('type') public type: string, private mopidyPoolService: MopidyPoolService,
              public notificationService: NotificationService) {
  }

  ngOnInit() {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
     let trackURI = this.pTrack.track?this.pTrack.track.uri:this.pTrack.uri

     this.mopidy$.getCover(trackURI).then((cover)=>{
         //console.log("Cover Object: ",cover);
          this.cover = cover[trackURI][0].uri;
          if (cover[trackURI].length > 2) {
              this.coverThumb = cover[trackURI][2].uri ? cover[trackURI][2].uri : cover[trackURI][0].uri;
          }
     })
     this.mopidy$.updateCurrentState$.subscribe(state =>{
         this.setCurrentTrack();
     });

  }

  public setCurrentTrack(){
      this.mopidy$.getCurrentTlTrack().then(currentTrack =>{
        if(this.pTrack.track && (currentTrack.tlid == this.pTrack.tlid)){
            this.isActiveTrack = true;
        } else {
            this.isActiveTrack = false;
        }
     });
  }

  public selectTrack(track, clear:boolean) {
     delete track['image'];
     this.setCurrentTrack();
     this.mopidy$.playTrack(track, clear);
  }

  public addToTracklist(event, track){
      this.mopidy$.addTrackToTracklist(track);
      this.notificationService.info(`Added '${track.artists[0].name} - ${track.name}' to ${this.group.stream_id} tracklist`);
  }

  public removeTrackFromlist(event, track) {
      this.mopidy$.removeTrackFromlist(track);
      this.notificationService.info(`Removed '${track.track.artists[0].name} - ${track.track.name}' from ${this.group.stream_id} tracklist`);
  }

}

