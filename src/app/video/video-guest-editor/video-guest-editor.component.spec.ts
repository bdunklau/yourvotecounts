import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoGuestEditorComponent } from './video-guest-editor.component';

// TODO FIXME test
xdescribe('VideoGuestEditorComponent', () => {
  let component: VideoGuestEditorComponent;
  let fixture: ComponentFixture<VideoGuestEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoGuestEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoGuestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
