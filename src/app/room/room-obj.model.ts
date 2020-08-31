export class RoomObj {
    
/**
 * We don't really have to specify every attribute
 * We can just do stuff like  roomObj['whatever_attribute'] instead of declaring a whatever_attribute field
 * 
 * If we want to do something like  roomDoc.data() as RoomObj, THEN WE DO HAVE TO DEFINE FIELDS EXPLICITLY
 */

    RoomSid: string
    created_ms: number
    guests: {guestName: string, guestPhone: string, joined_ms?: number}[]
    hostId: string
    hostName: string
    hostPhone: string
    host_joined_ms?: number
    host_left_ms?: number
    invitationId: string
    call_ended_ms?: number
    //mark_time: {"start_recording_ms": number, "start_recording": string, "duration": string}[]

    constructor() {

    }

    
}
