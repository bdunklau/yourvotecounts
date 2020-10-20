import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../core/message.service';


@Component({
  selector: 'app-recording-indicator',
  templateUrl: './recording-indicator.component.html',
  styleUrls: ['./recording-indicator.component.css']
})
/**
 * created:   ng g c video/recording-indicator --module app
 * 
 * This is the little "recording" indicator that you see in the top banner when 
 * recording is on
 */
export class RecordingIndicatorComponent implements OnInit {

    
    recording_state = "" // "recording", "paused", "stopped" GUESTS NEVER SEE "stopped", just ""  more...
                          /**
                           * video-call.component.ts:monitorRoom() is where guests are notified of changing 'recording_state'
                           * When the host click Stop recording, the value that gets saved to the Room doc is actually just ''
                           * not 'stopped' 
                           */

    constructor(
      private messageService: MessageService) { }

    ngOnInit(): void {
        var indication = function(value) {
            this.recording_state = value
        }.bind(this)


        this.messageService.listenForRecordingStatus().subscribe({
          next: indication,
          error: function(value) {
          },
          complete: function() {
          }
      })
    }

}
