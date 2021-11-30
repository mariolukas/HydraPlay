import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackComponent } from '../../../../app/components/trackItem/tracklist.component';

describe('PlaylistComponent', () => {
  let component: TrackComponent;
  let fixture: ComponentFixture<TrackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
