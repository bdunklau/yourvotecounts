import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOfficialComponent } from './view-official.component';

describe('ViewOfficialComponent', () => {
  let component: ViewOfficialComponent;
  let fixture: ComponentFixture<ViewOfficialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOfficialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOfficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
