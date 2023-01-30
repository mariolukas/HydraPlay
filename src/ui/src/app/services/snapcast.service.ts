import { Injectable } from '@angular/core';
import { webSocket,  WebSocketSubject } from "rxjs/webSocket";
import { HttpClient } from '@angular/common/http';
import {EMPTY, Subject, BehaviorSubject, Observable, timer, lastValueFrom} from 'rxjs';
import { catchError, tap, switchAll, retryWhen, delayWhen, map} from 'rxjs/operators';
import {NotificationService} from "./notification.service";

export interface ISnapCastEvent {
  label: string;
  method: string;
  params: object;
}

@Injectable({
  providedIn: 'root'
})
export class SnapcastService {

  private RECONNECT_INTERVAL = 2000;
  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));

  private snapcastPort: number;
  private snapcastHost: string;
  private reconnectTimeout: any;

  private wsProtocol: string;

  private groups: Array<any> = [];
  private streams: Array<any> = [];
  private players: any = {};
  private clients: Array<any> = [];

  public observableGroups$: BehaviorSubject<Array<object>>
  public observableClients$: BehaviorSubject<Array<object>>
  public snapCastIsConnected: boolean = false;

  constructor(private http: HttpClient, public notificationService: NotificationService) {
    const url = new URL(window.location.href);

    this.snapcastPort = 1780;
    this.snapcastHost = url.hostname;

    this.wsProtocol = 'ws://';
    if (window.location.protocol === 'https:') {
        this.wsProtocol = 'wss://';
    }

    this.observableClients$ = new BehaviorSubject<Array<object>>(this.clients);
    this.observableGroups$ = new BehaviorSubject<Array<object>>(this.groups);

  }

  public registerPlayer(playerId:string):Observable<any>{
    this.players[playerId] = new Subject();
    return this.players[playerId].asObservable();
  }

  public unregisterPlayer(playerId:string){
    delete this.players[playerId];
  }

  public getHydraplaySettings(){

    const url = new URL(window.location.href);
    const hydraplayPort = url.port;
    const hydraplayHost = url.hostname;
    const hdraplayProtocol = "http";

    return  this.http.get<any>(hdraplayProtocol + "://" + hydraplayHost + ":" + hydraplayPort + "/api/settings").pipe(map(response=>response));
  }

  public async connect(cfg: { reconnect: boolean } = { reconnect: false }) {
    console.log("Connecting to Snapcast Server ... ")

    if (!this.socket$ || this.socket$.closed) {
    this.messages$.subscribe(message => this.handleIncomingSnapcastEvent(message))

    let $hydra_settings = this.getHydraplaySettings();
    let hydra_settings = await lastValueFrom($hydra_settings);

    this.socket$ = this.getNewWebSocket(hydra_settings);
    const messages = this.socket$.pipe(cfg.reconnect ? this.reconnect : o => o,
       tap(error => {
           console.log(error)
       }), catchError(_ => EMPTY))
    this.messagesSubject$.next(messages);

    }
    this.getSnapCastServerState();
  }

  private getNewWebSocket(hydra_settings:any) {
    let wsUrl = `${this.wsProtocol}${this.snapcastHost}:${this.snapcastPort}/jsonrpc`;

    if (hydra_settings['hydraplay']['ws_uri_proxy']) {
       wsUrl = `${this.wsProtocol}${this.snapcastHost}/jsonrpc`;
    }

    return webSocket({
      url: wsUrl,
      closeObserver: {
       next: () => {
         console.log('[DataService]: connection closed');
         this.socket$ = undefined;
         this.connect({ reconnect: true });
       }
      },
    });
  }

  private reconnect(observable: Observable<any>): Observable<any> {
      return observable.pipe(
          retryWhen((errors => errors.pipe(
              tap(val => console.log('Snapcast: Try to reconnect', val)),
              delayWhen(_ => timer(3000))
          ))
      ));
  }

  private handleIncomingSnapcastEvent(message){

     if (message.hasOwnProperty('method')){
        console.log(message);

        switch (message.method) {
          case "Client.OnNameChanged":
          case "Client.OnLatencyChanged":
          case "Client.OnVolumeChanged":
            this.sendNotificationToPlayer(message);
            break;
          case "Client.OnDisconnect":
            this.notificationService.info(`${message.params.client.host.name} connection lost.`)
            this.reconnectTimeout = setInterval(this.connect, 1000);
            this.getSnapCastServerState();
            break;
          case "Client.OnConnect":
            this.getSnapCastServerState();
            clearInterval(this.reconnectTimeout)
            break;
          case "Server.OnUpdate":
             this.observableGroups$.next(message.params.server.groups);
             this.sendNotificationToPlayer(message);
            break;
          case "Group.OnStreamChanged":
               console.log(message.params.id);
            break;
          case "Stream.OnUpdate":
              this.sendNotificationToPlayer(message);
            break;
          default:
            console.log("Unhandled Snapcast Event: ", message.method,message)
            break;
        }
      } else {
          // We've got a SnapCast server status.
          if (message.hasOwnProperty('result') &&
              message.result.hasOwnProperty('server') &&
              message.result.server.hasOwnProperty('groups')) {
            console.log("Snapcast Server Status: ", message)
            this.groups = message.result.server.groups;
            this.streams = message.result.server.streams;

            message.result.server.groups.forEach(group => {
              group.clients.forEach((client) => {
                this.clients.push(client);
              })
            })

            this.observableClients$.next(this.clients);
            this.observableGroups$.next(this.groups);

        }
      }
  }

  public getStreams():any {
    return this.streams;
  }

  public getGroups():any {
    return this.groups;
  }

  private sendNotificationToPlayer(message:any){
    this.groups.forEach(group =>{
      group.clients.forEach((client) =>{
          if (client.connected){
             this.players[group.id].next(message);
          }
      })
    });
  }

  public getPlayerObserverById(playerId){
      return this.players[playerId];
  }



  public sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  public setVolume(client_id:string, volume:number, muted: boolean){
    const message = {
        "id": this.uuidv4(),
        "jsonrpc":"2.0",
        "method":"Client.SetVolume",
        "params": {
          "id": client_id,
          "volume":{
            "muted": muted,
            "percent": volume
          }
        }
    }
    this.sendMessage(message);
  }

  public getAllStreams(){
    return this.streams;
  }

  public getAllClients(){
    const clientList = []
    this.groups.forEach(group =>{
      group.clients.forEach(client =>{
        clientList.push(client);
      });
    });
    return clientList;
  }

  public setStream(streamId, groupId){
    const message = {
        "id": this.uuidv4(),
        "jsonrpc":"2.0",
        "method":"Group.SetStream",
        "params": {
          "id": groupId,
          "stream_id": streamId
        }
    };

    this.sendMessage(message);
    this.getSnapCastServerState();
  }

  public updateClientsInGroup(group:any, clients:any[]){
     const message = {
        "id": this.uuidv4(),
        "jsonrpc":"2.0",
        "method":"Group.SetClients",
        "params": {
          "clients": clients,
          "id": group.id
        }
    };
    this.sendMessage(message)
  };

  public getSnapCastServerState() {
    const message = {
        "id": this.uuidv4(),
        "jsonrpc":"2.0",
        "method":"Server.GetStatus"
    };
    this.sendMessage(message);
  }

  public clientSetName(id:string, name:string){
    const message = {
      "id":this.uuidv4(),
      "jsonrpc":"2.0",
      "method":"Client.SetName",
      "params": {
        "id":id,
        "name":name
      }
    }
     this.sendMessage(message)
  }


  public getSnapCastClientStatus(id: string){
    const message = {
      "id": this.uuidv4(),
      "jsonrpc": "2.0",
      "method": "Client.GetStatus",
      "params": {
        "id": id
      }
    }
    this.sendMessage(message)
  }

  private uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public close() {
    this.socket$.complete();
  }
  
}
