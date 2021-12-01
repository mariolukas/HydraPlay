import { Injectable, EventEmitter } from '@angular/core';
import * as Mopidy from 'mopidy';
import { HttpClient } from '@angular/common/http';
import {Subject, from, Observable, BehaviorSubject} from 'rxjs';
import {map } from "rxjs/operators";

export interface IStreamState {
    title: string;
    album: string;
    coverUri: string;
    uri: string;
    artist: string;
    playbackState: string;
}


export class MopidyPlayer {

  public mopidy$: Mopidy;
  private id: string;
  private mopidyPort: string;
  private mopidyIP: string;
  private protocol: string;
  public currentTrackList:any;
  public isConnected: boolean;

  public trackUpdate$: Subject<Mopidy.models.Track>;
  public coverUpdate$: Subject<string>;

  public updateCurrentState$: BehaviorSubject<IStreamState>;
  public updateCurrentTrackList$: BehaviorSubject<any>;

  public currentState:IStreamState;

  constructor(instance: any) {

    this.setWebmopidyProtocol();
    this.id = instance.stream_id;
    this.mopidyPort = instance.port;
    this.mopidyIP = instance.ip;

    this.trackUpdate$ = new Subject<Mopidy.models.Track>();
    this.coverUpdate$ = new Subject<string>();

    this.currentState = MopidyPlayer.newStreamState();
    this.updateCurrentState$ = new BehaviorSubject<IStreamState>(this.currentState);
    this.updateCurrentTrackList$ = new BehaviorSubject<any>(this.currentTrackList);


    const url = new URL(window.location.href);
    let wsUrl = `ws://${url.hostname}:${this.mopidyPort}/mopidy/ws`;

    this.mopidy$ = new Mopidy({
        webSocketUrl: wsUrl,
    });

    this.mopidy$.on('state', (state) => {
        console.log(`[Mopidy_${this.id}][state] ${state}`);
        switch (state) {
            case 'state:online':
                this.isConnected = true;
                this.updateCurrentState();
                break;
            case 'state:offline':
                this.isConnected = false;
        }
    });


    this.mopidy$.on('event', (event)=>{

        console.log(`[Mopidy_${this.id}][event]`, event);
        switch (event) {
            case 'event:tracklistChanged':
            case 'event:trackPlaybackStarted':
            case 'event:trackPlaybackEnded':
                this.currentState.playbackState = "stopped";
                this.updateCurrentState$.next(this.currentState);
                break;
            case 'event:playbackStateChanged':
                this.updateCurrentState();
                break;
        }
      })
  }

  public async getCurrentTlTrack(){
      return await this.mopidy$.playback.getCurrentTlTrack();
  }

  public getCurrentState():IStreamState{
      if (this.isConnected) {
          this.updateCurrentState$.next(this.currentState);
      }
      return this.currentState;
  }

  public static newStreamState(): IStreamState{
      return {
        title: "no Track",
        album: "no Album",
        coverUri:  "../../assets/images/cover_placeholder.jpg",
        uri: "none",
        artist: "no Artist",
        playbackState: 'paused',
      }
  }

  private setWebmopidyProtocol() {
      if (location.protocol !== 'https:') {
          this.protocol = 'ws';
      } else {
          this.protocol = 'wss';
      }
  }

  public getId(): string {
    return this.id;
  }


  public async updateCurrentState(){
      let playbackState = await this.mopidy$.playback.getState()
      this.currentState.playbackState = playbackState;
      console.log(this.currentState);

      let track = await this.mopidy$.playback.getCurrentTrack();
      if (track) {
          this.currentState.album = track.album.name;
          this.currentState.artist = track.artists[0].name;
          this.currentState.title = track.name;

          let images = await this.mopidy$.library.getImages({uris: [track.uri]});
          this.currentState.coverUri = images[track.uri][0].uri;
      }
      this.updateCurrentState$.next(this.currentState);
  }

  public async updateCurrentTrackList(){
      this.currentTrackList = await this.mopidy$.tracklist.getTlTracks();
      if(this.currentTrackList) {
          this.updateCurrentTrackList$.next(this.currentTrackList);
      }
  }

  public getPlaylists():Promise<object>{
      return this.mopidy$.playlists.asList().then((result)=>{
          console.log("Found Playlsits: ", result);
          return result;
      });
  }

  public appendPlayListToTrackList(playlistURI){
         let uris = [];
         this.mopidy$.playlists.getItems({uri: playlistURI}).then((res)=>{
              res.forEach((el)=>{
                  uris.push(el.uri);
              })
             this.addUriToTrackLIst(uris);
          });
  }

  public search(query:string):Observable<object> {

      let queryElements = query.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
      queryElements = queryElements.map(function (el) {
          return el.replace(/"/g, '');
      });

      return from(this.mopidy$.library.search({query:{ 'any' : queryElements }, uris:['spotify:', 'tunein:'], exact:false})).pipe(
          map(searchResult => {
              let combinedSearch: object[] = [];
              searchResult.forEach((searchURI, index) =>{
                 searchResult[index].tracks.forEach((track) =>{
                    combinedSearch.push(track);
                })
              })

              // sample code for playlist loading
              /*


               */
              console.log(searchResult);
              return combinedSearch;
          })
      );



  }

  public async clearTrackList():Promise<void> {
      return await this.mopidy$.tracklist.clear();
  }

  public async addTrackToTrackList(track):Promise<object>{
      return await this.mopidy$.tracklist.add({tracks: [track]});
  }


  public async playTrack(pTrack, clear:boolean):Promise<void> {
      if (clear) {
          await this.clearTrackList();
      }

      if( pTrack.track){
          console.log(pTrack);

         await this.mopidy$.playback.play({tlid: pTrack.tlid}) //  play(pTrack);
      } else {
         const tlTrack = await this.addTrackToTrackList(pTrack);
         console.log(tlTrack);
         await this.mopidy$.playback.play(tlTrack);
      }

      //this.updateCurrentTrackList();
  }

  public addTrackToTracklist(track){
      this.mopidy$.tracklist.add({tracks:[track]}).then((result) =>{
         this.updateCurrentTrackList();
      });

  }

  public addUriToTrackLIst(uris){
      this.mopidy$.tracklist.add({uris:uris}).then((result) =>{
         this.updateCurrentTrackList();
      });
  }


  public async removeTrackFromlist(track){
       let result = await this.mopidy$.tracklist.remove({criteria:{"tlid":[track.tlid]}});
       this.updateCurrentTrackList();
  }

  public async getCover(uri):Promise<object> {
     return await this.mopidy$.library.getImages({uris: [uri]});
  }

  public resume() {
      //
      this.mopidy$.playback.resume();
  }

  public pause() {
      this.mopidy$.playback.pause();
  }

  public async play(clear:boolean){
     let track = await this.mopidy$.playback.getCurrentTlTrack();

     if (track) {
         this.playTrack(track, clear);
     }
  }

  public async nextTrack() {
        await this.mopidy$.playback.next();
  }

  public async previousTrack() {
       await this.mopidy$.playback.previous();
  }
}


@Injectable({
  providedIn: 'root'
})
export class MopidyPoolService {

  public mopidies: MopidyPlayer[] = [];
  poolReady: boolean;
  public poolIsReady$: Subject<boolean> = new Subject<boolean>();


  constructor( private http: HttpClient) {
        this.poolReady = false;
  }

  public generateMopidyConnectioPool(){

      const url = new URL(window.location.href);
      const hydraplayPort = url.port;
      const hydraplayHost = url.hostname;
      const hdraplayProtocol = "http";


      this.http.get<any>(hdraplayProtocol + "://" + hydraplayHost + ":" + hydraplayPort + "/api/mopidy/settings").subscribe(settings => {
        settings.forEach(instance => {
            let mopidyPlayer = new MopidyPlayer( instance );
            this.mopidies.push(mopidyPlayer);
        });
        this.poolReady = true
        this.poolIsReady$.next(this.poolReady);
      });

  }

  public checkIfAllInstancesAvailable(){
      let numberOfConnectedInstances = 0;
      this.mopidies.forEach((instance)=>{
          if(instance.isConnected){
              numberOfConnectedInstances++;
          }
      })
      if (numberOfConnectedInstances == this.mopidies.length)
          return true
      else
          return false
  }


  public getMopidyInstanceById(id: string) {
    let mopidy = this.mopidies.find(mopidy => {return mopidy.getId() === id});
    return mopidy;
  }

}
