import { DefaultState } from "koa";
import Router from 'koa-router';
import koaBody from 'koa-body';

import path from 'path';
import fs from 'fs';

import { Buffer } from "buffer";
import { IKoaContent } from "./server";
import { transform } from "./pngToJpeg/byJimp";

const router = new Router<DefaultState, IKoaContent>();

router
  .get('/err', () => {
    // for test case `if router throw error`
    throw new Error('Testing');
  })
  .post('/to_jpeg', koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../uploads/png'),
      keepExtensions: true,
    },
  }), async (ctx) => {
    // console.log(ctx.request.body);
    const { pngFile } = ctx.request.files;
    if (pngFile === undefined) {
      ctx.body = 'Please upload png with field name "pngFile"'
      ctx.status = 400;
      return;
    }

    if (Array.isArray(pngFile)) {
      ctx.body = 'Please upload 1 png at a time'
      ctx.status = 400;
      return;
    }

    // console.log('pngFile.filepath : ', pngFile.filepath);
    if (!fs.existsSync(pngFile.filepath)) {
      ctx.body = 'Something wrong with upload dir. Please try again';
      ctx.status = 500;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      if (ctx.request.body.notUseWorker !== 'true') {
        ctx.workerPool.runTask(pngFile.filepath, (err, result) => {
          // console.log(err, result);
          if (err) {
            ctx.body = 'png transform error';
            ctx.status = 500;
            reject(err);
          } else {
            ctx.body = Buffer.from(result);
            ctx.status = 200;
            ctx.type = 'image/jpeg';
            console.log('i : ', ctx.request.body.i);
            resolve();
          }
        });
      } else {
        transform(pngFile.filepath).then((result) => {
          ctx.body = result;
          ctx.status = 200;
          ctx.type = 'image/jpeg';
          console.log('i : ', ctx.request.body.i);
          resolve();
        });
      }
    })
  });

export default router;
