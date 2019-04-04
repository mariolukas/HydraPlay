import { Injectable, EventEmitter } from '@angular/core';
import Mopidy from 'mopidy';
import { environment } from './../../environments/environment';
import {MessageService} from './message.service';

class MopidyPlayer {
  private socket: Mopidy;
  private id: string;
  private tracks: any[];

  public mopidyOnline$: EventEmitter<MopidyPlayer>;


  constructor(instance: any, private messageService: MessageService) {
    this.id = instance.id;
    this.socket = new Mopidy({webSocketUrl: `ws://${instance.ip}:${instance.port}/mopidy/ws/`});

    this.socket.on('state:online',  () => {
      this.messageService.broadcast('Mopidy', `${instance.id}#event:online`);
    });

    this.socket.on('event', (event) => {
      console.log(event);
      this.messageService.broadcast('Mopidy',`${instance.id}#${event}` );
    });
  }

  public getId(): string {
    return this.id;
  }

  public getSocket(): Mopidy {
    return this.socket;
  }

  public getCurrentTrack(): any {
    return this.socket.playback.getCurrentTrack().then(track => {
        return track;
    });
  }

  public getCurrentState(): any {
    return this.socket.playback.getState().then(state => {
      return state;
    });
  }

  public search(query): any {
   // return this.socket.tracklist.clear().then(tracklist =>{
    var queryElements = query.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    queryElements = queryElements.map(function (el) {
      return el.replace(/"/g, '');
    });

      return this.socket.library.search({'any': `${queryElements}`}).then(result => {
        return result;
      });
    //});
  }

  public playTrack(track) {
    let tracklist = [];
    tracklist.push(track.uri);
    this.socket.tracklist.add({uris: tracklist}).then(tltracks => {
      this.socket.playback.play(tltracks);
    });

  }

  public play(value): void {
    if (value) {
      this.socket.playback.play(value).then(result => {
        console.log('Playing');
      });
    } else {
      this.socket.playback.play().then(result => {
        console.log('Playing');
      });
    }
  }

  public pause(): void {
    this.socket.playback.pause().then(result => {
      console.log('Pause');
    });
  }

  public nextTrack(): void {
    this.socket.playback.next().then(result =>{
      console.log('Next Track');
    });
  }

  public previousTrack(): void {
    this.socket.playback.previous().then(result =>{
      console.log('Previous Track');
    });
  }
}


@Injectable({
  providedIn: 'root'
})
export class MopidyService {

  public mopidies: MopidyPlayer[];

  constructor(private messageService: MessageService) {
    this.mopidies = [];

    environment.mopidy.forEach(mpInstance => {
        let _mopidy = new MopidyPlayer(mpInstance, this.messageService)
        this.mopidies.push(_mopidy);
    });

  }

  public getStreamById(id: string) {
    return this.mopidies.find(mopidy => {return mopidy.getId() === id});
  }

}
