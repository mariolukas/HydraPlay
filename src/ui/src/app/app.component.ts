import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {SnapcastService} from './services/snapcast.service';
import {MopidyPoolService} from './services/mopidy.service';
import {NotificationService} from "./services/notification.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SnapcastService, MopidyPoolService]
})
export class AppComponent implements OnInit, OnDestroy {

  @Input() public groups: any[];
  @Input() public streams: any[];

  constructor( private snapcastService:SnapcastService, private mopidyPoolService:MopidyPoolService,
               public notificationService: NotificationService) {
    this.snapcastService.observableGroups$.subscribe((groups) =>{
      let clientsConnected = false;
      groups.forEach((group, index) => {

          // remove not connected clients
          group['clients'] = group['clients'].filter(client => client.connected)
          if(group['clients'].length > 0) clientsConnected = true;
          //group needs at least one client
          if(group['clients'].length > 0){
            groups[index] = group;
          } else {
            groups.splice(index, 1);
          }

      });

      /*
      if (!clientsConnected){
        this.notificationService.modalInfo("No Snapclient connected!");
      } else {
        this.notificationService.dismissInfo();
      }*/

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
