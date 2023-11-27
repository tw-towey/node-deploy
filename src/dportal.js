import Koa from 'koa';
import staticMiddleware from 'koa-static';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const staticMiddleware1 = staticMiddleware(join(__dirname, './devPortal'));
app.use(staticMiddleware1);
app.listen(8080, () => {
  console.log("Server started on port 8080");
});
