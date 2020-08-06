import { Component, OnInit } from '@angular/core';
import { PrivacyPolicyService } from '../privacy-policy/privacy-policy.service';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';


@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {

  ppValue:  string;
  // private subscription: Subscription;

  constructor(private ppService: PrivacyPolicyService) { }

  async ngOnInit() {
    // could do this in a resolver but didn't want to create another class just for that
    this.ppValue = await this.ppService.getPolicy();
  }

  ngOnDestroy() {
    // if(this.subscription) this.subscription.unsubscribe();
  }

  onSubmit(/* not needed     form: NgForm*/) {
    this.ppService.updatePolicy(this.ppValue);
  }

}
