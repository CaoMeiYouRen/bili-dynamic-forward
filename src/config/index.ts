import dotenv = require('dotenv')
import path = require('path')
import fs = require('fs-extra')
const modes = [
    '.env.local',
    '.env',
]
let envParsed = {}
for (let i = 0; i < modes.length; i++) {
    const mode = modes[i]
    const result = dotenv.config({ path: mode })
    if (result.parsed) {
        envParsed = Object.assign(result.parsed, envParsed)
    }
}
if (process.env.NODE_ENV === 'development') {
    console.log(envParsed)
}
const env = process.env
/**
 * 运行环境 development | production
 */
export const NODE_ENV = env.NODE_ENV

/**
 * 是否为debug
 */
export const IS_DEBUG = env.NODE_ENV === 'development'

export const CACHE = {
    CACHE_AGE: Number(env.CACHE_AGE || 3600),
    CACHE_MAX: Number(env.CACHE_MAX || Infinity),
}

/**
 * 浏览器 user-agent
 */
export const UA = env.UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'

/**
 * 访问B站api的延时
 */
export const API_SLEEP_TIME = Number(env.API_SLEEP_TIME || 7000)
/**
 * 发送消息的延时
 */
export const MSG_SLEEP_TIME = Number(env.MSG_SLEEP_TIME || 500)

/**
 * 一轮访问后的延时
 */
export const SLEEP_TIME = Number(env.SLEEP_TIME || 60000)
/**
 * 是否使用AV号
 */
export const USE_AV = env.USE_AV === 'true'

/**
 * 周几启用推送，周日为0，周六为6。留空为全部
 */
export const ENABLE_DAY = (env.ENABLE_DAY || '0,1,2,3,4,5,6').split(',').map(e => Number(e))

const FREE_TIME = env.FREE_TIME || '23:00-7:00'

/**
 * 免打扰时间
 */
export const FREE_TIMES: Date[] = []
const math = /(\d+):(\d+)-(\d+):(\d+)/.exec(FREE_TIME)
if (math) {
    const a = new Date()
    a.setHours(parseInt(math[1]))
    a.setMinutes(parseInt(math[2]))
    FREE_TIMES.push(a)
    const b = new Date()
    b.setHours(parseInt(math[3]))
    b.setMinutes(parseInt(math[4]))
    FREE_TIMES.push(b)
}

