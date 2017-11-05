import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { de, mand } from '../debug';

@Component({
    selector: 'gc-editable',
    templateUrl: './editable.component.html',
    styleUrls: ['./editable.component.css']
})
export class EditableComponent implements OnInit {

    private _type: string; // "text" or "number"
    private _value: string | number;
    private _editing: boolean = false;

    ngOnInit(): void {
        de && mand(
            typeof this.value === "string" && this.type === "text" ||
            typeof this.value === "number" && this.type === "number",
            "Inconsistency between Editable.type ('${this.type}') and the " +
            "type of Editable.value ('${typeof this.value}')"
        );
    }

    get type(): string {
        return this._type;
    }
    @Input()
    set type(type: string) {
        this._type = type;
    }

    get value(): string | number {
        return this._value;
    }
    @Input("value")
    set value(value: string | number) {
        this._value = value;
        this.valueChange.emit(value);
    }

    @Output() valueChange = new EventEmitter<string | number>();

    get editing(): boolean {
        return this._editing;
    }
    @Input()
    set editing(editing: boolean) {
        this._editing = editing;
    }

    toggleEdit(): void {
        this.editing = !this._editing;
    }

    onEscape(): void {
        this.editing = false;
    }

    onEnter(newVal: string | number): void {
        this.editing = false;
        this.value = newVal;
    }
}
