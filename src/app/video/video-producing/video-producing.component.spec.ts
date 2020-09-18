import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoProducingComponent } from './video-producing.component';

describe('VideoProducingComponent', () => {
  let component: VideoProducingComponent;
  let fixture: ComponentFixture<VideoProducingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoProducingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoProducingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
