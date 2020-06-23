import fs = require('fs-extra')
import path = require('path')

export class FileStore {
    /**
     * 数据存储的根路径，默认为 ./data
     *
     * @type {string}
     */
    root: string = './data'
    constructor(root?: string) {
        if (root) {
            this.root = root
        }
        if (!(fs.pathExistsSync(this.root))) {
            fs.mkdirSync(this.root)
        }
    }
    /**
     * 读取文件内容
     *
     * @author CaoMeiYouRen
     * @date 2020-06-23
     * @param {string} key
     * @param {string} [filename='global']
     * @returns {Promise<any>}
     */
    async get(key: string, filename: string = 'global'): Promise<any> {
        let file: any = {}
        const filepath = path.join(this.root, `${filename}.json`)
        if (await (fs.pathExists(filepath))) {
            try {
                file = await fs.readJSON(filepath)
            } catch (error) {
            }
        }
        return file[key]
    }

    /**
     * 写入文件内容
     *
     * @author CaoMeiYouRen
     * @date 2020-06-23
     * @param {string} key
     * @param {*} data
     * @param {string} [filename='global']
     * @returns {Promise<boolean>}
     */
    async set(key: string, data: any, filename: string = 'global'): Promise<boolean> {
        try {
            let file: any = {}
            const filepath = path.join(this.root, `${filename}.json`)
            if (await (fs.pathExists(filepath))) {
                try {
                    file = await fs.readJSON(filepath)
                } catch (error) {
                }
            }
            file[key] = data
            await fs.writeFile(filepath, JSON.stringify(file, null, 4))
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}

export const filestore = new FileStore()