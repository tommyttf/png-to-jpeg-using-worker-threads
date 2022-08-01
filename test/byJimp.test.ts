import path from "path";
import { transform } from '../src/pngToJpeg/byJimp';

describe('Jimp transform', () => {
  test('Transform to jpeg buffer', done => {
    transform(path.join(__dirname, './png/test0.png'))
      .then(jpegBuffer => {
        expect(jpegBuffer).toBeInstanceOf(Buffer);
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
