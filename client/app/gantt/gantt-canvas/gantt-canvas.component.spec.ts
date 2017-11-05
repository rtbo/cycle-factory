import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleCanvasComponent } from './cycle-canvas.component';

describe('CycleCanvasComponent', () => {
  let component: CycleCanvasComponent;
  let fixture: ComponentFixture<CycleCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CycleCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CycleCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
