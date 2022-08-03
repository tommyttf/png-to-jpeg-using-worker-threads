const { parentPort } = require("worker_threads");

const fibonacci = (n) => {
  if (n === 0 || n === 1) {
    return 1;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}
parentPort.on('message', (num) => {
  if (typeof num !== 'number') {
    throw new Error('Not a number');
  } else {
    parentPort.postMessage(fibonacci(num));
  }
});
