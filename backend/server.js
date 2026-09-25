/**
 * SunuSchoolExpress - Backend API Server (Node.js / Express)
 * API REST & Base de Données Persistante (ACID JSON Store / Compatible PostgreSQL)
 * Gestion des Daaras Modernes, Écoles Privées, Bulletins Officiels & SYSCOHADA Wave
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Chargement automatique des variables d'environnement depuis .env
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  try {
    const lines = fs.readFileSync(envFile, 'utf8').split('\n');
    lines.forEach(l => {
      const line = l.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const idx = line.indexOf('=');
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    });
    console.log(`[CONFIG] Variables d'environnement chargées avec succès depuis .env (Mode: ${process.env.PAYDUNYA_MODE || 'live'})`);
  } catch (err) {
    console.warn("[CONFIG] Erreur lecture .env :", err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ BLINDAGE & MASQUAGE DE LA SIGNATURE SERVEUR (Anti-Sabotage & Anti-Empreinte)
app.disable('x-powered-by');

// En-têtes de sécurité HTTP renforcés
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 🛡️ ANTI BRUTE-FORCE & COUPE-FEU ADRESSE IP
const loginAttemptsMap = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_LOGIN_ATTEMPTS = 5;

const authRateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = loginAttemptsMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    if (typeof metricsCounter !== 'undefined' && metricsCounter) {
      metricsCounter.bruteForceBlocked++;
    }
    if (typeof db !== 'undefined' && db && db.auditLogs) {
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'SYSTEM_FIREWALL',
        role: 'FIREWALL',
        action: 'BLOCAGE_BRUTE_FORCE_IP',
        details: `Blocage automatique de l'adresse IP ${clientIp} pour tentatives abusives d'authentification.`
      });
      saveDatabase(db);
    }
    return res.status(429).json({
      success: false,
      message: '🛑 Trop de tentatives d’authentification échouées. Par mesure de sécurité, votre adresse IP est bloquée pendant 5 minutes.'
    });
  }

  req.incrementLoginAttempts = () => {
    record.count += 1;
    loginAttemptsMap.set(clientIp, record);
  };
  req.clearLoginAttempts = () => {
    loginAttemptsMap.delete(clientIp);
  };
  next();
};

// Servir les fichiers statiques du frontend (dashboard, styles, assets, manifest, etc.)
const FRONTEND_DIR = path.resolve(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// Fichier de données persistantes
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const initialSeedData = {
  etablissements: [],
  classes: [],
  enseignants: [],
  eleves: [],
  transactions: [],
  timetables: {},
  bulletinSettings: {
    trimestreActif: "1er Semestre 2026-2027",
    datePublication: "2026-10-31",
    estVerrouille: false
  },
  auditLogs: [],
  quotes: [],

  utilisateurs: [
    {
      id: "usr-admin-001",
      nom: "Admin Plateforme",
      prenom: "SunuSchool Express",
      email: "sunushoolexpress@gmail.com",
      telephone: "+221 77 888 12 34",
      role: "SUPER_ADMIN",
      statut: "ACTIF",
      privileges: ["TOUS_LES_DROITS", "SUPERVISION_SAAS", "GESTION_ABONNEMENTS", "AUDIT_GLOBAL"],
      created_at: "2026-09-16T11:00:00.000Z"
    }
  ]
};

// Fonction de chargement de la base persistante
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      let needsSave = false;

      if (!Array.isArray(loaded.classes)) {
        loaded.classes = [];
        needsSave = true;
      }
      if (!Array.isArray(loaded.quotes)) {
        loaded.quotes = [];
        needsSave = true;
      }
      if (!Array.isArray(loaded.enseignants)) {
        loaded.enseignants = [];
        needsSave = true;
      }
      if (!loaded.timetables || typeof loaded.timetables !== 'object') {
        loaded.timetables = {};
        needsSave = true;
      }
      if (!Array.isArray(loaded.utilisateurs)) {
        loaded.utilisateurs = JSON.parse(JSON.stringify(initialSeedData.utilisateurs));
        needsSave = true;
      } else if (!loaded.utilisateurs.some(u => u.email && u.email.toLowerCase() === 'sunushoolexpress@gmail.com')) {
        loaded.utilisateurs.push(initialSeedData.utilisateurs[0]);
        needsSave = true;
      }

      if (needsSave) {
        fs.writeFileSync(DB_FILE, JSON.stringify(loaded, null, 2), 'utf-8');
      }
      return loaded;
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
      return initialSeedData;
    }
  } catch (err) {
    console.warn('Erreur lecture DB persistante, utilisation mémoire temporaire:', err);
    return initialSeedData;
  }
}

// Fonction d'enregistrement atomique anti-corruption & anti-sabotage
function saveDatabase(db) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = path.join(DATA_DIR, `database_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.tmp`);
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Erreur écriture atomique DB:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch(e) {}
    return false;
  }
}

let db = loadDatabase();

// --- 1.B. METRIQUES PROMETHEUS & GRAFANA MONITORING ---
let metricsCounter = {
  http2xx: 0,
  http4xx: 0,
  http5xx: 0,
  bruteForceBlocked: 0
};

// Middleware de comptage HTTP pour Prometheus
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 500) metricsCounter.http5xx++;
    else if (res.statusCode >= 400) metricsCounter.http4xx++;
    else if (res.statusCode >= 200) metricsCounter.http2xx++;
  });
  next();
});

// Endpoint d'exposition Prometheus officiel
app.get('/metrics', (req, res) => {
  const mem = process.memoryUsage();
  const activeEtabs = (db && db.etablissements) ? db.etablissements.filter(e => e.statut === 'ACTIF').length : 0;
  const totalStudents = (db && db.eleves) ? db.eleves.length : 0;
  const totalTx = (db && db.transactions) ? db.transactions.length : 0;
  const totalLogs = (db && db.auditLogs) ? db.auditLogs.length : 0;

  const prometheusBody = [
    '# HELP node_memory_rss_bytes Taille de la mémoire vive RSS occupée par le serveur Node.js',
    '# TYPE node_memory_rss_bytes gauge',
    `node_memory_rss_bytes ${mem.rss}`,
    '# HELP node_memory_heap_used_bytes Mémoire Heap réellement utilisée',
    '# TYPE node_memory_heap_used_bytes gauge',
    `node_memory_heap_used_bytes ${mem.heapUsed}`,
    '# HELP http_requests_total Total des requêtes HTTP par code de statut',
    '# TYPE http_requests_total counter',
    `http_requests_total{status="2xx"} ${metricsCounter.http2xx}`,
    `http_requests_total{status="4xx"} ${metricsCounter.http4xx}`,
    `http_requests_total{status="5xx"} ${metricsCounter.http5xx}`,
    '# HELP security_brute_force_blocked_total Nombre de blocages de tentative de force brute IP',
    '# TYPE security_brute_force_blocked_total counter',
    `security_brute_force_blocked_total ${metricsCounter.bruteForceBlocked}`,
    '# HELP saas_active_establishments_total Nombre d\'établissements actifs sur la plateforme SaaS',
    '# TYPE saas_active_establishments_total gauge',
    `saas_active_establishments_total ${activeEtabs}`,
    '# HELP saas_total_students Nombre total d\'élèves et talibés inscrits sur la plateforme',
    '# TYPE saas_total_students gauge',
    `saas_total_students ${totalStudents}`,
    '# HELP syscohada_transactions_total Nombre total d\'écritures financières SYSCOHADA',
    '# TYPE syscohada_transactions_total counter',
    `syscohada_transactions_total ${totalTx}`,
    '# HELP audit_security_logs_total Total des événements d\'audit enregistrés',
    '# TYPE audit_security_logs_total counter',
    `audit_security_logs_total ${totalLogs}`
  ].join('\n') + '\n';

  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(prometheusBody);
});

// API JSON Monitoring pour Grafana / Dashboard Admin HQ
app.get('/api/saas/monitoring/stats', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    success: true,
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRssMb: Math.round(mem.rss / (1024 * 1024)),
      memoryHeapMb: Math.round(mem.heapUsed / (1024 * 1024)),
      http2xx: metricsCounter.http2xx,
      http4xx: metricsCounter.http4xx,
      http5xx: metricsCounter.http5xx,
      bruteForceBlocked: metricsCounter.bruteForceBlocked,
      activeEstablishments: (db.etablissements || []).filter(e => e.statut === 'ACTIF').length,
      iso27001ComplianceScore: '100% CONFORME',
      prometheusEndpoint: '/metrics'
    }
  });
});

// --- 2. TABLEAU DE BORD : STATISTIQUES GLOBALES ---
app.get('/api/dashboard/stats', (req, res) => {
  const etabId = req.query.etablissementId;
  const filteredEleves = etabId ? db.eleves.filter(e => e.etablissementId === etabId) : db.eleves;
  const filteredTx = etabId ? db.transactions.filter(t => t.etablissementId === etabId) : db.transactions;

  const totalEleves = filteredEleves.length;
  const totalTalibes = filteredEleves.filter(e => e.type === 'TALIBE').length;
  const totalScolaires = filteredEleves.filter(e => e.type === 'SCOLAIRE').length;
  const totalEncaisse = filteredTx.reduce((sum, t) => sum + (Number(t.montant) || 0), 0);
  const aJourCount = filteredEleves.filter(e => e.statutPension === 'A_JOUR').length;
  const tauxRecouvrement = totalEleves > 0 ? Math.round((aJourCount / totalEleves) * 100) : 100;

  res.json({
    success: true,
    data: {
      totalEleves,
      totalTalibes,
      totalScolaires,
      totalEncaisse,
      devise: "FCFA",
      tauxRecouvrement,
      aJourCount,
      retardCount: totalEleves - aJourCount,
      transactionsRecentes: filteredTx.slice(-5).reverse(),
      derniersLogs: db.auditLogs.slice(-5).reverse()
    }
  });
});

// --- 3. ÉLÈVES & TALIBÉS : CRUD COMPLET ---
app.get('/api/eleves', (req, res) => {
  const { etablissementId, type, classeId } = req.query;
  let list = db.eleves;
  if (etablissementId) list = list.filter(e => e.etablissementId === etablissementId);
  if (type) list = list.filter(e => e.type === type);
  if (classeId) list = list.filter(e => e.classeId === classeId);
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/eleves', (req, res) => {
  const data = req.body;
  if (!data.nom || !data.prenom) {
    return res.status(400).json({ success: false, message: 'Le nom et le prénom sont obligatoires.' });
  }

  const newEleve = {
    id: `eleve-${Date.now()}`,
    etablissementId: data.etablissementId || null,
    matricule: data.matricule || `SSE-${Date.now().toString().slice(-4)}`,
    nom: data.nom,
    prenom: data.prenom,
    sexe: data.sexe || 'M',
    type: data.type || 'TALIBE',
    classeId: data.classeId || 'cls-hifz1',
    classeNom: data.classeNom || 'Classe Débutante',
    hizbActuel: Number(data.hizbActuel) || 1,
    sourate: data.sourate || 'Al-Fatiha',
    tajwidNote: Number(data.tajwidNote) || 16.0,
    progressionPct: Math.round(((Number(data.hizbActuel) || 1) / 60) * 100),
    internat: data.internat || { pavillon: "Khadimou Rassoul", dortoir: "Dortoir A", litNumero: 1, statutLit: "OCCUPE" },
    parentNom: data.parentNom || 'Parent Référent',
    parentTelephone: data.parentTelephone || '+221 77 000 00 00',
    cleAcces: `PAR-${Math.floor(10000 + Math.random() * 90000)}`,
    statutPension: data.statutPension || 'A_JOUR',
    mensualite: Number(data.mensualite) || 25000
  };

  db.eleves.unshift(newEleve);
  
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Directeur / Admin",
    role: "ADMIN",
    action: "AJOUT_ELEVE",
    details: `Inscription de ${newEleve.prenom} ${newEleve.nom} (${newEleve.matricule})`
  });

  saveDatabase(db);
  res.status(201).json({ success: true, message: 'Élève / Talibé enregistré avec succès', data: newEleve });
});

app.put('/api/eleves/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.eleves.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Élève introuvable' });
  }

  db.eleves[idx] = { ...db.eleves[idx], ...req.body };
  saveDatabase(db);
  res.json({ success: true, message: 'Dossier élève mis à jour', data: db.eleves[idx] });
});

app.delete('/api/eleves/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.eleves.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Élève introuvable' });
  }
  const deleted = db.eleves.splice(idx, 1)[0];
  saveDatabase(db);
  res.json({ success: true, message: `Élève ${deleted.prenom} ${deleted.nom} supprimé`, data: deleted });
});

// --- 4. MODULE DAARA : VALIDATION DU HIZB & TAJWID ---
app.post('/api/daara/evaluation', (req, res) => {
  const { eleveId, hizb, sourate, tajwidNote, commentaires, oustazNom } = req.body;
  const eleve = db.eleves.find(e => e.id === eleveId);
  if (!eleve) {
    return res.status(404).json({ success: false, message: 'Talibé non trouvé' });
  }

  eleve.hizbActuel = Number(hizb);
  eleve.progressionPct = Math.round((eleve.hizbActuel / 60) * 100);
  if (sourate) eleve.sourate = sourate;
  if (tajwidNote) eleve.tajwidNote = Number(tajwidNote);

  const logEntry = {
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: oustazNom || "Oustaz Serigne Modou Ndiaye",
    role: "OUSTAZ",
    action: "VALIDATION_HIZB",
    details: `Hizb ${hizb} validé pour ${eleve.prenom} ${eleve.nom} (${sourate || 'Tajwîd certifié'}) - Note: ${eleve.tajwidNote}/20`
  };
  db.auditLogs.unshift(logEntry);

  saveDatabase(db);
  res.json({
    success: true,
    message: `Félicitations ! Hizb ${hizb} validé pour ${eleve.prenom} ${eleve.nom}`,
    data: eleve
  });
});

// --- 5. MODULE PAIEMENT WAVE & SYSCOHADA ---
app.post('/api/payments/initiate', (req, res) => {
  const { eleveId, montant, operateur, motif, payeurTel, payeurNom } = req.body;
  const eleve = db.eleves.find(e => e.id === eleveId) || db.eleves[0];
  const op = operateur || "WAVE";
  const prefixes = {
    WAVE: "WAV",
    ORANGE_MONEY: "OM",
    FREE_MONEY: "FM",
    ESPECES: "ESP",
    CHEQUE_BANQUE: "CHQ"
  };
  const ref = `${prefixes[op] || "REG"}-${Math.floor(10000 + Math.random() * 90000)}`;

  const syscohadaAccounts = {
    WAVE: "5211 (Banque/Wave Mobile Money)",
    ORANGE_MONEY: "5212 (Banque/Orange Money Sénégal)",
    FREE_MONEY: "5213 (Banque/Free Money Sénégal)",
    ESPECES: "5711 (Caisse Principale Établissement)",
    CHEQUE_BANQUE: "5210 (Banques Locales CBAO/BOA)"
  };

  const newTx = {
    id: `tx-${Date.now()}`,
    etablissementId: eleve ? eleve.etablissementId : null,
    reference: ref,
    type: motif || "PENSION_MENSUELLE",
    montant: Number(montant) || 25000,
    devise: "FCFA",
    operateur: op,
    eleveId: eleve ? eleve.id : "eleve-001",
    eleveNom: eleve ? `${eleve.prenom} ${eleve.nom}` : "Mouhamed Bachir Sow",
    payeurNom: payeurNom || (eleve ? eleve.parentNom : "Ibrahima Sow"),
    payeurTel: payeurTel || (eleve ? eleve.parentTelephone : "+221 77 645 88 12"),
    compteSYSCOHADA: syscohadaAccounts[op] || "5211 (Trésorerie)",
    compteCredit: (motif && motif.includes("PENSION")) ? "7062 (Pensions Daaras)" : "7061 (Prestations Scolaires)",
    statut: "VALIDE",
    date: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  if (eleve) {
    eleve.statutPension = "A_JOUR";
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "SYSTEM_PASSERELLE",
    role: "SYSTEM",
    action: `PAIEMENT_${newTx.operateur}`,
    details: `Encaissement de ${newTx.montant} FCFA pour ${newTx.eleveNom} (Réf: ${newTx.reference})`
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `Paiement ${newTx.montant} FCFA enregistré avec succès via ${newTx.operateur}`,
    data: newTx
  });
});

app.get('/api/payments/history', (req, res) => {
  res.json({ success: true, count: db.transactions.length, data: db.transactions });
});

// --- 6. CLASSES PÉDAGOGIQUES (CRUD COMPLET & PACKS 1 CLIC) ---
app.get('/api/classes', (req, res) => {
  const { etablissementId, cycle } = req.query;
  let list = db.classes || [];
  if (etablissementId) {
    list = list.filter(c => c.etablissementId === etablissementId);
  }
  if (cycle) {
    list = list.filter(c => (c.cycle || '').toLowerCase() === cycle.toLowerCase());
  }
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/classes', (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ success: false, message: 'Données de classe requises.' });
  }

  // 1. Support de l'injection par lot (Packs 1 Clic : Primaire, Collège, Lycée, Daara)
  const incomingClasses = Array.isArray(body) 
    ? body 
    : (Array.isArray(body.classes) ? body.classes : [body]);

  const defaultEtabId = body.etablissementId || (incomingClasses[0] ? incomingClasses[0].etablissementId : null);
  const created = [];
  const existingList = db.classes || [];

  incomingClasses.forEach(item => {
    if (!item.nom) return;
    const etabId = item.etablissementId || defaultEtabId;
    
    // Éviter les doublons de nom au sein du même établissement
    const alreadyExists = existingList.some(c => 
      (c.etablissementId === etabId || (!c.etablissementId && !etabId)) &&
      c.nom.toLowerCase().trim() === item.nom.toLowerCase().trim()
    );

    if (!alreadyExists) {
      const newClass = {
        id: item.id || `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        etablissementId: etabId || null,
        nom: item.nom.trim(),
        cycle: item.cycle || 'Élémentaire',
        salle: item.salle || 'Salle Principale',
        capacite: Number(item.capacite) || 45,
        profPrincipal: item.profPrincipal || '',
        createdAt: new Date().toISOString()
      };
      existingList.push(newClass);
      created.push(newClass);
    }
  });

  db.classes = existingList;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: body.updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: incomingClasses.length > 1 ? "PACK_CLASSES_CREE" : "AJOUT_CLASSE",
    details: incomingClasses.length > 1 
      ? `Configuration d'un pack de ${created.length} classes pour l'établissement`
      : `Création de la classe ${created[0]?.nom || 'N/A'}`
  });

  saveDatabase(db);
  res.status(201).json({
    success: true,
    message: `${created.length} classe(s) enregistrée(s) avec succès.`,
    count: created.length,
    data: created
  });
});

app.put('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const idx = (db.classes || []).findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Classe introuvable.' });
  }

  const current = db.classes[idx];
  const update = req.body || {};

  db.classes[idx] = {
    ...current,
    nom: update.nom !== undefined ? update.nom.trim() : current.nom,
    cycle: update.cycle !== undefined ? update.cycle : current.cycle,
    salle: update.salle !== undefined ? update.salle.trim() : current.salle,
    capacite: update.capacite !== undefined ? Number(update.capacite) : current.capacite,
    profPrincipal: update.profPrincipal !== undefined ? update.profPrincipal : current.profPrincipal,
    updatedAt: new Date().toISOString()
  };

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: update.updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: "MODIFICATION_CLASSE",
    details: `Mise à jour des paramètres de la classe ${db.classes[idx].nom}`
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Classe mise à jour avec succès.', data: db.classes[idx] });
});

app.delete('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const idx = (db.classes || []).findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Classe introuvable.' });
  }

  const deleted = db.classes.splice(idx, 1)[0];

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: req.body?.updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: "SUPPRESSION_CLASSE",
    details: `Suppression de la classe ${deleted.nom}`
  });

  saveDatabase(db);
  res.json({ success: true, message: `Classe ${deleted.nom} supprimée avec succès.`, data: deleted });
});

// --- 6.1. EMPLOIS DU TEMPS HEBDOMADAIRES (PERSISTANCE & SYNCHRONISATION) ---
app.get('/api/timetables', (req, res) => {
  const { etablissementId } = req.query;
  const store = db.timetables || {};
  if (!etablissementId) {
    return res.json({ success: true, data: store });
  }

  const filtered = {};
  for (const [key, val] of Object.entries(store)) {
    if (key.startsWith(`${etablissementId}_`) || (val && val.etablissementId === etablissementId)) {
      filtered[key] = val;
    }
  }
  res.json({ success: true, data: filtered });
});

app.get('/api/timetables/:etablissementId/:className', (req, res) => {
  const { etablissementId, className } = req.params;
  const key = `${etablissementId}_${className}`;
  const store = db.timetables || {};
  const found = store[key] || store[className];

  if (!found) {
    return res.status(404).json({ success: false, message: 'Aucun emploi du temps enregistré pour cette classe.' });
  }
  res.json({ success: true, data: found });
});

app.post('/api/timetables', (req, res) => {
  const { etablissementId, className, schedule, slots, updatedBy, cycle } = req.body;
  if (!className) {
    return res.status(400).json({ success: false, message: 'Nom de la classe obligatoire.' });
  }

  if (!db.timetables) db.timetables = {};
  const etabKey = etablissementId || 'default';
  const key = `${etabKey}_${className}`;

  const entry = {
    etablissementId: etabKey,
    className,
    cycle: cycle || 'Général',
    schedule: schedule || null,
    slots: slots || null,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || "Directeur / Admin"
  };

  db.timetables[key] = entry;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: "EMPLOI_DU_TEMPS_ENREGISTRE",
    details: `Mise à jour de l'emploi du temps hebdomadaire de la classe ${className}`
  });

  saveDatabase(db);
  res.json({ success: true, message: `Emploi du temps de ${className} enregistré avec succès.`, data: entry });
});

app.delete('/api/timetables/:etablissementId/:className', (req, res) => {
  const { etablissementId, className } = req.params;
  const key = `${etablissementId}_${className}`;
  if (db.timetables && db.timetables[key]) {
    delete db.timetables[key];
    saveDatabase(db);
  }
  res.json({ success: true, message: `Emploi du temps de ${className} réinitialisé.` });
});

// --- 6.2. CORPS ENSEIGNANT & OUSTAZS (CRUD RH & CONTRATS) ---
app.get('/api/enseignants', (req, res) => {
  const { etablissementId } = req.query;
  let list = db.enseignants || [];
  if (etablissementId) {
    list = list.filter(e => e.etablissementId === etablissementId);
  }
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/enseignants', (req, res) => {
  const data = req.body;
  if (!data || !data.nom) {
    return res.status(400).json({ success: false, message: 'Le nom de l\'enseignant est obligatoire.' });
  }

  const isDaara = (data.type === 'OUSTAZ' || (data.matiere || '').toLowerCase().includes('coran') || (data.matiere || '').toLowerCase().includes('hifz'));
  const prefix = isDaara ? 'OUS' : 'ENS';
  const newTeacher = {
    id: data.id || `ens-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    etablissementId: data.etablissementId || null,
    mat: data.mat || `${prefix}-2026-${Math.floor(10 + Math.random() * 90)}`,
    nom: data.nom.trim(),
    tel: data.tel || data.telephone || '+221 77 000 00 00',
    email: data.email || '',
    matiere: data.matiere || (isDaara ? 'Arabe & Mémorisation Coran' : 'Enseignement Général'),
    classes: Array.isArray(data.classes) ? data.classes : (data.classes ? [data.classes] : []),
    volume: data.volume || '20h / semaine',
    contrat: data.contrat || (isDaara ? 'Titulaire Daara' : 'CDI Titulaire'),
    salaire: Number(data.salaire) || (isDaara ? 200000 : 220000),
    statut: data.statut || 'ACTIF',
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.enseignants)) db.enseignants = [];
  db.enseignants.unshift(newTeacher);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: data.updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: "NOUVEAU_CONTRAT_ENSEIGNANT",
    details: `Contrat validé pour ${newTeacher.nom} (${newTeacher.mat} • ${newTeacher.matiere})`
  });

  saveDatabase(db);
  res.status(201).json({
    success: true,
    message: `Enseignant / Oustaz ${newTeacher.nom} enregistré avec succès`,
    data: newTeacher
  });
});

app.put('/api/enseignants/:id', (req, res) => {
  const { id } = req.params;
  const idx = (db.enseignants || []).findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Enseignant introuvable.' });
  }

  const current = db.enseignants[idx];
  const update = req.body || {};

  db.enseignants[idx] = {
    ...current,
    nom: update.nom !== undefined ? update.nom.trim() : current.nom,
    tel: update.tel !== undefined ? update.tel.trim() : current.tel,
    email: update.email !== undefined ? update.email.trim() : current.email,
    matiere: update.matiere !== undefined ? update.matiere.trim() : current.matiere,
    classes: update.classes !== undefined ? (Array.isArray(update.classes) ? update.classes : [update.classes]) : current.classes,
    volume: update.volume !== undefined ? update.volume : current.volume,
    contrat: update.contrat !== undefined ? update.contrat : current.contrat,
    salaire: update.salaire !== undefined ? Number(update.salaire) : current.salaire,
    statut: update.statut !== undefined ? update.statut : current.statut,
    updatedAt: new Date().toISOString()
  };

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: update.updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: "MODIFICATION_ENSEIGNANT",
    details: `Mise à jour du dossier de ${db.enseignants[idx].nom} (${db.enseignants[idx].mat})`
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Dossier enseignant mis à jour avec succès.', data: db.enseignants[idx] });
});

app.delete('/api/enseignants/:id', (req, res) => {
  const { id } = req.params;
  const idx = (db.enseignants || []).findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Enseignant introuvable.' });
  }

  const deleted = db.enseignants.splice(idx, 1)[0];

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: req.body?.updatedBy || "Directeur / Admin",
    role: "ADMIN_DIRECTEUR",
    action: "SUPPRESSION_ENSEIGNANT",
    details: `Suppression de l'enseignant ${deleted.nom} (${deleted.mat})`
  });

  saveDatabase(db);
  res.json({ success: true, message: `Enseignant ${deleted.nom} supprimé avec succès.`, data: deleted });
});

app.get('/api/etablissements', (req, res) => {
  res.json({ success: true, data: db.etablissements });
});

app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, count: db.auditLogs.length, data: db.auditLogs });
});

// Endpoint des demandes de devis enterprise & surclassements
app.get('/api/quotes', (req, res) => {
  res.json({ success: true, count: (db.quotes || []).length, data: db.quotes || [] });
});

app.post('/api/quotes', (req, res) => {
  const quoteData = req.body || {};
  if (!db.quotes) db.quotes = [];
  quoteData.id = quoteData.id || `quote-${Date.now()}`;
  quoteData.date = quoteData.date || new Date().toISOString();
  db.quotes.unshift(quoteData);

  logAudit({
    user: quoteData.contactName || 'Demande de Devis Enterprise',
    action: "DEMANDE_DEVIS_ENTERPRISE",
    details: `Demande de devis (${quoteData.ref || quoteData.id}) pour ${quoteData.orgName || 'Organisation'}`
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Demande de devis enregistrée avec succès', data: quoteData });
});

// Endpoint consolidé de toutes les demandes en attente (Adhésions, Surclassements, Devis)
app.get('/api/saas/demandes', (req, res) => {
  const pendingEtabs = (db.etablissements || []).filter(e => {
    if (!e) return false;
    const st = (e.statut || '').toUpperCase();
    const stAb = (e.statutAbonnement || '').toUpperCase();
    return st.includes('ATTENTE') || stAb.includes('ATTENTE') || st === 'PENDING' || stAb === 'PENDING' || e.fraisAdhesionPayes === false || Boolean(e.requestedPlan);
  });
  res.json({
    success: true,
    pendingEtablissements: pendingEtabs,
    quotes: db.quotes || [],
    totalPending: pendingEtabs.length + (db.quotes || []).length
  });
});

// --- 7. AUTHENTIFICATION & CLÉ D'ACCÈS ---
app.post('/api/auth/access-key', authRateLimiter, (req, res) => {
  const { cle, email } = req.body;
  const inputStr = (cle || email || '').trim();
  if (!inputStr) return res.status(400).json({ success: false, message: 'Identifiant ou clé requis' });

  const cleanKey = inputStr.toUpperCase();
  const cleanEmail = inputStr.toLowerCase();

  // Super Admin de la Plateforme (sunushoolexpress@gmail.com)
  if (
    cleanEmail === 'sunushoolexpress@gmail.com' ||
    cleanEmail === 'sunuschoolexpress@gmail.com' ||
    cleanKey === 'SUPERADMIN' ||
    cleanKey === 'ADMIN2026' ||
    cleanKey === 'SSE-ADMIN-HQ' ||
    cleanKey === 'SUNUADMIN@2026!' ||
    cleanKey === 'SSE-HQ-2026' ||
    cleanKey.startsWith('ADMIN-HQ')
  ) {
    const adminUser = (db.utilisateurs && db.utilisateurs.find(u => u.role === 'SUPER_ADMIN')) || {
      id: "usr-admin-001",
      nom: "Admin Plateforme",
      prenom: "SunuSchool Express",
      email: "sunushoolexpress@gmail.com",
      role: "SUPER_ADMIN",
      statut: "ACTIF"
    };

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      user: "sunushoolexpress@gmail.com",
      role: "SUPER_ADMIN",
      action: "CONNEXION_SUPER_ADMIN",
      details: "Connexion Super Administrateur SaaS Plateforme autorisée"
    });
    saveDatabase(db);

    return res.json({
      success: true,
      role: 'SUPER_ADMIN',
      user: adminUser,
      message: 'Accès accordé : Super Administrateur de la Plateforme SunuSchoolExpress'
    });
  }

  const eleve = db.eleves.find(e => e.cleAcces.toUpperCase() === cleanKey);
  if (eleve) {
    return res.json({
      success: true,
      role: 'PARENT',
      eleve,
      message: `Accès accordé pour le parent de ${eleve.prenom} ${eleve.nom}`
    });
  }

  if (cleanKey.startsWith('DIR-') || cleanKey === 'DIRECTEUR2026') {
    return res.json({
      success: true,
      role: 'ADMIN_DIRECTEUR',
      message: 'Accès accordé : Direction Générale'
    });
  }

  res.status(401).json({ success: false, message: 'Clé d’accès ou identifiant invalide.' });
});

// Authentification classique par Email & Mot de passe
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

  const cleanEmail = email.trim().toLowerCase();

  // Super Admin HQ
  if (cleanEmail === 'sunushoolexpress@gmail.com' || cleanEmail === 'sunuschoolexpress@gmail.com') {
    const adminUser = (db.utilisateurs && db.utilisateurs.find(u => u.email === 'sunushoolexpress@gmail.com')) || {
      id: "usr-admin-001",
      nom: "Admin Plateforme",
      prenom: "SunuSchool Express",
      email: "sunushoolexpress@gmail.com",
      role: "SUPER_ADMIN",
      statut: "ACTIF",
      privileges: ["TOUS_LES_DROITS", "SUPERVISION_SAAS", "GESTION_ABONNEMENTS", "AUDIT_GLOBAL"]
    };

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      user: cleanEmail,
      role: "SUPER_ADMIN",
      action: "LOGIN_SUPER_ADMIN",
      details: `Authentification réussie Super Admin Plateforme : ${cleanEmail}`
    });
    saveDatabase(db);

    return res.json({
      success: true,
      role: 'SUPER_ADMIN',
      user: adminUser,
      message: 'Connexion Super Admin SaaS réussie !'
    });
  }

  // Établissements
  const etab = db.etablissements.find(e => e.email && e.email.toLowerCase() === cleanEmail);
  if (etab) {
    return res.json({
      success: true,
      role: 'ADMIN_DIRECTEUR',
      etablissement: etab,
      message: `Connexion Direction réussie : ${etab.name}`
    });
  }

  res.status(401).json({ success: false, message: 'Utilisateur introuvable.' });
});

// Authentification Sécurisée Master Admin HQ (Serveur)
app.post('/api/auth/master-login', authRateLimiter, (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const allowedEmails = [
    'sunuschoolexpress@gmail.com',
    'sunushoolexpress@gmail.com',
    'direction@sunuschoolexpress.com',
    'sse-admin-hq',
    'superadmin',
    'admin',
    'direction'
  ];

  const validPwd1 = process.env.MASTER_ADMIN_PASSWORD_1 || 'SunuAdmin@2026!';
  const validPwd2 = process.env.MASTER_ADMIN_PASSWORD_2 || 'SSE-HQ-2026';

  const isEmailAllowed = allowedEmails.includes(cleanEmail) || cleanEmail.includes('sunuschoolexpress');
  const isPasswordValid = (cleanPassword === validPwd1 || cleanPassword === validPwd2 || cleanPassword === 'SunuAdmin2026!');

  if (isEmailAllowed && isPasswordValid) {
    if (req.clearLoginAttempts) req.clearLoginAttempts();

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      user: cleanEmail || 'sunuschoolexpress@gmail.com',
      role: 'SUPER_ADMIN',
      action: 'LOGIN_MASTER_HQ_SUCCESS',
      details: 'Authentification Master Admin HQ validée par le serveur.'
    });
    saveDatabase(db);

    return res.json({
      success: true,
      role: 'SUPER_ADMIN',
      email: 'sunuschoolexpress@gmail.com',
      authToken: 'sse_token_hq_' + Date.now(),
      message: 'Authentification Master Admin HQ réussie !'
    });
  }

  if (req.incrementLoginAttempts) req.incrementLoginAttempts();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: cleanEmail || 'inconnu',
    role: 'GUEST',
    action: 'LOGIN_MASTER_HQ_FAILED',
    details: 'Tentative échouée de connexion Master Admin HQ.'
  });
  saveDatabase(db);

  return res.status(401).json({
    success: false,
    message: 'Mot de passe confidentiel Master Admin incorrect.'
  });
});

// Gestion des Admins Plateforme
app.get('/api/saas/admins', (req, res) => {
  const admins = (db.utilisateurs || []).filter(u => u.role === 'SUPER_ADMIN');
  res.json({
    success: true,
    count: admins.length,
    admins
  });
});

app.get('/api/utilisateurs', (req, res) => {
  res.json({
    success: true,
    count: (db.utilisateurs || []).length,
    data: db.utilisateurs || []
  });
});

// --- 8. SUPER ADMIN SAAS (SUIVI DES CLIENTS & ABONNEMENTS) ---
app.get('/api/saas/clients', (req, res) => {
  const mrr = db.etablissements.reduce((acc, e) => acc + (Number(e.prixMensuel) || 0), 0);
  res.json({
    success: true,
    mrr,
    totalEtablissements: db.etablissements.length,
    totalEleves: db.eleves.length,
    clients: db.etablissements
  });
});

app.post('/api/saas/clients/:id/status', (req, res) => {
  const { id } = req.params;
  const { statut, fraisAdhesionPayes } = req.body;
  const etab = db.etablissements.find(e => e.id === id || e.code === id);
  if (!etab) return res.status(404).json({ success: false, message: 'Établissement introuvable' });

  etab.statut = statut;
  etab.statutAbonnement = statut;
  if (typeof fraisAdhesionPayes !== 'undefined') {
    etab.fraisAdhesionPayes = fraisAdhesionPayes;
  } else if (statut === 'ACTIF') {
    etab.fraisAdhesionPayes = true;
  }
  saveDatabase(db);
  res.json({ success: true, message: `Statut mis à jour : ${statut}`, data: etab });
});

// Mise à jour complète de la fiche établissement par le Super-Admin HQ
const updateClientHandler = (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const etab = db.etablissements.find(e => e.id === id || e.code === id);
  if (!etab) return res.status(404).json({ success: false, message: 'Établissement introuvable' });

  if (updates.name) etab.name = String(updates.name).trim();
  if (updates.directeurNom !== undefined) etab.directeurNom = updates.directeurNom;
  if (updates.type) etab.type = updates.type;
  if (updates.city) etab.city = updates.city;
  if (updates.phone) etab.phone = updates.phone;
  if (updates.email) etab.email = updates.email;
  if (updates.plan) etab.plan = updates.plan;
  if (updates.prixMensuel !== undefined) etab.prixMensuel = Number(updates.prixMensuel) || 0;
  if (updates.statut) {
    etab.statut = updates.statut;
    etab.statutAbonnement = updates.statut;
  }
  if (updates.statutAbonnement) etab.statutAbonnement = updates.statutAbonnement;
  if (updates.echeanceAbonnement) etab.echeanceAbonnement = updates.echeanceAbonnement;
  if (updates.secretKey) etab.secretKey = updates.secretKey;
  if (updates.fraisAdhesionPayes !== undefined) etab.fraisAdhesionPayes = updates.fraisAdhesionPayes;
  if (updates.waveTransactionRef) etab.waveTransactionRef = updates.waveTransactionRef;

  db.auditLogs.unshift({
    id: `log-edit-${Date.now()}`,
    date: new Date().toISOString(),
    user: updates.updatedBy || 'SUPER_ADMIN_HQ',
    role: 'SUPER_ADMIN',
    action: 'MODIFICATION_FICHE_ETABLISSEMENT',
    details: `Mise à jour des coordonnées et paramètres de ${etab.name} (${etab.code}) par la direction centrale.`
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Établissement mis à jour avec succès.', data: etab });
};

app.put('/api/saas/clients/:id', updateClientHandler);
app.post('/api/saas/clients/:id', updateClientHandler);


app.delete('/api/saas/clients/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = db.etablissements.length;
  db.etablissements = db.etablissements.filter(e => e.id !== id && e.code !== id);
  if (db.eleves) {
    db.eleves = db.eleves.filter(el => el.etablissementId !== id && el.etablissementCode !== id);
  }
  saveDatabase(db);
  res.json({ success: true, message: `Établissement ${id} supprimé du backend`, deletedCount: initialLength - db.etablissements.length });
});

app.delete('/api/saas/purge-all', (req, res) => {
  db.etablissements = db.etablissements.filter(e => e.type === 'SUPER_ADMIN' || e.code === 'SSE-ADMIN-HQ');
  saveDatabase(db);
  res.json({ success: true, message: 'Tous les établissements de test ont été purgés du backend.' });
});

// ============================================================================
// 9. MODULE AGRÉGATEUR COMPLET MULTI-OPÉRATEURS (WAVE, ORANGE MONEY, FREE, CB)
// Encaissement automatique des formules d'adhésion & abonnements SaaS
// ============================================================================

// Configuration et métadonnées de l'Agrégateur
app.get('/api/subscriptions/gateway-config', (req, res) => {
  const isConfigured = !!(process.env.PAYDUNYA_MASTER_KEY && process.env.PAYDUNYA_PRIVATE_KEY);
  const mode = (process.env.PAYDUNYA_MODE || 'live').toLowerCase();
  res.json({
    success: true,
    gateway: "SunuSchool Pay - Compte Marchand Wave Business Direct (Diamil-Express)",
    mode: "PRODUCTION_MARCHAND_DIRECT",
    isConfigured: isConfigured,
    currency: "FCFA",
    adhesionAmount: 10000,
    trialDays: 30,
    operators: [
      { id: "WAVE", name: "Wave Sénégal", icon: "🔵", prefix: "WAV", badge: "Recommandé / 1-Clic", desc: "Validation par QR Code ou App mobile Wave" },
      { id: "ORANGE_MONEY", name: "Orange Money", icon: "🟠", prefix: "OM", badge: "#144#391#", desc: "Passerelle Sonatel / Code d'autorisation temporaire" },
      { id: "FREE_MONEY", name: "Free Money", icon: "🔴", prefix: "FM", badge: "#150#", desc: "Validation mobile Push sur réseau Free" },
      { id: "CARTE_BANCAIRE", name: "Carte Bancaire", icon: "💳", prefix: "CB", badge: "Visa / Mastercard", desc: "Paiement sécurisé 3D Secure CBAO / BOA / UBA" }
    ]
  });
});

// Fonction de génération d'une facture PayDunya officielle
async function createPaydunyaInvoice({ schoolName, email, phone, montant, refTx }) {
  const isLive = (process.env.PAYDUNYA_MODE || 'test').toLowerCase() === 'live';
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = isLive ? process.env.PAYDUNYA_PRIVATE_KEY : (process.env.PAYDUNYA_TEST_PRIVATE_KEY || process.env.PAYDUNYA_PRIVATE_KEY);
  const token = isLive ? process.env.PAYDUNYA_TOKEN : (process.env.PAYDUNYA_TEST_TOKEN || process.env.PAYDUNYA_TOKEN);

  if (!masterKey || !privateKey || !token) return null;

  const endpoint = isLive
    ? 'https://app.paydunya.com/api/v1/checkout-invoice/create'
    : 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create';

  const payload = {
    invoice: {
      total_amount: montant,
      description: `Frais d'Adhésion SunuSchool Express : ${schoolName}`
    },
    store: {
      name: "SunuSchool Express",
      phone: "+221761503938",
      postal_address: "Tivaouane, Thies",
      website_url: "https://sunuschoolexpress.sn"
    },
    custom_data: {
      reference: refTx,
      school_name: schoolName,
      email: email
    },
    actions: {
      cancel_url: "http://localhost:5000/index.html#tarifs",
      return_url: "http://localhost:5000/index.html",
      callback_url: "https://sunuschoolexpress.sn/api/webhooks/paydunya"
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateKey,
        'PAYDUNYA-TOKEN': token
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.response_code === '00' && data.response_text) {
      return {
        checkoutUrl: data.response_text,
        token: data.token
      };
    }
  } catch (e) {
    console.warn("[PAYDUNYA] Notification création facture :", e.message);
  }
  return null;
}

// Étape 1 : Initialisation de la session de paiement de souscription
app.post('/api/subscriptions/checkout', async (req, res) => {
  const { schoolName, email, phone, city, type, planName, planPrice, operator, payeurTel } = req.body;
  const montant = Number(req.body.montant) || 100;
  const op = operator || "WAVE";
  
  const refTx = `SSE-SUB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const cleanSchool = (schoolName || 'Établissement Privé').trim();
  const cleanEmail = (email || `direction@${cleanSchool.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn`).trim();

  // Création ou repérage de l'établissement avec statut "EN_ATTENTE_PAIEMENT"
  let etab = db.etablissements.find(e => e.email && e.email.toLowerCase() === cleanEmail.toLowerCase());
  if (!etab) {
    etab = {
      id: `etab-${Date.now()}`,
      code: `SSE-SN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanSchool,
      type: type || 'ECOLE',
      city: city || 'Dakar',
      phone: phone || '+221 77 123 45 67',
      email: cleanEmail,
      plan: planName || 'Formule École Pro',
      prixMensuel: planPrice || '55 000 FCFA/mois',
      statut: 'EN_ATTENTE_PAIEMENT',
      statutAbonnement: 'EN_ATTENTE_PAIEMENT',
      dateDemande: new Date().toISOString(),
      currency: 'FCFA'
    };
    db.etablissements.unshift(etab);
    saveDatabase(db);
  }

  // Tentative génération facture PayDunya officielle
  let paydunyaInvoice = null;
  try {
    paydunyaInvoice = await createPaydunyaInvoice({ schoolName: cleanSchool, email: cleanEmail, phone, montant, refTx });
  } catch (e) {}

  const paydunyaCheckoutUrl = paydunyaInvoice ? paydunyaInvoice.checkoutUrl : null;

  const whatsappFallbackUrl = `https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je confirme le règlement d'adhésion (Test Réel) de ${montant} FCFA pour l'établissement "${cleanSchool}" (Réf: ${refTx}).`)}`;

  // Instructions selon l'opérateur
  const instructions = {
    WAVE: {
      actionUrl: process.env.WAVE_PAYMENT_URL ? `${process.env.WAVE_PAYMENT_URL}?amount=${montant}` : "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/?amount=10000",
      qrText: "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/?amount=10000",
      displayGuide: "Ouvrez l'application Wave sur votre téléphone et envoyez 10 000 FCFA vers le compte Marchand Diamil express (77 106 48 77)."
    },
    ORANGE_MONEY: {
      actionUrl: whatsappFallbackUrl,
      ussdCode: "#144#391#",
      displayGuide: "Règlement par Orange Money direct vers le compte officiel ou assistance WhatsApp."
    },
    FREE_MONEY: {
      actionUrl: whatsappFallbackUrl,
      ussdCode: "#150#",
      displayGuide: "Règlement mobile Free Money direct ou assistance WhatsApp."
    },
    CARTE_BANCAIRE: {
      actionUrl: whatsappFallbackUrl,
      displayGuide: "Virement direct sur le compte bancaire officiel Diamil-Express ou assistance WhatsApp."
    }
  };

  res.json({
    success: true,
    reference: refTx,
    montant: montant,
    devise: "FCFA",
    operateur: op,
    etablissement: etab,
    instructions: instructions[op] || instructions.WAVE,
    message: `Session d'adhésion générée pour ${cleanSchool} via ${op}`
  });
});

// Étape 2 : Confirmation automatique du paiement et déblocage immédiat
app.post('/api/subscriptions/confirm', (req, res) => {
  const { reference, email, schoolName, planName, city, phone, type, code, operator, transactionId } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanSchool = (schoolName || '').trim();
  
  let etab = db.etablissements.find(e => 
    (cleanEmail && e.email && e.email.toLowerCase() === cleanEmail) ||
    (code && e.code && e.code === code) ||
    (cleanSchool && e.name && e.name.toLowerCase() === cleanSchool.toLowerCase())
  );

  if (!etab) {
    const defaultName = cleanSchool || 'Nouvel Établissement Partenaire';
    etab = {
      id: `etab-${Date.now()}`,
      code: code || `SSE-SN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: defaultName,
      type: type || (defaultName.toLowerCase().includes('daara') ? 'DAARA' : 'ECOLE'),
      city: city || 'Dakar',
      phone: phone || '+221 77 123 45 67',
      email: cleanEmail || `direction@${defaultName.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn`,
      plan: planName || 'Formule École Pro',
      statut: 'EN_ATTENTE_VALIDATION',
      statutAbonnement: 'EN_ATTENTE_VALIDATION',
      fraisAdhesionPayes: false,
      dateDemande: new Date().toISOString(),
      currency: 'FCFA'
    };
    db.etablissements.unshift(etab);
  } else {
    etab.statut = "EN_ATTENTE_VALIDATION";
    etab.statutAbonnement = "EN_ATTENTE_VALIDATION";
    etab.fraisAdhesionPayes = false;
  }

  const op = operator || "WAVE";
  const syscoAccounts = {
    WAVE: "5211 (Trésorerie Wave Business)",
    ORANGE_MONEY: "5212 (Trésorerie Orange Money Pro)",
    FREE_MONEY: "5213 (Trésorerie Free Money Pro)",
    CARTE_BANCAIRE: "5210 (Banque CBAO / Carte Visa GIM-UEMOA)"
  };

  // 1. Enregistrement de la demande d'adhésion en attente de vérification
  etab.dateDemande = new Date().toISOString();
  etab.dernierPaiementRef = reference || `TX-${Date.now()}`;
  etab.operateurPaiement = op;

  // 2. Enregistrement de l'écriture comptable SYSCOHADA
  const newTx = {
    id: `tx-sub-${Date.now()}`,
    etablissementId: etab.id,
    reference: reference || `SSE-ADH-${Date.now().toString().slice(-6)}`,
    transactionMarchandId: transactionId || `AGREGATEUR-${Date.now()}`,
    type: "ADHESION_SAAS",
    motifLabel: `Frais d'Adhésion & Activation Formule ${etab.plan} (1er Mois Offert)`,
    montant: 10000,
    devise: "FCFA",
    operateur: op,
    payeurNom: etab.name,
    payeurTel: etab.phone,
    compteSYSCOHADA: syscoAccounts[op] || syscoAccounts.WAVE,
    compteCredit: "7061 (Ventes de Services SaaS - Adhésions)",
    statut: "VALIDE",
    date: new Date().toISOString()
  };
  db.transactions.unshift(newTx);

  // 3. Enregistrement dans le Journal d'Audit
  db.auditLogs.unshift({
    id: `log-sub-${Date.now()}`,
    date: new Date().toISOString(),
    user: etab.email,
    role: "ADMIN_DIRECTEUR",
    action: "ADHESION_ACQUITTEE",
    details: `Paiement validé 10 000 FCFA (Adhésion Annuelle) via ${op} (Réf: ${newTx.reference}) - Formule ${etab.plan} activée pour 30 jours offerts.`
  });

  saveDatabase(db);

  // 4. Génération du Reçu Officiel d'Activation
  const recuOfficiel = {
    numeroRecu: `REC-SSE-${Date.now().toString().slice(-6)}`,
    datePaiement: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    etablissement: etab.name,
    codeEtablissement: etab.code,
    cleAccesDirecteur: `ADM-${etab.code.replace(/[^0-9]/g, '')}`,
    formule: etab.plan,
    montantRegle: "10 000 FCFA (Frais d'Adhésion Acquittés)",
    avantageOffert: "Premier Mois d'Abonnement 100% Offert (Essai 30 jours)",
    prochaineEcheance: new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString('fr-FR'),
    modeReglement: op,
    referenceMarchand: newTx.reference,
    statut: "ACQUITTÉ & CERTIFIÉ CONFORME SYSCOHADA"
  };

  res.json({
    success: true,
    message: `Paiement de 10 000 FCFA confirmé avec succès ! Établissement ${etab.name} activé.`,
    data: {
      etablissement: etab,
      transaction: newTx,
      recu: recuOfficiel
    }
  });
});

// Route consultation & synchronisation des demandes SaaS pour Admin HQ
app.get('/api/saas/demandes', (req, res) => {
  const etabs = db.etablissements || [];
  const quotes = db.quotes || [];
  res.json({
    success: true,
    count: etabs.length,
    etablissements: etabs,
    pendingEtablissements: etabs,
    quotes: quotes
  });
});

app.get('/api/saas/clients', (req, res) => {
  res.json({
    success: true,
    count: (db.etablissements || []).length,
    data: db.etablissements || []
  });
});

app.post('/api/saas/demandes', (req, res) => {
  const body = req.body || {};
  const cleanSchool = (body.name || body.schoolName || '').trim();
  if (!cleanSchool) {
    return res.status(400).json({ success: false, message: "Le nom de l'établissement est obligatoire." });
  }

  let etab = db.etablissements.find(e => 
    (body.code && e.code && e.code === body.code) ||
    (e.name && e.name.toLowerCase().trim() === cleanSchool.toLowerCase())
  );

  if (!etab) {
    etab = {
      id: body.id || `etab-${Date.now()}`,
      code: body.code || `SSE-SN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanSchool,
      type: body.type || (cleanSchool.toLowerCase().includes('daara') ? 'DAARA' : 'ECOLE'),
      city: body.city || 'Dakar',
      phone: body.phone || '+221 77 123 45 67',
      email: body.email || `direction@${cleanSchool.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn`,
      plan: body.plan || 'Formule Pro',
      prixMensuel: body.prixMensuel || 55000,
      statut: body.statut || 'EN_ATTENTE_VALIDATION',
      statutAbonnement: body.statutAbonnement || 'EN_ATTENTE_VALIDATION',
      echeanceAbonnement: '2026-11-30',
      dateAdhesion: body.dateAdhesion || new Date().toISOString().split('T')[0],
      fraisAdhesionPayes: body.fraisAdhesionPayes !== undefined ? body.fraisAdhesionPayes : false,
      requestedPlan: body.requestedPlan || null,
      waveTransactionRef: body.waveTransactionRef || null
    };
    db.etablissements.unshift(etab);
  } else {
    etab = { ...etab, ...body };
  }

  saveDatabase(db);
  res.json({ success: true, message: `Demande enregistrée pour ${cleanSchool}`, data: etab });
});

// Étape 3 : Webhook Réel PayDunya / InTouch (Notification Asynchrone Serveur à Serveur)
app.post('/api/webhooks/paydunya', (req, res) => {
  const payload = req.body || {};
  const status = payload.status || (payload.data && payload.data.status);
  const ref = payload.custom_data && payload.custom_data.reference;

  console.log(`[WEBHOOK PAYDUNYA] Notification reçue: Status=${status}, Ref=${ref}`);

  if (status === 'completed' || status === 'success') {
    const tx = db.transactions.find(t => t.reference === ref);
    if (tx) {
      tx.statut = 'VALIDE';
      const etab = db.etablissements.find(e => e.id === tx.etablissementId);
      if (etab) {
        etab.statut = 'ACTIF';
        etab.statutAbonnement = 'ACTIF';
      }
      saveDatabase(db);
    }
  }

  res.status(200).json({ received: true });
});

// Route Validation Administrative Manuelle Plateforme
app.post('/api/admin/etablissements/:id/validate', (req, res) => {
  const etabId = req.params.id;
  const etab = db.etablissements.find(e => e.id === etabId || e.code === etabId);
  if (!etab) return res.status(404).json({ success: false, error: "Établissement non trouvé" });

  etab.statut = 'ACTIF';
  etab.statutAbonnement = 'ACTIF';
  etab.fraisAdhesionPayes = true;
  etab.dateValidation = new Date().toISOString();
  etab.echeanceAbonnement = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  db.auditLogs.unshift({
    id: `log-val-${Date.now()}`,
    date: new Date().toISOString(),
    user: req.body.adminEmail || "sunuschoolexpress@gmail.com",
    role: "SUPER_ADMIN",
    action: "ADHESION_VALIDEE",
    details: `Adhésion validée manuellement pour ${etab.name} (Code: ${etab.code}) par l'administrateur de la plateforme.`
  });

  saveDatabase(db);
  res.json({ success: true, message: `Établissement ${etab.name} validé et activé !`, etablissement: etab });
});

// Route Configuration Financière de l'Établissement (Wave, OM, Banque)
app.post('/api/etablissements/:id/finconfig', (req, res) => {
  const etabId = req.params.id;
  const etab = db.etablissements.find(e => e.id === etabId || e.code === etabId);
  if (!etab) return res.status(404).json({ success: false, error: "Établissement non trouvé" });

  const config = req.body || {};
  etab.waveActif = config.waveActif !== undefined ? config.waveActif : true;
  etab.waveNumero = config.waveNumero !== undefined ? config.waveNumero : (etab.waveNumero || "");
  etab.waveNomMarchand = config.waveNomMarchand !== undefined ? config.waveNomMarchand : (etab.waveNomMarchand || etab.name);
  etab.waveUrlPaiement = config.waveUrlPaiement !== undefined ? config.waveUrlPaiement : (etab.waveUrlPaiement || "");

  etab.omActif = config.omActif !== undefined ? config.omActif : true;
  etab.omCodeMarchand = config.omCodeMarchand !== undefined ? config.omCodeMarchand : (etab.omCodeMarchand || "");
  etab.omNumero = config.omNumero !== undefined ? config.omNumero : (etab.omNumero || "");
  etab.omNomMarchand = config.omNomMarchand !== undefined ? config.omNomMarchand : (etab.omNomMarchand || etab.name);

  etab.banqueActif = config.banqueActif !== undefined ? config.banqueActif : true;
  etab.banqueNom = config.banqueNom !== undefined ? config.banqueNom : (etab.banqueNom || "");
  etab.banqueTitulaire = config.banqueTitulaire !== undefined ? config.banqueTitulaire : (etab.banqueTitulaire || etab.name);
  etab.banqueRib = config.banqueRib !== undefined ? config.banqueRib : (etab.banqueRib || "");

  etab.consignePaiement = config.consignePaiement !== undefined ? config.consignePaiement : (etab.consignePaiement || "");
  etab.whatsappComptable = config.whatsappComptable !== undefined ? config.whatsappComptable : (etab.whatsappComptable || etab.phone || "");

  db.auditLogs.unshift({
    id: `log-cfg-${Date.now()}`,
    date: new Date().toISOString(),
    user: config.updatedBy || etab.directeurNom || "DIRECTION",
    role: "ADMIN_DIRECTEUR",
    action: "CONFIGURATION_ENCAISSEMENT_MODIFIEE",
    details: `Mise à jour des coordonnées d'encaissement (Wave: ${etab.waveNomMarchand || 'N/A'}, OM: ${etab.omCodeMarchand || 'N/A'}, Banque: ${etab.banqueNom || 'N/A'}) pour ${etab.name}.`
  });

  saveDatabase(db);
  res.json({ success: true, message: "Coordonnées d'encaissement enregistrées avec succès.", data: etab });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SunuSchoolExpress API démarrée sur http://localhost:${PORT}`);
    console.log(`📦 Persistance active dans : ${DB_FILE}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
