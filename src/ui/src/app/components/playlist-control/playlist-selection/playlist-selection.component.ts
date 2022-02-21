import { Component, OnInit, Input } from '@angular/core';
import {MopidyPoolService} from "../../../services/mopidy.service";

@Component({
  selector: 'app-playlist-selection',
  templateUrl: './playlist-selection.component.html',
  styleUrls: ['./playlist-selection.component.scss']
})
export class PlaylistSelectionComponent implements OnInit {

  @Input() group: any;
  @Input() playlists = [];
  private mopidy$: any;

  constructor(private mopidyPoolService: MopidyPoolService,) { }

  ngOnInit(): void {
    this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
  }


}
