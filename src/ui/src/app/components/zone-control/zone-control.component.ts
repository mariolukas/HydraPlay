import { Component, OnInit, Input } from '@angular/core';
import {SnapcastService} from "../../services/snapcast.service";
import {MopidyPoolService} from "../../services/mopidy.service";

@Component({
  selector: 'app-zone-control',
  templateUrl: './zone-control.component.html',
  styleUrls: ['./zone-control.component.scss']
})
export class ZoneControlComponent implements OnInit {

  @Input() public group: any;
  private groups = [];
  public streams = [];
  public clients = [];
  public selectedClients: {id: string, name:string, selected:boolean }[] =[];

  constructor( private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService) {

  }

  ngOnInit(): void {
    this.snapcastService.observableGroups$.subscribe((groups) =>{
      this.groups = groups;
    })
    this.initClientOptions();
    this.streams = this.snapcastService.getStreams();

  }

  public updateClientsInGroup(event){
      this.snapcastService.updateClientsInGroup(this.group, this.selectedClients);
  }

  public initClientOptions():void{
      this.groups.forEach((group) =>{
          group.clients.forEach((client) =>{
              let _client = {
                  id: client.id,
                  name: client.config.name? client.config.name : client.host.name,
                  selected: (this.group.id == group.id )
              }
              this.clients.push(_client);
          })
      });
  }

}
