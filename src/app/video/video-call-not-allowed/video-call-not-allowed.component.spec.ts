import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCallNotAllowedComponent } from './video-call-not-allowed.component';

// TODO FIXME test
xdescribe('VideoCallNotAllowedComponent', () => {
  let component: VideoCallNotAllowedComponent;
  let fixture: ComponentFixture<VideoCallNotAllowedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoCallNotAllowedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoCallNotAllowedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
