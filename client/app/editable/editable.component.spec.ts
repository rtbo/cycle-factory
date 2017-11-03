import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableComponent } from './editable.component';

describe('EditableComponent', () => {
    let component: EditableComponent;
    let fixture: ComponentFixture<EditableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditableComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditableComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.type = "number";
        component.value = 5;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
