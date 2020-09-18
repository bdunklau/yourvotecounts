import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCallCompleteComponent } from './video-call-complete.component';

describe('VideoCallCompleteComponent', () => {
  let component: VideoCallCompleteComponent;
  let fixture: ComponentFixture<VideoCallCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoCallCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoCallCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
