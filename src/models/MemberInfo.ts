/**
 *群成员信息类
 *
 * @author CaoMeiYouRen
 * @date 2019-07-13
 * @export
 * @class MemberInfo
 */
export class MemberInfo {
    /**
     *群号
     *
     * @type {number}
     * @memberof MemberInfo
     */
    group_id: number
    /**
     * QQ 号
     *
     * @type {number}
     * @memberof MemberInfo
     */
    user_id: number
    /**
     *昵称
     *
     * @type {string}
     * @memberof MemberInfo
     */
    nickname: string
    /**
     *群名片／备注
     *
     * @type {string}
     * @memberof MemberInfo
     */
    card: string
    /**
     *性别，male 或 female 或 unknown
     *
     * @type {string}
     * @memberof MemberInfo
     */
    sex: string
    /**
     *年龄
     * @type {number}
     * @memberof MemberInfo
     */
    age: number
    /**
     *地区
     *
     * @type {string}
     * @memberof MemberInfo
     */
    area: string
    /**
     *加群时间戳
     *
     * @type {number}
     * @memberof MemberInfo
     */
    join_time: number
    /**
     *最后发言时间戳
     *
     * @type {number}
     * @memberof MemberInfo
     */
    last_sent_time: number
    /**
     *成员等级
     *
     * @type {string}
     * @memberof MemberInfo
     */
    level: string
    /**
     *角色，owner 或 admin 或 member
     *
     * @type {string}
     * @memberof MemberInfo
     */
    role: string
    /**
     *是否不良记录成员
     *
     * @type {boolean}
     * @memberof MemberInfo
     */
    unfriendly: boolean
    /**
     *专属头衔
     *
     * @type {string}
     * @memberof MemberInfo
     */
    title: string
    /**
     *专属头衔过期时间戳
     *
     * @type {number}
     * @memberof MemberInfo
     */
    title_expire_time: number
    /**
     *是否允许修改群名片
     *
     * @type {boolean}
     * @memberof MemberInfo
     */
    card_changeable: boolean
}