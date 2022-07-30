import Router from 'koa-router';
import koaBody from 'koa-body';

import Sharp from 'sharp';

import path from 'path';
import fs from 'fs';

const router = new Router();

router
  .post('/to_jpeg', koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../uploads/png'),
      keepExtensions: true,
    },
  }), async (ctx) => {
    // console.log(ctx);
    const pngFile = ctx.request.files.pngImg;
    if (Array.isArray(pngFile)) {
      // just consider upload 1 png file per request
      ctx.status = 400;
      return;
    }

    // console.log('pngFile.filepath : ', pngFile.filepath);
    if (!fs.existsSync(pngFile.filepath)) {
      ctx.status = 400;
      return;
    }

    ctx.body = await Sharp(pngFile.filepath).jpeg().toBuffer();
    ctx.status = 200;
    ctx.type = 'image/jpeg';
  });

export default router;
