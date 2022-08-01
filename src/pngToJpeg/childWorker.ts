import { workerData, parentPort } from 'worker_threads';

parentPort.on('message', (pngFilePath) => {
  import(workerData.transImgFilePath)
    .then(({ transform }) => transform(pngFilePath))
    .then((buffer) => {
      parentPort.postMessage(buffer, [buffer.buffer]);
    })
    .catch((err) => {
      parentPort.postMessage({ err });
    })
});

