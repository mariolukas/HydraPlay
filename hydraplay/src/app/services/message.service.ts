import { Subject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import {Injectable} from '@angular/core';

interface MessageEvent {
  key: any;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private _eventBus: Subject<MessageEvent>;

  constructor() {
    this._eventBus = new Subject<MessageEvent>();
  }

  broadcast(key: any, data?: any) {
    this._eventBus.next({key, data});
  }

  on<T>(key: any): Observable<any> {
    return this._eventBus.asObservable()
      .pipe(filter(event => event.key === key)
      , map(event => <T> event.data));
  }
}
