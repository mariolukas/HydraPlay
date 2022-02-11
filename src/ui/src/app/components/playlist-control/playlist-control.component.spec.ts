import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistControlComponent } from './playlist-control.component';

describe('PlaylistControlComponent', () => {
  let component: PlaylistControlComponent;
  let fixture: ComponentFixture<PlaylistControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
