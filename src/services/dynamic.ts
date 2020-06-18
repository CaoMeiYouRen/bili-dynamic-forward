/* eslint-disable no-shadow */
import fs = require('fs-extra')
import { ajax } from '@/utils/ajax'
import { jsonDeepParse, timeFormat, sendPrivateMsg } from '@/utils'
import { RssChannel, RssItem } from '@/models'
import { CQImage } from 'cq-websocket'
import { getUsernameFromUID } from './helper'

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
    const uname = cards[0]?.desc?.user_profile?.info?.uname || ''
    return new RssChannel({
        title: `${uname} 的 bilibili 动态`,
        link: `https://space.bilibili.com/${uid}/#/dynamic`,
        description: `${uname} 的 bilibili 动态`,
        item: cards && cards.map((item) => {
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
            if (data.dynamic_id) {
            } else if (item?.desc?.dynamic_id) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id}`
            }
            const getTitle = (data) => data.title || data.sketch?.title || '' // || data.description || data.content || data?.vest?.content || ''
            const getDes = (data) => data.desc || data.description || data.content || data.summary || (data?.vest?.content) + (data.sketch && `\n${data.sketch.desc_text}`) || data.intro || ''
            const getOriginDes = (data) => {
                if (!data) {
                    return ''
                }
                let text = ''
                if (data?.apiSeasonInfo?.title) {
                    text += `//转发自: ${data.apiSeasonInfo.title}`
                }
                if (data?.index_title) {
                    text += `\n${data.index_title}`
                }
                return text
            }
            const getOriginName = (data) => data.uname || data.author?.name || data.upper || data.user?.uname || data.user?.name || data?.owner?.name || ''
            const getOriginTitle = (data) => (data?.title ? `${data.title}\n` : '')
            const getVideo = (data) => data?.aid ? `\n视频地址：https://www.bilibili.com/video/av${data?.aid}` : ''
            return new RssItem({
                title: getTitle(data),
                link,
                description: `${getDes(data)}${
                    origin && getOriginName(origin) ? `\n//@${getOriginName(origin)}: ${getOriginTitle(origin.item || origin)}${getDes(origin.item || origin)}` : `${getOriginDes(origin)}`}${getVideo(data)}${getVideo(origin)}`,
                images,
                pubDate: new Date(item.desc.timestamp * 1000),
            })
        }),
    })
}

export function biliDynamicFormat(userName: string, dynamic: RssItem) {
    let text = `检测到您关注的B站用户 ${userName} 发布了新的动态\n`
    if (dynamic.title) {
        text += `${dynamic.title}\n`
    }
    text += `${dynamic.description}\n`
    if (dynamic.images?.length) {
        text += `${dynamic.images?.map(e => {
            return new CQImage(e).toString()
        }).join('')}\n`
    }
    text += `动态链接：${dynamic.link}\n`
    text += `发布时间：${timeFormat(dynamic.pubDate)}`
    return text
}

// (async () => {
//     setTimeout(async () => {
//         const result = await getBiliDynamic(2)
//         const username = await getUsernameFromUID(2)
//         let text = biliDynamicFormat(username, result?.item[0])
//         await sendPrivateMsg(996881204, text)
//     }, 3000)
// })()