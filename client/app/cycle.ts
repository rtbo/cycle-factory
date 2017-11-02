
import { de, mand } from 'debug';

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


    get type(): LinkType {
        return this._type;
    }

    set type(value: LinkType) {
        this._type = value;
    }

    get lag(): number {
        return this._lag;
    }

    set lag(value: number) {
        this._lag = value;
    }

    get from(): Task {
        return this._from;
    }

    get to(): Task {
        return this._to;
    }

    get earlyTimeTo(): number {
        switch (this.type) {
            case LinkType.FS:
                return this.from.earlyFinish + this.lag;
            case LinkType.SS:
                return this.from.earlyStart + this.lag;
        }
    }

    get lateTimeTo(): number {
        switch (this.type) {
            case LinkType.FS:
                return this.from.lateFinish + this.lag;
            case LinkType.SS:
                return this.from.lateStart + this.lag;
        }
    }

    get earlyTimeFrom(): number {
        return this.to.earlyStart - this.lag;
    }

    get lateTimeFrom(): number {
        return this.to.lateStart - this.lag;
    }


    static createLink(from: Task, to: Task, type = LinkType.FS, lag = 0): Link {
        let l = new Link;
        l._from = from;
        l._to = to;
        l._type = type;
        l._lag = lag;

        from.linksOut.push(l);
        to.linksIn.push(l);

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
        console.log("setting task name: ", value);
        this._name = value;
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        console.log("setting duration: ", value);
        this._duration = value;
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
            this._earlyStart = Math.max(this._earlyStart, linkIn.earlyTimeTo);
        }
        this._earlyFinish = this._earlyStart + this._duration;

        let maxTime = this._earlyFinish;
        for (let l of this._linksOut) {
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
            this._lateFinish = Math.min(this._lateFinish, linkOut.lateTimeFrom);
        }
        this._lateStart = this._lateFinish - this._duration;

        let minTime = this._lateStart;
        for (let l of this._linksIn) {
            minTime = Math.min(minTime, l.from.backwardPlan(l));
        }
        return minTime;
    }
}


export class Cycle {

    private _name: string;
    private _tasks: Task[]      = [];
    private _cycleTime: number  = 0;


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }


    get tasks(): Task[] { return this._tasks; }
    set tasks(tasks: Task[]) { this._tasks = tasks; }


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
        de && mand(task.cycle === this);
        this._tasks.push(task);
    }

    plan(): void {
        for (let t of this.tasks) {
            t.prepareForward(0);
        }
        let ct = 0;
        for (let t of this.startingTasks) {
            ct = Math.max(ct, t.forwardPlan(null));
        }
        this._cycleTime = ct;
        for (let t of this.tasks) {
            t.prepareBackward(ct);
        }
        let start = ct;
        for (let t of this.finishingTasks) {
            start = Math.min(start, t.backwardPlan(null));
        }
        de && mand(start === 0);
    }
}
