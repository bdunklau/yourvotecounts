import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSearchComponent } from './video-search.component';


// TODO FIXME test
xdescribe('VideoSearchComponent', () => {
  let component: VideoSearchComponent;
  let fixture: ComponentFixture<VideoSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
