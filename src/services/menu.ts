import { CQMessage, SubscribeType, SubscribeError } from '@/models'
import { sendMsg, isGroupAdmin, getNumber } from '@/utils'
import { querySubscribe, subscribeUp, transferSubscribeUp, unsubscribeUp, unsubscribeAllUp, oneClickDD } from './subscribe'
import { getAllFollowings, getUsernameFromUID } from './helper'

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
        return 0
    }
    let text = ''
    if (/^bili(订阅)?(主菜单|指令)$/i.test(msg)) {
        text = 'bili主菜单\nbili订阅列表\nbili订阅 [uid]\nbili取消订阅 [uid]\nbili取消全部订阅\nbili订阅转移 [uid] [?tagid]\nbili一键dd [?num]'
        return sendMsg(text, user_id, group_id)
    }
    let sub_id = user_id
    let sub_type = SubscribeType.personal
    if (group_id) {
        sub_id = group_id
        sub_type = SubscribeType.group
    }
    if (/^bili订阅列表$/i.test(msg)) {
        if (group_id && !(await isGroupAdmin(group_id, user_id))) {
            text = '非常抱歉，订阅列表仅管理员可查询！'
            return sendMsg(text, user_id, group_id)
        }
        const subscribes = (await querySubscribe(sub_id, sub_type))
        if (subscribes.length === 0) {
            text = '非常抱歉，未查询到您的订阅。发送 bili订阅 + uid 即可订阅up主动态'
            return sendMsg(text, user_id, group_id)
        }
        if (group_id) {
            text = '本群当前关注的up主如下\n'
        } else {
            text = '您当前关注的up主如下\n'
        }
        text += `${subscribes.map((e, i) => {
            return `${i + 1}.${e.userName}(uid: ${e.userId})`
        }).join('\n')}`
        return sendMsg(text, user_id, group_id)
    }
    if (/^bili订阅转移 (\d+)( \d+)?$/i.test(msg)) {
        if (group_id && !(await isGroupAdmin(group_id, user_id))) {
            text = '非常抱歉，群订阅转移仅管理员可用！'
            return sendMsg(text, user_id, group_id)
        }
        const args = msg.split(' ')
        if (args.length < 3) {
            args.push('0')
        }
        const uid = getNumber(args[1])
        const tag = Number(args[2])
        if (!uid) {
            text = '要转移的uid为空！'
            return sendMsg(text, user_id, group_id)
        }
        try {
            const n = await transferSubscribeUp(uid, user_id, sub_type, tag)
            const user_name = await getUsernameFromUID(uid)
            text = `转移用户 ${user_name}(uid: ${uid}) 的订阅成功！共转移 ${n} 个订阅(重复订阅会自动剔除)`
            return sendMsg(text, user_id, group_id)
        } catch (error) {
            console.error(error)
        }
        text = '转移用户关注列表失败！'
        return sendMsg(text, user_id, group_id)
    }
    if (/^bili订阅 /i.test(msg)) {
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
    if (/^bili取消订阅 (\d+)$/i.test(msg)) {
        if (group_id && !(await isGroupAdmin(group_id, user_id))) {
            text = '非常抱歉，群取消订阅仅管理员可用！'
            return sendMsg(text, user_id, group_id)
        }
        const uid = getNumber(msg)
        if (!uid) {
            text = '要取消订阅的uid为空！'
            return sendMsg(text, user_id, group_id)
        }
        try {
            const sub = await unsubscribeUp(uid, sub_id, sub_type)
            if (sub) {
                text = `取消订阅用户 ${sub.userName}(uid: ${sub.userId}) 成功！`
                return sendMsg(text, user_id, group_id)
            }
        } catch (error) {
            if (error instanceof SubscribeError) {
                text = error.message
                return sendMsg(text, user_id, group_id)
            }
            console.error(error)
        }
        text = `取消订阅用户 ${uid} 失败！`
        return sendMsg(text, user_id, group_id)
    }
    if (/^bili取消全部订阅$/i.test(msg)) {
        if (group_id && !(await isGroupAdmin(group_id, user_id))) {
            text = '非常抱歉，群取消全部订阅仅管理员可用！'
            return sendMsg(text, user_id, group_id)
        }
        try {
            if (await unsubscribeAllUp(sub_id, sub_type)) {
                text = '取消全部订阅成功！'
                return sendMsg(text, user_id, group_id)
            }
        } catch (error) {
            if (error instanceof SubscribeError) {
                text = error.message
                return sendMsg(text, user_id, group_id)
            }
            console.error(error)
        }
        text = '非常抱歉，取消全部订阅失败！'
        return sendMsg(text, user_id, group_id)
    }
    // bili一键dd ；bili一键dd 100
    if (/^bili一键dd/i.test(msg)) {
        const limit = getNumber(msg) || 20
        if (group_id && !(await isGroupAdmin(group_id, user_id))) {
            text = '非常抱歉，群一键dd仅管理员可用！'
            return sendMsg(text, user_id, group_id)
        }
        try {
            const n = await oneClickDD(sub_id, sub_type, limit)
            text = `一键dd成功！共 dd ${n} 个 vup/vtuber(重复订阅会自动剔除)`
            return sendMsg(text, user_id, group_id)
        } catch (error) {
            if (error instanceof SubscribeError) {
                text = error.message
                return sendMsg(text, user_id, group_id)
            }
            console.error(error)
        }
        text = '非常抱歉，一键dd失败！'
        return sendMsg(text, user_id, group_id)
    }
    return 0
}
