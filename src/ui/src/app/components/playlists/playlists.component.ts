import {Component, Input, OnInit} from '@angular/core';
import {MopidyPoolService} from "../../services/mopidy.service";

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

  constructor(private mopidyPoolService: MopidyPoolService) { }

  ngOnInit() {
    this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
    this.mopidy$.getPlaylists().then((playlists) => {
      this.playlists = playlists;
    });
  }

  public appendPlaylistToTrackList(playListURI){
    this.mopidy$.appendPlayListToTrackList(playListURI);
  }

}
