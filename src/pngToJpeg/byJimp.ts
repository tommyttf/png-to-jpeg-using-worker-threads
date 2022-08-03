import Jimp from 'jimp';

const transform = (pngFilePath: string) => Jimp.read(pngFilePath)
  .then((image) => image.getBufferAsync(Jimp.MIME_JPEG));

export { transform };
