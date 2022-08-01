import request from 'supertest';
import path from "path";

import { koaApp } from "../src";

afterAll(done => {
  koaApp.close()
    .then(() => {
      done();
    });
});

describe('Test koa server', () => {
  test('transform 1 png to jpeg', done => {
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

  test('Upload with wrong field name', done => {
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

  test('transform multiple png', done => {
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
  test('Router throw error', done => {
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
