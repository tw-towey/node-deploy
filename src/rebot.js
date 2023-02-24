#!/usr/bin/env node
import chalk from 'chalk';
import { default as robot }  from 'robotjs';

const Log = console.log;
Log(chalk.blue(' ---------------- 开始执行监听程序...  ---------------- '));

// 鼠标移动速度
robot.setMouseDelay(4);
// 移动的时间数组(min)
const moveMouseListMin = [5, 8, 10, 12, 14];
// 桌面屏幕尺寸
const screenSize = robot.getScreenSize();

let timmer = null;
//获取当前屏幕x
let moveX = robot.getMousePos().x;
//获取当前屏幕y
let moveY = robot.getMousePos().y;
let moveLength = moveMouseListMin.length - 1;
let direction = 'moveRight'; // 默认向右移动


//执行移动函数
moveMouseHandler();
// 鼠标移动函数处理
function moveMouseHandler(){
  // 获取每一次移动间隔
  let randomNum = Math.floor(Math.random() * (moveLength + 1));
  
  if(moveX >= screenSize.width){
    direction = 'moveLeft';
  }else if(moveX <= 0){
    direction = 'moveRight';
  };
  
  timmer = setInterval(()=>{
    if(direction === 'moveLeft'){
      moveX -= 5;
    }else if(direction === 'moveRight'){
      moveX += 5;
    }
    robot.moveMouse(moveX, moveY);
    clearInterval(timmer)
    moveMouseHandler();
  }, moveMouseListMin[randomNum] * 60 * 1000);
}

process.on('exit', ()=>{
  clearInterval(timmer);
  Log(chalk.blue(' ---------------- process-exit ---------------- '));
})
