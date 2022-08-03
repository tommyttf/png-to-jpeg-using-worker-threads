const { workerData } = require('worker_threads');

if (workerData.childWorkerPath.endsWith('.ts')) {
  require('ts-node').register();
}
require(workerData.childWorkerPath);
