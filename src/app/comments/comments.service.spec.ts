import { TestBed } from '@angular/core/testing';

import { CommentsService } from './comments.service';



// TODO FIXME test
xdescribe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
