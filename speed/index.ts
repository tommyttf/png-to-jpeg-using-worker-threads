import FormData from 'form-data';
import axios from "axios";

import fs from 'fs';
import path from "path";

const num = 20;
// for speed comparison between using workers or not when there are large amount of requests
const notUseWorker = process.env.NOT_USE_WORKER; // 'true' / 'false'

const startTime = new Date().getTime();

Promise.all(
  Array(num).fill(0).map((dummy, i) => {
    // console.log(i);
    const form = new FormData();
    form.append('pngFile', fs.createReadStream(path.join(__dirname, "../test/png/test1.png")));
    form.append('i', i);
    form.append('notUseWorker', notUseWorker);

    return axios.post('http://localhost:32768/to_jpeg', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  })
)
  .then(() => {
    console.log('total used time :', new Date().getTime() - startTime);
  })
  .catch((err) => {
    console.log('error :', err);
  })
