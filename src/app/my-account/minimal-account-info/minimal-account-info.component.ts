import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { UserService } from '../../user/user.service';
import { TermsOfServiceService } from '../../terms-of-service/terms-of-service.service';
import { PrivacyPolicyService } from '../../privacy-policy/privacy-policy.service';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import { FirebaseUserModel } from '../../user/user.model'
import { isPlatformBrowser } from '@angular/common';


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
              private router: Router,
              @Inject(PLATFORM_ID) private platformId,
              private userService: UserService,
              private tosService: TermsOfServiceService,
              private ppService: PrivacyPolicyService) { }

  async ngOnInit() {
      if(isPlatformBrowser(this.platformId)) {

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
  }

  ngOnDestroy() {
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
  }

  onSubmit(/* not needed   form: NgForm*/) {
    this.user.displayName = this.nameValue;
    this.user.tosAccepted = this.tosCheck;
    this.user.privacyPolicyRead = this.ppCheck;
    this.userService.updateUser(this.user).then(() => {
      this.router.navigate(['/myaccount']);
    })
  }

}
