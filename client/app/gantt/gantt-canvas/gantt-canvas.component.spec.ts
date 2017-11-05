import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttCanvasComponent } from './gantt-canvas.component';

describe('CycleCanvasComponent', () => {
  let component: GanttCanvasComponent;
  let fixture: ComponentFixture<GanttCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GanttCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GanttCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
