import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MopidyPoolService} from "../../../services/mopidy.service";
import {getSortHeaderNotContainedWithinSortError} from "@angular/material/sort/sort-errors";

@Component({
  selector: 'app-tracklist',
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.scss']
})
export class TracklistComponent implements OnInit {

  @Input() tracks: any;
  @Input() group: any;
  private mopidy$: any;
  public trackListName: String;
  public trackListDialogIsOpen: boolean
  public playlistName: String;

  constructor(private mopidyPoolService: MopidyPoolService) {
    this.trackListDialogIsOpen = false;
    this.playlistName = "";

  }

  ngOnInit(): void {
      this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);

  }

  public openTrackListDialog():void{
     this.trackListDialogIsOpen = true;
     this.playlistName = "";
  }

  public saveTrackListAsPlayList(): void {
    this.trackListDialogIsOpen = false;
    console.log(this.playlistName);
    this.mopidy$.saveTrackListAsPlayList(this.playlistName);
  }

  public cancelTrackListDialog():void{
    this.trackListDialogIsOpen = false;
    this.playlistName = "";
  }

  public clearTrackList(){
    this.mopidy$.clearTrackList();
  }



  dropTrackListItem(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tracks, event.previousIndex, event.currentIndex);
    this.mopidy$.moveTrack(event.previousIndex, event.previousIndex, event.currentIndex);

  }

}
