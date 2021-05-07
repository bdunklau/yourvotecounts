import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendFormComponent } from './friend-form.component';


// TODO FIXME test
xdescribe('FriendFormComponent', () => {
  let component: FriendFormComponent;
  let fixture: ComponentFixture<FriendFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FriendFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
