/* eslint-disable @typescript-eslint/require-await */
import Lru from 'lru-cache'
import { CACHE } from '@/config'
const memoryCache = new Lru({
    maxAge: CACHE.CACHE_AGE * 1000,
    max: CACHE.CACHE_MAX,
    updateAgeOnGet: true,
})
/**
 * 缓存
 */
export const globalCache = {
    /**
     *
     *
     * @author CaoMeiYouRen
     * @date 2020-06-15
     * @param {string} key
     * @returns {Promise<any>} 返回的数据如果是json格式会自动转换为对象，其余情况为字符串
     */
    async get(key: string): Promise<any> {
        if (key) {
            let value: any = memoryCache.get(key)
            if (!value || value === 'undefined') {
                value = ''
            }
            if (typeof value === 'string') {
                try {
                    value = JSON.parse(value)
                } catch (error) {
                }
            } else {
                value += ''
            }
            return value
        }
        return ''
    },
    /**
     *
     * @author CaoMeiYouRen
     * @date 2020-06-04
     * @param {string} key
     * @param {*} value 如果是对象会自动序列化为字符串，其余情况直接转为字符串
     * @param {number} [maxAge] 单位：秒
     * @returns {Promise<any>}
     */
    async set(key: string, value: any, maxAge: number = CACHE.CACHE_AGE): Promise<any> {
        if (!value || value === 'undefined') {
            value = ''
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value)
        }
        return memoryCache.set(key, value, maxAge * 1000)
    },
}