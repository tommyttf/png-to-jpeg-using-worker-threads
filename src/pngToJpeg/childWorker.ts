import { workerData, parentPort, threadId } from 'worker_threads';

parentPort.on('message', (pngFilePath) => {
  console.log(`running task on thread: ${threadId}`)
  import(workerData.transImgFilePath)
    .then(({ transform }) => transform(pngFilePath))
    .then((buffer) => {
      parentPort.postMessage(buffer, [buffer.buffer]);
    })
    .catch((err) => {
      parentPort.postMessage({ err });
    })
});

