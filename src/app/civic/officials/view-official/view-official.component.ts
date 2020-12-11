import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as _ from 'lodash'
import { RoomService } from '../../../room/room.service'
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
  currentUrl: string

  constructor(private roomService: RoomService, 
              @Inject(PLATFORM_ID) private platformId,
              private router: Router) { }

  ngOnInit(): void {
      if(isPlatformBrowser(this.platformId)) {
          this.currentUrl = window.location.href
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


export class CivicResult {
  normalizedInput?: {line1:string, line2?:string, city?:string, state?:string, zip?:string}
  kind: string
  divisions?: Divisions
  offices?: Office[]
  officials?: Official[]
}
