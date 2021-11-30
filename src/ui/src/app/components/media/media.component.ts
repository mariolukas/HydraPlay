import { ElementRef, ViewChild, Injectable, Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {SnapcastService} from '../../services/snapcast.service';
import {MopidyPoolService} from '../../services/mopidy.service';


@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']

})

@Injectable({
  providedIn: 'root'
})
export class MediaComponent implements OnInit {

  @Input() streams: any;
  @Input() group: any;
  @Input() closable = true;
  @Input() visible: boolean;
  @Input() searchValue: string;
  @Input() searchResult: any[];
  public waitingForResults:boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('searchBox') searchBox: ElementRef;

  private selectedGroup: any;
  private mopidy: any;
  public searchString: string;

  constructor(private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService) {
    this.visible = true;
  }

  ngOnInit() {
      this.mopidy = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id);
      this.streams = this.snapcastService.getStreams();
  }

  public show(group: object, mopidy: any) {
    this.selectedGroup = group;
    this.mopidy = mopidy;
  }

  public clearSearch() {
    this.searchResult = [];
  }

  public search(query:string){
    console.log("Search started");
    this.waitingForResults = true;
    this.clearSearch();
    this.mopidy.search(query).subscribe(result =>{

      this.searchResult = result;
      this.hideKeyboard();
      this.waitingForResults = false;
    });
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
