#!/usr/bin/env node
import { spawn } from 'child_process';
function startChildProcess() {
  try{

    const child = spawn('node', ['./src/dportal.js'], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    child.on('error', (err) => {
      console.error(`Child process error: ${err}`);
    });

    child.on('exit', (code, signal) => {
      console.log(`Child process exited with code ${code} and signal ${signal}`);
      // 在这里可以根据需要重新启动子进程
      startChildProcess();
    });
  }catch (e){
    console.log('e :>> ', e);
  }
  

  
  console.log('服务启动成功 :>>>> devportal');
}

startChildProcess();