import { Input, Component, OnInit } from '@angular/core';
import {MopidyService} from '../../services/mopidy.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Input() pTrack: any;
  @Input() group: any;

  private mopidy: any;
  constructor(private mopidyService:MopidyService) { }

  ngOnInit() {
  }

  public selectTrack(track) {
    this.mopidy = this.mopidyService.getStreamById(this.group.stream_id);
    this.mopidy.playTrack(track);
  }

}
