import Koa, { DefaultState } from "koa";
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
  numThreads: number;
  port: number;
}

const fileExt = process.env.NODE_ENV === 'production' ? '.js' : '.ts';

export default class KoaApp {
  private config: IConfig;
  private readonly workerPool: WorkerPool;

  private readonly server: Server;

  constructor(config: IConfig) {
    this.config = config;

    // max number of threads will be number of cpu
    const numThreads = Math.min(config.numThreads || 1, os.cpus().length)
    this.workerPool = new WorkerPool(
      numThreads,
      path.join(__dirname, './worker.cjs'),
      {
        workerData: {
          childWorkerPath: path.join(__dirname, `./pngToJpeg/childWorker${fileExt}`),
          transImgFilePath: path.join(__dirname, `./pngToJpeg/byJimp${fileExt}`)
        }
      }
    );
    // // if there will be a lot of tasks incoming, better set larger max listeners
    // this.workerPool.setMaxListeners(50);

    console.log(`init worker pool with ${numThreads} workers`)

    const app = new Koa<DefaultState, IKoaContent>();
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
