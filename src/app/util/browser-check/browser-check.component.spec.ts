import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserCheckComponent } from './browser-check.component';


// TODO FIXME test
xdescribe('BrowserCheckComponent', () => {
  let component: BrowserCheckComponent;
  let fixture: ComponentFixture<BrowserCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
