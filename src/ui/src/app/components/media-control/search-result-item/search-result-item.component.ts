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
  public mediaTypeIcon:String;


  private mopidy$: any;
  public coverThumb = "../../assets/images/cover_placeholder.jpg";
  public mediaType: string;

  constructor(private mopidyPoolService: MopidyPoolService,
              public notificationService: NotificationService) { }

  ngOnInit(): void {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);

     switch (this.pTrack.__model__ ) {
         case "Album":
             this.mediaTypeIcon = "album";
             break;
         case "Track":
             this.mediaTypeIcon = "audiotrack"
             break;
     }


     this.mopidy$.getCover(this.pTrack.uri).subscribe((images)=>{
          if (images[this.pTrack.uri].length > 0) this.coverThumb = images[this.pTrack.uri][0].uri;
          if (images[this.pTrack.uri].length > 2) {
              this.coverThumb = images[this.pTrack.uri][2].uri ? images[this.pTrack.uri][2].uri : images[this.pTrack.uri][0].uri;
          }
     })

      this.mediaType = this.pTrack.uri.split(":",1);
  }


  public addAndPlay(event, item){
      this.mopidy$.clearTrackList();
      if (item.__model__ == "Track"){
          if (item){
            this.mopidy$.addTrackToTrackList(item).subscribe(result =>{
               this.mopidy$.play();
            });
          }
      } else if (item.__model__ == "Album"){
          if (item?.uri) {
              this.mopidy$.addAlbumToTrackList(item.uri);
              this.mopidy$.play();
          }
      }

  }

  public addTrackToTracklist(event, track){
      this.mopidy$.addTrackToTrackList(track).subscribe(res =>{
          this.notificationService.info(`Added '${track.artists[0].name} - ${track.name}' to ${this.group.stream_id} tracklist`);
      });
  }

  public addAlbumToTracklist(event, item){
      let albumURI = item?.album?.uri ? item.album.uri : item.uri;
      this.mopidy$.addAlbumToTrackList(albumURI);
  }
}
