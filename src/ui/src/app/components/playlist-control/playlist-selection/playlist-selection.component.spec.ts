import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSelectionComponent } from './playlist.component';

describe('PlaylistComponent', () => {
  let component: PlaylistSelectionComponent;
  let fixture: ComponentFixture<PlaylistSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
