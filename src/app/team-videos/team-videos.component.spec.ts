import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamVideosComponent } from './team-videos.component';

// TODO FIXME test
xdescribe('TeamVideosComponent', () => {
  let component: TeamVideosComponent;
  let fixture: ComponentFixture<TeamVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamVideosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
