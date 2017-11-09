import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export class VBounds {
    constructor(top: number, height: number) {
        this.top = top;
        this.height = height;
    }

    top: number;
    height: number;
    get bottom(): number {
        return this.top + this.height;
    }
}

export class TableVBounds {
    table: VBounds;
    head: VBounds;
    taskRows: VBounds[];
}

export class GanttHeightMap {
    table: VBounds;
    head: VBounds;
    taskRows: VBounds[];

    constructor(canvasTop: number, tableBounds: TableVBounds) {
        this.table = offsetCanvasTop(tableBounds.table, canvasTop);
        this.head = offsetCanvasTop(tableBounds.head, canvasTop);
        this.taskRows = new Array(tableBounds.taskRows.length);
        for (let i=0; i<tableBounds.taskRows.length; ++i) {
            this.taskRows[i] = offsetCanvasTop(tableBounds.taskRows[i], canvasTop);
        }
    }
}

function offsetCanvasTop(row: VBounds, canvasTop: number): VBounds {
    return new VBounds( row.top - canvasTop, row.height);
}

@Injectable()
export class GanttHeightMapService {

    constructor() {
        const defRow = new VBounds(0, 0);
        const defTable: TableVBounds = {
            table: defRow, head: defRow, taskRows: []
        };
        this._heightMapSubject = new BehaviorSubject(
            new GanttHeightMap(0, defTable)
        );
        this._tableHeights = defTable;
        this._canvasTop = 0;
    }

    private _heightMapSubject: BehaviorSubject<GanttHeightMap>;
    private _tableHeights: TableVBounds;
    private _canvasTop: number;

    get heightMap(): GanttHeightMap {
        return this._heightMapSubject.value;
    }

    get heightMapChange(): Observable<GanttHeightMap> {
        return this._heightMapSubject.asObservable();
    }

    updateTableBounds(tableHeights: TableVBounds) {
        if (JSON.stringify(tableHeights) === JSON.stringify(this._tableHeights)) {
            return;
        }
        this._tableHeights = tableHeights;
        this._heightMapSubject.next(
            new GanttHeightMap(this._canvasTop, this._tableHeights)
        );
    }

    updateCanvasTop(canvasTop: number) {
        if (canvasTop === this._canvasTop) return;
        this._canvasTop = canvasTop;
        this._heightMapSubject.next(
            new GanttHeightMap(this._canvasTop, this._tableHeights)
        );
    }

}
