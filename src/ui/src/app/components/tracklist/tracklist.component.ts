import { Input, Component, Attribute, OnInit } from '@angular/core';
import {MopidyPoolService} from '../../services/mopidy.service';
import { Directive } from '@angular/core';

@Component({
  selector: 'tracklist',
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.scss']
})
export class TracklistComponent implements OnInit {

  @Input() pTrack: any;
  @Input() group: any;
  @Input() cover: string;

  private mopidy$: any;
  constructor(@Attribute('type') public type: string, private mopidyPoolService: MopidyPoolService) {

  }

  ngOnInit() {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
     this.mopidy$.getCover(this.pTrack.uri).then((cover)=>{
          this.cover = cover[this.pTrack.uri][0].uri;
     })
  }

  public selectTrack(track) {
     delete track['image'];
     this.mopidy$.playTrack(track);
  }

  public addToTracklist(event, track){
      this.mopidy$.addTrackToTracklist(track);
  }

  public removeTrackFromlist(event, track) {
      this.mopidy$.removeTrackFromlist(track);
  }

}

