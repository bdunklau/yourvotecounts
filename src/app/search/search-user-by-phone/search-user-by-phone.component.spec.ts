import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUserByPhoneComponent } from './search-user-by-phone.component';

describe('SearchUserByPhoneComponent', () => {
  let component: SearchUserByPhoneComponent;
  let fixture: ComponentFixture<SearchUserByPhoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchUserByPhoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchUserByPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
