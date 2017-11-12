
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

export function paintLink(ctx: CanvasRenderingContext2D,
                          pi: PaintInfo,
                          l: Link): void {
    const visual: LinkVisual = l.visual;

    const xFrom = Math.round(pi.timeMap.timePos(l.earlyTimeFrom)) + 0.5;
    const xTo = Math.round(pi.timeMap.timePos(l.earlyTimeTo)) + 0.5;
    const rightW = xTo > xFrom;
    const straightMode = xTo >= xFrom && l.lag >= 0;
    const horizArrow = rightW;

    const midYFrom = taskMidY(l.from, pi);
    const midYTo = taskMidY(l.to, pi);
    const downW = midYTo > midYFrom;
    const yFrom = downW ? (midYFrom + TASK_H/2) : (midYFrom - TASK_H/2);
    const yTo = horizArrow ? midYTo+0.5 : (downW ? (midYTo - TASK_H/2) : (midYTo + TASK_H/2));
    const xLagTo = Math.round(pi.timeMap.timePos(l.earlyTimeFrom+l.lag)) + 0.5;

    ctx.save();
    ctx.strokeStyle = visual.color;

    if (straightMode) {
        ctx.beginPath();
        ctx.moveTo(xFrom, yFrom);
        ctx.lineTo(xFrom, yTo);
        ctx.stroke();
        let x = xFrom;
        if (horizArrow && l.lag > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = visual.lagColor;
            ctx.moveTo(x, yTo);
            ctx.lineTo(xLagTo, yTo);
            ctx.stroke();
            ctx.restore();
            x = xLagTo;
        }
        if (horizArrow && x != xTo) {
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.lineDashOffset = 0.5;
            ctx.moveTo(x, yTo);
            ctx.lineTo(xTo, yTo);
            ctx.stroke();
            ctx.restore();
        }
    }
    else {
        const yBack = downW ? taskTopY(l.to, pi) : taskBotY(l.to, pi);
        ctx.beginPath();
        ctx.moveTo(xFrom, yFrom);
        ctx.lineTo(xFrom, yBack);
        ctx.stroke();
        let x = xFrom;
        if (l.lag != 0) {
            const xToLag = Math.floor(pi.timeMap.timePos(l.earlyTimeFrom + l.lag)) + 0.5;
            ctx.save();
            ctx.strokeStyle = visual.lagColor;
            ctx.beginPath();
            ctx.moveTo(x, yBack);
            ctx.lineTo(xToLag, yBack);
            ctx.stroke();
            ctx.restore();
            x = xToLag;
        }
        ctx.beginPath();
        ctx.moveTo(x, yBack);
        ctx.lineTo(x, yTo);
        ctx.stroke();
        if (x != xTo) {
            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.lineDashOffset = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, yTo);
            ctx.lineTo(xTo, yTo);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.fillStyle = visual.color;
    ctx.beginPath();
    ctx.moveTo(xTo, yTo);
    if (horizArrow) {
        const basis = xTo - 5;
        ctx.lineTo(basis, yTo+3);
        ctx.lineTo(basis, yTo-3);
    }
    else {
        const basis = downW ? yTo - 5 : yTo + 5;
        ctx.lineTo(xTo-3, basis);
        ctx.lineTo(xTo+3, basis);
    }
    ctx.fill();

    ctx.restore();
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
