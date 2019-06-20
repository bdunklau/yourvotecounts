import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLogByLevelComponent } from './search-log-by-level.component';

describe('SearchLogByLevelComponent', () => {
  let component: SearchLogByLevelComponent;
  let fixture: ComponentFixture<SearchLogByLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchLogByLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchLogByLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
