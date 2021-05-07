
/**
 *  ng generate class license/licensee-contact/licensee-contact --type=model
 */
export class LicenseeContact {
    id: string  // the doc id
    created_ms: number   // date the person became a licensee contact
    displayName: string
    licenseeId: string   // doc id of licensee org
    phoneNumber: string
    uid?: string   // present for registered users

    constructor(args?: any) {
        if(!args) return
        if(args['id']) this.id = args['id']
        if(args['created_ms']) this.created_ms = args['created_ms']
        if(args['displayName']) this.displayName = args['displayName']
        if(args['licenseeId']) this.licenseeId = args['licenseeId']
        if(args['phoneNumber']) this.phoneNumber = args['phoneNumber']
        if(args['uid']) this.uid = args['uid']
    }

    toObj(): any {
        let obj = {
            id: this.id,
            created_ms: this.created_ms,
            displayName: this.displayName,
            licenseeId: this.licenseeId,
            phoneNumber: this.phoneNumber
        }
        if(this.uid) obj['uid'] = this.uid 
        return obj
    }
}
