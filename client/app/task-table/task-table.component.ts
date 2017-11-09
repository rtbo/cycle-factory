import {
    AfterViewInit, OnChanges, Component, ElementRef, OnInit, HostListener, ViewChild
} from '@angular/core';
import { Cycle } from '../model/cycle';
import { CycleService } from '../model/cycle.service';

import { GanttHeightMapService, VBounds, TableVBounds } from '../gantt/gantt-height-map.service';


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

    @HostListener("window:resize", ["$event"])
    onResize(event) {
        this.checkChangeHeight();
    }

    checkChangeHeight() {
        const hm = this.ganttHeightMapService.heightMap;
        const thead: Element = this.tableRef.nativeElement.getElementsByTagName("thead")[0];
        const tbody: Element = this.tableRef.nativeElement.getElementsByTagName("tbody")[0];

        const headTr = thead.getElementsByTagName("tr")[0];
        const bodyTrs = tbody.getElementsByTagName("tr");

        const tableRect = this.tableRef.nativeElement.getBoundingClientRect();
        const tableBounds = new VBounds(
            tableRect.top, tableRect.height
        );

        const headRect = headTr.getBoundingClientRect();
        const headBounds = new VBounds(
            headRect.top, headRect.height
        );

        const taskBounds: VBounds[] = new Array(bodyTrs.length);
        for(let i=0; i<bodyTrs.length; ++i) {
            let rect = bodyTrs[i].getBoundingClientRect();
            taskBounds[i] = new VBounds(rect.top, rect.height);
        }

        const newHm: TableVBounds = {
            table: tableBounds,
            head: headBounds,
            taskRows: taskBounds,
        };

        this.ganttHeightMapService.updateTableBounds(newHm);
    }
}
