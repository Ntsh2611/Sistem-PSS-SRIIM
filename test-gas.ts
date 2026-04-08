import fetch from 'node-fetch';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwAF2pQMt5H6qvCY5r1NEzQI5HIiAcCdjSTg9Z6wEOLWSREl35NsJSs66bcerwe3Vofsw/exec';

async function test() {
  try {
    const res = await fetch(`${GAS_URL}?action=getTeachers`);
    const text = await res.text();
    console.log("getTeacherLoans:", text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
