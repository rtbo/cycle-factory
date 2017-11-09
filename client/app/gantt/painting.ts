
import { TimeGrad, TimeMap } from './gantt-time-map.service';
import { GanttHeightMap } from './gantt-height-map.service';
import { Task } from '../model/cycle';

const CANVAS_BG = "white";

const RULER_BG = "lightgrey";
const RULER_FG = "darkgrey";
const TEXT_FG = "black";

const TASK_H = 15;
const TASK_FILL = "lightblue";
const TASK_STROKE = "darkblue";

export class PaintInfo {
    canvasWidth: number;
    canvasHeight: number;
    heightMap: GanttHeightMap;
    timeMap: TimeMap;
    timeGrads: TimeGrad[];
}

export function paintBackground(ctx: CanvasRenderingContext2D, pi: PaintInfo): void {
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, pi.canvasWidth, pi.canvasHeight);
}

export function paintRuler(ctx: CanvasRenderingContext2D, pi: PaintInfo): void {
    const top = Math.round(pi.heightMap.head.top) + 0.5;
    const bottom = Math.round(pi.heightMap.head.bottom) + 0.5;
    const canvasBottom = Math.round(pi.heightMap.table.bottom) + 0.5;

    ctx.fillStyle = RULER_BG;
    ctx.fillRect(0, top, pi.canvasWidth, bottom-top);

    ctx.strokeStyle = RULER_FG;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(pi.canvasWidth, top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, bottom);
    ctx.lineTo(pi.canvasWidth, bottom);
    ctx.stroke();
    ctx.fillStyle = TEXT_FG;
    for (let g of pi.timeGrads) {
        ctx.beginPath();
        ctx.moveTo(g.pos + 0.5, top);
        ctx.lineTo(g.pos + 0.5, canvasBottom);
        ctx.stroke();

        ctx.fillText(g.time.toString(), g.pos + 5.5, bottom - 5.5);
    }
}

export function paintTask(ctx: CanvasRenderingContext2D,
                          pi: PaintInfo,
                          taskInd: number,
                          t: Task): void
{
    const row = pi.heightMap.taskRows[taskInd];
    if (!row) return;

    const left = Math.round(pi.timeMap.timePos(t.earlyStart)) + 0.5;
    const right = Math.round(pi.timeMap.timePos(t.earlyFinish)) + 0.5;
    const mid = Math.round(row.top + row.height/2);
    const top = mid - TASK_H / 2;
    const bottom = mid + TASK_H / 2;

    ctx.fillStyle = TASK_FILL;
    ctx.fillRect(left, top, right-left, bottom-top);

    ctx.strokeStyle = TASK_STROKE;
    ctx.strokeRect(left, top, right-left, bottom-top);
}