import {
    Directive,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    HostListener,
    ElementRef } from '@angular/core';

@Directive({
    selector: '[gcContentEditableModel]',
    exportAs: "contentEditableModel",
    host: {
        "ContentEditable": "true"
    }
})
export class ContentEditableModelDirective implements OnChanges {

    constructor(private el: ElementRef) { }

    @Input('gcContentEditableModel') model: any;
    @Output('gcContentEditableModelChange') change: EventEmitter<any> = new EventEmitter();
    @Input() type: string = "text";

    ngOnChanges(changes: SimpleChanges) {
        this.applyModelToContent();
    }

    resetModel(model: any) {
        this.model = model;
        this.applyModelToContent();
    }

    @HostListener("keydown", ["$event"]) onKeyDown(event) {
        if (event.key === "Enter") {
            this.doUpdate();
        }
        else if (event.key === "Escape") {
            this.doCancel();
        }
    }

    @HostListener("blur") onBlur() {
        this.doUpdate();
    }

    private doUpdate(): void {

        // retrieve value
        let value = this.contentToModel();

        // check for unparsable number
        if (this.type == "number" && isNaN(value)) {
            this.doCancel();
            return;
        }

        // update if needed
        if (value !== this.model) {
            this.model = value;
            this.change.emit(value);
        }

        // correct number if needed
        // e.g. parseFloat("4FRF") === 4, we set back "4" to textContent
        if (this.type === "number" && /[a-z]/i.test(this.textContent)) {
            this.textContent = value;
        }

        this.el.nativeElement.blur();
    }

    private doCancel(): void {
        this.applyModelToContent();
        this.el.nativeElement.blur();
    }

    private applyModelToContent(): void {
        this.textContent = this.model.toString();
    }

    private contentToModel(): any {
        if (this.type === "number") {
            return parseFloat(this.textContent);
        }
        else {
            return this.textContent;
        }
    }

    private get textContent(): string {
        return this.el.nativeElement.textContent;
    }

    private set textContent(content: string) {
        this.el.nativeElement.textContent = content;
    }
}
