/* Official_verify*/
export class Official_verify {
    type: number
    desc: string
}

/* Label*/
export class Label {
    path: string
}

/* Vip*/
export class Vip {
    vipType: number
    vipDueDate: number
    dueRemark: string
    accessStatus: number
    vipStatus: number
    vipStatusWarn: string
    themeType: number
    label: Label
}

export class Following {
    mid: number
    attribute: number
    mtime: number
    tag: number[]
    special: number
    uname: string
    face: string
    sign: string
    official_verify: Official_verify
    vip: Vip
}

/* Data*/
export class Data {
    list: Following[]
    re_version: number
    total: number
}

export class FollowingResult {
    code: number
    message: string
    ttl: number
    data: Data
}

