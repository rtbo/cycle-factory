import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export class TaskRow {
    offset: number;
    height: number;
}

@Injectable()
export class GanttHeightMapService {

    constructor() {
        this._heightMap = new BehaviorSubject<[TaskRow, TaskRow[]]>(
            [{offset: 0, height: 0}, []]
        );
    }

    private _heightMap: BehaviorSubject<[TaskRow, TaskRow[]]>;

    updateRows(head: TaskRow, tasks: TaskRow[]) {
        this._heightMap.next([head, tasks]);
    }

    get heightMap(): [TaskRow, TaskRow[]] {
        return this._heightMap.value;
    }


}
