
import { de, mand } from '../shared/debug';
import { IEvent, EventDispatcher } from '../shared/event';

/**
 * The type of link.
 * Describes whether a link is attached to the start or to the end (aka finish)
 * of a task.
 */
export enum LinkType {
    FS, SS
}

export class Link {

    private _type: LinkType;
    private _lag: number = 0;
    private _from: Task;
    private _to: Task;

    private _event = new EventDispatcher<void>();

    public visual: any;

    get type(): LinkType {
        return this._type;
    }

    set type(value: LinkType) {
        this._type = value;
        this._event.dispatch();
    }

    get lag(): number {
        return this._lag;
    }

    set lag(value: number) {
        this._lag = value;
        this._event.dispatch();
    }

    get from(): Task {
        return this._from;
    }

    get to(): Task {
        return this._to;
    }

    get event(): IEvent<void> {
        return this._event;
    }

    get earlyTimeTo(): number {
        return this.to.earlyStart;
    }

    get earlyTimeFrom(): number {
        switch (this.type) {
            case LinkType.FS:
                return this.from.earlyFinish;
            case LinkType.SS:
                return this.from.earlyStart;
        }
    }

    get lateTimeTo(): number {
        return this.to.lateStart;
    }

    get lateTimeFrom(): number {
        switch (this.type) {
            case LinkType.FS:
                return this.from.lateFinish;
            case LinkType.SS:
                return this.from.lateStart;
        }
    }

    get earlyTimeToPlan(): number {
        switch (this.type) {
            case LinkType.FS:
                return this.from.earlyFinish + this.lag;
            case LinkType.SS:
                return this.from.earlyStart + this.lag;
        }
    }

    get lateTimeToPlan(): number {
        switch (this.type) {
            case LinkType.FS:
                return this.from.lateFinish + this.lag;
            case LinkType.SS:
                return this.from.lateStart + this.lag;
        }
    }

    get earlyTimeFromPlan(): number {
        return this.to.earlyStart - this.lag;
    }

    get lateTimeFromPlan(): number {
        return this.to.lateStart - this.lag;
    }


    static createLink(from: Task, to: Task, type = LinkType.FS, lag = 0): Link {
        // tslint:disable-next-line:no-unused-expression
        de && mand(from && from.cycle && to && to.cycle && from.cycle === to.cycle);

        const l = new Link;
        l._from = from;
        l._to = to;
        l._type = type;
        l._lag = lag;

        from.linksOut.push(l);
        to.linksIn.push(l);

        from.cycle.pushLink(l);

        return l;
    }

}


export class Task {

    private _cycle: Cycle;
    private _name: string;
    private _duration: number       = 0;

    private _linksIn: Link[]        = [];
    private _linksOut: Link[]       = [];

    private _earlyStart: number     = 0;
    private _earlyFinish: number    = 0;
    private _lateStart: number      = 0;
    private _lateFinish: number     = 0;

    private _durationEvent = new EventDispatcher<number>();

    public visual: any;

    constructor(cycle: Cycle, name: string = '') {
        this._cycle = cycle;
        this._name = name;
    }


    get cycle(): Cycle {
        return this._cycle;
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
        this._durationEvent.dispatch(value);
    }

    get durationEvent(): IEvent<number> {
        return this._durationEvent;
    }


    get earlyStart(): number {
        return this._earlyStart;
    }

    get earlyFinish(): number {
        return this._earlyFinish;
    }

    get lateStart(): number {
        return this._lateStart;
    }

    get lateFinish(): number {
        return this._lateFinish;
    }

    get isCriticalPath(): boolean {
        return this._earlyStart === this._lateStart;
    }

    get slack(): number {
        return this._lateStart - this._earlyStart;
    }

    get linksIn(): Link[] {
        return this._linksIn;
    }

    get linksOut(): Link[] {
        return this._linksOut;
    }

    prepareForward(time: number): void {
        this._earlyStart = time;
        this._earlyFinish = time;
    }

    forwardPlan(linkIn: Link): number {
        if (linkIn) {
            this._earlyStart = Math.max(this._earlyStart, linkIn.earlyTimeToPlan);
        }
        this._earlyFinish = this._earlyStart + this._duration;

        let maxTime = this._earlyFinish;
        for (const l of this._linksOut) {
            maxTime = Math.max(maxTime, l.to.forwardPlan(l));
        }
        return maxTime;
    }

    prepareBackward(time: number): void {
        this._lateStart = time;
        this._lateFinish = time;
    }

    backwardPlan(linkOut: Link): number {
        if (linkOut) {
            this._lateFinish = Math.min(this._lateFinish, linkOut.lateTimeFromPlan);
        }
        this._lateStart = this._lateFinish - this._duration;

        let minTime = this._lateStart;
        for (const l of this._linksIn) {
            minTime = Math.min(minTime, l.from.backwardPlan(l));
        }
        return minTime;
    }
}


export class Cycle {

    private _name: string;
    private _cycleTime: number          = 0;
    private _tasks: Task[]              = [];
    private _taskSubscriptions: any[]   = [];
    private _links: Link[]              = [];
    private _linkSubscriptions: any[]   = [];
    private _planInhibit: boolean       = false;

    private _planEvent                  = new EventDispatcher<void>();
    private _taskPushEvent              = new EventDispatcher<[number, Task]>();


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }


    get tasks(): Task[] { return this._tasks; }

    get links(): Link[] { return this._links; }

    get cycleTime(): number {
        return this._cycleTime;
    }


    get startingTasks(): Task[] {
        return this.tasks.filter(t => t.linksIn.length === 0);
    }

    get finishingTasks(): Task[] {
        return this.tasks.filter(t => t.linksOut.length === 0);
    }

    pushTask(task: Task) {
        // tslint:disable-next-line:no-unused-expression
        de && mand(task.cycle === this);
        const ind = this._tasks.length;
        this._tasks.push(task);
        const subscription = task.durationEvent.subscribe((number) => {
            this.plan();
        });
        this._taskSubscriptions.push(subscription);
        this._taskPushEvent.dispatch([ind, task]);
    }

    pushLink(link: Link) {
        // tslint:disable-next-line:no-unused-expression
        de && mand(link.from !== undefined && link.to !== undefined);
        this._links.push(link);
        this.plan();
        const subscription = link.event.subscribe(() => {
            this.plan();
        });
        this._linkSubscriptions.push(subscription);
    }

    get planInhibit(): boolean {
        return this._planInhibit;
    }

    set planInhibit(value: boolean) {
        this._planInhibit = value;
    }

    plan(): void {
        if (this._planInhibit) return;

        for (const t of this.tasks) {
            t.prepareForward(0);
        }
        let ct = 0;
        for (const t of this.startingTasks) {
            ct = Math.max(ct, t.forwardPlan(null));
        }
        this._cycleTime = ct;
        for (const t of this.tasks) {
            t.prepareBackward(ct);
        }
        let start = ct;
        for (const t of this.finishingTasks) {
            start = Math.min(start, t.backwardPlan(null));
        }
        // tslint:disable-next-line:no-unused-expression
        de && mand(start === 0);
        this._planEvent.dispatch();
    }

    get planEvent(): IEvent<void> {
        return this._planEvent;
    }
    get taskPushEvent(): IEvent<[number, Task]> {
        return this._taskPushEvent;
    }
}
