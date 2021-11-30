import {Component, Input, OnInit} from '@angular/core';
import {SnapcastService} from "../../services/snapcast.service";

@Component({
  selector: 'app-tunevolumes',
  templateUrl: './tunevolumes.component.html',
  styleUrls: ['./tunevolumes.component.scss']
})
export class TunevolumesComponent implements OnInit {

  @Input() group:any;
  public clients = [];

  constructor(private snapcastService: SnapcastService) { }

  ngOnInit(): void {
  }

  public updateClientVolume(id, event){
      this.snapcastService.setVolume(id, event.value, false);
  }

}
