import { Subscribe, CQLog } from '@/models'
import { getNotPushDynamic, biliDynamicFormat, saveSubscribeList, isNewLive, biliLiveFormat } from '@/services'
import { sleep, sendMsg, sendGroupMsg, sendPrivateMsg, printTime } from '@/utils'
import { ENABLE_DAY, FREE_TIMES, IS_DEBUG, API_SLEEP_TIME, MSG_SLEEP_TIME, SLEEP_TIME, ENABLE_DINGTALK_PUSH, ENABLE_PUSH_LIST } from '@/config'
import { SUBSCRIBE_LIST } from '@/db'
import { dingtalk } from '@/utils/dingtalk'

/**
 * 当前是否为免打扰时间
 *
 * @author CaoMeiYouRen
 * @date 2020-11-01
 * @returns {boolean}
 */
function isFreeTime(): boolean {
    const now = new Date()
    let nowMins = now.getHours() * 60 + now.getMinutes()
    const [a, b] = FREE_TIMES
    const aMin = a.getHours() * 60 + a.getMinutes()
    let bMin = b.getHours() * 60 + b.getMinutes()
    if (a > b) { // 开始时间比结束晚，跨天
        bMin += 24 * 60 // 给 b 加24小时到第二天
        nowMins += 24 * 60 // 给 nowMins 加24小时到第二天
    }
    if (aMin <= nowMins && nowMins <= bMin) { // 在免打扰时间内
        return true
    }
    if (!ENABLE_DAY.includes(new Date().getDay())) { // 如果当前时间不在推送周期内则跳过
        return true
    }
    return false
}

/**
 * 向订阅者推送最新动态
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {Subscribe[]} list
 * @returns
 */
export async function pushDynamic(list: Subscribe[]) {
    for (let i = 0; i < list.length; i++) {
        const sub = list[i]
        const dynamics = await getNotPushDynamic(sub.userId, sub.lastDynamic)
        if (dynamics.length > 0) {
            for (let j = 0; j < dynamics.length; j++) {
                const d = dynamics[j]
                const suber = sub.subscribers
                const text = biliDynamicFormat(sub.userName, d)
                for (let k = 0; k < suber.length; k++) {
                    const s = suber[k]
                    if (ENABLE_PUSH_LIST.includes('coolq')) {
                        if (s.subType === 'group') {
                            await sendGroupMsg(s.subId, text)
                        } else {
                            await sendPrivateMsg(s.subId, text)
                        }
                    }
                    if (ENABLE_PUSH_LIST.includes('dingtalk') && ENABLE_DINGTALK_PUSH) {
                        const ddText = biliDynamicFormat(sub.userName, d, 'dingtalk')
                        const title = `检测到您关注的B站up主 ${sub.userName} 发布了新的动态`
                        await dingtalk(title, ddText)
                    }
                    await sleep(MSG_SLEEP_TIME)
                }
                list[i].lastDynamic = Date.now()
                await saveSubscribeList(list)
            }
        } else {
            printTime(`当前用户 ${sub.userName} 没有新动态`, CQLog.LOG_DEBUG)
        }
        await sleep(API_SLEEP_TIME)
        const live = await isNewLive(sub.userId)
        if (live) {
            const suber = sub.subscribers
            const text = biliLiveFormat(sub.userName, live)
            for (let k = 0; k < suber.length; k++) {
                const s = suber[k]
                if (ENABLE_PUSH_LIST.includes('coolq')) {
                    if (s.subType === 'group') {
                        await sendGroupMsg(s.subId, text)
                    } else {
                        await sendPrivateMsg(s.subId, text)
                    }
                }
                if (ENABLE_PUSH_LIST.includes('dingtalk') && ENABLE_DINGTALK_PUSH) {
                    const ddText = biliLiveFormat(sub.userName, live, 'dingtalk')
                    const title = `检测到您关注的B站up主 ${sub.userName} 开播了`
                    await dingtalk(title, ddText)
                }
                await sleep(MSG_SLEEP_TIME)
            }
            list[i].lastLive = Date.now()
            await saveSubscribeList(list)

        } else {
            printTime(`当前用户 ${sub.userName} 没有新开播`, CQLog.LOG_DEBUG)
        }
        await sleep(API_SLEEP_TIME)

    }
    return true
}


setTimeout(() => {
    (async () => {
        printTime('开始轮询最新动态', CQLog.LOG_DEBUG)
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                if (!isFreeTime()) {
                    await pushDynamic(SUBSCRIBE_LIST)
                }
                await sleep(SLEEP_TIME)
            } catch (error) {
                console.error(error)
            }
        }
    })()
}, 2000)