
export type Handler<Args> = (args?: Args) => void;

export interface IEvent<Args> {
    subscribe(handler: Handler<Args>): ISubscription;
    unsubscribe(handler: Handler<Args>): void;
}

export class EventDispatcher<Args> implements IEvent<Args> {

    private _handlers = new Array<Handler<Args>>();

    subscribe(handler: Handler<Args>): ISubscription {
        this._handlers.push(handler);
        return new Subscription(this, handler);
    }
    unsubscribe(handler: Handler<Args>): void {
        const ind = this._handlers.indexOf(handler);
        if (ind > -1) {
            this._handlers.splice(ind, 1);
        }
    }
    dispatch(args?: Args): void {
        for (let handler of this._handlers) {
            handler(args);
        }
    }
}

export interface ISubscription {
    unsubscribe(): void;
}

class Subscription<Args> implements ISubscription {
    constructor(private event: IEvent<Args>, private handler: Handler<Args>) {}
    unsubscribe(): void {
        this.event.unsubscribe(this.handler);
        this.event = undefined;
        this.handler = undefined;
    }
}
