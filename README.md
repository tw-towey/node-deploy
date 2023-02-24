<!--
 * @Author: tuWei
 * @Date: 2023-02-13 15:01:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 20:08:01
-->
### 操作步骤

#### node小工具

详情请查看`package.json`
推荐使用pnpm安装依赖

#### 1.pnpm本地启动

进入本地目录执行

```bash
npm install pnpm -g
cd node-deploy
pnpm install
npm link
```

### 2.npm全局安装使用

```shell
cd node-deploy
npm link
npm install -g 
```

运行命令

```shell
deploy 
# token --lelp
# deploy --lelp
```
