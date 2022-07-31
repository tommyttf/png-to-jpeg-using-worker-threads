import { workerData, parentPort } from 'worker_threads';

parentPort.once('message', (pngFilePath) => {
  import(workerData.transImgPath)
    .then(({ transform }) => transform(pngFilePath))
    .then((buffer) => {
      parentPort.postMessage(buffer, [buffer.buffer]);
    })
    .catch((err) => {
      parentPort.postMessage({ err });
    })
});

