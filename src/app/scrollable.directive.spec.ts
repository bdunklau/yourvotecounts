import { ScrollableDirective } from './scrollable.directive';
import { /*Directive, HostListener, EventEmitter, Output,*/ ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';


class MockElementRef implements ElementRef {
  nativeElement = {};
}


describe('ScrollableDirective', () => {


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // declarations: [ ElementRef ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
                    { provide: ElementRef, useValue: new MockElementRef() },
      //             { provide: HttpClient, useValue: {} },
      //             { provide: AngularFirestore, useValue: AngularFirestoreStub },
      //             { provide: AngularFireAuth, useValue: {} },
      //             { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                ],
    })
    .compileComponents();
  }));


  it('should create an instance', () => {
    const directive = new ScrollableDirective(TestBed.get(ElementRef));
    expect(directive).toBeTruthy();
  });
});
