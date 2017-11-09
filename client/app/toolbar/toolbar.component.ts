import { Component, OnInit } from '@angular/core';
import { Cycle } from '../model/cycle';
import { CycleService } from '../model/cycle.service';

@Component({
    selector: 'gc-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

    cycle: Cycle;

    constructor(private cycleService: CycleService) { }

    ngOnInit() {
        this.cycleService.currentCycleObservable.subscribe(
            (cycle: Cycle) => { this.cycle = cycle; }
        );
    }

}
