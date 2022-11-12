import {Component, Input, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
import {SnapcastService} from './services/snapcast.service';
import {MopidyPoolService} from './services/mopidy.service';
import {NotificationService} from "./services/notification.service";
import {BreakpointObserver, BreakpointState, Breakpoints} from '@angular/cdk/layout';

import SwiperCore, { Navigation, Pagination, Scrollbar, SwiperOptions } from 'swiper';
SwiperCore.use([Navigation, Pagination, Scrollbar]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SnapcastService, MopidyPoolService]
})
export class AppComponent implements OnInit, OnDestroy {

  @Input() public groups: any[];
  @Input() public streams: any[];
  @Input() public isMobileDevice: boolean = false;

  public swiperConfig: SwiperOptions;

  constructor( private snapcastService:SnapcastService, private mopidyPoolService:MopidyPoolService,
               public notificationService: NotificationService, public breakpointObserver: BreakpointObserver) {

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
    });

    this.breakpointObserver
      .observe(['(max-width: 479px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobileDevice = true;
        } else {
          this.isMobileDevice = false;
        }
    });



    this.swiperConfig = {
        slidesPerView: 1,
        updateOnWindowResize: true,
        centeredSlides: true,
        observer: true,
        observeParents: true,
        navigation: false,
        pagination: {
          //dynamicBullets: true,
          clickable: true,
          el: '.player-pagination',
        },

  };
  }

  trackByGroupdId(index:number, group:any):string{
      return group.id;
  }


  title = 'HydraPlay';
}
