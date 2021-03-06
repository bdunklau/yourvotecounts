import { Component, OnInit, AfterViewInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import * as _ from 'lodash'
import { Divisions, Office, Official, CivicResult } from '../view-official/view-official.component'
import { RoomService } from '../../../room/room.service'
import { SettingsService } from '../../../settings/settings.service'
import { isPlatformBrowser } from '@angular/common';
import { Settings } from '../../../settings/settings.model';


declare var gapi: any;


@Component({
  selector: 'app-search-officials',
  templateUrl: './search-officials.component.html',
  styleUrls: ['./search-officials.component.css']
})
export class SearchOfficialsComponent implements OnInit {

    // @ViewChild("placesRef") placesRef : GooglePlaceDirective;
    officialType:string = "Federal" 
    civicResult: CivicResult
    @Input() inputCollapsed = true
    settings: Settings

    
    parms = {
        "Federal": {
          address: "",
          includeOffices: true,
          levels: ["country"],
          roles: ["legislatorLowerBody", "legislatorUpperBody"]
        },
        "State": {
          address: "",
          includeOffices: true,
          levels: ["administrativeArea1", "administrativeArea2"],
          roles: ["legislatorLowerBody", "legislatorUpperBody"]
        },
        // local:  levels and roles unknown
    }

    constructor(private roomService: RoomService,
                @Inject(PLATFORM_ID) private platformId,
                private settingsService: SettingsService) { }


    async ngOnInit() {
        
        if(isPlatformBrowser(this.platformId)) {
            this.settings = await this.settingsService.getSettingsDoc()
            gapi.load("client");
            //this.loadClient()
            
            /**
             * Sample JavaScript code for civicinfo.representatives.representativeInfoByAddress
             * See instructions for running APIs Explorer code samples locally:
             * https://developers.google.com/explorer-help/guides/code_samples#javascript
             */
            gapi.client.setApiKey(this.settingsService.keys.civic_information_api_key); // get this key in SettingsGuard
            //console.log('this.settingsService.keys.civic_information_api_key:  ', this.settingsService.keys.civic_information_api_key)

            return gapi.client.load("https://civicinfo.googleapis.com/$discovery/rest?version=v2")
                .then(function() { console.log("GAPI client loaded for API"); },
                        function(err) { console.error("Error loading GAPI client for API", err); });
        
        }
    }

  
  
    title = 'rou'; 
    //Local Variable defined 
    formattedaddress=" "; 

    /**
     * for address field
     * https://www.geeksforgeeks.org/how-to-add-google-locations-autocomplete-to-your-angular-application/
     */
    options={ 
        componentRestrictions:{ 
            country:["US"] 
        } 
    } 



    /**
     * for address field
     * https://www.geeksforgeeks.org/how-to-add-google-locations-autocomplete-to-your-angular-application/
     */
    public AddressChange(address: any) { 
        //setting address from API to local variable 
        console.log('address:  ', address)
        this.formattedaddress=address.formatted_address 
    } 


    getOfficials() {
        console.log('officialType:  ', this.officialType)
        console.log('parms:  ', this.parms[this.officialType])

        this.execute()

    }



    /**
     * Sample JavaScript code for civicinfo.representatives.representativeInfoByAddress
     * See instructions for running APIs Explorer code samples locally:
     * https://developers.google.com/explorer-help/guides/code_samples#javascript
     */

    // loadClient() {
    //   gapi.client.setApiKey(this.settingsService.keys.civic_information_api_key); // get this key in SettingsGuard
    //   //console.log('this.settingsService.keys.civic_information_api_key:  ', this.settingsService.keys.civic_information_api_key)

    //   return gapi.client.load("https://civicinfo.googleapis.com/$discovery/rest?version=v2")
    //       .then(function() { console.log("GAPI client loaded for API"); },
    //             function(err) { console.error("Error loading GAPI client for API", err); });
    // }
    
    
    // Make sure the client is loaded before calling this method.
    async execute() {        
        if(isPlatformBrowser(this.platformId)) {

            let obj = await gapi.client.civicinfo.representatives.representativeInfoByAddress({
            "address": this.formattedaddress,
            "includeOffices": true,
            "levels": this.parms[this.officialType]['levels'],
            "roles": [
                "legislatorUpperBody",
                "legislatorLowerBody",
                "headOfState",
                "headOfGovernment",
                "deputyHeadOfGovernment",
                "governmentOfficer"
            ]
            })
            this.civicResult = obj.result as CivicResult
            console.log("this.civicResult  :  ", this.civicResult );

            // duplicated from committee.service
            _.each(this.civicResult.officials, official => {
                // TODO total hack
                //  Example:  http://www.house.state.tx.us/photos/members/3205.jpg
                if(official.photoUrl && official.photoUrl.startsWith('http://www.house.state.tx.us/')) {
                    let step1 = official.photoUrl.substring('http://www.house.state.tx.us/'.length)
                    let step2 = 'https://house.texas.gov/'+step1
                    official.photoUrl = step2
                    console.log('NEW PHOTO URL: ', official.photoUrl)
                }
                _.map(official.channels, channel => {
                    channel.url = `https://www.${channel.type}.com/${channel.id}`
                    channel.color_class = ''
                    if(channel.type.toLowerCase() === 'facebook') {
                        channel.icon = "fab fa-facebook-f"
                        channel.color_class = 'facebook_color'
                    }
                    if(channel.type.toLowerCase() === 'twitter') {
                        channel.icon = "fab fa-twitter"
                        channel.color_class = 'twitter_color'
                    }
                    if(channel.type.toLowerCase() === 'youtube') {
                        channel.icon = "fab fa-youtube"
                        channel.color_class = 'youtube_color'
                    }
                    if(channel.type.toLowerCase() === 'instagram') {
                        channel.icon = "fab fa-instagram"
                        channel.color_class = 'instagram_color'
                    }
                })
            }) 
            
        }
    }


}

