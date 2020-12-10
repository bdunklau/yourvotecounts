import { TestBed } from '@angular/core/testing';

import { MessageService } from './message.service';

describe('MessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    console.log('MessageService: begin')
    const service: MessageService = TestBed.get(MessageService);
    expect(service).toBeTruthy();
    console.log('MessageService: end')
  });
});
