import _ = require('lodash')
import { ajax } from '@/utils'
import { Vtuber } from '@/models'
import { VUP_BAN_LIST } from '@/db'
/**
 * 获取 B站 vup 和 vtuber 名单，默认取前20。数据来自 https://vtuber.magictea.cc/rank
 *
 * @author CaoMeiYouRen
 * @date 2020-06-18
 * @returns
 */
export async function getVupAndVtuberList(limit: number = 20) {
    let list: Vtuber[] = []
    let url = 'https://static.imas.app/vup.json'
    let result = await ajax(url)
    list = list.concat(result.data?.tables)
    url = 'https://static.imas.app/vtuber.json'
    result = await ajax(url)
    list = list.concat(result.data?.tables)
    list = _.uniqBy(list, e => e.mid)
    list = _.differenceBy(list, VUP_BAN_LIST, e => e.mid)
    list = list.sort((a, b) => (b.suber - a.suber)).slice(0, limit)
    return list
}