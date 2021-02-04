import fs from 'fs-extra'
import colors from 'colors'
import { Markdown, Robot, Text } from 'ts-dingtalk-robot'
import { DINGTALK, ENABLE_PUSH } from '@/config'
import { getPublicIP } from './ajax'
import { timeFormat } from './timeHelp'

let robot: Robot
if (ENABLE_PUSH) {
    robot = new Robot({
        accessToken: DINGTALK.DINGTALK_ACCESS_TOKEN,
        secret: DINGTALK.DINGTALK_SECRET,
    })
}

/**
 * 钉钉消息推送
 *
 * @author CaoMeiYouRen
 * @date 2020-06-02
 * @export
 * @param {string} title
 * @param {string} [text]
 * @returns
 */
export async function dingtalk(title: string, text?: string) {
    if (!robot) {
        console.warn(colors.yellow('robot未初始化！'))
        return
    }
    if (!text) {
        return robot.send(new Text(title))
    }
    const markDown = new Markdown()
    markDown.setTitle(title).add(`${text}`)
    return robot.send(markDown)
}

/**
 * 服务器反馈
 * @param title
 * @param text
 */
export async function feedback(title: string, text?: string) {
    try {
        const pack = await fs.readJSON('package.json')
        if (pack) {
            const { name, version } = pack
            const ip = await getPublicIP()
            const time = timeFormat()
            const meta = Object.entries({ time, name, version, ip }).map((e) => `## ${e[0]}: ${e[1]}`).join('\n')
            text = text ? `${meta}\n${text}` : meta
            return dingtalk(title, text)
        }
    } catch (error) {
        console.error(error)
    }
}