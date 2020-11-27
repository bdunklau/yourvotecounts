import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerAdComponent } from './banner-ad.component';
import { RouterTestingModule } from '@angular/router/testing';


describe('BannerAdComponent', () => {
  let component: BannerAdComponent;
  let fixture: ComponentFixture<BannerAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerAdComponent ],
      imports: [
        RouterTestingModule//, FormsModule, ReactiveFormsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
