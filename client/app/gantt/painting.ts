
import { TimeGrad, GanttTimeMap } from './gantt-time-map.service';
import { GanttHeightMap } from './gantt-height-map.service';
import { Task, Link } from '../model/cycle';
import { TaskVisual, LinkVisual } from '../model/visuals';

const CANVAS_BG = 'white';

const RULER_BG = 'lightgrey';
const RULER_FG = 'darkgrey';
const TEXT_FG = 'black';

const TASK_BAR_H = 15;
const TASK_SLACK_FILL = 'red';

const SLACK_DASH = [3, 3];

export class PaintInfo {
    canvasWidth: number;
    canvasHeight: number;
    heightMap: GanttHeightMap;
    timeMap: GanttTimeMap;
    timeGrads: TimeGrad[];
}

export function paintBackground(ctx: CanvasRenderingContext2D, pi: PaintInfo): void {
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, pi.canvasWidth, pi.canvasHeight);
}

export function paintRuler(ctx: CanvasRenderingContext2D, pi: PaintInfo): void {
    const top = roundPx(pi.heightMap.head.top);
    const bottom = roundPx(pi.heightMap.head.bottom);
    const canvasBottom = roundPx(pi.heightMap.table.bottom);

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
    for (const g of pi.timeGrads) {
        ctx.beginPath();
        ctx.moveTo(g.pos + 0.5, top);
        ctx.lineTo(g.pos + 0.5, canvasBottom);
        ctx.stroke();
        ctx.fillText(g.time.toString(), g.pos + 5.5, bottom - 5.5);
    }
}

export function paintTask(ctx: CanvasRenderingContext2D,
                          pi: PaintInfo,
                          t: Task): void {
    const visual: TaskVisual = t.visual;
    const left = roundPx(pi.timeMap.timePos(t.earlyStart));
    const right = roundPx(pi.timeMap.timePos(t.earlyFinish));
    const midY = roundPx(taskMidY(t, pi));
    const top = roundPx(taskBarTopY(t, pi));
    const bottom = roundPx(taskBarBotY(t, pi));

    ctx.fillStyle = visual.fill;
    ctx.fillRect(left, top, right-left, bottom-top);

    ctx.strokeStyle = visual.stroke;
    ctx.strokeRect(left, top, right-left, bottom-top);

    if (t.slack > 0) {
        const markerH = 5;
        const endSlack = roundPx(pi.timeMap.timePos(t.lateFinish));
        if (endSlack - markerH > right) {
            ctx.save();
            ctx.setLineDash(SLACK_DASH);
            ctx.lineDashOffset = 0.5;
            ctx.beginPath();
            ctx.moveTo(right, midY);
            ctx.lineTo(endSlack-markerH, midY);
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        ctx.fillStyle = TASK_SLACK_FILL;
        ctx.beginPath();
        ctx.moveTo(endSlack-markerH, midY);
        ctx.lineTo(endSlack, midY+3);
        ctx.lineTo(endSlack, midY-3);
        ctx.fill();
        ctx.restore();
    }
}

export function paintLink(ctx: CanvasRenderingContext2D,
                          pi: PaintInfo,
                          l: Link): void {
    const visual: LinkVisual = l.visual;

    const xFrom = roundPx(pi.timeMap.timePos(l.earlyTimeFrom));
    const xTo = roundPx(pi.timeMap.timePos(l.earlyTimeTo));
    const rightW = xTo > xFrom;
    const straightMode = xTo >= xFrom && l.lag >= 0;
    const horizArrow = rightW;

    const midYFrom = taskMidY(l.from, pi);
    const midYTo = taskMidY(l.to, pi);
    const downW = midYTo > midYFrom;
    const yFrom = downW ? taskBarBotY(l.from, pi) : taskBarTopY(l.from, pi);
    const yTo = horizArrow ? midYTo : (downW ? taskBarTopY(l.to, pi) : taskBarBotY(l.to, pi));
    const xLagTo = roundPx(pi.timeMap.timePos(l.earlyTimeFrom+l.lag));

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
        if (horizArrow && x !== xTo) {
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash(SLACK_DASH);
            ctx.lineDashOffset = 0.5;
            ctx.moveTo(x, yTo);
            ctx.lineTo(xTo, yTo);
            ctx.stroke();
            ctx.restore();
        }
    }
    else {
        const yBack = roundPx(downW ? taskTopY(l.to, pi) : taskBotY(l.to, pi));
        ctx.beginPath();
        ctx.moveTo(xFrom, yFrom);
        ctx.lineTo(xFrom, yBack);
        ctx.stroke();
        let x = xFrom;
        if (l.lag !== 0) {
            const xToLag = roundPx(pi.timeMap.timePos(l.earlyTimeFrom + l.lag));
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
        if (x !== xTo) {
            ctx.save();
            ctx.setLineDash(SLACK_DASH);
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

function roundPx(pos: number): number {
    return Math.round(pos) + 0.5;
}

function taskMidY(task: Task, pi: PaintInfo): number {
    const visual: TaskVisual = task.visual;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return row.top + row.height/2;
}

function taskTopY(task: Task, pi: PaintInfo): number {
    const visual: TaskVisual = task.visual;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return row.top;
}

function taskBotY(task: Task, pi: PaintInfo): number {
    const visual: TaskVisual = task.visual;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return row.bottom;
}

function taskBarTopY(task: Task, pi: PaintInfo): number {
    return taskMidY(task, pi) - TASK_BAR_H/2;
}

function taskBarBotY(task: Task, pi: PaintInfo): number {
    return taskMidY(task, pi) + TASK_BAR_H/2;
}
