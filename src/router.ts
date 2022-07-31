import Router from 'koa-router';
import koaBody from 'koa-body';

import path from 'path';
import fs from 'fs';

import { Worker } from 'worker_threads';
import { Buffer } from "buffer";

const fileExt = process.env.NODE_ENV === 'development' ? '.ts' : '.js';

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
      ctx.body = 'Please upload 1 png at a time'
      ctx.status = 400;
      return;
    }

    // console.log('pngFile.filepath : ', pngFile.filepath);
    if (!fs.existsSync(pngFile.filepath)) {
      ctx.status = 500;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, './worker.cjs'), {
        workerData: {
          tsPath: path.join(__dirname, `./pngToJpeg/childWorker${fileExt}`),
          transImgPath: path.join(__dirname, `./pngToJpeg/byJimp${fileExt}`)
        }
      });

      worker.on('message', (result) => {
        if (!result.err) {
          ctx.body = Buffer.from(result);
          ctx.status = 200;
          ctx.type = 'image/jpeg';
          resolve();
        } else {
          console.error('pngToJpeg err : ', result.err);
          ctx.body = 'png transform error';
          ctx.status = 500;
          reject(result.err);
        }
      });

      worker.on('error', (err) => {
        console.error('pngToJpeg err : ', err);
        ctx.body = 'png transform error';
        ctx.status = 500;
        reject(err);
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          ctx.status = 500;
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      console.log('Start to post png path child worker');      worker.postMessage(pngFile.filepath);
    });
    console.log('Finish await worker promise');
  });

export default router;
