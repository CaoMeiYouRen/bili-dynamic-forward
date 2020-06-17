export class RssItem {
    /**
     * 此项的标题
     *
     * @type {string}
     */
    title: string
    /**
     * 文章作者
     *
     * @type {string}
     */
    author?: string
    /**
     * 文章分类
     *
     * @type {(string | string[])}
     */
    category?: string | string[]
    /**
     * 指向此项的超链接
     *
     * @type {string}
     */
    link: string
    /**
     * 描述此项
     *
     * @type {string}
     */
    description: string
    /**
     * 唯一标识符，一般为链接
     *
     * @type {string}
     */
    guid?: string
    /**
     * 最后发布时间
     *
     * @type {(Date | string)}
     */
    pubDate?: Date | string
    /**
     * 图片数组。会统一挂载在 description 最后面
     *
     * @type {string[]}
     */
    images?: string[]
    /**
     * 音频链接、磁力链接
     *
     * @type {string}
     */
    enclosure_url?: string
    /**
     * 时间戳 (播放长度) , 一般是秒数，可选
     *
     * @type {string}
     */
    enclosure_length?: string
    /**
     * 类型
     *
     * @type {string}
     */
    enclosure_type?: string

    constructor(data?: RssItem) {
        Object.assign(this, data)
        if (this.link && !this.guid) {
            this.guid = this.link
        }
    }
}

export class RssChannel {
    /**
     * 频道的标题
     *
     * @type {string}
     */
    title: string
    /**
     * 指向频道的超链接
     *
     * @type {string}
     */
    link: string
    /**
     * 频道描述
     *
     * @type {string}
     */
    description: string
    /**
     * 内容子项
     *
     * @type {RssItem[]}
     */
    item: RssItem[]
    /**
     * 订阅URL
     *
     * @type {string}
     */
    feedUrl?: string

    /**
     * item最大数量
     *
     * @type {number}
     */
    count?: number

    /**
     * 每页的数量
     *
     * @type {number}
     */
    pageSize?: number
    /**
     * feed 内容的最后修改日期
     *
     * @type {(Date | string)}
     */
    lastBuildDate?: Date | string
    /**
     * 管理员邮箱 或 GitHub用户名
     *
     * @type {string}
     */
    webMaster?: string
    /**
     * 语言
     *
     * @type {string}
     */
    language?: string
    /**
     * 指定从 feed 源更新此 feed 之前，feed 可被缓存的分钟数
     *
     * @type {number}
     */
    ttl?: number
    /**
     * 版权声明
     *
     * @type {string}
     */
    copyright?: string
    constructor(data?: RssChannel) {
        Object.assign(this, data)
    }

}