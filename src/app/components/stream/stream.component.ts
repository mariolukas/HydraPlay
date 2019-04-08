import { Input, Component, OnInit } from '@angular/core';
import {SnapcastService} from '../../services/snapcast.service';
import {MopidyService} from '../../services/mopidy.service';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  @Input() group: any;
  @Input() stream: any;

  private cover: string;
  private name: string;
  constructor(private mopidyService: MopidyService, private snapcastservice: SnapcastService) {

  }

  ngOnInit() {
    let mopidy = this.mopidyService.getStreamById(this.stream.id);

    mopidy.getCurrentTrack().then(track => {
      this.cover = track.album.images[0];
      this.name = track.album.name;
    });

    console.log(`${this.stream.id} is current Stream: ${this.isSelectedStream()}`);
  }

  isSelectedStream() {
    return this.stream.id == this.group.stream_id;
  }

  selectStream() {
    console.log(this.stream.id);
    this.snapcastservice.setStream(this.stream.id, this.group.id);
  }


}
