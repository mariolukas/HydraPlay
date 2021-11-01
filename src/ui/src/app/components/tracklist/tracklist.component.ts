import { Input, Component, Attribute, OnInit } from '@angular/core';
import {MopidyPoolService} from '../../services/mopidy.service';

@Component({
  selector: 'tracklist',
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.scss']
})
export class TracklistComponent implements OnInit {

  @Input() pTrack: any;
  @Input() group: any;
  @Input() cover: string;
  isActiveTrack: boolean = false;

  private mopidy$: any;
  constructor(@Attribute('type') public type: string, private mopidyPoolService: MopidyPoolService) {

  }

  ngOnInit() {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
     let trackURI = this.pTrack.track?this.pTrack.track.uri:this.pTrack.uri

     this.mopidy$.getCover(trackURI).then((cover)=>{
          this.cover = cover[trackURI][0].uri;
     })
     this.mopidy$.getCurrentTlTrack().then(currentTrack =>{
        if(this.pTrack.track && (currentTrack.tlid == this.pTrack.tlid)){
             this.isActiveTrack = true;
        }
     });


  }

  public selectTrack(track, clear:boolean) {
     delete track['image'];
     this.mopidy$.playTrack(track, clear);
  }

  public addToTracklist(event, track){
      this.mopidy$.addTrackToTracklist(track);
  }

  public removeTrackFromlist(event, track) {
      this.mopidy$.removeTrackFromlist(track);
  }

}

