import Yaml from 'js-yaml';

import path from 'path';
import fs from 'fs';

import KoaApp, { IConfig } from "./server";

const configPath = path.join(
  __dirname,
  process.env.NODE_ENV === 'development'
    ? '../config.dev.yml'
    : '../config.prod.yml',
);
const config = <IConfig>Yaml.load(fs.readFileSync(configPath, 'utf8'));

const koaApp = new KoaApp(config);
export { koaApp };
