import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Task, Cycle, Link, LinkType } from './cycle';
import { TaskVisual, LinkVisual } from './visuals';

@Injectable()
export class CycleService {

    private _currentCycle: BehaviorSubject<Cycle>;

    constructor() {
        this._currentCycle = new BehaviorSubject(
            this.makeTestCycle()
        );
    }

    get currentCycle(): Cycle {
        return this._currentCycle.value;
    }

    setCurrentCycle(cycle: Cycle) {
        if (cycle === this.currentCycle) return;

        this._currentCycle.next(cycle);
    }

    get currentCycleChange(): Observable<Cycle> {
        return this._currentCycle.asObservable();
    }

    makeTestCycle(): Cycle {
        let cycle = new Cycle;
        cycle.name = "Test cycle";
        cycle.planInhibit = true;

        let t1 = new Task(cycle, "Task 1");
        let t2 = new Task(cycle, "Task 2");
        let t3 = new Task(cycle, "Task 3");
        let t4 = new Task(cycle, "Task 4");
        t1.duration = 4;
        t2.duration = 5;
        t3.duration = 2;
        t4.duration = 3;

        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);
        cycle.pushTask(t4);

        Link.createLink(t1, t2);
        Link.createLink(t2, t4);
        Link.createLink(t1, t3, LinkType.FS, -2);
        Link.createLink(t3, t4);

        cycle.planInhibit = false;
        cycle.plan();

        attachVisuals(cycle);
        return cycle;
    }

}

function attachVisuals(cycle: Cycle): void {
    for (let i=0; i<cycle.tasks.length; ++i) {
        attachTaskVisual(i, cycle.tasks[i]);
    }
    for (let l of cycle.links) {
        attachLinkVisual(l);
    }
}

function attachTaskVisual(ind: number, task: Task): void {
    if (!task.visual) {
        task.visual = new TaskVisual;
    }
    const v: TaskVisual = task.visual;
    v.ind = ind;
}

function attachLinkVisual(link: Link): void {
    if (!link.visual) {
        link.visual = new LinkVisual;
    }
}