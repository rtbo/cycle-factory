import { IEvent, EventDispatcher } from '../shared/event';
import { de, mand } from '../shared/debug';

export abstract class Dock {
    constructor(private _planner: Planner) {}
    private _links: Link[]  = [];

    get planner(): Planner {
        return this._planner;
    }

    get links(): Link[] {
        return this._links;
    }

    pushLink(link: Link): void {
        this._links.push(link);
    }

    abstract get type(): string;

    abstract getEarlyTime(cp: CyclePlan, instance: number): number;
    abstract getLateTime(cp: CyclePlan, instance: number): number;
}

export abstract class InDock extends Dock {
}

export abstract class OutDock extends Dock {
}

export class Link {
    private _from: OutDock;
    private _to: InDock;
    private _lag: number;
    private _lagEvent = new EventDispatcher<number>();
    public visual: any;

    get from(): OutDock {
        return this._from;
    }
    get to(): InDock {
        return this._to;
    }
    get lag(): number {
        return this._lag;
    }
    set lag(value: number) {
        this._lag = value;
        this._lagEvent.dispatch(value);
    }

    get lagEvent(): IEvent<number> {
        return this._lagEvent;
    }

    static createLink(from: OutDock, to: InDock, lag: number=0): Link {
        const l = new Link;
        l._from = from;
        l._to = to;
        l._lag = lag;

        from.pushLink(l);
        to.pushLink(l);

        return l;
    }
}


export abstract class Task implements Planner {
    private _ind: number;
    private _name: string;
    private _startIn    = new TaskStartInDock(this);
    private _startOut   = new TaskStartOutDock(this);
    private _finishOut  = new TaskFinishOutDock(this);

    private _nameEvent = new EventDispatcher<string>();
    protected _durationEvent = new EventDispatcher<number>();

    public visual: any;

    constructor(name: string = '') {
        this._name = name;
    }

    get ind(): number {
        return this._ind;
    }
    set ind(value: number) {
        this._ind = value;
    }

    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
        this._nameEvent.dispatch(value);
    }

    get nameEvent(): IEvent<string> {
        return this._nameEvent;
    }

    abstract get duration(): number;

    get durationEvent(): IEvent<number> {
        return this._durationEvent;
    }


    get startIn(): InDock {
        return this._startIn;
    }
    get startOut(): OutDock {
        return this._startOut;
    }
    get finishOut(): OutDock {
        return this._finishOut;
    }

    abstract forwardPlan(ctx: PlanContext, dock: InDock, time: number, instance: number): number;
    abstract backwardPlan(ctx: PlanContext, dock: OutDock, time: number, instance: number): number;
}

export class AtomTask extends Task {

    private _duration: number;

    constructor(name: string, duration: number) {
        super(name);
        this._duration = duration;
    }

    get duration(): number {
        return this._duration;
    }
    set duration(value: number) {
        this._duration = value;
        this._durationEvent.dispatch(value);
    }

    forwardPlan(ctx: PlanContext, dock: InDock, time: number, instance: number): number {
        const tp: TaskPlan = ctx.lookUp(this, instance);

        tp.earlyStart = Math.max(time, tp.earlyStart);
        tp.earlyFinish = tp.earlyStart + this.duration;

        let res = tp.earlyFinish;

        for (const l of this.startOut.links) {
            res = Math.max(res, l.to.planner.forwardPlan(ctx, l.to, tp.earlyStart+l.lag, instance));
        }
        for (const l of this.finishOut.links) {
            res = Math.max(res, l.to.planner.forwardPlan(ctx, l.to, tp.earlyFinish+l.lag, instance));
        }

        return res;
    }
    backwardPlan(ctx: PlanContext, dock: OutDock, time: number, instance: number): number {
        // tslint:disable-next-line:no-unused-expression
        de && mand(dock === this.startOut || dock === this.finishOut);

        const tp: TaskPlan = ctx.lookUp(this, instance);

        if (dock === this.finishOut) {
            tp.lateFinish = Math.min(time, tp.lateFinish);
            tp.lateStart = tp.lateFinish - this.duration;
        }
        else {
            tp.lateStart = Math.min(time, tp.lateStart);
            tp.lateFinish = tp.lateStart + this.duration;
        }

        let res = tp.lateStart;

        for (const l of this.startIn.links) {
            res = Math.min(res, l.from.planner.backwardPlan(ctx, l.from, tp.lateStart-l.lag, instance));
        }

        return res;
    }
}


export class Cycle implements Planner {
    private _name: string;
    private _start          = new CycleStartOutDock(this);
    private _finish         = new CycleFinishInDock(this);
    private _tasks: Task[]  = [];
    private _links: Link[]  = [];

    private _taskSubscriptions: any[] = [];
    private _linkSubscriptions: any[] = [];

    private _taskAddEvent = new EventDispatcher<Task>();
    private _linkAddEvent = new EventDispatcher<Link>();
    private _planDirtyEvent = new EventDispatcher<void>();

    public visual: any;

    constructor(name: string='') {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get tasks(): Task[] {
        return this._tasks;
    }

    get links(): Link[] {
        return this._links;
    }

    get start(): OutDock {
        return this._start;
    }

    get finish(): InDock {
        return this._finish;
    }

    get startingTasks(): Task[] {
        return this._tasks.filter(t => {
            return t.startIn.links.length === 0;
        });
    }

    get finishingTasks(): Task[] {
        return this._tasks.filter(t => {
            return t.startOut.links.length === 0 && t.finishOut.links.length === 0;
        });
    }

    pushTask(task: Task): void {
        // tslint:disable-next-line:no-unused-expression
        de && mand(this._tasks.indexOf(task) === -1);
        task.ind = this._tasks.length;
        this._tasks.push(task);
        this._taskSubscriptions.push(
            task.durationEvent.subscribe((d: number) => {
                this._planDirtyEvent.dispatch();
            }
        ));
        this._taskAddEvent.dispatch(task);
        this._planDirtyEvent.dispatch();
    }

    pushLink(link: Link): void {
        // tslint:disable-next-line:no-unused-expression
        de && mand(this._links.indexOf(link) === -1);
        this._links.push(link);
        this._linkAddEvent.dispatch(link);
        this._planDirtyEvent.dispatch();
        this._linkSubscriptions.push(
            link.lagEvent.subscribe((l: number) => {
                this._planDirtyEvent.dispatch();
            }
        ));
    }

    plan(count: number): CyclePlan {
        this.tasks.forEach((t, i) => {
            t.ind = i;
        });
        return planCycle(this, count);
    }

    forwardPlan(ctx: PlanContext, dock: InDock, time: number, instance: number): number {
        ctx.cycleEnd = Math.max(time, ctx.cycleEnd);
        return ctx.cycleEnd;
    }
    backwardPlan(ctx: PlanContext, dock: OutDock, time: number, instance: number): number {
        return time;
    }

    get taskAddEvent(): IEvent<Task> {
        return this._taskAddEvent;
    }
    get linkAddEvent(): IEvent<Link> {
        return this._linkAddEvent;
    }
    get planDirtyEvent(): IEvent<void> {
        return this._planDirtyEvent;
    }
}

// plan API

export class TaskPlan {
    private _task: Task;
    public earlyStart: number     = 0;
    public earlyFinish: number    = 0;
    public lateStart: number      = 0;
    public lateFinish: number     = 0;

    public visual: any;

    constructor(task: Task) {
        this._task = task;
    }

    get task(): Task {
        return this._task;
    }

    get isCriticalPath(): boolean {
        return this.earlyStart === this.lateStart;
    }

    get slack(): number {
        return this.lateStart - this.earlyStart;
    }
}

export class CyclePlan {

    public visual: any;

    constructor(private _cycle: Cycle,
                private _tasks: TaskPlan[],
                private _cycleTime: number,
                private _count: number) {
        // tslint:disable-next-line:no-unused-expression
        de && mand(_tasks.length >= 1);
    }

    get cycle(): Cycle {
        return this._cycle;
    }

    get cycleTime(): number {
        return this._cycleTime;
    }

    get count(): number {
        return this._count;
    }

    lookUpTask(task: Task, instance: number): TaskPlan {
        return this._tasks[instance * this.cycle.tasks.length + task.ind];
    }

    get planUntil(): number {
        return this._tasks.slice(1).reduce((prev: number, t: TaskPlan) => {
            return Math.max(prev, t.lateFinish);
        }, this._tasks[0].lateFinish);
    }

    get dbgString(): string {
        let s = '';
        for (const tp of this._tasks) {
            s = s + tp.task.name+' from '+tp.earlyStart+' to '+tp.earlyFinish+'\n';
            s = s + Array(tp.task.name.length+1).join(' ')+' from '+tp.lateStart+' to '+tp.lateFinish+'\n';
        }
        return s;
    }
}

interface Planner {
    forwardPlan(ctx: PlanContext, dock: InDock, time: number, instance: number): number;
    backwardPlan(ctx: PlanContext, dock: OutDock, time: number, instance: number): number;
}

class PlanContext {
    cycleEnd: number;

    constructor(private taskPlans: TaskPlan[], private taskCount: number) {
    }

    lookUp(task: Task, instance: number): TaskPlan {
        return this.taskPlans[task.ind + instance*this.taskCount];
    }
}

class TaskStartInDock extends InDock {
    constructor(task: Task) {
        super(task);
    }

    get type(): string {
        return 'task';
    }

    getEarlyTime(cp: CyclePlan, instance: number): number {
        const tp = cp.lookUpTask(this.planner as Task, instance);
        return tp.earlyStart;
    }
    getLateTime(cp: CyclePlan, instance: number): number {
        const tp = cp.lookUpTask(this.planner as Task, instance);
        return tp.lateStart;
    }
}

class TaskStartOutDock extends OutDock {
    constructor(task: Task) {
        super(task);
    }

    get type(): string {
        return 'task';
    }

    getEarlyTime(cp: CyclePlan, instance: number): number {
        const tp = cp.lookUpTask(this.planner as Task, instance);
        return tp.earlyStart;
    }
    getLateTime(cp: CyclePlan, instance: number): number {
        const tp = cp.lookUpTask(this.planner as Task, instance);
        return tp.lateStart;
    }
}

class TaskFinishOutDock extends OutDock {
    constructor(task: Task) {
        super(task);
    }

    get type(): string {
        return 'task';
    }

    getEarlyTime(cp: CyclePlan, instance: number): number {
        const tp = cp.lookUpTask(this.planner as Task, instance);
        return tp.earlyFinish;
    }
    getLateTime(cp: CyclePlan, instance: number): number {
        const tp = cp.lookUpTask(this.planner as Task, instance);
        return tp.lateFinish;
    }
}

class CycleStartOutDock extends OutDock {
    constructor(cycle: Cycle) {
        super(cycle);
    }

    get type(): string {
        return 'cycle';
    }

    getEarlyTime(cp: CyclePlan, instance: number): number {
        return instance * cp.cycleTime;
    }
    getLateTime(cp: CyclePlan, instance: number): number {
        return instance * cp.cycleTime;
    }
}

class CycleFinishInDock extends InDock {
    constructor(cycle: Cycle) {
        super(cycle);
    }

    get type(): string {
        return 'cycle';
    }

    getEarlyTime(cp: CyclePlan, instance: number): number {
        return (instance+1) * cp.cycleTime;
    }
    getLateTime(cp: CyclePlan, instance: number): number {
        return (instance+1) * cp.cycleTime;
    }
}

function planCycle(cycle: Cycle, count: number): CyclePlan {
    let tasks: TaskPlan[] = [];
    for (let i=0; i<count; ++i) {
        tasks = tasks.concat(cycle.tasks.map(t => {
            return new TaskPlan(t);
        }));
    }

    const ctx = new PlanContext(tasks, cycle.tasks.length);

    let time = 0;
    let cycleTime: number;
    let lastCE = 0;
    for (let i=0; i<count; ++i) {
        ctx.cycleEnd = -1;
        for (const t of cycle.startingTasks) {
            time = Math.max(time, t.forwardPlan(ctx, t.startIn, lastCE, i));
        }
        for (const l of cycle.start.links) {
            time = Math.max(time, l.to.planner.forwardPlan(ctx, l.to, lastCE+l.lag, i));
        }

        const ce = ctx.cycleEnd === -1 ? time : ctx.cycleEnd;
        const ct = ce - lastCE;
        lastCE = ce;

        if (i === 0) {
            cycleTime = ct;
        }
        else {
            // tslint:disable-next-line:no-unused-expression
            de && mand (ct === cycleTime);
        }

        // initialize tasks for backward plan
        tasks.slice(i*cycle.tasks.length, (i+1)*cycle.tasks.length).forEach(t => {
            t.lateStart = Math.max(ct * i, t.earlyStart);
            t.lateFinish = Math.max(ct * i, t.earlyFinish);
        });

        for (const t of cycle.finishingTasks) {
            const tp = ctx.lookUp(t, i);
            const lf = Math.max(ct * i, tp.earlyStart + cycleTime);
            tp.lateFinish = lf;
            time = Math.min(time, t.backwardPlan(ctx, t.finishOut, lf, i));
        }
        for (const l of cycle.finish.links) {
            time = Math.min(time, l.from.planner.backwardPlan(ctx, l.from, ce-l.lag, i));
        }
    }

    return new CyclePlan(cycle, tasks, cycleTime, count);
}
