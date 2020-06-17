/**
 * 消息段（广义 CQ 码）
 * 详见 https://cqhttp.cc/docs/4.10/#/Message
 *
 * @author CaoMeiYouRen
 * @date 2019-07-10
 * @export
 * @interface CQMessage
 */
export interface CQMessage {
    type: string
    data: null | {
        [key: string]: string
    }
}