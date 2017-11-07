
import { TimeGrad, TimeMap } from './gantt-time-map.service';
import { HeightMap } from './gantt-height-map.service';
import { Task } from '../cycle';

const RULER_BG = "lightgrey";
const RULER_FG = "darkgrey";
const TEXT_FG = "black";

const TASK_H = 15;
const TASK_FILL = "lightblue";
const TASK_STROKE = "darkblue";

export class PaintInfo {
    canvasWidth: number;
    canvasHeight: number;
    heightMap: HeightMap;
    timeMap: TimeMap;
    timeGrads: TimeGrad[];
}

export function paintRuler(ctx: CanvasRenderingContext2D, pi: PaintInfo): void {
    const rulerHeight = pi.heightMap.headHeight;

    ctx.fillStyle = RULER_BG;
    ctx.fillRect(0, 0.5, pi.canvasWidth, rulerHeight);

    ctx.strokeStyle = RULER_FG;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(pi.canvasWidth, 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, rulerHeight + 0.5);
    ctx.lineTo(pi.canvasWidth, rulerHeight + 0.5);
    ctx.stroke();
    ctx.fillStyle = TEXT_FG;
    for (let g of pi.timeGrads) {
        ctx.beginPath();
        ctx.moveTo(g.pos + 0.5, 0.5);
        ctx.lineTo(g.pos + 0.5, pi.canvasHeight);
        ctx.stroke();

        ctx.fillText(g.time.toString(), g.pos + 5.5, rulerHeight - 5.5);
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