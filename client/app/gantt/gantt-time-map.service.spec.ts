import { TestBed, inject } from '@angular/core/testing';

import { GanttTimeMapService } from './gantt-time-map.service';

describe('TimeMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GanttTimeMapService]
    });
  });

  it('should be created', inject([GanttTimeMapService], (service: GanttTimeMapService) => {
    expect(service).toBeTruthy();
  }));
});
