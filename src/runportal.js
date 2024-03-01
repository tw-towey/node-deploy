#!/usr/bin/env node
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// lsof -i :8080 // 端口

function startChildProcess() {
  try{

    const child = spawn('node', [join(__dirname, './dportal.js')], {
      detached: true, // 表示将子进程设置为独立于父进程运行
      stdio: 'ignore', // 表示忽略子进程的标准输入、输出和错误流
    });

    // 父进程退出，子进程继续运行，不受影响
    child.unref();

    child.on('error', (err) => {
      console.error(`Child process error: ${err}`);
    });

    child.on('close', (err) => {
      console.error(`Child process error: ${err}`);
    });

    child.on('exit', (code, signal) => {
      console.log(`Child process exited with code ${code} and signal ${signal}`);
      // 在这里可以根据需要重新启动子进程
      startChildProcess();
    });
  } catch (e){
    console.log('e :>> ', e);
  }
  

  
  console.log('服务启动成功 :>>>> devportal');
}

startChildProcess();