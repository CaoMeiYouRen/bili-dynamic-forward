import { Subscribe, CQLog } from '@/models'
import { getNotPushDynamic, biliDynamicFormat, saveSubscribeList, isNewLive, biliLiveFormat } from '@/services'
import { sleep, sendMsg, sendGroupMsg, sendPrivateMsg, printTime } from '@/utils'
import { IS_DEBUG, API_SLEEP_TIME, MSG_SLEEP_TIME, SLEEP_TIME } from '@/config'
import { SUBSCRIBE_LIST } from '@/db'

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
                    if (s.subType === 'group') {
                        await sendGroupMsg(s.subId, text)
                    } else {
                        await sendPrivateMsg(s.subId, text)
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
                if (s.subType === 'group') {
                    await sendGroupMsg(s.subId, text)
                } else {
                    await sendPrivateMsg(s.subId, text)
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
                await pushDynamic(SUBSCRIBE_LIST)
                await sleep(SLEEP_TIME)
            } catch (error) {
                console.error(error)
            }
        }
    })()
}, 2000)