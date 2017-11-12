
import { TimeGrad, TimeMap } from './gantt-time-map.service';
import { GanttHeightMap } from './gantt-height-map.service';
import { Task, Link } from '../model/cycle';
import { TaskVisual, LinkVisual } from '../model/visuals';

const CANVAS_BG = "white";

const RULER_BG = "lightgrey";
const RULER_FG = "darkgrey";
const TEXT_FG = "black";

const TASK_H = 15;

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
                          t: Task): void
{
    const visual: TaskVisual = t.visual;
    const left = Math.round(pi.timeMap.timePos(t.earlyStart)) + 0.5;
    const right = Math.round(pi.timeMap.timePos(t.earlyFinish)) + 0.5;
    const mid = taskMidY(t, pi);
    const top = mid - TASK_H / 2;
    const bottom = mid + TASK_H / 2;

    ctx.fillStyle = visual.fill;
    ctx.fillRect(left, top, right-left, bottom-top);

    ctx.strokeStyle = visual.stroke;
    ctx.strokeRect(left, top, right-left, bottom-top);
}


function taskTopY(task: Task, pi: PaintInfo): number {
    const visual: TaskVisual = task.visual;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return Math.floor(row.top) + 0.5;
}

function taskMidY(task: Task, pi: PaintInfo): number {
    const visual: TaskVisual = task.visual;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return Math.floor(row.top + row.height/2);
}

function taskBotY(task: Task, pi: PaintInfo): number {
    const visual: TaskVisual = task.visual;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return Math.floor(row.bottom) + 0.5;
}
