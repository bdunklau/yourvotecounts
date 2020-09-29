import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationDeletedComponent } from './invitation-deleted.component';

// TODO FIXME test
xdescribe('InvitationDeletedComponent', () => {
  let component: InvitationDeletedComponent;
  let fixture: ComponentFixture<InvitationDeletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitationDeletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationDeletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
