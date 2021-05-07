

/**
 * ng generate class tag/tag --type=model
 */
export class Tag {
    name: string
    name_lowerCase: string // to make sorting make sense
    count: number
    deleting?: boolean
}
