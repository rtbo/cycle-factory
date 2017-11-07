import { AfterViewInit, OnChanges, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CycleService } from '../services/cycle.service';
import { Cycle } from '../cycle';

import { GanttHeightMapService, Row, HeightMap } from '../gantt/gantt-height-map.service';


@Component({
    selector: 'gc-task-table',
    templateUrl: './task-table.component.html',
    styleUrls: ['./task-table.component.css']
})
export class TaskTableComponent implements OnInit, AfterViewInit, OnChanges {

    constructor(
        private cycleService: CycleService,
        private ganttHeightMapService: GanttHeightMapService
    ) {}

    @ViewChild("tasktable") tableRef: ElementRef;

    cycle: Cycle;

    ngOnInit() {
        this.cycleService.currentCycleObservable.subscribe(
            (cycle: Cycle) => { this.cycle = cycle; }
        );
    }

    ngAfterViewInit() {
        this.checkChangeHeight();
    }

    ngOnChanges(changes) {
        this.checkChangeHeight();
    }

    checkChangeHeight() {
        const hm = this.ganttHeightMapService.heightMap;
        const thead: Element = this.tableRef.nativeElement.getElementsByTagName("thead")[0];
        const tbody: Element = this.tableRef.nativeElement.getElementsByTagName("tbody")[0];

        const headTr = thead.getElementsByTagName("tr")[0];
        const bodyTrs = tbody.getElementsByTagName("tr");

        let tableRect = this.tableRef.nativeElement.getBoundingClientRect();
        let headRect = headTr.getBoundingClientRect();
        let offset = tableRect.top;

        const headRow: Row = {
            top: headRect.top,
            height: headRect.height,
        };
        const taskRows: Row[] = new Array(bodyTrs.length);
        for(let i=0; i<bodyTrs.length; ++i) {
            let rect = bodyTrs[i].getBoundingClientRect();
            taskRows[i] = {
                top: rect.top,
                height: rect.height,
            };
            offset += bodyTrs[i].clientHeight;
        }

        const newHm: HeightMap = {
            total: { top: tableRect.top, height: tableRect.height },
            head: headRow, tasks: taskRows
        };

        if (hm != newHm) {
            this.ganttHeightMapService.updateMap(newHm);
        }
    }
}
