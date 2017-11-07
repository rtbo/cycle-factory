import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CycleService } from '../../services/cycle.service';
import { GanttTimeMapService } from '../gantt-time-map.service';
import { GanttHeightMapService, TaskRow, HeightMap } from '../gantt-height-map.service';
import { PaintInfo, paintRuler, paintTask } from '../painting';

import { Cycle } from '../../cycle';

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

    @ViewChild("ganttCanvas")
    canvasRef: ElementRef;

    ngOnInit() {
        this.cycleService.currentCycleObservable.subscribe(
            (cycle: Cycle) => { this.cycle = cycle; }
        );
        this.checkCanvasSize();
        this.paintCanvas();
        this.ganttHeightMapService.heightMapChange.subscribe(
            (hm: HeightMap) => { if (this.checkCanvasSize()) {
                this.paintCanvas();
            }}
        );
    }

    ngAfterViewChecked() {
        if (this.checkCanvasSize()) {
            this.paintCanvas();
        }
    }

    checkCanvasSize(): boolean {
        let width = Math.round(this.canvasRef.nativeElement.clientWidth);
        let height = Math.round(this.ganttHeightMapService.heightMap.totalHeight);

        if (width != this._canvasWidth || height != this._canvasHeight) {
            this._canvasWidth = width;
            this._canvasHeight = height;
            this.canvasRef.nativeElement.style.width = ""+width+"px";
            this.canvasRef.nativeElement.style.height = ""+height+"px";
            this.canvasRef.nativeElement.width = width;
            this.canvasRef.nativeElement.height = height;
            this.ganttTimeMapService.updateCanvasWidth(width);
            return true;
        }
        return false;
    }

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

        paintRuler(ctx, pi);
        for (let i=0; i<this.cycle.tasks.length; ++i) {
            paintTask(ctx, pi, i, this.cycle.tasks[i]);
        }
    }
}
