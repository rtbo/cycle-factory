import { Component, OnInit } from '@angular/core';
import {
    Task, Cycle, Link, LinkType
} from '../cycle';

@Component({
    selector: 'task-table',
    templateUrl: './task-table.component.html',
    styleUrls: ['./task-table.component.css']
})
export class TaskTableComponent implements OnInit {

    constructor() { }

    cycle: Cycle;

    ngOnInit() {
        this.cycle = new Cycle;
        this.cycle.name = "Test cycle";
        let t1 = new Task(this.cycle, "Task 1");
        let t2 = new Task(this.cycle, "Task 2");
        let t3 = new Task(this.cycle, "Task 3");
        let t4 = new Task(this.cycle, "Task 4");
        t1.duration = 4;
        t2.duration = 5;
        t3.duration = 2;
        t4.duration = 3;

        Link.createLink(t1, t2);
        Link.createLink(t2, t4);
        Link.createLink(t1, t3, LinkType.FS, 2);
        Link.createLink(t3, t4);

        this.cycle.pushTask(t1);
        this.cycle.pushTask(t2);
        this.cycle.pushTask(t3);
        this.cycle.pushTask(t4);
        this.cycle.plan();
    }

}
