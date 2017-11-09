import {
    AfterViewChecked, Component, ElementRef, OnInit, HostListener, ViewChild
} from '@angular/core';

import { GanttTimeMapService } from '../gantt-time-map.service';
import { GanttHeightMapService, VBounds, GanttHeightMap } from '../gantt-height-map.service';
import { PaintInfo, paintBackground, paintRuler, paintTask } from '../painting';

import { Cycle } from '../../model/cycle';
import { CycleService } from '../../model/cycle.service';

@Component({
    selector: 'gc-gantt-canvas',
    templateUrl: './gantt-canvas.component.html',
    styleUrls: ['./gantt-canvas.component.css']
})
export class GanttCanvasComponent implements AfterViewChecked, OnInit {

    constructor(
        private cycleService: CycleService,
        private ganttTimeMapService: GanttTimeMapService,
        private ganttHeightMapService: GanttHeightMapService,
    ) { }

    cycle: Cycle;
    private _canvasWidth: number;
    private _canvasHeight: number
    private _canvasTop: number;

    @ViewChild("ganttDiv")
    divRef: ElementRef;
    @ViewChild("ganttCanvas")
    canvasRef: ElementRef;

    ngOnInit() {
        this.cycleService.currentCycleObservable.subscribe(
            (cycle: Cycle) => { this.cycle = cycle; }
        );
        this.checkCanvasSize();
        this.paintCanvas();
        this.ganttHeightMapService.heightMapChange.subscribe(
            (hm: GanttHeightMap) => {
                if (this.checkCanvasSize()) {
                    this.paintCanvas();
                }
            }
        );
    }

    ngAfterViewChecked() {
        if (this.checkCanvasSize()) {
            this.paintCanvas();
        }
    }

    checkCanvasSize(): boolean {
        const divRect = this.divRef.nativeElement.getBoundingClientRect();
        const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
        const width = divRect.width;
        const height = this.ganttHeightMapService.heightMap.table.height;
        const top = canvasRect.top;
        let res = false;

        if (width != this._canvasWidth) {
            this._canvasWidth = width;
            this.canvasRef.nativeElement.style.width = ""+width+"px";
            this.canvasRef.nativeElement.width = width;
            this.ganttTimeMapService.updateCanvasWidth(width);
            res = true;
        }
        if (height != this._canvasHeight) {
            this._canvasHeight = height;
            this.canvasRef.nativeElement.style.height = ""+height+"px";
            this.canvasRef.nativeElement.height = height;
            res = true;
        }
        if (top != this._canvasTop) {
            this._canvasTop = top;
            this.ganttHeightMapService.updateCanvasTop(top);
            res = true;
        }
        return res;
    }

    @HostListener("window:resize", ["$event"])
    onResize(event) {
        if (this.checkCanvasSize()) {
            this.paintCanvas();
        }
    }

    paintCanvas(): void {
        const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');

        const pi: PaintInfo = {
            canvasWidth: this._canvasWidth,
            canvasHeight: this._canvasHeight,
            heightMap: this.ganttHeightMapService.heightMap,
            timeMap: this.ganttTimeMapService.timeMap,
            timeGrads: this.ganttTimeMapService.grads,
        };

        paintBackground(ctx, pi);
        paintRuler(ctx, pi);
        for (let i=0; i<this.cycle.tasks.length; ++i) {
            paintTask(ctx, pi, i, this.cycle.tasks[i]);
        }
    }
}
