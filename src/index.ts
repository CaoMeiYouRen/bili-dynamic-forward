import path = require('path')
import fs = require('fs-extra')
import moduleAlias from 'module-alias'
moduleAlias.addAlias('@', path.join(__dirname, './'))
import { CQWebSocket } from 'cq-websocket'
import { getCQWebSocketOption, printTime, sendPrivateMsg, sleep } from './utils'
import { CQLog } from './models'
import './db'
import './schedule'
import { app } from './routes'
export const bot = new CQWebSocket(getCQWebSocketOption())

bot.on('socket.connecting', (socketType, attempts) => {
    printTime(`[WebSocket] 尝试第${attempts}次连线`, CQLog.LOG_INFO)
}).on('socket.connect', (socketType, sock, attempts) => {
    printTime(`[WebSocket] 第${attempts}次连线尝试成功`, CQLog.LOG_INFO_SUCCESS)
}).on('socket.failed', (socketType, attempts) => {
    printTime(`[WebSocket] 第${attempts}次连线尝试失败 `, CQLog.LOG_WARNING)
}).on('socket.error', (socketType, error) => {
    printTime('[WebSocket] 连线出现了socket.error错误！！', CQLog.LOG_ERROR)
    console.error(error)
}).on('error', error => {
    printTime('[WebSocket] 连线出现了error！！', CQLog.LOG_FATAL)
    console.error(error)
})

bot.connect()

bot.on('ready', async () => {
    if (await fs.pathExists('package.json')) {
        const file = await fs.readJSON('package.json')
        printTime(`[Info] 当版本号：${file.version}`, CQLog.LOG_INFO)
    }
    printTime('[WebSocket] 连接成功！', CQLog.LOG_INFO)
    app.run(bot)
})


bot.on('message.private', (event, ctx, tags) => {
    printTime(`[接收私聊消息] 类型:${ctx.sub_type} QQId:${ctx.user_id} msg:${ctx.message}`, CQLog.LOG_INFO_SUCCESS)
})

bot.on('message.group', (event, ctx, tags) => {
    printTime(`[接收群聊消息] 类型:${ctx.sub_type} GroupId:${ctx.group_id} QQId:${ctx.user_id} msg:${ctx.message}`, CQLog.LOG_INFO_SUCCESS)
})

bot.on('meta_event.heartbeat', ctx => { // 响应心跳连接
    (async function () {
        try {
            const result = await bot('get_status')
            printTime(`API调用测试：get_status:${result.status}`, CQLog.LOG_DEBUG)
            if (result.status !== 'ok') {
                printTime('发生了异常', CQLog.LOG_ERROR)
            }
        } catch (error) {
            printTime('发生了异常', CQLog.LOG_ERROR)
        }
    }())
})