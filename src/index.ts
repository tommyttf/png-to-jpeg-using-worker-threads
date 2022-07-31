import Koa from 'koa';
import cors from '@koa/cors';
import logger from 'koa-logger';

import Yaml from 'js-yaml';

import path from 'path';
import fs from 'fs';

import router from './router';

const configPath = path.join(
  __dirname,
  process.env.NODE_ENV === 'development'
    ? '../config.dev.yml'
    : '../config.prod.yml',
);
const { port } = <{ port: number }>Yaml.load(fs.readFileSync(configPath, 'utf8'));

const app = new Koa();

app
  .use(logger())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(port);
console.log(`App listening on port ${port}`);
