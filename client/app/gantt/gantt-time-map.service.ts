import { Injectable } from '@angular/core';

import { CycleService } from '../services/cycle.service';
import { Cycle } from "../cycle";

@Injectable()
export class GanttTimeMapService {

    constructor(private cycleService: CycleService) {
    }

    cycle: Cycle;

    updateCanvasSize(width: number, height: number) {
        if (!this.cycle) {
            this.cycleService.currentCycleObservable.subscribe(
                (cycle: Cycle) => { this.cycle = cycle; }
            );
        }
        console.log("canvas size: %dx%d", width, height);
    }

}
