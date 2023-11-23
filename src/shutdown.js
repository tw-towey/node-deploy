#!/usr/bin/env node
import { Command } from 'commander';
import { exec } from 'child_process';

const program = new Command();
program
  .option('-t, --time <时间>')
  .option('-c, --close <关闭>')
program.parse();
//获取命令行输入参数
const opts = program.opts();
console.log(opts);

// windows 关机命令
// 例如需要 明天凌晨三点关机 -t 3, 如需2点半 -t 2.5
// 如果已经过了12点 也同样可以实现;
// -c a 取消关机指令
shutdownWindow();

function shutdownWindow() {
  let command = null;
  if(opts.time){
    let time = null;
    let shutTime = null;
    // 三点之前关机
    if(new Date().getHours() < 3){
      time = new Date(new Date().toLocaleDateString()).getTime() + 3600000 * opts.time;
    }else if(new Date().getHours() > 3){
      time = new Date(new Date().toLocaleDateString()).getTime() + 86400000 + 3600000 * opts.time;
    }
    shutTime = Math.floor((time - new Date().getTime()) / 1000);
    command = exec(`shutdown -s -t ${shutTime}`, function(err, stdout, stderr) {
      if(err || stderr) {
        console.log("shutdown failed" + err + stderr);
      }else{
        console.log('执行成功');
      }
      console.log('执行成功');
    });
  }
	if(opts.close){
    command = exec(`shutdown -a`, function(err, stdout, stderr) {
      if(err || stderr) {
        console.log("shutdown -a failed" + err + stderr);
      }else{
        console.log('执行成功');
      }
    });
  }
  command.stdin.end();
  command.on('close', function(code) {
    console.log("shutdown", code);
  });
}