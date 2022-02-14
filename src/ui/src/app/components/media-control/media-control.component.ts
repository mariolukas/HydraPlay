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
  public extenstionsOptionsList: {name:string, selected:boolean }[] =[];

  constructor( private snapcastService: SnapcastService, private mopidyPoolService:MopidyPoolService,
               public notificationService: NotificationService) {
  }

  ngOnInit() {
      this.mopidy$ = this.mopidyPoolService.getMopidyInstanceById(this.group.stream_id)
      this.streams = this.snapcastService.getStreams();
      this.initExtenstionsFilterList();
  }

  public initExtenstionsFilterList(){
      let extensions = this.mopidy$.getExtensions();
      extensions.forEach((extension) =>{
            this.extenstionsOptionsList.push({name: extension, selected: true })
      })
  }

  public extensionFilterChanged(extentsion, $event){
      let index = this.extenstionsOptionsList.findIndex((obj => obj.name == extentsion.name));
      this.extenstionsOptionsList[index]['selected'] = $event.checked;
      if (this.getExtensionsFilterQuery().length == 0){
          this.searchResult = [];
      } else {
          if (this.searchString && this.searchString.length > 0) {
              this.search(this.searchString);
          }
      }
  }

  public clearSearch() {
    this.searchResult = [];
  }

  public getExtensionsFilterQuery(){
      let filter = [];
      this.extenstionsOptionsList.forEach((extension) =>{
          if (extension.selected) filter.push(extension.name+':');
      })
      return filter;
  }

  public search(query:string){
    if(query.length > 0) {
        this.waitingForResults = true;
        this.clearSearch();
        let filter = this.getExtensionsFilterQuery()
        this.mopidy$.search(query,filter).subscribe(result => {
            this.searchResult = result;
            if(this.searchResult.length == 0) this.notificationService.info(`No results found for '${query}'`);
            //this.hideKeyboard();
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
