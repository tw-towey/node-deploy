import Koa from 'koa';
import got, { Options } from 'got';
import { createWriteStream } from 'node:fs';
import compressing from 'compressing';
import staticMiddleware from 'koa-static';
import { join } from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// 创建一个可写流，将子进程的输出写入日志文件
const logStream = createWriteStream('portal_serve.log', { flags: 'a' });
const urlFile = "https://test-lonchbi.lonch.com.cn/devPortal.zip";
// 解压目录
const unfileUrl = join(process.env.USERPROFILE || process.env.HOME, './');
const app = new Koa();
runServe();

function runServe(){
  const options = new Options({
    isStream: true,
  });
  try {
    // 下载可读流
    const stream = got.get(urlFile, options);
    // 直接将可读流传入compressing解压
    compressing.zip.uncompress(stream, unfileUrl)
    
    logStream.write(new Date() + "下载文件解压成功\n");
    const staticMiddleware1 = staticMiddleware(join(process.env.USERPROFILE || process.env.HOME, './devPortal'));
    app.use(staticMiddleware1);
  } catch (error) {
    reject(error)
  }
}
app.listen(8080, () => {
  logStream.write( new Date() + "Server started on port 8080\n" + "进程pid:" + process.pid + "\n");
  logStream.write( "如需结束服务 kill " + process.pid);
});



// const temFile = join(__dirname, './devPortal.zip');
// downLoadFile().then(()=>{
//   compressing.zip.uncompress(temFile, join(process.env.USERPROFILE || process.env.HOME, './'))
//   .then(serveRun)
//   .catch((e)=>{
//     logStream.write('下载文件解压失败' + e + '\n');
//   });
// }).catch((err)=>{
//   logStream.write( '下载文件失败 ' + err + '\n');
// })

// function downLoadFile(){
//   let isCloseRun = false;
//   const writableStream = createWriteStream(temFile);
//   return new Promise((resolve, reject)=>{
//     const options = new Options({
//       isStream: true,
//     });
//     try {
//       const stream = got.get(urlFile, options);
//       stream.on('error',(error)=>{
//         reject(error)
//         isCloseRun = true;
//       })
//       stream.on('data', (chunk)=>{
//         writableStream.write(chunk);
//       });
//       stream.on('end', async ()=>{
//         writableStream.end();
//         if(!isCloseRun){
//           resolve();
//         }
//       });
//     } catch (error) {
//       reject(error)
//     }
//   })
// }

// function serveRun(){
//   // 删除下载文件
//   unlink(temFile,(err)=>{
//     if (err) throw err;
//   });
//   // 兼容mac写法process.env.HOME
//   const staticMiddleware1 = staticMiddleware(join(process.env.USERPROFILE || process.env.HOME, './devPortal'));
//   app.use(staticMiddleware1);
// }

// app.listen(8080, () => {
//   logStream.write("Server started on port 8080  pid: " + process.pid + "\n");
// });

// process.on('close', ()=>{
//   logStream.end();
// })
// // 监听写入完成事件
// logStream.on('finish', () => {
//   logStream.end();
// });

