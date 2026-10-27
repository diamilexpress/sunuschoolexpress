const crypto = require('crypto');

const TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Vérifie la signature cryptographique HMAC-SHA256 d'un webhook Moneriz
 * @param {string} rawBody - Corps brut de la requête (string UTF-8)
 * @param {string} secret - Secret du webhook (MONERIZ_WEBHOOK_SECRET)
 * @param {string} header - En-tête X-Moneriz-Signature (t=<timestamp_ms>,v1=<hex>)
 * @returns {boolean}
 */
function verifyMonerizSignature(rawBody, secret, header) {
  if (!rawBody || !secret || !header) return false;

  // 1. Découper `t=<unix_ms>,v1=<hex>`
  let t;
  let v1;
  for (const part of header.split(',')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name === 't') {
      if (t !== undefined) return false;
      t = value;
    }
    if (name === 'v1') {
      if (v1 !== undefined) return false;
      v1 = value;
    }
  }
  if (!t || !/^\d+$/.test(t) || !v1 || !/^[0-9a-f]{64}$/.test(v1)) return false;

  // 2. Protection contre le rejeu : fenêtre de 5 minutes
  const timestamp = Number(t);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() - timestamp) > TOLERANCE_MS) {
    return false;
  }

  // 3. HMAC sur `${t}.${rawBody}`, avec le t reçu tel quel
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');

  // 4. Comparaison à temps constant, JAMAIS ===
  const received = Buffer.from(v1, 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  if (received.length !== computed.length) return false;
  return crypto.timingSafeEqual(received, computed);
}

module.exports = {
  verifyMonerizSignature
};
