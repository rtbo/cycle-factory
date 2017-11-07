import { AfterViewInit, OnChanges, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CycleService } from '../services/cycle.service';
import { Cycle } from '../cycle';
import { de, bug_cond, mand } from '../debug';

import { GanttHeightMapService, TaskRow, HeightMap } from '../gantt/gantt-height-map.service';


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

        const tableRect = this.tableRef.nativeElement.getBoundingClientRect();
        const tableTop = tableRect.top;
        const tableHeight = tableRect.height;

        const headRect = headTr.getBoundingClientRect();
        const headHeight = headRect.height;
        de && bug_cond(headRect.top !== tableRect.top,
                       "header start is not zero: %s vs %s",
                       headRect.top, tableRect.top);

        const taskRows: TaskRow[] = new Array(bodyTrs.length);
        for(let i=0; i<bodyTrs.length; ++i) {
            let rect = bodyTrs[i].getBoundingClientRect();
            taskRows[i] = {
                top: rect.top - tableTop,
                height: rect.height,
            };
        }

        const newHm: HeightMap = {
            totalHeight: tableHeight,
            headHeight: headHeight,
            taskRows: taskRows
        };

        this.ganttHeightMapService.updateMap(newHm);
    }
}
