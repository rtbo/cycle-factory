import { Injectable } from '@angular/core';

import { CycleService } from '../services/cycle.service';
import { Cycle } from "../cycle";

const interCoefs = [ 2, 2.5, 2 ]; // 1, 2, 5, 10, 20, 50, ...
const minInterGrad = 40;

export class TimeGrad {
    time: number;
    pos: number;
}

@Injectable()
export class GanttTimeMapService {

    constructor(private cycleService: CycleService)
    {}

    cycle: Cycle;
    private _width: number;

    private _scale: number;
    private _duration: number;

    updateCanvasWidth(width: number) {
        this._width = width;

        if (!this.cycle) {
            this.cycleService.currentCycleObservable.subscribe(
                (cycle: Cycle) => {
                    this.cycle = cycle;
                    this.initMap();
                }
            );
        }
    }

    initMap() {
        this._duration = 60;
        if (this.cycle) this._duration = Math.max(this._duration, this.cycle.cycleTime);

        this._scale = this._width / this._duration;
    }

    timePos(time: number): number {
        return time * this._scale;
    }
    posTime(pos: number): number {
        return pos / this._scale;
    }

    get grads(): TimeGrad[] {
        let interG = 1;
        let i = 0;
        while (this.timePos(interG) < minInterGrad) {
            interG *= interCoefs[i];
            if (++i == interCoefs.length) {
                i = 0;
            }
        }

        const numGrads = Math.round(1 + this.posTime(this._width) / interG);
        let grads: TimeGrad[] = new Array(numGrads);

        for (i=0; i<numGrads; ++i) {
            let t = i * interG;
            grads[i] = {
                time: t, pos: Math.round(this.timePos(t))
            };
        }

        return grads;
    }
}
