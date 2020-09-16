import { CQWebSocket, MessageListenerReturn } from 'cq-websocket'
import { CQError, CQLog } from '@/models'
import { printTime } from '@/utils'
import { IS_DEBUG } from '@/config'
/**
 * 如果返回值为真，则后续的都不再响应。如果返回值为假，则会继续向下匹配
 */
export type CQPlugin = (bot: CQWebSocket, context: Record<string, any>) => MessageListenerReturn

export class CQApp {
    /**
     *
     * @author CaoMeiYouRen
     * @date 2020-06-21
     * @param {string} [prefix] 触发前缀
     */
    constructor(prefix?: string) {
        this.prefix = prefix
    }
    private plugins = new Map<string | RegExp, CQPlugin>()
    /**
     * 前缀
     *
     * @type {string}
     */
    private prefix?: string
    /**
     * 挂载插件
     *
     * @author CaoMeiYouRen
     * @date 2020-06-21
     * @param {(string | RegExp)} path 匹配条件。字符串或正则
     * @param {CQPlugin} plugin 处理逻辑
     * @returns
     */
    public use(path: string | RegExp, plugin: CQPlugin) {
        this.plugins.set(path, plugin)
        return this
    }
    /**
     * 运行插件
     *
     * @author CaoMeiYouRen
     * @date 2020-06-21
     */
    public run(bot: CQWebSocket) {
        bot.on('message', async (event, ctx, tags) => {
            try {
                const plugins = [... this.plugins]
                let message: string = ctx.message
                // 如果前缀不匹配则直接返回
                if (this.prefix) {
                    if (!message.toUpperCase().startsWith(this.prefix.toUpperCase())) {
                        return
                    }
                    message = message.slice(this.prefix.length)
                    ctx.message = message
                }
                for (let i = 0; i < plugins.length; i++) {
                    const [path, plugin] = plugins[i]
                    if (typeof path === 'string' && path === message || path instanceof RegExp && path.test(message)) {
                        let result = plugin(bot, ctx)
                        // console.log(result, ctx)
                        if (result instanceof Promise) {
                            result = await result
                        }
                        if (result) {
                            if (ctx.group_id) {
                                printTime(`[发送群消息] 群号:${ctx.group_id} msg:${JSON.stringify(result)}`, CQLog.LOG_INFO_SEND)
                            } else {
                                printTime(`[发送私聊消息] QQID:${ctx.user_id} msg:${JSON.stringify(result)}`, CQLog.LOG_INFO_SEND)
                            }
                            if (!IS_DEBUG) {
                                return result
                            }
                        }
                    }
                }
            } catch (error) {
                if (error instanceof CQError) {
                    printTime(error.message, CQLog.LOG_ERROR)
                    return error.message
                }
                console.error(error)
            }
        })
    }
}