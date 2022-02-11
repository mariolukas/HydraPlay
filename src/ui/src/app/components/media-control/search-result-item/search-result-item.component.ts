import { Component, OnInit, Input } from '@angular/core';
import {MopidyPoolService} from "../../../services/mopidy.service";
import {NotificationService} from "../../../services/notification.service";

@Component({
  selector: 'app-search-result-item',
  templateUrl: './search-result-item.component.html',
  styleUrls: ['./search-result-item.component.scss']
})
export class SearchResultItemComponent implements OnInit {

  @Input() group: any;
  @Input() pTrack: any;
  @Input() options:any;


  private mopidy$: any;
  public coverThumb = "../../assets/images/cover_placeholder.jpg";
  public mediaType: string;

  constructor(private mopidyPoolService: MopidyPoolService,
              public notificationService: NotificationService) { }

  ngOnInit(): void {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);

     this.mopidy$.getCover(this.pTrack.uri).subscribe((images)=>{
          this.coverThumb = images[this.pTrack.uri][0].uri;
          if (images[this.pTrack.uri].length > 2) {
              this.coverThumb = images[this.pTrack.uri][2].uri ? images[this.pTrack.uri][2].uri : images[this.pTrack.uri][0].uri;
          }
     })

      this.mediaType = this.pTrack.uri.split(":",1);
  }


  public addAndPlay(event, track){
      this.mopidy$.clearTrackList();
      this.mopidy$.addTrackToTrackList(track).subscribe(result =>{
          this.mopidy$.play();
      })
  }

  public addToTracklist(event, track){
      this.mopidy$.addTrackToTrackList(track).subscribe(res =>{
          this.notificationService.info(`Added '${track.artists[0].name} - ${track.name}' to ${this.group.stream_id} tracklist`);
      });

  }

}
