/* eslint-disable no-shadow */
import fs = require('fs-extra')
import { ajax } from '@/utils/ajax'
import { jsonDeepParse, timeFormat, sendPrivateMsg } from '@/utils'
import { RssChannel, RssItem } from '@/models'
import { CQImage } from 'cq-websocket'
import { getUsernameFromUID } from './helper'
import { USE_AV } from '@/config'

class CardItem {
    desc: any
    card: any
    extend_json: any
    extra: any
    display: any
}

export async function getBiliDynamic(uid: number) {
    const result = await ajax('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history', {
        host_uid: uid,
    }, {}, 'GET', {
        Referer: `https://space.bilibili.com/${uid}/`,
    })
    const cards: CardItem[] = jsonDeepParse(result?.data?.data?.cards)
    if (!cards) {
        return
    }
    const uname = cards[0]?.desc?.user_profile?.info?.uname || ''
    return new RssChannel({
        title: `${uname} 的 bilibili 动态`,
        link: `https://space.bilibili.com/${uid}/#/dynamic`,
        description: `${uname} 的 bilibili 动态`,
        item: cards.map((item) => {
            const card = item.card
            const data = card.item || card
            const origin = card.origin

            // img
            let images: string[] = []
            const getImgs = (data) => {
                const imgs: string[] = []
                // 动态图片
                if (data.pictures) {
                    for (let i = 0; i < data.pictures.length; i++) {
                        imgs.push(data.pictures[i].img_src)
                    }
                }
                // 专栏封面
                if (data.image_urls) {
                    for (let i = 0; i < data.image_urls.length; i++) {
                        imgs.push(data.image_urls[i])
                    }
                }
                // 视频封面
                if (data.pic) {
                    imgs.push(data.pic)
                }
                // 音频/番剧/直播间封面
                if (data.cover) {
                    imgs.push(data.cover)
                }
                // 专题页封面
                if (data?.sketch?.cover_url) {
                    imgs.push(data.sketch.cover_url)
                }
                return imgs
            }

            images = images.concat(getImgs(data))

            if (origin) {
                images = images.concat(getImgs(origin.item || origin))
            }
            // link
            let link = ''
            if (data.dynamic_id_str) {
                link = `https://t.bilibili.com/${data.dynamic_id_str}`
            } else if (item?.desc?.dynamic_id_str) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id_str}`
            }
            const getTitle = data => data.title || '' // || data.description || data.content || data?.vest?.content || ''
            const getDes = (data) => {
                if (!data) {
                    return ''
                }
                let des = data.desc || data.description || data.content || data.summary || (data?.vest?.content ? data.vest.content : '') + (data?.sketch ? `\n${data.sketch?.title}\n${data.sketch?.desc_text}` : '') || data.intro || data.update_info || ''
                if (item?.display?.emoji_info) {
                    const emoji = item?.display?.emoji_info?.emoji_details
                    emoji?.forEach((e) => {
                        des = des.replace(
                            new RegExp(`\\${e.text}`, 'g'),
                            new CQImage(`${e.url}@40w_1e_1c.png`).toString(),
                        )
                    })
                }
                return des
            }
            const getOriginDes = (data) => {
                if (!data) {
                    return ''
                }
                let text = ''
                if (data?.apiSeasonInfo?.title) {
                    text += `\n//转发自: ${data.apiSeasonInfo.title}`
                }
                if (data?.index_title) {
                    text += `\n${data.index_title}`
                }
                return text
            }
            const getOriginName = data => data.uname || data.author?.name || data.upper || data.user?.uname || data.user?.name || data?.owner?.name || data?.up_info?.name || ''
            const getOriginTitle = (data) => {
                if (!data) {
                    return ''
                }
                let title = ''
                if (data?.title) {
                    title += `${data.title}\n`
                }
                if (data?.subtitle) {
                    title += `${data.subtitle}\n`
                }
                return title
            }
            const getUrl = (data) => {
                if (!data) {
                    return ''
                }
                const type: number = item?.desc?.type
                if (data.aid) {
                    if (USE_AV) {
                        return `\n视频地址：https://www.bilibili.com/video/av${data?.aid}`
                    }
                    const bvid = item?.desc?.bvid || item?.desc?.origin?.bvid
                    return `\n视频地址：https://www.bilibili.com/video/${bvid}`
                }
                if (data.image_urls) {
                    return `\n专栏地址：https://www.bilibili.com/read/cv${data?.id}`
                }
                if (data.upper) {
                    return `\n音频地址：https://www.bilibili.com/audio/au${data?.id}`
                }
                if (data.roomid) {
                    return `\n直播间地址：https://live.bilibili.com/${data?.roomid}`
                }
                if (data.sketch) {
                    return `\n活动地址：${data?.sketch?.target_url}`
                }
                if (data.url) {
                    return `\n地址：${data?.url}`
                }
                return ''
            }
            return new RssItem({
                title: getTitle(data),
                link,
                description: `${getDes(data)}${
                    origin && getOriginName(origin) ? `\n//@${getOriginName(origin)}: ${getOriginTitle(origin.item || origin)}${getDes(origin.item || origin)}` : `${getOriginDes(origin)}`}${getUrl(data)}${getUrl(origin)}`,
                images,
                pubDate: new Date(item.desc.timestamp * 1000),
            })
        }),
    })
}

export function biliDynamicFormat(userName: string, dynamic: RssItem) {
    let text = `检测到您关注的B站up主 ${userName} 发布了新的动态\n`
    // 排除简介内容和标题重复
    if (dynamic.title && !dynamic.description.startsWith(dynamic.title)) {
        text += `${dynamic.title}\n`
    }
    text += `${dynamic.description}\n`
    if (dynamic.images?.length) {
        text += `${dynamic.images?.map((e) => {
            if (!e.includes('@')) { // 开启图片压缩
                e += '@518w_1e_1c.png'
            }
            return new CQImage(e).toString()
        }).join('')}\n`
    }
    text += `动态链接：${dynamic.link}\n`
    text += `发布时间：${timeFormat(dynamic.pubDate)}`
    return text.replace(/(\n[\s|\t]*\r*\n)/g, '\n')
}

// (async () => {
//     setTimeout(async () => {
//         const result = await getBiliDynamic(2)
//         const username = await getUsernameFromUID(2)
//         let text = biliDynamicFormat(username, result?.item[0])
//         await sendPrivateMsg(996881204, text)
//     }, 3000)
// })()

/**
    @by CaoMeiYouRen 2020-05-05 添加注释
    注意1：以下均以card为根对象
    注意2：直接动态没有origin，转发动态有origin
    注意3：转发动态格式统一为：
        - user.uname: 用户名
        - item.content: 正文
        - item.tips: 原动态结果(例如：源动态已被作者删除、图文资源已失效)
        - origin: 与原动态一致
    注意4：本总结并不保证完善，而且未来B站可能会修改接口，因此仅供参考

    B站的动态种类繁多，大致可以总结为以下几种：
    desc.type

    转发：type = 1

    - 文字动态 type = 4
        - user.uname: 用户名
        - item.content: 正文
    - 图文动态 type = 2
        - user.name: 用户名
        - item.title: 标题
        - item.description: 简介
        - item.pictures: { img_src: String }[] 图片数组，图片地址在每项的 img_src 中
    - 视频动态 type = 8
        - aid: av号（以card为根对象没有bv号）
        - owner.name :用户名
        - pic: 封面
        - title: 视频标题
        - desc: 视频简介
    - 专栏动态 type = 64
        - author.name: 用户名
        - image_urls: String[] 封面数组
        - id: cv号
        - title: 标题
        - summary: 简介
    - 音频动态 type = 256
        - id: auId 音频id
        - upper: 上传的用户名称
        - title: 音频标题
        - author: 音频作者
        - cover: 音频封面
    - 投票动态
        - user.uname: 用户名
        - item.content: 正文
    - 活动专题页 type = 2048
        - user.uname 用户名
        - vest.content 正文
        - sketch.title 活动标题
        - sketch.desc_text 活动简介
        - sketch.cover_url 活动封面
        - sketch.target_url 活动地址
    - 番剧/电视剧/电影等专题页
        - cover 单集封面
        - index_title 单集标题
        - url 视频地址
        - apiSeasonInfo.title 番剧名称
        - apiSeasonInfo.cover 番剧封面
    - 直播间动态
        - roomid 直播间id
        - uname 用户名
        - title 直播间标题
        - cover 直播间封面
    - 付费课程
        - id 课程编号
        - cover 封面
        - title 标题
        - subtitle 副标题
        - up_info.name 用户名
        - up_id 用户Id
        - update_info 更新状态
        - url 地址
*/