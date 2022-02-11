import {Component, Input, OnInit} from '@angular/core';
import {MopidyPoolService} from "../../../services/mopidy.service";
import {NotificationService} from "../../../services/notification.service";

@Component({
  selector: 'app-tracklist-item',
  templateUrl: './tracklist-item.component.html',
  styleUrls: ['./tracklist-item.component.scss']
})
export class TracklistItemComponent implements OnInit {

  public coverThumb = "../../assets/images/cover_placeholder.jpg";
  @Input() options:any;
  @Input() hTrack:any;
  @Input() group: any;

  private mopidy$: any;
  public isActiveTrack: boolean = false;

  constructor(private mopidyPoolService: MopidyPoolService,
              public notificationService: NotificationService) { }

  ngOnInit(): void {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
     let trackURI = this.hTrack.track?this.hTrack.track.uri:this.hTrack.uri

     this.mopidy$.getCover(trackURI).subscribe((images)=>{
          if (images) {
              if (images[trackURI].length > 2) {
                  this.coverThumb = images[trackURI][2].uri ? images[trackURI][2].uri : images[trackURI][0].uri;
              } else {
                  this.coverThumb = images[trackURI][0].uri;
              }
          }
     })

     this.mopidy$.updatePlayerState$.subscribe(playerState => {
        if(playerState.tlid == this.hTrack.tlid)  this.isActiveTrack = !this.isActiveTrack;
     });
  }

  public removeTrackFromlist(event, track) {
      this.mopidy$.removeTrackFromlist(track);
      this.notificationService.info(`Removed '${track.track.artists[0].name} - ${track.track.name}' from ${this.group.stream_id} tracklist`);
  }

  public playTrack(tlid) {
     this.mopidy$.playTrack(tlid);
  }
}
