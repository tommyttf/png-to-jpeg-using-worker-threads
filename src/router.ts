import Router from 'koa-router';
import koaBody from 'koa-body';

import path from 'path';
import fs from 'fs';

import { Buffer } from "buffer";
import { IKoaContent } from "./server";

const router = new Router<any, IKoaContent>();

router
  // .post('/to_jpeg_no_worker', koaBody({
  //   multipart: true,
  //   formidable: {
  //     uploadDir: path.join(__dirname, '../uploads/png'),
  //     keepExtensions: true,
  //   },
  // }), async (ctx) => {
  //   if (ctx.request.body.fast) {
  //     ctx.body = 'quick response';
  //     ctx.status = 200;
  //     return;
  //   }
  //   const { pngFile } = ctx.request.files;
  //   if (pngFile === undefined) {
  //     ctx.body = 'Please upload png with field name "pngFile"'
  //     ctx.status = 400;
  //     return;
  //   }
  //
  //   if (Array.isArray(pngFile)) {
  //     ctx.body = 'Please upload 1 png at a time'
  //     ctx.status = 400;
  //     return;
  //   }
  //
  //   // console.log('pngFile.filepath : ', pngFile.filepath);
  //   if (!fs.existsSync(pngFile.filepath)) {
  //     ctx.body = 'Please upload 1 png at a time'
  //     ctx.status = 500;
  //     return;
  //   }
  //   await new Promise<void>((resolve) => {
  //     setTimeout(async () => {
  //       ctx.body = await transform(pngFile.filepath);
  //       ctx.status = 200;
  //       ctx.type = 'image/jpeg';
  //       resolve();
  //     }, 5000);
  //   })
  // })
  .post('/to_jpeg', koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../uploads/png'),
      keepExtensions: true,
    },
  }), async (ctx) => {
    // console.log(ctx.request.body);
    if (ctx.request.body.fast) {
      ctx.body = 'quick response';
      ctx.status = 200;
      return;
    }
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
      ctx.body = 'Please upload 1 png at a time'
      ctx.status = 500;
      return;
    }

    await new Promise<void>((resolve, reject) => {
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
          resolve();
        }
      })
    })
  });

export default router;
