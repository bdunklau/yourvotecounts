import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DateChooserComponent } from './date-chooser.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

describe('DateChooserComponent', () => {
  let component: DateChooserComponent;
  let fixture: ComponentFixture<DateChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgbModule,],
      declarations: [ DateChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('DateChooserComponent: begin')
    expect(component).toBeTruthy();
    console.log('DateChooserComponent: end')
  });
});
