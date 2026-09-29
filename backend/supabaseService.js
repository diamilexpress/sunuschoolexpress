/**
 * SunuSchoolExpress - Supabase Cloud Database Integration
 * Connecteur direct PostgreSQL via API REST Supabase (PostgREST)
 * Synchronisation garantie et permanente entre mobile, tablette et PC
 */

const path = require('path');
const fs = require('fs');

let SUPABASE_URL = process.env.SUPABASE_URL || 'https://hwrnkjzkwzlzzocfnxww.supabase.co';
let SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  try {
    const envFile = path.join(__dirname, '.env');
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, 'utf8').split('\n');
      lines.forEach(l => {
        const line = l.trim();
        if (line && line.startsWith('SUPABASE_KEY=')) {
          SUPABASE_KEY = line.split('=')[1].trim();
        }
      });
    }
  } catch(e) {}
}

function supabaseRequest(path, method = 'GET', body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(path, SUPABASE_URL);
      const postData = body ? JSON.stringify(body) : null;

      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...extraHeaders
      };

      if (postData) {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: method,
        headers: headers
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : null);
            } catch (e) {
              resolve(data);
            }
          } else {
            console.warn(`[SUPABASE] Erreur HTTP ${res.statusCode} sur ${method} ${path}:`, data);
            resolve(null);
          }
        });
      });

      req.on('error', err => {
        console.warn(`[SUPABASE] Erreur réseau sur ${method} ${path}:`, err.message);
        resolve(null);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    } catch (err) {
      console.warn(`[SUPABASE] Exception sur ${method} ${path}:`, err.message);
      resolve(null);
    }
  });
}

// Convertisseur snake_case Supabase <-> camelCase App
function toAppEtab(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    secretKey: row.secret_key,
    name: row.name,
    type: row.type || 'ECOLE',
    city: row.city || 'Dakar',
    phone: row.phone,
    email: row.email,
    directeurNom: row.directeur_nom,
    plan: row.plan || 'Starter',
    requestedPlan: row.requested_plan || null,
    statutChangementFormule: row.statut_changement_formule || null,
    prixMensuel: Number(row.prix_mensuel) || 20000,
    effectif: Number(row.effectif) || 0,
    statut: row.statut || 'EN_ATTENTE_VALIDATION',
    statutAbonnement: row.statut_abonnement || 'EN_ATTENTE_VALIDATION',
    fraisAdhesionPayes: Boolean(row.frais_adhesion_payes),
    dateAdhesion: row.date_adhesion,
    echeanceAbonnement: row.echeance_abonnement,
    waveTransactionRef: row.wave_transaction_ref
  };
}

function toSupabaseEtab(etab) {
  if (!etab) return null;
  return {
    id: etab.id || `etab-${Date.now()}`,
    code: etab.code,
    secret_key: etab.secretKey || null,
    name: etab.name,
    type: etab.type || 'ECOLE',
    city: etab.city || 'Dakar',
    phone: etab.phone || null,
    email: etab.email || null,
    directeur_nom: etab.directeurNom || null,
    plan: etab.plan || 'Starter',
    requested_plan: etab.requestedPlan || null,
    statut_changement_formule: etab.statutChangementFormule || null,
    prix_mensuel: Number(etab.prixMensuel) || 20000,
    effectif: Number(etab.effectif) || 0,
    statut: etab.statut || 'EN_ATTENTE_VALIDATION',
    statut_abonnement: etab.statutAbonnement || 'EN_ATTENTE_VALIDATION',
    frais_adhesion_payes: Boolean(etab.fraisAdhesionPayes),
    date_adhesion: etab.dateAdhesion || new Date().toISOString().split('T')[0],
    echeance_abonnement: etab.echeanceAbonnement || null,
    wave_transaction_ref: etab.waveTransactionRef || null,
    updated_at: new Date().toISOString()
  };
}

async function fetchEtablissementsFromSupabase() {
  const rows = await supabaseRequest('/rest/v1/etablissements?select=*&order=created_at.asc');
  if (!Array.isArray(rows)) return null;
  return rows.map(toAppEtab);
}

async function saveEtablissementToSupabase(etab) {
  const payload = toSupabaseEtab(etab);
  if (!payload || !payload.id) return false;
  const res = await supabaseRequest(
    '/rest/v1/etablissements',
    'POST',
    payload,
    { 'Prefer': 'resolution=merge-duplicates,return=representation' }
  );
  return !!res;
}

async function updateEtablissementInSupabase(idOrCode, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.city !== undefined) dbUpdates.city = updates.city;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.directeurNom !== undefined) dbUpdates.directeur_nom = updates.directeurNom;
  if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
  if (updates.requestedPlan !== undefined) dbUpdates.requested_plan = updates.requestedPlan;
  if (updates.statutChangementFormule !== undefined) dbUpdates.statut_changement_formule = updates.statutChangementFormule;
  if (updates.prixMensuel !== undefined) dbUpdates.prix_mensuel = Number(updates.prixMensuel) || 0;
  if (updates.statut !== undefined) dbUpdates.statut = updates.statut;
  if (updates.statutAbonnement !== undefined) dbUpdates.statut_abonnement = updates.statutAbonnement;
  if (updates.fraisAdhesionPayes !== undefined) dbUpdates.frais_adhesion_payes = Boolean(updates.fraisAdhesionPayes);
  if (updates.echeanceAbonnement !== undefined) dbUpdates.echeance_abonnement = updates.echeanceAbonnement;
  dbUpdates.updated_at = new Date().toISOString();

  // Chercher par id ou par code
  const res = await supabaseRequest(
    `/rest/v1/etablissements?or=(id.eq.${encodeURIComponent(idOrCode)},code.eq.${encodeURIComponent(idOrCode)})`,
    'PATCH',
    dbUpdates,
    { 'Prefer': 'return=representation' }
  );
  return !!res;
}

async function deleteEtablissementFromSupabase(idOrCode) {
  const res = await supabaseRequest(
    `/rest/v1/etablissements?or=(id.eq.${encodeURIComponent(idOrCode)},code.eq.${encodeURIComponent(idOrCode)})`,
    'DELETE'
  );
  return res !== null;
}

module.exports = {
  fetchEtablissementsFromSupabase,
  saveEtablissementToSupabase,
  updateEtablissementInSupabase,
  deleteEtablissementFromSupabase
};
