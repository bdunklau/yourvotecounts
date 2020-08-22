export class RoomObj {
    
    RoomSid: string
    created_ms: number
    guests: {guestName: string, guestPhone: string, joined_ms?: number}[]
    hostId: string
    hostName: string
    hostPhone: string
    host_joined_ms?: number
    invitationId: string
    call_ended_ms?: number

    constructor() {

    }

    
}
