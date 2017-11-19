import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { Task, AtomTask, Cycle, Link, CyclePlan, planCycle } from './cycle';
import { CycleVisual, TaskVisual, LinkVisual } from './visuals';

@Injectable()
export class CycleService {

    private _currentCycle: BehaviorSubject<Cycle>;
    private _currentPlan: BehaviorSubject<CyclePlan>;
    private _subscriptions = [];

    constructor() {
        const cycle = this.makeTestCycle();
        attachVisuals(cycle);
        this._currentCycle = new BehaviorSubject( cycle );
        this._currentPlan = new BehaviorSubject( planCycle(cycle, 1) );
        this.subscribeToCycle(cycle);
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

    get currentPlan(): CyclePlan {
        return this._currentPlan.value;
    }

    get currentPlanChange(): Observable<CyclePlan> {
        return this._currentPlan.asObservable();
    }

    makeTestCycle(): Cycle {
        const cycle = new Cycle;
        cycle.name = 'Test cycle';

        const t1 = new AtomTask('Task 1', 4);
        const t2 = new AtomTask('Task 2', 5);
        const t3 = new AtomTask('Task 3', 2);
        const t4 = new AtomTask('Task 4', 3);

        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);
        cycle.pushTask(t4);

        cycle.pushLink(Link.createLink(cycle.start, t1.startIn));
        cycle.pushLink(Link.createLink(t1.finishOut, t2.startIn));
        cycle.pushLink(Link.createLink(t2.finishOut, t4.startIn));
        cycle.pushLink(Link.createLink(t1.finishOut, t3.startIn, -2));
        cycle.pushLink(Link.createLink(t3.finishOut, t4.startIn));
        cycle.pushLink(Link.createLink(t4.finishOut, cycle.finish));

        return cycle;
    }

    private subscribeToCycle(cycle: Cycle) {
        this._subscriptions = [
            cycle.planDirtyEvent.subscribe(() => {
                const plan = planCycle(cycle, 1);
                this._currentPlan.next(plan);
            }),
            cycle.taskAddEvent.subscribe(attachTaskVisual),
            cycle.linkAddEvent.subscribe(attachLinkVisual),
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
    cycle.visual = new CycleVisual;
    cycle.tasks.forEach(attachTaskVisual);
    cycle.links.forEach(attachLinkVisual);
}

function attachTaskVisual(task: Task): void {
    task.visual = new TaskVisual;
    task.visual.ind = task.ind;
}

function attachLinkVisual(link: Link): void {
    link.visual = new LinkVisual;
}
