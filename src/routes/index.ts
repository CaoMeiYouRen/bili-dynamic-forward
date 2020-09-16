import { CQApp } from '@/interfaces'
import { SubscribeType, CQError } from '@/models'
import { isGroupAdmin, getNumber } from '@/utils'
import { querySubscribe, transferSubscribeUp, getUsernameFromUID, unsubscribeUp, unsubscribeAllUp, oneClickDD, subscribeUp } from '@/services'

const app = new CQApp('bili')

app.use(/^(订阅)?(主菜单|指令)$/i, (bot, ctx) => 'bili主菜单\nbili订阅列表\nbili订阅 [uid]\nbili取消订阅 [uid]\nbili取消全部订阅\nbili订阅转移 [uid] [?tagid]\nbili一键dd [?num]')

app.use(/.*/i, async (bot, ctx) => {
    ctx.sub_id = ctx.group_id ? ctx.group_id : ctx.user_id
    ctx.sub_type = ctx.group_id ? SubscribeType.group : SubscribeType.personal
    const { user_id, group_id, message } = ctx
    if (/^(主菜单|订阅列表|订阅转移 |订阅 |取消订阅 |取消全部订阅|一键dd )/.test(message) && group_id && !await isGroupAdmin(group_id, user_id)) {
        return '非常抱歉，该操作仅管理员可用！'
    }
})

app.use(/^订阅列表$/i, (bot, ctx) => {
    const { user_id, group_id, sub_id, sub_type } = ctx
    let text = ''
    const subscribes = querySubscribe(sub_id, sub_type)
    if (subscribes.length === 0) {
        return '非常抱歉，未查询到您的订阅。发送 bili订阅 + uid 即可订阅up主动态'
    }
    if (group_id) {
        text = '本群当前关注的up主如下\n'
    } else {
        text = '您当前关注的up主如下\n'
    }
    text += `${subscribes.map((e, i) => `${i + 1}.${e.userName}(uid: ${e.userId})`).join('\n')}`
    return text
})

app.use(/^订阅转移 (\d+)( (-)?\d+)?$/i, async (bot, ctx) => {
    const { user_id, group_id, sub_id, sub_type, message } = ctx
    const args = message.split(' ')
    if (args.length < 3) {
        args.push('0')
    }
    const uid = getNumber(args[1])
    const tag = Number(args[2])
    if (!uid) {
        return '要转移的uid为空！'
    }
    try {
        const n = await transferSubscribeUp(uid, user_id, sub_type, tag)
        const user_name = await getUsernameFromUID(uid)
        return `转移用户 ${user_name}(uid: ${uid}) 的订阅成功！共转移 ${n} 个订阅(重复订阅会自动剔除)`
    } catch (error) {
        if (error instanceof CQError) {
            return error.message
        }
        console.error(error)
    }
    return '转移用户关注列表失败！'
})

app.use(/^订阅 (\d+)$/i, async (bot, ctx) => {
    const { user_id, group_id, sub_id, sub_type, message } = ctx
    const uid = getNumber(message)
    if (!uid) {
        return '要订阅的uid为空！'
    }
    const sub = await subscribeUp(uid, sub_id, sub_type)
    if (sub) {
        return `订阅用户 ${sub.userName}(uid: ${sub.userId}) 成功！`
    }
    return `订阅用户 ${uid} 失败！`
})

app.use(/^取消订阅 (\d+)$/i, async (bot, ctx) => {
    const { user_id, group_id, sub_id, sub_type, message } = ctx
    const uid = getNumber(message)
    if (!uid) {
        return '要取消订阅的uid为空！'
    }
    const sub = await unsubscribeUp(uid, sub_id, sub_type)
    if (sub) {
        return `取消订阅用户 ${sub.userName}(uid: ${sub.userId}) 成功！`
    }
    return `取消订阅用户 ${uid} 失败！`
})

app.use(/^取消全部订阅$/i, async (bot, ctx) => {
    const { user_id, group_id, sub_id, sub_type, message } = ctx
    if (await unsubscribeAllUp(sub_id, sub_type)) {
        return '取消全部订阅成功！'
    }
    return '非常抱歉，取消全部订阅失败！'
})

app.use(/^一键dd( \d+)?$/i, async (bot, ctx) => {
    const { user_id, group_id, sub_id, sub_type, message } = ctx
    try {
        const limit = getNumber(message) || 20
        const n = await oneClickDD(sub_id, sub_type, limit)
        return `一键dd成功！共 dd ${n} 个 vup/vtuber(重复订阅会自动剔除)`
    } catch (error) {
        if (error instanceof CQError) {
            return error.message
        }
        console.error(error)
    }
    return '非常抱歉，一键dd失败！'
})

export { app }