import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SnapcastService} from "../../services/snapcast.service";
import {MopidyPoolService} from "../../services/mopidy.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-media-control',
  templateUrl: './media-control.component.html',
  styleUrls: ['./media-control.component.scss']
})
export class MediaControlComponent implements OnInit {
  @Input() streams: any;
  @Input() group: any;
  @Input() searchResult = [];
  @ViewChild('searchBox') searchBox: ElementRef;

  public waitingForResults:boolean = false;
  private mopidy$: any;
  public searchString: string;

  constructor( private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService,
               public notificationService: NotificationService) {
  }

  ngOnInit() {
      this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
      this.streams = this.snapcastService.getStreams();

  }

  public clearSearch() {
    this.searchResult = [];
  }

  public search(query:string){
    if(query.length > 0) {
        this.waitingForResults = true;
        this.clearSearch();
        this.mopidy$.search(query).subscribe(result => {
            this.searchResult = result;
            if(this.searchResult.length == 0) this.notificationService.info(`No results found for '${query}'`);
            this.hideKeyboard();
            this.waitingForResults = false;
        });
    }
  }


  private hideKeyboard() {
      this.searchBox.nativeElement.setAttribute('readonly', 'readonly'); // Force keyboard to hide on input field.
      this.searchBox.nativeElement.setAttribute('disabled', 'true'); // Force keyboard to hide on textarea field.
      let that = this;

      setTimeout(function() {
          that.searchBox.nativeElement.blur();  //actually close the keyboard
          // Remove readonly attribute after keyboard is hidden.
          that.searchBox.nativeElement.removeAttribute('readonly');
          that.searchBox.nativeElement.removeAttribute('disabled');
      }, 100);
  }

}
