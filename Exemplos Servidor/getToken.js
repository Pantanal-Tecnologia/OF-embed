// EXEMPLO  de uso em NODE JS


const https = require('https');

const endPointBack = 'https://of.pantanaltec.com.br';

async function getToken(sistema, tipo, stackId, user, hash, devMode = false) {
  const postData = JSON.stringify({
    sistema,
    tipo,
    user,
    [String(tipo).toLowerCase()]: stackId,
    password: hash,
  });

  const options = {
    hostname: 'of.pantanaltec.com.br',
    path: '/loginAPI',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const content = JSON.parse(data);
        if (content.token) {
          resolve(content.token);
        } else {
          reject(new Error('Token not found in response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Exemplo de uso
const tipo = 'FORNECEDOR'; // OU 'CLIENTE'
const fornecedorId = 2814; // OU CLIENTE = 1
const stackId = fornecedorId;
const user = 'marcos.joaquim@jumasa.com.br';
const hash = 'b1687e0ecc5a84a7a5cf3378ebb051d4';

getToken('ABRANGE', tipo, stackId, user, hash, false)
  .then((token) => {
    console.log('Token:', token);
  })
  .catch((error) => {
    console.error('Error:', error);
  });