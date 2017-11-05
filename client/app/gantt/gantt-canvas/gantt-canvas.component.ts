import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CycleService } from '../../services/cycle.service';
import { GanttTimeMapService } from '../gantt-time-map.service';

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
        this.paintCanvas();
    }

    ngAfterViewChecked(): void {
        let width = this.canvasRef.nativeElement.width;
        let height = this.canvasRef.nativeElement.height;
        if (width != this._canvasWidth || height != this._canvasHeight) {
            this._canvasWidth = width;
            this._canvasHeight = height;
            this.ganttTimeMapService.updateCanvasSize(width, height);
        }
    }


    paintCanvas(): void {
        let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
        let width = this.canvasRef.nativeElement.width;
        let height = this.canvasRef.nativeElement.height;
        ctx.fillStyle = "aqua";
        ctx.fillRect(0, 0, width, height);
    }
}
