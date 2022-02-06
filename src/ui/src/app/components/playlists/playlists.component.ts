import {Component, Input, OnInit} from '@angular/core';
import {MopidyPoolService} from "../../services/mopidy.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {

  @Input() group: any;
  @Input() tracklist: any = [];

  public playlists: any = [];
  private mopidy$: any;

  constructor(private mopidyPoolService: MopidyPoolService, public notificationService: NotificationService) { }

  ngOnInit() {
    this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
    this.mopidy$.getPlaylists().then((playlists) => {
      this.playlists = playlists;
    });
  }

  public playLlistById(index:number, playlist: any){
    return playlist.id;
  }

  public trackById(index:number, track: any){
    return track.id;
  }

  public appendPlaylistToTrackList(playListURI){
    this.mopidy$.appendPlayListToTrackList(playListURI);
    this.notificationService.info(`Appended playlist to ${this.group.stream_id} tracklist`);
  }

  public loadPlayListAsTrackList(playListURI){
    this.mopidy$.clearTrackList().then(()=> {
      this.appendPlaylistToTrackList(playListURI);
      this.notificationService.info(`Loaded playlist as ${this.group.stream_id} tracklist`);
    });
  }

  public clearTrackList(){
    this.mopidy$.clearTrackList();
  }

}
