import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as _ from 'lodash'
import { RoomService } from '../../../room/room.service'
import { AngularFireStorage } from '@angular/fire/storage';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../../../util/ngbd-modal-confirm/ngbd-modal-confirm.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-view-official',
  templateUrl: './view-official.component.html',
  styleUrls: ['./view-official.component.css']
})
export class ViewOfficialComponent implements OnInit {

  @Input() official:Official
  //@Input('cdkCopyToClipboard') text: string
  toastHack = false
  @Input() canSelect = false // button enablement
  @Input() canDelete = false // button enablement
  @Input() inputCollapsed = true
  currentUrl: string

  constructor(private roomService: RoomService, 
              @Inject(PLATFORM_ID) private platformId,
              private _modalService: NgbModal,
              private router: Router,
              private afStorage: AngularFireStorage) { }

  async ngOnInit() {
      if(isPlatformBrowser(this.platformId)) {
          this.currentUrl = window.location.href


          if(this.official && !this.official.photoUrl) {
              let url = await this.afStorage.storage
                          .refFromURL('gs://'+environment.firebase.storageBucket+'/thumb_profile-pic-default.png')
                          .getDownloadURL()
                          // .then(url => {
                          //     console.log("this.photoURL = ", url)
                          //     this.photoURL = url;
                          //     this.isUploading = false;
                          //   })
              this.official.photoUrl = url
          }



      }
  }

  // when copying to clipboard
  getOfficialInfo() {
      let name = `${this.official.name} (${this.official.party})\n`
      let addresses = '\n'
      _.each(this.official.address, address => {
          var addr = address.line1
          if(address.line2) addr += '\n'+address.line2
          if(address.line3) addr += '\n'+address.line3
          addr += `\n${address.city}, ${address.state} ${address.zip}\n`
          addresses += addr
      })
      let phones = '\n'
      _.each(this.official.phones, phone => {
          phones += phone+'\n'
      })
      let emails = '\n'
      _.each(this.official.emails, email => {
          emails += email+'\n'
      })
      let urls = '\n'
      _.each(this.official.urls, url => {
          urls += url+'\n'
      })
      let channels = '\n'
      _.each(this.official.channels, channel => {
          channels += channel.url+'\n'
      })
      return name+addresses+phones+emails+urls+channels

  }


  selectOfficial() {
      this.roomService.officialSelected(this.official)
  }


  deleteOfficial() {
      this.roomService.officialDeleted(this.official)
  }
  

  /**
   * pop up modal with content that can be copied and posted to social media
   * 
   * channel.type = YouTube, Facebook, Twitter
   */
  // popSocialMedia(channel,/*callback*/) {
  //     const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});
  //     modalRef.result.then(async (result) => {
  //       // the ok/delete case
  //       // this.closeResult = `Closed with: ${result}`;

  //       // so that we get updated memberCount and leaderCount
  //       // this.team = await this.teamService.deleteTeamMember(team_member);
  //       // callback();
  //     }, (reason) => {
  //       // the cancel/dismiss case
  //       // this.closeResult = `Dismissed ${reason}`;
  //     });
  //     return modalRef;
  // }
  


  //  ngbd-modal-confirm.component.ts
  //  ngbd-modal-confirm.component.html
  popSocialMedia(channel) {      
      var modalRef = this.showOkDialog(() => {/*noop*/});
      modalRef.componentInstance.title = '@'+channel.id;
      modalRef.componentInstance.question = '';
      modalRef.componentInstance.thing = this.currentUrl;
      modalRef.componentInstance.warning_you = '';
      modalRef.componentInstance.really_warning_you = '';
      modalRef.componentInstance.confirmText = 'Copy';
  }



  showOkDialog(callback) {
      //  ngbd-modal-confirm.component.ts
      //  ngbd-modal-confirm.component.html
      const modalRef = this._modalService.open(NgbdModalConfirmComponent, {ariaLabelledBy: 'modal-basic-title'});

      modalRef.result.then(async (result) => {
        // the ok/delete case
        // this.closeResult = `Closed with: ${result}`;

        // so that we get updated memberCount and leaderCount
        // this.team = await this.teamService.deleteTeamMember(team_member);
        callback();
      }, (reason) => {
        // the cancel/dismiss case
        // this.closeResult = `Dismissed ${reason}`;
      });
      
      modalRef.componentInstance.showCancelButton = false // hides the Cancel button
      modalRef.componentInstance.danger = false // makes the OK button gray instead of red
      return modalRef;
  }


  /***************
  doToast() {
      console.log('toastHack');
      this.toastHack = true
      setTimeout(this.timer.bind(this) , 1000)
  }


  timer() {
      this.toastHack = false      
      console.log('toastHack:  ', this.toastHack);
  }
  **************/

}





export class Divisions {
  [key:string]: { name?: string,  officeIndices?:number[] }
}


export class Office {
  name?:string
  divisionId?:string
  levels?:string[]
  roles?:string[]
  officialIndices?: number[]
}


export class Official {
  name: string
  address: {line1:string, line2?:string, line3?:string, city?:string, state?:string, zip?:string}[]
  party?: string
  phones?: string[]
  urls?: string[]
  photoUrl?: string
  emails?: string[]
  channels?: {type?:string, id?:string, url?:string, icon?: string, color_class?:string}[]
  // url is determined in search-officials.component.ts:execute()
  // icon is determined above
}


export class Committee {
  id: string // the doc id
  name: string
  officials?: Official[]
}


export class CivicResult {
  normalizedInput?: {line1:string, line2?:string, city?:string, state?:string, zip?:string}
  kind: string
  divisions?: Divisions
  offices?: Office[]
  officials?: Official[]
}
