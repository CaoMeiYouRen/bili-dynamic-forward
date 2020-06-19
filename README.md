# bili-dynamic-forward

>   草梅B站动态转发

转发B站动态到QQ，基于[coolq-http-api](https://github.com/richardchien/coolq-http-api)、[cq-websocket](https://github.com/momocow/node-cq-websocket)。通过轮询B站的 api 来推送最新动态

## 运行环境

-   coolq-http-api >= 4.5.0
-   node  >= 12

## 安装

从 [releases](https://github.com/CaoMeiYouRen/bili-dynamic-forward/releases) 下载 index.js 文件即可运行

### 配置

支持 `setting.json` 和 `setting.yaml` 格式配置。当两中配置同时存在时优先载入 yaml 格式。配置文件放在项目根目录

```yaml
accessToken: "" # API 访问 token 。见 CQHTTP API 之配置文件说明
enableAPI: true # 启用 /api 连线
enableEvent: true # 启用 /event 连线
protocol: "ws:" # 协议名
host: 127.0.0.1 # '127.0.0.1' 酷Q服务器 IP
port: 6700 # 酷Q服务器端口
baseUrl: "" # 酷Q服务器位址 (SDK在建立连线时会依照此设定加上前缀项 ws:// 及后缀项 `/<api
qq: -1 # 触发 @me 事件用的QQ帐号，通常同登入酷Q之帐号，用在讨论组消息及群消息中辨认是否有人at此帐号
reconnection: true # 是否连线错误时自动重连是否连线错误时自动重连
reconnectionAttempts: 100 # Infinity 连续连线失败的次数不超过这个值
reconnectionDelay: 10000 # 重复连线的延迟时间, 单位: ms
fragmentOutgoingMessages: false # 由于 CQHTTP API 插件的 websocket 服务器尚未支持 fragment, 故建议维持 false 禁用 fragment。※详情请见 WebSocketClient 选项说明。
fragmentationThreshold: 16000 # 0x4000 每个 frame 的最大容量, 默认为 16 KiB, 单位: byte※详情请见 WebSocketClient 选项说明。
tlsOptions: {} # 若需调用安全连线 https.request 时的选项
requestOptions: # 调用 API 方法时的全局默认选项。
    timeout: 10000
```

大部分配置无需变动。需要关注的主要是 accessToken 、host 、port 这几个属性

accessToken：API 访问 token。该项请与 `coolq-http-api` 的`access_token` 字段保持一致。 如果从未修改过access_token 则忽略即可。本机部署可以不使用 access_token ，公网部署请务必使用 access_token

host：酷Q服务器 IP。如果 `coolq-http-api` 部署在本机，则忽略即可。部署在公网请填写公网ip。

port:  酷Q服务器端口。该项请与 `coolq-http-api` 的`ws_port` 字段保持一致。 如果从未修改过 ws_port 则忽略即可。如果存在端口冲突请自行修改为不冲突的端口。

另外请将 `coolq-http-api` 配置中的 `use_ws` 字段置为 `true`，启用 websocket 通信。

更多属性请参考 [CQ HTTP API 配置项](https://cqhttp.cc/docs/#/Configuration) 。

另附 `coolq-http-api`配置参考。

```json
{
    "host": "[::]",
    "port": 5700,
    "use_http": true,
    "ws_host": "[::]",
    "ws_port": 6700,
    "use_ws": true,
    "ws_reverse_url": "",
    "ws_reverse_api_url": "",
    "ws_reverse_event_url": "",
    "ws_reverse_reconnect_interval": 3000,
    "ws_reverse_reconnect_on_code_1000": true,
    "use_ws_reverse": false,
    "post_url": "",
    "access_token": "",
    "secret": "",
    "post_message_format": "string",
    "serve_data_files": false,
    "update_source": "github",
    "update_channel": "stable",
    "auto_check_update": false,
    "auto_perform_update": false,
    "show_log_console": true,
    "log_level": "debug",
    "enable_heartbeat": true,
    "heartbeat_interval": 600000,
    "enable_rate_limited_actions": true,
    "rate_limit_interval": 500 
}
```



## 指令

以下所有指令均支持群聊和私聊，其中群聊仅管理员可用。

>   tips: up主的uid怎么看：点击up主个人空间后，链接中最后那一串数字就是
>
>   例如：https://space.bilibili.com/10822025 ，则uid为 10822025 

### bili主菜单

回复例子：

```
bili主菜单
bili订阅列表
bili订阅 [uid]
bili取消订阅 [uid]
bili取消全部订阅
bili订阅转移 [uid] [?tagid]
bili一键dd [?num]
```

### bili订阅列表

查看当前用户或群的订阅列表。

回复例子：

```
您当前关注的up主如下
1.罗翔说刑法(uid: 517327498)
2.波流音(uid: 2587393)
3.硬核的半佛仙人(uid: 37663924)
4.指法芬芳张大仙(uid: 1935882)
5.老师好我叫何同学(uid: 163637592)
```

### bili订阅 [uid]

订阅up主

发送例子：

```
bili订阅 14110780
```

回复例子：

```
订阅用户 凉风Kaze(uid: 14110780) 成功！
```

### bili取消订阅 [uid]

取消订阅up主

发送例子：

```
bili取消订阅 14110780
```

回复例子：

```
取消订阅用户 凉风Kaze(uid: 14110780) 成功！
```

### bili取消全部订阅

取消全部订阅的up。本功能比较危险，慎用，不可撤销。

回复例子：

```
取消全部订阅成功！
```

### bili订阅转移 [uid] [?tagid]

转移来自某个用户的关注。由于api限制，最多转移最近关注的250位up

tagid可选，如果不填则为全部（250个）。tagid指关注的分组id，例如`https://space.bilibili.com/10822025/fans/follow?tagid=241052`

发送例子1：

```
bili订阅转移 10822025
```

回复例子1：

```
转移用户 草梅友仁(uid: 10822025) 的订阅成功！共转移 250 个订阅(重复订阅会自动剔除)
```

发送例子2：

```
bili订阅转移 10822025 241052
```

回复例子2：

```
转移用户 草梅友仁(uid: 10822025) 的订阅成功！共转移 13 个订阅(重复订阅会自动剔除)
```

### bili一键dd [?num]

一键dd vup/vtuber。名单来自 [https://vtuber.magictea.cc/rank ](https://vtuber.magictea.cc/rank) 。默认取前20位。【排除了几位我觉得不算vup/vtuber的up主，如有需要可以手动关注。[排除名单](https://github.com/CaoMeiYouRen/bili-dynamic-forward/blob/master/src/db/vupBanList.ts)】

发送例子1：

```
bili一键dd
```

回复例子1：

```
一键dd成功！共 dd 20 个 vup/vtuber(重复订阅会自动剔除)
```

发送例子2：

```
bili一键dd 50
```

回复例子2：

```
一键dd成功！共 dd 50 个 vup/vtuber(重复订阅会自动剔除)
```
<<<<<<< HEAD

## 关于

-   为什么会有这个项目
    -   我注意到大部分up主都是有粉丝群的，而很多时候up主在b站的动态不能及时反馈到粉丝群，如果没人搬运可能会漏掉。在还有就是如果一个up主有很多粉丝群，通知个遍也很麻烦（虽然有群管来帮忙，但手动还是有些麻烦啊）
    -   我个人虽然很喜欢刷B站，但是B站毕竟不能在桌面端推送动态，也不能推送到群。因此出现了这个项目。
-   为什么基于 node.js 开发
    -   原因在于B站动态的狗屎api接口。使用其他语言对于解析接口会相当麻烦。易语言就更别提了
    -   因此需要基于 `coolq-http-api` 来开发。

## 作者


👤 **CaoMeiYouRen**

* Website: [https://blog.cmyr.ltd](https://blog.cmyr.ltd)
* GitHub: [@CaoMeiYouRen](https://github.com/CaoMeiYouRen)


## 支持

如果觉得这个项目有用的话请给一颗⭐️，非常感谢


## 📝 License

Copyright © 2020 [CaoMeiYouRen](https://github.com/CaoMeiYouRen).<br />
This project is [MIT](https://github.com/CaoMeiYouRen/bili-dynamic-forward/blob/master/LICENSE) licensed.

=======
>>>>>>> 302e46184e282da5aad0f1bcf6c3a82f5c05f7d3
