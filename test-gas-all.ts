import fetch from 'node-fetch';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwAF2pQMt5H6qvCY5r1NEzQI5HIiAcCdjSTg9Z6wEOLWSREl35NsJSs66bcerwe3Vofsw/exec';

async function test() {
  try {
    const res1 = await fetch(`${GAS_URL}?action=getBooks`);
    console.log("Books:", (await res1.text()).substring(0, 200));
    
    const res2 = await fetch(`${GAS_URL}?action=getStudents`);
    console.log("Students:", (await res2.text()).substring(0, 200));
    
    const res3 = await fetch(`${GAS_URL}?action=getLoans`);
    console.log("Loans:", (await res3.text()).substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
