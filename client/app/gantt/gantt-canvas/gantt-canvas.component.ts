import {
    AfterViewChecked, Component, ElementRef, OnInit, HostListener, ViewChild
} from '@angular/core';

import { GanttTimeMapService, GanttTimeMap } from '../gantt-time-map.service';
import { GanttHeightMapService, VBounds, GanttHeightMap } from '../gantt-height-map.service';
import { PaintInfo, paintBackground, paintRuler, paintTask, paintLink } from '../painting';

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
    private _cycleSubscriptions = [];

    @ViewChild("ganttDiv")
    divRef: ElementRef;
    @ViewChild("ganttCanvas")
    canvasRef: ElementRef;

    ngOnInit() {
        this.cycleService.currentCycleChange.subscribe(
            (cycle: Cycle) => {
                for (let s of this._cycleSubscriptions) {
                    s.unsubscribe();
                }
                this.cycle = cycle;
                this._cycleSubscriptions = [
                    cycle.planEvent.subscribe(() => {
                        this.paintCanvas();
                    }),
                    cycle.taskPushEvent.subscribe((arg) => {
                        this.paintCanvas();
                    })
                ];
            }
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
        this.ganttTimeMapService.timeMapChange.subscribe(
            (tm: GanttTimeMap) => {
                this.checkCanvasSize();
                this.paintCanvas();
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
        const divWidth = divRect.width;
        const height = this.ganttHeightMapService.heightMap.table.height;
        const top = canvasRect.top;
        const timeMap = this.ganttTimeMapService.timeMap;
        const cycle = this.cycle;
        const cycleWidth = this.cycle ? timeMap.timePos(this.cycle.cycleTime) : 0;
        const width = Math.floor(Math.max(divWidth, cycleWidth));
        let res = false;

        if (width != this._canvasWidth) {
            this._canvasWidth = width;
            this.canvasRef.nativeElement.width = width;
            this.canvasRef.nativeElement.style.width =
                    (cycleWidth > divWidth) ? ""+width+"px" : "100%";
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
        for (let t of this.cycle.tasks) {
            paintTask(ctx, pi, t);
        }
        for (let l of this.cycle.links) {
            paintLink(ctx, pi, l);
        }
    }
}
