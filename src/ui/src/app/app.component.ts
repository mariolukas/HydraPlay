import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {SnapcastService} from './services/snapcast.service';
import {MopidyPoolService} from './services/mopidy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SnapcastService, MopidyPoolService]
})
export class AppComponent implements OnInit, OnDestroy {

  @Input() public groups: object[];
  @Input() public streams: object[];

  constructor( private snapcastService:SnapcastService, private mopidyPoolService:MopidyPoolService) {
    this.snapcastService.observableGroups$.subscribe((groups) =>{
      this.groups = groups;
    })
    
    this.snapcastService.observableClients$.subscribe((streams) =>{
      this.streams = streams;
    })
  }

  ngOnDestroy() {
    this.snapcastService.observableGroups$.unsubscribe();
  }

  ngOnInit() {
    this.mopidyPoolService.generateMopidyConnectioPool();
    this.mopidyPoolService.poolIsReady$.subscribe((isReady) =>{
        this.snapcastService.connect();
    })

  }

  trackByGroupdId(index:number, group:any):string{
      return group.id;
  }

  title = 'HydraPlay';
}
