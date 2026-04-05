import fs from 'fs';
import https from 'https';
import http from 'http';

function download(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (response) => {
      if (response.statusCode && [301, 302, 303, 307, 308].includes(response.statusCode)) {
        if (response.headers.location) {
          download(response.headers.location, dest).then(resolve).catch(reject);
        } else {
          reject(new Error('Redirect without location header'));
        }
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        reject(new Error(`Failed to download, status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

download("https://drive.google.com/uc?export=download&id=1uWswZffILDxMC_RfGt2DXb9FsWfJ2-F2", "public/logo.png")
  .then(() => console.log("Success downloading logo"))
  .catch(e => console.error("Error:", e));
