import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import {SnapcastService} from '../../services/snapcast.service';
import { MediaComponent  } from '../media/media.component';
import {MopidyService} from '../../services/mopidy.service';
import {MessageService} from '../../services/message.service';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input() streams: any;
  @Input() client: any;
  @Input() group: any;
  @Input() mopidy: any;
  @Input() isPlaying: boolean;

  @Input() showDialog: boolean;
  @Output() onCallMediaModal = new EventEmitter();

  private currentAlbumCover: string;
  private  currentArtist: string;
  private currentTitle: string;

  constructor(private messageService: MessageService, private mopidyService: MopidyService, private snapcastService: SnapcastService, private media: MediaComponent) {
    this.currentAlbumCover = '../../assets/images/cover_placeholder.jpg';
    this.currentTitle = '-';
    this.currentArtist = '-';
  }

  ngOnInit() {


      this.messageService.on<string>('Mopidy')
          .subscribe(event => {
              if (event.streamId == this.group.stream_id) {
                  this.mopidy = this.mopidyService.getStreamById(event.streamId);
                  switch (event.label) {
                      case 'event:online':
                          this.updateCurrentState();
                          this.updateTrackInfo();
                          break;
                      case 'event:playbackStateChanged':
                          this.updateCurrentState();
                          break;
                      case 'event:streamTitleChanged':
                          this.updateTrackInfo();
                          break;
                  }
              }
          });

      this.messageService.on<string>('Snapcast')
          .subscribe(jsonrpc => {
            if (jsonrpc) {
                switch (jsonrpc.method) {
                    case 'Client.OnVolumeChanged':
                        if (jsonrpc.params.id === this.client.id) {
                            this.updateVolume(jsonrpc.params.volume);
                        }
                        break;
                    case 'Group.OnStreamChanged':
                        if (jsonrpc.params.id === this.group.id) {
                            this.group.stream_id = jsonrpc.params.stream_id;
                            this.mopidy = this.mopidyService.getStreamById(this.group.stream_id);
                            this.updateTrackInfo();
                        }
                        break;
                }
            }
          });
  }

  /**
   * Mopidy related Section
   */

  private updateCurrentState() {
    if (this.mopidy) {
      this.mopidy.getCurrentState().then(state => {
          if (state === 'playing') {
            this.isPlaying = true;
          } else {
            this.isPlaying = false;
          }
      });
    }
  }

  public pause() {
    if (this.isPlaying) {
        this.mopidy.pause();
        this.isPlaying = false;
    }
  }

  public play() {
    if (!this.isPlaying) {
        this.mopidy.play();
        this.isPlaying = true;
    }
  }

  public nextTrack() {
    this.mopidy.nextTrack();
  }

  public previousTrack() {
    this.mopidy.previousTrack();
  }

  public updateTrackInfo() {
        return this.mopidy.getCurrentTrack().then(track => {

                this.currentAlbumCover = track.album.images[0];
                this.currentArtist = track.album.name;
                this.currentTitle = track.name;

        }).catch(err => {
            console.error(err);
        });
  }


  /**
   * SnapCast related Section
   */

  public changeVolume(value) {
    let volume = { percent: this.client.config.volume.percent, muted:  this.client.config.volume.muted };
    switch (value) {
      case 'up':
        if (volume.percent < 100) {
          volume.percent += 1;
        }
        break;

      case 'down':
        if (volume.percent > 0) {
          volume.percent -= 1;
        }
        break;

      case 'mute':
        volume.muted = !volume.muted;
        break;
    }
    this.setVolume(volume);
  }

  private setVolume(volume: object) {
    this.snapcastService.clientSetVolume(this.client.id, volume);
  }

  private updateVolume(volume: any) {

    this.client.config.volume.muted = volume.muted;
    this.client.config.volume.percent = volume.percent;
  }

  /**
   * General Stuff
   */

  public onClickShowStreamModal(): void {
    this.showDialog = true;
    this.media.show(this.group, this.mopidy);
  }
}
