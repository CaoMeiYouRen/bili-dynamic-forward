/**
 * 日志级别常量
 *
 * @author CaoMeiYouRen
 * @date 2019-07-09
 * @export
 * @class CQLog
 */
export enum CQLog {
    /**
     * 级别：调试
     * 颜色：灰色
     */
    LOG_DEBUG = 0,
    /**
     * 级别：信息
     * 颜色：白色
     */
    LOG_INFO = 10,
    /**
     * 级别：信息(成功)
     * 颜色：青色
     */
    LOG_INFO_SUCCESS = 11,
    /**
     * 级别：信息(接收)
     * 颜色：蓝色
     */
    LOG_INFO_RECV = 12,
    /**
     * 级别：信息(发送)
     * 颜色：绿色
     */
    LOG_INFO_SEND = 13,
    /**
     * 级别：警告
     * 颜色：黄色
     */
    LOG_WARNING = 20,
    /**
     * 级别：错误
     * 颜色：红色
     */
    LOG_ERROR = 30,
    /**
     * 级别：致命错误
     * 颜色：品红
     */
    LOG_FATAL = 40,
}