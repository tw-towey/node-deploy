import Koa from 'koa';
import got, { Options } from 'got';
import fs from 'fs';
import compressing from 'compressing';
import staticMiddleware from 'koa-static';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const urlFile = "https://test-lonchbi.lonch.com.cn/devPortal.zip";
const temFile = join(__dirname, './devPortal.zip');
const app = new Koa();
downLoadFile().then(()=>{
  compressing.zip.uncompress(temFile, join(process.env.USERPROFILE || process.env.HOME, './'))
  .then(serveRun)
  .catch(()=>{});
});

function downLoadFile(){
  let isCloseRun = false;
  const writableStream = fs.createWriteStream(temFile);
  return new Promise((resolve, reject)=>{
    const options = new Options({
      isStream: true,
    });
    const stream = got.get(urlFile, options)
    stream.on('error',()=>{
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
  })
}

function serveRun(){
  // 删除下载文件
  fs.unlink(temFile,(err)=>{
    if (err) throw err;
  });
  // 兼容mac写法process.env.HOME
  const staticMiddleware1 = staticMiddleware(join(process.env.USERPROFILE || process.env.HOME, './devPortal'));
  app.use(staticMiddleware1);
}

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
