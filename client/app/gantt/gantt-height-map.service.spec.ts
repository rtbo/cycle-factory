import { TestBed, inject } from '@angular/core/testing';

import { GanttHeightMapService } from './gantt-height-map.service';

describe('GanttHeightMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GanttHeightMapService]
    });
  });

  it('should be created', inject([GanttHeightMapService], (service: GanttHeightMapService) => {
    expect(service).toBeTruthy();
  }));
});
