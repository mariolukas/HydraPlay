import { Input, Component, OnInit } from '@angular/core';
import {SnapcastService} from '../../../services/snapcast.service';
import {MopidyPoolService, IStreamState} from '../../../services/mopidy.service';

@Component({
  selector: 'app-stream-item',
  templateUrl: './stream-item.component.html',
  styleUrls: ['./stream-item.component.scss']
})
export class StreamItemComponent implements OnInit {
  @Input() group: any;
  @Input() stream: any;
  @Input() currentState:IStreamState;

  private mopidy$: any;

  constructor(private mopidyPoolService: MopidyPoolService, private snapcastservice: SnapcastService) {

  }

  ngOnInit() {
    this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.stream.id);
    this.mopidy$.updatePlayerState$.subscribe((state) => {
      this.currentState = state;
    });

    this.mopidy$.setCurrentTrackState();
  }

  isActiveStream() {
    return this.stream.id == this.group.stream_id;
  }

  selectStream() {
    this.snapcastservice.setStream(this.stream.id, this.group.id);
  }

}
