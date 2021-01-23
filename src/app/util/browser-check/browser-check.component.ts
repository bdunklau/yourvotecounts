import { Component, OnInit, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
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
  
  @Output()  outputMediaResults = new EventEmitter<boolean>();


  constructor(
    private _modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            
            // let cam = await this.testCamera()
            // let mic = await this.testMic()
            // console.log(`ngOnInit():  camera = ${cam}`)
            // console.log(`ngOnInit():  mic = ${mic}`)
            // let regardless = false
            // if((cam == -1) || (mic == -1) || regardless) {
            //     this.outputMediaResults.emit(false)
            //     this.popDialog(cam, mic)
            // }
        }
    }

    


  // async testMic() {
  //   let loc = 'testMic()'
  //     this.stuff.push(`${loc}: begin`)
  //     let allow = async function(allowed) {
  //         this.micAllowed = allowed
  //         let p = new Promise((resolve, reject) => {resolve(allowed)})
  //         return p
  //     }.bind(this)

  //     let success = async function(stream) {
  //         this.stuff.push(`${loc}: allowed`)
  //         console.log('You let me use your mic!')
  //         return await allow(1)
  //     }.bind(this)

  //     let err = async function(err) {
  //         this.stuff.push(`${loc}: err`)
  //         console.log('No mic for you!')
  //         return await allow(-1)
  //     }.bind(this)

  //     if(navigator) {
  //         if(navigator.mediaDevices) {
  //             if(navigator.mediaDevices.getUserMedia) {
  //                 return navigator.mediaDevices.getUserMedia({ audio: true })
  //                   .then(success)
  //                   .catch(err);
  //                 // this.stuff.push(`${loc}: end`)
  //             }
  //             else {
  //                 this.stuff.push(`${loc}: no getUserMedia`)
  //                 return -1
  //             }
  //         }
  //         else {
  //             this.stuff.push(`${loc}: no mediaDevices`) // FALLING TO HERE
  //             return -1
  //         }
  //     }
  //     else {
  //         this.stuff.push(`${loc}: no navigator`)
  //         return -1
  //     }

  // }


  // async testCamera() {
  //     let loc = 'testCamera()'
  //     this.stuff.push(`${loc}: begin`)
  //     let allow = function(allowed) {
  //         this.cameraAllowed = allowed
  //         let p = new Promise((resolve, reject) => {resolve(allowed)})
  //         return p
  //     }.bind(this)

  //     let success = async function(stream) {
  //         this.stuff.push(`${loc}: allowed`)
  //         console.log('You let me use your camera!')
  //         return await allow(1)
  //     }.bind(this)

  //     let err = async function(err) {
  //         this.stuff.push(`${loc}: err`)
  //         console.log('No camera for you!')
  //         return await allow(-1)
  //     }.bind(this)

  //     if(navigator) {
  //         if(navigator.mediaDevices) {
  //             if(navigator.mediaDevices.getUserMedia) {
  //                 return navigator.mediaDevices.getUserMedia({ video: true })
  //                   .then(success)
  //                   .catch(err);
  //                 // this.stuff.push(`${loc}: end`)
  //             }
  //             else {
  //                 this.stuff.push(`${loc}: no getUserMedia`)
  //                 return -1
  //             }
  //         }
  //         else {
  //             this.stuff.push(`${loc}: no mediaDevices`) // FALLING TO HERE
  //             return -1
  //         }
  //     }
  //     else {
  //         this.stuff.push(`${loc}: no navigator`)
  //         return -1
  //     }
  // }

  
}
