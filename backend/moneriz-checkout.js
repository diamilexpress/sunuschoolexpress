/**
 * Module d'intégration Checkout Moneriz API v1 pour SunuSchool Express
 * Création de session de paiement sécurisée en mode Liveframe (iframe) ou Redirection.
 */

const MONERIZ_API_BASE = 'https://api.moneriz.com';

/**
 * Prépare et appelle l'API Moneriz pour générer une session de paiement
 * @param {Object} attempt - Objet contenant la requête et les clés d'idempotence
 * @param {Function} saveSession - Callback pour persister la session créée en base
 * @returns {Promise<Object>} Session créée ({ id, integrationMode, checkoutUrl, embedUrl })
 */
async function createMonerizCheckout(attempt, saveSession) {
  if (attempt.session) {
    return { status: 200, data: attempt.session };
  }

  const secret = process.env.MONERIZ_SECRET_KEY;
  if (!secret) {
    return {
      status: 503,
      error: { code: 'CHECKOUT_NOT_CONFIGURED', message: 'La clé MONERIZ_SECRET_KEY n\'est pas configurée dans les variables d\'environnement.' }
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${MONERIZ_API_BASE}/v1/checkout-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': attempt.idempotencyKey
      },
      body: JSON.stringify(attempt.request),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const code = result?.error?.code || 'MONERIZ_UNAVAILABLE';
      const param = result?.error?.param;
      const message = result?.error?.message || 'Erreur lors de la création de session Moneriz';
      return {
        status: [401, 403].includes(response.status) ? 503 : response.status,
        error: { code, param, message }
      };
    }

    if (
      !result ||
      typeof result.id !== 'string' ||
      !result.id.startsWith('cs_') ||
      result.amount !== attempt.request.amount ||
      result.currency !== attempt.request.currency ||
      result.reference !== attempt.request.reference ||
      result.integrationMode !== attempt.request.integrationMode ||
      !['redirect', 'iframe'].includes(result.integrationMode) ||
      typeof result.checkoutUrl !== 'string' ||
      (result.integrationMode === 'iframe' && !result.embedUrl)
    ) {
      console.warn('[MONERIZ CHECKOUT] Réponse invalide du serveur Moneriz:', result);
      return {
        status: 502,
        error: { code: 'INVALID_CHECKOUT_RESPONSE', message: 'Réponse inattendue de l\'API Moneriz.' }
      };
    }

    const session = {
      id: result.id,
      integrationMode: result.integrationMode,
      checkoutUrl: result.checkoutUrl,
      embedUrl: result.embedUrl
    };

    if (typeof saveSession === 'function') {
      await saveSession(session);
    }

    return { status: 201, data: session };
  } catch (err) {
    console.error('[MONERIZ CHECKOUT] Échec de communication:', err.message);
    return {
      status: 503,
      error: { code: 'CHECKOUT_RESULT_UNKNOWN', message: 'Délai d\'attente dépassé ou coupure réseau vers Moneriz.' }
    };
  }
}

module.exports = {
  createMonerizCheckout
};
