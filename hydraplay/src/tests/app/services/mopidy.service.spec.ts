import { TestBed } from '@angular/core/testing';

import { MopidyService } from '../../../app/services/mopidy.service';

describe('MopidyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MopidyService = TestBed.get(MopidyService);
    expect(service).toBeTruthy();
  });
});
