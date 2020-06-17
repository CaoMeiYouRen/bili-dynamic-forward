import fs = require('fs-extra')
import _ from 'lodash'
import { Subscribe, Subscriber, SubscribeError, SubscribeType } from '@/models'
import { getUsernameFromUID, getAllFollowings } from './helper'

export const SUBSCRIBE_LIST: Subscribe[] = []

getSubscribeList().then(async list => {
    list = _.uniq(list)
    for (let i = 0; i < list.length; i++) {
        const e = list[i]
        if (!e.userName) {
            e.userName = await getUsernameFromUID(e.userId)
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
    if (!(await fs.pathExists('data'))) {
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
        throw new SubscribeError('该 up 已订阅，请勿重复订阅')
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
        throw new SubscribeError('该 up 未被任何用户订阅')
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
    throw new SubscribeError('您尚未订阅该 up')
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
        throw new SubscribeError('您尚未订阅任何 up')
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

// setTimeout(async () => {
//     try {
//         let e = await subscribeUp(2, 996881204, SubscribeType.personal)
//         console.log(e)
//     } catch (error) {
//         if (error instanceof SubscribeError) {
//             console.log(error.message)
//         }
//     }
//     // try {
//     //     let e = await unsubscribeUp(2, 996881204, SubscribeType.personal)
//     //     console.log(e)
//     // } catch (error) {
//     //     if (error instanceof SubscribeError) {
//     //         console.log(error.message)
//     //     }
//     // }

// }, 2000)