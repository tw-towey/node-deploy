import Koa from 'koa';
import got, { Options } from 'got';
import { createWriteStream, unlink } from 'node:fs';
import compressing from 'compressing';
import staticMiddleware from 'koa-static';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// 创建一个可写流，将子进程的输出写入日志文件
const logStream = createWriteStream('portal_serve.log', { flags: 'a' });


const urlFile = "https://test-lonchbi.lonch.com.cn/devPortal.zip";
const temFile = join(__dirname, './devPortal.zip');
const app = new Koa();
downLoadFile().then(()=>{
  compressing.zip.uncompress(temFile, join(process.env.USERPROFILE || process.env.HOME, './'))
  .then(serveRun)
  .catch((e)=>{
    logStream.write('下载文件解压失败' + e + '\n');
  });
}).catch((err)=>{
  logStream.write( '下载文件失败 ' + err + '\n');
})

function downLoadFile(){
  let isCloseRun = false;
  const writableStream = createWriteStream(temFile);
  return new Promise((resolve, reject)=>{
    const options = new Options({
      isStream: true,
    });
    try {
      const stream = got.get(urlFile, options);
      stream.on('error',(error)=>{
        reject(error)
        isCloseRun = true;
      })
      stream.on('data', (chunk)=>{
        writableStream.write(chunk);
      });
      stream.on('end', async ()=>{
        writableStream.end();
        if(!isCloseRun){
          resolve();
        }
      });
    } catch (error) {
      reject(error)
    }
  })
}

function serveRun(){
  // 删除下载文件
  unlink(temFile,(err)=>{
    if (err) throw err;
  });
  // 兼容mac写法process.env.HOME
  const staticMiddleware1 = staticMiddleware(join(process.env.USERPROFILE || process.env.HOME, './devPortal'));
  app.use(staticMiddleware1);
}

app.listen(8080, () => {
  logStream.write("Server started on port 8080  pid: " + process.pid + "\n");
});

process.on('close', ()=>{
  logStream.end();
})
// 监听写入完成事件
logStream.on('finish', () => {
  logStream.end();
});

