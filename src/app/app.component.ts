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

  constructor( private messageService: MessageService, private snapcastService:SnapcastService) {

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

      let that = this;
      this.messageService.on<string>('Snapcast')
          .subscribe(jsonrpc => {
              console.log(jsonrpc);
              if ('server' in jsonrpc.server) {
                  that.groups = jsonrpc.server.groups;
                  that.streams = jsonrpc.server.streams;
              }
          });
  }

  title = 'multiroom-snapcast-ui';
}
