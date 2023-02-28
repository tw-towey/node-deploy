#!/usr/bin/env node
import axios from './axios.js';
import config from './config.js';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import child_process from 'child_process';
import crypto from 'crypto';


const Log = console.log;
const program = new Command();
program
  .option('-u, --user <用户手机号码>')
  .option('-p, --password <密码>')
program.parse();
//获取命令行输入参数
const opts = program.opts();


//启动程序
initArgs();
// 初始化参数
function initArgs(){
  if(!opts.user){
    inquirer.prompt({
      type: 'input',
      name: '你输入你需要登录的手机号码',
      message: '',
    }).then(async (answer) => {
      opts.user = answer['你输入你需要登录的手机号码'];
      if(!opts.password){
        inquirer.prompt({
          type: 'input',
          name: '请输入你的密码',
          default() {
            return '123456'; 
          },
        }).then((answer)=>{
          console.log(answer);
          opts.password = answer['请输入你的密码'];
          getToken();
        })
      }
    }).catch((error) => {
      Log(chalk.hex('#FFA500')(` ---------------- 接受参数出错 ${error} ---------------- `));
    })
  } else if(!opts.password){
      inquirer.prompt({
        type: 'input',
        name: '请输入你的密码',
        default() {
          return '123456'; 
        },
      }).then((answer)=>{
        console.log(answer);
        opts.password = answer['请输入你的密码'];
        getToken();
      })
  }else {
    getToken();
  }
}

// 获取token
function getToken() {
  if(!opts.user || !opts.password){
    Log(chalk.hex('#FFA500')(` ---------------- 获取失败${ opts.user, opts.password }---------------- `));
    return;
  }
  Log(chalk.blue(` ---------------- 开始获取token ---------------- `));
  let args = {
    demand: {
      userName: opts.user,
      password: crypto.createHash('md5').update(opts.password).digest("hex"),
      productId: "1"
    }
  }
  axios.post(config.commonUrl.dologin, args).then((res)=>{
    let token = res.data.serviceResult.data.token;
    Log(chalk.blue(`token: ${ token }`));
    if(token){
      child_process.exec(`echo ${token} | clip`);
      Log(chalk.yellow('\n'));
      Log(chalk.blue(`token: 获取成功，已复制到粘贴板`));
    }
  }).catch((err) => {
    Log(chalk.hex('#FFA500')(` ---------------- 获取失败 ---------------- `));
  })
}


