import {Component, ViewChild, OnInit, Input,  OnDestroy} from '@angular/core';
import {SnapcastService} from '../../services/snapcast.service';
import {MopidyPoolService, MopidyPlayer } from '../../services/mopidy.service';
import {MatTabGroup} from "@angular/material/tabs";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy {

  @ViewChild('groupTabs') groupTabs: MatTabGroup;

  @Input() stream:any;
  @Input() group: any;
  @Input() showDialog: boolean = false;

  @Input() public groups: any[] = [];
  @Input() public groupVolumeSliderValue: any;
  @Input() public currentSelectedAction: string;

  public clients = [];
  public streams = [];

  public connectedClientList: string[] = [];

  constructor( private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService ) {
      this.currentSelectedAction = 'player-control';
  }

  ngOnInit() {
    this.snapcastService.observableGroups$.subscribe((groups) =>{
      this.groups = groups;
    })
     this.connectedClientList = this.getConnectedClientNames(this.group.clients);
     this.streams = this.snapcastService.getStreams();
     this.currentSelectedAction = 'player-control';

  };

  selectAction(action){
      this.currentSelectedAction = action;
  }

  ngOnDestroy(){
    this.snapcastService.unregisterPlayer(this.group.id);
  }

  getConnectedClientNames(clients):string[]{
        let names = [];
        clients.forEach(client =>{
            if(client.config.name.length > 0){
                names.push(client.config.name);
            } else {
                names.push(client.host.name);
            }
        })
        return names;
  }

  public getNumberOfActiveClients():number{
      return this.connectedClientList.length;
  }

}
