import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../user/user.service';
import { TermsOfServiceService } from '../../terms-of-service/terms-of-service.service';
import { PrivacyPolicyService } from '../../privacy-policy/privacy-policy.service';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';


@Component({
  selector: 'app-minimal-account-info',
  templateUrl: './minimal-account-info.component.html',
  styleUrls: ['./minimal-account-info.component.css']
})
export class MinimalAccountInfoComponent implements OnInit {

  privacyPolicy: string;
  termsOfService: string;
  ppCheck: boolean;
  tosCheck: boolean;
  user: FirebaseUserModel;
  nameValue: string;
  private routeSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private tosService: TermsOfServiceService,
              private ppService: PrivacyPolicyService) { }

  async ngOnInit() {
    this.termsOfService = await this.tosService.getTerms();
    this.privacyPolicy = await this.ppService.getPolicy();

    this.routeSubscription = this.route.data.subscribe(routeData => {
      let user = routeData['user'];
      if (user) {
        this.user = user;
        this.nameValue = this.user.displayName;
        this.tosCheck = this.user.tosAccepted;
        this.ppCheck = this.user.privacyPolicyRead;
        console.log('tosCheck: ', this.tosCheck, ' ppCheck: ', this.ppCheck)

      }
    })
  }

  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
  }

  onSubmit(form: NgForm) {
    this.user.displayName = this.nameValue;
    this.user.tosAccepted = this.tosCheck;
    this.user.privacyPolicyRead = this.ppCheck;
    async this.userService.updateUser(this.user);
  }

}
