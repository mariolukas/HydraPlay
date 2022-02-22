import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {MopidyPoolService} from "../../services/mopidy.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-playlist-control',
  templateUrl: './playlist-control.component.html',
  styleUrls: ['./playlist-control.component.scss']
})
export class PlaylistControlComponent implements OnInit {

  @Input() tracklist: any = [];
  @Input() playlists: any = [];
  @Input() group: any;
  public waitingForTracklist: boolean;
  public waitingForPlaylists: boolean;
  private mopidy$: any;

  constructor(private mopidyPoolService: MopidyPoolService, public notificationService: NotificationService) { }

  ngOnInit(): void {
     this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);

     this.mopidy$.event$.subscribe((event) =>{
      switch(event){
        case 'event:playlistChanged':
        case 'event:playlistDeleted':
          this.mopidy$.getPlaylists().subscribe( playlists =>{
              this.playlists = playlists;
              this.waitingForPlaylists = false;
          });
          break;
      }
    });

    this.waitingForTracklist = true;
    this.mopidy$.getTrackList().subscribe(tracklist =>{
      this.tracklist = tracklist;
      this.waitingForTracklist = false;
    });

    this.waitingForPlaylists = true;
    this.mopidy$.getPlaylists().subscribe( playlists =>{
       this.playlists = playlists;
       this.waitingForPlaylists = false;
    });

    this.mopidy$.updateTrackList$.subscribe(tracklist =>{
      this.tracklist = tracklist;
    })
  }

  ngOnDestroy(): void{
  }
}
