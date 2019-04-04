import { TestBed } from '@angular/core/testing';

import { SnapcastService } from '../../../app/services/snapcast.service';

describe('SnapcastService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SnapcastService = TestBed.get(SnapcastService);
    expect(service).toBeTruthy();
  });
});
