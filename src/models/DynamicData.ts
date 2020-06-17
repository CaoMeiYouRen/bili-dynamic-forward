export class User {
    uid: number
    uname: string
    face: string
}

/* Item*/
export class Item {
    rp_id: number
    uid: number
    content: string
    orig_dy_id: number
    pre_dy_id: number
    timestamp: number
    reply: number
}

/* Origin_user*/
export class Origin_user {
    info: User
}
/* Origin*/
export class Origin {
    user: User
    item: Item
}

export class Card {
    user: User
    item: Item
    origin?: Origin
    origin_user?: Origin_user
}

export class CardItem {
    desc: any
    card: Card
    extend_json: any
    extra: any
    display: any
}