import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CycleService } from '../../services/cycle.service';
import { GanttTimeMapService } from '../gantt-time-map.service';
import { GanttHeightMapService, TaskRow, HeightMap } from '../gantt-height-map.service';

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
        let height = Math.round(this.ganttHeightMapService.heightMap.total.height);

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
        const width = this._canvasWidth;
        const height = this._canvasHeight;
        const grads = this.ganttTimeMapService.grads;
        const offset = this.canvasRef.nativeElement.getBoundingClientRect().top;
        const heights = this.ganttHeightMapService.heightMap;

        const rulerBg = "lightgrey";
        const rulerLines = "darkgrey";
        const rulerFg = "black";

        const rulerHeight = heights.head.height;
        const rulerOffset = heights.head.offset - offset;

        ctx.fillStyle = rulerBg;
        ctx.fillRect(0, rulerOffset-0.5, width, rulerHeight);

        ctx.strokeStyle = rulerLines;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0.5);
        ctx.lineTo(width, 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, rulerOffset+rulerHeight - 0.5);
        ctx.lineTo(width, rulerOffset+rulerHeight - 0.5);
        ctx.stroke();
        ctx.fillStyle = rulerFg;
        for (let g of grads) {
            ctx.beginPath();
            ctx.moveTo(g.pos + 0.5, 0);
            ctx.lineTo(g.pos + 0.5, height);
            ctx.stroke();

            ctx.fillText(g.time.toString(), g.pos + 5.5, rulerOffset+rulerHeight - 5.5);
        }

        for (let r of heights.tasks) {
            const rectOffset = r.offset - offset;
            ctx.beginPath();
            ctx.moveTo(0, rectOffset + r.height - 0.5);
            ctx.lineTo(width, rectOffset + r.height - 0.5);
            ctx.stroke();
        }
    }
}