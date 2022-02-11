import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracklistComponent } from './tracklist.component';

describe('TracklistComponent', () => {
  let component: TracklistComponent;
  let fixture: ComponentFixture<TracklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TracklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TracklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
