
import { Official } from '../civic/officials/view-official/view-official.component'
import * as _ from 'lodash'
import { FirebaseUserModel } from '../user/user.model'


export class RoomObj {
    
/**
 * We don't really have to specify every attribute
 * We can just do stuff like  roomObj['whatever_attribute'] instead of declaring a whatever_attribute field
 * 
 * If we want to do something like  roomDoc.data() as RoomObj, THEN WE DO HAVE TO DEFINE FIELDS EXPLICITLY
 */

    CompositionSid?: string
    compositionFile?: string // /home/bdxxxxxxxxxx/videos/CJxxxxxxxxxxxxxx.mp4
    RoomSid: string
    call_ended_ms?: number
    created_ms: number
    guests?: {guestName: string, guestPhone: string, joined_ms?: number}[]
    hostId: string
    hostName: string
    hostPhone: string
    host_joined_ms?: number
    host_left_ms?: number
    invitationId: string
    outputFile?: string     // /home/bdxxxxxxxxxx/videos/CJxxxxxxxxxxxxxx-output.mp4
    videoUrl?: string
    videoUrlAlt?: string
    video_title?: string
    video_description?: string
    //mark_time: {"start_recording_ms": number, "start_recording": string, "duration": string}[]
    officials?: Official[]
    screenshotUrl?: string
    storageItems?: {bucketName: string, folder: string, filename: string}[]
    tags?: string[] = []
    tempEditFolder?: string
    uploadFiles?: string[]
    views = 0

    constructor() {

    }


    isHost(user: FirebaseUserModel) {
        return user && this.hostPhone == user.phoneNumber
    }

    isGuest(user: FirebaseUserModel) {
        if(!user || !this.guests || this.guests.length == 0)
            return false
        let found = _.find(this.guests, guest => {
            return guest.guestPhone == user.phoneNumber
        })
        if(found) return true
        else return false
    }
    
}
