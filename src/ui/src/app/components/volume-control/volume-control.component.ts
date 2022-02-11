import {Component, Input, OnInit} from '@angular/core';
import {SnapcastService} from "../../services/snapcast.service";

@Component({
  selector: 'app-volume-control',
  templateUrl: './volume-control.component.html',
  styleUrls: ['./volume-control.component.scss']
})
export class VolumeControlComponent implements OnInit {

  @Input() group:any;
  public clients = [];

  constructor(private snapcastService: SnapcastService) { }

  ngOnInit(): void {
  }

  public updateClientVolume(id, event){
      this.snapcastService.setVolume(id, event.value, false);
  }
}
