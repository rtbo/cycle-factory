import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditableComponent } from './editable/editable.component';
import { TaskTableComponent } from './task-table/task-table.component';
import { TaskBarComponent } from './task-bar/task-bar.component';

@NgModule({
    declarations: [
        AppComponent,
        EditableComponent,
        TaskTableComponent,
        TaskBarComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
