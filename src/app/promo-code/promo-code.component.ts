import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings/settings.service'
import { Settings } from '../settings/settings.model'
import * as _ from 'lodash'
import { UserService } from '../user/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.component.html',
  styleUrls: ['./promo-code.component.css']
})
export class PromoCodeComponent implements OnInit {

    settings: Settings
    promo_code: string
    invalidPromoCode = false

    constructor(private settingsService: SettingsService,
                private router: Router,
                private userService: UserService) { }

    async ngOnInit() {
        this.settings = await this.settingsService.getSettingsDoc()
    }


    async check_promo_code() {
        let found = _.find(this.settings.promo_codes, code => {
            return code === this.promo_code
        })
        console.log(`found ${this.promo_code}: ${found}`)
        if(found) {
            let user = await this.userService.getCurrentUser()
            user.promo_code = this.promo_code
            await this.userService.setPromoCode(user)
            this.router.navigate(['/invitations'])
        }
        else this.invalidPromoCode = true
    }

}
