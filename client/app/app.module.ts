import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditableComponent } from './editable/editable.component';
import { TaskTableComponent } from './task-table/task-table.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CycleService } from './model/cycle.service';
import { GanttCanvasComponent } from './gantt/gantt-canvas/gantt-canvas.component';
import { GanttTimeMapService } from './gantt/gantt-time-map.service';
import { GanttHeightMapService } from './gantt/gantt-height-map.service';
import { ContentEditableModelDirective } from './content-editable-model.directive';

@NgModule({
    declarations: [
        AppComponent,
        EditableComponent,
        TaskTableComponent,
        ToolbarComponent,
        GanttCanvasComponent,
        ContentEditableModelDirective,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
    ],
    providers: [
        CycleService,
        GanttTimeMapService,
        GanttHeightMapService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
