
/**
 * ng generate class license/licensee/licensee --type=model
 */
export class Licensee {
    id: string  // the doc id
    expiration_ms: number
    // expiration  // just for [(ngModel)] form binding in licensee-form.component.html ??
    name: string
    number_of_teams: number
    created_ms = new Date().getTime()
    
    constructor(args?: any) {
        if(!args) return
        if(args['id']) this.id = args['id']
        if(args['expiration_ms']) this.expiration_ms = args['expiration_ms']
        if(args['name']) this.name = args['name']
        if(args['number_of_teams']) this.number_of_teams = args['number_of_teams']
        if(args['created_ms']) this.created_ms = args['created_ms']
    }

    toObj(): any {
        return {id: this.id,
                created_ms: this.created_ms,
                expiration_ms: this.expiration_ms,
                name: this.name,
                number_of_teams: this.number_of_teams,
        }
    }
}
