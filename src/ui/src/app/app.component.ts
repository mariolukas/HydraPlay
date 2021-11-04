import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {SnapcastService} from './services/snapcast.service';
import {MopidyPoolService} from './services/mopidy.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SnapcastService, MopidyPoolService]
})
export class AppComponent implements OnInit, OnDestroy {

  @Input() public groups: object[];
  @Input() public streams: object[];

    customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: false
  }

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

  slickInit(e) {
    console.log('slick initialized');
  }

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    console.log('afterChange');
  }

  beforeChange(e) {
    console.log('beforeChange');
  }

  title = 'HydraPlay';
}
