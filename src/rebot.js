#!/usr/bin/env node
import chalk from 'chalk';
import robot from 'robotjs';
import readline from 'readline';

const Log = console.log;
Log(chalk.blue(' ---------------- 开始执行监听程序...  ---------------- '));


// 鼠标移动速度
robot.setMouseDelay(6);
// 移动的时间数组(min)
const moveMouseListMin = [6, 8, 10, 12, 14];
// 桌面屏幕尺寸
let screenSize = robot.getScreenSize();

let timmer = null;
//移动总步数
let totalNumber = 0;
//获取当前屏幕x
let moveX = robot.getMousePos().x;
//获取当前屏幕y
let moveY = robot.getMousePos().y;

let moveLength = moveMouseListMin.length - 1;
let direction = 'moveRight'; // 默认向右移动


//执行移动函数
moveMouseHandler();
// 鼠标移动函数处理
async function moveMouseHandler(){
  
  totalNumber += 1;
  // 获取每一次移动间隔
  let randomNum = Math.floor(Math.random() * (moveLength + 1));
  if(moveX >= screenSize.width){
    direction = 'moveLeft';
  }else if(moveX <= 0){
    direction = 'moveRight';
  };
  
  timmer = setInterval(()=>{
    if(direction === 'moveLeft'){
      moveX -= 2;
    }else if(direction === 'moveRight'){
      moveX += 2;
    }
    
    robot.moveMouse(moveX, moveY);
    clearInterval(timmer);
    putOnLogs();
    moveMouseHandler();
  }, moveMouseListMin[randomNum] * 60 * 1000 );
}

function putOnLogs() {
  clearLine();
  process.stdout.write(chalk.blue( `当前移动时间:  `) + chalk.green( `${ Date() }`) + chalk.blue(`  移动总计:  `) + chalk.red(`${totalNumber}`));
  // process.stdout.clearScreenDown();
  // process.stdout.clearLine();
  // process.stdout.moveCursor(0, -1);
}

function clearLine() {
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
}

process.on('exit', ()=>{
  clearInterval(timmer);
  Log(chalk.red(' ---------------- process-exit ---------------- '));
})
