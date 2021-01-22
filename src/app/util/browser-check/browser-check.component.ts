import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash'
import { NgbdModalConfirmComponent } from '../ngbd-modal-confirm/ngbd-modal-confirm.component';

@Component({
  selector: 'app-browser-check',
  templateUrl: './browser-check.component.html',
  styleUrls: ['./browser-check.component.css']
})
export class BrowserCheckComponent implements OnInit {

  stuff = []
  micAllowed = 0      // 1=allowed, -1=not allowed, 0=not decided yet
  cameraAllowed = 0   // 1=allowed, -1=not allowed, 0=not decided yet


  constructor(
    private _modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            
            let cam = await this.testCamera()
            let mic = await this.testMic()
            console.log(`ngOnInit():  camera = ${cam}`)
            console.log(`ngOnInit():  mic = ${mic}`)
            let regardless = false
            if((cam == -1) || (mic == -1) || regardless)
                this.popDialog(cam, mic)
        }
    }

    


  async testMic() {
    let loc = 'testMic()'
      this.stuff.push(`${loc}: begin`)
      let allow = async function(allowed) {
          this.micAllowed = allowed
          let p = new Promise((resolve, reject) => {resolve(allowed)})
          return p
      }.bind(this)

      let success = async function(stream) {
          this.stuff.push(`${loc}: allowed`)
          console.log('You let me use your mic!')
          return await allow(1)
      }.bind(this)

      let err = async function(err) {
          this.stuff.push(`${loc}: err`)
          console.log('No mic for you!')
          return await allow(-1)
      }.bind(this)

      if(navigator) {
          if(navigator.mediaDevices) {
              if(navigator.mediaDevices.getUserMedia) {
                  return navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(success)
                    .catch(err);
                  // this.stuff.push(`${loc}: end`)
              }
              else {
                  this.stuff.push(`${loc}: no getUserMedia`)
                  return -1
              }
          }
          else {
              this.stuff.push(`${loc}: no mediaDevices`) // FALLING TO HERE
              return -1
          }
      }
      else {
          this.stuff.push(`${loc}: no navigator`)
          return -1
      }

  }


  async testCamera() {
      let loc = 'testCamera()'
      this.stuff.push(`${loc}: begin`)
      let allow = function(allowed) {
          this.cameraAllowed = allowed
          let p = new Promise((resolve, reject) => {resolve(allowed)})
          return p
      }.bind(this)

      let success = async function(stream) {
          this.stuff.push(`${loc}: allowed`)
          console.log('You let me use your camera!')
          return await allow(1)
      }.bind(this)

      let err = async function(err) {
          this.stuff.push(`${loc}: err`)
          console.log('No camera for you!')
          return await allow(-1)
      }.bind(this)

      if(navigator) {
          if(navigator.mediaDevices) {
              if(navigator.mediaDevices.getUserMedia) {
                  return navigator.mediaDevices.getUserMedia({ video: true })
                    .then(success)
                    .catch(err);
                  // this.stuff.push(`${loc}: end`)
              }
              else {
                  this.stuff.push(`${loc}: no getUserMedia`)
                  return -1
              }
          }
          else {
              this.stuff.push(`${loc}: no mediaDevices`) // FALLING TO HERE
              return -1
          }
      }
      else {
          this.stuff.push(`${loc}: no navigator`)
          return -1
      }
  }

  

  //  ngbd-modal-confirm.component.ts
  //  ngbd-modal-confirm.component.html
  popDialog(cam, mic) {    
      let camEnabled = cam == 1 ? 'enabled' : 'not allowed'
      let micEnabled = mic == 1 ? 'enabled' : 'not allowed'
      let blocked = []
      let titleParts = []
      if(cam != 1) {blocked.push('camera'); titleParts.push('Camera'); }
      if(mic != 1) {blocked.push('microphone'); titleParts.push('Mic'); }
      let blockedMedia = _.join(blocked, ' and ')
      let blockedTitle = _.join(titleParts, '/')
      let msg = "Your device is preventing this browser from using your "+blockedMedia+". If you are not using the standard browser for your device (i.e. Safari on iPhones), we suggest trying HeadsUp on your device's standard browser.  We apologize for the inconvenience."
      // This browser is not allowed to use your camera and it is not allowed to use your microphone. If you are not using the standard browser for your device (i.e. Safari on iPhones), we suggest trying HeadsUp on your device's standard browser.  We apologize for the inconvenience.

      var modalRef = this.showOkDialog(() => {/*noop*/});
      modalRef.componentInstance.title = blockedTitle+' Problem';
      modalRef.componentInstance.question = ''
      modalRef.componentInstance.thing = ''
      modalRef.componentInstance.warning_you = msg
      modalRef.componentInstance.really_warning_you = '';
      modalRef.componentInstance.confirmText = 'OK';
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
  

}
