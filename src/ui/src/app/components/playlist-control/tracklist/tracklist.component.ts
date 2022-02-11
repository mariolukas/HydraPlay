import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-tracklist',
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.scss']
})
export class TracklistComponent implements OnInit {

  @Input() tracks: any;
  @Input() group: any;

  constructor() { }

  ngOnInit(): void {

  }

}
