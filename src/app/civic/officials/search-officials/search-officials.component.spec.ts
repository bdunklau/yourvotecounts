import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOfficialsComponent } from './search-officials.component';

describe('SearchOfficialsComponent', () => {
  let component: SearchOfficialsComponent;
  let fixture: ComponentFixture<SearchOfficialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchOfficialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOfficialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
