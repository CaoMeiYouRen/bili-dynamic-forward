import path = require('path')
import fs = require('fs-extra')
import JSON5 from 'json5'
import YAML = require('yaml')
import { CQWebSocket, CQWebSocketOption, APIResponse } from 'cq-websocket'
import { bot } from '../index'
import { printTime } from './timeHelp'
import { IS_DEBUG } from '@/config'
import { CQMessage, CQLog, MemberInfo } from '@/models'
import { globalCache } from '@/db'

/**
 * 获取CQWebSocket配置项，支持yaml和json格式配置
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @param {string} [dirname]
 * @returns {CQWebSocketOption}
 */
export function getCQWebSocketOption(dirname?: string): CQWebSocketOption {
    let setting: CQWebSocketOption = {} as CQWebSocketOption
    if (dirname) {
        if (fs.existsSync(path.join(dirname, './setting.yaml'))) {
            setting = YAML.parse(fs.readFileSync(path.join(dirname, './setting.yaml'), 'utf8'))
        } else if (fs.existsSync(path.join(dirname, './setting.yml'))) {
            setting = YAML.parse(fs.readFileSync(path.join(dirname, './setting.yml'), 'utf8'))
        } else if (fs.existsSync(path.join(dirname, './setting.jsonc'))) {
            setting = JSON5.parse(fs.readFileSync(path.join(dirname, './setting.jsonc'), 'utf8'))
        } else if (fs.existsSync(path.join(dirname, './setting.json'))) {
            setting = JSON5.parse(fs.readFileSync(path.join(dirname, './setting.json'), 'utf8'))
        }
    } else {
        if (fs.existsSync('setting.yaml')) {
            setting = YAML.parse(fs.readFileSync('setting.yaml', 'utf8'))
        } else if (fs.existsSync('setting.yml')) {
            setting = YAML.parse(fs.readFileSync('setting.yml', 'utf8'))
        } else if (fs.existsSync('setting.jsonc')) {
            setting = JSON5.parse(fs.readFileSync('setting.jsonc', 'utf8'))
        } else if (fs.existsSync('setting.json')) {
            setting = JSON5.parse(fs.readFileSync('setting.json', 'utf8'))
        }
    }
    return Object.assign({
        accessToken: '',
        enableAPI: true,
        enableEvent: true,
        protocol: 'ws:',
        host: '127.0.0.1',
        port: 6700,
        baseUrl: '',
        qq: -1,
        reconnection: true,
        reconnectionAttempts: 1000,
        reconnectionDelay: 1000,
        fragmentOutgoingMessages: false,
        fragmentationThreshold: 16000,
        tlsOptions: {},
        requestOptions: {
            timeout: 10000,
        },
    }, setting)
}


/**
 * 发送私聊消息
 *
 * @author CaoMeiYouRen
 * @date 2019-07-10
 * @param {number} user_id 对方 QQ 号
 * @param {(string | CQMessage | Array<CQMessage>)} message 要发送的内容，支持纯文本和数组格式
 * @returns {Promise<number>} 成功返回message_id，失败返回retcode
 * @memberof CoolQ
 */
export async function sendPrivateMsg(user_id: number, message: string | CQMessage | CQMessage[]): Promise<number> {
    // if (IS_DEBUG) {
    //     printTime(`[发送私聊消息] QQID:${user_id} msg:${JSON.stringify(message)}`, CQLog.LOG_DEBUG)
    //     return 0
    // }
    // 返回内容格式 {"data":{"message_id":273},"retcode":0,"status":"ok"}
    try {
        const result: APIResponse<any> = await bot('send_private_msg', {
            user_id,
            message,
        })
        printTime(`[发送私聊消息] QQID:${user_id} msg:${JSON.stringify(message)} 执行结果:${JSON.stringify(result)}`, CQLog.LOG_INFO_SEND)
        if (result['status'] === 'ok') {
            return result['data']['message_id']
        } else {
            if (result['retcode'] > 0) {
                return -result['retcode'] - 1000  // 为了和message_id作区分，对于来自 HTTP API 插件的错误码取相反数 -1000 处理，即，原本为1的错误码，现在为-1001
            }
            return result['retcode']
        }
    } catch (error) {
        printTime('[cq-robot]请求 send_private_msg 发生错误', CQLog.LOG_ERROR)
        console.error(error)
        return -1000
    }
}
/**
 * 发送群消息
 * @author CaoMeiYouRen
 * @date 2019-07-10
 * @param {number} group_id 群号
 * @param {(string | CQMessage | Array<CQMessage>)} message 要发送的内容，支持纯文本和数组格式
 * @returns 成功返回message_id，失败返回retcode
 */
export async function sendGroupMsg(group_id: number, message: string | CQMessage | CQMessage[]): Promise<number> {
    if (IS_DEBUG) {
        printTime(`[发送群消息] 群号:${group_id} msg:${JSON.stringify(message)}`, CQLog.LOG_DEBUG)
        return 0
    }
    // 返回内容格式 {"data":{"message_id":273},"retcode":0,"status":"ok"}
    try {
        const result: APIResponse<any> = await bot('send_group_msg', {
            group_id,
            message,
        })
        printTime(`[发送群消息] 群号:${group_id} msg:${JSON.stringify(message)} 执行结果:${JSON.stringify(result)}`, CQLog.LOG_INFO_SEND)
        if (result['status'] === 'ok') {
            return result['data']['message_id']
        } else {
            if (result['retcode'] > 0) {
                return -result['retcode'] - 1000  // 为了和message_id作区分，对于来自 HTTP API 插件的错误码取相反数 -1000 处理，即，原本为1的错误码，现在为-1001
            }
            return result['retcode']
        }
    } catch (error) {
        printTime('[cq-robot]请求 send_group_msg 发生错误', CQLog.LOG_ERROR)
        console.error(error)
        return -1000
    }
}

/**
 * 发送消息
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {(string | CQMessage | CQMessage[])} message 要发送的消息
 * @param {number} user_id 要发送的目标QQ
 * @param {number} group_id 群号，留空或为0则为私聊
 */
export async function sendMsg(message: string | CQMessage | CQMessage[], user_id: number, group_id?: number) {
    if (group_id) {
        return sendGroupMsg(group_id, message)
    }
    return sendPrivateMsg(user_id, message)
}
/**
 * 是否为管理员
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @export
 * @param {number} group_id
 * @param {number} user_id
 */
export async function isGroupAdmin(group_id: number, user_id: number): Promise<boolean> {
    const key = `is-group-admin-${group_id}-uid-${user_id}`
    let role: string = (await globalCache.get(key)) || ''
    if (!role) {
        const info = await getGroupMemberInfo(group_id, user_id)
        role = info.role
        await globalCache.set(key, role, 3600 * 24 * 7)
    }
    return ['owner', 'admin'].includes(role)
}
/**
 *取群成员信息
*
* @author CaoMeiYouRen
* @date 2019-07-13
* @param {number} group_id 群号
* @param {number} user_id QQ 号
* @param {boolean} no_cache 是否不使用缓存（使用缓存可能更新不及时，但响应更快）
* @returns {Promise<MemberInfo>}
* @memberof CoolQ
*/
export async function getGroupMemberInfo(group_id: number, user_id: number, no_cache: boolean = false): Promise<MemberInfo> {
    if (IS_DEBUG) {
        const testMemberInfo: MemberInfo = {
            group_id,
            user_id,
            nickname: '测试昵称',
            card: '测试名片',
            sex: 'male',
            age: 0,
            area: '中国',
            join_time: Date.now() - 24 * 60 * 60 * 1000,
            last_sent_time: Date.now() - 60 * 1000,
            level: '萌新',
            role: 'member',
            unfriendly: false,
            title: '测试专属头衔',
            title_expire_time: -1,
            card_changeable: true,
        }
        printTime(`[取群成员信息] 本函数请在酷Q中测试 群号:${group_id} QQID:${user_id} 不使用缓存:${no_cache} 返回:${JSON.stringify(testMemberInfo)}`)
        return testMemberInfo
    }
    try {
        const result: APIResponse<any> = await bot('get_group_member_info', {
            group_id, user_id, no_cache,
        })
        if (result['status'] === 'ok') {
            return result['data']
        } else {
            return new MemberInfo()
        }
    } catch (error) {
        printTime('[cq-robot]请求 get_group_member_info 发生错误', CQLog.LOG_ERROR)
        console.error(error)
        return new MemberInfo()
    }
}