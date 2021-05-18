import { Injectable } from '@angular/core';
import { UserService } from 'src/app/user/user.service';
import { FirebaseUserModel } from 'src/app/user/user.model';
import * as _ from 'lodash'
import { FirebaseUIAuthConfig } from 'firebaseui-angular';

@Injectable({
  providedIn: 'root'
})
export class FunctionalTestService {

    constructor(private userService: UserService) { }
  

    cameraBadMsg = 'Your camera is blocked by your device or browser.  Check your browser settings to see if camera access is being explicitly blocked.  You may also try a different browser or device.  HeadsUp works on most devices.'
    micBadMsg = 'Your microphone is blocked by your device or browser.  Check your browser settings to see if microphone access is being explicitly blocked.  You may also try a different browser or device.  HeadsUp works on most devices.'
     
  
    /**
     * This func should always check the actual device function and the write the results to db if there's a user
     */
    async testWebcam(): Promise<{passed: boolean, camera: boolean, camResult: string, mic: boolean, micResult: string, userAgent: string}> {
        let cameraEnabled = await this.turnOnCamera()
        let micEnabled = await this.turnOnMic()
        if(cameraEnabled) await this.turnOffCamera()
        if(micEnabled) await this.turnOffMic()
        // IF the user happens to be logged in, we record the enablements
        await this.recordCameraFunctionality(cameraEnabled)
        await this.recordMicFunctionality(micEnabled)
        return {passed: cameraEnabled && micEnabled, 
                camera: cameraEnabled, 
                camResult: cameraEnabled ? 'ok' : this.cameraBadMsg,
                mic: micEnabled, 
                micResult: micEnabled ? 'ok' : this.micBadMsg,
                userAgent: window.navigator.userAgent
              }

    }

    
    
    /**
     * Do we need to do a functional test, or does the user's db record already tell us about
     * camera, mic?
     * 
     * This function will tell us.  Look for a record in the db having the exact userAgent as the
     * current userAgent string.  If we find an exact match, we know that the user had previously
     * done a functional test on this device and this browser
     * 
     * NOTE: The user COULD change browser settings and we would never know it unless the user
     * ran through /functional-test again
     */
    needToCheckDevice(auser: FirebaseUserModel) {
        if(!auser.userAgents)  return true 
        if(!auser.cameraChecks) return true
        if(!auser.micChecks) return true

        if(auser.userAgents.length == 0)  return true 
        if(auser.cameraChecks.length == 0)  return true 
        if(auser.micChecks.length == 0)  return true 

        let userAgentFound = _.find(auser.userAgents, (agent) => { return agent == window.navigator.userAgent })
        if(!userAgentFound) return true
        
        let cameraAgentFound = _.find(auser.cameraChecks, (cameraCheck) => { return cameraCheck.userAgent == window.navigator.userAgent })
        if(!cameraAgentFound) return true
        
        let micAgentFound = _.find(auser.micChecks, (micCheck) => { return micCheck.userAgent == window.navigator.userAgent })
        if(!micAgentFound) return true
        
        return false
    }
    

    async allEnabledForUser(user: FirebaseUserModel): Promise<{passed: boolean, camera: boolean, camResult: string, mic: boolean, micResult: string, userAgent: string}> {
        let cameraEnabled = await this.isCameraEnabledForUser(user)
        let micEnabled = await this.isMicEnabledForUser(user)
        return {passed: cameraEnabled && micEnabled, 
                camera: cameraEnabled, 
                camResult: cameraEnabled ? 'ok' : this.cameraBadMsg,
                mic: micEnabled, 
                micResult: micEnabled ? 'ok' : this.micBadMsg,
                userAgent: window.navigator.userAgent
              }
    }

    
    /**
     * There may be a db record for this or may not
     * If there's no db record, then obviously we have to check the device now
     */
    async isCameraEnabledForUser(user: FirebaseUserModel) {
        let cameraEnablement = this.isCameraEnablementKnown(user)
        if(cameraEnablement.known) return cameraEnablement.enabled
        // otherwise, we have to figure that out now...    
        let cameraEnabled = await this.turnOnCamera()
        if(cameraEnabled) await this.turnOffCamera()
        //  ...and we have to record that in the db so we don't do this again
        await this.userService.recordCameraFunctionality(user, cameraEnabled)
        return cameraEnabled
    }


    /**
     * TODO Could this be a problem later?  If the user enables the camera, then later decides to block the camera,
     * we would never know.  We would be looking in the database for the last known setting.  What to do?
     */
    private isCameraEnablementKnown(user: FirebaseUserModel) {
        if(!user.cameraChecks) return {known: false}
        if(user.cameraChecks.length == 0) return {known: false}
        let items = _.filter(user.cameraChecks, function(o) { return o.userAgent == window.navigator.userAgent });
        if(!items || items.length == 0) return {known: false}
        let sortedAsc = _.sortBy(items, [function(o) { return o.cameraCheckDate_ms; }]);
        let sorted = _.reverse(sortedAsc)
        return {known: true, enabled: sorted[0].functional}
    }


    async isMicEnabledForUser(user: FirebaseUserModel) {
        let micEnablement = this.isMicEnablementKnown(user)
        if(micEnablement.known) return micEnablement.enabled
        // otherwise, we have to figure that out now...    
        let micEnabled = await this.turnOnMic()
        if(micEnabled) await this.turnOffMic()
        //  ...and we have to record that in the db so we don't do this again
        await this.userService.recordMicFunctionality(user, micEnabled)
        return micEnabled
    }


    /**
     * TODO Could this be a problem later?  If the user enables the camera, then later decides to block the camera,
     * we would never know.  We would be looking in the database for the last known setting.  What to do?
     */
    private isMicEnablementKnown(user: FirebaseUserModel) {
        if(!user.micChecks) return {known: false}
        if(user.micChecks.length == 0) return {known: false}
        let items = _.filter(user.micChecks, function(o) { return o.userAgent == window.navigator.userAgent });
        if(!items || items.length == 0) return {known: false}
        let sortedAsc = _.sortBy(items, [function(o) { return o.micCheckDate_ms; }]);
        let sorted = _.reverse(sortedAsc)
        return {known: true, enabled: sorted[0].functional}
    }


    
    async turnOnCamera(): Promise<boolean> {
        return await this.turnOnMedia({audio: true})
    }

    
    
    async turnOnMic(): Promise<boolean> {
        return await this.turnOnMedia({audio: true})
    }


    private async turnOnMedia(media): Promise<boolean> {
      return new Promise((resolve, reject) => {
          if(!navigator) return -1
          if(!navigator.mediaDevices) return -1
          if(!navigator.mediaDevices.getUserMedia) return -1

          navigator.mediaDevices.getUserMedia(media)
          .then(stream => { resolve(true) })
          .catch(err => { resolve(false) });
      })
    }
    


    async turnOffMic() {
        await this.turnOffMedia({audio:true})
    }



    async turnOffCamera() {
        await this.turnOffMedia({video:true})
    }


    private async turnOffMedia(media) {
        if(!navigator) return -1
        if(!navigator.mediaDevices) return -1
        if(!navigator.mediaDevices.getUserMedia) return -1

        let stream = await navigator.mediaDevices.getUserMedia(media)

        if(!stream) return
        let tracks = stream.getTracks();

        tracks.forEach(function (track) {
            track.stop();
        });
    }


    private async recordCameraFunctionality(bool: boolean) {
        let user = await this.userService.getCurrentUser()
        if(!user) return
        await this.userService.recordCameraFunctionality(user, bool)
    }


    private async recordMicFunctionality(bool: boolean) {
        let user = await this.userService.getCurrentUser()
        if(!user) return
        await this.userService.recordMicFunctionality(user, bool)
    }

}
