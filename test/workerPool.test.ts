import WorkerPool from "../src/workerPool";
import path from "path";

let workerPool: WorkerPool;

beforeAll(() => {
  workerPool = new WorkerPool(
    1, // for 'if worker pool works when no free threads'
    path.join(__dirname, './worker/index.cjs')
  );
});

afterAll(done => {
  workerPool.close()
    .then(done);
})

describe('Worker Pool', () => {
  test('if worker pool works normally', done => {
    workerPool.runTask(20, (err, result) => {
      expect(result).toBe(10946);
      expect(err).toBeNull();
      done();
    })
  });

  test('if worker pool works when no free threads', done => {
    // call 3 tasks at the same time with 1 worker in pool only
    Promise.all([
      new Promise<void>((resolve) => {
        workerPool.runTask(30, (err, result) => {
          expect(result).toBe(1346269);
          expect(err).toBeNull();
          resolve();
        })
      }),
      new Promise<void>((resolve) => {
        workerPool.runTask(30, (err, result) => {
          expect(result).toBe(1346269);
          expect(err).toBeNull();
          resolve();
        })
      }),
      new Promise<void>((resolve) => {
        workerPool.runTask(30, (err, result) => {
          expect(result).toBe(1346269);
          expect(err).toBeNull();
          resolve();
        })
      })
    ])
      .then(() => {
        done();
      })

  });

  test('if worker pool catch error properly', done => {
    workerPool.runTask('dummy', (err, result) => {
      expect(result).toBeNull();
      expect(err.message).toBe('Not a number');
      done();
    })
  })
});
