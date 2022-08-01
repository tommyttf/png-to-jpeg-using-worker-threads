import Koa from "koa";
import logger from 'koa-logger';
import cors from '@koa/cors';

import os from 'node:os';
import path from "path";
import { Server } from "http";

import router from "./router";
import WorkerPool from "./workerPool";

export interface IKoaContent {
  workerPool: WorkerPool;
}

export interface IConfig {
  port: number;
}

const fileExt = process.env.NODE_ENV === 'development' ? '.ts' : '.js';

export default class KoaApp {
  private config: IConfig;
  private readonly workerPool: WorkerPool;

  private server: Server;

  constructor(config: IConfig) {
    this.config = config;

    this.workerPool = new WorkerPool(
      os.cpus().length,
      path.join(__dirname, './worker.cjs'),
      {
        workerData: {
          childWorkerPath: path.join(__dirname, `./pngToJpeg/childWorker${fileExt}`),
          transImgFilePath: path.join(__dirname, `./pngToJpeg/byJimp${fileExt}`)
        }
      }
    );
    console.log(`init worker pool with ${os.cpus().length} workers`)

    const app = new Koa<any, IKoaContent>();
    app.context.workerPool = this.workerPool;

    this.server = app
      .use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          ctx.status = err.status || 500;
          ctx.body = err.message;
          ctx.app.emit('error', err, ctx);
        }
      })
      .use(logger())
      .use(cors())
      .use(router.routes())
      .use(router.allowedMethods())
      .listen(this.config.port);

    console.log(`App listening on port ${this.config.port}`);
  }

  getServer() {
    return this.server;
  }

  async close() {
    await this.workerPool.close();
    await new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
