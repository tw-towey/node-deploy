#!/usr/bin/env node
import got, { Options } from 'got';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { FormData } from 'formdata-node'; 
import * as cheerio from 'cheerio';
import chalk from 'chalk';
import axios from './axios.js';
import config from './config.js';


const { getSign, queryAppInnerVersion, saveSoftwareVersion, updateOssUrl, queryPagedSoftwareVersion, saveUpdateSettingByStrategyAll } = config.commonUrl;
const { productId } = config;

let isCloseRun = false;
let getH5AppUrl, version, software_id, lastVersionRow;
const startNow = Date.now();
const bufferArr = [];
const Log = console.log;
const program = new Command();
program
  .option('-n, --name <name>')
  .option('-v, --version <版本>')
  .option('-f, --forced <是否强制发布版本>');
program.parse();
//获取命令行输入参数
const opts = program.opts();


checkoutNameAndVersion();

//检验版本号
async function checkoutNameAndVersion(){
  if(!opts.version || !opts.name){
    Log(chalk.blue(' ---------------- 正在匹配项目与版本号...  ---------------- '));
    isCloseRun = true;
    if(!opts.name){
      inquirer.prompt({
        type: 'list',
        name: '你选择需要运行的项目',
        message: '',
        choices: [
          ...Object.keys(config.pList)
        ],
      }).then(async (answer) => {
        isCloseRun = false;
        opts.name = answer['你选择需要运行的项目'];
        software_id = config.pList[opts.name].software_id;
        if(!lastVersionRow){
          lastVersionRow = await versionTesting();
        }
        if(!opts.version){
          inquirer.prompt({
            type: 'input',
            name: '请输入你需要运行的项版本号',
            default() {
              let copyVersion = lastVersionRow.version;
              return copyVersion.substr(0, copyVersion.lastIndexOf('.')) + '.' + (copyVersion.substr(copyVersion.lastIndexOf('.') + 1, copyVersion.length - 1) * 1 + 1); 
            },
          }).then((answer)=>{
            isCloseRun = false;
            console.log(answer);
            opts.version = answer['请输入你需要运行的项版本号'];
            initRun();
          })
        }else{
          initRun();
        }
      })
    }
  }else{
    initRun();
  }
}

//初始化程序
function initRun(){
  version = opts.version;
  if(isCloseRun) return;
  try{
    let pname = config.pList[opts.name].name;
    software_id = config.pList[opts.name].software_id;
    let nameVers = pname.substr(0, pname.length - 4) + version + pname.substr(-5);
    getH5AppUrl = `https://yunwei-lonch.oss-cn-beijing.aliyuncs.com/package/${pname}/${nameVers}.zip`;
    Log(chalk.blue(` ---------------- 包下载地址: ${getH5AppUrl} ---------------- `));
  }catch{
    Log(chalk.hex('#FFA500')(` ---------------- name 不存在 ${opts.name} ---------------- `));
    return;
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
    //根据id查询所有可用版本
    if(version === lastVersionRow.version && !opts.forced){
      Log(chalk.hex('#FFA500')(' ---------------- 当前上传包于已经发布版本一致，请更新版本号后发布, 如需强制更新上传请加参数 -f 1 ----------------'));
      return;
    }
    if(!isCloseRun){
      //上传zip包
      Log(chalk.blue(' ---------------- 下载zip包完成 - 开始上传zip包----------------'));
      updateFile();
    }
  });
  }
}

//开始上传
async function versionTesting() {
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
      Log(chalk.blue(' ---------------- zip上传完成 - 开始解析OSS地址----------------'));
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
    Log(chalk.blue(` ---------------- 软件版本保存完成，正在发布新版本 ---------------- `));
    // 需要再次获取新发布的App包
    lastVersionRow = await versionTesting();
    //发布新版本包
    let saveUpdateSettingArgs = {
      demand: {
        productId: productId,
        force_update: true,
        current: 1,
        rowCount: 100,
        version_id: lastVersionRow.id,
        strategy_id: '001', //策略类型
        software_id: software_id,
        moduleCode: "000705"
      },
    }
    await sendApi(saveUpdateSettingByStrategyAll, saveUpdateSettingArgs);
    Log(chalk.blue(` ---------------- 新版本发布完成,版本号为：${version} ---------------- `));
}

//api请求
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