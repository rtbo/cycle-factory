
import { TimeGrad } from './gantt-time-map.service';
import { HeightMap } from './gantt-height-map.service';

const RULER_BG = "lightgrey";
const RULER_FG = "darkgrey";
const TEXT_FG = "black";

export class PaintInfo {
    canvasWidth: number;
    canvasHeight: number;
    canvasTop: number; // y coord from viewport
    heightMap: HeightMap;
    timeGrads: TimeGrad[];
}

export function paintRuler(ctx: CanvasRenderingContext2D, pi: PaintInfo): void {
    const rulerHeight = pi.heightMap.head.height;
    const rulerTop = pi.heightMap.head.top - pi.canvasTop;

    ctx.fillStyle = RULER_BG;
    ctx.fillRect(0, rulerTop-0.5, pi.canvasWidth, rulerHeight);

    ctx.strokeStyle = RULER_FG;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(pi.canvasWidth, 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, rulerTop+rulerHeight - 0.5);
    ctx.lineTo(pi.canvasWidth, rulerTop+rulerHeight - 0.5);
    ctx.stroke();
    ctx.fillStyle = TEXT_FG;
    for (let g of pi.timeGrads) {
        ctx.beginPath();
        ctx.moveTo(g.pos + 0.5, 0);
        ctx.lineTo(g.pos + 0.5, pi.canvasHeight);
        ctx.stroke();

        ctx.fillText(g.time.toString(), g.pos + 5.5, rulerTop+rulerHeight - 5.5);
    }

    for (let r of pi.heightMap.tasks) {
        const rectOffset = r.top - pi.canvasTop;
        ctx.beginPath();
        ctx.moveTo(0, rectOffset + r.height - 0.5);
        ctx.lineTo(pi.canvasWidth, rectOffset + r.height - 0.5);
        ctx.stroke();
    }
}