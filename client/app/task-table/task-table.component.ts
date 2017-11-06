import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CycleService } from '../services/cycle.service';
import { Cycle } from '../cycle';

import { GanttHeightMapService, TaskRow } from '../gantt/gantt-height-map.service';


@Component({
    selector: 'gc-task-table',
    templateUrl: './task-table.component.html',
    styleUrls: ['./task-table.component.css']
})
export class TaskTableComponent implements OnInit, AfterViewChecked {

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

    ngAfterViewChecked() {
        const thead: Element = this.tableRef.nativeElement.getElementsByTagName("thead")[0];
        const tbody: Element = this.tableRef.nativeElement.getElementsByTagName("tbody")[0];

        const headTr = thead.getElementsByTagName("tr")[0];
        const bodyTrs = tbody.getElementsByTagName("tr");

        let tableRect = this.tableRef.nativeElement.getBoundingClientRect();
        let headRect = headTr.getBoundingClientRect();
        let offset = tableRect.top;
        console.log(tableRect);
        console.log(headTr.getBoundingClientRect());

        const headRow: TaskRow = {
            offset: headRect.top,
            height: headRect.height,
        };
        const taskRows: TaskRow[] = new Array(bodyTrs.length);
        for(let i=0; i<bodyTrs.length; ++i) {
            let rect = bodyTrs[i].getBoundingClientRect();
            console.log(rect);
            taskRows[i] = {
                offset: rect.top,
                height: rect.height,
            };
            offset += bodyTrs[i].clientHeight;
        }

        this.ganttHeightMapService.updateRows(headRow, taskRows);
    }

}
