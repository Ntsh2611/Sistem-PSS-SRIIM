import fetch from 'node-fetch';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwAF2pQMt5H6qvCY5r1NEzQI5HIiAcCdjSTg9Z6wEOLWSREl35NsJSs66bcerwe3Vofsw/exec';

async function extractPasswords() {
  try {
    // We send a bad action, wait, I can only trigger what is defined in doGet. 
    // They didn't define getPasswords in doGet. How to get the sheet data?
    // I cannot extract it unless I ask them to add action = 'getPasswords'
  } catch (e) {
    console.error(e);
  }
}
