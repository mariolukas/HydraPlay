import { Injectable, EventEmitter } from '@angular/core';
import * as Mopidy from 'mopidy';
import { HttpClient } from '@angular/common/http';
import {Subject, from, of, Observable, BehaviorSubject, zip} from 'rxjs';
import {map, switchMap, filter, repeat} from "rxjs/operators";

export interface IStreamState {
    title: string;
    album: string;
    coverUri: string;
    uri: string;
    artist: string;
    playbackState: string;
    repeat: boolean;
    random: boolean;
    tlid: number;
}

export class MopidyPlayer {
  public mopidy$: Mopidy;
  private id: string;
  private mopidyPort: string;
  private mopidyIP: string;
  private protocol: string;
  public currentTrackList:any;
  public isConnected: boolean;

  public updatePlayerState$: BehaviorSubject<IStreamState>;
  public updateTrackList$: BehaviorSubject<any>;

  public currentPlayerState:IStreamState;

  constructor(instance: any) {

    this.setWebmopidyProtocol();
    this.id = instance.stream_id;
    this.mopidyPort = instance.port;
    this.mopidyIP = instance.ip;

    this.currentPlayerState = MopidyPlayer.newStreamState();
    this.updatePlayerState$ = new BehaviorSubject<IStreamState>(this.currentPlayerState);
    this.updateTrackList$ = new BehaviorSubject<any>(this.currentTrackList);

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
                this.setCurrentTrackState();
                this.setCurrentPlayerOptions();
                this.setCurrentPlaybackState();
                break;
            case 'state:offline':
                this.isConnected = false;
        }
    });

    this.mopidy$.on('event', (event)=>{

        console.log(`[Mopidy_${this.id}][event]`, event);
        switch (event) {
            case 'event:tracklistChanged':
                this.getTrackList().subscribe(tracklist =>this.updateTrackList$.next(tracklist));
                break;
            case 'event:trackPlaybackEnded':
                this.setCurrentPlaybackState();
                break;
            case 'event:trackPlaybackStarted':
                this.setCurrentTrackState();
                break;
            case 'event:playbackStateChanged':
                this.setCurrentPlaybackState();
                break;
            case 'event:optionsChanged':
                this.setCurrentPlayerOptions();
                break;
            case 'event:streamTitleChanged':
                this.updateCurrentStreamTitle();
                break;
        }
      })
  }

  public getCurrentTlTrack(){
      return from(this.mopidy$.playback.getCurrentTlTrack());
  }

  public static newStreamState(): IStreamState{
      return {
        title: "no Track",
        album: "no Album",
        coverUri:  "../../assets/images/cover_placeholder.jpg",
        uri: "none",
        artist: "none",
        playbackState: 'paused',
        random: false,
        repeat: false,
        tlid: -1
      }
  }

  private isEndOfTracklist(){
      from(this.mopidy$.tracklist.getEotTlid()).subscribe((tlid)=>{
          console.log(tlid);
          if (tlid)
              return false;
          else
              return true;
      });
  }

  private setWebmopidyProtocol() {

  }

  public getId(): string {
    return this.id;
  }

  public setCurrentPlayerOptions(){
      let statusSubscription$ = zip(
          from(this.mopidy$.tracklist.getRepeat()),
          from(this.mopidy$.tracklist.getRandom())
      )
       statusSubscription$.subscribe(([repeatState, randomState]) => {
              this.currentPlayerState.repeat = repeatState;
              this.currentPlayerState.random = randomState;
              this.updatePlayerState$.next(this.currentPlayerState);
       });
  }

  public setCurrentPlaybackState(){
          from(this.mopidy$.playback.getState()).subscribe( playbackState => {
                  this.currentPlayerState.playbackState = playbackState;
                  this.updatePlayerState$.next(this.currentPlayerState);
          });
  }

  public updateCurrentStreamTitle(){

      from(this.mopidy$.playback.getStreamTitle()).subscribe((title) =>{
             this.currentPlayerState.title = title;
             this.updatePlayerState$.next(this.currentPlayerState);
      })
  }

  public resetTrack(){
      this.currentPlayerState = MopidyPlayer.newStreamState();
      this.updatePlayerState$.next(this.currentPlayerState);
  }

  public setCurrentTrackState() {

      let statusSubscription$ = zip(
          from(this.mopidy$.playback.getState()),
          from(this.mopidy$.playback.getCurrentTlTrack()),
      )

      statusSubscription$.subscribe(([playbackState, currentTrack]) => {
        if(currentTrack && playbackState) {
            if (this.currentPlayerState.uri != currentTrack.track.uri ||
                this.currentPlayerState.title != currentTrack.track.name
            ) {

                this.currentPlayerState.album = currentTrack.track.album.name;
                this.currentPlayerState.artist = currentTrack.track.artists[0].name;
                this.currentPlayerState.title = currentTrack.track.name;
                this.currentPlayerState.uri = currentTrack.track.uri;
                this.currentPlayerState.tlid = currentTrack.tlid;
                this.currentPlayerState.playbackState = playbackState;

                from(this.mopidy$.library.getImages({uris: [currentTrack.track.uri]}))
                    .subscribe((images) => {

                        if (images) {
                            if (images[currentTrack.track.uri].length > 1) {
                                this.currentPlayerState.coverUri = images[currentTrack.track.uri][1].uri
                            } else {
                                this.currentPlayerState.coverUri = images[currentTrack.track.uri][0].uri
                            }
                        } else {
                            this.currentPlayerState.coverUri = "../../assets/images/cover_placeholder.jpg";
                        }

                        this.updatePlayerState$.next(this.currentPlayerState);
                    })
            }
        }
      })

  }

  public getTrackList(){
      return from(this.mopidy$.tracklist.getTlTracks());
  }

  public getPlaylists() {
      return from(this.mopidy$.playlists.asList());
  }

  public appendPlayListToTrackList(playlistURI){
         let uris = [];
         return from(this.mopidy$.playlists.getItems({uri: playlistURI}))
             .pipe(map(tracks =>{
                tracks.forEach((track)=>{
                  uris.push(track.uri);
                });
                return this.addUriToTrackList(uris).subscribe();
             }));
  }

  public search(query:string):Observable<object> {

      let queryElements = query.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
      queryElements = queryElements.map(function (el) {
          return el.replace(/"/g, '');
      });

      return from(this.mopidy$.library.search({query:{ 'any' : queryElements }, uris:['spotify:', 'tunein:'], exact:false})).pipe(
          map(searchResult => {
              let combinedSearch: object[] = [];
              if (searchResult) {
                  searchResult.forEach((searchURI, index) => {
                      if(searchResult[index].tracks) {
                          searchResult[index].tracks.forEach((track) => {
                              combinedSearch.push(track);
                          })
                      }
                  })
              }
              return combinedSearch;
          })
      );
  }

  public clearTrackList() {
      //this.resetTrack();
      return from(this.mopidy$.tracklist.clear()).subscribe();
  }

  public addTrackToTrackList(track){
      return from(this.mopidy$.tracklist.add({tracks: [track]}));
  }

  public playTrack(tlid){
      from(this.mopidy$.playback.play({tlid: tlid})).subscribe();
  }

  public addUriToTrackList(uris){
      return from(this.mopidy$.tracklist.add({uris:uris}));
  }

  public setRandom(value :boolean) {
      from(this.mopidy$.tracklist.setRandom({value: value})).subscribe();
  }

  public setRepeat(value :boolean) {
      from(this.mopidy$.tracklist.setRepeat({value: value})).subscribe();
  }

  public removeTrackFromlist(track){
      from(this.mopidy$.tracklist.remove({criteria:{"tlid":[track.tlid]}})).subscribe();
  }

  public getCover(uri) {
     return from(this.mopidy$.library.getImages({uris: [uri]}));
  }

  public resume() {
      from(this.mopidy$.playback.resume()).subscribe();
  }

  public pause() {
      from(this.mopidy$.playback.pause()).subscribe();
  }

  public play(){
    from(this.mopidy$.playback.getCurrentTlTrack()).subscribe(track => {
          this.playTrack(track);
     });
  }

  public nextTrack() {
      from(this.mopidy$.playback.next()).subscribe();
  }

  public previousTrack() {
      from(this.mopidy$.playback.previous()).subscribe();
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
