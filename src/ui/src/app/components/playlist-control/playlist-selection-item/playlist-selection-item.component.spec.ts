import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSelectionItemComponent } from './playlist-item.component';

describe('PlaylistItemComponent', () => {
  let component: PlaylistSelectionItemComponent;
  let fixture: ComponentFixture<PlaylistSelectionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistSelectionItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistSelectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
