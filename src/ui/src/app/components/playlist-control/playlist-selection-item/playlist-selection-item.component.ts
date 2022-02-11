import {Component, Input, OnInit} from '@angular/core';
import {MopidyPoolService} from "../../../services/mopidy.service";
import {NotificationService} from "../../../services/notification.service";

@Component({
  selector: 'app-playlist-selection-item',
  templateUrl: './playlist-selection-item.component.html',
  styleUrls: ['./playlist-selection-item.component.scss']
})
export class PlaylistSelectionItemComponent implements OnInit {

  @Input() playlist: any;
  @Input() group: any;
  @Input() cover: string;
  @Input() coverThumb : string;
  private mopidy$: any;

  constructor(private mopidyPoolService: MopidyPoolService,
              public notificationService: NotificationService) { }

  ngOnInit(): void {
      this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
  }

  public appendPlaylistToTrackList(playListURI){
    this.mopidy$.appendPlayListToTrackList(playListURI).subscribe();
    this.notificationService.info(`Appended playlist to ${this.group.stream_id} tracklist`);
  }

  public loadPlayListAsTrackList(playListURI){
    this.mopidy$.clearTrackList();
    this.mopidy$.appendPlayListToTrackList(playListURI).subscribe(()=>{
      // load first track
      this.notificationService.info(`Loaded playlist as ${this.group.stream_id} tracklist`);
    });
  }
}
