<!--
 * @Author: tuWei
 * @Date: 2023-02-13 15:01:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-01 01:38:39
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
### rebot(robotjs)指令

rebot使用的是robotjs包依赖`node-gyp`;

`node-gyp`是一个跨平台的命令行工具，在Node.js中使用，用于为Node.js编译原生插件模块。我包含了一个gyp-next的分叉(gyp-next之前由Chromium在使用)，扩展用于支持Node.js原生插件的开发

- Windows 

  - windows-build-tools npm package (npm install --global --production windows-build-tools from an elevated PowerShell or CMD.exe)


- Mac 

  如果系统升到了macOS Catalina(10.15+)，需要单独看 macOS_Catalina.md。
  - Python v3.6+
  - Xcode 
    需要安装XCode命令行工具，`xcode-select --install`
    如果已经安装了完整的Xcode，要通过菜单 Xcode -> Open Developer Tool -> More Developer Tools，进行clang、clang++、make的安装

    
Install node-gyp using npm: 使用 npm 安装 node-gyp:

```shell
  npm install -g node-gyp
```

### 自定义命令存放位置

mac包位置


```shell
npm config get prefix
/usr/local

/usr/local/lib/node_modules
```

mac执行文件位置

```shell
/usr/local/bin/token
```

windows

执行文件 `token.cmd`

```shell
npm config get prefix
C:\Users\tony\AppData\Roaming\npm
```

包文件位置 `token.cmd`;

```shell
C:\Users\tony\AppData\Roaming\npm\node_modules\node
```