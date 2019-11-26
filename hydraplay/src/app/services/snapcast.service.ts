import { ErrorHandler, Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {  map, tap, catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import {MessageService} from './message.service';
//import { webSocket } from 'rxjs/webSocket'; // for RxJS 6, for v5 use Observable.webSocket

export interface Message {
  method: string;
  params: object;
}

@Injectable({
  providedIn: 'root'
})
export class SnapcastService {

  public clients: Array<object> = [];
  public socket: any;

  public streams: any;

  public snapcastURL = `ws://${environment.snapcast.ip}:${environment.snapcast.port}/jsonrpc`;


  constructor(private http: HttpClient, private messageService: MessageService) {

    this.socket = new WebSocket(this.snapcastURL);
    //this.socket.binaryType = 'arraybuffer';

    let that = this;
    this.socket.onopen = function() {
        that.send('{"id":1,"jsonrpc":"2.0","method":"Server.GetStatus"}');
    }

    this.socket.onmessage = function(buf) {
      console.log(buf.data);
        //let recv = String.fromCharCode.apply(null, new Uint8Array(buf.data));
        let jsonrpc = JSON.parse(buf.data);


        if (!jsonrpc.hasOwnProperty('error')) {

            if (!jsonrpc.hasOwnProperty('method') && jsonrpc.result.hasOwnProperty('server')) {
                that.streams = jsonrpc.result.server.streams;
            }
            that.messageService.broadcast('Snapcast', jsonrpc);
        }
    }

    this.clients = [];

  }

  public send(jsonrpc: any) {
      this.socket.send(jsonrpc);
  }

  public uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public getStreams(): any {
    return this.streams;
  }

  public setStream(streamId: string, groupId: string) {
      let message = '{"id":4,"jsonrpc":"2.0","method":"Group.SetStream","params":{"id":"' + groupId + '","stream_id":"' + streamId +'"}}'
      this.send(message);
  }

  public getServerStatus(){
    let message = this.toJsonRPC('Server.GetStatus', null);
    this.send(message);
  }

  public clientSetVolume(clientId, volume) {
    let message = '{"id":8,"jsonrpc":"2.0","method":"Client.SetVolume","params":{"id":"' + clientId + '","volume":{"muted":' + volume.muted + ',"percent":' + volume.percent + '}}}'
    this.send(message);
  }

  public toJsonRPC(method, params): string {
    let message: string;
    if (params != null) {
      message = `{"id":"1","jsonrpc":"2.0","method":"Client.SetVolume","params":${JSON.stringify(params)}}`;
    } else {
      message = JSON.stringify({id: this.uuidv4(), jsonrpc: '2.0', method: method});
    }
    console.log(message);
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
