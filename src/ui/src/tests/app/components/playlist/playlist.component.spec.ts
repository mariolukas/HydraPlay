import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TracklistComponent } from '../../../../app/components/tracklist/tracklist.component';

describe('PlaylistComponent', () => {
  let component: TracklistComponent;
  let fixture: ComponentFixture<TracklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TracklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TracklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
