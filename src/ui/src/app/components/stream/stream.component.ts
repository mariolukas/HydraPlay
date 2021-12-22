import { Input, Component, OnInit } from '@angular/core';
import {SnapcastService} from '../../services/snapcast.service';
import {MopidyPoolService, IStreamState} from '../../services/mopidy.service';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  @Input() group: any;
  @Input() stream: any;
  @Input() currentState:IStreamState;

  private mopidy$: any;

  constructor(private mopidyPoolService: MopidyPoolService, private snapcastservice: SnapcastService) {

  }

  ngOnInit() {
    this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.stream.id);
    this.mopidy$.updateCurrentState$.subscribe((state) => {
      this.currentState = state;
    });


    this.currentState = this.mopidy$.getCurrentState();

  }

  isActiveStream() {
    return this.stream.id == this.group.stream_id;
  }

  selectStream() {
    console.log(this.stream.id);
    this.snapcastservice.setStream(this.stream.id, this.group.id);
  }

}
