/* eslint-disable no-shadow */
export enum SubscribeType {
    personal = 'personal',
    group = 'group'
}
/**
 * 订阅者
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @class Subscriber
 */
export class Subscriber {
    /**
     * 订阅者的qq或群号
     *
     * @type {number}
     */
    subId: number

    /**
     * 订阅类型 personal/group
     *
     * @type {string}
     */
    subType: string

    constructor(obj: Subscriber) {
        Object.assign(this, obj)
    }
}

/**
 * 被订阅的对象
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @class Subscribe
 */
export class Subscribe {
    /**
     * 订阅的up主uid
     *
     * @type {number}
     */
    userId: number
    /**
     * 用户名称
     *
     * @type {string}
     */
    userName: string
    /**
     * 最后一条动态的时间戳
     *
     * @type {number}
     */
    lastDynamic: number = Date.now()

    /**
     * 最后一次直播的时间
     *
     * @type {number}
     */
    lastLive: number = Date.now()
    /**
     * 订阅者数组
     *
     * @type {Subscriber[]}
     */
    subscribers: Subscriber[] = []

    constructor(obj: Subscribe) {
        Object.assign(this, obj)
    }
}