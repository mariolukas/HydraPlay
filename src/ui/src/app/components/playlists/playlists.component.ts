import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {

  @Input() group: any;
  @Input() tracklist: any = [];

  constructor() { }

  ngOnInit() {

  };

}
