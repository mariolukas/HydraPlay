import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-result-list',
  templateUrl: './search-result-list.component.html',
  styleUrls: ['./search-result-list.component.scss']
})
export class SearchResultListComponent implements OnInit {

  @Input() results: any;
  @Input() group: any;
  constructor() { }

  ngOnInit(): void {
  }

}
