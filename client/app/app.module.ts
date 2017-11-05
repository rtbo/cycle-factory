import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditableComponent } from './editable/editable.component';
import { TaskTableComponent } from './task-table/task-table.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CycleService } from './services/cycle.service';
import { GanttCanvasComponent } from './gantt/gantt-canvas/gantt-canvas.component';

@NgModule({
    declarations: [
        AppComponent,
        EditableComponent,
        TaskTableComponent,
        ToolbarComponent,
        GanttCanvasComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
    ],
    providers: [CycleService],
    bootstrap: [AppComponent]
})
export class AppModule { }
