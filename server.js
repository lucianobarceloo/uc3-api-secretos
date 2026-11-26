require('dotenv').config(); // solo desarrollo; no sobrescribe el entorno real
const express = require('express');
const _ = require('lodash');
const app = express();

async function cargarApiKey() {
  if (process.env.SECRET_SOURCE === 'vault') {
    const res = await fetch(
      `${process.env.VAULT_ADDR}/v1/secret/data/api-segura`,
      { headers: { 'X-Vault-Token': process.env.VAULT_TOKEN } }
    );
    if (!res.ok) throw new Error('Boveda no disponible');
    const body = await res.json();
    return body.data.data.API_KEY;
  }
  if (!process.env.API_KEY)
    throw new Error('Falta API_KEY (entorno o Codespaces secret)');
  return process.env.API_KEY;
}

cargarApiKey().then((API_KEY) => {
  app.get('/api/datos', (req, res) => {
    if (req.headers['x-api-key'] !== API_KEY)
      return res.status(401).json({ error: 'no autorizado' });
    res.json({ ok: true, lodash: _.VERSION });
  });
  app.listen(3000, () => console.log('API lista en puerto 3000'));
}).catch((e) => { console.error(e.message); process.exit(1); });
