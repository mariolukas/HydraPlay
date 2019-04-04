import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {MessageService} from './services/message.service';
import {SnapcastService} from './services/snapcast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SnapcastService]
})
export class AppComponent implements OnInit, OnDestroy {

  public groups: any = [];
  subscription: Subscription;

  constructor( private messageService: MessageService, private snapcastService: SnapcastService) {

  }

  @Input() streams: any;

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  /**
   * Initialize available Players
   */
  ngOnInit() {

    /*
    this.messageService.on<string>('Event')
      .subscribe(msg => {
        console.log(msg);
        /*
        this.snapcastService.socket.next(JSON.stringify({id: 'Server.GetStatus', jsonrpc: '2.0', method:  'Server.GetStatus'}));
          this.groups = value.result.server.groups;
        });
      });
    */

    this.snapcastService.getServer()
      .subscribe(server => {
          this.groups = server.groups;
          this.streams = server.streams;
          console.log(this.streams);
        }
      );
  }

  title = 'multiroom-snapcast-ui';
}
