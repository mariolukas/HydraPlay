import { Injectable, EventEmitter } from '@angular/core';
import * as Mopidy from 'mopidy';
import { HttpClient } from '@angular/common/http';
import {Subject, from, of, Observable, BehaviorSubject, zip} from 'rxjs';
import {map, switchMap, filter, repeat} from "rxjs/operators";
import {NotificationService} from "./notification.service";

export interface IStreamState {
    title: string;
    album: string;
    length: number;
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
  private index: number;
  private notificationService:NotificationService;
  private mopidyPort: string;
  private mopidyIP: string;
  public extensions: [];
  private wsProtocol: string;
  public currentTrackList:any;
  public playlists:any;
  public isConnected: boolean;
  public event$ = new Subject();
  public updatePlayerState$: BehaviorSubject<IStreamState>;
  public updateTrackList$: BehaviorSubject<any>;

  public currentPlayerState:IStreamState;

  constructor(instance: any, hydraplay_config:any, notificationService:NotificationService) {

      this.wsProtocol = 'ws://';
    if (window.location.protocol === 'https:') {
        this.wsProtocol = 'wss://';
    }
    this.id = instance.stream_id;
    this.mopidyPort = instance.port;
    this.mopidyIP = instance.ip;
    this.extensions = instance.extensions;
    this.index = instance.id;

    this.notificationService = notificationService;

    this.currentPlayerState = MopidyPlayer.newStreamState();
    this.updatePlayerState$ = new BehaviorSubject<IStreamState>(this.currentPlayerState);
    this.updateTrackList$ = new BehaviorSubject<any>(this.currentTrackList);

    const url = new URL(window.location.href);

    let wsUrl = `${this.wsProtocol}${url.hostname}:${this.mopidyPort}/mopidy/ws`;

    if (hydraplay_config['ws_uri_proxy']) {
        wsUrl = `${this.wsProtocol}${url.hostname}/stream/${this.index}/mopidy/ws`;
    }

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
                this.notificationService.info(`${this.id} connection lost.`)
            break;
        }
    });

    this.mopidy$.on('event', (event)=>{

        console.log(`[Mopidy_${this.id}][event]`, event);
        this.event$.next(event);
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
        length: 0,
        coverUri:  "../../assets/images/cover_placeholder.jpg",
        uri: "none",
        artist: "none",
        playbackState: 'paused',
        random: false,
        repeat: false,
        tlid: -1
      }
  }

  public getExtensions():[]{
      return this.extensions;
  }

  public saveTrackListAsPlayList(name: string){
      from(this.mopidy$.playlists.create({name: name, uri_scheme:'m3u'})).subscribe((playlist) =>{
          from(this.mopidy$.tracklist.getTracks()).subscribe((tracks) =>{
              // hacky, dont do that at home.
              (playlist.tracks as Mopidy.models.Playlist['tracks']) = tracks;
             from(this.mopidy$.playlists.save({playlist: playlist})).subscribe();
          });
      });
  }

  public deletePlaylist(uri: string){
     return from(this.mopidy$.playlists.delete({uri:uri})).subscribe();
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

  public moveTrack(start, end, to_position){
      from(this.mopidy$.tracklist.move({start:start, end:end, to_position:to_position})).subscribe();
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
                this.currentPlayerState.length = currentTrack.track.length;
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

  public search(query:string, extensionFilter:[], mediaFilter:[]):Observable<object> {

      let queryElements = query.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
      queryElements = queryElements.map(function (el) {
          return el.replace(/"/g, '');
      });

     let mediaQuery:any = {};

     /*
      if(mediaFilter.length > 0) {
          mediaFilter.forEach( (element) =>{
                mediaQuery[element] = queryElements;
          });
      } else {
          mediaQuery = { 'any' : queryElements };
      }*/

      mediaQuery = { 'any' : queryElements };

      return from(this.mopidy$.library.search({query: mediaQuery, uris:extensionFilter, exact:false})).pipe(
          map(searchResult => {
              let combinedSearch: object[] = [];
              if (searchResult) {
                  searchResult.forEach((searchURI, index) => {

                          if (searchResult[index]?.tracks){
                              searchResult[index].tracks.forEach((track) => {
                                  combinedSearch.push(track);
                              })
                          }
                          if (searchResult[index].albums) {
                              searchResult[index].albums.forEach((album) => {
                                  combinedSearch.push(album);
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

  public addAlbumToTrackList(trackURI){
      from(this.mopidy$.library.lookup({uris: [trackURI]})).subscribe((albumTracks) =>{
          var trackList = albumTracks[Object.keys(albumTracks)[0]];
          trackList.forEach(track =>{
              this.addTrackToTrackList(track);
          });
      });
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
      from(this.mopidy$.tracklist.remove({criteria:{"tlid":[track.tlid]}})).subscribe(() =>{
          from(this.mopidy$.tracklist.getLength()).subscribe((numberOfTRacks)=>{
             if(numberOfTRacks == 0){
                 this.resetTrack();
             }
          });
      });
  }

  public getTrackPosition(){
      return from(this.mopidy$.playback.getTimePosition());
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

  public settings: any;
  public mopidies: MopidyPlayer[] = [];
  poolReady: boolean;
  public poolIsReady$: Subject<boolean> = new Subject<boolean>();

  constructor( private http: HttpClient,  public notificationService: NotificationService) {
        this.poolReady = false;
  }

  public generateMopidyConnectioPool(){

      const url = new URL(window.location.href);
      const hydraplayPort = url.port;
      const hydraplayHost = url.hostname;
      const hdraplayProtocol = url.protocol;

      this.http.get<any>(hdraplayProtocol + "://" + hydraplayHost + ":" + hydraplayPort + "/api/settings").subscribe(settings => {

        settings['mopidy_instances'].forEach(instance => {
            let mopidyPlayer = new MopidyPlayer( instance, settings['hydraplay'], this.notificationService );
            this.mopidies.push(mopidyPlayer);
            this.settings = settings;
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
