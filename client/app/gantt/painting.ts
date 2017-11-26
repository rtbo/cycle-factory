
import { TimeGrad, GanttTimeMap } from './gantt-time-map.service';
import { GanttHeightMap } from './gantt-height-map.service';
import { CyclePlan, Task, Link, TaskPlan } from '../model/cycle';
import { CycleVisual, TaskVisual, LinkVisual } from '../model/visuals';

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
    // const top = roundPx(pi.heightMap.head.top);
    const top = roundPx(0);
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

export function paintCycles(ctx: CanvasRenderingContext2D,
                           pi: PaintInfo,
                           cp: CyclePlan) {
    const visual = cycleVisual(cp);
    const top = roundPx(pi.heightMap.table.top);
    const bottom = roundPx(pi.heightMap.table.bottom);
    const thickness = 2;


    function paint(xTime: number) {
        const x = roundPx(pi.timeMap.timePos(xTime), thickness);
        if (x + thickness/2 < 0) return;
        if (x - thickness/2 > pi.canvasWidth) return;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
    }

    ctx.save();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = visual.stroke;
    paint(0);
    for (let c=0; c<cp.count; ++c) {
        paint(cp.cycleTime * (c+1));
    }
    ctx.restore();
}

export function paintTask(ctx: CanvasRenderingContext2D,
                          pi: PaintInfo,
                          tp: TaskPlan): void {
    const visual = taskVisual(tp);
    if (!visual) return;

    const left = roundPx(pi.timeMap.timePos(tp.earlyStart));
    const right = roundPx(pi.timeMap.timePos(tp.earlyFinish));
    const midY = roundPx(taskMidY(tp, pi));
    const top = roundPx(taskBarTopY(tp, pi));
    const bottom = roundPx(taskBarBotY(tp, pi));

    ctx.fillStyle = visual.fill;
    ctx.fillRect(left, top, right-left, bottom-top);

    ctx.strokeStyle = visual.stroke;
    ctx.strokeRect(left, top, right-left, bottom-top);

    if (tp.slack > 0) {
        const markerH = 5;
        const endSlack = roundPx(pi.timeMap.timePos(tp.lateFinish));
        const midYOffset = 3;
        const ySlack = midY + midYOffset;
        if (endSlack - markerH > right) {
            ctx.save();
            ctx.setLineDash(SLACK_DASH);
            ctx.lineDashOffset = 0.5;
            ctx.beginPath();
            ctx.moveTo(right, ySlack);
            ctx.lineTo(endSlack-markerH, ySlack);
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        ctx.fillStyle = TASK_SLACK_FILL;
        ctx.beginPath();
        ctx.moveTo(endSlack-markerH, ySlack);
        ctx.lineTo(endSlack, ySlack+3);
        ctx.lineTo(endSlack, ySlack-3);
        ctx.fill();
        ctx.restore();
    }
}

export function paintLink(ctx: CanvasRenderingContext2D,
                          pi: PaintInfo,
                          cp: CyclePlan,
                          l: Link): void {
    if (l.from.type === 'task' && l.to.type === 'task') {
        for (let i=0; i<cp.count; ++i) {
            paintTaskTaskLink(ctx, pi, cp, l, i);
        }
        return;
    }
    if (l.from.type === 'cycle' && l.to.type === 'task') {
        for (let i=0; i<cp.count; ++i) {
            paintCycleTaskLink(ctx, pi, cp, l, i);
        }
        return;
    }
    if (l.from.type === 'task' && l.to.type === 'cycle') {
        for (let i=0; i<cp.count; ++i) {
            paintTaskCycleLink(ctx, pi, cp, l, i);
        }
        return;
    }
}

function paintTaskTaskLink(ctx: CanvasRenderingContext2D,
                           pi: PaintInfo,
                           cp: CyclePlan,
                           l: Link,
                           instance: number): void {
    const visual: LinkVisual = linkVisual(l);
    const midYToOffset = -3;

    const from = cp.lookUpTask(l.from.planner as Task, instance);
    const to = cp.lookUpTask(l.to.planner as Task, instance);
    const earlyTimeFrom = l.from.getEarlyTime(cp, instance);
    const earlyTimeTo = l.to.getEarlyTime(cp, instance);

    const xFrom = roundPx(pi.timeMap.timePos(earlyTimeFrom));
    const xTo = roundPx(pi.timeMap.timePos(earlyTimeTo));
    const rightW = xTo > xFrom;
    const straightMode = xTo >= xFrom && l.lag >= 0;
    const horizArrow = rightW;

    const midYFrom = taskMidY(cp.lookUpTask(l.from.planner as Task, instance), pi);
    const midYTo = taskMidY(to, pi)+midYToOffset;
    const downW = midYTo > midYFrom;
    const yFrom = downW ? taskBarBotY(from, pi) : taskBarTopY(from, pi);
    const yTo = horizArrow ? midYTo : (downW ? taskBarTopY(to, pi) : taskBarBotY(to, pi));
    const xLagTo = roundPx(pi.timeMap.timePos(earlyTimeFrom+l.lag));

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
        const yBack = roundPx(downW ? taskTopY(to, pi) : taskBotY(to, pi));
        ctx.beginPath();
        ctx.moveTo(xFrom, yFrom);
        ctx.lineTo(xFrom, yBack);
        ctx.stroke();
        let x = xFrom;
        if (l.lag !== 0) {
            const xToLag = roundPx(pi.timeMap.timePos(earlyTimeFrom + l.lag));
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

function paintCycleTaskLink(ctx: CanvasRenderingContext2D,
                            pi: PaintInfo,
                            cp: CyclePlan,
                            l: Link,
                            instance: number): void {
    const visual: LinkVisual = linkVisual(l);

    const to = cp.lookUpTask(l.to.planner as Task, instance);
    const earlyTimeFrom = l.from.getEarlyTime(cp, instance);
    const earlyTimeTo = l.to.getEarlyTime(cp, instance);

    const xFrom = roundPx(pi.timeMap.timePos(earlyTimeFrom));
    const xTo = roundPx(pi.timeMap.timePos(earlyTimeTo));
    const y = taskMidY(to, pi);

    ctx.save();
    ctx.strokeStyle = visual.cycleMarkStroke;
    ctx.fillStyle = visual.cycleMarkFill;
    ctx.beginPath();
    ctx.moveTo(xFrom + 8, y);
    ctx.lineTo(xFrom, y+6);
    ctx.lineTo(xFrom, y-6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
function paintTaskCycleLink(ctx: CanvasRenderingContext2D,
                            pi: PaintInfo,
                            cp: CyclePlan,
                            l: Link,
                            instance: number): void {
    const visual: LinkVisual = linkVisual(l);

    const from = cp.lookUpTask(l.from.planner as Task, instance);
    const earlyTimeFrom = l.from.getEarlyTime(cp, instance);
    const earlyTimeTo = l.to.getEarlyTime(cp, instance);

    const xFrom = roundPx(pi.timeMap.timePos(earlyTimeFrom));
    const xTo = roundPx(pi.timeMap.timePos(earlyTimeTo));
    const y = taskMidY(from, pi);

    ctx.save();
    ctx.strokeStyle = visual.cycleMarkStroke;
    ctx.fillStyle = visual.cycleMarkFill;
    ctx.beginPath();
    ctx.moveTo(xTo, y);
    ctx.lineTo(xTo - 8, y+6);
    ctx.lineTo(xTo - 8, y-6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}


function cycleVisual(cp: CyclePlan): CycleVisual {
    return cp.visual ? cp.visual : cp.cycle.visual;
}

function taskVisual(tp: TaskPlan): TaskVisual {
    return tp.visual ? tp.visual : tp.task.visual;
}

function linkVisual(l: Link): LinkVisual {
    return l.visual;
}

function roundPx(pos: number, thickness=1): number {
    return Math.round(pos) + ((thickness % 2) ? 0.5 : 1);
}

function taskMidY(tp: TaskPlan, pi: PaintInfo): number {
    const visual = taskVisual(tp);
    if (!visual) return 0;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return row.top + row.height/2;
}

function taskTopY(tp: TaskPlan, pi: PaintInfo): number {
    const visual = taskVisual(tp);
    if (!visual) return 0;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return row.top;
}

function taskBotY(tp: TaskPlan, pi: PaintInfo): number {
    const visual = taskVisual(tp);
    if (!visual) return 0;
    const ind = visual.ind;
    if (ind >= pi.heightMap.taskRows.length) return 0;
    const row = pi.heightMap.taskRows[ind];
    return row.bottom;
}

function taskBarTopY(tp: TaskPlan, pi: PaintInfo): number {
    return taskMidY(tp, pi) - TASK_BAR_H/2;
}

function taskBarBotY(tp: TaskPlan, pi: PaintInfo): number {
    return taskMidY(tp, pi) + TASK_BAR_H/2;
}
