import fetch from 'node-fetch';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwAF2pQMt5H6qvCY5r1NEzQI5HIiAcCdjSTg9Z6wEOLWSREl35NsJSs66bcerwe3Vofsw/exec';

async function testPost() {
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        payload: { id: 'admin', password: 'pssriim0001' }
      })
    });
    const text = await res.text();
    console.log("Raw Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

async function testGet() {
    try {
      const res = await fetch(`${GAS_URL}?action=getBooks`);
      const data = await res.json();
      console.log("Get response works:", data.length > 0);
    } catch (e) {
      console.error("Error:", e);
    }
}

testPost();
// testGet();
