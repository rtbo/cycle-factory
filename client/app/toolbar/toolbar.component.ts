import { Component, OnInit } from '@angular/core';
import { Cycle } from '../model/cycle';
import { CycleService } from '../model/cycle.service';
import { GanttTimeMapService } from '../gantt/gantt-time-map.service';

@Component({
    selector: 'gc-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

    cycle: Cycle;

    constructor(
        private cycleService: CycleService,
        private ganttTimeMapService: GanttTimeMapService) { }

    ngOnInit() {
        this.cycleService.currentCycleChange.subscribe(
            (cycle: Cycle) => { this.cycle = cycle; }
        );
    }

    zoomIn() {
        this.ganttTimeMapService.zoom(1.2);
    }

    zoomOut() {
        this.ganttTimeMapService.zoom(1 / 1.2);
    }
}
