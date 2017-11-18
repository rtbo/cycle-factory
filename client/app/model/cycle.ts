import { IEvent, EventDispatcher } from '../shared/event';
import { de, mand } from '../shared/debug';

export class InDock {

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

}

export class OutDock {

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
    private _startIn    = new InDock(this);
    private _startOut   = new OutDock(this);
    private _finishOut  = new OutDock(this);

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

    abstract forwardPlan(ctx: PlanContext, time: number): number;
    abstract backwardPlan(ctx: PlanContext, time: number): number;
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

    forwardPlan(ctx: PlanContext, time: number): number {
        const tp: TaskPlan = ctx.lookUp(this);

        tp.earlyStart = Math.max(time, tp.earlyStart);
        tp.earlyFinish = tp.earlyStart + this.duration;

        let res = tp.earlyFinish;

        for (const l of this.startOut.links) {
            res = Math.max(res, l.to.planner.forwardPlan(ctx, tp.earlyStart+l.lag));
        }
        for (const l of this.finishOut.links) {
            res = Math.max(res, l.to.planner.forwardPlan(ctx, tp.earlyFinish+l.lag));
        }

        return res;
    }
    backwardPlan(ctx: PlanContext, time: number): number {
        const tp: TaskPlan = ctx.lookUp(this);

        tp.lateFinish = Math.min(time, tp.lateFinish);
        tp.lateStart = tp.lateFinish - this.duration;

        let res = tp.lateStart;

        for (const l of this.startIn.links) {
            res = Math.min(res, l.from.planner.backwardPlan(ctx, tp.lateStart-l.lag));
        }

        return res;
    }
}


export class Cycle implements Planner {
    private _name: string;
    private _start          = new OutDock(this);
    private _finish         = new InDock(this);
    private _tasks: Task[]  = [];
    private _links: Link[]  = [];

    private _taskSubscriptions: any[] = [];
    private _linkSubscriptions: any[] = [];

    private _taskAddEvent = new EventDispatcher<Task>();
    private _linkAddEvent = new EventDispatcher<Link>();
    private _planDirtyEvent = new EventDispatcher<void>();

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
            return t.startOut.links.length === 0 && t.finishOut.links.length === 0;
        });
    }

    get finishingTasks(): Task[] {
        return this._tasks.filter(t => {
            return t.startIn.links.length === 0;
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

    forwardPlan(ctx: PlanContext, time: number): number {
        return time;
    }
    backwardPlan(ctx: PlanContext, time: number): number {
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

export function planCycle(cycle: Cycle, count: number): CyclePlan {
    const cp = new CyclePlan(cycle);
    cp.plan(count);
    return cp;
}

export class TaskPlan {
    private _task: Task;
    earlyStart: number     = 0;
    earlyFinish: number    = 0;
    lateStart: number      = 0;
    lateFinish: number     = 0;

    visual: any;

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
    private _cycle: Cycle;
    private _tasks: TaskPlan[] = [];
    private _cycleTime: number;
    private _count: number;

    constructor(cycle: Cycle) {
        this._cycle = cycle;
    }

    get cycle(): Cycle {
        return this._cycle;
    }

    get tasks(): TaskPlan[] {
        return this._tasks;
    }

    get cycleTime(): number {
        return this._cycleTime;
    }

    get count(): number {
        return this._count;
    }

    plan(count: number): void {
        const cycle = this._cycle;
        let tasks: TaskPlan[] = [];
        cycle.tasks.forEach((t, i) => {
            t.ind = i;
        });
        tasks = cycle.tasks.map(t => {
            return new TaskPlan(t);
        });

        const ctx = new PlanContext(tasks);

        let time = 0;
        for (const t of cycle.startingTasks) {
            time = Math.max(time, t.forwardPlan(ctx, 0));
        }
        for (const l of cycle.start.links) {
            time = Math.max(time, l.to.planner.forwardPlan(ctx, l.lag));
        }

        const cycleTime = time;
        tasks.forEach(t => {
            t.lateFinish = cycleTime;
        });

        for (const t of cycle.finishingTasks) {
            time = Math.min(time, t.backwardPlan(ctx, cycleTime));
        }
        for (const l of cycle.finish.links) {
            time = Math.min(time, l.from.planner.backwardPlan(ctx, cycleTime-l.lag));
        }

        this._tasks = tasks;
        this._count = count;
        this._cycleTime = cycleTime;
    }

}

interface Planner {
    forwardPlan(ctx: PlanContext, time: number): number;
    backwardPlan(ctx: PlanContext, time: number): number;
}

class PlanContext {
    constructor(private taskPlans: TaskPlan[]) {
    }

    lookUp(task: Task): TaskPlan {
        return this.taskPlans[task.ind];
    }
}
