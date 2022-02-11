import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerControlComponent } from './player-control.component';

describe('PlayerControlComponent', () => {
  let component: PlayerControlComponent;
  let fixture: ComponentFixture<PlayerControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
