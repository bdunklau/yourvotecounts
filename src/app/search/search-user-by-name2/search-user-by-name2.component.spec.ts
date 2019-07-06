import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUserByName2Component } from './search-user-by-name2.component';

describe('SearchUserByName2Component', () => {
  let component: SearchUserByName2Component;
  let fixture: ComponentFixture<SearchUserByName2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchUserByName2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchUserByName2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
