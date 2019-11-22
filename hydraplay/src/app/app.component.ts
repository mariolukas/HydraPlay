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

  @Input() groups: any = [];
  //@Input() streams: any = [];

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
      this.messageService.on<string>('Snapcast')
          .subscribe(jsonrpc => {
              if (jsonrpc && !jsonrpc.hasOwnProperty('method') &&  jsonrpc.result.hasOwnProperty('server') && this.groups.length == 0) {
                  this.groups = jsonrpc.result.server.groups;
              }
          });
  }

  title = 'HydraPlay';
}
