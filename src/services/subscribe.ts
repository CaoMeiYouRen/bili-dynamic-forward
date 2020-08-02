import fs = require('fs-extra')
import _ from 'lodash'
import { Subscribe, Subscriber, CQError, SubscribeError, SubscribeType } from '@/models'
import { getUsernameFromUID, getAllFollowings } from './helper'
import { globalCache, SUBSCRIBE_LIST } from '@/db'
import { getBiliDynamic } from './dynamic'
import { getVupAndVtuberList } from './dd'
import { ENABLE_DAY, FREE_TIMES } from '@/config'

getSubscribeList().then(async list => {
    list = _.uniq(list)
    for (let i = 0; i < list.length; i++) {
        const e = list[i]
        if (!e.userName) {
            e.userName = await getUsernameFromUID(e.userId)
        } else {
            const key = `bili-username-from-uid-${e.userId}`
            await globalCache.set(key, e.userName, 3600 * 24 * 7)
        }
        SUBSCRIBE_LIST.push(e)
    }
})

/**
 * 保存 订阅列表
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 */
export async function saveSubscribeList(list: Subscribe[]) {
    if (!(await fs.pathExists('data'))) {
        await fs.mkdir('data')
    }
    await fs.writeFile('data/subscribeList.json', JSON.stringify(list, null, 4))
}
/**
 * 读取订阅列表
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @returns {Promise<Subscribe[]>}
 */
export async function getSubscribeList(): Promise<Subscribe[]> {
    if (!(await fs.pathExists('data/subscribeList.json'))) {
        return []
    }
    return fs.readJSON('data/subscribeList.json')
}
/**
 * 订阅指定up
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @param {number} userId 要订阅的up主uid
 * @param {number} subId 订阅者的qq或群号
 * @param {string} subType 订阅类型 personal/group
 * @param {string} [userName]
 */
export async function subscribeUp(userId: number, subId: number, subType: string, userName?: string) {
    let sub = SUBSCRIBE_LIST.find((e => e.userId === userId))
    if (!sub) {
        if (!userName) {
            userName = await getUsernameFromUID(userId)
        }
        sub = new Subscribe({
            userId,
            userName,
            lastDynamic: Date.now(),
            lastLive: Date.now(),
            subscribers: [
                {
                    subId,
                    subType,
                },
            ],
        })
        SUBSCRIBE_LIST.push(sub)
        await saveSubscribeList(SUBSCRIBE_LIST)
        return sub
    }
    let suber = sub.subscribers.find(e => e.subId === subId && e.subType === subType)
    if (suber) { // 已经订阅了
        throw new CQError('该 up 已订阅，请勿重复订阅')
    }
    suber = new Subscriber({ subId, subType })
    sub.subscribers.push(suber)
    await saveSubscribeList(SUBSCRIBE_LIST)
    return sub
}
/**
 * 订阅转移。
 * 由于 api 限制只能转移前 250 个
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {number} userId 要转移的用户的uid
 * @param {number} subId 订阅者的qq或群号
 * @param {string} subType 订阅类型 personal/group
 * @param {number} [tag] 分组tag
 */
export async function transferSubscribeUp(userId: number, subId: number, subType: string, tag?: number) {
    const followings = await getAllFollowings(userId, tag)
    for (let i = 0; i < followings.length; i++) {
        const e = followings[i]
        try {
            await subscribeUp(e.mid, subId, subType, e.uname)
        } catch (error) {
        }
    }
    return followings.length
}


/**
 * 取消订阅指定up
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @param {number} userId 要取消订阅的up主uid
 * @param {number} subId 取消订阅者的qq或群号
 * @param {string} subType 订阅类型 personal/group
 */
export async function unsubscribeUp(userId: number, subId: number, subType: string) {
    const sub = SUBSCRIBE_LIST.find((e => e.userId === userId))
    if (!sub) {
        throw new CQError('该 up 未被任何用户订阅')
    }
    const suber = sub.subscribers.find(e => e.subId === subId && e.subType === subType)
    if (suber) {
        _.pull(sub.subscribers, suber)
        if (sub.subscribers.length === 0) {
            _.pull(SUBSCRIBE_LIST, sub)
        }
        await saveSubscribeList(SUBSCRIBE_LIST)
        return sub
    }
    throw new CQError('您尚未订阅该 up')
}

/**
 * 取消全部订阅
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @param {number} subId 取消订阅者的qq或群号
 * @param {string} subType 订阅类型 personal/group
 */
export async function unsubscribeAllUp(subId: number, subType: string) {
    const subs = SUBSCRIBE_LIST.filter(e => {
        return e.subscribers.find(f => {
            return f.subId === subId && f.subType === subType
        })
    })
    if (subs.length === 0) {
        throw new CQError('您尚未订阅任何 up')
    }
    for (let i = 0; i < subs.length; i++) {
        const sub = subs[i]
        try {
            await unsubscribeUp(sub.userId, subId, subType)
        } catch (error) {

        }
    }
    return true
}

/**
 * 一键DD
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {number} subId
 * @param {string} subType
 * @param {number} [limit=20]
 * @returns
 */
export async function oneClickDD(subId: number, subType: string, limit: number = 20) {
    const vups = await getVupAndVtuberList(limit)
    for (let i = 0; i < vups.length; i++) {
        const e = vups[i]
        try {
            await subscribeUp(e.mid, subId, subType, e.name)
        } catch (error) {
        }
    }
    return vups.length
}

/**
 * 查询用户订阅情况
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {number} subId
 * @param {string} subType
 */
export async function querySubscribe(subId: number, subType: string) {
    return SUBSCRIBE_LIST.filter(e => {
        return e.subscribers.find(f => {
            return f.subId === subId && f.subType === subType
        })
    })
}
/**
 * 取未被推送的动态数组
 *
 * @author CaoMeiYouRen
 * @date 2020-06-19
 * @export
 * @param {number} userId
 * @param {number} lastDynamic
 * @param {number} [limit=3]
 * @returns
 */
export async function getNotPushDynamic(userId: number, lastDynamic: number, limit: number = 3) {
    const channel = await getBiliDynamic(userId)
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    const [a, b] = FREE_TIMES
    if (a > b) { // 开始时间比结束早
        b.setHours(b.getHours() + 24)// 给 b 加24小时到第二天
    }
    const aMin = a.getHours() * 60 + a.getMinutes()
    const bMin = b.getHours() * 60 + b.getMinutes()
    if (aMin <= nowMins && nowMins <= bMin) { // 在免打扰时间内
        return []
    }
    if (!channel || !ENABLE_DAY.includes(new Date().getDay())) { // 如果当前时间不在推送周期内则跳过
        return []
    }
    return channel?.item.filter(e => {
        if (!e.pubDate) {
            return false
        }
        const pubDate = new Date(e.pubDate).getTime()
        return pubDate > lastDynamic && (Date.now() - pubDate < 1000 * 60 * 60 * 24) // 获取一天内的动态
    }).reverse().slice(0, limit)
}
