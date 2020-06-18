import axios, { AxiosResponse } from 'axios'
import { CACHE, UA } from '@/config'
import { HttpError, HttpStatusCode } from '@/models'
import queryString from 'query-string'
/**
 * axios 封装，可满足大部分情况下的需求，若无法满足则重新封装 axios。
 * 返回值中一定包括 status ，通过状态码判断是否响应成功，可自行选择抛出 Error 或处理掉 Error
 * @author CaoMeiYouRen
 * @date 2020-05-26
 * @export
 * @param {string} url
 * @param {*} [query={}] 查询字符串
 * @param {*} [data={}] 提交的body部分
 * @param {*} [method='GET'] 请求方法
 * @param {*} [headers={}] 请求头
 * @returns
 */
export async function ajax(url: string, query: any = {}, data: any = {}, method: any = 'GET', headers: any = {}, charset?: string): Promise<AxiosResponse<any>> {
    try {
        headers = Object.assign({ 'User-Agent': UA, Referer: url }, headers)
        const result = await axios(url, {
            method,
            headers,
            params: query,
            data,
            timeout: 10000,
        })
        return result
    } catch (error) {
        let e: any = {}

        if (error.toJSON) {
            e = error.toJSON()
        } else {
            e = error
        }
        if (!(e instanceof HttpError)) {
            e.status = error?.response?.status || HttpStatusCode.INTERNAL_SERVER_ERROR
            e.data = error?.response?.data
        }
        console.log(e)
        return e
    }
}
class AjaxConfig {
    url: string
    query?: any = {}
    data?: any = {}
    method?: any = 'GET'
    headers?: any = {}
    charset?: string
}
/**
 *  axios 封装
 *
 * @author CaoMeiYouRen
 * @date 2020-06-17
 * @export
 * @param {AjaxConfig} [config=new AjaxConfig()]
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function ajax2(config: AjaxConfig = new AjaxConfig()): Promise<AxiosResponse<any>> {
    try {
        const { url, query, data, method, charset } = config
        const headers = Object.assign({ 'User-Agent': UA, Referer: url }, config.headers)
        const result = await axios(url, {
            method,
            headers,
            params: query,
            data,
            timeout: 10000,
            transformRequest(_data) {
                if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                    _data = queryString.stringify(_data)
                }
                return _data
            },
        })
        return result
    } catch (error) {
        let e: any = {}

        if (error.toJSON) {
            e = error.toJSON()
        } else {
            e = error
        }
        if (!(e instanceof HttpError)) {
            e.status = error?.response?.status || HttpStatusCode.INTERNAL_SERVER_ERROR
            e.data = error?.response?.data
        }
        console.log(e)
        return e
    }
}

/**
 * 获取本机外网IP
 *
 * @author CaoMeiYouRen
 * @date 2019-07-24
 * @export
 * @returns {Promise<string>}
 */
export async function getPublicIP(): Promise<string> {
    try {
        const res = await axios.get('https://ipv4.icanhazip.com/')
        let ip: string = res.data
        ip = ip.replace(/\n/g, '')
        return ip
    } catch (error) {
        console.log(error)
        return ''
    }
}