import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export class Row {
    top: number; // relative to view port
    height: number;
}

export class HeightMap {
    total: Row;
    head: Row;
    tasks: Row[];
}

@Injectable()
export class GanttHeightMapService {

    constructor() {
        this._heightMap = new BehaviorSubject<HeightMap>(
            {total:{top:0, height:0}, head:{top: 0, height: 0}, tasks:[]}
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
