import { Injectable } from '@angular/core';
import { SettingsService } from 'src/app/settings/settings.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { CivicResult, Official, Committee } from '../officials/view-official/view-official.component';
import * as _ from 'lodash'

declare var gapi: any;



@Injectable({
  providedIn: 'root'
})
export class CommitteeService {

    constructor(
      private settingsService: SettingsService,
      private afs: AngularFirestore,) { 
          
            this.settingsService.getSettingsDoc().then(settings => {
                gapi.load("client");
                /**
                 * Sample JavaScript code for civicinfo.representatives.representativeInfoByAddress
                 * See instructions for running APIs Explorer code samples locally:
                 * https://developers.google.com/explorer-help/guides/code_samples#javascript
                 */
                gapi.client.setApiKey(settingsService.keys.civic_information_api_key); // get this key in SettingsGuard

                gapi.client.load("https://civicinfo.googleapis.com/$discovery/rest?version=v2")
                    .then(function() { console.log("GAPI client loaded for API"); },
                            function(err) { console.error("Error loading GAPI client for API", err); });

            })
      }


    async addOfficial(arg: {ocdId: string, committee: Committee}) {
        
        let obj = await gapi.client.civicinfo.representatives.representativeInfoByDivision(arg)

        let civicResult = obj.result as CivicResult

        // duplicated from search-officials.component
        _.each(civicResult.officials, official => {
            // TODO total hack
            if(official.photoUrl && official.photoUrl.startsWith('http://www.house.state.tx.us')) {
                let step1 = official.photoUrl.substring('http://www.house.state.tx.us'.length)
                let step2 = 'https://house.texas.gov/'+step1
                official.photoUrl = step2
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

        let newOfficial = civicResult.officials[0]; // should be exactly one
        if(!arg.committee.officials) arg.committee.officials = []
        arg.committee.officials.push(newOfficial)
        this.afs.collection('committee').doc(arg.committee.id).update({'officials': arg.committee.officials})
    }

      
    
    getCommittees() {
        let query = ref => ref.orderBy('name', 'asc')
        return this.afs.collection('committee', query).snapshotChanges()

        // ex from logs:  ref = ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc').startAt(this.dates.date2).endAt(this.dates.date1);
    }
}
