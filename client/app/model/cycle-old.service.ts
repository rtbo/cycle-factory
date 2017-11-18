import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { Task, Cycle, Link, LinkType } from './cycle-old';
import { TaskVisual, LinkVisual } from './visuals';

@Injectable()
export class CycleService {

    private _currentCycle: BehaviorSubject<Cycle>;
    private _subscriptions = [];

    constructor() {
        const cycle = this.makeTestCycle();
        this.subscribeToCycle(cycle);
        this._currentCycle = new BehaviorSubject( cycle );
    }

    get currentCycle(): Cycle {
        return this._currentCycle.value;
    }

    setCurrentCycle(cycle: Cycle) {
        if (cycle === this.currentCycle) return;
        this.unsubscribeFromCycle();
        this.subscribeToCycle(cycle);
        this._currentCycle.next(cycle);
    }

    get currentCycleChange(): Observable<Cycle> {
        return this._currentCycle.asObservable();
    }

    makeTestCycle(): Cycle {
        const cycle = new Cycle;
        cycle.name = 'Test cycle';
        cycle.planInhibit = true;

        const t1 = new Task(cycle, 'Task 1');
        const t2 = new Task(cycle, 'Task 2');
        const t3 = new Task(cycle, 'Task 3');
        const t4 = new Task(cycle, 'Task 4');
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

    private subscribeToCycle(cycle: Cycle) {
        this._subscriptions = [
            cycle.taskPushEvent.subscribe((arg: [number, Task]) => {
                attachTaskVisual(arg[0], arg[1]);
                cycle.plan();
            })
        ];
    }

    private unsubscribeFromCycle() {
        for (const s of this._subscriptions) {
            s.unsubscribe();
        }
        this._subscriptions = [];
    }

}

function attachVisuals(cycle: Cycle): void {
    for (let i=0; i<cycle.tasks.length; ++i) {
        attachTaskVisual(i, cycle.tasks[i]);
    }
    for (const l of cycle.links) {
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