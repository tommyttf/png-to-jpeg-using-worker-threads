import request from 'supertest';
import path from "path";

import { koaApp } from "../src";

afterAll(done => {
  koaApp.close()
    .then(() => {
      done();
    });
});

describe('Koa server', () => {
  it('should transform 1 png to jpeg with worker', done => {
    request(koaApp.getServer()).post('/to_jpeg')
      .attach('pngFile', path.join(__dirname, './png/test0.png'))
      .expect(200)
      .expect('Content-Type', 'image/jpeg')
      .end(err => {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should transform 1 png to jpeg without worker', done => {
    request(koaApp.getServer()).post('/to_jpeg')
      .field('notUseWorker', 'true')
      .attach('pngFile', path.join(__dirname, './png/test0.png'))
      .expect(200)
      .expect('Content-Type', 'image/jpeg')
      .end(err => {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  test('if upload with wrong field name', done => {
    request(koaApp.getServer()).post('/to_jpeg')
      .attach('wrong', path.join(__dirname, './png/test0.png'))
      .expect(400)
      .expect(response => {
        expect(response.text).toBe('Please upload png with field name "pngFile"');
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  test('if transform multiple png', done => {
    request(koaApp.getServer()).post('/to_jpeg')
      .attach('pngFile', path.join(__dirname, './png/test0.png'))
      .attach('pngFile', path.join(__dirname, './png/test0.png'))
      .expect(400)
      .expect(response => {
        expect(response.text).toBe('Please upload 1 png at a time');
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  test('if router throw error', done => {
    request(koaApp.getServer()).get('/err')
      .expect(500)
      .expect(response => {
        expect(response.text).toBe('Testing');
        done();
      })
      .catch(err => {
        done(err);
      })
  })
});
