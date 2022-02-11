import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracklistItemComponent } from './tracklist-item.component';

describe('TracklistItemComponent', () => {
  let component: TracklistItemComponent;
  let fixture: ComponentFixture<TracklistItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TracklistItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TracklistItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
