import fs from 'fs';

function encodeImage(filePath: string, mimeType: string) {
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

const bgBase64 = encodeImage('public/bg.png', 'image/png');
const logoBase64 = encodeImage('public/logo.png', 'image/png');

const tsContent = `export const bgImage = "${bgBase64}";\nexport const logoImage = "${logoBase64}";\n`;

fs.mkdirSync('src/assets', { recursive: true });
fs.writeFileSync('src/assets/images.ts', tsContent);
console.log('Images encoded successfully!');
