/*
 * @Author: tuWei
 * @Date: 2023-02-09 15:28:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-13 14:50:15
 */
import readLine from "readline";
import got, { Options } from 'got';
import { Command } from 'commander';
import axios from 'axios';
// import fs from 'fs';
import chalk from 'chalk';
import { FormData } from 'formdata-node'; 
import * as cheerio from 'cheerio';
import config from './config.js';
const { getSign, queryAppInnerVersion, saveSoftwareVersion, updateOssUrl, queryPagedSoftwareVersion, saveUpdateSettingByStrategyAll } = config.commonUrl;
const { productId } = config;
axios.interceptors.request.use(
  cfg => {
    cfg.headers['protocol-version'] = "2.0";
    cfg.headers['access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhT3duZXJPcmdJZCI6IjEyOTE3OTE0NTY5MDI4ODEyOCIsImFjY291bnRJZCI6ImRjNjg1ZTUzMzgyODRiMWY4ZmI1MGU5ZmU0ZDM5OTM1IiwicHJvZHVjdElkIjoiMSIsImV4cCI6MTI0NzYyMTEyMTgsInVzZXJJZCI6ImM3M2Y2NzYxYWUzNjQyZGE4ZDk1MzVkNWNhMDM4NTI1IiwidXVpZCI6IjQ0NjBmNTM3NzI3ZDQ2YTNiMTBkNGNiYjUxOGJmZjNhIiwiaWF0IjoxNjc2MjExMjE4LCJ1c2VybmFtZSI6IjE4NTk4NTkyMjg5In0.-iljI95Hs3a0pyew53Zn_reExdcZ3iMFkOxQV3Vj-3s";
    return cfg;
  },
  err => Promise.resolve(err)
);
let isCloseRun = false;
let getH5AppUrl, version, software_id;
const startNow = Date.now();
const bufferArr = [];
const Log = console.log;
const program = new Command();
program
  .option('-n, --name <name>')
  .option('-v, --version <版本>')
  .option('-f, --forced <是否强制发布版本>');

program.parse();
const opts = program.opts();
const RL = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});
// console.log(opts);
checkoutNameAndVersion();
function checkoutNameAndVersion(){
  if(!opts.version || !opts.name){
    Log(chalk.hex('#FFA500')(' ---------------- 请指定项目名称和版本号，详情请看config配置文件 ---------------- '));
    Log(chalk.hex('#FFA500')(' ---------------- 运行格式示例，node main.js -n manage -v v2.0.423  ---------------- '));
    isCloseRun = true;
    if(!opts.name){
      RL.question('请输入你需要运行的项目名称: ', (answer) => {
        opts.name = answer;
        isCloseRun = false;
        checkoutNameAndVersion();
      });
    }
    if(!opts.version){
      RL.question('请输入你需要运行的项版本号: ', (answer) => {
        opts.version = answer;
        isCloseRun = false;
        checkoutNameAndVersion();
      });
    }
  }else{
    RL.close();
    initRun();
  }
}
function initRun(){
  version = opts.version;
  if(isCloseRun) return;
  try{
    let pname = config[opts.name].name;
    let nameVers = pname.substr(0, pname.length - 4) + version + pname.substr(-5);
    getH5AppUrl = `https://yunwei-lonch.oss-cn-beijing.aliyuncs.com/package/${pname}/${nameVers}.zip`;
    Log(chalk.hex('#FFA500')(` ---------------- 包下载地址: ${getH5AppUrl} ---------------- `));
  }catch{
    Log(chalk.hex('#FFA500')(` ---------------- 执行命令格式出错: name 不存在 ${opts.name} ---------------- `));
  }
  try{
    software_id = config[opts.name].software_id;
  }catch {
    isCloseRun = true;
    Log(chalk.hex('#FFA500')(` ---------------- 您指定的项目名称不存在，请检查名称: ${opts.name} ---------------- `));
  }
  //文件流存储
  if(version && software_id){
  const options = new Options({
    isStream: true,
  });
  const stream = got.get(getH5AppUrl, options)
  stream.on('error',()=>{
    isCloseRun = true;
    Log(chalk.hex('#FFA500')(` ---------------- 您指定的版本号不存在，请检查版本号: ${version} ---------------- `));
  })
  //本地测试
  // const ws = fs.createWriteStream(version + '.zip');
  // stream.pipe(ws);
  stream.on('data', (chunk)=>{
    bufferArr.push(chunk);
  });
  stream.on('end', async ()=>{
    Log(chalk.blue(' ---------------- 下载zip包完成 - 开始上传zip包----------------'));
    //根据id查询所有可用版本
    const versionRow = await versionTesting();
    if(version === versionRow.version && !opts.forced){
      Log(chalk.hex('#FFA500')(' ---------------- 当前上传包于已经发布版本一致，请更新版本号后发布, 如需强制更新上传请加参数 -f 1 ----------------'));
      return;
    }
    if(!isCloseRun){
      //上传zip包
      updateFile();
    }
  });
  }
}
//开始上传
const versionTesting = async ()=>{
  let queryPageArgs = {
    demand: {
      productId: productId,
      current: 1,
      rowCount: 100,
      software_id: software_id,
      moduleCode: "000705"
    },
  };
  const queryPagedRes = await sendApi(queryPagedSoftwareVersion, queryPageArgs)
  return queryPagedRes.serviceResult.data.rows && queryPagedRes.serviceResult.data.rows[0];
}

//上传包，获取包地址
async function updateFile(){
    let args = {
        "demand":{
          productId: productId,
          "bucketName":"resources-lonch",
          "basePath":"bi-test/app/package",
          "fileName": `H5-Manage-${version}-test.zip`,
          "isKeepOriginalName": 0,
          "moduleCode": "000703"
        },
        timestamp: Date.now(),
    }
    const signRes = await sendApi(getSign, args);
    const signResult = signRes.serviceResult.data;
    const formData = new FormData();
    let urlText;
    formData['OSSAccessKeyId'] = signResult.accessKeyId;
    formData['policy'] = signResult.policy;
    formData['Signature'] = signResult.signature;
    formData['key'] = signResult.key;
    formData['success_action_status'] = '201';
    formData["Content-Dispositio"] = 'attachment;filename=' + encodeURIComponent(args.demand.fileName) + ';filename*=UTF-8' + encodeURIComponent(version);
    formData['file'] = Buffer.concat(bufferArr);
    const headers = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    try{
      const updateOssRes = await sendApi(updateOssUrl, { ...formData}, headers);
      var $ = cheerio.load(updateOssRes); //如果是html格式
      urlText = $('Location').text();
    }catch(error) {
      Log(chalk.hex('#FFA500')(` ---------------- 软件包地址解析失败 ---------------- `));
    }
    
    //获取内部版本号
    let parmas = {
      "demand":{
        id: software_id,
        productId: productId,
        moduleCode: "000703"
      },
      "sid":"",
      "timestamp": Date.now(),
    }
    const versionfnRes = await sendApi(queryAppInnerVersion, parmas);

    // 保存新的h5版本
    let saveSoftwareArgs = {
      version: version,
      zip_path: urlText,
      release_type: "test",
      software_id : software_id,
      inner_version: versionfnRes.serviceResult.data,
      software_name: ""
    };
    // 获取发布版本号的id
    const rowFlag = await sendApi(saveSoftwareVersion, saveSoftwareArgs);
    if(!rowFlag.serviceResult.success){
      Log(chalk.blue(` ---------------- ${rowFlag.serviceResult.reason} ---------------- `));
      return;
    }
    const versionRow = await versionTesting();
    //发布新版本包
    let saveUpdateSettingArgs = {
      demand: {
        productId: productId,
        force_update: true,
        current: 1,
        rowCount: 100,
        version_id: versionRow.id,
        strategy_id: '001', //策略类型
        software_id: software_id,
        moduleCode: "000705"
      },
    }
    await sendApi(saveUpdateSettingByStrategyAll, saveUpdateSettingArgs);
    Log(chalk.blue(` ---------------- 新版本发布完成,版本号为：${version} ---------------- `));
}

function sendApi(url, args, headers){
  return new Promise((resolve, reject) => {
    axios.post(url, args, headers || null).then((res)=>{
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    })
  })
}

process.on("exit",function(){
  Log(chalk.blue(` ---------------- 运行结束 ---执行耗时：${(Date.now() - startNow) / 1000}s---------------- `));
});