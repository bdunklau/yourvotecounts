

/**
 * ng generate class comments/comment --type=model
 */
export class Comment {
    author: string
    authorId: string
    commentId: string // the doc id
    comment: string
    CompositionSid?: string
    date: Date
    date_ms: number
    RoomSid: string
    

    // do we really need this?
    // toObj(): any {
    //     let obj = {author: this.author,
    //         authorId: this.name,
    //                 created: this.created,
    //                 creatorId: this.creatorId,
    //                 creatorName: this.creatorName,
    //                 creatorPhone: this.creatorPhone,
    //                 memberCount: this.memberCount,
    //                 leaderCount: this.leaderCount};
    // }
}
