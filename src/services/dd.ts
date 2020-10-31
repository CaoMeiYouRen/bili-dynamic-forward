import _ = require('lodash')
import fs = require('fs-extra')
import { ajax } from '@/utils'
import { Vtuber, VtbInfo } from '@/models'
import { VUP_BAN_LIST } from '@/db'
/**
 * 获取 B站 vup 和 vtuber 名单，默认取前20。数据来自 https://api.vtbs.moe/v1/info
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @returns
 */
export async function getVupAndVtuberList(limit = 20) {
    let list: VtbInfo[] = []
    const url = 'https://api.vtbs.moe/v1/info'
    const result = await ajax(url)
    list = list.concat(result.data)
    list = _.uniqBy(list, e => e.mid)
    list = list.sort((a, b) => b.follower - a.follower)
    list = list.filter(e => !/hololive/i.test(e.sign)) // 移除hololive所属
    list = _.differenceBy(list, VUP_BAN_LIST, e => e.mid) // 移除黑名单成员
    list = list.slice(0, limit)
    return list
}