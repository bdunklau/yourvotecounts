import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVideoComponent } from './view-video.component';


// TODO FIXME test
xdescribe('ViewVideoComponent', () => {
  let component: ViewVideoComponent;
  let fixture: ComponentFixture<ViewVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
