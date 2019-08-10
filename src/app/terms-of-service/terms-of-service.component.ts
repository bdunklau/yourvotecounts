import { Component, OnInit, OnDestroy } from '@angular/core';
import { TermsOfServiceService } from '../terms-of-service/terms-of-service.service';
// import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.css']
})
export class TermsOfServiceComponent implements OnInit {

  tosValue:  string;
  // private subscription: Subscription;

  constructor(private tosService: TermsOfServiceService,) { }

  async ngOnInit() {
    // could do this in a resolver but didn't want to create another class just for that
    this.tosValue = await this.tosService.getTerms();
  }

  ngOnDestroy() {
    // if(this.subscription) this.subscription.unsubscribe();
  }

  onSubmit(form: NgForm) {
    this.tosService.updateTerms(this.tosValue);
  }

}
