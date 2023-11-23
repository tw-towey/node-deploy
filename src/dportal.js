

import Koa from 'koa';
import staticMiddleware from 'koa-static';

const app = new Koa();
const staticMiddleware1 = staticMiddleware("./src/devPortal");
app.use(staticMiddleware1);
app.listen(8080, () => {
  console.log("Server started on port 8080");
});
