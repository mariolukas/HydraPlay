import { ErrorHandler, Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {  map, tap, catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import {MessageService} from './message.service';
import { webSocket } from 'rxjs/webSocket'; // for RxJS 6, for v5 use Observable.webSocket

export interface Message {
  method: string;
  params: object;
}

@Injectable({
  providedIn: 'root'
})
export class SnapcastService {

  public clients: Array<object> = [];
  public socket: Subject<any>;

  public streams: any;

  public snapcastURL = `ws://${environment.snapcast.ip}:${environment.snapcast.port}/websocket`;

  constructor(private http: HttpClient, private messageService: MessageService) {

    this.socket = webSocket({url: this.snapcastURL, openObserver:  {
      next: () => {
        this.messageService.broadcast('Event','ready' );
      }
    }});

    // Socket handler when a message comes in, send a broadcast to the
    // application to subscribers for the received method.
    // We are Receiving a method like Client.OnVolumeChanged, here we
    // are only interested in the prefix Client. The rest is dispatched
    // at the subscribing function.

    this.socket.subscribe(
      (jsonrpc) => {
        if(!jsonrpc.hasOwnProperty('id')) {
          this.messageService.broadcast('Snapcast', jsonrpc);
        }
      },
      (err) => console.log(err),
      () => console.log('complete')
    );

    this.clients = [];

  }

  public uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  public getServer():any {
    return this.getServerStatus()
      .pipe(
        map((data: any) => {
          this.streams = data.result.server.streams;
          return data.result.server;
        })
      );
  }

  public getStreams(): any {
    return this.streams;
  }

  public setStream(streamId: string, grouId: string) {
    return this.sendAsync('Group.SetStream', {id: grouId, stream_id: streamId}).pipe(
      map((data: any) => {
        return data.result;
      })
    );
  }

  public getServerStatus() {
    return this.sendAsync('Server.GetStatus', null);
  }

  public clientSetVolume(clientId, volume) {
    let message = this.toJsonRPC('Client.SetVolume', {id: clientId, volume: {muted: volume.muted, percent: volume.percent}})
    this.socket.next(message);
  }

  public toJsonRPC(method, params): string {
    let message: string;
    if (params != null) {
      message = JSON.stringify({id: this.uuidv4(), jsonrpc: '2.0', method: method, params: params});
    } else {
      message = JSON.stringify({id: this.uuidv4(), jsonrpc: '2.0', method: method});
    }
    return message;
  }

  /*
  public sendSync(method, params): Observable<any> {
     let message = this.toJsonRPC(method, params);
     return this.http.post(`http://${environment.snapcast.ip}:${environment.snapcast.port}/jsonrpc`, message);
  }*/


  public sendAsync(method, params): Observable<any> {
    let message = this.toJsonRPC(method, params);
    return this.http.post(`http://${environment.snapcast.ip}:${environment.snapcast.port}/jsonrpc`, message);
  }

  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
