
const TASK_FILL = 'lightblue';
const TASK_STROKE = 'darkblue';

const LINK_COLOR = 'black';
const LINK_LAG_COLOR = 'green';

export class TaskVisual {
    ind: number = 0;
    fill: string = TASK_FILL;
    stroke: string = TASK_STROKE;
}

export class LinkVisual {
    color: string = LINK_COLOR;
    lagColor: string = LINK_LAG_COLOR;
}
