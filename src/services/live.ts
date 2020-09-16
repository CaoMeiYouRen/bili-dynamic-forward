import fs = require('fs-extra')
import _ = require('lodash')
import { globalCache, filestore } from '@/db'
import { ajax } from '@/utils/ajax'
import { RssChannel, BiliRoom } from '@/models'
import { BiliLiveResult, BiliLive } from '@/models/BiliLive'
import { getRoomIdFromUID } from './helper'
import { CQImage } from 'cq-websocket'
import { timeFormat, removeHtmlTag } from '@/utils'

/**
 * 获取直播间信息
 *
 * @author CaoMeiYouRen
 * @date 2020-06-23
 * @export
 * @param {number} roomid
 */
export async function getBiliLiveFromRoomid(roomid: number): Promise<BiliLive> {
    // let room_id = await getRoomIdFromUID(uid)
    const result = await ajax('https://api.live.bilibili.com/room/v1/Room/get_info', {
        room_id: roomid,
        from: 'room',
    }, {}, 'GET', {
        Referer: `https://live.bilibili.com/${roomid}`,
    })
    return result.data?.data
}

export async function getBiliLive(roomid: number) {
    // let room_id = await getRoomIdFromUID(uid)
    const result = await ajax('https://api.live.bilibili.com/room/v1/Room/get_info', {
        room_id: roomid,
        from: 'room',
    }, {}, 'GET', {
        Referer: `https://live.bilibili.com/${roomid}`,
    })
    const data: BiliLive = result.data?.data
    if (!data) {
        return
    }
    return new RssChannel({
        title: data.title,
        link: `https://live.bilibili.com/${roomid}`,
        description: data.description,
        lastBuildDate: data.live_time !== '0000-00-00 00:00:00' ? new Date(data.live_time) : undefined,
        item: [],
    })
}

/**
 * 判断某位用户是否在直播
 *
 * @author CaoMeiYouRen
 * @date 2020-06-23
 * @export
 * @param {number} uid
 */
export async function isLive(uid: number) {
    const result = await ajax('https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld', {
        mid: uid,
    }, {}, 'GET', {
        Referer: `https://space.bilibili.com/${uid}/`,
    })
    const data: BiliRoom = result.data?.data
    if (!data) {
        return false
    }
    const key = `bili-roomid-from-uid-${uid}`
    const roomid = data.roomid
    await filestore.set(key, roomid)
    return Boolean(data.liveStatus)
}

/**
 * 判断某位用户是否新开播
 *
 * @author CaoMeiYouRen
 * @date 2020-06-23
 * @export
 * @param {number} uid
 */
export async function isNewLive(uid: number) {
    if (!await isLive(uid)) { // 如果未开播直接返回false
        return false
    }
    const roomid = await getRoomIdFromUID(uid)
    if (!roomid) {
        return false
    }
    const key = `bili-room-from-roomid-${roomid}`
    const newRoom: BiliLive = await getBiliLiveFromRoomid(roomid)
    if (!newRoom) {
        return false
    }
    const oldRoom: BiliLive = await filestore.get(key, 'live')
    // 如果不存在旧的直播间信息或开播时间不同则为新开播
    if (!oldRoom || oldRoom.live_time !== newRoom.live_time) {
        const { live_time } = newRoom
        await filestore.set(key, { live_time }, 'live')
        return newRoom
    }
    return false
}

export function biliLiveFormat(userName: string, live: BiliLive) {
    let text = `检测到您关注的B站up主 ${userName} 开播了\n`
    text += `${removeHtmlTag(live.title)}\n`
    text += `${removeHtmlTag(live.description)}\n`
    let cover = live.user_cover
    if (!cover.includes('@')) { // 开启图片压缩
        cover += '@518w_1e_1c.png'
    }
    text += `${new CQImage(cover).toString()}\n`
    text += `直播间地址：https://live.bilibili.com/${live.room_id}\n`
    text += `开播时间：${timeFormat(live.live_time)}`
    return text.replace(/(\n[\s|\t]*\r*\n)/g, '\n')
}