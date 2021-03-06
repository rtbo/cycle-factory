import {
    AfterViewInit, OnChanges, Component, ElementRef, OnInit, HostListener, ViewChild
} from '@angular/core';
import { Task, AtomTask, CyclePlan, TaskPlan } from '../model/cycle';
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

    @ViewChild('addByName') addByName: ElementRef;
    @ViewChild('contentEditable') contentEditable;
    @ViewChild('tasktable') tableRef: ElementRef;

    plan: CyclePlan;
    private cycleSubscriptions = [];
    readonly addByNamePhrase = 'Type in here...';

    get planTasks(): TaskPlan[] {
        return this.plan.cycle.tasks.map((t) => this.plan.lookUpTask(t, 0));
    }

    ngOnInit() {
        this.cycleService.currentPlanChange.subscribe(
            (plan: CyclePlan) => {
                for (const s of this.cycleSubscriptions) {
                    s.unsubscribe();
                }
                this.plan = plan;
                this.cycleSubscriptions = [
                ];
            }
        );
    }

    ngAfterViewInit() {
        this.checkChangeHeight();
    }

    ngOnChanges(changes) {
        this.checkChangeHeight();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkChangeHeight();
    }

    onNameEnter(event): void {
        if (!this.plan || !this.plan.cycle) return;
        const t = new AtomTask(event, 1);
        this.plan.cycle.pushTask(t);
        this.contentEditable.resetModel(this.addByNamePhrase);
    }

    onAddByNameFocus(): void {
        this.addByName.nativeElement.textContent = '';
    }

    checkChangeHeight() {
        const hm = this.ganttHeightMapService.heightMap;
        const thead: Element = this.tableRef.nativeElement.getElementsByTagName('thead')[0];
        const tbody: Element = this.tableRef.nativeElement.getElementsByTagName('tbody')[0];

        const headTr = thead.getElementsByTagName('tr')[0];
        const bodyTrs = tbody.getElementsByTagName('tr');

        const tableRect = this.tableRef.nativeElement.getBoundingClientRect();
        const tableBounds = new VBounds(
            tableRect.top, tableRect.height
        );

        const headRect = headTr.getBoundingClientRect();
        const headBounds = new VBounds(
            headRect.top, headRect.height
        );

        const taskBounds: VBounds[] = new Array(bodyTrs.length);
        for (let i=0; i<bodyTrs.length; ++i) {
            const rect = bodyTrs[i].getBoundingClientRect();
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
