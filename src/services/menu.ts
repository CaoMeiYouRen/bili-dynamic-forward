import { CQMessage, SubscribeType, SubscribeError } from '@/models'
import { sendMsg, isGroupAdmin, getNumber } from '@/utils'
import { querySubscribe, subscribeUp } from './subscribe'

/**
 * 挂载主菜单和业务逻辑
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {string} message 要发送的消息
 * @param {number} user_id 要发送的目标QQ
 * @param {number} group_id 群号，留空或为0则为私聊
 */
export async function menu(msg: string, user_id: number, group_id?: number) {
    if (!(/^bili/i.test(msg))) {
        return false
    }
    let text = ''
    if (/^bili订阅(主菜单|指令)$/i.test(msg)) {
        text = 'bili订阅主菜单\nbili订阅列表\nbili订阅 [uid]\nbili取消订阅 [uid]\nbili取消全部订阅\nbili订阅转移 [uid] [tagid]'
        return sendMsg(text, user_id, group_id)
    }
    let sub_id = user_id
    let sub_type = SubscribeType.personal
    if (group_id) {
        sub_id = group_id
        sub_type = SubscribeType.group
    }
    if (/^bili订阅列表$/i.test(msg)) {
        const subscribes = (await querySubscribe(sub_id, sub_type))
        if (subscribes.length === 0) {
            text = '非常抱歉，未查询到您的订阅。发送 bili订阅 + uid 即可订阅up主动态'
            return sendMsg(text, user_id, group_id)
        }
        text = `您当前关注的up主如下\n${subscribes.map(e => {
            return `${e.userName}(uid: ${e.userId})`
        }).join('\n')}`
        return sendMsg(text, user_id, group_id)
    }
    if (/^bili订阅/i.test(msg)) {
        if (group_id && !(await isGroupAdmin(group_id, user_id))) {
            text = '非常抱歉，群订阅仅管理员可用！'
            return sendMsg(text, user_id, group_id)
        }
        const uid = getNumber(msg)
        if (!uid) {
            text = '要订阅的uid为空！'
            return sendMsg(text, user_id, group_id)
        }
        try {
            const sub = await subscribeUp(uid, sub_id, sub_type)
            if (sub) {
                text = `订阅用户 ${sub.userName}(uid: ${sub.userId}) 成功！`
                return sendMsg(text, user_id, group_id)
            }
        } catch (error) {
            if (error instanceof SubscribeError) {
                text = error.message
                return sendMsg(text, user_id, group_id)
            }
            console.error(error)
        }
        text = `订阅用户 ${uid} 失败！`
        return sendMsg(text, user_id, group_id)
    }
}