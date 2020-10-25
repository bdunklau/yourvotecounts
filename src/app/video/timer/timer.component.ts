import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from '../../core/message.service';
import { SettingsService } from '../../settings/settings.service';
// import { ElapsedTimePipe } from '../../util/elapsed-time/elapsed-time.pipe'



/**
 *  ng g c video/timer --module app
 */
@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit {

    thetime = 0;
    // timeOnCall = 0

    constructor(
      private settingsService: SettingsService,
      private messageService: MessageService,
      @Inject(PLATFORM_ID) private platformId,) { }

    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
            // var bumpTime = function() {
            //     ++this.thetime
            // }.bind(this)

            // setInterval(() => bumpTime(), 1000);





            /**
             * This all kinda works but I don't need this component or another service
             * to keep track of time because everything happens in video-call.component.ts
             * I start the timer there when the host joins and I display a warning to the host only
             * when the warning time is reached.
             * Finally, I forcibly end the call there when max_call_time (secs) is reached
             */


            // let settings = await this.settingsService.getSettingsDoc()
            // let maxMinutes = settings.max_call_time / 60
            // let warnAt = maxMinutes - 1

            // var maxTimeWatcher = function() {
            //     ++this.timeOnCall
            //     // give a single warning at 1 minute before
            //     if(this.timeOnCall == warnAt) {
            //         this.messageService.timerEvent('warning time reached')
            //     }
            //     else if(this.timeOnCall == maxMinutes) {
            //         // forcibly end the call
            //         this.messageService.timerEvent('max time reached')
            //     }
            // }.bind(this)
            

            // setInterval(() => maxTimeWatcher(), 60000)
            
        }

    }

}
