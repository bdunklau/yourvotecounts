import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '../user/user.service';
import { DisabledComponent } from './disabled.component';
import { Router } from "@angular/router";

describe('DisabledComponent', () => {
  let component: DisabledComponent;
  let fixture: ComponentFixture<DisabledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisabledComponent ],
      providers: [UserService,
                  { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } }
                ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
