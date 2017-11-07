import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export class TaskRow {
    top: number;
    height: number;
}

export class HeightMap {
    totalHeight: number;
    headHeight: number;
    taskRows: TaskRow[];
}

@Injectable()
export class GanttHeightMapService {

    constructor() {
        this._heightMap = new BehaviorSubject<HeightMap>(
            {
                totalHeight: 0,
                headHeight: 0,
                taskRows:[]
            }
        );
    }

    private _heightMap: BehaviorSubject<HeightMap>;

    updateMap(map: HeightMap) {
        this._heightMap.next(map);
    }

    get heightMap(): HeightMap {
        return this._heightMap.value;
    }

    get heightMapChange(): Observable<HeightMap> {
        return this._heightMap.asObservable();
    }

}
