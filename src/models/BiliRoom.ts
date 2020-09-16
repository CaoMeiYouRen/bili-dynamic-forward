export class BiliRoom {
    roomStatus: number
    roundStatus: number
    liveStatus: number
    url: string
    title: string
    cover: string
    online: number
    roomid: number
    broadcast_type: number
    online_hidden: number
}

export class BiliRoomResult {
    code: number
    message: string
    ttl: number
    data: BiliRoom
}