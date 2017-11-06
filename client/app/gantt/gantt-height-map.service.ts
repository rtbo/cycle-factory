import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export class TaskRow {
    offset: number;
    height: number;
}

export class HeightMap {
    total: TaskRow;
    head: TaskRow;
    tasks: TaskRow[];
}

@Injectable()
export class GanttHeightMapService {

    constructor() {
        this._heightMap = new BehaviorSubject<HeightMap>(
            {total:{offset:0, height:0}, head:{offset: 0, height: 0}, tasks:[]}
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
