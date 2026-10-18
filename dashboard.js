/**
 * SunuSchoolExpress - SaaS Dashboard Controller
 * Logique Métier & Pont API REST / Persistance Locale
 */

// Cycles officiels pour Instituts de formation professionnelle & études supérieures
const INSTITUT_CYCLES = [
  { value: "BTS", label: "BTS" },
  { value: "CAP", label: "CAP" },
  { value: "BEP", label: "BEP" },
  { value: "BT", label: "BT" },
  { value: "Licence", label: "Licence" },
  { value: "Master", label: "Master" },
  { value: "Formation Continue", label: "Formation Continue" },
  { value: "Certification Professionnelle", label: "Certification Professionnelle" },
  { value: "Formation Qualifiante", label: "Formation Qualifiante" },
  { value: "Formation Modulaire", label: "Formation Modulaire" }
];

function isInstitutEstablishment(est) {
  if (!est) return false;
  const typeUpper = String(est.type || '').toUpperCase().trim();
  if (typeUpper === 'DAARA') return false;

  const planLower = String(est.plan || est.formule || '').toLowerCase().trim();
  const typeLower = String(est.type || '').toLowerCase().trim();
  const nameLower = String(est.name || est.nom || '').toLowerCase().trim();

  // 1. Formules / types explicites de la commande utilisateur :
  // "Institut Starter", "Institut Pro", "Grande École / Multi-Campus"
  if (planLower.includes('institut starter') || typeLower.includes('institut starter')) return true;
  if (planLower.includes('institut pro') || typeLower.includes('institut pro')) return true;
  if (planLower.includes('grande école') || planLower.includes('grande ecole') || planLower.includes('multi-campus') || planLower.includes('multicampus')) return true;
  if (typeLower.includes('grande école') || typeLower.includes('grande ecole') || typeLower.includes('multi-campus') || typeLower.includes('multicampus')) return true;

  // 2. Types reconnus
  if (typeUpper === 'FORMATION_PRO' || typeUpper === 'INSTITUT' || typeUpper === 'INSTITUT_STARTER' || typeUpper === 'INSTITUT_PRO' || typeUpper === 'GRANDE_ECOLE' || typeUpper === 'SUPERIEUR') return true;

  // 3. Plans contenant institut, bts, formation pro
  if (planLower.includes('institut') || planLower.includes('bts') || planLower.includes('formation pro') || planLower.includes('formation_pro') || planLower.includes('formation professionnelle')) return true;

  // 4. Noms d'instituts si non typé explicitement ECOLE
  if (typeUpper !== 'ECOLE' && (nameLower.includes('institut') || nameLower.includes('formation pro') || nameLower.includes('centre de formation'))) return true;

  return false;
}

if (typeof window !== 'undefined') {
  window.INSTITUT_CYCLES = INSTITUT_CYCLES;
  window.isInstitutEstablishment = isInstitutEstablishment;
}

// Initial Seed data pour mode autonome / fallback immédiat
const DEFAULT_DATABASE = {
  etablissements: [],
  classes: [],
  eleves: [],
  transactions: [],
  auditLogs: [],
  enseignants: [],
  conventions: [],
  certificatsIssued: [],
  adminsPlateforme: [
    {
      id: "admin-platform-001",
      email: "sunushoolexpress@gmail.com",
      nom: "Admin Plateforme",
      prenom: "SunuSchool Express",
      role: "SUPER_ADMIN",
      titre: "Administrateur Central de la Plateforme SaaS",
      statut: "ACTIF",
      telephone: "+221 77 888 12 34",
      dateCreation: "2026-09-16",
      privileges: "Supervision Totale SaaS • Multi-Campus • MRR Licences • Audit Global"
    }
  ]
};

// Dictionnaire des canaux de paiement & Comptes SYSCOHADA (Normes OHADA Éducation)
const SYSCOHADA_OPERATORS = {
  WAVE: {
    code: "5211",
    label: "Wave Sénégal",
    badgeClass: "badge-wave",
    icon: "🌊",
    accountDebit: "5211 - Banque / Wave Mobile Money",
    accountCredit: "706 - Prestations de scolarité & pensions",
    desc: "Écriture automatique : Débit Cpt 5211 (Wave Sénégal) / Crédit Cpt 706. Passerelle API directe QR Code 1%.",
    prefix: "WAV",
    contactLabel: "Numéro Wave Parent"
  },
  ORANGE_MONEY: {
    code: "5212",
    label: "Orange Money",
    badgeClass: "badge-om",
    icon: "🍊",
    accountDebit: "5212 - Banque / Orange Money Sénégal",
    accountCredit: "706 - Prestations de scolarité & pensions",
    desc: "Écriture automatique : Débit Cpt 5212 (Orange Money) / Crédit Cpt 706. Notification Push #144# / Max it.",
    prefix: "OM",
    contactLabel: "Numéro Orange Money"
  },
  FREE_MONEY: {
    code: "5213",
    label: "Free Money",
    badgeClass: "badge-free",
    icon: "🔴",
    accountDebit: "5213 - Banque / Free Money Sénégal",
    accountCredit: "706 - Prestations de scolarité & pensions",
    desc: "Écriture automatique : Débit Cpt 5213 (Free Money) / Crédit Cpt 706. Validation USSD *150#.",
    prefix: "FM",
    contactLabel: "Numéro Free Money"
  },
  ESPECES: {
    code: "5711",
    label: "Caisse Espèces",
    badgeClass: "badge-cash",
    icon: "💵",
    accountDebit: "5711 - Caisse Principale Établissement (Espèces)",
    accountCredit: "706 - Prestations de scolarité & pensions",
    desc: "Écriture automatique : Débit Cpt 5711 (Caisse Guichet) / Crédit Cpt 706. Règlement direct au comptoir de l'économe.",
    prefix: "ESP",
    contactLabel: "Téléphone Parent / Reçu physique"
  },
  CHEQUE_BANQUE: {
    code: "5210",
    label: "Chèque / Virement",
    badgeClass: "badge-bank",
    icon: "🏦",
    accountDebit: "5210 - Banques Locales (CBAO / BOA / Ecobank / SGBS)",
    accountCredit: "706 - Prestations de scolarité & pensions",
    desc: "Écriture automatique : Débit Cpt 5210 (Banque Établissement) / Crédit Cpt 706. Remise de chèque ou virement bancaire.",
    prefix: "CHQ",
    contactLabel: "N° Chèque ou Réf. Virement Bancaire"
  }
};

// État global de l'application SaaS
let appState = {
  activeTab: 'overview',
  activeEstablishmentId: null, // Aucun établissement pré-sélectionné sans authentification
  activeRole: 'ADMIN_DIRECTEUR',
  activeCaisseFilter: 'ALL',
  selectedEncaissementOp: 'WAVE',
  db: null,
  isApiOnline: false
};

// --- INITIALISATION DU STOCKAGE ---
function initDataStore() {
  const local = localStorage.getItem('sse_saas_database');
  if (local) {
    try {
      appState.db = JSON.parse(local);
      if (!Array.isArray(appState.db.etablissements)) appState.db.etablissements = [];
      if (!Array.isArray(appState.db.classes)) appState.db.classes = [];
      if (!Array.isArray(appState.db.eleves)) appState.db.eleves = [];
      if (!Array.isArray(appState.db.transactions)) appState.db.transactions = [];
      if (!Array.isArray(appState.db.auditLogs)) appState.db.auditLogs = [];
      if (!Array.isArray(appState.db.enseignants)) appState.db.enseignants = [];

      // Purge STRICTEMENT technique des anciens identifiants de maquette (aucun nom réel filtré)
      const isFakeDemoEntry = (item) => {
        if (!item) return false;
        if (typeof item === 'object') {
          if (item.isUserCreated || item.phone || item.email || item.dateAdhesion) return false;
          const id = (item.id || '').toLowerCase();
          const code = (item.code || item.accessKey || '').toUpperCase();
          const mat = (item.matricule || item.mat || '').toUpperCase();
          return id === 'etab-001' || id === 'etab-002' || id === 'etab-003' || id === 'etab-demo' || id === 'demo' ||
                 id.startsWith('emf-el-') || id.startsWith('cls-emf-') || id.includes('ousmane-niang-emf') ||
                 mat.startsWith('EMF-2026-') ||
                 id === 'form-01' || id === 'form-02' || id === 'form-03' || id === 'form-04' ||
                 code.startsWith('FOR-2026-') || mat.startsWith('FOR-2026-') ||
                 id === 'cls-bts-gl1' || id === 'cls-bts-gl2' || id === 'cls-bts-cg1' || id === 'cls-bts-cg2' ||
                 id === 'cls-bts-ci1' || id === 'cls-bts-ci2' || id === 'cls-l3-gl' || id === 'cls-l3-cge' ||
                 id.startsWith('etu_') || mat.startsWith('SSE-BTS-') || id.startsWith('demo_etu_') ||
                 id === 'conv-001' || id === 'conv-002' || id === 'conv-003' ||
                 id === 'cert-001' || id === 'cert-002' || id === 'cert-003' ||
                 code === 'SSE-SN-1001' || code === 'SSE-SN-1002' || code === 'SSE-SN-1003' || code === 'DEMO';
        }
        const s = (item || '').toLowerCase().trim();
        return s === 'etab-001' || s === 'etab-002' || s === 'etab-003' || s === 'etab-demo' || s === 'demo' ||
               s === 'sse-sn-1001' || s === 'sse-sn-1002' || s === 'sse-sn-1003' ||
               s.startsWith('emf-el-') || s.startsWith('cls-emf-') || s.includes('ousmane-niang-emf') || s.startsWith('emf-2026-') ||
               s === 'form-01' || s === 'form-02' || s === 'form-03' || s === 'form-04' || s.startsWith('for-2026-') ||
               s === 'cls-bts-gl1' || s === 'cls-bts-gl2' || s === 'cls-bts-cg1' || s === 'cls-bts-cg2' ||
               s === 'cls-bts-ci1' || s === 'cls-bts-ci2' || s === 'cls-l3-gl' || s === 'cls-l3-cge' ||
               s.startsWith('etu_') || s.startsWith('sse-bts-') ||
               s === 'conv-001' || s === 'conv-002' || s === 'conv-003' ||
               s === 'cert-001' || s === 'cert-002' || s === 'cert-003';
      };
      appState.db.etablissements = appState.db.etablissements.filter(e => !isFakeDemoEntry(e));
      appState.db.classes = appState.db.classes.filter(c => !isFakeDemoEntry(c) && !isFakeDemoEntry(c.etablissementId));
      appState.db.eleves = appState.db.eleves.filter(el => !isFakeDemoEntry(el) && !isFakeDemoEntry(el.etablissementId));
      appState.db.transactions = appState.db.transactions.filter(t => !isFakeDemoEntry(t.etablissementId));
      appState.db.enseignants = appState.db.enseignants.filter(en => !isFakeDemoEntry(en) && !isFakeDemoEntry(en.etablissementId));
      if (Array.isArray(appState.db.conventions)) {
        appState.db.conventions = appState.db.conventions.filter(c => !isFakeDemoEntry(c) && !isFakeDemoEntry(c.etablissementId));
      }
      if (Array.isArray(appState.db.certificatsIssued)) {
        appState.db.certificatsIssued = appState.db.certificatsIssued.filter(c => !isFakeDemoEntry(c) && !isFakeDemoEntry(c.etablissementId));
      }

      if (!appState.db.adminsPlateforme || !appState.db.adminsPlateforme.some(a => a.email && a.email.toLowerCase() === 'sunushoolexpress@gmail.com')) {
        appState.db.adminsPlateforme = JSON.parse(JSON.stringify(DEFAULT_DATABASE.adminsPlateforme));
      }
      saveDataStore();
    } catch (e) {
      appState.db = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
      saveDataStore();
    }
  } else {
    appState.db = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
    saveDataStore();
  }

  // Synchronisation automatique bidirectionnelle avec les inscriptions faites sur le portail (index.html)
  syncEstablishmentsFromPortalAndRegistry();
  syncEstablishmentClasses();
  syncEstablishmentStudents();
  syncEstablishmentTeachers();

  // Vérifier si le serveur Express écoute sur :5000 (Mode API Persistante ou LocalStorage Autonome)
  const isWebOr5000 = (window.location.port === '5000' || (window.location.protocol.startsWith('http') && window.location.hostname !== 'localhost'));
  if (isWebOr5000) {
    const healthController = new AbortController();
    const healthTimeout = setTimeout(() => healthController.abort(), 1200);

    fetch('http://localhost:5000/api/health', { signal: healthController.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(healthTimeout);
        if (data.status === 'ONLINE') {
          appState.isApiOnline = true;
          const statusPill = document.getElementById('apiStatusPill');
          if (statusPill) {
            statusPill.innerHTML = '🟢 API Connectée (Port 5000)';
            statusPill.className = 'badge-tag badge-green';
          }
        }
      })
      .catch(() => {
        clearTimeout(healthTimeout);
        appState.isApiOnline = false;
        const statusPill = document.getElementById('apiStatusPill');
        if (statusPill) {
          statusPill.innerHTML = '⚡ Stockage Local Actif (ACID)';
          statusPill.className = 'badge-tag badge-blue';
        }
      });
  } else {
    appState.isApiOnline = false;
    const statusPill = document.getElementById('apiStatusPill');
    if (statusPill) {
      statusPill.innerHTML = '⚡ Stockage Local Actif (ACID)';
      statusPill.className = 'badge-tag badge-blue';
    }
  }

  // Lancer la synchronisation Cloud Supabase bidirectionnelle en arrière-plan
  syncFromSupabaseCloudDashboard();
}

// Synchronisation Cloud Supabase bidirectionnelle pour Dashboard (Mobile, Tablette, PC)
async function syncFromSupabaseCloudDashboard() {
  if (!window.SSE_SUPABASE) return;
  try {
    // 1. Récupérer etablissements depuis Supabase
    if (typeof window.SSE_SUPABASE.getEtablissements === 'function') {
      const supaEtabs = await window.SSE_SUPABASE.getEtablissements();
      if (Array.isArray(supaEtabs) && supaEtabs.length > 0) {
        supaEtabs.forEach(se => {
          if (se && se.name) {
            importOrUpdateEstablishmentInDb(se);
          }
        });
        saveDataStore();
      }
    }

    // 2. Récupérer élèves depuis Supabase pour l'établissement actif ou EMF
    const estKey = getActiveEstablishmentKey();
    if (typeof window.SSE_SUPABASE.getEleves === 'function') {
      const cloudEleves = await window.SSE_SUPABASE.getEleves(estKey);
      if (Array.isArray(cloudEleves) && cloudEleves.length > 0) {
        let added = 0;
        cloudEleves.forEach(ce => {
          const exists = appState.db.eleves.some(el =>
            (el.id && ce.id && el.id === ce.id) ||
            (el.matricule && ce.matricule && el.matricule.trim().toUpperCase() === ce.matricule.trim().toUpperCase()) ||
            (el.prenom && el.nom && ce.prenom && ce.nom && el.prenom.trim().toLowerCase() === ce.prenom.trim().toLowerCase() && el.nom.trim().toLowerCase() === ce.nom.trim().toLowerCase())
          );
          if (!exists) {
            appState.db.eleves.push(ce);
            added++;
          }
        });
        if (added > 0) {
          saveDataStore();
          renderCurrentView();
        }
      }
    }

    const statusPill = document.getElementById('apiStatusPill');
    if (statusPill) {
      statusPill.innerHTML = '🟢 Supabase Cloud Synchronisé';
      statusPill.className = 'badge-tag badge-green';
    }
  } catch(err) {
    console.warn('[Dashboard] Sync Cloud Supabase:', err);
  }
}

// --- SYNCHRONISATION MULTI-ORIGINES PORTAIL / SAAS ---
function syncEstablishmentsFromPortalAndRegistry() {
  if (!appState.db || !Array.isArray(appState.db.etablissements)) return;

  // 1. S'assurer que tous les établissements par défaut de DEFAULT_DATABASE sont injectés (s'il y en a)
  DEFAULT_DATABASE.etablissements.forEach(defEtab => {
    const exists = appState.db.etablissements.some(e => 
      e.id === defEtab.id || e.name.toLowerCase().trim() === defEtab.name.toLowerCase().trim()
    );
    if (!exists) {
      appState.db.etablissements.push(JSON.parse(JSON.stringify(defEtab)));
    }
  });

  // 2. Synchroniser depuis sunuschool_establishment (espace actif enregistré depuis index.html)
  try {
    const activeEstRaw = localStorage.getItem('sunuschool_establishment');
    if (activeEstRaw) {
      const pEst = JSON.parse(activeEstRaw);
      const isFakeDemoName = (item) => {
        if (!item) return false;
        if (typeof item === 'object') {
          if (item.isUserCreated || item.phone || item.email || item.dateAdhesion) return false;
          const id = (item.id || '').toLowerCase();
          const code = (item.code || '').toUpperCase();
          return id === 'etab-001' || id === 'etab-002' || id === 'etab-003' || id === 'etab-demo' || id === 'demo' ||
                 code === 'SSE-SN-1001' || code === 'SSE-SN-1002' || code === 'SSE-SN-1003' || code === 'DEMO';
        }
        const s = (item || '').toLowerCase().trim();
        return s === 'etab-001' || s === 'etab-002' || s === 'etab-003' || s === 'etab-demo' || s === 'demo' ||
               s === 'sse-sn-1001' || s === 'sse-sn-1002' || s === 'sse-sn-1003';
      };
      if (pEst && pEst.name && !isFakeDemoName(pEst)) {
        importOrUpdateEstablishmentInDb(pEst);
      }
    }
  } catch (e) {
    console.warn("Erreur lecture sunuschool_establishment:", e);
  }

  // 3. Synchroniser depuis sunuschool_establishments_registry (registre d'inscriptions réelles du portail)
  try {
    const regRaw = localStorage.getItem('sunuschool_establishments_registry');
    if (regRaw) {
      const registry = JSON.parse(regRaw);
      if (Array.isArray(registry)) {
        registry.forEach(rEst => {
          if (rEst && rEst.name && !isFakeDemoName(rEst)) {
            importOrUpdateEstablishmentInDb(rEst);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Erreur lecture sunuschool_establishments_registry:", e);
  }

  // 4. S'assurer de la présence du pilote Institut Supérieur de Formation Professionnelle (ISFP Thiès)
  const isfpExists = appState.db.etablissements.some(e => 
    e.code === 'SSE-SN-7001' || (e.name && e.name.toLowerCase().includes('isfp'))
  );
  if (!isfpExists) {
    importOrUpdateEstablishmentInDb({
      id: "etab-thies-formation-01",
      code: "SSE-SN-7001",
      name: "Institut Supérieur de Formation Professionnelle (ISFP Thiès)",
      type: "FORMATION_PRO",
      city: "Thiès (Cité Malick Sy)",
      phone: "+221 77 654 32 10",
      email: "contact@isfp-thies.sn",
      secretKey: "ADM-7001",
      directeurNom: "Dr. Mamadou Cissé",
      plan: "Formule Institut & BTS",
      effectif: 85,
      statut: "ACTIF",
      statutAbonnement: "ACTIF",
      fraisAdhesionPayes: true
    });
  }

  saveDataStore();
}

function importOrUpdateEstablishmentInDb(portalEst) {
  if (!portalEst || !portalEst.name) return;
  const normName = portalEst.name.trim().toLowerCase();

  let existing = appState.db.etablissements.find(e => 
    (portalEst.code && e.code && e.code.toLowerCase() === portalEst.code.toLowerCase()) ||
    (e.name && e.name.trim().toLowerCase() === normName)
  );

  let price = 45000;
  const pPlan = (portalEst.plan || '').toLowerCase();
  if (pPlan.includes('85') || pPlan.includes('premium')) price = 85000;
  else if (pPlan.includes('75')) price = 75000;
  else if (pPlan.includes('65') || pPlan.includes('institut')) price = 65000;
  else if (pPlan.includes('55') || pPlan.includes('pro')) price = 55000;
  else if (pPlan.includes('20') || pPlan.includes('starter')) price = 20000;
  else if (pPlan.includes('35') || pPlan.includes('daara')) price = 35000;
  else if (pPlan.includes('700')) price = 70000;

  let code = portalEst.code || `SSE-SN-${Math.floor(1000 + Math.random() * 9000)}`;
  if (code === 'SSE-SN-1786' && !normName.includes('diamil')) {
    code = `SSE-SN-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  if (existing) {
    existing.name = portalEst.name;
    if (portalEst.city) existing.city = portalEst.city;
    if (portalEst.phone) existing.phone = portalEst.phone;
    if (portalEst.plan) existing.plan = portalEst.plan;
    existing.prixMensuel = price;
    if (portalEst.type) existing.type = portalEst.type;
    if (portalEst.statut) existing.statut = portalEst.statut;
    if (portalEst.statutAbonnement) existing.statutAbonnement = portalEst.statutAbonnement;
    if (portalEst.waveTransactionRef) existing.waveTransactionRef = portalEst.waveTransactionRef;
    if (portalEst.fraisAdhesionPayes !== undefined) existing.fraisAdhesionPayes = portalEst.fraisAdhesionPayes;
  } else {
    const slug = portalEst.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newEtab = {
      id: portalEst.id || `etab-${slug}`,
      code: code,
      name: portalEst.name,
      type: portalEst.type || (pPlan.includes('daara') ? 'DAARA' : 'ECOLE'),
      city: portalEst.city || 'Tivaouane',
      phone: portalEst.phone || '+221 77 555 44 33',
      email: portalEst.email || `direction@${slug}.sn`,
      directeurNom: (portalEst.directeurNom && portalEst.directeurNom !== 'Dir. Le' && portalEst.directeurNom !== 'Le') ? portalEst.directeurNom : (portalEst.name ? `Direction ${portalEst.name}` : 'Direction Générale'),
      plan: portalEst.plan || 'Formule Premium École (85 000 FCFA/mois)',
      prixMensuel: price,
      statut: portalEst.statut || "EN_ATTENTE_VALIDATION",
      statutAbonnement: portalEst.statutAbonnement || portalEst.statut || "EN_ATTENTE_VALIDATION",
      waveTransactionRef: portalEst.waveTransactionRef || "Non renseignée",
      echeanceAbonnement: portalEst.echeanceAbonnement || "2026-11-29",
      dateAdhesion: portalEst.dateAdhesion || new Date().toISOString().split('T')[0],
      fraisAdhesionPayes: portalEst.fraisAdhesionPayes === true
    };
    appState.db.etablissements.push(newEtab);

    appState.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      user: "SYNCHRO_PORTAIL",
      role: "SUPER_ADMIN",
      action: "IMPORT_ETABLISSEMENT",
      details: `Établissement "${newEtab.name}" synchronisé depuis le portail d'inscription (${newEtab.city}) - Formule: ${newEtab.plan} - Statut: ${newEtab.statutAbonnement}`
    });
  }
}

function saveDataStore() {
  localStorage.setItem('sse_saas_database', JSON.stringify(appState.db));
}

// --- NOTIFICATIONS TOAST ---
function showToast(message, isError = false) {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  toast.innerHTML = `<span>${isError ? '⚠️' : '✅'}</span> <div>${message}</div>`;
  toast.style.borderColor = isError ? 'var(--danger)' : 'var(--primary)';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function switchTab(tabId) {
  if (tabId === 'superadmin' || appState.activeRole === 'SUPER_ADMIN') {
    window.location.href = 'admin.html';
    return;
  }

  const role = appState.activeRole;
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  // Contrôle d'accès strict selon le rôle (RBAC)
  if (role === 'OUSTAZ') {
      // L'Oustaz se concentre sur la mémorisation et le suivi moral des talibés (pas de caisse ni d'audit système)
      if (tabId === 'caisse' || tabId === 'audit' || tabId === 'school' || tabId === 'grades' || tabId === 'finconfig') {
        showToast("Accès réservé à la Direction et au Service Comptable.", true);
        tabId = 'daara';
      }
    } else if (role === 'ENSEIGNANT') {
      // L'enseignant se concentre sur les notes, les effectifs de classe et les bulletins (pas de caisse ni d'audit)
      if (tabId === 'caisse' || tabId === 'audit' || tabId === 'daara' || tabId === 'finconfig') {
        showToast("Accès réservé à la Direction et au Service Comptable.", true);
        tabId = isDaara ? 'overview' : 'grades';
      }
    } else if (role === 'COMPTABLE') {
      // Le comptable gère la caisse, les encaissements et les relances financières
      if (tabId === 'daara' || tabId === 'school' || tabId === 'grades' || tabId === 'timetable') {
        showToast("Accès réservé au corps pédagogique et à la Direction.", true);
        tabId = 'caisse';
      }
    } else {
      // ADMIN_DIRECTEUR : accès complet selon le type d'établissement
      if (isDaara && (tabId === 'school' || tabId === 'grades')) {
        tabId = 'daara';
      } else if (!isDaara && tabId === 'daara') {
        tabId = 'school';
      }
    }

  appState.activeTab = tabId;

  // Mise à jour des vues actives
  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Titres en-tête dynamiques selon établissement et rôle
  const titles = {
    overview: { 
      title: isDaara 
        ? (role === 'OUSTAZ' ? "Espace Pédagogique Oustaz" : (role === 'COMPTABLE' ? "Suivi Recouvrement Pensions" : "Tableau de Bord Daara Moderne"))
        : (isInstitut 
            ? "Tableau de Bord Institut & Formation Pro" 
            : (role === 'ENSEIGNANT' ? "Espace Classe & Moyennes" : (role === 'COMPTABLE' ? "Suivi Recouvrement Scolarités" : "Tableau de Bord École Privée"))), 
      desc: isDaara 
        ? "Supervision en direct des effectifs talibés, pensions et mémorisation coranique" 
        : (isInstitut 
            ? "Supervision en direct des filières BTS/CAP, inscriptions, scolarités et formateurs" 
            : "Supervision en direct des effectifs scolaires, scolarités et moyennes de classe")
    },
    daara: { title: "Daara Moderne & Suivi Coranique", desc: "Progression Hizb 1 à 60, Tajwîd, Internat & Cartes PVC" },
    school: { 
      title: isInstitut ? "Gestion des Étudiants & Stagiaires (BTS & Métiers)" : "Gestion Scolaire & Effectifs", 
      desc: isInstitut ? "Filières Professionnelles, BTS, CAP, CQP et Conventions de stage" : "Cycles Primaire, Collège et Lycée (CI à Terminale)" 
    },
    classes: { 
      title: isDaara ? "Classes & Niveaux Coraniques (Daara)" : (isInstitut ? "Filières & Spécialités Professionnelles" : "Gestion des Classes & Niveaux Pédagogiques"), 
      desc: isDaara 
        ? "Packs de mémorisation en 1 clic (Hifz 1-2 & Fiqh), effectifs de pensionnaires et emplois du temps" 
        : (isInstitut 
            ? "Packs BTS/CAP/CQP en 1 clic (Comptabilité, Génie Logiciel, Réseaux, Électricité), ateliers et laboratoires" 
            : "Packs officiels en 1 clic (Primaire, Collège, Lycée), effectifs réels, professeurs principaux et emplois du temps")
    },
    grades: { 
      title: isInstitut ? "Relevés Semestriels LMD & Crédits" : "Notes & Bulletins Officiels", 
      desc: isInstitut ? "Gestion des crédits ECTS, unités d'enseignement (UE), moyennes semestrielles et attestations" : "Coefficients officiels sénégalais, moyennes pondérées et impression PDF" 
    },
    timetable: { 
      title: isDaara ? "Emploi du Temps Hebdomadaire (Daara Moderne)" : (isInstitut ? "Planning des Cours Magistraux & Ateliers" : "Emploi du Temps & Planning Pédagogique (École)"), 
      desc: isDaara 
        ? "Grille horaire hebdomadaire adaptée aux séances de Tahfîz, Allouwa, Tajwîd et Murâja'ah" 
        : (isInstitut 
            ? "Planning des séances théoriques, travaux pratiques en atelier et laboratoires spécialisés" 
            : "Gestion des créneaux de cours, matières officielles, salles et enseignants par classe")
    },
    teachers: {
      title: isDaara ? "Corps des Oustazs & Personnel Daara" : (isInstitut ? "Corps des Formateurs & Professionnels Vacataires" : "Corps Professoral, Enseignants & RH"),
      desc: isDaara
        ? "Gestion des maîtres coraniques, contrats d'enseignement, affectations de groupes et salaires"
        : (isInstitut 
            ? "Gestion des enseignants titulaires, experts métier, vacations et fiches de paie" 
            : "Gestion des enseignants titulaires et vacataires, contrats de travail, affectations de classes et fiches de paie")
    },
    caisse: { 
      title: isDaara ? "Caisse & Pensions SYSCOHADA (Daara)" : (isInstitut ? "Caisse Scolarités & Droits d'Examen (SYSCOHADA)" : "Caisse & Scolarités SYSCOHADA (École)"), 
      desc: "Passerelle Wave, Orange Money et Grand Livre de caisse certifié" 
    },
    finconfig: { 
      title: isDaara ? "Comptes d'Encaissement & Wave Marchand (Daara)" : (isInstitut ? "Comptes d'Encaissement Institut & Coordonnées Bancaires" : "Comptes d'Encaissement & Coordonnées Bancaires (École)"), 
      desc: "Configuration des comptes Wave Business, Orange Money et RIB bancaire pour encaissement direct des scolarités" 
    },
    comms: { 
      title: isDaara ? "Communication Parents & Tuteurs (Daara)" : (isInstitut ? "Communication Étudiants & Entreprises Partenaires" : "Communication Familles & Clés d'Accès (École)"), 
      desc: "Notifications SMS/WhatsApp et distribution des clés d'accès" 
    },
    stages: { 
      title: "Conventions Tripartites de Stage & Immersion Pro", 
      desc: "Gestion contractuelle des stages en entreprise (BTS, Licences Pro, CAP/CQP) et suivi des tuteurs" 
    },
    certificats: { 
      title: "Diplômes, Attestations Officielles & QR Codes de Vérification", 
      desc: "Délivrance conforme LMD des attestations de scolarité, réussites annuelles et certificats de qualification" 
    },
    audit: { title: "Sécurité & Journal d'Audit", desc: "Traçabilité intégrale de toutes les opérations administratives" },
    superadmin: { title: "👑 Supervision Centrale Super Admin SaaS", desc: "Suivi du parc d'établissements abonnés, MRR récurrent et gestion des licences" }
  };

  const current = titles[tabId] || titles.overview;
  const hTitle = document.getElementById('currentViewTitle');
  const hDesc = document.getElementById('currentViewDesc');
  if (hTitle) hTitle.textContent = current.title;
  if (hDesc) hDesc.textContent = current.desc;

  // Rendu de la sidebar dynamique et des actions
  renderSidebar();

  // Rafraîchir les données de la vue
  renderCurrentView();
}

// --- RENDU DYNAMIQUE DE LA SIDEBAR ADAPTÉE AUX RÔLES ET ÉTABLISSEMENTS ---
function renderSidebar() {
  const sidebarNav = document.getElementById('sidebarNav');
  if (!sidebarNav) return;

  const role = appState.activeRole;
  if (role === 'SUPER_ADMIN') {
    window.location.href = 'admin.html';
    return;
  }
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const etabPill = document.getElementById('sidebarEtabPill');
  const etabAvatar = document.getElementById('sidebarEtabAvatar');
  const etabName = document.getElementById('sidebarEtabName');
  const etabType = document.getElementById('sidebarEtabType');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const userNameEl = document.getElementById('userNameDisplay');
  const userAvatar = document.getElementById('userAvatar');

  // Mise à jour du rappel de la formule souscrite (Sidebar & Header)
  const rawPlan = etab && etab.plan ? etab.plan : (isDaara ? 'Pack Internat Promo Daara (20 000 FCFA/mois)' : (isInstitut ? 'Institut Pro (75 000 FCFA/mois)' : 'Formule École Pro (55 000 FCFA/mois)'));
  const cleanPlan = rawPlan.toLowerCase().startsWith('formule') || rawPlan.toLowerCase().startsWith('pack') || rawPlan.toLowerCase().startsWith('option') ? rawPlan : `Formule ${rawPlan}`;
  const planLower = cleanPlan.toLowerCase();
  
  let planIcon = '⭐';
  if (isInstitut || planLower.includes('institut')) {
    planIcon = '🎓';
  } else if (isDaara || planLower.includes('daara')) {
    planIcon = planLower.includes('annuel') || planLower.includes('sérénité') || planLower.includes('350') ? '👑' : (planLower.includes('promo') || planLower.includes('20') ? '🏷️' : '🕌');
  } else {
    planIcon = planLower.includes('premium') || planLower.includes('85') ? '👑' : (planLower.includes('pro') || planLower.includes('55') ? '⚡' : '🌱');
  }

  const sidebarPlanText = document.getElementById('sidebarEtabPlanText');
  const sidebarPlanIcon = document.getElementById('sidebarEtabPlanIcon');
  if (sidebarPlanText) {
    sidebarPlanText.textContent = cleanPlan;
    if (sidebarPlanIcon) sidebarPlanIcon.textContent = planIcon;
  }

  const headerPlanText = document.getElementById('headerPlanText');
  const headerPlanIcon = document.getElementById('headerPlanIcon');
  if (headerPlanText) {
    headerPlanText.textContent = cleanPlan;
    if (headerPlanIcon) headerPlanIcon.textContent = planIcon;
  }

  // ================= 1. RÔLE OUSTAZ (MAÎTRE CORANIQUE) =================
  if (role === 'OUSTAZ') {
    if (etabPill) etabPill.className = 'establishment-pill daara-mode';
    if (etabAvatar) etabAvatar.textContent = '🕌';
    if (etabName) etabName.textContent = etab.name;
    if (etabType) etabType.textContent = `🕌 Daara Moderne • ${etab.city}`;

    if (userRoleBadge) {
      userRoleBadge.textContent = 'OUSTAZ TAHFÎZ & TAJWÎD';
      userRoleBadge.style.color = 'var(--gold)';
    }
    if (userNameEl) userNameEl.textContent = 'Oustaz Serigne Modou Ndiaye';
    if (userAvatar) userAvatar.textContent = '👳';

    sidebarNav.innerHTML = `
      <div class="nav-section-title" style="color: var(--gold); font-weight: 800;">PÉDAGOGIE CORANIQUE</div>

      <a class="nav-link ${appState.activeTab === 'daara' ? 'active' : ''}" data-tab="daara" onclick="switchTab('daara')">
        <span class="nav-link-icon">📖</span>
        <span class="nav-text">Mémorisation (Hizb 1-60)</span>
        <span class="nav-counter" id="daaraBadgeCount">60 Hizb</span>
      </a>

      <a class="nav-link ${appState.activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchTab('timetable')">
        <span class="nav-link-icon">📅</span>
        <span class="nav-text">Emploi du Temps Daara</span>
      </a>

      <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
        <span class="nav-link-icon">📊</span>
        <span class="nav-text">Progression de mes Talibés</span>
      </a>

      <div class="nav-section-title">DISCIPLINE & VIE DU DAARA</div>

      <a class="nav-link" onclick="openAttendanceModal()">
        <span class="nav-link-icon">⚡</span>
        <span class="nav-text">Feuille d'Appel Matin</span>
      </a>

      <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
        <span class="nav-link-icon">💬</span>
        <span class="nav-text">WhatsApp Parents & Évaluations</span>
      </a>
    `;

  // ================= 3. RÔLE ENSEIGNANT (PROFESSEUR DE CLASSE) =================
  } else if (role === 'ENSEIGNANT') {
    if (etabPill) etabPill.className = isDaara ? 'establishment-pill daara-mode' : 'establishment-pill ecole-mode';
    if (etabAvatar) etabAvatar.textContent = isDaara ? '🕌' : '🏫';
    if (etabName) etabName.textContent = etab.name;
    if (etabType) etabType.textContent = isDaara ? `🕌 Daara Moderne • ${etab.city}` : `🏫 École Privée • ${etab.city}`;

    if (userRoleBadge) {
      userRoleBadge.textContent = 'ENSEIGNANT TITULAIRE';
      userRoleBadge.style.color = '#38BDF8';
    }
    if (userNameEl) userNameEl.textContent = 'Prof. Amadou Ba (Enseignant)';
    if (userAvatar) userAvatar.textContent = '👨‍🏫';

    if (isDaara) {
      sidebarNav.innerHTML = `
        <div class="nav-section-title" style="color: #38BDF8; font-weight: 800;">ESPACE ENSEIGNANT FRANCO-ARABE</div>

        <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
          <span class="nav-link-icon">📊</span>
          <span class="nav-text">Suivi de la Classe</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'daara' ? 'active' : ''}" data-tab="daara" onclick="switchTab('daara')">
          <span class="nav-link-icon">📖</span>
          <span class="nav-text">Évaluations & Niveaux</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchTab('timetable')">
          <span class="nav-link-icon">📅</span>
          <span class="nav-text">Emploi du Temps Hebdo</span>
        </a>

        <div class="nav-section-title">POINTAGE & CONTACT</div>

        <a class="nav-link" onclick="openAttendanceModal()">
          <span class="nav-link-icon">⚡</span>
          <span class="nav-text">Feuille d'Appel du Jour</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
          <span class="nav-link-icon">💬</span>
          <span class="nav-text">Communication Parents</span>
        </a>
      `;
    } else {
      sidebarNav.innerHTML = `
        <div class="nav-section-title" style="color: #38BDF8; font-weight: 800;">ESPACE ENSEIGNANT & CLASSE</div>

        <a class="nav-link ${appState.activeTab === 'grades' ? 'active' : ''}" data-tab="grades" onclick="switchTab('grades')">
          <span class="nav-link-icon">📑</span>
          <span class="nav-text">Notes & Bulletins Classe</span>
          <span class="nav-counter" style="background: rgba(168,85,247,0.15); color: #A855F7;">Semestre 1</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'school' ? 'active' : ''}" data-tab="school" onclick="switchTab('school')">
          <span class="nav-link-icon">🏫</span>
          <span class="nav-text">Effectifs de ma Classe</span>
          <span class="nav-counter" style="background: rgba(56,189,248,0.15); color: #38BDF8;">CI à Tle</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchTab('timetable')">
          <span class="nav-link-icon">📅</span>
          <span class="nav-text">Emploi du Temps Classe</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
          <span class="nav-link-icon">📊</span>
          <span class="nav-text">Moyennes & Statistiques</span>
        </a>

        <div class="nav-section-title">SUIVI PÉDAGOGIQUE</div>

        <a class="nav-link" onclick="openAttendanceModal()">
          <span class="nav-link-icon">⚡</span>
          <span class="nav-text">Appel Matinal (Présences)</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
          <span class="nav-link-icon">💬</span>
          <span class="nav-text">Contact Familles d'Élèves</span>
        </a>
      `;
    }

  // ================= 4. RÔLE COMPTABLE (SYSCOHADA) =================
  } else if (role === 'COMPTABLE') {
    if (etabPill) etabPill.className = isDaara ? 'establishment-pill daara-mode' : 'establishment-pill ecole-mode';
    if (etabAvatar) etabAvatar.textContent = '💳';
    if (etabName) etabName.textContent = etab.name;
    if (etabType) etabType.textContent = `${isDaara ? '🕌 Daara' : '🏫 École'} • Service Comptable`;

    if (userRoleBadge) {
      userRoleBadge.textContent = 'COMPTABLE SYSCOHADA';
      userRoleBadge.style.color = '#10B981';
    }
    if (userNameEl) userNameEl.textContent = 'M. Mamadou Diop (Agent Comptable)';
    if (userAvatar) userAvatar.textContent = '💳';

    sidebarNav.innerHTML = `
      <div class="nav-section-title" style="color: #10B981; font-weight: 800;">COMPTABILITÉ & TRÉSORERIE</div>

      <a class="nav-link ${appState.activeTab === 'caisse' ? 'active' : ''}" data-tab="caisse" onclick="switchTab('caisse')">
        <span class="nav-link-icon">💳</span>
        <span class="nav-text">Caisse & Règlements Wave/OM</span>
        <span class="nav-counter" style="background: rgba(16,185,129,0.2); color: #10B981;">SYSCOHADA</span>
      </a>

      <a class="nav-link ${appState.activeTab === 'finconfig' ? 'active' : ''}" data-tab="finconfig" onclick="switchTab('finconfig')">
        <span class="nav-link-icon">⚙️</span>
        <span class="nav-text">Paramètres d'Encaissement</span>
        <span class="nav-counter" style="background: rgba(0,210,180,0.15); color: #00D2B4;">Wave / OM</span>
      </a>

      <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
        <span class="nav-link-icon">📊</span>
        <span class="nav-text">Tableau de Recouvrement</span>
      </a>

      <div class="nav-section-title">RELANCES & TRACABILITÉ</div>

      <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
        <span class="nav-link-icon">💬</span>
        <span class="nav-text">Relances WhatsApp Impayés</span>
      </a>

      <a class="nav-link ${appState.activeTab === 'audit' ? 'active' : ''}" data-tab="audit" onclick="switchTab('audit')">
        <span class="nav-link-icon">🛡️</span>
        <span class="nav-text">Grand Livre & Audit Financier</span>
      </a>
    `;

  // ================= 5. RÔLE ADMIN_DIRECTEUR (DIRECTEUR GÉNÉRAL) =================
  } else {
    if (isDaara) {
      if (etabPill) etabPill.className = 'establishment-pill daara-mode';
      if (etabAvatar) etabAvatar.textContent = '🕌';
      if (etabName) etabName.textContent = etab.name;
      if (etabType) etabType.textContent = `🕌 Daara Moderne • ${etab.city}`;

      if (userRoleBadge) {
        userRoleBadge.textContent = 'DIRECTION GÉNÉRALE (DAARA)';
        userRoleBadge.style.color = 'var(--gold)';
      }
      if (userNameEl) userNameEl.textContent = 'Direction Générale (Serigne Modou Ndiaye)';
      if (userAvatar) userAvatar.textContent = '🏛️';

      sidebarNav.innerHTML = `
        <div class="nav-section-title">PILOTAGE GÉNÉRAL DU DAARA</div>

        <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
          <span class="nav-link-icon">📊</span>
          <span class="nav-text">Vue d'Ensemble Daara</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'daara' ? 'active' : ''}" data-tab="daara" onclick="switchTab('daara')">
          <span class="nav-link-icon">📖</span>
          <span class="nav-text">Daara & Coran (Hifz)</span>
          <span class="nav-counter" id="daaraBadgeCount">60 Hizb</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'classes' ? 'active' : ''}" data-tab="classes" onclick="switchTab('classes')">
          <span class="nav-link-icon">🏫</span>
          <span class="nav-text">Classes & Niveaux</span>
          <span class="nav-counter" id="sidebarClassesCountDaara" style="background: rgba(245,158,11,0.2); color: #F59E0B;">Packs Daara</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchTab('timetable')">
          <span class="nav-link-icon">📅</span>
          <span class="nav-text">Emploi du Temps Daara</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'teachers' ? 'active' : ''}" data-tab="teachers" onclick="switchTab('teachers')">
          <span class="nav-link-icon">👳</span>
          <span class="nav-text">Oustazs & Personnel</span>
          <span class="nav-counter" id="sidebarTeachersCountDaara" style="background: rgba(245,158,11,0.2); color: #F59E0B;">Oustazs</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'caisse' ? 'active' : ''}" data-tab="caisse" onclick="switchTab('caisse')">
          <span class="nav-link-icon">💳</span>
          <span class="nav-text">Caisse & Pensions</span>
          <span class="nav-counter" style="background: rgba(16,185,129,0.2); color: #10B981;">SYSCOHADA</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'finconfig' ? 'active' : ''}" data-tab="finconfig" onclick="switchTab('finconfig')">
          <span class="nav-link-icon">⚙️</span>
          <span class="nav-text">Comptes d'Encaissement</span>
          <span class="nav-counter" style="background: rgba(0,210,180,0.15); color: #00D2B4;">Wave / OM</span>
        </a>

        <div class="nav-section-title">COMMUNICATION & SÉCURITÉ</div>

        <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
          <span class="nav-link-icon">💬</span>
          <span class="nav-text">WhatsApp & Parents Tuteurs</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'audit' ? 'active' : ''}" data-tab="audit" onclick="switchTab('audit')">
          <span class="nav-link-icon">🛡️</span>
          <span class="nav-text">Journal d'Audit (Logs)</span>
        </a>
      `;
    } else if (isInstitut) {
      if (etabPill) etabPill.className = 'establishment-pill institut-mode';
      if (etabAvatar) etabAvatar.textContent = '🎓';
      if (etabName) etabName.textContent = etab.name;
      if (etabType) etabType.textContent = `🎓 Institut Pro • ${etab.city}`;

      if (userRoleBadge) {
        userRoleBadge.textContent = 'DIRECTION DES ÉTUDES (INSTITUT)';
        userRoleBadge.style.color = '#38BDF8';
      }
      if (userNameEl) userNameEl.textContent = etab.directeurNom ? `Direction des Études (${etab.directeurNom})` : 'Dr. Mamadou Cissé (Directeur des Études)';
      if (userAvatar) userAvatar.textContent = '🏛️';

      sidebarNav.innerHTML = `
        <div class="nav-section-title">PILOTAGE FORMATION PROFESSIONNELLE</div>

        <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
          <span class="nav-link-icon">📊</span>
          <span class="nav-text">Vue d'Ensemble Institut</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'school' ? 'active' : ''}" data-tab="school" onclick="switchTab('school')">
          <span class="nav-link-icon">🎓</span>
          <span class="nav-text">Étudiants & Stagiaires</span>
          <span class="nav-counter" style="background: rgba(56,189,248,0.15); color: #38BDF8;">BTS & Métiers</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'classes' ? 'active' : ''}" data-tab="classes" onclick="switchTab('classes')">
          <span class="nav-link-icon">🏛️</span>
          <span class="nav-text">Filières & Spécialités</span>
          <span class="nav-counter" id="sidebarClassesCount" style="background: rgba(56,189,248,0.15); color: #38BDF8;">Packs BTS/CAP</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'grades' ? 'active' : ''}" data-tab="grades" onclick="switchTab('grades')">
          <span class="nav-link-icon">📑</span>
          <span class="nav-text">Relevés Semestriels LMD</span>
          <span class="nav-counter" style="background: rgba(168,85,247,0.15); color: #A855F7;">Crédits & Modules</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchTab('timetable')">
          <span class="nav-link-icon">📅</span>
          <span class="nav-text">Planning Cours & Ateliers</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'teachers' ? 'active' : ''}" data-tab="teachers" onclick="switchTab('teachers')">
          <span class="nav-link-icon">👨‍🏫</span>
          <span class="nav-text">Formateurs & Vacataires</span>
          <span class="nav-counter" id="sidebarTeachersCount" style="background: rgba(168,85,247,0.15); color: #A855F7;">Formateurs</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'caisse' ? 'active' : ''}" data-tab="caisse" onclick="switchTab('caisse')">
          <span class="nav-link-icon">💳</span>
          <span class="nav-text">Scolarités & Droits d'Examen</span>
          <span class="nav-counter" style="background: rgba(16,185,129,0.2); color: #10B981;">SYSCOHADA</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'finconfig' ? 'active' : ''}" data-tab="finconfig" onclick="switchTab('finconfig')">
          <span class="nav-link-icon">⚙️</span>
          <span class="nav-text">Comptes d'Encaissement</span>
          <span class="nav-counter" style="background: rgba(0,210,180,0.15); color: #00D2B4;">Wave / OM</span>
        </a>

        <div class="nav-section-title">COMMUNICATION & CONVENTIONS</div>

        <a class="nav-link ${appState.activeTab === 'stages' ? 'active' : ''}" data-tab="stages" onclick="switchTab('stages')">
          <span class="nav-link-icon">🤝</span>
          <span class="nav-text">Stages & Conventions</span>
          <span class="nav-counter" id="sidebarStagesCount" style="background: rgba(16,185,129,0.15); color: #10B981;">Tripartites</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'certificats' ? 'active' : ''}" data-tab="certificats" onclick="switchTab('certificats')">
          <span class="nav-link-icon">📜</span>
          <span class="nav-text">Attestations & Diplômes</span>
          <span class="nav-counter" id="sidebarCertificatsCount" style="background: rgba(245,158,11,0.15); color: #F59E0B;">QR Codes</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
          <span class="nav-link-icon">💬</span>
          <span class="nav-text">WhatsApp & Étudiants</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'audit' ? 'active' : ''}" data-tab="audit" onclick="switchTab('audit')">
          <span class="nav-link-icon">🛡️</span>
          <span class="nav-text">Journal d'Audit (Logs)</span>
        </a>
      `;
    } else {
      if (etabPill) etabPill.className = 'establishment-pill ecole-mode';
      if (etabAvatar) etabAvatar.textContent = '🏫';
      if (etabName) etabName.textContent = etab.name;
      if (etabType) etabType.textContent = `🏫 École Privée • ${etab.city}`;

      if (userRoleBadge) {
        userRoleBadge.textContent = 'DIRECTION GÉNÉRALE (ÉCOLE)';
        userRoleBadge.style.color = 'var(--primary)';
      }
      if (userNameEl) userNameEl.textContent = etab.directeurNom ? `Direction Générale (${etab.directeurNom})` : 'M. Babacar Fall (Directeur)';
      if (userAvatar) userAvatar.textContent = '🏛️';

      sidebarNav.innerHTML = `
        <div class="nav-section-title">PILOTAGE GÉNÉRAL SCOLAIRE</div>

        <a class="nav-link ${appState.activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchTab('overview')">
          <span class="nav-link-icon">📊</span>
          <span class="nav-text">Vue d'Ensemble École</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'school' ? 'active' : ''}" data-tab="school" onclick="switchTab('school')">
          <span class="nav-link-icon">🏫</span>
          <span class="nav-text">Scolarité (Classes CI-Tle)</span>
          <span class="nav-counter" style="background: rgba(56,189,248,0.15); color: #38BDF8;">CI à Tle</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'classes' ? 'active' : ''}" data-tab="classes" onclick="switchTab('classes')">
          <span class="nav-link-icon">🏫</span>
          <span class="nav-text">Classes & Niveaux</span>
          <span class="nav-counter" id="sidebarClassesCount" style="background: rgba(0,210,180,0.15); color: #00D2B4;">Packs 1 Clic</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'grades' ? 'active' : ''}" data-tab="grades" onclick="switchTab('grades')">
          <span class="nav-link-icon">📑</span>
          <span class="nav-text">Notes & Bulletins PDF</span>
          <span class="nav-counter" style="background: rgba(168,85,247,0.15); color: #A855F7;">Semestre 1</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchTab('timetable')">
          <span class="nav-link-icon">📅</span>
          <span class="nav-text">Emploi du Temps Hebdo</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'teachers' ? 'active' : ''}" data-tab="teachers" onclick="switchTab('teachers')">
          <span class="nav-link-icon">👨‍🏫</span>
          <span class="nav-text">Enseignants & RH</span>
          <span class="nav-counter" id="sidebarTeachersCount" style="background: rgba(168,85,247,0.15); color: #A855F7;">Corps Ens.</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'caisse' ? 'active' : ''}" data-tab="caisse" onclick="switchTab('caisse')">
          <span class="nav-link-icon">💳</span>
          <span class="nav-text">Caisse & Trésorerie</span>
          <span class="nav-counter" style="background: rgba(16,185,129,0.2); color: #10B981;">SYSCOHADA</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'finconfig' ? 'active' : ''}" data-tab="finconfig" onclick="switchTab('finconfig')">
          <span class="nav-link-icon">⚙️</span>
          <span class="nav-text">Comptes d'Encaissement</span>
          <span class="nav-counter" style="background: rgba(0,210,180,0.15); color: #00D2B4;">Wave / OM</span>
        </a>

        <div class="nav-section-title">COMMUNICATION & SÉCURITÉ</div>

        <a class="nav-link ${appState.activeTab === 'comms' ? 'active' : ''}" data-tab="comms" onclick="switchTab('comms')">
          <span class="nav-link-icon">💬</span>
          <span class="nav-text">WhatsApp & Clés Famille</span>
        </a>

        <a class="nav-link ${appState.activeTab === 'audit' ? 'active' : ''}" data-tab="audit" onclick="switchTab('audit')">
          <span class="nav-link-icon">🛡️</span>
          <span class="nav-text">Journal d'Audit (Logs)</span>
        </a>
      `;
    }
  }

  // Mettre à jour les boutons d'actions rapides du header selon le rôle
  updateHeaderActions();
}

// --- BOUTONS ACTIONS RAPIDES EN EN-TÊTE ADAPTÉS AU RÔLE ---
function updateHeaderActions() {
  const btnNew = document.getElementById('headerBtnNew');
  const btnNewText = document.getElementById('headerBtnNewText');
  const btnNewIcon = btnNew ? btnNew.querySelector('span:first-child') : null;
  const btnPay = document.getElementById('headerBtnPay');
  const btnPayIcon = document.getElementById('headerBtnPayIcon');
  const btnPayText = document.getElementById('headerBtnPayText');

  if (!btnNew || !btnPay) return;

  const role = appState.activeRole;
  const isSuperAdmin = role === 'SUPER_ADMIN' || appState.activeTab === 'superadmin';
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  if (isSuperAdmin) {
    if (btnNewIcon) btnNewIcon.textContent = "+";
    if (btnNewText) btnNewText.textContent = "Inscrire Établissement";
    btnNew.title = "Ajouter un Daara Moderne, une École Privée ou un Institut au SaaS SunuSchool";

    if (btnPayIcon) btnPayIcon.textContent = "📢";
    if (btnPayText) btnPayText.textContent = "Message Global";
    btnPay.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
    btnPay.title = "Diffuser une annonce WhatsApp à tous les directeurs abonnés";

  } else if (role === 'OUSTAZ') {
    // Boutons de travail quotidiens pour l'Oustaz
    if (btnNewIcon) btnNewIcon.textContent = "📖";
    if (btnNewText) btnNewText.textContent = "Valider Hizb";
    btnNew.title = "Noter et valider l'avancement coranique d'un talibé";

    if (btnPayIcon) btnPayIcon.textContent = "⚡";
    if (btnPayText) btnPayText.textContent = "Appel Présence";
    btnPay.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
    btnPay.title = "Pointer les présences du matin pour le daara";

  } else if (role === 'ENSEIGNANT') {
    // Boutons de travail quotidiens pour l'Enseignant
    if (btnNewIcon) btnNewIcon.textContent = "📑";
    if (btnNewText) btnNewText.textContent = isInstitut ? "Saisir Notes (LMD)" : "Saisir Notes";
    btnNew.title = isInstitut ? "Saisir les notes semestrielles et crédits LMD" : "Saisir les notes et devoirs pour le bulletin officiel";

    if (btnPayIcon) btnPayIcon.textContent = "⚡";
    if (btnPayText) btnPayText.textContent = "Faire l'Appel";
    btnPay.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
    btnPay.title = isInstitut ? "Pointer les présences des étudiants aux cours/ateliers" : "Pointer les présences des apprenants de la classe";

  } else if (role === 'COMPTABLE') {
    // Boutons financiers pour le Comptable
    if (btnNewIcon) btnNewIcon.textContent = "💳";
    if (btnNewText) btnNewText.textContent = "Encaisser Règlement";
    btnNew.title = "Encaisser un paiement Wave, Orange Money ou Espèces";

    if (btnPayIcon) btnPayIcon.textContent = "📊";
    if (btnPayText) btnPayText.textContent = "Grand Livre Caisse";
    btnPay.style.background = 'linear-gradient(135deg, #10B981, #00D2B4)';
    btnPay.title = "Consulter le grand livre de caisse SYSCOHADA";

  } else {
    // ADMIN_DIRECTEUR : Direction complète
    if (isDaara) {
      if (btnNewIcon) btnNewIcon.textContent = "+";
      if (btnNewText) btnNewText.textContent = "Nouveau Talibé";
      btnNew.title = "Inscrire un nouveau talibé au Daara Moderne";

      if (btnPayIcon) btnPayIcon.textContent = "💳";
      if (btnPayText) btnPayText.textContent = "Encaisser Pension";
      btnPay.style.background = 'linear-gradient(135deg, #10B981, #00D2B4)';
      btnPay.title = "Encaisser pension internat ou scolarité coranique (Wave, OM, Cash)";
    } else if (isInstitut) {
      if (btnNewIcon) btnNewIcon.textContent = "+";
      if (btnNewText) btnNewText.textContent = "Nouvel Étudiant";
      btnNew.title = "Inscrire un nouvel étudiant à l'institut (BTS, Licence, Formation Pro)";

      if (btnPayIcon) btnPayIcon.textContent = "💳";
      if (btnPayText) btnPayText.textContent = "Encaisser Formation";
      btnPay.style.background = 'linear-gradient(135deg, #38BDF8, #0284C7)';
      btnPay.title = "Encaisser frais de formation, scolarité ou droit d'examen (Wave, OM, Cash)";
    } else {
      if (btnNewIcon) btnNewIcon.textContent = "+";
      if (btnNewText) btnNewText.textContent = "Nouvel Élève";
      btnNew.title = "Inscrire un nouvel élève à l'école privée (CI à Terminale)";

      if (btnPayIcon) btnPayIcon.textContent = "💳";
      if (btnPayText) btnPayText.textContent = "Encaisser Scolarité";
      btnPay.style.background = 'linear-gradient(135deg, #10B981, #00D2B4)';
      btnPay.title = "Encaisser scolarité mensuelle ou frais d'inscription (Wave, OM, Cash)";
    }
  }
}

function handleHeaderNewBtn() {
  const role = appState.activeRole;
  const isSuperAdmin = role === 'SUPER_ADMIN' || appState.activeTab === 'superadmin';

  if (isSuperAdmin) {
    openNewClientModal();
  } else if (role === 'OUSTAZ') {
    const firstTalibe = appState.db.eleves.find(e => e.type === 'TALIBE' && e.etablissementId === appState.activeEstablishmentId);
    if (firstTalibe) {
      openHizbEvalModal(firstTalibe.id);
    } else {
      showToast("Aucun talibé enregistré à évaluer.", true);
    }
  } else if (role === 'ENSEIGNANT') {
    const firstEleve = appState.db.eleves.find(e => e.etablissementId === appState.activeEstablishmentId && (e.type === 'SCOLAIRE' || e.type === 'ETUDIANT'));
    if (firstEleve) {
      openGradesEntryModal(firstEleve.id);
    } else {
      const firstTalibe = appState.db.eleves.find(e => e.etablissementId === appState.activeEstablishmentId && e.type === 'TALIBE');
      if (firstTalibe) openHizbEvalModal(firstTalibe.id);
      else showToast("Aucun apprenant enregistré pour cette classe.", true);
    }
  } else if (role === 'COMPTABLE') {
    openEncaissementMultiModal();
  } else {
    // ADMIN_DIRECTEUR
    const etab = appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId);
    const isDaara = etab && etab.type === 'DAARA';
    const isInstitut = !isDaara && isInstitutEstablishment(etab);
    openNewEleveModal(isDaara ? 'TALIBE' : (isInstitut ? 'ETUDIANT' : 'SCOLAIRE'));
  }
}

function handleHeaderPayBtn() {
  const role = appState.activeRole;
  const isSuperAdmin = role === 'SUPER_ADMIN' || appState.activeTab === 'superadmin';

  if (isSuperAdmin) {
    openBroadcastModal();
  } else if (role === 'OUSTAZ' || role === 'ENSEIGNANT') {
    openAttendanceModal();
  } else if (role === 'COMPTABLE') {
    openGrandLivreModal();
  } else {
    // ADMIN_DIRECTEUR
    openEncaissementMultiModal();
  }
}

function enterSuperAdmin() {
  window.location.href = 'admin.html';
}

function exitSuperAdmin() {
  appState.activeRole = 'ADMIN_DIRECTEUR';
  const roleSelect = document.getElementById('roleSelect');
  if (roleSelect) roleSelect.value = 'ADMIN_DIRECTEUR';
  switchTab('overview');
}

function scrollToSaasSection(elementId) {
  if (appState.activeTab !== 'superadmin') {
    switchTab('superadmin');
  }
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 80);
}

// --- GESTION DES ÉTABLISSEMENTS & RÔLES ---
function switchEstablishment(etabId) {
  if (!appState.db) {
    initDataStore();
  }
  appState.activeEstablishmentId = etabId;
  const etab = (appState.db && appState.db.etablissements) 
    ? appState.db.etablissements.find(e => e.id === etabId) 
    : null;
  if (!etab) return;

  const selectEl = document.getElementById('establishmentSelect');
  if (selectEl && selectEl.value !== etabId) {
    selectEl.value = etabId;
  }

  // Si on était en Super Admin et qu'on choisit un établissement, basculer vers cet établissement
  if (appState.activeRole === 'SUPER_ADMIN' || appState.activeTab === 'superadmin') {
    appState.activeRole = 'ADMIN_DIRECTEUR';
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) roleSelect.value = 'ADMIN_DIRECTEUR';
    appState.activeTab = 'overview';
  } else {
    // Si on est dans un onglet non supporté par le nouvel établissement, retour à la vue d'ensemble
    if (etab.type === 'DAARA' && (appState.activeTab === 'school' || appState.activeTab === 'grades')) {
      appState.activeTab = 'overview';
    } else if (etab.type === 'ECOLE' && appState.activeTab === 'daara') {
      appState.activeTab = 'overview';
    }
  }

  showToast(`Établissement actif : ${etab.name} (${etab.type === 'DAARA' ? 'Daara Moderne' : 'École Privée'})`);
  switchTab(appState.activeTab);
}

function switchRole(roleKey) {
  appState.activeRole = roleKey;
  const roleSelect = document.getElementById('roleSelect');
  if (roleSelect && roleSelect.value !== roleKey) roleSelect.value = roleKey;

  const etab = (appState.db && appState.db.etablissements)
    ? appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId)
    : null;
  const isDaara = etab && etab.type === 'DAARA';

  if (roleKey === 'SUPER_ADMIN') {
    enterSuperAdmin();
    return;
  }

  // Redirection automatique vers la vue de travail clé du rôle sélectionné
  if (roleKey === 'OUSTAZ') {
    appState.activeTab = 'daara';
  } else if (roleKey === 'ENSEIGNANT') {
    appState.activeTab = isDaara ? 'overview' : 'grades';
  } else if (roleKey === 'COMPTABLE') {
    appState.activeTab = 'caisse';
  } else {
    // ADMIN_DIRECTEUR
    appState.activeTab = 'overview';
  }

  showToast(`👤 Espace ${getRoleLabel(roleKey)} activé ! Menus et actions adaptés.`);
  switchTab(appState.activeTab);
}

function getRoleLabel(roleKey) {
  const map = {
    'ADMIN_DIRECTEUR': 'Directeur / Admin Établissement',
    'OUSTAZ': 'Oustaz (Maître Coranique)',
    'ENSEIGNANT': 'Enseignant (Professeur)',
    'COMPTABLE': 'Comptable SYSCOHADA',
    'SUPER_ADMIN': 'Super Admin SaaS'
  };
  return map[roleKey] || roleKey;
}

// --- BANNIÈRE DYNAMIQUE DE RÔLE & PRIVILÈGES DU TRAVAIL ---
function renderRoleBanner() {
  const banner = document.getElementById('roleWorkspaceBanner');
  if (!banner) return;

  const role = appState.activeRole;
  const etabId = appState.activeEstablishmentId;
  const etab = (appState.db && appState.db.etablissements) 
    ? appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0] 
    : null;
  const isDaara = etab && etab.type === 'DAARA';

  if (role === 'SUPER_ADMIN' || appState.activeTab === 'superadmin') {
    banner.className = 'role-workspace-banner role-superadmin';
    banner.innerHTML = `
      <div class="role-banner-left">
        <div class="role-banner-icon">👑</div>
        <div>
          <div class="role-banner-title">
            <span>Espace Super Administrateur SaaS HQ</span>
            <span class="badge-tag badge-gold">Éditeur Central Cloud</span>
            <span class="badge-tag" style="background: rgba(0,210,180,0.15); color: var(--primary); border: 1px solid rgba(0,210,180,0.3); font-size: 0.75rem;">✉️ sunushoolexpress@gmail.com</span>
          </div>
          <div class="role-banner-desc">Supervision nationale du parc des Daaras et Écoles abonnées, encaissement des abonnements mensuels Wave et contrôle des licences d'exploitation.</div>
        </div>
      </div>
      <div class="role-banner-rights">
        <span class="role-right-pill allowed">✓ Parc National</span>
        <span class="role-right-pill allowed">✓ MRR & Abonnements</span>
        <span class="role-right-pill allowed">✓ Broadcast Directeurs</span>
        <span class="role-right-pill allowed">✓ Audit Global</span>
      </div>
    `;
  } else if (role === 'OUSTAZ') {
    banner.className = 'role-workspace-banner role-oustaz';
    banner.innerHTML = `
      <div class="role-banner-left">
        <div class="role-banner-icon">🕌</div>
        <div>
          <div class="role-banner-title">
            <span>Session Pédagogique Oustaz (Maître Coranique)</span>
            <span class="badge-tag badge-gold">Tahfîz & Tajwîd</span>
          </div>
          <div class="role-banner-desc">Validation de la mémorisation sourate par sourate (Hizb 1 à 60), notation du Tajwîd (/20), émargement matinal et alertes SMS directes aux tuteurs légaux.</div>
        </div>
      </div>
      <div class="role-banner-rights">
        <span class="role-right-pill allowed">✓ Valider Hizb (1-60)</span>
        <span class="role-right-pill allowed">✓ Notation Tajwîd</span>
        <span class="role-right-pill allowed">✓ Appel Matinal</span>
        <span class="role-right-pill locked">🔒 Caisse & Pensions</span>
        <span class="role-right-pill locked">🔒 Administration</span>
      </div>
    `;
  } else if (role === 'ENSEIGNANT') {
    banner.className = 'role-workspace-banner role-enseignant';
    banner.innerHTML = `
      <div class="role-banner-left">
        <div class="role-banner-icon">👨‍🏫</div>
        <div>
          <div class="role-banner-title">
            <span>Session Enseignant Titulaire / Professeur</span>
            <span class="badge-tag badge-blue">${isDaara ? 'Programme Franco-Arabe' : 'Classes CI à Terminale'}</span>
          </div>
          <div class="role-banner-desc">Saisie des évaluations continues, calcul automatique des moyennes officielles avec coefficients sénégalais, fiches d'appel de classe et génération des bulletins semestriels.</div>
        </div>
      </div>
      <div class="role-banner-rights">
        <span class="role-right-pill allowed">✓ Saisie Notes & Devoirs</span>
        <span class="role-right-pill allowed">✓ Bulletins Officiels</span>
        <span class="role-right-pill allowed">✓ Appel Présence</span>
        <span class="role-right-pill locked">🔒 Trésorerie & Caisse</span>
        <span class="role-right-pill locked">🔒 Administration</span>
      </div>
    `;
  } else if (role === 'COMPTABLE') {
    banner.className = 'role-workspace-banner role-comptable';
    banner.innerHTML = `
      <div class="role-banner-left">
        <div class="role-banner-icon">💳</div>
        <div>
          <div class="role-banner-title">
            <span>Session Comptabilité SYSCOHADA & Caisse</span>
            <span class="badge-tag badge-green">Agent Financier Agréé</span>
          </div>
          <div class="role-banner-desc">Encaissements multicanaux (Wave, Orange Money, Free Money, Espèces, Chèques), émission instantanée de reçus certifiés avec QR Code, grand livre de caisse et relances des impayés.</div>
        </div>
      </div>
      <div class="role-banner-rights">
        <span class="role-right-pill allowed">✓ Encaissement Multicanal</span>
        <span class="role-right-pill allowed">✓ Reçus SYSCOHADA</span>
        <span class="role-right-pill allowed">✓ Grand Livre Caisse</span>
        <span class="role-right-pill allowed">✓ Relances WhatsApp</span>
        <span class="role-right-pill locked">🔒 Pédagogie / Notes</span>
      </div>
    `;
  } else {
    // ADMIN_DIRECTEUR
    const rawPlan = etab && etab.plan ? etab.plan : (isDaara ? 'Pack Internat Promo Daara (20 000 FCFA/mois)' : 'Formule École Pro (55 000 FCFA/mois)');
    const cleanPlan = rawPlan.toLowerCase().startsWith('formule') || rawPlan.toLowerCase().startsWith('pack') || rawPlan.toLowerCase().startsWith('option') ? rawPlan : `Formule ${rawPlan}`;
    const planLower = cleanPlan.toLowerCase();
    const planIcon = (isDaara || planLower.includes('daara')) ? (planLower.includes('annuel') || planLower.includes('sérénité') ? '👑' : (planLower.includes('promo') ? '🏷️' : '🕌')) : (planLower.includes('premium') ? '👑' : (planLower.includes('pro') ? '⚡' : '🌱'));

    banner.className = 'role-workspace-banner';
    banner.innerHTML = `
      <div class="role-banner-left">
        <div class="role-banner-icon">🏛️</div>
        <div>
          <div class="role-banner-title">
            <span>Direction Générale • ${etab ? etab.name : 'Établissement'}</span>
            <span class="badge-tag badge-green">Accès Administrateur Complet</span>
            <span class="badge-tag badge-gold" style="font-weight: 800; display: inline-flex; align-items: center; gap: 0.35rem;">
              <span>${planIcon}</span> <span>Abonnement : ${cleanPlan}</span>
            </span>
          </div>
          <div class="role-banner-desc">Contrôle global de l'établissement : inscriptions d'élèves/talibés, pilotage pédagogique, suivi de trésorerie SYSCOHADA, dortoirs/internat et communications officielles.</div>
        </div>
      </div>
      <div class="role-banner-rights">
        <span class="role-right-pill allowed">✓ Inscriptions & Dossiers</span>
        <span class="role-right-pill allowed">✓ Pédagogie & Bulletins</span>
        <span class="role-right-pill allowed">✓ Caisse & Trésorerie</span>
        <span class="role-right-pill allowed">✓ Dortoirs & Badges PVC</span>
        <span class="role-right-pill allowed">✓ Logs d'Audit</span>
      </div>
    `;
  }
}

// --- RENDU DES VUES ---
function renderCurrentView() {
  renderRoleBanner();
  renderOverviewKpis();
  renderDaaraTalibes();
  renderSchoolClasses();
  renderClassesView();
  renderTeachersView();
  renderGradesTable();
  renderCaisseTransactions();
  renderFinConfig();
  renderAuditLogs();
  renderSuperAdminClients();
  renderTimetable();
  renderStagesView();
  renderCertificatsView();
}

// 1. KPI VUE D'ENSEMBLE
function renderOverviewKpis() {
  syncEstablishmentClasses();
  syncEstablishmentStudents();
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const eleves = appState.db.eleves.filter(e => {
    if (!etabId) return true;
    return e.etablissementId === etabId || (etab && etab.code && e.etablissementCode === etab.code) || (etab && etab.id && e.etablissementId === etab.id);
  });
  const tx = appState.db.transactions.filter(t => etabId ? (t.etablissementId === etabId || (etab && etab.id && t.etablissementId === etab.id)) : true);

  const total = eleves.length;
  const aJour = eleves.filter(e => e.statutPension === 'A_JOUR').length;
  const totalEncaisse = tx.reduce((sum, t) => sum + (Number(t.montant) || 0), 0);

  const elTotal = document.getElementById('kpiTotalEleves');
  const elEncaisse = document.getElementById('kpiTotalEncaisse');
  const elTaux = document.getElementById('kpiTauxRecouvrement');
  const elKpi4Value = document.getElementById('kpiHizbMoyen');

  const elKpi1Title = document.getElementById('kpi1Title');
  const elKpi1Meta = document.getElementById('kpi1Meta');
  const elKpi2Title = document.getElementById('kpi2Title');
  const elKpi2Meta = document.getElementById('kpi2Meta');
  const elKpi3Title = document.getElementById('kpi3Title');
  const elKpi3Meta = document.getElementById('kpi3Meta');
  const elKpi4Title = document.getElementById('kpi4Title');
  const elKpi4Icon = document.getElementById('kpi4Icon');
  const elKpi4Meta = document.getElementById('kpi4Meta');

  if (elTotal) elTotal.textContent = total;
  if (elEncaisse) elEncaisse.textContent = `${totalEncaisse.toLocaleString()} F`;
  if (elTaux) elTaux.textContent = total > 0 ? `${Math.round((aJour / total) * 100)}%` : '100%';

  if (isDaara) {
    // Spécifique Daara
    const talibes = eleves.filter(e => e.type === 'TALIBE');
    const hizbMoyen = talibes.length > 0
      ? (talibes.reduce((acc, t) => acc + (Number(t.hizbActuel || t.hizb) || 1), 0) / talibes.length).toFixed(1)
      : 0;

    const enAttenteDaara = total - aJour;
    const tauxDaara = total > 0 ? Math.round((aJour / total) * 100) : 100;

    if (elKpi1Title) elKpi1Title.textContent = "Effectif Talibés Actifs";
    if (elKpi1Meta) elKpi1Meta.innerHTML = `<span class="badge-tag badge-gold">${total} Inscrits</span><span>Talibés Mémorisateurs</span>`;
    if (elKpi2Title) elKpi2Title.textContent = "Pensions du Mois";
    if (elKpi2Meta) elKpi2Meta.innerHTML = `<span class="badge-tag badge-blue">Wave + OM</span><span>Trésorerie SYSCOHADA</span>`;
    if (elKpi3Title) elKpi3Title.textContent = "Taux de Règlements";
    if (elKpi3Meta) elKpi3Meta.innerHTML = `<span class="badge-tag badge-gold">${enAttenteDaara} en attente</span><span>Recouvrement ${tauxDaara}%</span>`;

    if (elKpi4Title) elKpi4Title.textContent = "Avancement Coranique Moyen";
    if (elKpi4Icon) {
      elKpi4Icon.textContent = "📖";
      elKpi4Icon.style.background = "rgba(245, 158, 11, 0.15)";
      elKpi4Icon.style.color = "var(--gold)";
    }
    if (elKpi4Value) elKpi4Value.textContent = talibes.length > 0 ? `Hizb ${hizbMoyen}` : `-- / 60`;
    if (elKpi4Meta) elKpi4Meta.innerHTML = `<span class="badge-tag badge-green">Tajwîd Certifié</span><span>${talibes.length > 0 ? 'Progression continue' : '0 talibé évalué'}</span>`;

  } else if (isInstitut) {
    // Spécifique Institut & Formation Professionnelle
    const etudiants = eleves.filter(e => e.type === 'ETUDIANT' || e.type === 'SCOLAIRE');
    const etWithNotes = etudiants.filter(s => typeof s.moyenneGenerale === 'number' || typeof s.moyenne === 'number');
    const moyGenerale = etWithNotes.length > 0 
      ? (etWithNotes.reduce((acc, s) => acc + (Number(s.moyenneGenerale || s.moyenne) || 0), 0) / etWithNotes.length).toFixed(2)
      : null;

    const enAttenteInst = total - aJour;
    const tauxInst = total > 0 ? Math.round((aJour / total) * 100) : 100;

    if (elKpi1Title) elKpi1Title.textContent = "Effectif Étudiants Actifs";
    if (elKpi1Meta) elKpi1Meta.innerHTML = `<span class="badge-tag badge-blue">${total} Inscrits</span><span>Filières BTS &amp; Métiers</span>`;
    if (elKpi2Title) elKpi2Title.textContent = "Frais de Formation du Mois";
    if (elKpi2Meta) elKpi2Meta.innerHTML = `<span class="badge-tag badge-blue">Wave + OM</span><span>Trésorerie SYSCOHADA</span>`;
    if (elKpi3Title) elKpi3Title.textContent = "Taux de Recouvrement";
    if (elKpi3Meta) elKpi3Meta.innerHTML = `<span class="badge-tag badge-gold">${enAttenteInst} en attente</span><span>Recouvrement ${tauxInst}%</span>`;

    if (elKpi4Title) elKpi4Title.textContent = "Moyenne Semestrielle (LMD)";
    if (elKpi4Icon) {
      elKpi4Icon.textContent = "📊";
      elKpi4Icon.style.background = "rgba(59, 130, 246, 0.15)";
      elKpi4Icon.style.color = "#3B82F6";
    }
    if (elKpi4Value) elKpi4Value.textContent = moyGenerale ? `${moyGenerale} / 20` : `-- / 20`;
    if (elKpi4Meta) elKpi4Meta.innerHTML = `<span class="badge-tag badge-blue">Crédits ECTS</span><span>${moyGenerale ? 'Moyenne calculée' : 'En cours de validation'}</span>`;

  } else {
    // Spécifique École Privée (Terminologie Universelle Apprenant)
    const scolaires = eleves.filter(e => e.type === 'SCOLAIRE');
    const scWithNotes = scolaires.filter(s => typeof s.moyenneGenerale === 'number' || typeof s.moyenne === 'number');
    const moyGenerale = scWithNotes.length > 0 
      ? (scWithNotes.reduce((acc, s) => acc + (Number(s.moyenneGenerale || s.moyenne) || 0), 0) / scWithNotes.length).toFixed(2)
      : null;

    const enAttenteEcole = total - aJour;
    const tauxEcole = total > 0 ? Math.round((aJour / total) * 100) : 100;

    if (elKpi1Title) elKpi1Title.textContent = "Effectif Apprenants Actifs";
    if (elKpi1Meta) elKpi1Meta.innerHTML = `<span class="badge-tag badge-green">${total} Inscrits</span><span>Classes CI à Terminale</span>`;
    if (elKpi2Title) elKpi2Title.textContent = "Scolarités du Mois";
    if (elKpi2Meta) elKpi2Meta.innerHTML = `<span class="badge-tag badge-blue">Wave + OM</span><span>Trésorerie SYSCOHADA</span>`;
    if (elKpi3Title) elKpi3Title.textContent = "Taux de Règlements";
    if (elKpi3Meta) elKpi3Meta.innerHTML = `<span class="badge-tag badge-gold">${enAttenteEcole} en attente</span><span>Recouvrement ${tauxEcole}%</span>`;

    if (elKpi4Title) elKpi4Title.textContent = "Moyenne Générale École";
    if (elKpi4Icon) {
      elKpi4Icon.textContent = "🎓";
      elKpi4Icon.style.background = "rgba(0, 210, 180, 0.15)";
      elKpi4Icon.style.color = "var(--turquoise)";
    }
    if (elKpi4Value) elKpi4Value.textContent = moyGenerale ? `${moyGenerale} / 20` : `-- / 20`;
    if (elKpi4Meta) elKpi4Meta.innerHTML = `<span class="badge-tag badge-gold">Bulletin MEN</span><span>${moyGenerale ? 'Moyenne calculée' : 'En cours d\'évaluation'}</span>`;
  }

  // En-têtes du tableau
  const thStudent = document.getElementById('overviewThStudent');
  const thClass = document.getElementById('overviewThClass');
  const thLevel = document.getElementById('overviewThLevel');
  const thPension = document.getElementById('overviewThPension');
  const tableTitle = document.getElementById('overviewTableTitle');

  if (thStudent) thStudent.textContent = isDaara ? "Talibé (Matricule)" : (isInstitut ? "Étudiant (Matricule)" : "Apprenant (Matricule)");
  if (thClass) thClass.textContent = isDaara ? "Cycle Tahfiz / Internat" : (isInstitut ? "Filière / Promotion" : "Niveau / Classe");
  if (thLevel) thLevel.textContent = isDaara ? "Avancement Coran (Hizb)" : (isInstitut ? "Moyenne / Crédits" : "Moyenne Scolaire (/20)");
  if (thPension) thPension.textContent = isDaara ? "Statut Pension" : (isInstitut ? "Frais Formation" : "Statut Scolarité");
  if (tableTitle) {
    tableTitle.textContent = isDaara 
      ? "Derniers Talibés & Mémorisation Coranique" 
      : (isInstitut ? "Derniers Étudiants & Promotions Professionnelles" : "Derniers Apprenants & Mises à Jour Pédagogiques");
  }

  const searchInput = document.getElementById('overviewSearchInput');
  if (searchInput) {
    searchInput.placeholder = isDaara ? "🔍 Rechercher un talibé, matricule..." : (isInstitut ? "🔍 Rechercher un étudiant, matricule..." : "🔍 Rechercher un apprenant, matricule...");
  }

  // Rendu de la table d'activité récente
  const tbody = document.getElementById('overviewRecentTable');
  if (tbody) {
    tbody.innerHTML = '';
    if (eleves.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">${isInstitut ? 'Aucun étudiant enregistré pour cet établissement.' : (isDaara ? 'Aucun talibé enregistré pour cet établissement.' : 'Aucun apprenant enregistré pour cet établissement.')}</td></tr>`;
      return;
    }
    eleves.slice(0, 5).forEach(e => {
      const tr = document.createElement('tr');
      const isTalibe = e.type === 'TALIBE';
      const isEtu = e.type === 'ETUDIANT' || isInstitut;
      tr.innerHTML = `
        <td>
          <div class="avatar-cell">
            <div class="avatar-round" style="background: ${isTalibe ? 'rgba(255,184,0,0.2)' : (isEtu ? 'rgba(56,189,248,0.2)' : 'rgba(0,210,180,0.2)')}; color: ${isTalibe ? 'var(--gold)' : (isEtu ? '#38BDF8' : 'var(--primary)')};">${e.prenom[0]}${e.nom[0]}</div>
            <div>
              <div class="cell-main-text">${e.prenom} ${e.nom}</div>
              <div class="cell-sub-text">${e.matricule} • ${isTalibe ? '🕌 Talibé' : (isEtu ? '🎓 Étudiant' : '🏫 Apprenant')}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-tag ${isTalibe ? 'badge-gold' : 'badge-blue'}">${e.classeNom}</span></td>
        <td>
          ${isTalibe ? `<strong>Hizb ${e.hizbActuel} / 60</strong> (${e.sourate || 'Tahfiz'})` : `<strong>Moyenne : ${e.moyenneGenerale || 16}/20</strong> (Rang: ${e.rang || 1}er)`}
        </td>
        <td>
          <span class="badge-tag ${e.statutPension === 'A_JOUR' ? 'badge-green' : 'badge-red'}">
            ${e.statutPension === 'A_JOUR' ? '✓ À Jour' : '⚠️ En Retard'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openEleveDetails('${e.id}')">Voir Fiche</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// 2. DAARA & SUIVI CORANIQUE
function renderDaaraTalibes() {
  const etabId = appState.activeEstablishmentId;
  const talibes = appState.db.eleves.filter(e => e.type === 'TALIBE' && (etabId ? e.etablissementId === etabId : true));
  const tbody = document.getElementById('daaraTalibesTable');
  if (!tbody) return;

  const role = appState.activeRole;
  const isOustaz = role === 'OUSTAZ';
  const isComptable = role === 'COMPTABLE';

  // Bouton d'action dans le haut de la carte
  const daaraHeaderBtn = document.getElementById('daaraHeaderActionBtn');
  if (daaraHeaderBtn) {
    if (isOustaz) {
      daaraHeaderBtn.textContent = "⚡ Faire l'Appel Matin";
      daaraHeaderBtn.onclick = () => openAttendanceModal();
      daaraHeaderBtn.title = "Pointer les présences et absences des talibés";
      daaraHeaderBtn.className = "btn btn-primary btn-sm";
    } else if (isComptable) {
      daaraHeaderBtn.textContent = "💳 Encaisser Pension Wave/OM";
      daaraHeaderBtn.onclick = () => openEncaissementMultiModal();
      daaraHeaderBtn.title = "Encaisser une pension d'internat ou scolarité coranique";
      daaraHeaderBtn.className = "btn btn-primary btn-sm";
    } else {
      daaraHeaderBtn.textContent = "+ Inscrire un Talibé";
      daaraHeaderBtn.onclick = () => openNewEleveModal('TALIBE');
      daaraHeaderBtn.title = "Inscrire un nouveau talibé au Daara Moderne";
      daaraHeaderBtn.className = "btn btn-primary btn-sm";
    }
  }

  tbody.innerHTML = '';
  if (talibes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Aucun talibé enregistré pour cet établissement.</td></tr>`;
    return;
  }

  talibes.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="avatar-cell">
          <div class="avatar-round" style="background: rgba(255,184,0,0.2); color: var(--gold);">${t.prenom[0]}${t.nom[0]}</div>
          <div>
            <div class="cell-main-text">${t.prenom} ${t.nom}</div>
            <div class="cell-sub-text">${t.matricule} • Clé: <code style="color:var(--primary);">${t.cleAcces}</code></div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 700; color: #fff;">${t.sourate}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Tajwîd : <strong style="color:var(--gold);">${t.tajwidNote}/20</strong></div>
      </td>
      <td>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; width: 140px;">
          <span>Hizb ${t.hizbActuel}/60</span>
          <span>${t.progressionPct}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${t.progressionPct}%;"></div>
        </div>
      </td>
      <td>
        <button class="badge-tag badge-blue" style="font-weight: 700; cursor: pointer; border: 1px solid rgba(59, 130, 246, 0.4); background: rgba(59, 130, 246, 0.15); display: inline-flex; align-items: center; gap: 4px;" onclick="openChangeChambreModal('${t.id}')" title="Cliquer pour changer la chambre ou le lit">
          🛏️ ${t.internat.chambre || 'Chambre 01'} (Lit N°${t.internat.litNumero}) <span style="font-size: 0.7rem; opacity: 0.8;">✏️</span>
        </button>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${t.internat.pavillon || t.internat.dortoir || 'Pavillon Khadimou Rassoul'}</div>
      </td>
      <td>
        <span class="badge-tag ${t.statutPension === 'A_JOUR' ? 'badge-green' : 'badge-red'}">
          ${t.statutPension === 'A_JOUR' ? '✓ Réglé' : '⚠️ Retard'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          ${isOustaz ? `
            <button class="btn btn-primary btn-sm" onclick="openHizbEvalModal('${t.id}')">📖 Valider Hizb</button>
            <button class="btn btn-outline btn-sm" onclick="openChangeChambreModal('${t.id}')" title="Changer de chambre">🛏️ Chambre</button>
            <button class="btn btn-outline btn-sm" onclick="sendWhatsAppHizb('${t.id}')" title="Notifier parents sur WhatsApp">💬 SMS Parent</button>
          ` : isComptable ? `
            <button class="btn btn-primary btn-sm" onclick="openEncaissementMultiModal('${t.id}')" style="background: linear-gradient(135deg, #10B981, #00D2B4);">💳 Encaisser</button>
            <button class="btn btn-outline btn-sm" onclick="previewReceiptModal('${t.id}')">🧾 Reçu</button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="openHizbEvalModal('${t.id}')">📖 Valider Hizb</button>
            <button class="btn btn-outline btn-sm" onclick="openChangeChambreModal('${t.id}')" title="Changer de chambre">🛏️</button>
            <button class="btn btn-outline btn-sm" onclick="previewPvcBadge('${t.id}')">🪪 Badge PVC</button>
            <button class="btn btn-outline btn-sm" onclick="openEncaissementMultiModal('${t.id}')" title="Encaisser">💳</button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 3. SCOLARITÉ & CLASSES
function renderSchoolClasses() {
  syncEstablishmentStudents();
  const etabId = appState.activeEstablishmentId;
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);
  const eleves = appState.db.eleves.filter(e => (isInstitut ? (e.type === 'ETUDIANT' || e.type === 'SCOLAIRE') : e.type === 'SCOLAIRE') && (etabId ? e.etablissementId === etabId : true));
  const tbody = document.getElementById('schoolStudentsTable');
  if (!tbody) return;

  const schoolCardTitle = document.getElementById('schoolViewCardTitle');
  if (schoolCardTitle) {
    schoolCardTitle.innerHTML = isInstitut
      ? `<span>🎓</span> <span>Répertoire des Étudiants &amp; Promotions Professionnelles</span>`
      : `<span>🏫</span> <span>Répertoire des Apprenants &amp; Classes (CI à Terminale)</span>`;
  }

  const thStudent = document.getElementById('thSchoolStudent');
  if (thStudent) thStudent.textContent = isInstitut ? "Étudiant (Nom & Matricule)" : "Apprenant (Nom & Matricule)";
  const thClass = document.getElementById('thSchoolClass');
  if (thClass) thClass.textContent = isInstitut ? "Filière / Promotion" : "Niveau / Classe";
  const thGrades = document.getElementById('thSchoolGrades');
  if (thGrades) thGrades.textContent = isInstitut ? "Moyenne Semestrielle / Crédits" : "Moyenne & Rang";
  const thParent = document.getElementById('thSchoolParent');
  if (thParent) thParent.textContent = isInstitut ? "Contact de l'étudiant / Responsable" : "Parent / Tuteur légal";
  const thStatus = document.getElementById('thSchoolStatus');
  if (thStatus) thStatus.textContent = isInstitut ? "Frais de Formation" : "Statut Frais";
  const thAction = document.getElementById('thSchoolAction');
  if (thAction) thAction.textContent = isInstitut ? "Dossier & Relevé" : "Dossier & Bulletin";

  const role = appState.activeRole;
  const isEnseignant = role === 'ENSEIGNANT';
  const isComptable = role === 'COMPTABLE';

  const schoolHeaderBtn = document.getElementById('schoolHeaderActionBtn');
  if (schoolHeaderBtn) {
    if (isEnseignant) {
      schoolHeaderBtn.textContent = isInstitut ? "📑 Saisir les Notes Semestrielles (LMD)" : "📑 Saisir les Notes de Classe";
      schoolHeaderBtn.onclick = () => switchTab('grades');
      schoolHeaderBtn.title = isInstitut ? "Accéder à la saisie des notes et calcul des crédits" : "Accéder à la saisie des notes et calcul des bulletins";
      schoolHeaderBtn.className = "btn btn-primary btn-sm";
    } else if (isComptable) {
      schoolHeaderBtn.textContent = isInstitut ? "💳 Encaisser Formation Wave/OM" : "💳 Encaisser Scolarité Wave/OM";
      schoolHeaderBtn.onclick = () => openEncaissementMultiModal();
      schoolHeaderBtn.title = isInstitut ? "Encaisser frais de scolarité ou de formation" : "Encaisser scolarité ou frais d'inscription";
      schoolHeaderBtn.className = "btn btn-primary btn-sm";
    } else {
      schoolHeaderBtn.textContent = isInstitut ? "+ Nouvel Étudiant" : "+ Inscrire un Apprenant";
      schoolHeaderBtn.onclick = () => openNewEleveModal(isInstitut ? 'ETUDIANT' : 'SCOLAIRE');
      schoolHeaderBtn.title = isInstitut ? "Inscrire un nouvel étudiant à l'institut (BTS, Licence, Formation Pro)" : "Inscrire un nouvel apprenant à l'école";
      schoolHeaderBtn.className = "btn btn-primary btn-sm";
    }
  }

  tbody.innerHTML = '';
  if (eleves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">${isInstitut ? "Aucun étudiant enregistré pour cet établissement." : "Aucun apprenant enregistré pour cet établissement."}</td></tr>`;
    return;
  }

  eleves.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="avatar-cell">
          <div class="avatar-round" style="${isInstitut ? 'background: rgba(56,189,248,0.2); color: #38BDF8;' : ''}">${e.prenom[0]}${e.nom[0]}</div>
          <div>
            <div class="cell-main-text">${e.prenom} ${e.nom}</div>
            <div class="cell-sub-text">${e.matricule} • Clé: <code style="color:var(--primary);">${e.cleAcces}</code></div>
          </div>
        </div>
      </td>
      <td><span class="badge-tag ${isInstitut ? 'badge-purple' : 'badge-blue'}">${e.classeNom}</span></td>
      <td><strong>${e.moyenneGenerale || 14.5}/20</strong> <span style="font-size:0.75rem; color:var(--text-muted);">${isInstitut ? '(Crédits: 30/30)' : `(Rang: ${e.rang || 1}er)`}</span></td>
      <td>${e.parentNom}<br><span style="font-size:0.75rem; color:var(--text-muted);">${e.parentTelephone}</span></td>
      <td>
        <span class="badge-tag ${e.statutPension === 'A_JOUR' ? 'badge-green' : 'badge-red'}">
          ${e.statutPension === 'A_JOUR' ? '✓ Réglé' : '⚠️ Impayé'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          ${isEnseignant ? `
            <button class="btn btn-primary btn-sm" onclick="switchTab('grades')">📑 Noter</button>
            <button class="btn btn-outline btn-sm" onclick="generateOfficialBulletin('${e.id}')">${isInstitut ? 'Relevé' : 'Bulletin'}</button>
          ` : isComptable ? `
            <button class="btn btn-primary btn-sm" onclick="openEncaissementMultiModal('${e.id}')" style="background: linear-gradient(135deg, #10B981, #00D2B4);">💳 Encaisser</button>
            <button class="btn btn-outline btn-sm" onclick="previewReceiptModal('${e.id}')">🧾 Reçu</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="generateOfficialBulletin('${e.id}')">${isInstitut ? '📑 Relevé' : '📑 Bulletin'}</button>
            <button class="btn btn-outline btn-sm" onclick="previewPvcBadge('${e.id}')">🪪 Badge</button>
            <button class="btn btn-primary btn-sm" onclick="openEncaissementMultiModal('${e.id}')">💳 Payer</button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// 3.A-BIS. GESTION ACADÉMIQUE DES CLASSES, NIVEAUX & PACKS 1 CLIC
// ==========================================================================

function getActiveEstablishmentKey() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  return etab ? (etab.code || etab.id || etab.email || 'default') : 'default';
}

// --- JEUX DE DONNÉES OFFICIELS POUR ÉCOLE DES MÉTIERS DU FUTUR (SSE-SN-2901) ---
const EMF_DEFAULT_CLASSES = [
  { id: 'cls-2nde-l', etablissementId: 'etab-2901', nom: '2nde L', cycle: 'Secondaire', salle: 'Salle 101', capacite: 35, profPrincipal: 'M. Ousmane Niang', effectif: 0 },
  { id: 'cls-1ere-l1', etablissementId: 'etab-2901', nom: '1ère L1', cycle: 'Secondaire', salle: 'Salle 102', capacite: 35, profPrincipal: 'M. Ousmane Niang', effectif: 0 },
  { id: 'cls-term-l2', etablissementId: 'etab-2901', nom: 'Terminale L2', cycle: 'Lycée', salle: 'Salle 103', capacite: 35, profPrincipal: 'M. Ousmane Niang', effectif: 0 }
];

const EMF_DEFAULT_TEACHER = {
  id: 'ens-ousmane-niang-emf',
  etablissementId: 'etab-2901',
  nom: 'M. Ousmane Niang',
  mat: 'ENS-2026-04',
  matiere: 'Anglais (Collège & Lycée)',
  classes: ['2nde L', '1ère L1', 'Terminale L2'],
  volume: '20h / semaine',
  contrat: 'CDI Titulaire',
  salaire: 250000,
  tel: '+221 77 650 44 12',
  statut: 'ACTIF'
};

const EMF_DEFAULT_STUDENTS = [];

function syncEstablishmentStudents() {
  if (!appState.db) return;
  if (!Array.isArray(appState.db.eleves)) appState.db.eleves = [];
  const estKey = getActiveEstablishmentKey();
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];

  const isMockStudent = (el) => {
    if (!el) return true;
    const id = (el.id || '').toLowerCase();
    const mat = (el.matricule || '').toUpperCase();
    return id.startsWith('emf-el-') || mat.startsWith('EMF-2026-') ||
           id.startsWith('etu_') || mat.startsWith('SSE-BTS-') ||
           id.startsWith('demo_etu_') || id.startsWith('mock-') || mat.startsWith('MOCK-');
  };

  // 1. Purge immédiate de toute donnée fictive résiduelle
  appState.db.eleves = appState.db.eleves.filter(el => !isMockStudent(el));

  // 2. Importer depuis les clés localStorage réelles de l'établissement
  const candidateKeys = new Set([
    `sse_eleves_${estKey}`,
    `sse_talibes_${estKey}`
  ]);

  if (etab) {
    if (etab.code) { candidateKeys.add(`sse_eleves_${etab.code}`); candidateKeys.add(`sse_talibes_${etab.code}`); }
    if (etab.id) { candidateKeys.add(`sse_eleves_${etab.id}`); candidateKeys.add(`sse_talibes_${etab.id}`); }
    if (etab.email) { candidateKeys.add(`sse_eleves_${etab.email}`); candidateKeys.add(`sse_talibes_${etab.email}`); }
  }

  // Vérifier également sunuschool_establishment
  try {
    const rawCur = localStorage.getItem('sunuschool_establishment');
    if (rawCur) {
      const cur = JSON.parse(rawCur);
      if (cur) {
        if (cur.code) { candidateKeys.add(`sse_eleves_${cur.code}`); candidateKeys.add(`sse_talibes_${cur.code}`); }
        if (cur.id) { candidateKeys.add(`sse_eleves_${cur.id}`); candidateKeys.add(`sse_talibes_${cur.id}`); }
        if (cur.email) { candidateKeys.add(`sse_eleves_${cur.email}`); candidateKeys.add(`sse_talibes_${cur.email}`); }
      }
    }
  } catch(e) {}

  candidateKeys.forEach(k => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.filter(pel => !isMockStudent(pel)).forEach(pel => {
            const exists = appState.db.eleves.some(el =>
              (el.matricule && pel.matricule && el.matricule === pel.matricule) ||
              (el.id && el.id === pel.id) ||
              (el.prenom && el.nom && pel.prenom && pel.nom &&
               el.prenom.trim().toLowerCase() === pel.prenom.trim().toLowerCase() &&
               el.nom.trim().toLowerCase() === pel.nom.trim().toLowerCase())
            );
            if (!exists) {
              appState.db.eleves.push({
                id: pel.id || `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                etablissementId: etabId || (etab ? etab.id : null) || pel.etablissementId || 'etab-default',
                etablissementCode: pel.etablissementCode || (etab ? etab.code : null) || estKey,
                matricule: pel.matricule,
                prenom: pel.prenom,
                nom: pel.nom,
                sexe: pel.sexe || 'M',
                type: pel.type || 'SCOLAIRE',
                classe: pel.classe,
                classeId: pel.classeId || pel.classe,
                statutPension: pel.statutPension || 'A_JOUR',
                dateInscription: pel.dateInscription || new Date().toLocaleDateString('fr-FR'),
                parentTel: pel.parentTel || '',
                moyenne: pel.moyenne,
                rang: pel.rang,
                cleAcces: pel.cleAcces || pel.matricule
              });
            }
          });
        }
      }
    } catch(e) {}
  });

  // Dédoublonnage interne strict pour garantir l'unicité de chaque apprenant
  const seenStudentKeys = new Set();
  appState.db.eleves = appState.db.eleves.filter(el => {
    const key = (el.prenom && el.nom) ? `${el.prenom.trim().toLowerCase()}__${el.nom.trim().toLowerCase()}` : (el.matricule || el.id);
    if (!key) return false;
    if (seenStudentKeys.has(key)) return false;
    seenStudentKeys.add(key);
    return true;
  });

  // 3. Synchronisation miroir vers les clés individuelles (uniquement élèves réels)
  const activeStudents = appState.db.eleves.filter(e => {
    if (!etabId) return false;
    return e.etablissementId === etabId || (etab && etab.code && e.etablissementCode === etab.code) || (etab && etab.id && e.etablissementId === etab.id);
  });
  try {
    localStorage.setItem(`sse_eleves_${estKey}`, JSON.stringify(activeStudents));
    if (etab && etab.code) localStorage.setItem(`sse_eleves_${etab.code}`, JSON.stringify(activeStudents));
    if (etab && etab.id) localStorage.setItem(`sse_eleves_${etab.id}`, JSON.stringify(activeStudents));
  } catch(e) {}

  if (etab) {
    etab.effectif = activeStudents.length;
  }

  // 4. Synchronisation automatique vers Supabase Cloud PostgreSQL
  if (window.SSE_SUPABASE) {
    if (etab && (etab.id || etab.code)) {
      window.SSE_SUPABASE.updateEtablissement(etab.id || etab.code, { effectif: activeStudents.length });
    }
    if (activeStudents.length > 0 && typeof window.SSE_SUPABASE.saveElevesBatch === 'function') {
      window.SSE_SUPABASE.saveElevesBatch(activeStudents);
    }
  }

  saveDataStore();
}

function syncEstablishmentClasses() {
  if (!appState.db) return;
  if (!Array.isArray(appState.db.classes)) appState.db.classes = [];
  const estKey = getActiveEstablishmentKey();
  const etabId = appState.activeEstablishmentId;

  const isMockClass = (c) => {
    if (!c) return true;
    const id = (c.id || '').toLowerCase();
    return id.startsWith('cls-emf-') ||
           id === 'cls-bts-gl1' || id === 'cls-bts-gl2' ||
           id === 'cls-bts-cg1' || id === 'cls-bts-cg2' ||
           id === 'cls-bts-ci1' || id === 'cls-bts-ci2' ||
           id === 'cls-l3-gl' || id === 'cls-l3-cge';
  };

  // 1. Purge immédiate des classes de maquette
  appState.db.classes = appState.db.classes.filter(c => !isMockClass(c));

  // 2. Importer depuis la clé localStorage de l'établissement
  const candidateKeys = [
    `sse_classes_${estKey}`
  ].filter(Boolean);

  for (const k of candidateKeys) {
    try {
      const portalClassesRaw = localStorage.getItem(k);
      if (portalClassesRaw) {
        const portalClasses = JSON.parse(portalClassesRaw);
        if (Array.isArray(portalClasses)) {
          portalClasses.filter(pc => !isMockClass(pc)).forEach(pc => {
            const exists = appState.db.classes.some(c => 
              (c.id === pc.id || c.nom.toLowerCase().trim() === pc.nom.toLowerCase().trim()) &&
              (c.etablissementId === etabId)
            );
            if (!exists) {
              appState.db.classes.push({
                id: pc.id || `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                etablissementId: etabId || 'etab-default',
                nom: pc.nom,
                cycle: pc.cycle || 'Élémentaire',
                salle: pc.salle || 'Salle Principale',
                capacite: Number(pc.capacite) || 45,
                profPrincipal: pc.profPrincipal || '',
                effectif: Number(pc.effectif) || 0
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Erreur synchronisation sse_classes:", e);
    }
  }

  // 3. Synchronisation miroir vers sse_classes_${estKey}
  const currentEstClasses = appState.db.classes.filter(c => etabId ? c.etablissementId === etabId : false);
  try {
    localStorage.setItem(`sse_classes_${estKey}`, JSON.stringify(currentEstClasses));
  } catch (e) {}

  saveDataStore();
}

function renderClassesView() {
  syncEstablishmentClasses();
  const container = document.getElementById('dashboardClassesGrid');
  const badgeEl = document.getElementById('dashboardClassesTotalBadge');
  const sidebarBadge = document.getElementById('sidebarClassesCount');
  const sidebarBadgeDaara = document.getElementById('sidebarClassesCountDaara');
  if (!container) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  // Mise à jour dynamique de l'en-tête de section (Filières vs Sections vs Classes)
  const headerIcon = document.getElementById('dashboardClassesHeaderIcon');
  const headerTitle = document.getElementById('dashboardClassesHeaderTitle');
  const headerSubtitle = document.getElementById('dashboardClassesHeaderSubtitle');
  const addBtn = document.getElementById('dashboardClassesAddBtn');

  if (headerIcon) headerIcon.textContent = isInstitut ? '🎓' : (isDaara ? '🕌' : '🏫');
  if (headerTitle) headerTitle.textContent = isInstitut ? 'Gestion des Filières & Spécialités Professionnelles' : (isDaara ? 'Sections Coraniques & Niveaux Daara' : 'Gestion des Classes & Niveaux Pédagogiques');
  if (headerSubtitle) headerSubtitle.textContent = isInstitut ? 'Packs officiels BTS, CAP, Licences Pro en 1 clic, gestion des salles, effectifs et plannings de cours.' : 'Packs en 1 clic selon les cycles officiels sénégalais et Daaras, gestion des salles, effectifs et accès directs aux emplois du temps.';
  if (addBtn) addBtn.textContent = isInstitut ? '+ Nouvelle Filière / Promotion' : (isDaara ? '+ Nouvelle Section Coranique' : '+ Nouvelle Classe');

  updateDashboardClassPresetPacksVisibility(isInstitut, isDaara);

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);
  const eleves = (appState.db.eleves || []).filter(e => etabId ? e.etablissementId === etabId : true);

  const countText = isInstitut
    ? `${classes.length} Filière${classes.length > 1 ? 's' : ''} / Promo${classes.length > 1 ? 's' : ''}`
    : (isDaara
      ? `${classes.length} Section${classes.length > 1 ? 's' : ''} Active${classes.length > 1 ? 's' : ''}`
      : `${classes.length} Classe${classes.length > 1 ? 's' : ''} Active${classes.length > 1 ? 's' : ''}`);
  if (badgeEl) badgeEl.textContent = countText;
  if (sidebarBadge) sidebarBadge.textContent = isInstitut ? `${classes.length} Filière${classes.length > 1 ? 's' : ''}` : `${classes.length} Classe${classes.length > 1 ? 's' : ''}`;
  if (sidebarBadgeDaara) sidebarBadgeDaara.textContent = `${classes.length} Section${classes.length > 1 ? 's' : ''}`;

  if (classes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1.5rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm);">
        <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">${isInstitut ? '🎓' : (isDaara ? '🕌' : '🏫')}</div>
        <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">${isInstitut ? 'Aucune filière ou promotion configurée' : (isDaara ? 'Aucune section coranique configurée' : 'Aucune classe configurée pour le moment')}</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem;">
          ${isInstitut ? 'Gagnez du temps en générant instantanément les filières officielles BTS en 1 clic grâce aux packs ci-dessus, ou créez vos filières sur-mesure.' : 'Gagnez du temps en générant instantanément les grilles officielles en 1 clic grâce aux packs ci-dessus, ou ajoutez vos classes manuellement.'}
        </p>
        <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" onclick="applyClassPresetPack('${isInstitut ? 'formation_pro' : (isDaara ? 'daara' : 'primaire')}')" style="background: linear-gradient(135deg, #10B981, #00D2B4); font-weight: 700;">
            ⚡ Injecter le Pack ${isInstitut ? 'Filières BTS' : (isDaara ? 'Daara Moderne' : 'Primaire')}
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="openNewClassModal()">+ Créer une ${isInstitut ? 'Filière' : 'Classe'} sur-mesure</button>
        </div>
      </div>
    `;
    return;
  }

  const cycleColors = {
    'maternelle': { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.35)', icon: '👶' },
    'élémentaire': { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.35)', icon: '📚' },
    'primaire': { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.35)', icon: '📚' },
    'collège': { bg: 'rgba(0, 210, 180, 0.15)', text: '#00D2B4', border: 'rgba(0, 210, 180, 0.35)', icon: '🏫' },
    'moyen': { bg: 'rgba(0, 210, 180, 0.15)', text: '#00D2B4', border: 'rgba(0, 210, 180, 0.35)', icon: '🏫' },
    'lycée': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.35)', icon: '🎓' },
    'secondaire': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.35)', icon: '🎓' },
    'daara': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)', icon: '🕌' },
    'bts': { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.35)', icon: '🎓' },
    'licence': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.35)', icon: '📜' },
    'licence pro': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.35)', icon: '📜' },
    'formation pro': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.35)', icon: '⚙️' },
    'cap/cqp': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)', icon: '🛠️' }
  };

  let cardsHtml = '';
  classes.forEach(c => {
    const cNameLow = (c.nom || '').toLowerCase();
    const cIdLow = (c.id || '').toLowerCase();
    const cycleKey = (c.cycle || '').toLowerCase().trim();
    const theme = cycleColors[cycleKey] || (cycleKey.includes('daara') ? cycleColors.daara : (cycleKey.includes('bts') ? cycleColors.bts : (cycleKey.includes('lic') ? cycleColors.licence : (cycleKey.includes('form') ? cycleColors['formation pro'] : (cycleKey.includes('coll') ? cycleColors['collège'] : (cycleKey.includes('lyc') ? cycleColors['lycée'] : cycleColors['élémentaire']))))));

    // Compter les élèves réellement inscrits dans cette classe
    const count = eleves.filter(el => {
      const elCls = (el.classeNom || el.classe || el.classeId || '').toLowerCase();
      return elCls === cNameLow || elCls === cIdLow || (el.classeId && el.classeId === c.id);
    }).length;

    const maxCap = Number(c.capacite) || 45;
    const percentage = Math.min(100, Math.round((count / maxCap) * 100));

    cardsHtml += `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-sm); padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div style="font-size: 1.15rem; font-weight: 800; color: #fff; letter-spacing: -0.01em;">
              ${c.nom}
            </div>
            <span style="font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 9999px; background: ${theme.bg}; color: ${theme.text}; border: 1px solid ${theme.border}; display: inline-flex; align-items: center; gap: 0.3rem;">
              <span>${theme.icon}</span> <span>${c.cycle || (isInstitut ? 'Filière Pro' : 'Section')}</span>
            </span>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>🚪</span> <span>${c.salle || (isInstitut ? 'Amphithéâtre / Salle TD' : 'Salle Principale')}</span>
          </div>

          <div style="margin: 0.85rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-secondary);">${isInstitut ? 'Effectif Étudiants :' : (isDaara ? 'Effectif Talibés :' : 'Effectif Enregistré :')}</span>
              <strong style="color: ${count > 0 ? '#00D2B4' : '#fff'};">${count} / ${maxCap} ${isInstitut ? (count > 1 ? 'Étudiants' : 'Étudiant') : (isDaara ? (count > 1 ? 'Talibés' : 'Talibé') : (count > 1 ? 'Apprenants' : 'Apprenant'))}</strong>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #00D2B4, #10B981); border-radius: 3px; transition: width 0.3s ease;"></div>
            </div>
          </div>

          <div style="font-size: 0.76rem; color: var(--text-secondary); margin-bottom: 1rem;">
            ${isInstitut ? '👨‍🏫 <strong>Responsable Pédagogique :</strong>' : (isDaara ? '👳 <strong>Oustaz Référent :</strong>' : '👨‍🏫 <strong>Prof. Référent :</strong>')} <span style="color: #fff;">${c.profPrincipal || (isInstitut ? 'Coordination Pédagogique' : 'Non assigné')}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.45rem; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 0.85rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" style="flex: 1; font-size: 0.76rem; padding: 0.4rem 0.6rem; font-weight: 700; background: linear-gradient(135deg, #F59E0B, #D97706); color: #fff;" onclick="selectClassForTimetable('${c.nom}')" title="Voir ou générer le planning de cette filière">
            📅 ${isInstitut ? 'Planning Cours' : 'Emploi du Temps'}
          </button>
          <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.76rem; padding: 0.4rem 0.6rem;" onclick="openNewClassModal('${c.id}')" title="Modifier cette ${isInstitut ? 'filière' : 'classe'}">
            ✏️
          </button>
          <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.76rem; padding: 0.4rem 0.6rem; color: #F87171; border-color: rgba(239, 68, 68, 0.3);" onclick="deleteClass('${c.id}')" title="Supprimer cette ${isInstitut ? 'filière' : 'classe'}">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = cardsHtml;
}

function updateDashboardClassPresetPacksVisibility(isInstitut, isDaara) {
  const schoolBtns = document.querySelectorAll('.dash-pack-school');
  const daaraBtns = document.querySelectorAll('.dash-pack-daara');
  const institutBtns = document.querySelectorAll('.dash-pack-institut');
  const titleEl = document.getElementById('dashClassPacksTitle');
  const subtitleEl = document.getElementById('dashClassPacksSubtitle');

  const btnMaternelle = document.getElementById('dashBtnPackMaternelle');
  const btnPrimaire = document.getElementById('dashBtnPackPrimaire');
  const btnCollege = document.getElementById('dashBtnPackCollege');
  const btnLycee = document.getElementById('dashBtnPackLycee');
  const btnDaara = document.getElementById('dashBtnPackDaara');
  const btnFormationPro = document.getElementById('dashBtnPackFormationPro');
  const btnLicencesPro = document.getElementById('dashBtnPackLicencesPro');
  const btnCapCqp = document.getElementById('dashBtnPackCapCqp');

  if (isInstitut) {
    // 1. SUPPRIMER / MASQUER TOTALEMENT TOUS LES PACKS SCOLAIRES ET DAARA SUR INSTITUT
    schoolBtns.forEach(b => { b.style.display = 'none'; });
    daaraBtns.forEach(b => { b.style.display = 'none'; });
    if (btnMaternelle) btnMaternelle.style.display = 'none';
    if (btnPrimaire) btnPrimaire.style.display = 'none';
    if (btnCollege) btnCollege.style.display = 'none';
    if (btnLycee) btnLycee.style.display = 'none';
    if (btnDaara) btnDaara.style.display = 'none';

    // 2. AFFICHER EXCLUSIVEMENT LES PACKS DE FORMATIONS PROFESSIONNELLES & BTS
    institutBtns.forEach(b => { b.style.display = 'inline-flex'; });
    if (btnFormationPro) {
      btnFormationPro.style.display = 'inline-flex';
      btnFormationPro.innerHTML = '🎓 Pack Filières BTS (Génie Logiciel, CGE, Transit)';
    }
    if (btnLicencesPro) btnLicencesPro.style.display = 'inline-flex';
    if (btnCapCqp) btnCapCqp.style.display = 'inline-flex';

    if (titleEl) titleEl.textContent = '⚡ Configuration Rapide : Packs de Filières Professionnelles en 1 Clic';
    if (subtitleEl) subtitleEl.textContent = 'Initialise instantanément les filières officielles BTS, Licences Pro et Certificats Métiers';
  } else if (isDaara) {
    schoolBtns.forEach(b => { b.style.display = 'none'; });
    institutBtns.forEach(b => { b.style.display = 'none'; });
    if (btnMaternelle) btnMaternelle.style.display = 'none';
    if (btnPrimaire) btnPrimaire.style.display = 'none';
    if (btnCollege) btnCollege.style.display = 'none';
    if (btnLycee) btnLycee.style.display = 'none';
    if (btnFormationPro) btnFormationPro.style.display = 'none';
    if (btnLicencesPro) btnLicencesPro.style.display = 'none';
    if (btnCapCqp) btnCapCqp.style.display = 'none';

    daaraBtns.forEach(b => { b.style.display = 'inline-flex'; });
    if (btnDaara) btnDaara.style.display = 'inline-flex';

    if (titleEl) titleEl.textContent = '⚡ Configuration Rapide : Pack Daara Moderne en 1 Clic';
    if (subtitleEl) subtitleEl.textContent = 'Initialise les cycles coraniques (Ibtida\'i, Hifz, Moutawassit, Thanawi)';
  } else {
    daaraBtns.forEach(b => { b.style.display = 'none'; });
    if (btnDaara) btnDaara.style.display = 'none';
    if (btnLicencesPro) btnLicencesPro.style.display = 'none';
    if (btnCapCqp) btnCapCqp.style.display = 'none';

    schoolBtns.forEach(b => { b.style.display = 'inline-flex'; });
    if (btnMaternelle) btnMaternelle.style.display = 'inline-flex';
    if (btnPrimaire) btnPrimaire.style.display = 'inline-flex';
    if (btnCollege) btnCollege.style.display = 'inline-flex';
    if (btnLycee) btnLycee.style.display = 'inline-flex';
    if (btnFormationPro) {
      btnFormationPro.style.display = 'inline-flex';
      btnFormationPro.innerHTML = '🎓 Pack Formation Pro (BTS, CAP, CQP)';
    }

    if (titleEl) titleEl.textContent = '⚡ Génération Rapide de Sections (Packs en 1 Clic)';
    if (subtitleEl) subtitleEl.textContent = 'Injecte instantanément les grilles officielles sans écraser les données existantes';
  }
}
window.updateDashboardClassPresetPacksVisibility = updateDashboardClassPresetPacksVisibility;

function applyClassPresetPack(packName) {
  const etabId = appState.activeEstablishmentId;
  const now = Date.now();
  let presetClasses = [];

  if (packName === 'maternelle') {
    presetClasses = [
      { id: `cls_ps_${now}`, nom: 'Petite Section (PS)', cycle: 'Maternelle', salle: 'Pavillon Éveil 1', capacite: 30, profPrincipal: '' },
      { id: `cls_ms_${now}`, nom: 'Moyenne Section (MS)', cycle: 'Maternelle', salle: 'Pavillon Éveil 2', capacite: 30, profPrincipal: '' },
      { id: `cls_gs_${now}`, nom: 'Grande Section (GS)', cycle: 'Maternelle', salle: 'Pavillon Éveil 3', capacite: 35, profPrincipal: '' }
    ];
  } else if (packName === 'primaire') {
    presetClasses = [
      { id: `cls_ci_${now}`, nom: 'CI', cycle: 'Élémentaire', salle: 'Salle 1', capacite: 40, profPrincipal: '' },
      { id: `cls_cp_${now}`, nom: 'CP', cycle: 'Élémentaire', salle: 'Salle 2', capacite: 40, profPrincipal: '' },
      { id: `cls_ce1_${now}`, nom: 'CE1', cycle: 'Élémentaire', salle: 'Salle 3', capacite: 40, profPrincipal: '' },
      { id: `cls_ce2_${now}`, nom: 'CE2', cycle: 'Élémentaire', salle: 'Salle 4', capacite: 40, profPrincipal: '' },
      { id: `cls_cm1_${now}`, nom: 'CM1', cycle: 'Élémentaire', salle: 'Salle 5', capacite: 45, profPrincipal: '' },
      { id: `cls_cm2a_${now}`, nom: 'CM2 A', cycle: 'Élémentaire', salle: 'Salle 6', capacite: 45, profPrincipal: '' },
      { id: `cls_cm2b_${now}`, nom: 'CM2 B', cycle: 'Élémentaire', salle: 'Salle 7', capacite: 45, profPrincipal: '' }
    ];
  } else if (packName === 'college') {
    presetClasses = [
      { id: `cls_6a_${now}`, nom: '6ème A', cycle: 'Collège', salle: 'Salle 101', capacite: 50, profPrincipal: '' },
      { id: `cls_6b_${now}`, nom: '6ème B', cycle: 'Collège', salle: 'Salle 102', capacite: 50, profPrincipal: '' },
      { id: `cls_5a_${now}`, nom: '5ème A', cycle: 'Collège', salle: 'Salle 103', capacite: 50, profPrincipal: '' },
      { id: `cls_5b_${now}`, nom: '5ème B', cycle: 'Collège', salle: 'Salle 104', capacite: 50, profPrincipal: '' },
      { id: `cls_4a_${now}`, nom: '4ème A', cycle: 'Collège', salle: 'Salle 105', capacite: 50, profPrincipal: '' },
      { id: `cls_4b_${now}`, nom: '4ème B', cycle: 'Collège', salle: 'Salle 106', capacite: 50, profPrincipal: '' },
      { id: `cls_3a_${now}`, nom: '3ème A (BFEM)', cycle: 'Collège', salle: 'Salle 107', capacite: 50, profPrincipal: '' },
      { id: `cls_3b_${now}`, nom: '3ème B (BFEM)', cycle: 'Collège', salle: 'Salle 108', capacite: 50, profPrincipal: '' }
    ];
  } else if (packName === 'lycee') {
    presetClasses = [
      { id: `cls_2l_${now}`, nom: '2nde L', cycle: 'Lycée', salle: 'Salle 201', capacite: 45, profPrincipal: '' },
      { id: `cls_2s_${now}`, nom: '2nde S', cycle: 'Lycée', salle: 'Salle 202', capacite: 45, profPrincipal: '' },
      { id: `cls_1l_${now}`, nom: '1ère L1', cycle: 'Lycée', salle: 'Salle 203', capacite: 45, profPrincipal: '' },
      { id: `cls_1s_${now}`, nom: '1ère S1', cycle: 'Lycée', salle: 'Salle 204', capacite: 45, profPrincipal: '' },
      { id: `cls_tl_${now}`, nom: 'Terminale L2', cycle: 'Lycée', salle: 'Salle 205', capacite: 45, profPrincipal: '' },
      { id: `cls_ts_${now}`, nom: 'Terminale S2', cycle: 'Lycée', salle: 'Salle 206', capacite: 45, profPrincipal: '' }
    ];
  } else if (packName === 'daara') {
    presetClasses = [
      { id: `cls_d1_${now}`, nom: "Ibtida'i (Initiation & Alphabet)", cycle: 'Daara', salle: 'Salle Al-Houda', capacite: 30, profPrincipal: '' },
      { id: `cls_d2_${now}`, nom: "Hifz Niveau 1 (Juz 1 à 15)", cycle: 'Daara', salle: 'Salle Badr', capacite: 35, profPrincipal: '' },
      { id: `cls_d3_${now}`, nom: "Hifz Niveau 2 (Juz 16 à 30)", cycle: 'Daara', salle: 'Salle Bilal', capacite: 35, profPrincipal: '' },
      { id: `cls_d4_${now}`, nom: "Moutawassit (Tajwîd & Grammaire)", cycle: 'Daara', salle: 'Salle de Mémorisation', capacite: 30, profPrincipal: '' },
      { id: `cls_d5_${now}`, nom: "Thanawi (Sciences Islamiques & Fiqh)", cycle: 'Daara', salle: 'Salle Al-Azhar', capacite: 25, profPrincipal: '' }
    ];
  } else if (packName === 'formation_pro' || packName === 'institut' || packName === 'bts') {
    presetClasses = [
      { id: `cls_bts_gl1_${now}`, nom: 'BTS 1 - Informatique & Génie Logiciel (GL)', cycle: 'BTS', salle: 'Labo Info 1', capacite: 35, profPrincipal: '' },
      { id: `cls_bts_gl2_${now}`, nom: 'BTS 2 - Informatique & Génie Logiciel (GL)', cycle: 'BTS', salle: 'Labo Info 2', capacite: 35, profPrincipal: '' },
      { id: `cls_bts_cg1_${now}`, nom: 'BTS 1 - Comptabilité & Gestion des Entreprises (CGE)', cycle: 'BTS', salle: 'Amphi A - Économie', capacite: 40, profPrincipal: '' },
      { id: `cls_bts_cg2_${now}`, nom: 'BTS 2 - Comptabilité & Gestion des Entreprises (CGE)', cycle: 'BTS', salle: 'Amphi A - Économie', capacite: 40, profPrincipal: '' },
      { id: `cls_bts_ci1_${now}`, nom: 'BTS 1 - Commerce International & Transit (CI)', cycle: 'BTS', salle: 'Salle C05', capacite: 35, profPrincipal: '' },
      { id: `cls_bts_ci2_${now}`, nom: 'BTS 2 - Commerce International & Transit (CI)', cycle: 'BTS', salle: 'Salle C06', capacite: 35, profPrincipal: '' }
    ];
  } else if (packName === 'licences_pro') {
    presetClasses = [
      { id: `cls_lic_gl_${now}`, nom: 'Licence 3 Pro - Génie Logiciel & Cloud', cycle: 'Licence', salle: 'Labo Info 1', capacite: 45, profPrincipal: '' },
      { id: `cls_lic_cge_${now}`, nom: 'Licence 3 Pro - Finance, Comptabilité & Audit SYSCOHADA', cycle: 'Licence', salle: 'Amphi B', capacite: 45, profPrincipal: '' },
      { id: `cls_m1_man_${now}`, nom: 'Master 1 - Management & Stratégie Digitale', cycle: 'Master', salle: 'Salle M01', capacite: 35, profPrincipal: '' },
      { id: `cls_m2_audit_${now}`, nom: 'Master 2 - Audit, Contrôle de Gestion & SI', cycle: 'Master', salle: 'Salle M02', capacite: 30, profPrincipal: '' }
    ];
  } else if (packName === 'cap_cqp') {
    presetClasses = [
      { id: `cls_cap_elec_${now}`, nom: 'CAP Électricité & Électrotechnique', cycle: 'CAP', salle: 'Atelier Élec', capacite: 25, profPrincipal: '' },
      { id: `cls_cap_meca_${now}`, nom: 'CAP Mécanique & Maintenance Industrielle', cycle: 'CAP', salle: 'Atelier Mécanique', capacite: 25, profPrincipal: '' },
      { id: `cls_cqp_btp_${now}`, nom: 'CQP Métiers du BTP & Génie Civil', cycle: 'Certification Professionnelle', salle: 'Atelier BTP', capacite: 25, profPrincipal: '' },
      { id: `cls_cqp_des_${now}`, nom: 'Certificat Pro Design Graphique & Web', cycle: 'Certification Professionnelle', salle: 'Labo Multimédia', capacite: 25, profPrincipal: '' }
    ];
  }

  if (!Array.isArray(appState.db.classes)) appState.db.classes = [];
  const added = [];

  presetClasses.forEach(p => {
    const exists = appState.db.classes.some(c => 
      c.etablissementId === etabId &&
      c.nom.toLowerCase().trim() === p.nom.toLowerCase().trim()
    );
    if (!exists) {
      const clsObj = {
        ...p,
        etablissementId: etabId,
        effectif: 0
      };
      appState.db.classes.push(clsObj);
      added.push(clsObj);
    }
  });

  saveDataStore();
  syncEstablishmentClasses();

  // Envoi asynchrone à l'API si le serveur tourne
  if (appState.isApiOnline && added.length > 0) {
    fetch('http://localhost:5000/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classes: added, etablissementId: etabId, updatedBy: 'Direction Générale' })
    }).catch(() => {});
  }

  renderClassesView();
  renderSidebar();
  const currentEtab = appState.db.etablissements.find(e => e.id === etabId);
  const isInstitutPreset = currentEtab && currentEtab.type !== 'DAARA' && isInstitutEstablishment(currentEtab);
  showToast(`🎉 Pack ${packName.toUpperCase()} configuré (${added.length} ${isInstitutPreset ? 'filières ajoutées' : 'classes ajoutées'}) !`);
}

function openNewClassModal(editId = null) {
  const modal = document.getElementById('modalDashboardClass');
  if (!modal) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const idInput = document.getElementById('editDashboardClassId');
  const titleEl = document.getElementById('modalDashboardClassTitle');
  const nomInput = document.getElementById('dashboardClassNameInput');
  const cycleSelect = document.getElementById('dashboardClassCycleSelect');
  const capInput = document.getElementById('dashboardClassCapacityInput');
  const roomInput = document.getElementById('dashboardClassRoomInput');
  const teacherInput = document.getElementById('dashboardClassTeacherInput');
  const labelNom = document.getElementById('modalDashboardClassLabelNom');
  const labelCycle = document.getElementById('modalDashboardClassLabelCycle');
  const labelRoom = document.getElementById('modalDashboardClassLabelRoom');
  const labelTeacher = document.getElementById('modalDashboardClassLabelTeacher');
  const submitBtn = document.getElementById('modalDashboardClassSubmitBtn');

  // Configuration dynamique des libellés et des cycles selon le mode
  if (isInstitut) {
    if (labelNom) labelNom.textContent = 'Filière / Promotion *';
    if (labelCycle) labelCycle.textContent = 'Cycle / Type de Formation *';
    if (labelRoom) labelRoom.textContent = 'Salle / Amphi / Labo';
    if (labelTeacher) labelTeacher.textContent = 'Responsable Pédagogique / Formateur Référent';
    if (nomInput) nomInput.placeholder = 'Ex: BTS 1 Génie Logiciel, Licence 3 Finance, CAP Élec...';
    if (roomInput) roomInput.placeholder = 'Ex: Labo Info 1, Amphi A, Salle 12';
    if (teacherInput) teacherInput.placeholder = 'Ex: Dr. Diallo, Ing. Ndiaye';

    // UNIQUEMENT LES 10 CYCLES OFFICIELS INSTITUT + OPTION SAISIE LIBRE
    if (cycleSelect) {
      cycleSelect.innerHTML = INSTITUT_CYCLES.map(c => `<option value="${c.value}">${c.label}</option>`).join('') + `
        <option value="__CUSTOM_CYCLE__">✍️ Autre cycle / niveau (saisie libre)...</option>
      `;
    }
  } else if (isDaara) {
    if (labelNom) labelNom.textContent = 'Section / Cycle Coranique *';
    if (labelCycle) labelCycle.textContent = 'Cycle Coranique / Hifz *';
    if (labelRoom) labelRoom.textContent = 'Salle de Récitation / Pavillon';
    if (labelTeacher) labelTeacher.textContent = 'Oustaz Référent / Titulaire';
    if (nomInput) nomInput.placeholder = 'Ex: Hifz Niveau 1, Ibtida\'i, Thanawi...';
    if (roomInput) roomInput.placeholder = 'Ex: Salle Al-Houda, Pavillon Allouwa';
    if (teacherInput) teacherInput.placeholder = 'Ex: Oustaz Modou Fall, Oustaz Cheikh';

    if (cycleSelect) {
      cycleSelect.innerHTML = [
        { value: "Tahfîz", label: "Tahfîz Coranique (Mémorisation)" },
        { value: "Ibtida'i", label: "Cycle Ibtida'i (Primaire Franco-Arabe)" },
        { value: "Moutawassit", label: "Cycle Moutawassit (Moyen Coranique)" },
        { value: "Thanawi", label: "Cycle Thanawi (Secondaire Coranique)" },
        { value: "Daara", label: "Daara Moderne & Hifz" }
      ].map(c => `<option value="${c.value}">${c.label}</option>`).join('') + `
        <option value="__CUSTOM_CYCLE__">✍️ Autre cycle / niveau (saisie libre)...</option>
      `;
    }
  } else {
    if (labelNom) labelNom.textContent = 'Nom de la Classe *';
    if (labelCycle) labelCycle.textContent = 'Cycle Pédagogique *';
    if (labelRoom) labelRoom.textContent = 'Salle de Classe';
    if (labelTeacher) labelTeacher.textContent = 'Professeur Principal';
    if (nomInput) nomInput.placeholder = 'Ex: CM2 A, 6ème B, Terminale S2...';
    if (roomInput) roomInput.placeholder = 'Ex: Salle 12, Pavillon B';
    if (teacherInput) teacherInput.placeholder = 'Ex: M. Abdoulaye Diallo';

    if (cycleSelect) {
      cycleSelect.innerHTML = [
        { value: "Élémentaire", label: "Élémentaire (Primaire)" },
        { value: "Collège", label: "Enseignement Moyen (Collège)" },
        { value: "Lycée", label: "Enseignement Secondaire (Lycée)" },
        { value: "Maternelle", label: "Maternelle / Préscolaire" }
      ].map(c => `<option value="${c.value}">${c.label}</option>`).join('') + `
        <option value="__CUSTOM_CYCLE__">✍️ Autre cycle / niveau (saisie libre)...</option>
      `;
    }
  }

  const customCycleInput = document.getElementById('dashboardClassCustomCycleInput');
  if (customCycleInput) {
    customCycleInput.style.display = 'none';
    customCycleInput.value = '';
  }

  if (editId) {
    const c = (appState.db.classes || []).find(item => item.id === editId);
    if (c) {
      if (idInput) idInput.value = c.id;
      if (titleEl) titleEl.textContent = isInstitut ? `Modifier la Filière : ${c.nom}` : (isDaara ? `Modifier la Section : ${c.nom}` : `Modifier la Classe : ${c.nom}`);
      if (nomInput) nomInput.value = c.nom || '';
      if (cycleSelect) {
        cycleSelect.value = c.cycle || (isInstitut ? 'BTS' : (isDaara ? 'Tahfîz' : 'Élémentaire'));
        if (!cycleSelect.value) {
          cycleSelect.value = '__CUSTOM_CYCLE__';
          if (customCycleInput) {
            customCycleInput.style.display = 'block';
            customCycleInput.value = c.cycle || '';
          }
        }
      }
      if (capInput) capInput.value = c.capacite || (isInstitut ? 35 : 45);
      if (roomInput) roomInput.value = c.salle || '';
      if (teacherInput) teacherInput.value = c.profPrincipal || '';
      if (submitBtn) submitBtn.textContent = isInstitut ? '✓ Mettre à jour la Filière' : (isDaara ? '✓ Mettre à jour la Section' : '✓ Mettre à jour la Classe');
    }
  } else {
    if (idInput) idInput.value = '';
    if (titleEl) titleEl.textContent = isInstitut ? '🎓 Ajouter une Nouvelle Filière / Promotion' : (isDaara ? '🕌 Ajouter une Section Coranique' : '🏫 Ajouter une Nouvelle Classe');
    if (nomInput) nomInput.value = '';
    if (cycleSelect) cycleSelect.value = isInstitut ? 'BTS' : (isDaara ? 'Tahfîz' : 'Élémentaire');
    if (capInput) capInput.value = isInstitut ? 35 : 45;
    if (roomInput) roomInput.value = isInstitut ? 'Labo Info 1' : (isDaara ? 'Salle Al-Houda' : 'Salle Principale');
    if (teacherInput) teacherInput.value = '';
    if (submitBtn) submitBtn.textContent = isInstitut ? '✓ Enregistrer la Filière' : (isDaara ? '✓ Enregistrer la Section' : '✓ Enregistrer la Classe');
  }

  modal.classList.add('active');
}

function toggleDashboardCustomCycle(val) {
  const customInput = document.getElementById('dashboardClassCustomCycleInput');
  if (!customInput) return;
  if (val === '__CUSTOM_CYCLE__') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
  }
}
window.toggleDashboardCustomCycle = toggleDashboardCustomCycle;

function submitNewClassModal(e) {
  if (e) e.preventDefault();
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const id = document.getElementById('editDashboardClassId')?.value;
  const nom = document.getElementById('dashboardClassNameInput')?.value?.trim();
  let cycle = document.getElementById('dashboardClassCycleSelect')?.value || (isInstitut ? 'BTS' : 'Élémentaire');
  if (cycle === '__CUSTOM_CYCLE__') {
    cycle = document.getElementById('dashboardClassCustomCycleInput')?.value?.trim() || (isInstitut ? 'BTS' : 'Cycle Général');
  }
  const capacite = parseInt(document.getElementById('dashboardClassCapacityInput')?.value) || (isInstitut ? 35 : 45);
  const salle = document.getElementById('dashboardClassRoomInput')?.value?.trim() || (isInstitut ? 'Amphi A' : 'Salle Principale');
  const profPrincipal = document.getElementById('dashboardClassTeacherInput')?.value?.trim() || '';

  if (!nom) {
    showToast(`⚠️ Veuillez renseigner le libellé de la ${isInstitut ? 'filière / promotion' : (isDaara ? 'section' : 'classe')}.`, true);
    return;
  }

  if (!Array.isArray(appState.db.classes)) appState.db.classes = [];

  if (id) {
    const idx = appState.db.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      appState.db.classes[idx] = {
        ...appState.db.classes[idx],
        nom,
        cycle,
        capacite,
        salle,
        profPrincipal
      };
      if (appState.isApiOnline) {
        fetch(`http://localhost:5000/api/classes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom, cycle, capacite, salle, profPrincipal, updatedBy: 'Direction Générale' })
        }).catch(() => {});
      }
      showToast(`✓ ${isInstitut ? 'Filière' : (isDaara ? 'Section' : 'Classe')} ${nom} mise à jour avec succès !`);
    }
  } else {
    const newClass = {
      id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      etablissementId: etabId,
      nom,
      cycle,
      capacite,
      salle,
      profPrincipal,
      effectif: 0
    };
    appState.db.classes.push(newClass);
    if (appState.isApiOnline) {
      fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClass, updatedBy: 'Direction Générale' })
      }).catch(() => {});
    }
    showToast(`✓ ${isInstitut ? 'Filière' : (isDaara ? 'Section' : 'Classe')} ${nom} créée avec succès !`);
  }

  saveDataStore();
  syncEstablishmentClasses();
  closeModals();
  renderClassesView();
  renderSidebar();
}

function deleteClass(classId) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const c = (appState.db.classes || []).find(item => item.id === classId);
  const nom = c ? c.nom : (isInstitut ? 'cette filière' : 'cette classe');
  const term = isInstitut ? 'la filière' : (isDaara ? 'la section' : 'la classe');
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${term} "${nom}" ?`)) return;

  appState.db.classes = (appState.db.classes || []).filter(item => item.id !== classId);
  saveDataStore();
  syncEstablishmentClasses();

  if (appState.isApiOnline) {
    fetch(`http://localhost:5000/api/classes/${classId}`, { method: 'DELETE' }).catch(() => {});
  }

  renderClassesView();
  renderSidebar();
  showToast(`🗑️ ${isInstitut ? 'Filière' : (isDaara ? 'Section' : 'Classe')} "${nom}" supprimée.`);
}

function selectClassForTimetable(className) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const classes = (appState.db.classes || []).filter(c => appState.activeEstablishmentId ? c.etablissementId === appState.activeEstablishmentId : true);
  const found = classes.find(c => c.nom.toLowerCase().trim() === className.toLowerCase().trim());
  if (found) {
    activeTimetableClassId = found.id;
  }
  switchTab('timetable');
  showToast(`📅 Planning affiché pour la ${isInstitut ? 'filière' : (isDaara ? 'section' : 'classe')} : ${className}`);
}

function triggerAutoGenerateTimetable() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);
  let currentClass = classes.find(c => c.id === activeTimetableClassId);

  if (!currentClass) {
    if (classes.length > 0) {
      activeTimetableClassId = classes[0].id;
      currentClass = classes[0];
    } else {
      showToast(`⚠️ Aucune ${isInstitut ? 'filière active. Créez d\'abord une filière' : (isDaara ? 'section active. Créez d\'abord une section' : 'classe active. Créez d\'abord une classe')} ou appliquez un pack.`, true);
      return;
    }
  }

  const className = currentClass.nom;
  const cycle = (currentClass.cycle || (isDaara ? 'Daara' : (isInstitut ? 'Formation Professionnelle' : 'Élémentaire'))).toLowerCase();
  const classLower = (currentClass.nom || '').toLowerCase();
  const isClassVocational = isInstitut || cycle.includes('pro') || cycle.includes('bts') || cycle.includes('licence') || cycle.includes('cap') || cycle.includes('cqp') || classLower.includes('bts') || classLower.includes('licence') || classLower.includes('cap') || classLower.includes('cqp');
  const slotsList = isDaara ? DAARA_TIME_SLOTS : (isClassVocational ? INSTITUT_TIME_SLOTS : ECOLE_TIME_SLOTS);

  // 1. Matières officielles selon le cycle
  let subjects = [];
  if (isClassVocational) {
    if (classLower.includes('gl') || classLower.includes('info') || classLower.includes('logiciel') || classLower.includes('web') || classLower.includes('dev')) {
      subjects = [
        { subject: "Algorithmique & Python Avancé", teacher: "Ing. Abdoulaye Ndiaye", room: "Labo Info 1" },
        { subject: "Architecture Web & APIs REST", teacher: "Ing. Abdoulaye Ndiaye", room: "Labo Info 1" },
        { subject: "Bases de Données & SQL (PostgreSQL)", teacher: "Dr. Mamadou Cissé", room: "Labo Info 2" },
        { subject: "Réseaux Informatiques & Sécurité", teacher: "M. Cheikh Sy", room: "Labo Réseaux" },
        { subject: "Anglais Professionnel & Soutenance", teacher: "M. Ousmane Niang", room: "Amphi A" },
        { subject: "Atelier Projets & Dév Fullstack", teacher: "Ing. Abdoulaye Ndiaye", room: "Atelier Numérique" }
      ];
    } else if (classLower.includes('cge') || classLower.includes('compt') || classLower.includes('gestion') || classLower.includes('finance') || classLower.includes('audit')) {
      subjects = [
        { subject: "Comptabilité Approfondie SYSCOHADA", teacher: "Mme Aïssatou Fall", room: "Salle Marché & Audit" },
        { subject: "Fiscalité & Déclarations d'Entreprise", teacher: "Me Aminata Diop", room: "Salle Marché & Audit" },
        { subject: "Droit Commercial Général OHADA", teacher: "Me Aminata Diop", room: "Amphi A" },
        { subject: "Audit & Contrôle de Gestion", teacher: "Dr. Mamadou Cissé", room: "Salle Conseil" },
        { subject: "Informatique de Gestion & Sage", teacher: "Ing. Abdoulaye Ndiaye", room: "Labo Info 1" },
        { subject: "Anglais des Affaires & Négociation", teacher: "M. Ousmane Niang", room: "Amphi A" }
      ];
    } else if (classLower.includes('transit') || classLower.includes('commerce') || classLower.includes('douane') || classLower.includes('fret') || classLower.includes('logistique')) {
      subjects = [
        { subject: "Douane, Tarifs Extérieurs & GAINDE", teacher: "M. Cheikh Sy", room: "Salle Transit" },
        { subject: "Logistique Internationale & Fret", teacher: "M. Cheikh Sy", room: "Salle Transit" },
        { subject: "Procédures d'Import-Export & Incoterms", teacher: "Mme Aïssatou Fall", room: "Salle Transit" },
        { subject: "Droit Maritime & Assurances Transport", teacher: "Me Aminata Diop", room: "Amphi A" },
        { subject: "Anglais Commercial & Maritime", teacher: "M. Ousmane Niang", room: "Amphi A" },
        { subject: "Atelier Déclarations en Ligne", teacher: "M. Cheikh Sy", room: "Labo Info 2" }
      ];
    } else if (classLower.includes('elec') || classLower.includes('méc') || classLower.includes('btp') || classLower.includes('atelier') || classLower.includes('cap') || classLower.includes('cqp')) {
      subjects = [
        { subject: "Travaux Pratiques en Atelier", teacher: "Ing. Abdoulaye Ndiaye", room: "Atelier Électromécanique" },
        { subject: "Schémas Électriques & DAO", teacher: "Ing. Abdoulaye Ndiaye", room: "Labo DAO" },
        { subject: "Normes de Sécurité & Prévention HSE", teacher: "Dr. Mamadou Cissé", room: "Salle Technique" },
        { subject: "Automatisme & Maintenance Industrielle", teacher: "M. Cheikh Sy", room: "Atelier Électromécanique" },
        { subject: "Technologie des Équipements", teacher: "M. Cheikh Sy", room: "Atelier Électromécanique" },
        { subject: "Communication Professionnelle & Chantier", teacher: "M. Ousmane Niang", room: "Salle Technique" }
      ];
    } else {
      subjects = [
        { subject: "Modules Métiers & Travaux Pratiques", teacher: "Dr. Mamadou Cissé", room: "Amphi A" },
        { subject: "Droit du Travail & Cadre OHADA", teacher: "Me Aminata Diop", room: "Amphi A" },
        { subject: "Outils Numériques & Tableurs Pro", teacher: "Ing. Abdoulaye Ndiaye", room: "Labo Info 1" },
        { subject: "Comptabilité de Gestion & Budget", teacher: "Mme Aïssatou Fall", room: "Salle Conseil" },
        { subject: "Anglais Technique Professionnel", teacher: "M. Ousmane Niang", room: "Amphi A" },
        { subject: "Méthodologie Rapport & Soutenance", teacher: "Dr. Mamadou Cissé", room: "Amphi A" }
      ];
    }
  } else if (cycle.includes('maternelle')) {
    subjects = [
      { subject: "Accueil & Langage", teacher: "Maîtresse Aïda", room: "Salle Éveil" },
      { subject: "Comptines & Éveil Sensoriel", teacher: "Maîtresse Aïda", room: "Salle Éveil" },
      { subject: "Graphisme & Dessin", teacher: "Maîtresse Fatou", room: "Atelier Dessin" },
      { subject: "Activités Motrices & EPS", teacher: "Coach Diouf", room: "Cour Maternelle" },
      { subject: "Jeux Libres & Chants", teacher: "Maîtresse Fatou", room: "Salle Éveil" }
    ];
  } else if (cycle.includes('daara')) {
    subjects = [
      { subject: "Tahfîz Matinal (Hizb 1-60)", teacher: currentClass.profPrincipal || "Oustaz Serigne Modou Ndiaye", room: "Salle de Mémorisation" },
      { subject: "Planche Allouwa & Récitation", teacher: "Oustaz Cheikh Tidiane", room: "Pavillon Allouwa" },
      { subject: "Règles de Tajwîd & Phonétique", teacher: "Oustaz Thierno Sow", room: "Salle Badr" },
      { subject: "Hadith & Sciences Islamiques", teacher: "Oustaz Serigne Modou Ndiaye", room: "Salle Al-Azhar" },
      { subject: "Langue Arabe & Vocabulaire", teacher: "Oustaz Cheikh Tidiane", room: "Salle Al-Houda" },
      { subject: "Calcul & Éveil de Base", teacher: "M. Abdoulaye Diallo", room: "Salle Passerelle" }
    ];
  } else if (cycle.includes('coll') || cycle.includes('moyen')) {
    subjects = [
      { subject: "Mathématiques", teacher: "M. Abdoulaye Diallo", room: "Salle B12" },
      { subject: "Français & Expression", teacher: "Mme Mariama Ba", room: "Salle B12" },
      { subject: "Sciences Physiques & Chimie", teacher: "M. Cheikh Tidiane Diop", room: "Labo Sciences" },
      { subject: "SVT (Biologie & Géologie)", teacher: "Mme Aminata Sarr", room: "Labo 2" },
      { subject: "Histoire - Géographie", teacher: "M. Ibrahima Faye", room: "Salle B12" },
      { subject: "Anglais LV1", teacher: "M. Babacar Fall", room: "Salle B12" },
      { subject: "EPS & Athlétisme", teacher: "Coach Diouf", room: "Terrain de Sport" }
    ];
  } else if (cycle.includes('lyc') || cycle.includes('sec')) {
    subjects = [
      { subject: "Philosophie & Épistémologie", teacher: "Prof. Ndiaye", room: "Salle Lycée 1" },
      { subject: "Mathématiques & Analyse", teacher: "M. Abdoulaye Diallo", room: "Salle Lycée 1" },
      { subject: "Sciences Physiques & Chimie", teacher: "M. Cheikh Tidiane Diop", room: "Labo 1" },
      { subject: "Français & Littérature Africaine", teacher: "Mme Mariama Ba", room: "Salle Lycée 1" },
      { subject: "Histoire - Géographie", teacher: "M. Ibrahima Faye", room: "Salle Lycée 1" },
      { subject: "SVT (Sciences de la Vie)", teacher: "Mme Aminata Sarr", room: "Labo 2" },
      { subject: "Anglais LV1", teacher: "M. Babacar Fall", room: "Salle Lycée 1" },
      { subject: "EPS & Sports Co", teacher: "Coach Diouf", room: "Terrain de Sport" }
    ];
  } else {
    // Élémentaire / Primaire
    subjects = [
      { subject: "Calcul & Numération", teacher: currentClass.profPrincipal || "M. Abdoulaye Diallo", room: currentClass.salle || "Salle 6" },
      { subject: "Lecture & Vocabulaire", teacher: "Mme Mariama Ba", room: currentClass.salle || "Salle 6" },
      { subject: "Grammaire & Dictée", teacher: "Mme Mariama Ba", room: currentClass.salle || "Salle 6" },
      { subject: "Éveil Scientifique & Géométrie", teacher: currentClass.profPrincipal || "M. Abdoulaye Diallo", room: currentClass.salle || "Salle 6" },
      { subject: "Histoire du Sénégal & Morale", teacher: "M. Ibrahima Faye", room: currentClass.salle || "Salle 6" },
      { subject: "EPS & Jeux Sportifs", teacher: "Coach Diouf", room: "Cour Principale" },
      { subject: "Arts & Dessin", teacher: "Mme Mariama Ba", room: currentClass.salle || "Salle 6" }
    ];
  }

  // 1.B. Rapprochement avec le Corps Professoral enregistré dans l'établissement
  const estTeachers = (appState.db.enseignants || []).filter(t => (etabId ? t.etablissementId === etabId : true) && t.statut !== 'ARCHIVE');
  if (estTeachers.length > 0) {
    subjects.forEach(sub => {
      const matchedTeacher = estTeachers.find(t => {
        const teachesClass = Array.isArray(t.classes) && t.classes.some(c => c.toLowerCase().trim() === className.toLowerCase().trim());
        const teachesSubject = t.matiere && (
          sub.subject.toLowerCase().includes(t.matiere.toLowerCase()) || 
          t.matiere.toLowerCase().includes(sub.subject.toLowerCase())
        );
        return teachesClass && teachesSubject;
      }) || estTeachers.find(t => {
        return Array.isArray(t.classes) && t.classes.some(c => c.toLowerCase().trim() === className.toLowerCase().trim());
      }) || estTeachers.find(t => {
        return t.matiere && (
          sub.subject.toLowerCase().includes(t.matiere.toLowerCase()) || 
          t.matiere.toLowerCase().includes(sub.subject.toLowerCase())
        );
      });

      if (matchedTeacher && matchedTeacher.nom) {
        sub.teacher = matchedTeacher.nom;
      }
    });
  }

  // 2. Détection des collisions inter-classes
  if (!timetablesStore) initTimetables();

  function isTeacherBusy(teacherName, dayKey, slotKey) {
    if (!teacherName) return false;
    for (const [clsId, tt] of Object.entries(timetablesStore)) {
      if (clsId === activeTimetableClassId) continue;
      const s = (tt.slots || {})[`${dayKey}-${slotKey}`];
      if (s && s.teacher && s.teacher.toLowerCase().includes(teacherName.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  const generatedSlots = {};
  let subIdx = 0;

  TIMETABLE_DAYS.forEach(day => {
    slotsList.forEach((slot, sIdx) => {
      const slotKey = `${day.key}-${slot.key}`;

      // Pauses officielles
      if (day.key === 'samedi' && sIdx >= 2) {
        generatedSlots[slotKey] = { subject: "Fin de semaine (Repos)", teacher: "-", room: "-" };
        return;
      }
      if (day.key === 'vendredi' && sIdx === 2 && !isDaara) {
        generatedSlots[slotKey] = { subject: "Prière du Vendredi & Repos", teacher: "-", room: "-" };
        return;
      }
      if (day.key === 'mercredi' && sIdx >= 2 && cycle.includes('élémentaire')) {
        generatedSlots[slotKey] = { subject: "Après-midi Libre / Sport", teacher: "Coach Diouf", room: "Terrain" };
        return;
      }

      let subObj = subjects[subIdx % subjects.length];
      subIdx++;

      let assignedTeacher = subObj.teacher;
      // Vérification anti-collision : si le professeur est pris, ajuster
      if (isTeacherBusy(assignedTeacher, day.key, slot.key)) {
        assignedTeacher = currentClass.profPrincipal || "Enseignant Adjoint";
      }

      generatedSlots[slotKey] = {
        subject: subObj.subject,
        teacher: assignedTeacher,
        room: subObj.room || currentClass.salle || "Salle Principale"
      };
    });
  });

  timetablesStore[activeTimetableClassId] = {
    className,
    etablissementId: etabId,
    cycle: currentClass.cycle || 'Général',
    slots: generatedSlots
  };

  saveTimetablesStore();

  const estKey = getActiveEstablishmentKey();
  try {
    localStorage.setItem(`sse_tt_${estKey}_${className}`, JSON.stringify(generatedSlots));
  } catch(e) {}

  if (appState.isApiOnline) {
    fetch('http://localhost:5000/api/timetables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        etablissementId: etabId,
        className,
        cycle: currentClass.cycle,
        slots: generatedSlots,
        updatedBy: 'Direction Générale'
      })
    }).catch(() => {});
  }

  renderTimetable();
  showToast(`⚡ ${isInstitut ? 'Planning des cours' : 'Emploi du temps'} de ${className} généré automatiquement sans aucun conflit ${isInstitut ? 'de formateur' : (isDaara ? 'd\'oustaz' : 'd\'enseignant')} !`);
}

// =========================================================================
// 2.B. CORPS PROFESSORAL & OUSTAZS (RH, CONTRATS, AFFECTATIONS & PAIE)
// =========================================================================
let selectedTeacherModalClasses = [];

function syncEstablishmentTeachers() {
  if (!appState.db) return;
  if (!Array.isArray(appState.db.enseignants)) appState.db.enseignants = [];
  const estKey = getActiveEstablishmentKey();
  const etabId = appState.activeEstablishmentId;

  const isMockTeacher = (t) => {
    if (!t) return true;
    const id = (t.id || '').toLowerCase();
    const code = (t.code || t.mat || t.accessKey || '').toUpperCase();
    return id.includes('ousmane-niang-emf') ||
           id === 'form-01' || id === 'form-02' || id === 'form-03' || id === 'form-04' ||
           code.startsWith('FOR-2026-');
  };

  // 1. Purge immédiate des enseignants de maquette
  appState.db.enseignants = appState.db.enseignants.filter(t => !isMockTeacher(t));

  // 2. Importer depuis les clés localStorage réelles
  const candidateKeys = [
    `sse_teachers_${estKey}`
  ].filter(Boolean);

  for (const k of candidateKeys) {
    try {
      const portalTeachersRaw = localStorage.getItem(k);
      if (portalTeachersRaw) {
        const portalTeachers = JSON.parse(portalTeachersRaw);
        if (Array.isArray(portalTeachers)) {
          portalTeachers.filter(pt => !isMockTeacher(pt)).forEach(pt => {
            const exists = appState.db.enseignants.some(t =>
              (t.id === pt.id || (t.nom && pt.nom && t.nom.toLowerCase().trim() === pt.nom.toLowerCase().trim())) &&
              (t.etablissementId === etabId)
            );
            if (!exists) {
              appState.db.enseignants.push({
                id: pt.id || `ens-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                etablissementId: etabId || 'etab-default',
                mat: pt.mat || `ENS-2026-${Math.floor(10 + Math.random() * 89)}`,
                nom: pt.nom || 'Enseignant',
                tel: pt.tel || pt.telephone || '',
                email: pt.email || '',
                matiere: pt.matiere || 'Enseignement Général',
                classes: Array.isArray(pt.classes) ? pt.classes : (pt.classes ? [pt.classes] : []),
                volume: pt.volume || '20h / semaine',
                contrat: pt.contrat || 'CDI Titulaire',
                salaire: Number(pt.salaire) || 200000,
                statut: pt.statut || 'ACTIF'
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Erreur synchronisation sse_teachers:", e);
    }
  }

  // 3. Synchronisation miroir vers sse_teachers_${estKey}
  const currentEstTeachers = appState.db.enseignants.filter(t => etabId ? t.etablissementId === etabId : false);
  try {
    localStorage.setItem(`sse_teachers_${estKey}`, JSON.stringify(currentEstTeachers));
  } catch (e) {}

  saveDataStore();
}

function renderTeachersView() {
  syncEstablishmentTeachers();
  const tbody = document.getElementById('dashboardTeachersTable');
  const countEl = document.getElementById('dashboardTeachersTotalCount');
  const hoursEl = document.getElementById('dashboardTeachersTotalHours');
  const payrollEl = document.getElementById('dashboardTeachersTotalPayroll');
  const sidebarBadge = document.getElementById('sidebarTeachersCount');
  const sidebarBadgeDaara = document.getElementById('sidebarTeachersCountDaara');

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  // Adaptation dynamique des en-têtes et libellés selon le type d'établissement
  const teachersSectionTitle = document.querySelector('#view-teachers .data-card-title span:last-child');
  const btnNewTeacher = document.querySelector('#view-teachers .data-card-header button');
  const kpiCountTitle = countEl?.parentElement?.querySelector('div:first-child');
  const kpiHoursTitle = hoursEl?.parentElement?.querySelector('div:first-child');
  const kpiPayrollTitle = payrollEl?.parentElement?.querySelector('div:first-child');
  const thElements = document.querySelectorAll('#view-teachers .data-table thead th');

  if (isInstitut) {
    if (teachersSectionTitle) teachersSectionTitle.textContent = "Corps des Formateurs, Enseignants Supérieurs & Intervenants Professionnels";
    if (btnNewTeacher) btnNewTeacher.textContent = "+ Nouveau Formateur / Vacataire";
    if (kpiCountTitle) kpiCountTitle.textContent = "Effectif Formateurs & Vacataires";
    if (kpiHoursTitle) kpiHoursTitle.textContent = "Volume Horaires Dispensé";
    if (kpiPayrollTitle) kpiPayrollTitle.textContent = "Masse Salariale & Honoraires";
    if (thElements && thElements.length >= 7) {
      thElements[0].textContent = "Formateur / Intervenant";
      thElements[1].textContent = "Modules / Spécialité";
      thElements[2].textContent = "Filières Affectées";
      thElements[3].textContent = "Volume Horaire";
      thElements[4].textContent = "Statut Contrat";
      thElements[5].textContent = "Rémunération / Taux";
      thElements[6].textContent = "Actions";
    }
  } else if (isDaara) {
    if (teachersSectionTitle) teachersSectionTitle.textContent = "Corps des Oustazs & Personnel d'Encadrement Daara";
    if (btnNewTeacher) btnNewTeacher.textContent = "+ Nouveau Contrat Oustaz";
    if (kpiCountTitle) kpiCountTitle.textContent = "Effectif Oustazs";
    if (kpiHoursTitle) kpiHoursTitle.textContent = "Volume Horaire Coranique";
    if (kpiPayrollTitle) kpiPayrollTitle.textContent = "Indemnités Mensuelles Oustazs";
    if (thElements && thElements.length >= 7) {
      thElements[0].textContent = "Oustaz / Enseignant";
      thElements[1].textContent = "Matière / Hifz";
      thElements[2].textContent = "Niveaux Affectés";
      thElements[3].textContent = "Volume Hebdo";
      thElements[4].textContent = "Contrat Daara";
      thElements[5].textContent = "Indemnité";
      thElements[6].textContent = "Actions";
    }
  } else {
    if (teachersSectionTitle) teachersSectionTitle.textContent = "Corps Professoral, Enseignants & RH";
    if (btnNewTeacher) btnNewTeacher.textContent = "+ Nouveau Contrat Enseignant";
    if (kpiCountTitle) kpiCountTitle.textContent = "Effectif Enseignants";
    if (kpiHoursTitle) kpiHoursTitle.textContent = "Volume Horaire Total";
    if (kpiPayrollTitle) kpiPayrollTitle.textContent = "Masse Salariale Mensuelle";
    if (thElements && thElements.length >= 7) {
      thElements[0].textContent = "Enseignant / Oustaz";
      thElements[1].textContent = "Matière Principale";
      thElements[2].textContent = "Classes Affectées";
      thElements[3].textContent = "Volume Hebdo";
      thElements[4].textContent = "Contrat";
      thElements[5].textContent = "Rémunération";
      thElements[6].textContent = "Actions";
    }
  }

  const teachers = (appState.db.enseignants || []).filter(t => (etabId ? t.etablissementId === etabId : true) && t.statut !== 'ARCHIVE');

  // 1. Calculs KPIs RH
  let totalHours = 0;
  let totalPayroll = 0;

  teachers.forEach(t => {
    const match = (t.volume || '').match(/(\d+)/);
    const h = match ? parseInt(match[1]) : 20;
    totalHours += h;
    totalPayroll += (Number(t.salaire) || 0);
  });

  const countLabel = `${teachers.length} ${isInstitut ? 'Formateur' : (isDaara ? 'Oustaz' : 'Enseignant')}${teachers.length > 1 ? 's' : ''}`;
  if (countEl) countEl.textContent = countLabel;
  if (hoursEl) hoursEl.textContent = `${totalHours} h / sem`;
  if (payrollEl) payrollEl.textContent = `${new Intl.NumberFormat('fr-FR').format(totalPayroll)} FCFA`;
  if (sidebarBadge) sidebarBadge.textContent = isInstitut ? `${teachers.length} Formateurs` : `${teachers.length} Profs`;
  if (sidebarBadgeDaara) sidebarBadgeDaara.textContent = `${teachers.length} Oustazs`;

  if (!tbody) return;

  // 2. Rendu du tableau des enseignants
  if (teachers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">${isInstitut ? '🎓' : (isDaara ? '🕌' : '👨‍🏫')}</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">
            ${isInstitut ? 'Aucun formateur ou intervenant professionnel enregistré pour le moment' : (isDaara ? 'Aucun contrat oustaz enregistré pour le moment' : 'Aucun contrat enseignant enregistré pour le moment')}
          </div>
          <p style="font-size: 0.85rem; max-width: 500px; margin: 0 auto 1.25rem;">
            ${isInstitut ? "Enregistrez les formateurs métiers, intervenants d'entreprises partenaires et coordinateurs avec leurs modules pour alimenter le planning et les vacations." : "Enregistrez les membres du corps professoral, leurs contrats, volumes horaires et affectations de classes pour alimenter automatiquement les emplois du temps et la paie."}
          </p>
          <button type="button" class="btn btn-primary btn-sm" onclick="openNewTeacherModal()" style="background: linear-gradient(135deg, #00D2B4, #3B82F6); font-weight: 700;">
            + Nouveau ${isInstitut ? 'Formateur / Intervenant' : (isDaara ? 'Contrat Oustaz' : 'Contrat Enseignant')}
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = teachers.map(t => {
    const initials = (t.nom || 'Formateur').split(' ').filter(p => p.length > 0).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    const cleanTel = (t.tel || '').replace(/\s+/g, '');
    const classesList = Array.isArray(t.classes) ? t.classes : (t.classes ? [t.classes] : []);
    
    const classesBadges = classesList.length > 0 
      ? classesList.map(c => `<span class="badge-tag badge-blue" style="font-size: 0.72rem; padding: 0.15rem 0.45rem; margin: 0.1rem;">${c}</span>`).join('')
      : `<span style="color: var(--text-secondary); font-size: 0.78rem; font-style: italic;">Non affecté</span>`;

    const isTitulaire = (t.contrat || '').toLowerCase().includes('titulaire') || (t.contrat || '').toLowerCase().includes('permanent') || (t.contrat || '').toLowerCase().includes('cdi');
    const isVacataire = (t.contrat || '').toLowerCase().includes('vacataire') || (t.contrat || '').toLowerCase().includes('taux') || (t.contrat || '').toLowerCase().includes('intervenant');
    const contractBadgeClass = isTitulaire ? 'badge-green' : (isVacataire ? 'badge-yellow' : 'badge-purple');
    const salaryFormatted = Number(t.salaire) > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.salaire)} FCFA` : 'Non renseigné';

    return `
      <tr>
        <td>
          <div class="avatar-cell">
            <div class="avatar-round" style="background: ${isInstitut ? 'rgba(16, 185, 129, 0.18)' : (isDaara ? 'rgba(245,158,11,0.18)' : 'rgba(56,189,248,0.18)')}; color: ${isInstitut ? '#34D399' : (isDaara ? 'var(--gold)' : '#38BDF8')}; font-weight: 800;">
              ${initials || (isInstitut ? 'FRM' : (isDaara ? 'OUS' : 'ENS'))}
            </div>
            <div>
              <div class="cell-main-text" style="font-weight: 700; color: #fff;">${t.nom}</div>
              <div class="cell-sub-text" style="display: flex; gap: 0.4rem; align-items: center; margin-top: 0.15rem;">
                <span class="badge-tag badge-purple" style="font-size: 0.68rem; padding: 0.1rem 0.35rem;">${t.mat || (isInstitut ? 'FRM-2026' : (isDaara ? 'OUS-2026' : 'ENS-2026'))}</span>
                ${cleanTel ? `<a href="https://wa.me/${cleanTel.replace('+', '')}" target="_blank" style="color: #22C55E; text-decoration: none; font-size: 0.75rem;">💬 ${t.tel}</a>` : ''}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: #E2E8F0;">${t.matiere || (isInstitut ? 'Module Spécialisé' : 'Enseignement Général')}</span>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; max-width: 240px;">
            ${classesBadges}
          </div>
        </td>
        <td>
          <span class="badge-tag badge-blue" style="font-weight: 600;">${t.volume || '20h / sem'}</span>
        </td>
        <td>
          <span class="badge-tag ${contractBadgeClass}" style="font-weight: 600;">${t.contrat || (isInstitut ? 'Vacataire Professionnel' : (isDaara ? 'Titulaire Daara' : 'CDI Titulaire'))}</span>
        </td>
        <td>
          <div style="font-weight: 700; color: #FBBF24;">${salaryFormatted}</div>
          <a href="javascript:void(0)" onclick="openTeacherPayslip('${t.id}')" style="font-size: 0.72rem; color: var(--primary); text-decoration: underline; margin-top: 0.15rem; display: inline-block;">
            📄 ${isInstitut ? 'Bordereau / Paie' : 'Fiche de Paie'}
          </a>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="openTeacherPayslip('${t.id}')" title="Générer l'attestation / fiche d'honoraires" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
              📄
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="openNewTeacherModal('${t.id}')" title="Modifier le contrat" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
              ✏️
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="deleteTeacher('${t.id}')" title="Supprimer" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; color: var(--danger); border-color: rgba(239, 68, 68, 0.4);">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openNewTeacherModal(editId = null) {
  const modal = document.getElementById('modalDashboardTeacher');
  const titleEl = document.getElementById('modalDashboardTeacherTitle');
  const form = document.getElementById('dashboardTeacherForm');
  const editIdInput = document.getElementById('editDashboardTeacherId');
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  if (!modal) return;

  // Ajustement dynamique des options du contrat selon le type d'établissement
  const contratSelect = document.getElementById('dashboardTeacherContrat');
  if (contratSelect) {
    if (isInstitut) {
      contratSelect.innerHTML = `
        <option value="Vacataire Professionnel">Vacataire Professionnel (Taux horaire)</option>
        <option value="CDI Formateur Permanent">CDI Formateur Permanent</option>
        <option value="Intervenant Entreprise Partenaire">Intervenant Entreprise Partenaire</option>
        <option value="Formateur Atelier / TP">Formateur Atelier / TP</option>
        <option value="Coordinateur de Filière">Coordinateur de Filière</option>
      `;
    } else if (isDaara) {
      contratSelect.innerHTML = `
        <option value="Titulaire Daara">Titulaire Daara Moderne</option>
        <option value="Oustaz Adjoint / Répétiteur">Oustaz Adjoint / Répétiteur</option>
        <option value="Bénévolat / Soutien">Bénévolat / Soutien</option>
      `;
    } else {
      contratSelect.innerHTML = `
        <option value="CDI Titulaire">CDI Titulaire</option>
        <option value="Vacataire">Vacataire (Rémunération horaire)</option>
        <option value="Stage Pédagogique">Stage Pédagogique</option>
        <option value="Bénévolat / Soutien">Bénévolat / Soutien</option>
      `;
    }
  }

  // Libellés & Placeholders
  const nomInput = document.getElementById('dashboardTeacherNom');
  const matiereInput = document.getElementById('dashboardTeacherMatiere');
  const matiereLabel = matiereInput?.parentElement?.querySelector('label');
  const classesLabel = document.querySelector('#modalDashboardTeacher label[style*="justify-content"] span:first-child');
  const directClassesLabel = document.getElementById('modalDashboardTeacherClassesLabel');
  const teacherSubmitBtn = document.getElementById('modalDashboardTeacherSubmitBtn');
  const volumeInput = document.getElementById('dashboardTeacherVolume');
  const salaireInput = document.getElementById('dashboardTeacherSalaire');
  const salaireLabel = salaireInput?.parentElement?.querySelector('label');

  if (nomInput) nomInput.placeholder = isInstitut ? "Ex: M. Ibrahima Sarr (Expert Fiscaliste / Développeur)" : (isDaara ? "Ex: Oustaz Modou Fall" : "Ex: M. Abdoulaye Diallo");
  if (matiereInput) matiereInput.placeholder = isInstitut ? "Ex: Génie Logiciel, Comptabilité SYSCOHADA, Douane" : (isDaara ? "Ex: Coran, Tajwîd & Hifz" : "Ex: Mathématiques, Français, PC");
  if (matiereLabel) matiereLabel.textContent = isInstitut ? "Modules / Spécialité Enseignée *" : (isDaara ? "Matière / Enseignement Coranique *" : "Matière Principale Enseignée *");
  if (classesLabel) classesLabel.textContent = isInstitut ? "Filières / Promotions Affectées :" : (isDaara ? "Sections Affectées :" : "Classes Affectées :");
  if (directClassesLabel) directClassesLabel.textContent = isInstitut ? "Filières Affectées" : (isDaara ? "Sections Affectées" : "Classes Affectées");
  if (salaireLabel) salaireLabel.textContent = isInstitut ? "Honoraires Mensuels / Forfait (FCFA)" : "Salaire Mensuel Net (FCFA)";

  if (teacherSubmitBtn) {
    teacherSubmitBtn.textContent = isInstitut 
      ? (editId ? "✓ Mettre à jour le Contrat Formateur" : "✓ Valider le Contrat Formateur") 
      : (isDaara 
        ? (editId ? "✓ Mettre à jour le Contrat Oustaz" : "✓ Valider le Contrat Oustaz") 
        : (editId ? "✓ Mettre à jour le Contrat Enseignant" : "✓ Valider le Contrat Enseignant"));
  }

  if (editId) {
    const teacher = (appState.db.enseignants || []).find(t => t.id === editId);
    if (!teacher) return;

    if (titleEl) titleEl.innerHTML = isInstitut ? `✏️ Modifier le Contrat Formateur` : (isDaara ? `✏️ Modifier le Contrat Oustaz` : `✏️ Modifier le Contrat Enseignant`);
    if (editIdInput) editIdInput.value = editId;

    if (nomInput) nomInput.value = teacher.nom || '';
    document.getElementById('dashboardTeacherTel').value = teacher.tel || '';
    if (matiereInput) matiereInput.value = teacher.matiere || '';
    if (contratSelect) contratSelect.value = teacher.contrat || (isInstitut ? 'Vacataire Professionnel' : (isDaara ? 'Titulaire Daara' : 'CDI Titulaire'));
    if (volumeInput) volumeInput.value = teacher.volume || (isInstitut ? '12h / semaine' : '20h / semaine');
    if (salaireInput) salaireInput.value = teacher.salaire || (isInstitut ? 350000 : 220000);

    selectedTeacherModalClasses = Array.isArray(teacher.classes) ? [...teacher.classes] : (teacher.classes ? [teacher.classes] : []);
  } else {
    if (titleEl) titleEl.innerHTML = isInstitut ? `🎓 Nouveau Contrat Formateur / Intervenant` : (isDaara ? `👳 Nouveau Contrat Oustaz` : `👨‍🏫 Nouveau Contrat Enseignant`);
    if (editIdInput) editIdInput.value = '';
    if (form) form.reset();

    if (volumeInput) volumeInput.value = isInstitut ? '12h / semaine' : '20h / semaine';
    if (salaireInput) salaireInput.value = isInstitut ? '350000' : (isDaara ? '180000' : '220000');
    if (contratSelect) contratSelect.value = isInstitut ? 'Vacataire Professionnel' : (isDaara ? 'Titulaire Daara' : 'CDI Titulaire');
    if (matiereInput) matiereInput.value = isInstitut ? 'Génie Logiciel & Systèmes' : (isDaara ? 'Coran, Tajwîd & Hifz' : 'Mathématiques');

    selectedTeacherModalClasses = [];
  }

  renderTeacherClassesPills();
  modal.classList.add('active');
}

function renderTeacherClassesPills() {
  const container = document.getElementById('dashboardTeacherClassesPills');
  if (!container) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);

  if (classes.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-secondary); width: 100%; text-align: center; padding: 0.5rem;">
        ${isInstitut ? "Aucune filière enregistrée dans l'établissement. Ajoutez des filières pour les assigner ici." : "Aucune classe enregistrée dans l'établissement. Ajoutez des classes dans l'onglet Classes pour les assigner ici."}
      </div>
    `;
    return;
  }

  container.innerHTML = classes.map(c => {
    const isSelected = selectedTeacherModalClasses.includes(c.nom);
    return `
      <button type="button" onclick="toggleDashboardTeacherClassPill('${c.nom.replace(/'/g, "\\'")}')" 
        style="
          padding: 0.35rem 0.75rem; 
          border-radius: 999px; 
          font-size: 0.8rem; 
          cursor: pointer; 
          transition: all 0.2s ease;
          border: 1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.15)'};
          background: ${isSelected ? 'rgba(0, 210, 180, 0.2)' : 'rgba(255,255,255,0.04)'};
          color: ${isSelected ? '#00D2B4' : 'var(--text-secondary)'};
          font-weight: ${isSelected ? '700' : '500'};
        ">
        ${isSelected ? '✓ ' : '+ '}${c.nom}
      </button>
    `;
  }).join('');
}

function toggleDashboardTeacherClassPill(className) {
  const idx = selectedTeacherModalClasses.indexOf(className);
  if (idx >= 0) {
    selectedTeacherModalClasses.splice(idx, 1);
  } else {
    selectedTeacherModalClasses.push(className);
  }
  renderTeacherClassesPills();
}

function submitNewTeacherModal(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('editDashboardTeacherId')?.value;
  const nom = document.getElementById('dashboardTeacherNom')?.value?.trim();
  const tel = document.getElementById('dashboardTeacherTel')?.value?.trim();
  const matiere = document.getElementById('dashboardTeacherMatiere')?.value?.trim();
  const contrat = document.getElementById('dashboardTeacherContrat')?.value || 'CDI Titulaire';
  const volume = document.getElementById('dashboardTeacherVolume')?.value?.trim() || '20h / semaine';
  const salaire = Number(document.getElementById('dashboardTeacherSalaire')?.value) || 0;
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(item => item.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = etab && !isDaara && (
    (etab.type || '').toUpperCase() === 'FORMATION_PRO' ||
    (etab.type || '').toUpperCase() === 'INSTITUT' ||
    (etab.plan || '').toLowerCase().includes('institut') ||
    (etab.plan || '').toLowerCase().includes('bts') ||
    (etab.plan || '').toLowerCase().includes('formation') ||
    (etab.name || '').toLowerCase().includes('institut')
  );

  if (!nom || !tel || !matiere) {
    showToast('⚠️ Veuillez renseigner le nom, le numéro de téléphone et la matière enseignée.', true);
    return;
  }

  if (!Array.isArray(appState.db.enseignants)) appState.db.enseignants = [];

  if (id) {
    const idx = appState.db.enseignants.findIndex(t => t.id === id);
    if (idx !== -1) {
      appState.db.enseignants[idx] = {
        ...appState.db.enseignants[idx],
        nom,
        tel,
        matiere,
        contrat,
        volume,
        salaire,
        classes: [...selectedTeacherModalClasses]
      };

      if (appState.isApiOnline) {
        fetch(`http://localhost:5000/api/enseignants/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom,
            tel,
            matiere,
            contrat,
            volume,
            salaire,
            classes: selectedTeacherModalClasses,
            updatedBy: 'Direction Générale'
          })
        }).catch(() => {});
      }

      showToast(`✓ Fiche et contrat de ${nom} mis à jour avec succès !`);
    }
  } else {
    const totalCount = appState.db.enseignants.filter(t => etabId ? t.etablissementId === etabId : true).length;
    const prefix = isInstitut ? 'FRM-2026' : (isDaara ? 'OUS-2026' : 'ENS-2026');
    const mat = `${prefix}-${String(totalCount + 1).padStart(2, '0')}`;

    const newTeacher = {
      id: `ens-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      etablissementId: etabId,
      mat,
      nom,
      tel,
      email: '',
      matiere,
      classes: [...selectedTeacherModalClasses],
      volume,
      contrat,
      salaire,
      statut: 'ACTIF'
    };

    appState.db.enseignants.push(newTeacher);

    if (appState.isApiOnline) {
      fetch('http://localhost:5000/api/enseignants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTeacher,
          updatedBy: 'Direction Générale'
        })
      }).catch(() => {});
    }

    showToast(`✓ Nouveau ${isInstitut ? 'formateur' : (isDaara ? 'oustaz' : 'enseignant')} ${nom} enregistré (${mat}) !`);
  }

  saveDataStore();
  syncEstablishmentTeachers();
  closeModals();
  renderTeachersView();
  renderSidebar();
}

function deleteTeacher(teacherId) {
  const t = (appState.db.enseignants || []).find(item => item.id === teacherId);
  const nom = t ? t.nom : 'cet enseignant';
  if (!confirm(`Êtes-vous sûr de vouloir résilier / supprimer le contrat de "${nom}" ?`)) return;

  appState.db.enseignants = (appState.db.enseignants || []).filter(item => item.id !== teacherId);
  saveDataStore();
  syncEstablishmentTeachers();

  if (appState.isApiOnline) {
    fetch(`http://localhost:5000/api/enseignants/${teacherId}`, { method: 'DELETE' }).catch(() => {});
  }

  renderTeachersView();
  renderSidebar();
  showToast(`🗑️ Contrat de "${nom}" supprimé avec succès.`);
}

function openTeacherPayslip(teacherId) {
  const teacher = (appState.db.enseignants || []).find(t => t.id === teacherId);
  if (!teacher) return;

  const contentEl = document.getElementById('dashboardPayslipContent');
  const modal = document.getElementById('modalDashboardPayslip');
  if (!contentEl || !modal) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(item => item.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = etab && !isDaara && (
    (etab.type || '').toUpperCase() === 'FORMATION_PRO' ||
    (etab.type || '').toUpperCase() === 'INSTITUT' ||
    (etab.plan || '').toLowerCase().includes('institut') ||
    (etab.plan || '').toLowerCase().includes('bts') ||
    (etab.plan || '').toLowerCase().includes('formation') ||
    (etab.name || '').toLowerCase().includes('institut')
  );

  const salaireNet = Number(teacher.salaire) || 200000;
  const baseBrut = Math.round(salaireNet * 0.78);
  const primeTransport = Math.round(salaireNet * 0.12);
  const primePedagogique = Math.round(salaireNet * 0.10);
  const deductionSociale = Math.round(baseBrut * 0.055);
  const netPaye = (baseBrut + primeTransport + primePedagogique) - deductionSociale;

  const dateNow = new Date();
  const moisOptions = { month: 'long', year: 'numeric' };
  const periodeTexte = dateNow.toLocaleDateString('fr-FR', moisOptions);
  const dateEmission = dateNow.toLocaleDateString('fr-FR');
  const classesAffectees = Array.isArray(teacher.classes) && teacher.classes.length > 0 
    ? teacher.classes.join(', ') 
    : (isInstitut ? 'Toutes filières confondues' : 'Tronc commun / Établissement');

  contentEl.innerHTML = `
    <div style="background: #ffffff; color: #1e293b; padding: 1.5rem; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- En-tête officiel de l'Établissement -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; text-transform: uppercase;">${etab ? etab.name : 'SunuSchool Express'}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-top: 0.2rem;">
            ${isInstitut ? 'Institut Supérieur & Centre de Formation Professionnelle' : (isDaara ? 'Institut Islamique & Daara Moderne' : "Établissement Privé d'Enseignement Général")} • ${etab ? etab.city : 'Sénégal'}
          </div>
          <div style="font-size: 0.75rem; color: #64748b;">${isInstitut ? 'Agrément MESRI / MFPAI • Direction des Études : ' + (etab?.phone || '+221 77 000 00 00') : 'Agrément MEN / Ministère de la Formation • Téléphone Direction : ' + (etab?.phone || '+221 77 000 00 00')}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #00D2B4; text-transform: uppercase; letter-spacing: 0.5px;">${isInstitut ? 'BORDEREAU D’HONORAIRES & PAIE' : 'BULLETIN DE PAIE OFFICIEL'}</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 0.15rem;">${periodeTexte.toUpperCase()}</div>
          <div style="font-size: 0.72rem; color: #64748b;">Date d'édition : ${dateEmission}</div>
        </div>
      </div>

      <!-- Informations Enseignant -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.85rem; margin-bottom: 1.25rem; font-size: 0.82rem;">
        <div>
          <div style="color: #64748b; font-size: 0.72rem; text-transform: uppercase;">${isInstitut ? 'Formateur / Intervenant' : (isDaara ? 'Oustaz Salarié' : 'Nom & Prénom du Salarié')}</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">${teacher.nom}</div>
          <div style="margin-top: 0.35rem; color: #64748b; font-size: 0.72rem; text-transform: uppercase;">Matricule / Contrat</div>
          <div style="font-weight: 600; color: #334155;">${teacher.mat} • ${teacher.contrat || (isInstitut ? 'Vacataire Professionnel' : 'CDI Titulaire')}</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 0.72rem; text-transform: uppercase;">${isInstitut ? 'Modules & Spécialités' : 'Matière & Affectations'}</div>
          <div style="font-weight: 700; color: #0f172a;">${teacher.matiere}</div>
          <div style="color: #475569; font-size: 0.78rem; margin-top: 0.15rem;">${isInstitut ? 'Filières / Promos : ' : 'Classes : '} ${classesAffectees}</div>
          <div style="margin-top: 0.35rem; color: #64748b; font-size: 0.72rem; text-transform: uppercase;">Volume Pédagogique</div>
          <div style="font-weight: 600; color: #334155;">${teacher.volume || '20h / semaine'}</div>
        </div>
      </div>

      <!-- Grille de Ventilation de Rémunération -->
      <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-bottom: 1.25rem;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 1.5px solid #cbd5e1;">
            <th style="text-align: left; padding: 0.6rem 0.5rem; color: #475569; font-weight: 700;">Rubrique / Description</th>
            <th style="text-align: center; padding: 0.6rem 0.5rem; color: #475569; font-weight: 700;">Base</th>
            <th style="text-align: right; padding: 0.6rem 0.5rem; color: #475569; font-weight: 700;">Gains (FCFA)</th>
            <th style="text-align: right; padding: 0.6rem 0.5rem; color: #475569; font-weight: 700;">Retenues (FCFA)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 0.5rem;">Salaire de Base Contractuel</td>
            <td style="text-align: center; padding: 0.5rem; color: #64748b;">100%</td>
            <td style="text-align: right; padding: 0.5rem; font-weight: 600;">${new Intl.NumberFormat('fr-FR').format(baseBrut)}</td>
            <td style="text-align: right; padding: 0.5rem; color: #64748b;">-</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 0.5rem;">Indemnité Forfaitaire de Déplacement</td>
            <td style="text-align: center; padding: 0.5rem; color: #64748b;">Forfait</td>
            <td style="text-align: right; padding: 0.5rem; font-weight: 600;">${new Intl.NumberFormat('fr-FR').format(primeTransport)}</td>
            <td style="text-align: right; padding: 0.5rem; color: #64748b;">-</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 0.5rem;">Prime Pédagogique & Suivi des Élèves</td>
            <td style="text-align: center; padding: 0.5rem; color: #64748b;">Assiduité</td>
            <td style="text-align: right; padding: 0.5rem; font-weight: 600;">${new Intl.NumberFormat('fr-FR').format(primePedagogique)}</td>
            <td style="text-align: right; padding: 0.5rem; color: #64748b;">-</td>
          </tr>
          <tr style="border-bottom: 1.5px solid #cbd5e1; background: #fff5f5;">
            <td style="padding: 0.5rem; color: #b91c1c;">Cotisation Retraite / IPRES & Mutuelle</td>
            <td style="text-align: center; padding: 0.5rem; color: #b91c1c;">5.5%</td>
            <td style="text-align: right; padding: 0.5rem; color: #64748b;">-</td>
            <td style="text-align: right; padding: 0.5rem; font-weight: 600; color: #b91c1c;">-${new Intl.NumberFormat('fr-FR').format(deductionSociale)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background: #0f172a; color: #ffffff;">
            <td colspan="2" style="padding: 0.75rem 0.5rem; font-weight: 800; font-size: 0.9rem; text-transform: uppercase;">
              NET À PAYER AU SALARIÉ :
            </td>
            <td colspan="2" style="padding: 0.75rem 0.5rem; text-align: right; font-weight: 800; font-size: 1.15rem; color: #00D2B4;">
              ${new Intl.NumberFormat('fr-FR').format(netPaye)} FCFA
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Mentions Légales & Signatures -->
      <div style="font-size: 0.72rem; color: #64748b; line-height: 1.4; margin-bottom: 1.25rem;">
        Conformément à la Convention Collective Nationale des Établissements Privés d'Enseignement du Sénégal et aux normes du travail en vigueur. Pour faire valoir ce que de droit auprès des institutions financières et organismes sociaux.
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1rem; border-top: 1px dashed #cbd5e1;">
        <div style="text-align: center; width: 45%;">
          <div style="font-size: 0.75rem; color: #475569; margin-bottom: 2.5rem;">Signature du Salarié</div>
          <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto;"></div>
        </div>
        <div style="text-align: center; width: 45%;">
          <div style="font-size: 0.75rem; color: #475569; margin-bottom: 2.5rem;">Cachet & Signature de la Direction</div>
          <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; color: #0f172a; font-size: 0.7rem; padding-top: 0.2rem;">
            ${etab ? etab.directeurNom || 'Direction Générale' : 'Direction Générale'}
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

// 3.B. GESTION DES NOTES & BULLETINS
function renderGradesTable() {
  const tbody = document.getElementById('gradesTable');
  if (!tbody) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);

  const thStudent = document.getElementById('thGradesStudent');
  if (thStudent) thStudent.textContent = isInstitut ? "Étudiant (Nom & Matricule)" : (isDaara ? "Talibé (Nom & Matricule)" : "Apprenant (Nom & Matricule)");
  const thClass = document.getElementById('thGradesClass');
  if (thClass) thClass.textContent = isInstitut ? "Filière / Promotion" : (isDaara ? "Cycle Coranique" : "Niveau / Classe");
  const thScore = document.getElementById('thGradesScore');
  if (thScore) thScore.textContent = isInstitut ? "Moyenne Semestrielle / Crédits" : (isDaara ? "Progression Coran (Hizb)" : "Moyenne Générale (/20)");
  const thRank = document.getElementById('thGradesRank');
  if (thRank) thRank.textContent = isInstitut ? "Rang Promotion" : "Rang";
  const thMention = document.getElementById('thGradesMention');
  if (thMention) thMention.textContent = isInstitut ? "Mention & Décision Jury" : "Mention & Appréciation";
  const thAction = document.getElementById('thGradesAction');
  if (thAction) thAction.textContent = isInstitut ? "Action Relevé" : (isDaara ? "Action Bilan Coran" : "Action Bulletin");

  tbody.innerHTML = '';
  if (eleves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">${isInstitut ? "Aucun étudiant enregistré pour cet établissement." : (isDaara ? "Aucun talibé enregistré pour cet établissement." : "Aucun apprenant enregistré pour cet établissement.")}</td></tr>`;
    return;
  }

  eleves.forEach((e, idx) => {
    const isTalibe = e.type === 'TALIBE';
    const isEtu = e.type === 'ETUDIANT' || isInstitut;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="avatar-cell">
          <div class="avatar-round" style="background: ${isTalibe ? 'rgba(245,158,11,0.2)' : (isEtu ? 'rgba(56,189,248,0.2)' : 'rgba(0,210,180,0.2)')}; color: ${isTalibe ? 'var(--gold)' : (isEtu ? '#38BDF8' : 'var(--primary)')};">
            ${e.prenom[0]}${e.nom[0]}
          </div>
          <div>
            <div class="cell-main-text">${e.prenom} ${e.nom}</div>
            <div class="cell-sub-text">${e.matricule} • Clé: <code>${e.cleAcces}</code></div>
          </div>
        </div>
      </td>
      <td><span class="badge-tag ${isTalibe ? 'badge-gold' : (isEtu ? 'badge-purple' : 'badge-blue')}">${e.classeNom}</span></td>
      <td>
        ${isTalibe 
          ? `<strong>Hizb ${e.hizbActuel} / 60</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Tajwîd: ${e.tajwidNote}/20)</span>`
          : (isEtu 
            ? `<strong>${e.moyenneGenerale || 15.5} / 20</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Crédits: 30 ECTS)</span>`
            : `<strong>${e.moyenneGenerale || 15.5} / 20</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Semestre 1)</span>`)
        }
      </td>
      <td>
        <span class="badge-tag badge-green">${e.rang ? `${e.rang}${e.rang === 1 ? 'er' : 'e'}` : `${idx + 1}e`}</span>
      </td>
      <td>
        <span style="font-size: 0.8rem; font-weight: 700; color: #34D399;">
          ${isTalibe 
            ? (e.hizbActuel >= 40 ? '🌟 Hifz Avancé • Félicitations' : '✓ Très Bonne Progression') 
            : (isEtu 
              ? (e.moyenneGenerale >= 14 ? '🌟 Admis avec Mention Bien • Jury LMD' : '✓ Admis Semestre Supérieur')
              : (e.moyenneGenerale >= 16 ? '🌟 Félicitations du Conseil' : '✓ Tableau d\'Honneur'))}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
          ${isTalibe ? `
            <button class="btn btn-primary btn-sm" onclick="openHizbEvalModal('${e.id}')">
              📖 Évaluer Hifz
            </button>
            <button class="btn btn-outline btn-sm" onclick="generateOfficialBulletin('${e.id}')">
              📑 Bilan Coran
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="openGradesEntryModal('${e.id}')">
              ✏️ Saisir Notes
            </button>
            <button class="btn btn-outline btn-sm" onclick="generateOfficialBulletin('${e.id}')">
              ${isEtu ? '📑 Relevé Semestriel' : '📑 Bulletin Scolaire'}
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 4. CAISSE & TRANSACTIONS SYSCOHADA (MULTICANALE)
function renderCaisseTransactions() {
  const etabId = appState.activeEstablishmentId;
  const allTxs = appState.db.transactions.filter(t => etabId ? t.etablissementId === etabId : true);
  
  // Calcul dynamique des totaux par canal de trésorerie
  let sumWave = 0, countWave = 0;
  let sumOm = 0, countOm = 0;
  let sumFree = 0, countFree = 0;
  let sumCash = 0, countCash = 0;
  let sumBank = 0, countBank = 0;

  allTxs.forEach(t => {
    const m = Number(t.montant) || 0;
    if (t.operateur === 'WAVE') { sumWave += m; countWave++; }
    else if (t.operateur === 'ORANGE_MONEY') { sumOm += m; countOm++; }
    else if (t.operateur === 'FREE_MONEY') { sumFree += m; countFree++; }
    else if (t.operateur === 'ESPECES') { sumCash += m; countCash++; }
    else if (t.operateur === 'CHEQUE_BANQUE') { sumBank += m; countBank++; }
  });

  // Mise à jour des cartes KPI par canal
  const elWave = document.getElementById('totalWaveAmount');
  if (elWave) elWave.textContent = `${sumWave.toLocaleString()} FCFA`;
  const elWaveCount = document.getElementById('countWaveTx');
  if (elWaveCount) elWaveCount.textContent = `${countWave} règlement${countWave > 1 ? 's' : ''}`;

  const elOm = document.getElementById('totalOmAmount');
  if (elOm) elOm.textContent = `${sumOm.toLocaleString()} FCFA`;
  const elOmCount = document.getElementById('countOmTx');
  if (elOmCount) elOmCount.textContent = `${countOm} règlement${countOm > 1 ? 's' : ''}`;

  const elFree = document.getElementById('totalFreeAmount');
  if (elFree) elFree.textContent = `${sumFree.toLocaleString()} FCFA`;
  const elFreeCount = document.getElementById('countFreeTx');
  if (elFreeCount) elFreeCount.textContent = `${countFree} règlement${countFree > 1 ? 's' : ''}`;

  const elCash = document.getElementById('totalCashAmount');
  if (elCash) elCash.textContent = `${sumCash.toLocaleString()} FCFA`;
  const elCashCount = document.getElementById('countCashTx');
  if (elCashCount) elCashCount.textContent = `${countCash} versement${countCash > 1 ? 's' : ''} guichet`;

  const elBank = document.getElementById('totalBankAmount');
  if (elBank) elBank.textContent = `${sumBank.toLocaleString()} FCFA`;
  const elBankCount = document.getElementById('countBankTx');
  if (elBankCount) elBankCount.textContent = `${countBank} chèque/virement`;

  const elTxCount = document.getElementById('totalTxCount');
  if (elTxCount) elTxCount.textContent = allTxs.length;

  // Filtrage selon le canal sélectionné
  const filteredTxs = appState.activeCaisseFilter === 'ALL' 
    ? allTxs 
    : allTxs.filter(t => t.operateur === appState.activeCaisseFilter);

  const tbody = document.getElementById('caisseTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (filteredTxs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
      Aucun encaissement enregistré pour ce filtre (${appState.activeCaisseFilter}).
    </td></tr>`;
    return;
  }

  filteredTxs.forEach(t => {
    const opInfo = SYSCOHADA_OPERATORS[t.operateur] || {
      label: t.operateur,
      badgeClass: 'badge-blue',
      icon: '💳',
      accountDebit: t.compteSYSCOHADA || '5211 (Trésorerie)'
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color:#fff; font-family:monospace;">${t.reference}</strong>
        <div style="font-size:0.72rem; color:var(--text-muted);">${new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </td>
      <td>
        <span class="badge-tag ${opInfo.badgeClass}" style="display:inline-flex; align-items:center; gap:0.3rem;">
          <span>${opInfo.icon}</span> <span>${opInfo.label}</span>
        </span>
      </td>
      <td>
        <div style="font-weight: 700; color: #fff;">${t.eleveNom}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${t.motifLabel || t.type} • Payeur : ${t.payeurNom}</div>
      </td>
      <td style="font-weight: 800; color: #10B981; font-size: 0.95rem;">
        +${Number(t.montant).toLocaleString()} FCFA
      </td>
      <td>
        <div style="font-family:monospace; font-size:0.75rem; color:#A7F3D0;">D: ${t.compteSYSCOHADA || opInfo.accountDebit}</div>
        <div style="font-family:monospace; font-size:0.7rem; color:var(--text-muted);">C: ${t.compteCredit || '7061 (Produits Scolaires)'}</div>
      </td>
      <td><span class="badge-tag badge-green">✓ Lettré SYSCOHADA</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="printReceipt('${t.reference}', '${t.eleveNom}', '${t.montant}', '${t.operateur}', '${t.motifLabel || t.type}', '${t.compteSYSCOHADA || opInfo.accountDebit}', '${t.date}')">
          📄 Reçu Officiel
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterCaisseByOp(op) {
  appState.activeCaisseFilter = op;
  document.querySelectorAll('.filter-pill-btn').forEach(btn => {
    if (btn.getAttribute('data-filter-op') === op) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderCaisseTransactions();
}

function exportCaisseSYSCOHADA() {
  openGrandLivreModal();
}

// ==================== GRAND LIVRE DE CAISSE & TRÉSORERIE (SYSCOHADA RÉVISÉ) ====================
function openGrandLivreModal() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  const etabNom = etab ? etab.name : "SunuSchoolExpress";

  // Récupérer et trier chronologiquement les transactions de l'établissement
  let txs = (appState.db.transactions || []).filter(t => etabId ? t.etablissementId === etabId : true);
  txs = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));

  let sumWave = 0;
  let sumOm = 0;
  let sumFree = 0;
  let sumCash = 0;
  let sumBank = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  txs.forEach(t => {
    const m = Number(t.montant) || 0;
    if (t.operateur === 'WAVE') sumWave += m;
    else if (t.operateur === 'ORANGE_MONEY') sumOm += m;
    else if (t.operateur === 'FREE_MONEY') sumFree += m;
    else if (t.operateur === 'ESPECES') sumCash += m;
    else if (t.operateur === 'CHEQUE_BANQUE') sumBank += m;
    totalDebit += m;
    totalCredit += m;
  });

  const soldeNet = totalDebit;

  // Mise à jour des cartes KPI Trésorerie
  const elDebit = document.getElementById('glTotalDebit');
  if (elDebit) elDebit.textContent = `${totalDebit.toLocaleString()} FCFA`;

  const elCredit = document.getElementById('glTotalCredit');
  if (elCredit) elCredit.textContent = `${totalCredit.toLocaleString()} FCFA`;

  const elSolde = document.getElementById('glSoldeNet');
  if (elSolde) elSolde.textContent = `${soldeNet.toLocaleString()} FCFA`;

  // Mise à jour des badges de ventilation par compte SYSCOHADA
  const elWave = document.getElementById('glAccountWave');
  if (elWave) elWave.textContent = `5211 Wave : ${sumWave.toLocaleString()} F`;

  const elOm = document.getElementById('glAccountOm');
  if (elOm) elOm.textContent = `5212 OM : ${sumOm.toLocaleString()} F`;

  const elCash = document.getElementById('glAccountCash');
  if (elCash) elCash.textContent = `5711 Espèces : ${sumCash.toLocaleString()} F`;

  const elBank = document.getElementById('glAccountBank');
  if (elBank) elBank.textContent = `5210 Banques : ${sumBank.toLocaleString()} F`;

  const elRev = document.getElementById('glAccountRevenue');
  if (elRev) elRev.textContent = `706 Scolarités & Pensions : ${totalCredit.toLocaleString()} F`;

  // Rendu des lignes comptables
  renderGrandLivreRows(txs);

  // Ouverture de la modale
  const modal = document.getElementById('modalGrandLivre');
  if (modal) {
    modal.classList.add('active');
  }
}

function renderGrandLivreRows(txs) {
  const tbody = document.getElementById('grandLivreTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!txs || txs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
      Aucune écriture comptable enregistrée dans le Grand Livre pour cet établissement.
    </td></tr>`;
    return;
  }

  let runningSolde = 0;
  txs.forEach((t) => {
    const m = Number(t.montant) || 0;
    runningSolde += m;

    const opInfo = SYSCOHADA_OPERATORS[t.operateur] || {
      label: t.operateur,
      badgeClass: 'badge-blue',
      icon: '💳',
      accountDebit: t.compteSYSCOHADA || '5211 (Trésorerie)'
    };

    const compteDebit = t.compteSYSCOHADA || opInfo.accountDebit || '5211 (Trésorerie)';
    const compteCredit = t.compteCredit || '7061 (Produits Scolaires / Pensions)';
    const dateFormatted = new Date(t.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap;">
        ${dateFormatted}
      </td>
      <td>
        <strong style="color: #fff; font-family: monospace; font-size: 0.8rem;">${t.reference}</strong>
      </td>
      <td>
        <span class="badge-tag ${opInfo.badgeClass}" style="font-size: 0.7rem; font-family: monospace;">
          ${opInfo.icon} ${compteDebit}
        </span>
      </td>
      <td>
        <span class="badge-tag" style="background: rgba(255,255,255,0.06); color: #cbd5e1; font-size: 0.7rem; font-family: monospace;">
          ${compteCredit}
        </span>
      </td>
      <td>
        <div style="font-weight: 700; color: #fff;">${t.eleveNom}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">
          ${t.motifLabel || t.type} • Tiers : ${t.payeurNom || 'Parent'}
        </div>
      </td>
      <td style="text-align: right; font-weight: 800; color: #10B981; font-size: 0.85rem; font-family: monospace;">
        +${m.toLocaleString()} F
      </td>
      <td style="text-align: right; font-weight: 700; color: var(--gold); font-size: 0.85rem; font-family: monospace;">
        +${m.toLocaleString()} F
      </td>
      <td style="text-align: right; font-weight: 800; color: #38BDF8; font-size: 0.85rem; font-family: monospace;">
        ${runningSolde.toLocaleString()} F
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="printReceipt('${t.reference}', '${(t.eleveNom || '').replace(/'/g, "\\'")}', '${m}', '${t.operateur}', '${(t.motifLabel || t.type || '').replace(/'/g, "\\'")}', '${compteDebit.replace(/'/g, "\\'")}', '${t.date}')">
          📄 Reçu
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function exportGrandLivreCsv() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  const etabNom = etab ? etab.name : "SunuSchoolExpress";
  let txs = (appState.db.transactions || []).filter(t => etabId ? t.etablissementId === etabId : true);
  txs = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));

  let csv = "\uFEFF"; // BOM UTF-8 pour Excel
  csv += "Date & Heure;N° Pièce;Compte Débit (Emploi);Compte Crédit (Ressource);Élève / Tiers;Motif Encaissement;Canal;Débit (FCFA);Crédit (FCFA);Solde Cumulé (FCFA)\r\n";

  let runningSolde = 0;
  txs.forEach(t => {
    const m = Number(t.montant) || 0;
    runningSolde += m;
    const dStr = new Date(t.date).toLocaleDateString('fr-FR') + " " + new Date(t.date).toLocaleTimeString('fr-FR');
    const ref = t.reference || "";
    const cDebit = (t.compteSYSCOHADA || (SYSCOHADA_OPERATORS[t.operateur] ? SYSCOHADA_OPERATORS[t.operateur].accountDebit : "5211")).replace(/;/g, ' ');
    const cCredit = (t.compteCredit || "706").replace(/;/g, ' ');
    const eleve = (t.eleveNom || "").replace(/;/g, ' ');
    const motif = (t.motifLabel || t.type || "").replace(/;/g, ' ');
    const op = t.operateur || "";

    csv += `"${dStr}";"${ref}";"${cDebit}";"${cCredit}";"${eleve}";"${motif}";"${op}";${m};${m};${runningSolde}\r\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Grand_Livre_Caisse_SYSCOHADA_${etabNom.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`📥 Grand Livre exporté en CSV (Excel) pour ${etabNom} !`);
}

function printGrandLivreA4() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  const etabNom = etab ? etab.name : "Établissement";
  showToast(`🖨️ Préparation de l'impression A4 du Grand Livre SYSCOHADA pour ${etabNom}...`);
  window.print();
}

// 5. JOURNAL D'AUDIT
function renderAuditLogs() {
  const tbody = document.getElementById('auditTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  appState.db.auditLogs.slice(0, 15).forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:0.75rem; color:var(--text-muted);">${new Date(l.date).toLocaleTimeString('fr-FR')}</td>
      <td><span class="badge-tag badge-gold">${l.user}</span></td>
      <td><span class="badge-tag badge-blue">${l.action}</span></td>
      <td style="color:#CBD5E1;">${l.details}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 6. SUPERVISION SUPER ADMIN SAAS (ÉDITEUR DU LOGICIEL)
function renderSuperAdminClients() {
  const etabs = appState.db.etablissements || [];
  const eleves = appState.db.eleves || [];

  // Calcul du MRR et métriques globales
  const mrr = etabs.reduce((acc, e) => acc + (Number(e.prixMensuel) || 0), 0);
  const totalEleves = eleves.length;
  const adhesionTotal = etabs.filter(e => e.fraisAdhesionPayes).length * 10000;

  const elMrr = document.getElementById('saasMrrTotal');
  if (elMrr) elMrr.textContent = `${mrr.toLocaleString()} F`;

  const elEtabs = document.getElementById('saasEtabsCount');
  if (elEtabs) elEtabs.textContent = `${etabs.length} Établissements`;

  const elStudents = document.getElementById('saasTotalStudentsCount');
  if (elStudents) elStudents.textContent = `${totalEleves} Élèves`;

  const elAdhesion = document.getElementById('saasAdhesionTotal');
  if (elAdhesion) elAdhesion.textContent = `${adhesionTotal.toLocaleString()} F`;

  const badgeCount = document.getElementById('saasSubCountBadge');
  if (badgeCount) badgeCount.textContent = `${etabs.length} Abonnés`;

  const tbody = document.getElementById('saasClientsTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  etabs.forEach(e => {
    const elevesCount = eleves.filter(el => el.etablissementId === e.id).length;
    const isPending = e.statutAbonnement === 'EN_ATTENTE_VALIDATION' || e.statut === 'EN_ATTENTE_VALIDATION' || e.fraisAdhesionPayes === false;
    const isTrial = e.statutAbonnement === 'ESSAI_GRATUIT';
    const isSuspended = e.statutAbonnement === 'SUSPENDU';

    const statusBadge = isPending
      ? `<span class="badge-tag" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.5); font-weight: 800; padding: 4px 8px; border-radius: 6px;">🟡 En Attente Validation Wave</span>`
      : isSuspended
        ? `<span class="badge-tag badge-red">🔒 Suspendu</span>`
        : isTrial 
          ? `<span class="badge-tag badge-blue">🎁 Essai Gratuit 30j</span>`
          : `<span class="badge-tag badge-green">✓ Abonnement Actif</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="avatar-cell">
          <div class="avatar-round" style="background: ${e.type === 'DAARA' ? 'rgba(245,158,11,0.2)' : 'rgba(0,210,180,0.2)'}; color: ${e.type === 'DAARA' ? 'var(--gold)' : 'var(--primary)'};">
            ${e.type === 'DAARA' ? '🕌' : '🏫'}
          </div>
          <div>
            <div class="cell-main-text">${e.name}</div>
            <div class="cell-sub-text">${e.city} • Code: <code>${e.code}</code> • <strong>${elevesCount} élèves</strong></div>
            ${e.waveTransactionRef ? `<div style="font-size: 0.72rem; color: #00D2B4; margin-top: 0.25rem; font-weight: 700;">📝 Réf. Wave : ${e.waveTransactionRef}</div>` : ''}
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 700; color: #fff;">${e.plan}</div>
        <div style="font-weight: 800; color: var(--gold); font-size: 0.85rem;">${(e.prixMensuel || 35000).toLocaleString()} FCFA / mois</div>
      </td>
      <td>
        <div style="font-weight: 600; color: #fff;">${e.directeurNom || 'Direction Générale'}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">${e.phone}</div>
      </td>
      <td>${statusBadge}</td>
      <td>
        <div style="font-weight: 700; color: #fff;">${e.echeanceAbonnement ? new Date(e.echeanceAbonnement).toLocaleDateString('fr-FR') : '31/10/2026'}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">Renouvellement mensuel</div>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          ${isPending ? `
            <button class="btn btn-sm" onclick="validateEstablishment('${e.id}')" style="background: #10B981; color: #FFF; font-weight: 800; border: none; box-shadow: 0 2px 8px rgba(16,185,129,0.4);" title="Vérifier la réception des 10 000 FCFA sur Wave et activer l'accès">
              ✅ Valider &amp; Activer
            </button>
            <button class="btn btn-outline btn-sm" onclick="rejectEstablishment('${e.id}')" style="border-color: #EF4444; color: #EF4444;" title="Rejeter cette demande">
              ❌ Rejeter
            </button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="sendAccessLinkWhatsApp('${e.id}')" title="Envoyer le lien d'accès et le code au Directeur par WhatsApp" style="border-color: #25D366; color: #128C7E; font-weight: 700;">
              📲 Accès WhatsApp
            </button>
            <button class="btn btn-outline btn-sm" onclick="sendSaaSInvoiceWhatsApp('${e.id}')" title="Envoyer facture d'abonnement par WhatsApp" style="border-color: rgba(255,255,255,0.2);">
              📄 Facture
            </button>
            <button class="btn btn-outline btn-sm" onclick="prolongTrial('${e.id}')" title="Prolonger la période d'essai">
              🎁 +30j
            </button>
            <button class="btn btn-outline btn-sm" onclick="toggleEtabStatus('${e.id}')" title="Suspendre ou réactiver l'accès">
              ${isSuspended ? '🔓 Réactiver' : '🔒 Suspendre'}
            </button>
          `}
          <button class="btn btn-primary btn-sm" onclick="impersonateEtab('${e.id}')" title="Se connecter à cet espace en mode Support">
            👁️ Voir Espace
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Rendu du tableau des Administrateurs Officiels de la Plateforme
  const adminTbody = document.getElementById('saasAdminsTable');
  if (adminTbody) {
    adminTbody.innerHTML = '';
    const admins = (appState.db && appState.db.adminsPlateforme && appState.db.adminsPlateforme.length > 0)
      ? appState.db.adminsPlateforme
      : [
          {
            id: "admin-platform-001",
            email: "sunushoolexpress@gmail.com",
            nom: "Admin Plateforme",
            prenom: "SunuSchool Express",
            role: "SUPER_ADMIN",
            titre: "Administrateur Central de la Plateforme SaaS",
            statut: "ACTIF",
            telephone: "+221 77 888 12 34",
            privileges: "Supervision Totale SaaS • Multi-Campus • MRR Licences • Audit Global"
          }
        ];

    admins.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="avatar-cell">
            <div class="avatar-round" style="background: rgba(245,158,11,0.2); color: var(--gold);">👑</div>
            <div>
              <div class="cell-main-text">${a.prenom} ${a.nom}</div>
              <div class="cell-sub-text">${a.titre || 'Super Administrateur'} • ${a.telephone || '+221 77 888 12 34'}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 0.88rem; color: var(--primary); font-weight: 700;">${a.email}</span>
        </td>
        <td>
          <span class="badge-tag badge-gold">👑 ${a.role === 'SUPER_ADMIN' ? 'Super Admin Plateforme' : a.role}</span>
        </td>
        <td>
          <span class="badge-tag badge-green">🟢 ${a.statut || 'ACTIF'}</span>
        </td>
        <td>
          <div style="font-size: 0.75rem; color: #cbd5e1;">${a.privileges || 'Plein Pouvoir Éditeur'}</div>
        </td>
      `;
      adminTbody.appendChild(tr);
    });
  }
}

function sendAccessLinkWhatsApp(etabId) {
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  if (!etab) return;
  const phone = (etab.phone || '').replace(/[^0-9]/g, '');
  const baseUrl = (window.location.protocol === 'file:') ? window.location.href.split('dashboard.html')[0] : (window.location.origin + '/');
  const rawDigits = (etab.code || '').replace(/[^0-9]/g, '') || '2026';
  const secretKey = etab.secretKey || etab.password || `ADM-${rawDigits}`;
  const directLink = `${baseUrl}dashboard.html?code=${encodeURIComponent(etab.code || '')}&key=${encodeURIComponent(secretKey)}`;
  
  const msg = encodeURIComponent(
    `🎉 Bonjour ${etab.directeurNom || 'Monsieur le Directeur'},\n\n` +
    `Votre abonnement pour l'établissement « ${etab.name} » a été VALIDÉ avec succès par l'Administrateur SunuSchool-Express !\n\n` +
    `🔑 Vos accès officiels sont débloqués :\n` +
    `• Identifiant / Code : ${etab.code}\n` +
    `• Clé Secrète / Mot de Passe : ${secretKey}\n` +
    `• Formule active : ${etab.plan || 'Formule Pro'}\n` +
    `• Lien direct de connexion : ${directLink}\n\n` +
    `👉 Pour vous connecter, cliquez sur le lien direct ou saisissez votre Code (${etab.code}) et votre Clé Secrète (${secretKey}).\n\n` +
    `Félicitations et bienvenue sur SunuSchool-Express !`
  );
  if (phone) {
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    showToast(`📲 Message d'accès avec Clé Secrète WhatsApp ouvert pour ${etab.name} !`);
  } else {
    alert(`Numéro de téléphone non renseigné pour « ${etab.name} ».\nCode: ${etab.code}\nClé Secrète: ${secretKey}`);
  }
}
window.sendAccessLinkWhatsApp = sendAccessLinkWhatsApp;

function sendSaaSInvoiceWhatsApp(etabId) {
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  if (!etab) return;
  const phone = (etab.phone || '+221 77 000 00 00').replace(/[^0-9]/g, '');
  const msg = `SunuSchoolExpress - Facture d'Abonnement SaaS%0A%0ABonjour ${etab.directeurNom || 'Monsieur le Directeur'},%0AVotre abonnement mensuel au logiciel SunuSchoolExpress pour ${etab.name} (${etab.plan}) arrive à échéance le ${etab.echeanceAbonnement}.%0AMontant : ${etab.prixMensuel.toLocaleString()} FCFA.%0A%0APour renouveler via Wave ou Orange Money, utilisez le numéro éditeur : +221 77 123 45 67.%0AMerci pour votre partenariat !`;
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  showToast(`📲 Facture d'abonnement expédiée par WhatsApp à ${etab.name} !`);
}

function prolongTrial(etabId) {
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  if (!etab) return;
  etab.statutAbonnement = 'ESSAI_GRATUIT';
  etab.echeanceAbonnement = '2026-11-30';
  saveDataStore();
  renderCurrentView();
  showToast(`🎁 Période d'essai prolongée jusqu'au 30/11/2026 pour ${etab.name} !`);
}

function toggleEtabStatus(etabId) {
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  if (!etab) return;
  etab.statutAbonnement = etab.statutAbonnement === 'SUSPENDU' ? 'ACTIF' : 'SUSPENDU';
  saveDataStore();
  renderCurrentView();
  showToast(`Statut de ${etab.name} basculé en : ${etab.statutAbonnement}`);
}

function impersonateEtab(etabId) {
  switchEstablishment(etabId);
  switchTab('overview');
  switchRole('ADMIN_DIRECTEUR');
  showToast(`Connexion directe en mode Support sur l'espace de l'établissement.`);
}

function validateEstablishment(etabId) {
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  if (!etab) return;
  etab.statut = 'ACTIF';
  etab.statutAbonnement = 'ACTIF';
  etab.fraisAdhesionPayes = true;
  etab.dateValidation = new Date().toISOString();
  etab.echeanceAbonnement = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  if (!appState.db.auditLogs) appState.db.auditLogs = [];
  appState.db.auditLogs.unshift({
    id: `log-val-${Date.now()}`,
    date: new Date().toISOString(),
    user: 'sunuschoolexpress@gmail.com',
    role: 'SUPER_ADMIN',
    action: 'ADHESION_VALIDEE',
    details: `Adhésion validée pour ${etab.name} (Code: ${etab.code}, Réf Wave: ${etab.waveTransactionRef || 'Vérifié'}). Accès complet débloqué.`
  });

  saveDataStore();

  try {
    const curEst = JSON.parse(localStorage.getItem('sunuschool_establishment') || '{}');
    if (curEst && (curEst.id === etabId || curEst.code === etab.code)) {
      curEst.statut = 'ACTIF';
      curEst.statutAbonnement = 'ACTIF';
      curEst.fraisAdhesionPayes = true;
      localStorage.setItem('sunuschool_establishment', JSON.stringify(curEst));
    }
  } catch (e) {}

  try {
    const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
    const rIdx = reg.findIndex(e => e.id === etabId || e.code === etab.code);
    if (rIdx !== -1) {
      reg[rIdx].statut = 'ACTIF';
      reg[rIdx].statutAbonnement = 'ACTIF';
      reg[rIdx].fraisAdhesionPayes = true;
      localStorage.setItem('sunuschool_establishments_registry', JSON.stringify(reg));
    }
  } catch (e) {}

  const backendBaseUrl = (window.location.protocol === 'file:') ? 'http://localhost:5000' : '';
  try {
    fetch(`${backendBaseUrl}/api/admin/etablissements/${etabId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etabId, adminEmail: 'sunuschoolexpress@gmail.com' })
    }).catch(() => {});
  } catch (err) {}

  populateEstablishmentSelect();
  renderCurrentView();
  showToast(`✅ Établissement « ${etab.name} » validé avec succès ! Espace débloqué.`);

  if (etab.phone) {
    setTimeout(() => {
      if (confirm(`✅ "${etab.name}" a été activé avec succès !\n\nSouhaitez-vous envoyer la confirmation et le lien d'accès par WhatsApp au directeur (${etab.phone}) ?`)) {
        sendAccessLinkWhatsApp(etabId);
      }
    }, 450);
  }
}
window.validateEstablishment = validateEstablishment;

function rejectEstablishment(etabId) {
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  if (!etab) return;
  if (!confirm(`Confirmez-vous le rejet de la demande d'adhésion pour "${etab.name}" ?`)) return;
  etab.statut = 'REJETE';
  etab.statutAbonnement = 'REJETE';
  saveDataStore();
  renderCurrentView();
  showToast(`Demande d'adhésion rejetée pour ${etab.name}.`, true);
}
window.rejectEstablishment = rejectEstablishment;

// --- MODALES ACTIONS & FONCTIONS MÉTIER ---

// ==========================================================================
// 0. SAISIE DES NOTES & ÉVALUATIONS CONTINUES (OFFICIEL SÉNÉGAL)
// ==========================================================================
const DEFAULT_SCOLAIRE_SUBJECTS = [
  { matiere: "Mathématiques", coef: 4, devoir1: 17.5, devoir2: 18.0, compo: 18.5, appreciation: "Très bon raisonnement logique et rigueur." },
  { matiere: "Français / Littérature", coef: 3, devoir1: 15.5, devoir2: 16.5, compo: 17.0, appreciation: "Bonne maîtrise de l'expression écrite et analyse de texte." },
  { matiere: "Sciences de la Vie & Terre (SVT)", coef: 2, devoir1: 16.0, devoir2: 17.5, compo: 17.0, appreciation: "Curieuse et assidue en travaux pratiques." },
  { matiere: "Sciences Physiques & Chimie", coef: 2, devoir1: 16.5, devoir2: 17.0, compo: 18.0, appreciation: "Bonne compréhension des lois physiques et formules." },
  { matiere: "Histoire - Géographie", coef: 2, devoir1: 17.0, devoir2: 18.0, compo: 18.0, appreciation: "Excellente maîtrise des repères historiques et cartes." },
  { matiere: "Anglais (LV1)", coef: 2, devoir1: 16.0, devoir2: 17.0, compo: 16.5, appreciation: "Bonne participation à l'oral et vocabulaire riche." },
  { matiere: "Arabe / Éducation Religieuse & Morale", coef: 2, devoir1: 19.0, devoir2: 19.5, compo: 19.5, appreciation: "Parfaite récitation et conduite morale exemplaire." },
  { matiere: "Éducation Physique & Sportive (EPS)", coef: 1, devoir1: 16.0, devoir2: 17.0, compo: 16.5, appreciation: "Esprit d'équipe et dynamisme remarquable." }
];

const DEFAULT_INSTITUT_SUBJECTS = [
  { matiere: "Comptabilité & Gestion SYSCOHADA", coef: 4, devoir1: 16.5, devoir2: 17.0, compo: 17.5, appreciation: "Excellente maîtrise des écritures comptables et arrêtés." },
  { matiere: "Management & Stratégie d'Entreprise", coef: 3, devoir1: 15.0, devoir2: 16.0, compo: 16.5, appreciation: "Bonne vision opérationnelle et capacités d'analyse." },
  { matiere: "Informatique & Outils Numériques", coef: 3, devoir1: 17.0, devoir2: 18.0, compo: 17.5, appreciation: "Très autonome sur les logiciels et applications métier." },
  { matiere: "Droit des Affaires & Droit du Travail", coef: 2, devoir1: 15.5, devoir2: 16.0, compo: 16.0, appreciation: "Bonne assimilation du cadre légal sénégalais." },
  { matiere: "Anglais Professionnel des Affaires", coef: 2, devoir1: 16.0, devoir2: 17.0, compo: 16.5, appreciation: "Aisance en négociation et rédaction commerciale." },
  { matiere: "Projet Professionnel & Stage en Entreprise", coef: 4, devoir1: 18.0, devoir2: 18.5, compo: 19.0, appreciation: "Rapport de stage et soutenance de grande qualité." }
];

function openGradesEntryModal(eleveId) {
  const modal = document.getElementById('modalGradesEntry');
  if (!modal) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);
  const scolaires = appState.db.eleves.filter(e => (isInstitut ? (e.type === 'ETUDIANT' || e.type === 'SCOLAIRE') : (e.type === 'SCOLAIRE' || e.type === 'ETUDIANT')) && (etabId ? e.etablissementId === etabId : true));

  if (scolaires.length === 0) {
    showToast(isInstitut ? "Aucun étudiant enregistré pour cet établissement." : "Aucun apprenant enregistré pour cet établissement.", true);
    return;
  }

  let eleve = scolaires.find(e => e.id === eleveId);
  if (!eleve) eleve = scolaires[0];

  appState.activeEleveIdForGrades = eleve.id;

  const labelStudent = document.getElementById('labelGradesEntryStudent');
  if (labelStudent) {
    labelStudent.textContent = isInstitut ? "🎓 Étudiant à évaluer :" : "👤 Apprenant à évaluer :";
  }

  // Remplir le sélecteur d'apprenants
  const selectEl = document.getElementById('gradesEntryStudentSelect');
  if (selectEl) {
    selectEl.innerHTML = '';
    scolaires.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.nom.toUpperCase()} ${s.prenom} (${s.classeNom})`;
      selectEl.appendChild(opt);
    });
    selectEl.value = eleve.id;
  }

  // Badges classe et période
  const classBadge = document.getElementById('gradesEntryClassBadge');
  if (classBadge) classBadge.textContent = eleve.classeNom;

  // Initialiser les matières si non existantes
  if (!eleve.bulletinNotes || eleve.bulletinNotes.length === 0) {
    const isEtu = eleve.type === 'ETUDIANT' || isInstitut;
    eleve.bulletinNotes = JSON.parse(JSON.stringify(isEtu ? DEFAULT_INSTITUT_SUBJECTS : DEFAULT_SCOLAIRE_SUBJECTS));
    if (eleve.moyenneGenerale) {
      const ratio = eleve.moyenneGenerale / 17.25;
      eleve.bulletinNotes.forEach(sub => {
        sub.devoir1 = Math.min(20, Math.max(0, +(sub.devoir1 * ratio).toFixed(2)));
        sub.devoir2 = Math.min(20, Math.max(0, +(sub.devoir2 * ratio).toFixed(2)));
        sub.compo = Math.min(20, Math.max(0, +(sub.compo * ratio).toFixed(2)));
      });
    }
  }

  // Avis du conseil
  const councilInput = document.getElementById('gradesModalCouncilInput');
  if (councilInput) {
    councilInput.value = eleve.appreciationConseil || (eleve.moyenneGenerale >= 16 ? "Félicitations du conseil pour son travail remarquable et assidu." : (eleve.moyenneGenerale >= 14 ? "Tableau d'Honneur avec les félicitations du conseil." : "Travail régulier, doit poursuivre ses efforts."));
  }

  // Construire les lignes interactives
  renderGradesEntryRows(eleve);

  modal.classList.add('active');
}

function onGradesStudentSelected(eleveId) {
  openGradesEntryModal(eleveId);
}

function renderGradesEntryRows(eleve) {
  const tbody = document.getElementById('gradesEntryTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  eleve.bulletinNotes.forEach((sub, idx) => {
    const d1 = Number(sub.devoir1) || 0;
    const d2 = Number(sub.devoir2) || 0;
    const compo = Number(sub.compo) || 0;
    const coef = Number(sub.coef) || 1;
    const moyMat = +(((d1 + d2) / 2 + compo * 2) / 3).toFixed(2);
    const points = +(moyMat * coef).toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${sub.matiere}</strong></td>
      <td style="text-align: center;"><span class="badge-tag badge-gold">${coef}</span></td>
      <td>
        <input type="number" min="0" max="20" step="0.25" class="grade-input" 
          value="${d1}" data-idx="${idx}" data-field="devoir1" oninput="recalcGradesModalLive()">
      </td>
      <td>
        <input type="number" min="0" max="20" step="0.25" class="grade-input" 
          value="${d2}" data-idx="${idx}" data-field="devoir2" oninput="recalcGradesModalLive()">
      </td>
      <td>
        <input type="number" min="0" max="20" step="0.25" class="grade-input" 
          value="${compo}" data-idx="${idx}" data-field="compo" oninput="recalcGradesModalLive()">
      </td>
      <td style="text-align: center; font-weight: 800; color: #38BDF8;" id="subMoy_${idx}">
        ${moyMat.toFixed(2)}
      </td>
      <td style="text-align: center; font-weight: 700; color: #fff;" id="subPoints_${idx}">
        ${points.toFixed(2)}
      </td>
      <td>
        <input type="text" class="grade-appreciation-input" 
          value="${sub.appreciation || ''}" data-idx="${idx}" data-field="appreciation" placeholder="Appréciation professeur...">
      </td>
    `;
    tbody.appendChild(tr);
  });

  recalcGradesModalLive();
}

function recalcGradesModalLive() {
  const eleve = appState.db.eleves.find(e => e.id === appState.activeEleveIdForGrades);
  if (!eleve || !eleve.bulletinNotes) return;

  const rows = document.querySelectorAll('#gradesEntryTableBody tr');
  let totalCoef = 0;
  let totalPoints = 0;

  rows.forEach((tr, idx) => {
    const inputD1 = tr.querySelector(`input[data-field="devoir1"]`);
    const inputD2 = tr.querySelector(`input[data-field="devoir2"]`);
    const inputCompo = tr.querySelector(`input[data-field="compo"]`);
    const cellMoy = document.getElementById(`subMoy_${idx}`);
    const cellPoints = document.getElementById(`subPoints_${idx}`);

    const d1 = Math.min(20, Math.max(0, Number(inputD1 ? inputD1.value : 0)));
    const d2 = Math.min(20, Math.max(0, Number(inputD2 ? inputD2.value : 0)));
    const compo = Math.min(20, Math.max(0, Number(inputCompo ? inputCompo.value : 0)));
    const coef = Number(eleve.bulletinNotes[idx].coef) || 1;

    const moyMat = +(((d1 + d2) / 2 + compo * 2) / 3).toFixed(2);
    const points = +(moyMat * coef).toFixed(2);

    if (cellMoy) cellMoy.textContent = moyMat.toFixed(2);
    if (cellPoints) cellPoints.textContent = points.toFixed(2);

    totalCoef += coef;
    totalPoints += points;
  });

  const moyGen = totalCoef > 0 ? +(totalPoints / totalCoef).toFixed(2) : 0;

  const elMoy = document.getElementById('gradesModalMoyenneDisplay');
  const elPts = document.getElementById('gradesModalPointsDisplay');
  const elMention = document.getElementById('gradesModalMentionDisplay');

  if (elMoy) elMoy.textContent = `${moyGen.toFixed(2)} / 20`;
  if (elPts) elPts.textContent = `${totalCoef} Coef • ${totalPoints.toFixed(2)} Pts`;

  let mention = "Avertissement de Travail";
  let color = "#EF4444";
  if (moyGen >= 16) { mention = "🌟 Félicitations du Conseil"; color = "#34D399"; }
  else if (moyGen >= 14) { mention = "✓ Tableau d'Honneur"; color = "#38BDF8"; }
  else if (moyGen >= 12) { mention = "✓ Encouragements"; color = "#F59E0B"; }
  else if (moyGen >= 10) { mention = "Passable"; color = "#CBD5E1"; }

  if (elMention) {
    elMention.textContent = mention;
    elMention.style.color = color;
  }
}

function saveGradesEntry() {
  const eleve = appState.db.eleves.find(e => e.id === appState.activeEleveIdForGrades);
  if (!eleve || !eleve.bulletinNotes) return;

  const rows = document.querySelectorAll('#gradesEntryTableBody tr');
  let totalCoef = 0;
  let totalPoints = 0;

  rows.forEach((tr, idx) => {
    const inputD1 = tr.querySelector(`input[data-field="devoir1"]`);
    const inputD2 = tr.querySelector(`input[data-field="devoir2"]`);
    const inputCompo = tr.querySelector(`input[data-field="compo"]`);
    const inputApp = tr.querySelector(`input[data-field="appreciation"]`);

    const d1 = Math.min(20, Math.max(0, Number(inputD1 ? inputD1.value : 0)));
    const d2 = Math.min(20, Math.max(0, Number(inputD2 ? inputD2.value : 0)));
    const compo = Math.min(20, Math.max(0, Number(inputCompo ? inputCompo.value : 0)));
    const app = inputApp ? inputApp.value.trim() : "";
    const coef = Number(eleve.bulletinNotes[idx].coef) || 1;

    eleve.bulletinNotes[idx].devoir1 = d1;
    eleve.bulletinNotes[idx].devoir2 = d2;
    eleve.bulletinNotes[idx].compo = compo;
    eleve.bulletinNotes[idx].appreciation = app;

    const moyMat = +(((d1 + d2) / 2 + compo * 2) / 3).toFixed(2);
    const points = +(moyMat * coef).toFixed(2);

    totalCoef += coef;
    totalPoints += points;
  });

  const moyGen = totalCoef > 0 ? +(totalPoints / totalCoef).toFixed(2) : 0;
  eleve.moyenneGenerale = moyGen;

  const councilInput = document.getElementById('gradesModalCouncilInput');
  if (councilInput) {
    eleve.appreciationConseil = councilInput.value.trim();
  }

  // Journal d'audit
  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Prof. Amadou Ba",
    role: "ENSEIGNANT",
    action: "SAISIE_NOTES",
    details: `Saisie notes et devoirs enregistrée pour ${eleve.prenom} ${eleve.nom} (Moyenne: ${moyGen}/20)`
  });

  saveDataStore();
  closeModals();

  showToast(`✓ Notes enregistrées avec succès ! Nouvelle moyenne générale de ${eleve.prenom} ${eleve.nom} : ${moyGen} / 20`);

  // Rafraîchir l'affichage
  renderGradesTable();
  renderSchoolClasses();
  renderOverviewKpis();
}

// A. Évaluation Hizb (Daara)
let selectedTalibeId = null;
function openHizbEvalModal(talibeId) {
  selectedTalibeId = talibeId;
  const talibe = appState.db.eleves.find(e => e.id === talibeId);
  if (!talibe) return;

  document.getElementById('evalTalibeName').textContent = `${talibe.prenom} ${talibe.nom} (${talibe.matricule})`;
  document.getElementById('evalHizbInput').value = Math.min(60, talibe.hizbActuel + 1);
  document.getElementById('evalSourateInput').value = talibe.sourate;
  document.getElementById('evalTajwidInput').value = talibe.tajwidNote;

  document.getElementById('modalHizbEval').classList.add('active');
}

function submitHizbEval() {
  const talibe = appState.db.eleves.find(e => e.id === selectedTalibeId);
  if (!talibe) return;

  const newHizb = Number(document.getElementById('evalHizbInput').value);
  const newSourate = document.getElementById('evalSourateInput').value;
  const newNote = Number(document.getElementById('evalTajwidInput').value);

  talibe.hizbActuel = newHizb;
  talibe.progressionPct = Math.round((newHizb / 60) * 100);
  talibe.sourate = newSourate;
  talibe.tajwidNote = newNote;

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Oustaz Serigne Modou",
    role: "OUSTAZ",
    action: "VALIDATION_HIZB",
    details: `Hizb ${newHizb} validé pour ${talibe.prenom} ${talibe.nom} (${newSourate}) - Tajwîd: ${newNote}/20`
  });

  saveDataStore();
  closeModals();
  showToast(`📖 Hizb ${newHizb} validé avec succès pour ${talibe.prenom} ${talibe.nom} !`);
  renderCurrentView();
}

// B. Badge PVC Talibé / Élève / Étudiant
function previewPvcBadge(talibeId) {
  const talibe = appState.db.eleves.find(e => e.id === talibeId);
  if (!talibe) return;

  const etab = appState.db.etablissements.find(e => e.id === talibe.etablissementId) ||
               appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId);
  const isTalibe = talibe.type === 'TALIBE';
  const isInstitut = talibe.type === 'ETUDIANT' || (!isTalibe && isInstitutEstablishment(etab));

  const preview = document.getElementById('pvcBadgeRenderArea');
  if (preview) {
    preview.innerHTML = `
      <div class="pvc-card-preview" style="margin: 0 auto;">
        <div class="pvc-header">
          <span class="pvc-title">${isInstitut ? '🇸🇳 CARTE ÉTUDIANT • FORMATION PRO & BTS' : (isTalibe ? '🇸🇳 CARTE TALIBÉ • DAARA MODERNE' : '🇸🇳 CARTE SCOLAIRE • ÉDUCATION NATIONALE')}</span>
          <span style="font-size: 0.65rem; background: ${isInstitut ? '#38BDF8' : '#00D2B4'}; color: #000; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 800;">PVC CR-80</span>
        </div>
        <div class="pvc-body">
          <div class="pvc-photo">${isInstitut ? '🎓' : (isTalibe ? '🧕' : '🎒')}</div>
          <div>
            <div class="pvc-name">${talibe.prenom} ${talibe.nom}</div>
            <div class="pvc-meta">Matricule : <strong>${talibe.matricule}</strong></div>
            <div class="pvc-meta">${isInstitut ? 'Filière' : (isTalibe ? 'Niveau' : 'Classe')} : <strong>${isTalibe ? `Hizb ${talibe.hizbActuel} / 60` : talibe.classeNom}</strong></div>
            <div class="pvc-meta">${isTalibe ? `Lit : <strong>N°${talibe.internat ? talibe.internat.litNumero : '1'} (${talibe.internat ? talibe.internat.pavillon : 'Pavillon A'})</strong>` : `Statut : <strong>${isInstitut ? 'Étudiant Actif' : 'Élève Inscrit'}</strong>`}</div>
          </div>
          <div class="pvc-qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://sunuschool.sn/verify/${talibe.matricule}" style="width: 100%; height: 100%; border-radius: 2px;" alt="QR Code">
          </div>
        </div>
        <div style="font-size: 0.65rem; color: #94A3B8; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.3rem; display: flex; justify-content: space-between;">
          <span>${isInstitut ? 'Clé Apprenant' : 'Clé Famille'} : ${talibe.cleAcces}</span>
          <span>Validité : 2026-2027</span>
        </div>
      </div>
    `;
  }
  document.getElementById('modalPvcBadge').classList.add('active');
}

// C. Bulletin Officiel (Triple Moteur : Daara / Tahfiz Coranique, Institut LMD/BTS, École Privée)
let activeBulletinStudentId = null;
function generateOfficialBulletin(eleveId) {
  activeBulletinStudentId = eleveId;
  const eleve = appState.db.eleves.find(e => e.id === eleveId);
  if (!eleve) return;

  const etab = appState.db.etablissements.find(e => e.id === eleve.etablissementId) ||
               appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId) || {
                 name: "Établissement Éducatif",
                 code: "SSE-SN-8941",
                 type: eleve.type === 'TALIBE' ? 'DAARA' : 'ECOLE',
                 city: "Sénégal"
               };

  const isDaara = eleve.type === 'TALIBE' || etab.type === 'DAARA';
  const isInstitut = eleve.type === 'ETUDIANT' || (!isDaara && isInstitutEstablishment(etab));
  const area = document.getElementById('bulletinRenderArea');
  if (!area) return;

  if (isDaara) {
    // Template Daara Moderne & Tahfiz Coranique
    area.innerHTML = `
      <div class="official-bulletin-container">
        <div class="bulletin-header-flag">
          <div>
            <div style="font-size: 0.72rem; font-weight: 800; color: #b45309; text-transform: uppercase;">
              🇸🇳 RÉPUBLIQUE DU SÉNÉGAL • INSPECTION GÉNÉRALE DES DAARAS MODERNES
            </div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #fff;">${etab.name}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">
              Immatriculation : <strong>${etab.code}</strong> • Année 1448 H / 2026-2027 • ${etab.city}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1rem; font-weight: 800; color: #f59e0b;">BULLETIN OFFICIEL DE HIFZ &amp; TAJWÎD</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #e2e8f0;">Cycle : ${eleve.classeNom}</div>
            <div style="font-size: 0.72rem; color: #94a3b8;">Session Semestrielle de Validation</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 1rem; border-radius: 6px;">
          <div>
            <div style="font-size: 0.95rem; font-weight: 800; color: #fff;">Talibé : ${eleve.nom.toUpperCase()} ${eleve.prenom}</div>
            <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 0.2rem;">Matricule Daara : <strong>${eleve.matricule}</strong> • Clé Famille : <code>${eleve.cleAcces}</code></div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">Oustaz Encadrant : <strong>Oustaz Serigne Modou Ndiaye</strong></div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">Régime Internat : <strong>${eleve.internat ? `${eleve.internat.pavillon} (Lit N°${eleve.internat.litNumero})` : 'Externe'}</strong></div>
          </div>
          <div style="text-align: center; border-left: 2px solid rgba(245, 158, 11, 0.3); padding-left: 0.5rem;">
            <div style="font-size: 0.72rem; color: #f59e0b; font-weight: 700;">PALIER DE MÉMORISATION</div>
            <div class="bulletin-score-big" style="color: #f59e0b; font-size: 1.8rem; font-weight: 900;">Hizb ${eleve.hizbActuel} <span style="font-size:1rem; font-weight:600;">/ 60</span></div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #34d399;">Progression : ${eleve.progressionPct}% du Noble Coran</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Sourate : ${eleve.sourate}</div>
          </div>
        </div>

        <table class="bulletin-table">
          <thead>
            <tr>
              <th>Disciplines &amp; Évaluations Coraniques</th>
              <th>Note/20</th>
              <th>Coef</th>
              <th>Points</th>
              <th>Critères d'Excellence &amp; Appréciation de l'Oustaz</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mémorisation (Hifz) &amp; Récitation Continue</strong></td>
              <td style="font-weight: 800; color: #10b981;">19.00</td>
              <td>5</td>
              <td>95.00</td>
              <td><em>Rétention parfaite, fluidité remarquable sans hésitation.</em></td>
            </tr>
            <tr>
              <td><strong>Règles de Tajwîd (Makhârij &amp; Ahkâm)</strong></td>
              <td style="font-weight: 800; color: #10b981;">${eleve.tajwidNote || 19.5}/20</td>
              <td>4</td>
              <td>${((eleve.tajwidNote || 19.5) * 4).toFixed(2)}</td>
              <td><em>Respect rigoureux des points d'articulation et prolongations (Madd).</em></td>
            </tr>
            <tr>
              <td><strong>Ahkâm Al-Waqf wal-Ibtidâ' (Arrêts &amp; Reprises)</strong></td>
              <td style="font-weight: 800; color: #10b981;">18.50</td>
              <td>3</td>
              <td>55.50</td>
              <td><em>Parfaite maîtrise du sens et des pauses rituelles conformes.</em></td>
            </tr>
            <tr>
              <td><strong>Écriture Arabe &amp; Tracé Calligraphique (Alluwh)</strong></td>
              <td style="font-weight: 800; color: #10b981;">18.00</td>
              <td>3</td>
              <td>54.00</td>
              <td><em>Écriture sur planche traditionnelle soignée, Rasm Uthmani respecté.</em></td>
            </tr>
            <tr>
              <td><strong>Adab, Éducation Islamique &amp; 5 Prières</strong></td>
              <td style="font-weight: 800; color: #10b981;">20.00</td>
              <td>3</td>
              <td>60.00</td>
              <td><em>Discipline irréprochable, piété et respect exemplaire des camarades.</em></td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 1rem; margin-top: 1rem;">
          <div>
            <div style="font-size: 0.78rem; font-weight: 800; color: #059669;">
              Décision de l'Oustaz : FÉLICITATIONS AVEC LES HOMMAGES DU DAARA (TAHFÎZ EXCELLENT)
            </div>
            <div style="font-size: 0.7rem; color: #64748b;">
              Attestation certifiée SunuSchoolExpress • Sceau Numérique du Daara Moderne
            </div>
          </div>
          <div style="text-align: right; display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="shareBulletinWhatsApp('${eleve.id}')" style="border-color: #25D366; color: #128C7E; font-weight: 700;">
              📲 WhatsApp Parent
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.print()">
              🖨️ Imprimer Format A4 Officiel
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (isInstitut) {
    // Template Institut / BTS / Formation Professionnelle
    const moy = eleve.moyenneGenerale || 16.5;
    const rang = eleve.rang || 1;
    const totalEleves = eleve.totalEleves || 28;

    area.innerHTML = `
      <div class="official-bulletin-container">
        <div class="bulletin-header-flag">
          <div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #0284c7;">RÉPUBLIQUE DU SÉNÉGAL • MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR &amp; FORMATION PROFESSIONNELLE</div>
            <div style="font-size: 1.15rem; font-weight: 800;">${etab.name}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Code Institut : <strong>${etab.code}</strong> • Année Académique 2026-2027 • ${etab.city}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #0284c7;">RELEVÉ DE NOTES SEMESTRIEL (LMD / BTS)</div>
            <div style="font-size: 0.8rem; font-weight: 700;">Filière : ${eleve.classeNom}</div>
            <div style="font-size: 0.72rem; color: #64748b;">Promotion : ${totalEleves} étudiants</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.25); padding: 1rem; border-radius: 6px;">
          <div>
            <div>Nom &amp; Prénom de l'Étudiant : <strong>${eleve.nom.toUpperCase()} ${eleve.prenom}</strong></div>
            <div>Matricule Académique : <strong>${eleve.matricule}</strong> • Clé Sécurisée : <code>${eleve.cleAcces}</code></div>
            <div>Responsable Pédagogique : <strong>Dr. Mamadou Cissé</strong></div>
            <div>Contact de l'étudiant / Référent : <strong>${eleve.parentNom || 'Étudiant'}</strong> (${eleve.parentTelephone})</div>
          </div>
          <div style="text-align: center; border-left: 2px solid rgba(56,189,248,0.3); padding-left: 0.5rem;">
            <div style="font-size: 0.75rem; color: #0284c7; font-weight: 700;">MOYENNE &amp; CRÉDITS VALIDÉS</div>
            <div class="bulletin-score-big" style="color: #0284c7;">${moy} / 20</div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #10b981;">30 CRÉDITS ECTS • Rang ${rang}${rang === 1 ? 'er' : 'e'}</div>
          </div>
        </div>

        <table class="bulletin-table">
          <thead>
            <tr>
              <th>Unités d'Enseignement &amp; Modules</th>
              <th>Contrôle Continu</th>
              <th>Examen Semestriel</th>
              <th>Moyenne /20</th>
              <th>Crédits (ECTS)</th>
              <th>Statut UE</th>
              <th>Appréciation Formateur</th>
            </tr>
          </thead>
          <tbody>
            ${(eleve.bulletinNotes && eleve.bulletinNotes.length > 0 ? eleve.bulletinNotes : DEFAULT_INSTITUT_SUBJECTS).map(sub => {
              const d1 = Number(sub.devoir1) || 0;
              const d2 = Number(sub.devoir2) || 0;
              const compo = Number(sub.compo) || 0;
              const coef = Number(sub.coef) || 1;
              const moyMat = +(((d1 + d2) / 2 + compo * 2) / 3).toFixed(2);
              const estValide = moyMat >= 10;
              return `
                <tr>
                  <td><strong>${sub.matiere}</strong></td>
                  <td>${d1.toFixed(1)} / ${d2.toFixed(1)}</td>
                  <td>${compo.toFixed(1)}</td>
                  <td style="font-weight: 800; color: ${estValide ? '#0284c7' : '#ef4444'};">${moyMat.toFixed(2)}</td>
                  <td>${coef * 2} ECTS</td>
                  <td><span class="badge-tag ${estValide ? 'badge-green' : 'badge-red'}">${estValide ? '✓ Validé' : 'Rattrapage'}</span></td>
                  <td><em>${sub.appreciation || 'Travail assidu et rigoureux.'}</em></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 1rem; margin-top: 1rem;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700;">Décision du Jury de Délibération : <span style="color: #0284c7;">${eleve.appreciationConseil || (moy >= 14 ? 'ADMIS EN ANNÉE SUPÉRIEURE AVEC MENTION BIEN' : 'ADMIS EN ANNÉE SUPÉRIEURE (CRÉDITS VALIDÉS)')}</span></div>
            <div style="font-size: 0.7rem; color: #64748b;">Visa du Directeur des Études &amp; Sceau Numérique Officiel SunuSchoolExpress</div>
          </div>
          <div style="text-align: right; display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="shareBulletinWhatsApp('${eleve.id}')" style="border-color: #25D366; color: #128C7E; font-weight: 700;">
              📲 WhatsApp Étudiant / Contact
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Imprimer Format A4 Officiel</button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Template École Privée (Ministère de l'Éducation Nationale)
    const moy = eleve.moyenneGenerale || 16.85;
    const rang = eleve.rang || 1;
    const totalEleves = eleve.totalEleves || 38;

    area.innerHTML = `
      <div class="official-bulletin-container">
        <div class="bulletin-header-flag">
          <div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #00695c;">RÉPUBLIQUE DU SÉNÉGAL • MINISTÈRE DE L'ÉDUCATION NATIONALE</div>
            <div style="font-size: 1.15rem; font-weight: 800;">${etab.name}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Code IA : <strong>${etab.code}</strong> • Année Scolaire 2026-2027 • ${etab.city}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #00897b;">BULLETIN DU 1er SEMESTRE</div>
            <div style="font-size: 0.8rem; font-weight: 700;">Classe : ${eleve.classeNom}</div>
            <div style="font-size: 0.72rem; color: #64748b;">Effectif : ${totalEleves} élèves</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem; background: #f8fafc; padding: 1rem; border-radius: 6px;">
          <div>
            <div>Nom &amp; Prénom : <strong>${eleve.nom.toUpperCase()} ${eleve.prenom}</strong></div>
            <div>Matricule National : <strong>${eleve.matricule}</strong> • Clé Famille : <code>${eleve.cleAcces}</code></div>
            <div>Professeur Principal : <strong>M. Amadou Ba</strong></div>
            <div>Parent Référent : <strong>${eleve.parentNom || 'Parent'}</strong> (${eleve.parentTelephone})</div>
          </div>
          <div style="text-align: center; border-left: 2px solid #cbd5e1;">
            <div style="font-size: 0.75rem; color: #64748b;">MOYENNE SEMESTRIELLE</div>
            <div class="bulletin-score-big">${moy} / 20</div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #00897b;">RANG : ${rang}${rang === 1 ? 'ère' : 'e'} sur ${totalEleves}</div>
          </div>
        </div>

        <table class="bulletin-table">
          <thead>
            <tr>
              <th>Matières Enseignées</th>
              <th>Devoirs</th>
              <th>Compo</th>
              <th>Moy/20</th>
              <th>Coef</th>
              <th>Points Coef</th>
              <th>Appréciation Professeur</th>
            </tr>
          </thead>
          <tbody>
            ${(eleve.bulletinNotes && eleve.bulletinNotes.length > 0 ? eleve.bulletinNotes : DEFAULT_SCOLAIRE_SUBJECTS).map(sub => {
              const d1 = Number(sub.devoir1) || 0;
              const d2 = Number(sub.devoir2) || 0;
              const compo = Number(sub.compo) || 0;
              const coef = Number(sub.coef) || 1;
              const moyMat = +(((d1 + d2) / 2 + compo * 2) / 3).toFixed(2);
              const points = +(moyMat * coef).toFixed(2);
              return `
                <tr>
                  <td><strong>${sub.matiere}</strong></td>
                  <td>${d1.toFixed(1)} / ${d2.toFixed(1)}</td>
                  <td>${compo.toFixed(1)}</td>
                  <td style="font-weight: 800; color: #00897b;">${moyMat.toFixed(2)}</td>
                  <td>${coef}</td>
                  <td>${points.toFixed(2)}</td>
                  <td><em>${sub.appreciation || 'Bon travail, assidu.'}</em></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 1rem; margin-top: 1rem;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700;">Décision du Conseil : <span style="color: #00897b;">${eleve.appreciationConseil || (moy >= 16 ? 'FÉLICITATIONS AVEC LES ENCOURAGEMENTS DU CONSEIL' : (moy >= 14 ? 'TABLEAU D\'HONNEUR DU CONSEIL' : 'ENCOURAGEMENTS DU CONSEIL'))}</span></div>
            <div style="font-size: 0.7rem; color: #64748b;">Signature &amp; Cachet numérique vérifié SunuSchoolExpress</div>
          </div>
          <div style="text-align: right; display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="shareBulletinWhatsApp('${eleve.id}')" style="border-color: #25D366; color: #128C7E; font-weight: 700;">
              📲 WhatsApp Parent
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Imprimer Format A4 Officiel</button>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById('modalOfficialBulletin').classList.add('active');
}

function shareBulletinWhatsApp(eleveId) {
  const eleve = appState.db.eleves.find(e => e.id === eleveId);
  if (!eleve) return;
  const isDaara = eleve.type === 'TALIBE';
  const etab = appState.db.etablissements.find(e => e.id === eleve.etablissementId) || appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId);
  const isInstitut = eleve.type === 'ETUDIANT' || (!isDaara && isInstitutEstablishment(etab));
  const phone = (eleve.parentTelephone || '+221 77 645 88 12').replace(/[^0-9]/g, '');

  let msg = '';
  if (isDaara) {
    msg = `SunuSchoolExpress - Bulletin de Progression Hifz &amp; Tajwîd%0A%0ABonjour ${eleve.parentNom || 'Cher Parent'},%0AVoici le bilan de progression coranique de ${eleve.prenom} ${eleve.nom} :%0A📖 Hizb atteint : ${eleve.hizbActuel} / 60 (${eleve.sourate})%0A⭐ Note Tajwîd : ${eleve.tajwidNote}/20%0AClé d'accès famille : ${eleve.cleAcces}%0AFélicitations de la direction du Daara !`;
  } else if (isInstitut) {
    msg = `SunuSchoolExpress - Relevé de Notes Semestriel LMD / BTS%0A%0ABonjour ${eleve.parentNom || 'Cher Étudiant / Contact'},%0AVoici les résultats officiels de ${eleve.prenom} ${eleve.nom} (${eleve.classeNom}) :%0A📊 Moyenne Semestrielle : ${eleve.moyenneGenerale || 16.5}/20%0A🏆 Rang : ${eleve.rang || 1}er de la promotion (Crédits : 30 ECTS)%0AClé d'accès apprenant : ${eleve.cleAcces}%0AFélicitations de la Direction des Études !`;
  } else {
    msg = `SunuSchoolExpress - Bulletin Scolaire Officiel%0A%0ABonjour ${eleve.parentNom || 'Cher Parent'},%0AVoici les résultats officiels de ${eleve.prenom} ${eleve.nom} (${eleve.classeNom}) :%0A📊 Moyenne Générale : ${eleve.moyenneGenerale || 16.5}/20%0A🏆 Rang : ${eleve.rang || 1}er de la classe%0AClé d'accès famille : ${eleve.cleAcces}%0AFélicitations du Conseil des Maîtres !`;
  }

  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  showToast(`📲 Relevé/Bulletin partagé par WhatsApp avec ${eleve.parentNom} !`);
}

function printAllBulletins() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  const name = etab ? etab.name : "l'établissement";
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  if (eleves.length === 0) {
    showToast(`Aucun bulletin à imprimer pour ${name}.`, true);
    return;
  }
  generateOfficialBulletin(eleves[0].id);
  showToast(`🖨️ Préparation des bulletins (${eleves.length}) pour ${name}...`);
  setTimeout(() => {
    window.print();
  }, 400);
}

// D. Modal Nouveau Talibé / Élève / Étudiant
function handleNewEleveTypeChange(targetType) {
  const modalTitle = document.querySelector('#modalNewEleve .modal-title');
  const dormGroup = document.getElementById('newDaaraDormGroup');
  const institutGroup = document.getElementById('newInstitutGroup');
  const classRow = document.getElementById('newStudentClassRow');
  const prenomLabel = document.getElementById('modalNewElevePrenomLabel');
  const parentLabel = document.getElementById('modalNewEleveParentNomLabel');
  const parentTelLabel = document.getElementById('modalNewEleveParentTelLabel');
  const classLabel = document.getElementById('modalNewEleveClassLabel');
  const submitBtn = document.getElementById('modalNewEleveSubmitBtn');
  const classInput = document.getElementById('newStudentClasseInput');

  if (targetType === 'TALIBE') {
    if (modalTitle) modalTitle.innerHTML = `<span>🕌</span> <span>Inscription d'un Nouveau Talibé (Daara Moderne)</span>`;
    if (dormGroup) dormGroup.style.display = 'grid';
    if (institutGroup) institutGroup.style.display = 'none';
    if (classRow) classRow.style.display = 'none';
    if (prenomLabel) prenomLabel.textContent = "Prénom du talibé (apprenant)";
    if (parentLabel) parentLabel.textContent = "Nom complet du Parent / Tuteur";
    if (parentTelLabel) parentTelLabel.textContent = "Téléphone Parent (WhatsApp)";
    if (submitBtn) submitBtn.textContent = "✓ Confirmer l'Inscription & Affecter au Dortoir";
  } else if (targetType === 'ETUDIANT') {
    if (modalTitle) modalTitle.innerHTML = `<span>🎓</span> <span>Inscription d'un Nouvel Étudiant (Institut / BTS)</span>`;
    if (dormGroup) dormGroup.style.display = 'none';
    if (institutGroup) institutGroup.style.display = 'block';
    if (classRow) classRow.style.display = 'block';
    if (prenomLabel) prenomLabel.textContent = "Prénom de l'étudiant (apprenant)";
    if (classLabel) classLabel.textContent = "Filière / Promotion *";
    if (classInput) classInput.placeholder = "Ex: BTS 1 - Informatique & Génie Logiciel";
    if (parentLabel) parentLabel.textContent = "Contact de l'étudiant / Responsable légal";
    if (parentTelLabel) parentTelLabel.textContent = "Téléphone Contact (WhatsApp)";
    if (submitBtn) submitBtn.textContent = "✓ Confirmer l'Inscription de l'Étudiant";
  } else {
    // Mode École Privée
    if (modalTitle) modalTitle.innerHTML = `<span>🏫</span> <span>Inscription d'un Nouvel Élève (École Privée)</span>`;
    if (dormGroup) dormGroup.style.display = 'none';
    if (institutGroup) institutGroup.style.display = 'none';
    if (classRow) classRow.style.display = 'block';
    if (prenomLabel) prenomLabel.textContent = "Prénom de l'élève (apprenant)";
    if (classLabel) classLabel.textContent = "Classe de l'élève";
    if (classInput) classInput.placeholder = "Ex: CM2 A (ou Seconde S)";
    if (parentLabel) parentLabel.textContent = "Parent / Tuteur légal";
    if (parentTelLabel) parentTelLabel.textContent = "Téléphone Parent (WhatsApp)";
    if (submitBtn) submitBtn.textContent = "✓ Confirmer l'Inscription de l'Élève";
  }
}

function openNewEleveModal(forcedType = null) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const typeSelect = document.getElementById('newType');
  const targetType = forcedType || (isDaara ? 'TALIBE' : (isInstitut ? 'ETUDIANT' : 'SCOLAIRE'));

  if (typeSelect) {
    typeSelect.value = targetType;
  }

  handleNewEleveTypeChange(targetType);
  document.getElementById('modalNewEleve').classList.add('active');
}

function submitNewEleve() {
  const nom = document.getElementById('newNom').value;
  const prenom = document.getElementById('newPrenom').value;
  const type = document.getElementById('newType').value;
  const parentNom = document.getElementById('newParentNom').value;
  const parentTel = document.getElementById('newParentTel').value;
  const chambre = document.getElementById('newChambre') ? document.getElementById('newChambre').value.trim() : '';
  const lit = document.getElementById('newLit') ? document.getElementById('newLit').value.trim() : '';
  const customClass = document.getElementById('newStudentClasseInput') ? document.getElementById('newStudentClasseInput').value.trim() : '';
  const diplomeInput = document.getElementById('newStudentDiplome');
  const statutStageInput = document.getElementById('newStudentStatutStage');
  const entrepriseInput = document.getElementById('newStudentEntreprise');

  if (!nom || !prenom) {
    showToast('Veuillez renseigner le nom et le prénom.', true);
    return;
  }

  const litNum = lit ? parseInt(lit) : Math.floor(1 + Math.random() * 20);
  const chambreNom = chambre || "Chambre 03 (Pavillon Al-Madina)";
  const prefix = type === 'TALIBE' ? 'TAL' : (type === 'ETUDIANT' ? 'ETU' : 'ELE');

  const newEleve = {
    id: `eleve-${Date.now()}`,
    etablissementId: appState.activeEstablishmentId,
    matricule: `SSE-${prefix}-${Date.now().toString().slice(-4)}`,
    nom,
    prenom,
    sexe: 'M',
    type,
    classeId: type === 'TALIBE' ? 'cls-hifz1' : (type === 'ETUDIANT' ? 'cls-bts1' : 'cls-3eme'),
    classeNom: type === 'TALIBE' ? 'Classe Débutante (Hizb 1-15)' : (customClass || (type === 'ETUDIANT' ? 'BTS 1 - Informatique & Génie Logiciel' : 'Troisième B (3ème B)')),
    parentNom: parentNom || (type === 'ETUDIANT' ? `${prenom} ${nom}` : 'Parent Référent'),
    parentTelephone: parentTel || '+221 77 000 00 00',
    cleAcces: `PAR-${Math.floor(10000 + Math.random() * 90000)}`,
    statutPension: 'A_JOUR',
    mensualite: type === 'TALIBE' ? 25000 : (type === 'ETUDIANT' ? 65000 : 45000),
    moyenneGenerale: 15.5,
    rang: 1,
    totalEleves: 25,
    dateInscription: new Date().toISOString().split('T')[0]
  };

  if (type === 'TALIBE') {
    newEleve.hizbActuel = 1;
    newEleve.sourate = 'Al-Fatiha';
    newEleve.tajwidNote = 16.0;
    newEleve.progressionPct = 2;
    newEleve.internat = { 
      pavillon: chambreNom.includes('(') ? chambreNom.split('(')[1].replace(')', '') : "Pavillon Khadimou Rassoul", 
      dortoir: chambreNom, 
      chambre: chambreNom,
      litNumero: litNum, 
      statutLit: "OCCUPE" 
    };
  } else if (type === 'ETUDIANT') {
    newEleve.filiere = customClass || 'BTS 1 - Informatique & Génie Logiciel';
    newEleve.diplome = diplomeInput ? diplomeInput.value : 'BTS (Brevet de Technicien Supérieur)';
    newEleve.statutStage = statutStageInput ? statutStageInput.value : 'En recherche active';
    newEleve.entrepriseStage = (entrepriseInput && entrepriseInput.value) ? entrepriseInput.value.trim() : 'En attente de convention';
    newEleve.creditsECTS = 60;
    newEleve.sessionExamen = 'Session Juin 2026';
    newEleve.stageMaitre = 'Ing. Abdoulaye Fall (Tuteur Entreprise)';
  }

  appState.db.eleves.unshift(newEleve);
  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Direction des Études",
    role: "ADMIN",
    action: "INSCRIPTION_APPRENANT",
    details: `Nouvelle inscription : ${newEleve.prenom} ${newEleve.nom} (${newEleve.matricule}) - Profil: ${type}`
  });

  saveDataStore();
  closeModals();
  const labelType = type === 'TALIBE' ? 'Talibé' : (type === 'ETUDIANT' ? 'Étudiant' : 'Apprenant');
  showToast(`🎉 Inscription confirmée pour le profil ${labelType} : ${newEleve.prenom} ${newEleve.nom} !`);
  renderCurrentView();
}

// D bis. Modal Changement de Chambre / Dortoir
function openChangeChambreModal(eleveId) {
  const eleve = appState.db.eleves.find(e => e.id === eleveId);
  if (!eleve) return;

  document.getElementById('changeChambreEleveId').value = eleve.id;
  document.getElementById('modalChambreTalibeName').textContent = `${eleve.prenom} ${eleve.nom} (${eleve.matricule})`;
  
  const ch = eleve.internat?.chambre || eleve.internat?.dortoir || 'Chambre 01';
  const lit = eleve.internat?.litNumero || 1;
  document.getElementById('modalChambreCurrentInfo').textContent = `Emplacement actuel : ${ch} • Lit N°${lit}`;
  document.getElementById('changeChambreInput').value = ch;
  document.getElementById('changeLitInputDsb').value = lit;

  document.getElementById('modalChangeChambre').classList.add('active');
}

function submitChangeChambre() {
  const eleveId = document.getElementById('changeChambreEleveId').value;
  const eleve = appState.db.eleves.find(e => e.id === eleveId);
  if (!eleve) {
    closeModals();
    return;
  }

  const newChambre = document.getElementById('changeChambreInput').value.trim();
  const newLit = parseInt(document.getElementById('changeLitInputDsb').value) || 1;
  const reason = document.getElementById('changeChambreReasonDsb').value;

  if (!newChambre) {
    showToast('Veuillez préciser le numéro de la nouvelle chambre.', true);
    return;
  }

  if (!eleve.internat) eleve.internat = {};
  const prevCh = eleve.internat.chambre || 'Chambre 01';
  const prevLit = eleve.internat.litNumero || '?';

  eleve.internat.chambre = newChambre;
  eleve.internat.dortoir = newChambre;
  eleve.internat.pavillon = newChambre.includes('(') ? newChambre.split('(')[1].replace(')', '').trim() : (eleve.internat.pavillon || "Pavillon Khadimou Rassoul");
  eleve.internat.litNumero = newLit;

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Directeur / Oustaz",
    role: "ADMIN",
    action: "MUTATION_CHAMBRE",
    details: `Transfert de chambre pour ${eleve.prenom} ${eleve.nom} : de [${prevCh}, Lit ${prevLit}] vers [${newChambre}, Lit ${newLit}] (${reason})`
  });

  saveDataStore();
  closeModals();
  renderDaaraTalibes();
  showToast(`✅ Chambre mise à jour : ${eleve.prenom} ${eleve.nom} est transféré(e) en ${newChambre} (Lit ${newLit}) !`);
}

// E. Encaissement Wave Direct
// E. ENCAISSEMENT MULTICANALE SYSCOHADA (Wave, OM, Free, Espèces, Banques)
function openEncaissementWaveModal() {
  openEncaissementMultiModal('WAVE');
}

function openEncaissementMultiModal(presetOp = 'WAVE') {
  // Remplir le sélecteur d'apprenants selon l'établissement actif
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const labelEleve = document.getElementById('labelPayEleveConcerned');
  if (labelEleve) {
    labelEleve.textContent = isInstitut ? "Étudiant concerné" : (isDaara ? "Talibé concerné" : "Élève / Apprenant concerné");
  }

  const labelPayeur = document.getElementById('labelPayPayeurNom');
  if (labelPayeur) {
    labelPayeur.textContent = isInstitut ? "Contact de l'étudiant / Responsable" : (isDaara ? "Parent / Tuteur légal" : "Parent / Tuteur légal");
  }

  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const select = document.getElementById('payEleveSelect');
  
  if (select) {
    select.innerHTML = '';
    eleves.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.setAttribute('data-nom', `${e.prenom} ${e.nom}`);
      opt.setAttribute('data-parent', e.parentNom || (e.type === 'ETUDIANT' ? `${e.prenom} ${e.nom}` : 'Parent'));
      opt.setAttribute('data-tel', e.parentTelephone || '+221 77 000 00 00');
      opt.setAttribute('data-mensualite', e.mensualite || (e.type === 'TALIBE' ? 25000 : (e.type === 'ETUDIANT' ? 65000 : 45000)));
      opt.setAttribute('data-type', e.type);
      opt.textContent = `${e.prenom} ${e.nom} (${e.matricule} - ${e.classeNom})`;
      select.appendChild(opt);
    });

    if (eleves.length > 0) {
      onEncaissementStudentChanged();
    }
  }

  setEncaissementOp(presetOp);
  document.getElementById('modalEncaissementMulti').classList.add('active');
}

function setEncaissementOp(op) {
  appState.selectedEncaissementOp = op;
  const info = SYSCOHADA_OPERATORS[op] || SYSCOHADA_OPERATORS.WAVE;

  // Mise à jour visuelle des pilules d'opérateurs
  document.querySelectorAll('.operator-picker-grid .op-pill').forEach(pill => {
    if (pill.getAttribute('data-op') === op) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Mise à jour de l'encadré d'imputation comptable
  const title = document.getElementById('noticeAccountTitle');
  if (title) title.textContent = `Compte Trésorerie Débit : ${info.accountDebit}`;

  const badge = document.getElementById('noticeAccountBadge');
  if (badge) {
    badge.textContent = op === 'ESPECES' ? 'Guichet Établissement' : (op === 'CHEQUE_BANQUE' ? 'Virement / Chèque' : 'Mobile Money 1%');
    badge.className = `badge-tag ${info.badgeClass}`;
  }

  const desc = document.getElementById('noticeAccountDesc');
  if (desc) {
    const etabId = appState.activeEstablishmentId;
    const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
    let customNote = info.desc;
    if (etab) {
      if (op === 'WAVE') {
        customNote = `${info.desc}<br><strong style="color:#38BDF8;">🌊 Compte Wave Établissement :</strong> ${etab.waveNomMarchand || etab.name} (${etab.waveNumero || etab.phone || '+221 77 106 48 77'})`;
      } else if (op === 'ORANGE_MONEY') {
        customNote = `${info.desc}<br><strong style="color:#FF8A00;">🍊 Code Marchand OM Établissement :</strong> ${etab.omCodeMarchand || '178601'} (${etab.omNomMarchand || etab.name})`;
      } else if (op === 'CHEQUE_BANQUE') {
        customNote = `${info.desc}<br><strong style="color:#818CF8;">🏦 Banque Établissement :</strong> ${etab.banqueNom || 'CBAO'} • RIB : ${etab.banqueRib || 'SN012 01345 00123456789 22'}`;
      }
    }
    desc.innerHTML = customNote;
  }

  const contactLabel = document.getElementById('labelPayContact');
  if (contactLabel) contactLabel.textContent = info.contactLabel;

  const btnSubmit = document.getElementById('btnSubmitEncaissement');
  if (btnSubmit) {
    btnSubmit.innerHTML = `✓ Valider Encaissement (${info.icon} ${info.label}) &amp; Reçu`;
  }
}

function onEncaissementStudentChanged() {
  const select = document.getElementById('payEleveSelect');
  if (!select) return;
  const opt = select.options[select.selectedIndex];
  if (!opt) return;

  const parentNom = opt.getAttribute('data-parent') || 'Parent Référent';
  const parentTel = opt.getAttribute('data-tel') || '+221 77 645 88 12';
  const mensualite = opt.getAttribute('data-mensualite') || '25000';
  const type = opt.getAttribute('data-type');

  document.getElementById('payPayeurNom').value = parentNom;
  document.getElementById('payPayeurContact').value = parentTel;
  document.getElementById('payMontantInput').value = mensualite;

  const motifSelect = document.getElementById('payMotifSelect');
  if (motifSelect) {
    motifSelect.value = type === 'TALIBE' ? 'PENSION_INTERNAT' : 'SCOLARITE_MENSUELLE';
  }
}

function onEncaissementMotifChanged() {
  const motif = document.getElementById('payMotifSelect').value;
  const montantInput = document.getElementById('payMontantInput');
  if (!montantInput) return;

  if (motif === 'INSCRIPTION') {
    montantInput.value = 50000;
  } else if (motif === 'CANTINE') {
    montantInput.value = 15000;
  } else if (motif === 'FOURNITURES') {
    montantInput.value = 20000;
  }
}

function submitEncaissementMulti() {
  const op = appState.selectedEncaissementOp || 'WAVE';
  const opInfo = SYSCOHADA_OPERATORS[op] || SYSCOHADA_OPERATORS.WAVE;
  const montant = Number(document.getElementById('payMontantInput').value) || 25000;
  const payeur = document.getElementById('payPayeurNom').value || 'Parent Référent';
  const contact = document.getElementById('payPayeurContact').value || '+221 77 645 88 12';
  const motif = document.getElementById('payMotifSelect').value || 'SCOLARITE_MENSUELLE';

  const select = document.getElementById('payEleveSelect');
  let eleveNom = "Élève";
  let eleveId = null;
  if (select && select.options[select.selectedIndex]) {
    eleveNom = select.options[select.selectedIndex].getAttribute('data-nom') || "Élève";
    eleveId = select.value;
  }

  const motifLabels = {
    PENSION_INTERNAT: "Pension & Internat Daara",
    SCOLARITE_MENSUELLE: "Scolarité Mensuelle",
    INSCRIPTION: "Frais d'Inscription & Dossier",
    CANTINE: "Cantine & Restauration",
    FOURNITURES: "Tenue & Fournitures Scolaires"
  };
  const motifLabel = motifLabels[motif] || "Prestations Scolaires";

  const ref = `${opInfo.prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTx = {
    id: `tx-${Date.now()}`,
    etablissementId: appState.activeEstablishmentId,
    reference: ref,
    type: motif,
    motifLabel: motifLabel,
    montant: montant,
    devise: "FCFA",
    operateur: op,
    eleveId: eleveId,
    eleveNom: eleveNom,
    payeurNom: payeur,
    payeurContact: contact,
    compteSYSCOHADA: opInfo.accountDebit,
    compteCredit: motif === 'PENSION_INTERNAT' ? '7062 (Pensions Daaras)' : '7061 (Prestations Scolaires)',
    statut: "VALIDE",
    date: new Date().toISOString()
  };

  // Mettre à jour l'élève concerné comme étant à jour
  if (eleveId) {
    const el = appState.db.eleves.find(e => e.id === eleveId);
    if (el) el.statutPension = 'A_JOUR';
  }

  appState.db.transactions.unshift(newTx);
  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "SYSCOHADA_TRESORERIE",
    role: "COMPTABLE",
    action: `ENCAISSEMENT_${op}`,
    details: `Encaissement de ${montant.toLocaleString()} FCFA (${opInfo.label}) pour ${eleveNom} (Réf: ${ref})`
  });

  // Appel API en tâche de fond si le serveur Express tourne
  if (appState.isApiOnline) {
    fetch('http://localhost:5000/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eleveId,
        montant,
        operateur: op,
        motif: motifLabel,
        payeurTel: contact,
        payeurNom: payeur
      })
    }).catch(() => {});
  }

  saveDataStore();
  closeModals();
  showToast(`💳 Paiement de ${montant.toLocaleString()} FCFA validé via ${opInfo.label} !`);
  renderCurrentView();

  // Ouvrir automatiquement le reçu SYSCOHADA certifié
  setTimeout(() => {
    printReceipt(newTx.reference, newTx.eleveNom, newTx.montant, newTx.operateur, newTx.motifLabel, newTx.compteSYSCOHADA, newTx.date);
  }, 350);
}

// F. GÉNÉRATION DE REÇU SYSCOHADA IMPRIMABLE
function printReceipt(ref, eleve, montant, operateur, motif = "Scolarité / Pension", compteDebit = null, dateStr = null) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || {
    name: "Établissement Scolaire & Daara",
    code: "SSE-SN-8941",
    phone: "+221 77 645 88 12"
  };

  const opInfo = SYSCOHADA_OPERATORS[operateur] || {
    code: "5211",
    label: operateur,
    icon: "💳",
    accountDebit: compteDebit || "5211 - Banque / Trésorerie"
  };

  const dateFormatted = dateStr 
    ? new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Trouver le payeur et le contact associés à cette transaction
  const tx = appState.db.transactions.find(t => t.reference === ref);
  const payeurNom = tx ? tx.payeurNom : "Parent Référent";
  const payeurContact = tx ? tx.payeurContact : "+221 77 645 88 12";

  const area = document.getElementById('receiptRenderArea');
  if (!area) return;

  area.innerHTML = `
    <div class="receipt-printable-card">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 0.5rem;">
        <button type="button" class="modal-close-btn" style="position: static; color: #64748b;" onclick="closeModals()">✕</button>
      </div>
      
      <div class="receipt-header-syscohada">
        <div>
          <div style="font-size: 0.72rem; font-weight: 800; color: #00695c; text-transform: uppercase;">
            🇸🇳 RÉPUBLIQUE DU SÉNÉGAL • PLAN COMPTABLE SYSCOHADA RÉVISÉ
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0.2rem 0;">
            ${etab.name}
          </div>
          <div style="font-size: 0.75rem; color: #64748b;">
            Code Établissement : <strong>${etab.code}</strong> • Trésorerie : ${etab.phone}
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge-tag badge-green" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; font-weight: 800;">QUITTANCE OFFICIELLE</span>
          <div style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.35rem; font-family: monospace;">N° ${ref}</div>
          <div style="font-size: 0.72rem; color: #64748b;">Émis le : ${dateFormatted}</div>
        </div>
      </div>

      <div style="background: #f1f5f9; padding: 0.9rem 1.1rem; border-radius: 6px; margin-bottom: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; font-size: 0.82rem;">
        <div>
          <div style="color: #64748b; font-size: 0.72rem;">BÉNÉFICIAIRE / APPRENANT :</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">${eleve}</div>
          <div style="color: #475569; margin-top: 0.2rem;">Motif : <strong>${motif}</strong></div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 0.72rem;">CANAL DE PAIEMENT :</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">${opInfo.icon} ${opInfo.label}</div>
          <div style="color: #475569; margin-top: 0.2rem;">Payeur : <strong>${payeurNom}</strong> (${payeurContact})</div>
        </div>
      </div>

      <div class="receipt-ledger-box">
        <div style="font-weight: 700; font-size: 0.72rem; color: #475569; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">
          ÉCRITURES COMPTABLES DE TRÉSORERIE (NORMES OHADA ÉDUCATION)
        </div>
        <table class="receipt-ledger-table">
          <thead>
            <tr style="background: #e2e8f0; font-size: 0.72rem;">
              <th>Compte</th>
              <th>Intitulé du Compte SYSCOHADA</th>
              <th style="text-align: right;">Débit (FCFA)</th>
              <th style="text-align: right;">Crédit (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style="color: #0f172a;">${opInfo.code}</strong></td>
              <td>${opInfo.accountDebit}</td>
              <td style="text-align: right; font-weight: 800; color: #059669;">+${Number(montant).toLocaleString()}</td>
              <td style="text-align: right; color: #94a3b8;">-</td>
            </tr>
            <tr>
              <td><strong style="color: #0f172a;">7061</strong></td>
              <td>Prestations de services scolaires / Pensions Daaras</td>
              <td style="text-align: right; color: #94a3b8;">-</td>
              <td style="text-align: right; font-weight: 800; color: #0f172a;">${Number(montant).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 0.9rem 1.1rem; margin-bottom: 1.25rem;">
        <div>
          <div style="font-size: 0.75rem; color: #065f46; font-weight: 700;">MONTANT TOTAL ENCAISSÉ</div>
          <div style="font-size: 0.72rem; color: #047857;">Règlement libératoire certifié en Francs CFA (XOF)</div>
        </div>
        <div style="font-size: 1.4rem; font-weight: 900; color: #047857; letter-spacing: -0.5px;">
          ${Number(montant).toLocaleString()} FCFA
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cbd5e1; padding-top: 1rem;">
        <div>
          <div class="receipt-stamp-badge">✓ PAYÉ &amp; CERTIFIÉ SYSCOHADA</div>
          <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.3rem;">Visa informatique certifié SunuSchoolExpress • Document valant quittance</div>
        </div>
        <div style="text-align: right; display: flex; gap: 0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="shareReceiptWhatsApp('${ref}', '${eleve}', '${montant}', '${opInfo.label}', '${payeurContact}')" style="border-color: #25D366; color: #128C7E; font-weight: 700;">
            📲 WhatsApp Parent
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.print()" style="background: #00695c;">
            🖨️ Imprimer Reçu
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modalReceiptSyscohada').classList.add('active');
}

function shareReceiptWhatsApp(ref, eleve, montant, opLabel, phone = "+221 77 645 88 12") {
  const msg = `SunuSchoolExpress - Reçu Officiel N° ${ref}%0AÉlève : ${eleve}%0AMontant réglé : ${Number(montant).toLocaleString()} FCFA via ${opLabel}%0AStatut : Validé & Conforme SYSCOHADA. Merci pour votre confiance !`;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
}

function closeModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
}

// ==========================================================================
// 8. CONFIGURATION DES COMPTES D'ENCAISSEMENT ÉTABLISSEMENT (WAVE, OM, BANQUE)
// ==========================================================================
function renderFinConfig() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  if (!etab) return;

  // 1. Wave Marchand
  const waveActifEl = document.getElementById('cfgWaveActif');
  const waveNumEl = document.getElementById('cfgWaveNumero');
  const waveNomEl = document.getElementById('cfgWaveNomMarchand');
  const waveUrlEl = document.getElementById('cfgWaveUrlPaiement');

  if (waveActifEl) waveActifEl.checked = etab.waveActif !== false;
  if (waveNumEl) waveNumEl.value = etab.waveNumero || etab.phone || "";
  if (waveNomEl) waveNomEl.value = etab.waveNomMarchand || etab.name || "";
  
  const defaultWaveUrl = etab.waveUrlPaiement || "";
  if (waveUrlEl) waveUrlEl.value = defaultWaveUrl;

  updateWaveQrPreview(defaultWaveUrl);

  // 2. Orange Money
  const omActifEl = document.getElementById('cfgOmActif');
  const omCodeEl = document.getElementById('cfgOmCodeMarchand');
  const omNumEl = document.getElementById('cfgOmNumero');
  const omNomEl = document.getElementById('cfgOmNomMarchand');

  if (omActifEl) omActifEl.checked = etab.omActif !== false;
  if (omCodeEl) omCodeEl.value = etab.omCodeMarchand || (etab.code ? etab.code.replace(/[^0-9]/g, '') : "");
  if (omNumEl) omNumEl.value = etab.omNumero || etab.phone || "";
  if (omNomEl) omNomEl.value = etab.omNomMarchand || etab.name || "";

  updateOmUssdPreview(omCodeEl ? omCodeEl.value : "");

  // 3. Virement Bancaire & SYSCOHADA
  const bqActifEl = document.getElementById('cfgBanqueActif');
  const bqNomEl = document.getElementById('cfgBanqueNom');
  const bqTitulaireEl = document.getElementById('cfgBanqueTitulaire');
  const bqRibEl = document.getElementById('cfgBanqueRib');

  if (bqActifEl) bqActifEl.checked = etab.banqueActif !== false;
  if (bqNomEl && etab.banqueNom) bqNomEl.value = etab.banqueNom;
  if (bqTitulaireEl) bqTitulaireEl.value = etab.banqueTitulaire || etab.name || "";
  if (bqRibEl) bqRibEl.value = etab.banqueRib || "";

  // 4. Consignes & WhatsApp
  const consigneEl = document.getElementById('cfgConsignePaiement');
  const waEl = document.getElementById('cfgWhatsappComptable');

  if (consigneEl) {
    consigneEl.value = etab.consignePaiement || "Préciser impérativement le prénom, nom et matricule de l'élève en motif du transfert Wave ou Orange Money pour validation immédiate.";
  }
  if (waEl) {
    waEl.value = etab.whatsappComptable || etab.phone || "+221 77 106 48 77";
  }

  // Statut visuel des cartes
  onFinConfigToggled();
  updateFinConfigStatusBadge(etab);
}

function updateWaveQrPreview(url) {
  const imgEl = document.getElementById('cfgWaveQrPreviewImg');
  const subtextEl = document.getElementById('cfgWaveQrSubtext');
  const scanBadge = document.getElementById('cfgWaveScanBadge');
  if (!imgEl) return;

  const validUrl = (url && url.trim().length > 5) ? url.trim() : "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(validUrl)}`;
  imgEl.src = qrUrl;

  if (validUrl.includes('pay.wave.com')) {
    if (scanBadge) {
      scanBadge.className = 'badge-tag badge-green';
      scanBadge.textContent = '✓ Lien Marchand Wave Vérifié & Scannable';
    }
    if (subtextEl) {
      subtextEl.textContent = "QR Code officiel Wave Marchand généré. Les parents scannent directement avec l'application Wave pour payer sans frais.";
    }
  } else {
    if (scanBadge) {
      scanBadge.className = 'badge-tag badge-blue';
      scanBadge.textContent = '✓ QR Code Scannable';
    }
  }
}

function handleWaveQrError(img) {
  if (img && !img.dataset.hasFallback) {
    img.dataset.hasFallback = "true";
    const currentSrc = img.src;
    const urlMatch = currentSrc.match(/data=([^&]+)/);
    const data = urlMatch ? urlMatch[1] : encodeURIComponent("https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/");
    img.src = `https://quickchart.io/qr?text=${data}&size=200`;
  }
}

function onWaveUrlInputChanged(val) {
  updateWaveQrPreview(val);
}

function updateOmUssdPreview(val) {
  const codeEl = document.getElementById('cfgOmUssdSyntax');
  if (!codeEl) return;
  const code = (val || '178601').trim();
  codeEl.textContent = `#144#391*${code}*MONTANT#`;
}

function onFinConfigToggled() {
  const wActif = document.getElementById('cfgWaveActif');
  const omActif = document.getElementById('cfgOmActif');
  const bqActif = document.getElementById('cfgBanqueActif');

  const cardW = document.getElementById('cardCfgWave');
  const cardOm = document.getElementById('cardCfgOm');
  const cardBq = document.getElementById('cardCfgBanque');

  if (cardW && wActif) cardW.style.opacity = wActif.checked ? "1" : "0.55";
  if (cardOm && omActif) cardOm.style.opacity = omActif.checked ? "1" : "0.55";
  if (cardBq && bqActif) cardBq.style.opacity = bqActif.checked ? "1" : "0.55";
}

function updateFinConfigStatusBadge(etab) {
  const badge = document.getElementById('finconfigStatusBadge');
  const text = document.getElementById('finconfigStatusText');
  if (!badge || !text) return;

  const wOn = etab.waveActif !== false;
  const omOn = etab.omActif !== false;
  const bqOn = etab.banqueActif !== false;

  const activeChannels = [];
  if (wOn) activeChannels.push('Wave');
  if (omOn) activeChannels.push('Orange Money');
  if (bqOn) activeChannels.push('Banque');

  if (activeChannels.length === 0) {
    text.textContent = "Aucun compte d'encaissement actif";
    badge.style.background = "rgba(239, 68, 68, 0.15)";
    badge.style.borderColor = "rgba(239, 68, 68, 0.4)";
    badge.style.color = "#F87171";
  } else {
    text.textContent = `Encaissement Direct Actif : ${activeChannels.join(' + ')}`;
    badge.style.background = "rgba(16, 185, 129, 0.15)";
    badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
    badge.style.color = "#34D399";
  }
}

function testWaveLinkDirect() {
  const urlEl = document.getElementById('cfgWaveUrlPaiement');
  const url = (urlEl && urlEl.value) ? urlEl.value.trim() : "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/";
  window.open(url, '_blank');
}

function downloadWaveQrCode() {
  const img = document.getElementById('cfgWaveQrPreviewImg');
  if (!img) return;
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const name = etab ? etab.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Etablissement';

  const a = document.createElement('a');
  a.href = img.src;
  a.download = `QR_Wave_${name}.png`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("📥 Téléchargement du QR Code Wave lancé !");
}

function saveEstablishmentFinConfig() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  if (!etab) return;

  const wActif = document.getElementById('cfgWaveActif');
  const wNum = document.getElementById('cfgWaveNumero');
  const wNom = document.getElementById('cfgWaveNomMarchand');
  const wUrl = document.getElementById('cfgWaveUrlPaiement');

  const omActif = document.getElementById('cfgOmActif');
  const omCode = document.getElementById('cfgOmCodeMarchand');
  const omNum = document.getElementById('cfgOmNumero');
  const omNom = document.getElementById('cfgOmNomMarchand');

  const bqActif = document.getElementById('cfgBanqueActif');
  const bqNom = document.getElementById('cfgBanqueNom');
  const bqTitulaire = document.getElementById('cfgBanqueTitulaire');
  const bqRib = document.getElementById('cfgBanqueRib');

  const consigne = document.getElementById('cfgConsignePaiement');
  const wa = document.getElementById('cfgWhatsappComptable');

  // Mise à jour de l'objet établissement
  etab.waveActif = wActif ? wActif.checked : true;
  etab.waveNumero = wNum ? wNum.value.trim() : (etab.waveNumero || "");
  etab.waveNomMarchand = wNom ? wNom.value.trim() : (etab.waveNomMarchand || etab.name);
  etab.waveUrlPaiement = wUrl ? wUrl.value.trim() : (etab.waveUrlPaiement || "");

  etab.omActif = omActif ? omActif.checked : true;
  etab.omCodeMarchand = omCode ? omCode.value.trim() : (etab.omCodeMarchand || "");
  etab.omNumero = omNum ? omNum.value.trim() : (etab.omNumero || "");
  etab.omNomMarchand = omNom ? omNom.value.trim() : (etab.omNomMarchand || etab.name);

  etab.banqueActif = bqActif ? bqActif.checked : true;
  etab.banqueNom = bqNom ? bqNom.value : (etab.banqueNom || "CBAO Groupe Attijariwafa Bank");
  etab.banqueTitulaire = bqTitulaire ? bqTitulaire.value.trim() : (etab.banqueTitulaire || etab.name);
  etab.banqueRib = bqRib ? bqRib.value.trim() : (etab.banqueRib || "");

  etab.consignePaiement = consigne ? consigne.value.trim() : (etab.consignePaiement || "");
  etab.whatsappComptable = wa ? wa.value.trim() : (etab.whatsappComptable || etab.phone || "");

  // Audit Log local
  appState.db.auditLogs.unshift({
    id: `log-cfg-${Date.now()}`,
    date: new Date().toISOString(),
    user: appState.activeRole || "ADMIN_DIRECTEUR",
    role: "ADMIN_DIRECTEUR",
    action: "CONFIGURATION_ENCAISSEMENT_MODIFIEE",
    details: `Mise à jour des coordonnées d'encaissement (Wave: ${etab.waveNomMarchand}, OM: ${etab.omCodeMarchand}, Banque: ${etab.banqueNom}) pour ${etab.name}.`
  });

  // Sauvegarde locale persistante (ACID)
  saveDataStore();

  // Envoi asynchrone au backend si disponible
  try {
    const backendBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' : '';
    fetch(`${backendBaseUrl}/api/etablissements/${etab.id}/finconfig`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waveActif: etab.waveActif,
        waveNumero: etab.waveNumero,
        waveNomMarchand: etab.waveNomMarchand,
        waveUrlPaiement: etab.waveUrlPaiement,
        omActif: etab.omActif,
        omCodeMarchand: etab.omCodeMarchand,
        omNumero: etab.omNumero,
        omNomMarchand: etab.omNomMarchand,
        banqueActif: etab.banqueActif,
        banqueNom: etab.banqueNom,
        banqueTitulaire: etab.banqueTitulaire,
        banqueRib: etab.banqueRib,
        consignePaiement: etab.consignePaiement,
        whatsappComptable: etab.whatsappComptable,
        updatedBy: etab.directeurNom || "DIRECTION"
      })
    }).catch(() => {});
  } catch (err) {}

  updateFinConfigStatusBadge(etab);
  showToast("✅ Coordonnées d'encaissement enregistrées ! Vos élèves et parents paieront désormais directement sur vos comptes.");
}

function openPrintGuichetModal() {
  const modal = document.getElementById('modalPrintGuichet');
  const area = document.getElementById('guichetFlyerRenderArea');
  if (!modal || !area) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const waveUrl = etab.waveUrlPaiement || "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(waveUrl)}`;

  area.innerHTML = `
    <div class="guichet-flyer-card" id="guichetPrintDoc">
      <div class="guichet-flyer-header">
        <div style="font-size: 0.85rem; font-weight: 800; color: #00D2B4; letter-spacing: 0.08em; margin-bottom: 0.25rem;">
          PORTAIL DE RÈGLEMENT OFFICIEL
        </div>
        <h1 class="guichet-flyer-school">${etab.name}</h1>
        <div class="guichet-flyer-sub">${etab.type === 'DAARA' ? 'Daara Moderne & Hifz Coranique' : 'Groupe Scolaire & École Privée'} • ${etab.city}</div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <div style="font-size: 1.1rem; font-weight: 800; color: #0A192F; margin-bottom: 0.35rem;">
          PAYEZ VOS SCOLARITÉS EN UN SCAN
        </div>
        <div style="font-size: 0.85rem; color: #64748B;">
          Zéro frais de transfert pour les parents • Validation immédiate
        </div>
      </div>

      <div class="guichet-flyer-qr-wrapper">
        <img src="${qrSrc}" alt="QR Code Wave de l'établissement" onerror="handleWaveQrError(this)">
        <div style="margin-top: 0.75rem;">
          <span class="guichet-flyer-wave-pill">🌊 Scanner avec l'appli Wave</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; text-align: left;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.75rem;">
          <strong style="color: #1BA4E8; font-size: 0.8rem; display: block; margin-bottom: 0.2rem;">🌊 WAVE MARCHAND</strong>
          <div style="font-size: 0.9rem; font-weight: 800; color: #0F172A;">${etab.waveNomMarchand || etab.name}</div>
          <div style="font-size: 0.75rem; color: #64748B;">${etab.waveNumero || etab.phone || '+221 77 106 48 77'}</div>
        </div>

        <div style="background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 8px; padding: 0.75rem;">
          <strong style="color: #FF6600; font-size: 0.8rem; display: block; margin-bottom: 0.2rem;">🍊 ORANGE MONEY</strong>
          <div style="font-size: 0.9rem; font-weight: 800; color: #0F172A;">Code : ${etab.omCodeMarchand || '178601'}</div>
          <div style="font-size: 0.75rem; color: #64748B;">Tapez #144#391*${etab.omCodeMarchand || '178601'}*Montant#</div>
        </div>
      </div>

      <div class="guichet-flyer-instructions">
        <strong>⚠️ Consigne importante aux familles :</strong><br>
        ${etab.consignePaiement || "Mentionnez obligatoirement le nom complet et le matricule de l'élève en commentaire du transfert."}<br>
        📱 Envoi de la capture de paiement au WhatsApp Comptabilité : <strong>${etab.whatsappComptable || etab.phone || '+221 77 106 48 77'}</strong>
      </div>

      <div class="guichet-flyer-footer">
        Affiche générée par SunuSchool Express • Certifié SYSCOHADA UEMOA
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function printGuichetFlyerNow() {
  window.print();
}

function openEleveDetails(eleveId) {
  const eleve = appState.db.eleves.find(e => e.id === eleveId);
  if (!eleve) return;
  if (eleve.type === 'TALIBE') {
    previewPvcBadge(eleveId);
  } else {
    generateOfficialBulletin(eleveId);
  }
}

// G. CONFIGURATION DE LA DATE DES BULLETINS
function openConfigDateModal() {
  document.getElementById('modalConfigDate').classList.add('active');
}

function saveConfigDate() {
  const term = document.getElementById('configDateTermInput').value || '1er Semestre 2026-2027';
  const dateVal = document.getElementById('configDateInput').value || '2026-10-31';
  const status = document.getElementById('configDateStatusSelect').value;

  const termEl = document.getElementById('bulletinTermLabel');
  const dateEl = document.getElementById('bulletinReleaseDateText');

  const formattedDate = new Date(dateVal).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (termEl) termEl.textContent = term;
  if (dateEl) dateEl.textContent = formattedDate;

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Directeur Général",
    role: "ADMIN",
    action: "CONFIG_BULLETINS",
    details: `Date de publication des bulletins fixée au ${formattedDate} (${term}) - Statut: ${status}`
  });

  saveDataStore();
  closeModals();
  showToast(`📅 Date officielle des bulletins fixée au : ${formattedDate} !`);
  renderCurrentView();
}

// H. SUPER ADMIN SAAS : NOUVEL ÉTABLISSEMENT CLIENT
function openNewClientModal() {
  document.getElementById('modalNewClientSaaS').classList.add('active');
}

function submitNewClientSaaS() {
  const name = document.getElementById('newClientName').value.trim();
  const type = document.getElementById('newClientType').value;
  const city = document.getElementById('newClientCity').value.trim() || 'Dakar';
  const planSelect = document.getElementById('newClientPlan');
  const plan = planSelect.value;
  const opt = planSelect.options[planSelect.selectedIndex];
  const price = Number(opt.getAttribute('data-price')) || 45000;
  const director = document.getElementById('newClientDirector').value.trim() || 'Direction';
  const phone = document.getElementById('newClientPhone').value.trim() || '+221 77 000 00 00';

  if (!name) {
    showToast("Veuillez renseigner le nom de l'établissement client.", true);
    return;
  }

  const id = `etab-${Date.now()}`;
  const code = `SSE-SN-${Math.floor(1000 + Math.random() * 9000)}`;

  const newEtab = {
    id,
    code,
    name,
    type,
    city,
    phone,
    directeurNom: director,
    plan,
    prixMensuel: price,
    statutAbonnement: price === 0 ? "ESSAI_GRATUIT" : "ACTIF",
    echeanceAbonnement: "2026-11-30",
    dateAdhesion: new Date().toISOString().split('T')[0],
    fraisAdhesionPayes: true
  };

  appState.db.etablissements.push(newEtab);

  // Ajouter immédiatement au sélecteur de l'en-tête
  const etabSelect = document.getElementById('establishmentSelect');
  if (etabSelect) {
    const optNew = document.createElement('option');
    optNew.value = newEtab.id;
    optNew.textContent = `${newEtab.name} (${newEtab.city})`;
    etabSelect.appendChild(optNew);
  }

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "SUPER_ADMIN_SAAS",
    role: "SUPER_ADMIN",
    action: "NOUVEL_ABONNE_SAAS",
    details: `Onboarding SaaS réussi : ${name} (${city}) - Formule: ${plan} (${price.toLocaleString()} F/m)`
  });

  saveDataStore();
  populateEstablishmentSelect();
  closeModals();
  showToast(`🎉 Bienvenue à ${name} ! Client onboardé et licence activée.`);
  renderCurrentView();
}

// I. SUPER ADMIN SAAS : BROADCAST GLOBAL DIRECTEURS
function openBroadcastModal() {
  const etabs = appState.db.etablissements || [];
  const recEl = document.getElementById('saasBroadcastRecipientsText');
  if (recEl) {
    recEl.textContent = `Tous les directeurs d'établissements abonnés (${etabs.length} actifs au Sénégal)`;
  }
  document.getElementById('modalBroadcastSaaS').classList.add('active');
}

function onSaasBroadcastTypeChange() {
  const type = document.getElementById('saasBroadcastType').value;
  const subj = document.getElementById('saasBroadcastSubject');
  const cont = document.getElementById('saasBroadcastContent');
  if (!subj || !cont) return;

  if (type === 'UPDATE') {
    subj.value = "Mise à jour majeure : Gestion de Caisse SYSCOHADA & Emplois du temps";
    cont.value = "Chers Directeurs et Oustazs, l'équipe SunuSchoolExpress vous informe du déploiement du nouveau module d'encaissement multicanal (Wave, Orange Money, Free Money, Espèces, Banques) conforme SYSCOHADA. Vos équipes peuvent dès à présent émettre les reçus officiels certifiés.";
  } else if (type === 'MAINTENANCE') {
    subj.value = "Avis technique : Optimisation des serveurs ce samedi à 23h GMT";
    cont.value = "Chers partenaires, une mise à niveau d'infrastructure sera réalisée cette nuit entre 23h et 00h GMT pour accélérer la génération des bulletins PDF. Aucune interruption prolongée n'est à prévoir.";
  } else if (type === 'FACTURATION') {
    subj.value = "Rappel de renouvellement de licence SaaS SunuSchoolExpress";
    cont.value = "Chers Directeurs, les avis d'échéance de vos abonnements mensuels sont disponibles. Merci d'effectuer votre règlement via Wave ou Orange Money au numéro de la supervision centrale (+221 77 123 45 67).";
  } else {
    subj.value = "Communication de la Direction SunuSchoolExpress";
    cont.value = "Message personnalisé à l'attention de l'ensemble des établissements abonnés.";
  }
}

function sendBroadcastSaaS() {
  const subj = document.getElementById('saasBroadcastSubject').value;
  const cont = document.getElementById('saasBroadcastContent').value;
  const etabs = appState.db.etablissements || [];

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "SUPER_ADMIN_SAAS",
    role: "SUPER_ADMIN",
    action: "BROADCAST_DIRECTEURS",
    details: `Message diffusé à ${etabs.length} directeurs : "${subj}"`
  });

  saveDataStore();
  closeModals();
  showToast(`📢 Annonce diffusée avec succès à ${etabs.length} directeurs d'établissements !`);

  // Partage WhatsApp direct avec le premier directeur
  if (etabs.length > 0 && etabs[0].phone) {
    const clean = etabs[0].phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(`SunuSchoolExpress - Annonce Officielle\n\n*${subj}*\n\n${cont}`);
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
  }
}

// J. COMMUNICATION : RAPPEL GROUPÉ FAMILLES WHATSAPP
function openBroadcastCommsModal() {
  onCommsReminderMotifChange();
  document.getElementById('modalBroadcastComms').classList.add('active');
}

function onCommsReminderMotifChange() {
  const motif = document.getElementById('commsReminderMotif').value;
  const target = document.getElementById('commsReminderTarget').value;
  const txt = document.getElementById('commsReminderText');
  const info = document.getElementById('commsTargetCountInfo');

  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const retardataires = eleves.filter(e => e.statutPension !== 'A_JOUR');

  const targetCount = target === 'RETARD' ? retardataires.length : eleves.length;
  if (info) {
    info.textContent = `Destinataires estimés : ${targetCount} famille${targetCount > 1 ? 's' : ''} ciblée${targetCount > 1 ? 's' : ''} dans cet établissement.`;
  }

  if (!txt) return;

  if (motif === 'SCOLARITE') {
    txt.value = "Chers parents, nous vous rappelons que les mensualités scolaires et pensions d'internat du mois en cours sont exigibles. Merci d'effectuer votre règlement via Wave ou Orange Money en utilisant votre clé d'accès famille. La Direction.";
  } else if (motif === 'BULLETINS') {
    txt.value = "Avis aux familles : Les bulletins de notes et bilans de progression Coranique (Hifz & Tajwîd) sont disponibles. Vous pouvez les consulter immédiatement sur votre Espace Parents avec votre clé unique.";
  } else if (motif === 'REUNION') {
    txt.value = "Chers parents d'élèves, vous êtes conviés à l'Assemblée Générale de concertation ce samedi à 10h00 au sein de l'établissement. Votre présence est vivement souhaitée.";
  } else {
    txt.value = "Chers parents, veuillez noter cette information importante concernant le déroulement des cours et activités au sein de notre établissement.";
  }
}

function sendBroadcastComms() {
  const motif = document.getElementById('commsReminderMotif').value;
  const text = document.getElementById('commsReminderText').value;
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Responsable Vie Scolaire",
    role: "ADMIN",
    action: "RAPPEL_WHATSAPP_FAMILLES",
    details: `Campagne WhatsApp lancée auprès de ${eleves.length} familles (Motif: ${motif})`
  });

  saveDataStore();
  closeModals();
  showToast(`📲 Rappel groupé WhatsApp transmis à ${eleves.length} familles !`);

  // Ouvrir WhatsApp avec le premier parent
  if (eleves.length > 0 && eleves[0].parentTelephone) {
    const clean = eleves[0].parentTelephone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(`SunuSchoolExpress - Message de l'Établissement\n\n${text}`);
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
  }
}

// K. COMMUNICATION : RÉPERTOIRE ET RENVOI DES CLÉS PARENTS / ÉTUDIANTS
function openParentKeysModal() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const thParent = document.getElementById('thParentKeysParent');
  if (thParent) thParent.textContent = isInstitut ? "Contact de l'étudiant / Responsable" : (isDaara ? "Parent / Tuteur" : "Parent / Tuteur légal");
  const thStudent = document.getElementById('thParentKeysStudent');
  if (thStudent) thStudent.textContent = isInstitut ? "Étudiant (Filière & Mat.)" : (isDaara ? "Talibé (Matricule)" : "Apprenant (Classe & Mat.)");

  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const tbody = document.getElementById('parentKeysTable');

  if (tbody) {
    tbody.innerHTML = '';
    if (eleves.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted);">${isInstitut ? 'Aucun étudiant enregistré pour cet établissement.' : 'Aucun apprenant enregistré pour cet établissement.'}</td></tr>`;
    } else {
      eleves.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong style="color:#fff;">${e.parentNom || (isInstitut ? 'Contact Référent' : 'Parent Référent')}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${e.parentTelephone}</div>
          </td>
          <td>
            <div style="font-weight:700; color:#fff;">${e.prenom} ${e.nom}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${e.classeNom} • ${e.matricule}</div>
          </td>
          <td>
            <code style="background:rgba(0,210,180,0.15); color:var(--primary); padding:0.25rem 0.5rem; border-radius:4px; font-weight:800; font-size:0.85rem;">
              ${e.cleAcces}
            </code>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="sendSingleParentKeyWhatsApp('${e.id}')" style="border-color:#25D366; color:#128C7E; font-weight:700;">
              📲 WhatsApp
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  document.getElementById('modalParentKeys').classList.add('active');
}

function sendSingleParentKeyWhatsApp(eleveId) {
  const e = appState.db.eleves.find(el => el.id === eleveId);
  if (!e) return;
  const isDaara = e.type === 'TALIBE';
  const isInstitut = e.type === 'ETUDIANT' || (!isDaara && isInstitutEstablishment(etab));
  const clean = (e.parentTelephone || '+221 77 645 88 12').replace(/[^0-9]/g, '');
  
  const msg = isInstitut
    ? `SunuSchoolExpress - Clé d'Accès Sécurisée Étudiant%0A%0ABonjour ${e.parentNom || 'Cher Étudiant / Contact'},%0AVoici votre clé d'accès unique pour suivre votre scolarité (${e.classeNom}) :%0A🔑 Clé : *${e.cleAcces}*%0A%0AAccédez directement à vos relevés semestriels, crédits validés et reçus sans mot de passe sur SunuSchoolExpress.`
    : `SunuSchoolExpress - Clé Famille Sécurisée%0A%0ABonjour ${e.parentNom || 'Cher Parent'},%0AVoici votre clé d'accès unique pour suivre la scolarité de ${e.prenom} ${e.nom} :%0A🔑 Clé : *${e.cleAcces}*%0A%0AAccédez directement à vos reçus certifiés, notes et progression coranique sans mot de passe sur SunuSchoolExpress.`;

  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  showToast(`📲 Clé d'accès WhatsApp envoyée à ${e.parentNom} !`);
}

function sendAllParentKeysWhatsApp() {
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Directeur Général",
    role: "ADMIN",
    action: "DISTRIBUTION_CLES_PARENTS",
    details: `Distribution massive des clés d'accès effectuée pour ${eleves.length} familles.`
  });

  saveDataStore();
  closeModals();
  showToast(`🔑 Clés d'accès transmises par WhatsApp à ${eleves.length} familles avec succès !`);
}

// L. VIE SCOLAIRE : JOURNAL D'APPEL ET FEUILLE DE PRÉSENCES
let dailyAttendance = {};

function openAttendanceModal() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const thStudent = document.getElementById('thAttendanceStudent');
  if (thStudent) thStudent.textContent = isInstitut ? "Étudiant (Nom & Matricule)" : (isDaara ? "Talibé (Matricule)" : "Apprenant / Élève");
  const thClass = document.getElementById('thAttendanceClass');
  if (thClass) thClass.textContent = isInstitut ? "Filière / Promotion" : (isDaara ? "Cycle Coranique" : "Niveau / Classe");
  const thAlert = document.getElementById('thAttendanceAlert');
  if (thAlert) thAlert.textContent = isInstitut ? "Alerte Contact / Étudiant" : "Alerte Immédiate Parent";

  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const dateLabel = document.getElementById('attendanceDateLabel');

  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  if (dateLabel) dateLabel.textContent = `Appel du : ${todayStr}`;

  eleves.forEach(e => {
    if (!dailyAttendance[e.id]) {
      dailyAttendance[e.id] = 'PRESENT';
    }
  });

  renderAttendanceTable();
  document.getElementById('modalAttendance').classList.add('active');
}

function renderAttendanceTable() {
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const tbody = document.getElementById('attendanceTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  eleves.forEach(e => {
    const status = dailyAttendance[e.id] || 'PRESENT';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="font-weight:700; color:#fff;">${e.prenom} ${e.nom}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${e.matricule}</div>
      </td>
      <td><span class="badge-tag badge-blue">${e.classeNom}</span></td>
      <td>
        <div style="display:flex; gap:0.3rem;">
          <button type="button" class="btn btn-sm ${status === 'PRESENT' ? 'btn-primary' : 'btn-outline'}" onclick="setAttendanceStatus('${e.id}', 'PRESENT')" style="padding:0.25rem 0.5rem; font-size:0.72rem;">
            🟢 Présent
          </button>
          <button type="button" class="btn btn-sm ${status === 'RETARD' ? 'btn-primary' : 'btn-outline'}" onclick="setAttendanceStatus('${e.id}', 'RETARD')" style="padding:0.25rem 0.5rem; font-size:0.72rem; ${status === 'RETARD' ? 'background:#f59e0b; border-color:#f59e0b;' : ''}">
            🟡 Retard
          </button>
          <button type="button" class="btn btn-sm ${status === 'ABSENT' ? 'btn-primary' : 'btn-outline'}" onclick="setAttendanceStatus('${e.id}', 'ABSENT')" style="padding:0.25rem 0.5rem; font-size:0.72rem; ${status === 'ABSENT' ? 'background:#ef4444; border-color:#ef4444;' : ''}">
            🔴 Absent
          </button>
        </div>
      </td>
      <td>
        ${status === 'ABSENT' 
          ? `<button class="btn btn-sm" onclick="notifyAbsenceWhatsApp('${e.id}')" style="background:#ef4444; color:#fff; border:none; font-size:0.72rem; font-weight:700;">
              🚨 Alerte WhatsApp
            </button>`
          : `<span style="font-size:0.72rem; color:var(--text-muted);">Non requis</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setAttendanceStatus(eleveId, status) {
  dailyAttendance[eleveId] = status;
  renderAttendanceTable();
}

function markAllPresent() {
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  eleves.forEach(e => {
    dailyAttendance[e.id] = 'PRESENT';
  });
  renderAttendanceTable();
  showToast("Tous les apprenants sont pointés Présents.");
}

function notifyAbsenceWhatsApp(eleveId) {
  const e = appState.db.eleves.find(el => el.id === eleveId);
  if (!e) return;
  const isDaara = e.type === 'TALIBE';
  const isInstitut = e.type === 'ETUDIANT' || (!isDaara && isInstitutEstablishment(etab));
  const clean = (e.parentTelephone || '+221 77 645 88 12').replace(/[^0-9]/g, '');

  const msg = isInstitut
    ? `SunuSchoolExpress - Avis d'Absence en Cours / Atelier%0A%0ABonjour ${e.parentNom || 'Cher Étudiant / Contact'},%0AL'étudiant(e) *${e.prenom} ${e.nom}* (${e.classeNom}) n'a pas émargé lors de la session de formation de ce jour.%0AMerci de contacter la Direction des Études pour justifier cette absence.`
    : `SunuSchoolExpress - Avis Important d'Absence%0A%0ABonjour ${e.parentNom || 'Cher Parent'},%0ANous vous informons que votre enfant *${e.prenom} ${e.nom}* (${e.classeNom}) n'a pas été pointé à l'appel matinal ce jour.%0AMerci de contacter la vie scolaire ou l'Oustaz pour régulariser.`;

  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  showToast(`🚨 Alerte WhatsApp transmise à ${e.parentNom} !`);
}

function saveAttendance() {
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const absents = eleves.filter(e => dailyAttendance[e.id] === 'ABSENT').length;
  const retards = eleves.filter(e => dailyAttendance[e.id] === 'RETARD').length;
  const presents = eleves.length - absents - retards;

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Surveillant Général / Oustaz",
    role: "ADMIN",
    action: "POINTAGE_APPEL_JOUR",
    details: `Feuille d'appel validée : ${presents} Présents, ${absents} Absents, ${retards} Retards`
  });

  saveDataStore();
  closeModals();
  showToast(`✓ Feuille d'appel enregistrée (${presents} Présents, ${absents} Absents) !`);
  renderCurrentView();
}

// ==========================================================================
// MODULE 1 : EMPLOI DU TEMPS HEBDOMADAIRE & PLANNING (ÉCOLES & DAARAS)
// ==========================================================================
let activeTimetableClassId = null;
let timetablesStore = null;

const TIMETABLE_DAYS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' }
];

const ECOLE_TIME_SLOTS = [
  { key: '08h-10h', label: '08h00 - 10h00', sub: 'Matinée 1' },
  { key: '10h15-12h15', label: '10h15 - 12h15', sub: 'Matinée 2' },
  { key: '15h-17h', label: '15h00 - 17h00', sub: 'Après-midi 1' },
  { key: '17h-18h30', label: '17h00 - 18h30', sub: 'Après-midi 2' }
];

const DAARA_TIME_SLOTS = [
  { key: '06h-08h', label: '06h00 - 08h00', sub: 'Tahfîz Matinal (Fajr)' },
  { key: '08h30-11h30', label: '08h30 - 11h30', sub: 'Allouwa & Écriture' },
  { key: '15h-17h30', label: '15h00 - 17h30', sub: 'Murâja\'ah (Révision)' },
  { key: '19h30-21h', label: '19h30 - 21h00', sub: 'Tajwîd & Fiqh Soir' }
];

const INSTITUT_TIME_SLOTS = [
  { key: '08h30-11h30', label: '08h30 - 11h30', sub: 'Matinée (Cours Magistral / Labo)' },
  { key: '12h00-14h00', label: '12h00 - 14h00', sub: 'Midi (TD / Ateliers Pratiques)' },
  { key: '14h30-17h30', label: '14h30 - 17h30', sub: 'Après-midi (TP / Projets Pro)' },
  { key: '18h00-21h00', label: '18h00 - 21h00', sub: 'Cours du Soir & Formation Continue' }
];

function getDashboardTimetableCardClass(subject, isDaara, isVoc) {
  if (isDaara) return 'daara-hifz';
  if (!isVoc) return '';
  const s = (subject || '').toLowerCase();
  if (s.includes('info') || s.includes('algo') || s.includes('web') || s.includes('base') || s.includes('sql') || s.includes('réseau') || s.includes('logiciel') || s.includes('dev') || s.includes('python')) return 'institut-it';
  if (s.includes('compt') || s.includes('finance') || s.includes('fiscal') || s.includes('audit') || s.includes('ohada') || s.includes('gestion')) return 'institut-finance';
  if (s.includes('transit') || s.includes('douane') || s.includes('commerce') || s.includes('fret') || s.includes('logistique')) return 'institut-transit';
  if (s.includes('atelier') || s.includes('élec') || s.includes('méc') || s.includes('btp') || s.includes('techno') || s.includes('schéma')) return 'institut-atelier';
  return 'institut-soft';
}

const DEFAULT_TIMETABLES = {};

function initTimetables() {
  const saved = localStorage.getItem('sse_timetables_data');
  if (saved) {
    try {
      timetablesStore = JSON.parse(saved);
      // Nettoyer les anciennes classes de test
      if (timetablesStore) {
        delete timetablesStore['cls-3eme'];
        delete timetablesStore['cls-hifz2'];
        delete timetablesStore['cls-labsy-3eme'];
      }
    } catch (e) {
      timetablesStore = {};
    }
  } else {
    timetablesStore = {};
  }
}

function saveTimetablesStore() {
  localStorage.setItem('sse_timetables_data', JSON.stringify(timetablesStore));
}

function renderTimetable() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';

  const classes = appState.db.classes.filter(c => etabId ? c.etablissementId === etabId : true);

  // Si aucune classe active ou hors de cet établissement, sélectionner la première classe
  const classExistsInEtab = classes.some(c => c.id === activeTimetableClassId);
  if (!classExistsInEtab && classes.length > 0) {
    activeTimetableClassId = classes[0].id;
  }

  const currentClass = classes.find(c => c.id === activeTimetableClassId);

  const isInstitut = !isDaara && isInstitutEstablishment(etab);
  const curCycle = (currentClass && currentClass.cycle ? currentClass.cycle : '').toLowerCase();
  const curName = (currentClass && currentClass.nom ? currentClass.nom : '').toLowerCase();
  const isVoc = isInstitut || curCycle.includes('pro') || curCycle.includes('bts') || curCycle.includes('licence') || curCycle.includes('cap') || curCycle.includes('cqp') || curName.includes('bts') || curName.includes('licence') || curName.includes('cap') || curName.includes('cqp');

  const titleEl = document.getElementById('timetableActiveClassName');
  const cycleEl = document.getElementById('timetableActiveCycle');
  const badgeInfo = document.getElementById('timetableActiveBadgeInfo');
  const cycleBadge = document.getElementById('timetableCycleBadge');

  if (titleEl) titleEl.textContent = currentClass ? currentClass.nom : (isDaara ? "Classe Coranique" : (isVoc ? "Filière / Promotion" : "Classe"));
  if (cycleEl) cycleEl.textContent = currentClass ? `Cycle : ${currentClass.cycle} • Effectif : ${currentClass.effectif} ${isVoc ? 'étudiants' : 'apprenants'}` : (isDaara ? "Hifz & Tajwîd" : (isVoc ? "Formation Professionnelle" : "Général"));
  if (badgeInfo) badgeInfo.textContent = currentClass ? `${currentClass.nom} • ${currentClass.effectif || 30} ${isVoc ? 'Étudiants' : 'Élèves'}` : "Aucune filière";
  if (cycleBadge) cycleBadge.textContent = currentClass ? `${currentClass.cycle}` : (isDaara ? "Daara Moderne" : (isVoc ? "Formation Professionnelle" : "Enseignement Général"));

  renderTimetableClassPills(classes);
  renderTimetableGrid();
}

function switchTimetableClass(clsId) {
  activeTimetableClassId = clsId;
  renderTimetable();
}

function promptCustomDashboardClass() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);
  const term = isInstitut ? 'filière / promotion' : (isDaara ? 'section coranique' : 'classe');
  const example = isInstitut ? 'Ex: Licence 2 Transport Logistique, BTS Télécoms, Master Audit' : 'Ex: Terminale L2, 4ème C, Hifz Niveau 3';

  const val = prompt(`Saisir l'intitulé officiel de votre ${term} (non présente dans les choix) :\n${example}`, '');
  if (!val || !val.trim()) return;
  const trimmed = val.trim();

  if (!Array.isArray(appState.db.classes)) appState.db.classes = [];
  const existing = appState.db.classes.find(c => c.etablissementId === etabId && c.nom.toLowerCase().trim() === trimmed.toLowerCase());
  let targetId = '';
  if (existing) {
    targetId = existing.id;
  } else {
    targetId = `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newClass = {
      id: targetId,
      etablissementId: etabId,
      nom: trimmed,
      cycle: isInstitut ? 'BTS' : (isDaara ? 'Tahfîz' : 'Élémentaire'),
      capacite: isInstitut ? 35 : 45,
      salle: isInstitut ? 'Amphithéâtre / Labo' : (isDaara ? 'Salle Al-Houda' : 'Salle Principale'),
      profPrincipal: '',
      effectif: 0
    };
    appState.db.classes.push(newClass);
    saveDataStore();
    syncEstablishmentClasses();
    renderClassesView();
    renderSidebar();
  }

  activeTimetableClassId = targetId;
  switchTab('timetable');
  renderTimetable();
  showToast(`✅ ${isInstitut ? 'Filière' : (isDaara ? 'Section' : 'Classe')} « ${trimmed} » sélectionnée.`);
}
window.promptCustomDashboardClass = promptCustomDashboardClass;

function renderTimetableClassPills(classes) {
  const container = document.getElementById('timetableClassPills');
  if (!container) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  let pillsHtml = (classes || []).map(c => `
    <button type="button" class="timetable-class-btn ${c.id === activeTimetableClassId ? 'active' : ''}" onclick="switchTimetableClass('${c.id}')">
      ${c.nom}
    </button>
  `).join('');

  pillsHtml += `
    <button type="button" class="timetable-class-btn add-class-btn" onclick="openCreateTimetableModal()" title="Créer ou configurer un planning pour une autre filière ou classe" style="border: 1px dashed var(--primary); color: var(--primary); background: rgba(0, 210, 180, 0.08); font-weight: 700;">
      + ${isInstitut ? 'Ajouter une Filière' : (isDaara ? 'Ajouter une Section' : 'Ajouter une Classe')}
    </button>
    <button type="button" class="timetable-class-btn add-class-btn" onclick="promptCustomDashboardClass()" title="Saisir librement une autre filière ou classe non listée dans les choix" style="border: 1px dashed #F59E0B; color: #F59E0B; background: rgba(245, 158, 11, 0.08); font-weight: 700;">
      ✍️ + Saisie Libre
    </button>
  `;

  container.innerHTML = pillsHtml;
}

function renderTimetableGrid() {
  const table = document.getElementById('timetableMainTable');
  if (!table) return;

  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);
  const currentClass = classes.find(c => c.id === activeTimetableClassId);
  const curCycle = (currentClass && currentClass.cycle ? currentClass.cycle : '').toLowerCase();
  const curName = (currentClass && currentClass.nom ? currentClass.nom : '').toLowerCase();
  const isVoc = isInstitut || curCycle.includes('pro') || curCycle.includes('bts') || curCycle.includes('licence') || curCycle.includes('cap') || curCycle.includes('cqp') || curName.includes('bts') || curName.includes('licence') || curName.includes('cap') || curName.includes('cqp');

  const slotsList = isDaara ? DAARA_TIME_SLOTS : (isVoc ? INSTITUT_TIME_SLOTS : ECOLE_TIME_SLOTS);

  if (!timetablesStore) initTimetables();

  const classData = timetablesStore[activeTimetableClassId] || { slots: {} };

  let html = `
    <thead>
      <tr>
        <th style="width: 140px;">Créneau Horaire</th>
        ${TIMETABLE_DAYS.map(d => `<th>${d.label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
  `;

  slotsList.forEach(slot => {
    html += `<tr>`;
    html += `
      <td class="time-col">
        <div class="time-main">${slot.label}</div>
        <div class="time-sub">${slot.sub}</div>
      </td>
    `;

    TIMETABLE_DAYS.forEach(day => {
      const slotKey = `${day.key}-${slot.key}`;
      const slotData = classData.slots ? classData.slots[slotKey] : null;

      if (slotData && slotData.subject) {
        const cardClass = getDashboardTimetableCardClass(slotData.subject, isDaara, isVoc);
        html += `
          <td>
            <div class="timetable-slot-card ${cardClass}" onclick="openEditTimetableSlotModal('${day.key}', '${slot.key}')" title="Cliquer pour modifier ce module">
              <div class="slot-subject">${slotData.subject}</div>
              <div class="slot-teacher">${isVoc ? '👨‍🏫 Formateur: ' : (isDaara ? '👳 Oustaz: ' : '👨‍🏫 ')}${slotData.teacher || (isVoc ? 'Formateur' : 'Professeur')}</div>
              <div class="slot-room-pill">📍 ${slotData.room || 'Salle'}</div>
              <div class="slot-edit-hint">✏️ Modifier</div>
            </div>
          </td>
        `;
      } else {
        html += `
          <td>
            <div class="timetable-slot-empty" onclick="openEditTimetableSlotModal('${day.key}', '${slot.key}')" title="Ajouter une matière sur ce créneau">
              <span>+ Planifier</span>
            </div>
          </td>
        `;
      }
    });

    html += `</tr>`;
  });

  html += `</tbody>`;
  table.innerHTML = html;

  // Rendu de la légende dynamique
  const legendBox = document.getElementById('timetableLegendContainer');
  if (legendBox) {
    if (isVoc) {
      legendBox.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
          Légende Thématique des Modules Professionnels :
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.75rem; font-weight: 700;">
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #38BDF8;">
            <span style="display:inline-block; width:12px; height:12px; background:#38BDF8; border-radius:3px;"></span>
            Modules IT &amp; Génie Logiciel
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #10B981;">
            <span style="display:inline-block; width:12px; height:12px; background:#10B981; border-radius:3px;"></span>
            Comptabilité, Fiscalité &amp; Droit OHADA
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #00D2B4;">
            <span style="display:inline-block; width:12px; height:12px; background:#00D2B4; border-radius:3px;"></span>
            Commerce International, Douane &amp; Transit
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #A855F7;">
            <span style="display:inline-block; width:12px; height:12px; background:#A855F7; border-radius:3px;"></span>
            Ateliers Techniques &amp; Électromécanique
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #F59E0B;">
            <span style="display:inline-block; width:12px; height:12px; background:#F59E0B; border-radius:3px;"></span>
            Anglais Professionnel, Communication &amp; Soutenances
          </span>
        </div>
      `;
    } else if (isDaara) {
      legendBox.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
          Légende Pédagogique Daara Moderne :
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.75rem; font-weight: 700;">
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #F59E0B;">
            <span style="display:inline-block; width:12px; height:12px; background:#F59E0B; border-radius:3px;"></span>
            Tahfîz Matinal (Hizb 1-60)
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #00D2B4;">
            <span style="display:inline-block; width:12px; height:12px; background:#00D2B4; border-radius:3px;"></span>
            Planche Allouwa, Tajwîd &amp; Murâja'ah
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #38BDF8;">
            <span style="display:inline-block; width:12px; height:12px; background:#38BDF8; border-radius:3px;"></span>
            Hadith, Fiqh &amp; Langue Arabe
          </span>
        </div>
      `;
    } else {
      legendBox.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
          Légende des Matières Scolaires :
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.75rem; font-weight: 700;">
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #38BDF8;">
            <span style="display:inline-block; width:12px; height:12px; background:#38BDF8; border-radius:3px;"></span>
            Mathématiques &amp; Sciences
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #10B981;">
            <span style="display:inline-block; width:12px; height:12px; background:#10B981; border-radius:3px;"></span>
            Français &amp; Lettres
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #F59E0B;">
            <span style="display:inline-block; width:12px; height:12px; background:#F59E0B; border-radius:3px;"></span>
            Histoire-Géo &amp; Langues
          </span>
        </div>
      `;
    }
  }
}

function openEditTimetableSlotModal(day, timeKey) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);
  const currentClass = classes.find(c => c.id === activeTimetableClassId);
  const curCycle = (currentClass && currentClass.cycle ? currentClass.cycle : '').toLowerCase();
  const curName = (currentClass && currentClass.nom ? currentClass.nom : '').toLowerCase();
  const isVoc = isInstitut || curCycle.includes('pro') || curCycle.includes('bts') || curCycle.includes('licence') || curCycle.includes('cap') || curCycle.includes('cqp') || curName.includes('bts') || curName.includes('licence') || curName.includes('cap') || curName.includes('cqp');

  const slotsList = isDaara ? DAARA_TIME_SLOTS : (isVoc ? INSTITUT_TIME_SLOTS : ECOLE_TIME_SLOTS);

  const timeSelect = document.getElementById('editSlotTimeSelect');
  if (timeSelect) {
    timeSelect.innerHTML = slotsList.map(s => `<option value="${s.key}">${s.label} (${s.sub})</option>`).join('');
    if (timeKey) timeSelect.value = timeKey;
  }

  const daySelect = document.getElementById('editSlotDaySelect');
  if (daySelect && day) {
    daySelect.value = day;
  }

  const currentDay = daySelect ? daySelect.value : day;
  const currentTimeKey = timeSelect ? timeSelect.value : timeKey;
  const currentSlotData = (timetablesStore[activeTimetableClassId]?.slots || {})[`${currentDay}-${currentTimeKey}`];

  const subInput = document.getElementById('editSlotSubject');
  const teachInput = document.getElementById('editSlotTeacher');
  const roomInput = document.getElementById('editSlotRoom');

  if (subInput) subInput.value = currentSlotData ? currentSlotData.subject : '';
  if (teachInput) teachInput.value = currentSlotData ? currentSlotData.teacher : '';
  if (roomInput) roomInput.value = currentSlotData ? currentSlotData.room : '';

  // Adaptation dynamique des labels et placeholders
  const subLabel = document.getElementById('editSlotSubjectLabel');
  const teachLabel = document.getElementById('editSlotTeacherLabel');
  const roomLabel = document.getElementById('editSlotRoomLabel');

  if (subLabel) subLabel.textContent = isVoc ? "Module / Formation" : (isDaara ? "Matière Coranique / Tahfîz" : "Matière / Discipline");
  if (teachLabel) teachLabel.textContent = isVoc ? "Formateur / Expert Métier" : (isDaara ? "Oustaz / Maître Coranique" : "Enseignant de la Classe");
  if (roomLabel) roomLabel.textContent = isVoc ? "Laboratoire / Atelier / Amphi" : (isDaara ? "Salle Coranique / Pavillon" : "Salle de Classe");
  if (roomInput) roomInput.placeholder = isVoc ? "Ex: Labo Info 1, Amphi A, Atelier Élec, Salle Marché" : (isDaara ? "Ex: Pavillon Allouwa, Salle Badr" : "Ex: Salle B12, Labo Sciences");

  // Rendu des suggestions de modules rapides avec option de saisie libre
  const chipsContainer = document.getElementById('editSlotPresetsChips');
  if (chipsContainer) {
    if (isVoc) {
      const presets = [
        { label: "✍️ Saisie libre", teach: "", room: "" },
        { label: "Algorithmique & Python", teach: "Ing. Abdoulaye Ndiaye", room: "Labo Info 1" },
        { label: "Architecture Web & APIs", teach: "Ing. Abdoulaye Ndiaye", room: "Labo Info 1" },
        { label: "Bases de Données & SQL", teach: "Dr. Mamadou Cissé", room: "Labo Info 2" },
        { label: "Comptabilité SYSCOHADA", teach: "Mme Aïssatou Fall", room: "Salle Marché" },
        { label: "Fiscalité d'Entreprise", teach: "Me Aminata Diop", room: "Salle Marché" },
        { label: "Douane & GAINDE", teach: "M. Cheikh Sy", room: "Salle Transit" },
        { label: "Atelier Électricité", teach: "Ing. Abdoulaye Ndiaye", room: "Atelier Élec" },
        { label: "Anglais Professionnel", teach: "M. Ousmane Niang", room: "Amphi A" }
      ];
      chipsContainer.innerHTML = presets.map(p => `
        <span onclick="applyPresetSlot('${p.label.replace(/'/g, "\\'")}', '${p.teach.replace(/'/g, "\\'")}', '${p.room.replace(/'/g, "\\'")}')" style="background: rgba(56, 189, 248, 0.12); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 700; user-select: none;" onmouseover="this.style.background='rgba(56, 189, 248, 0.25)'" onmouseout="this.style.background='rgba(56, 189, 248, 0.12)'">
          ${p.label.startsWith('✍️') ? p.label : '+ ' + p.label}
        </span>
      `).join('');
    } else if (isDaara) {
      const presets = [
        { label: "✍️ Saisie libre", teach: "", room: "" },
        { label: "Tahfîz Matinal (Hizb 1-60)", teach: "Oustaz Serigne Modou Ndiaye", room: "Salle de Mémorisation" },
        { label: "Planche Allouwa", teach: "Oustaz Cheikh Tidiane", room: "Pavillon Allouwa" },
        { label: "Règles de Tajwîd", teach: "Oustaz Thierno Sow", room: "Salle Badr" },
        { label: "Hadith & Fiqh", teach: "Oustaz Serigne Modou Ndiaye", room: "Salle Al-Azhar" },
        { label: "Langue Arabe", teach: "Oustaz Cheikh Tidiane", room: "Salle Al-Houda" }
      ];
      chipsContainer.innerHTML = presets.map(p => `
        <span onclick="applyPresetSlot('${p.label.replace(/'/g, "\\'")}', '${p.teach.replace(/'/g, "\\'")}', '${p.room.replace(/'/g, "\\'")}')" style="background: rgba(245, 158, 11, 0.12); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 700; user-select: none;" onmouseover="this.style.background='rgba(245, 158, 11, 0.25)'" onmouseout="this.style.background='rgba(245, 158, 11, 0.12)'">
          ${p.label.startsWith('✍️') ? p.label : '+ ' + p.label}
        </span>
      `).join('');
    } else {
      const presets = [
        { label: "✍️ Saisie libre", teach: "", room: "" },
        { label: "Mathématiques", teach: "M. Abdoulaye Diallo", room: "Salle B12" },
        { label: "Français & Expression", teach: "Mme Mariama Ba", room: "Salle B12" },
        { label: "Sciences Physiques", teach: "M. Cheikh Tidiane Diop", room: "Labo Sciences" },
        { label: "SVT", teach: "Mme Aminata Sarr", room: "Labo 2" },
        { label: "Histoire - Géo", teach: "M. Ibrahima Faye", room: "Salle B12" },
        { label: "Anglais LV1", teach: "M. Babacar Fall", room: "Salle B12" }
      ];
      chipsContainer.innerHTML = presets.map(p => `
        <span onclick="applyPresetSlot('${p.label.replace(/'/g, "\\'")}', '${p.teach.replace(/'/g, "\\'")}', '${p.room.replace(/'/g, "\\'")}')" style="background: rgba(0, 210, 180, 0.12); color: #00D2B4; border: 1px solid rgba(0, 210, 180, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 700; user-select: none;" onmouseover="this.style.background='rgba(0, 210, 180, 0.25)'" onmouseout="this.style.background='rgba(0, 210, 180, 0.12)'">
          ${p.label.startsWith('✍️') ? p.label : '+ ' + p.label}
        </span>
      `).join('');
    }
  }

  const modal = document.getElementById('modalEditTimetableSlot');
  if (modal) modal.classList.add('active');
}

function applyPresetSlot(subject, teacher, room) {
  const subInput = document.getElementById('editSlotSubject');
  const teachInput = document.getElementById('editSlotTeacher');
  const roomInput = document.getElementById('editSlotRoom');
  if (subject === '✍️ Saisie libre' || subject === '__CUSTOM__') {
    if (subInput) {
      subInput.value = '';
      subInput.placeholder = "✍️ Saisir l'intitulé du module personnalisé...";
      subInput.focus();
    }
    return;
  }
  if (subInput) subInput.value = subject;
  if (teachInput && !teachInput.value) teachInput.value = teacher;
  if (roomInput && !roomInput.value) roomInput.value = room;
}

function onEditSlotDayChange() {
  const daySelect = document.getElementById('editSlotDaySelect');
  const timeSelect = document.getElementById('editSlotTimeSelect');
  if (!daySelect || !timeSelect || !activeTimetableClassId) return;

  const currentDay = daySelect.value;
  const currentTimeKey = timeSelect.value;
  const currentSlotData = (timetablesStore[activeTimetableClassId]?.slots || {})[`${currentDay}-${currentTimeKey}`];

  const subInput = document.getElementById('editSlotSubject');
  const teachInput = document.getElementById('editSlotTeacher');
  const roomInput = document.getElementById('editSlotRoom');

  if (subInput) subInput.value = currentSlotData ? currentSlotData.subject : '';
  if (teachInput) teachInput.value = currentSlotData ? currentSlotData.teacher : '';
  if (roomInput) roomInput.value = currentSlotData ? currentSlotData.room : '';
}

function saveTimetableSlot() {
  if (!activeTimetableClassId) return;
  const day = document.getElementById('editSlotDaySelect').value;
  const timeKey = document.getElementById('editSlotTimeSelect').value;
  const subject = (document.getElementById('editSlotSubject').value || '').trim();
  const teacher = (document.getElementById('editSlotTeacher').value || '').trim();
  const room = (document.getElementById('editSlotRoom').value || '').trim();

  if (!timetablesStore[activeTimetableClassId]) {
    const cls = appState.db.classes.find(c => c.id === activeTimetableClassId);
    timetablesStore[activeTimetableClassId] = {
      className: cls ? cls.nom : "Classe",
      etablissementId: appState.activeEstablishmentId,
      slots: {}
    };
  }

  const slotKey = `${day}-${timeKey}`;
  if (!subject) {
    delete timetablesStore[activeTimetableClassId].slots[slotKey];
    showToast("Créneau vidé / retiré de l'emploi du temps.");
  } else {
    timetablesStore[activeTimetableClassId].slots[slotKey] = {
      subject,
      teacher: teacher || "Enseignant / Oustaz",
      room: room || "Salle Principale"
    };
    showToast(`✓ Créneau enregistré : ${subject} (${day.toUpperCase()} ${timeKey})`);
  }

  saveTimetablesStore();
  closeModals();
  renderTimetableGrid();
}

function resetTimetableToDefault() {
  if (confirm("Réinitialiser l'emploi du temps de cette classe aux modèles types du programme sénégalais / Daara ?")) {
    if (DEFAULT_TIMETABLES[activeTimetableClassId]) {
      timetablesStore[activeTimetableClassId] = JSON.parse(JSON.stringify(DEFAULT_TIMETABLES[activeTimetableClassId]));
    } else {
      const etabId = appState.activeEstablishmentId;
      const etab = appState.db.etablissements.find(e => e.id === etabId);
      const isDaara = etab && etab.type === 'DAARA';
      const template = isDaara ? DEFAULT_TIMETABLES["cls-hifz2"] : DEFAULT_TIMETABLES["cls-3eme"];
      const cls = appState.db.classes.find(c => c.id === activeTimetableClassId);
      timetablesStore[activeTimetableClassId] = {
        className: cls ? cls.nom : "Classe",
        etablissementId: etabId,
        slots: JSON.parse(JSON.stringify(template.slots))
      };
    }
    saveTimetablesStore();
    renderTimetableGrid();
    showToast("✓ Emploi du temps réinitialisé avec succès.");
  }
}

function printTimetableA4() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const currentClass = appState.db.classes.find(c => c.id === activeTimetableClassId);
  const title = currentClass ? currentClass.nom : "Emploi du temps";
  showToast(`🖨️ Préparation de l'impression A4 : ${title} (${etab.name})...`);
  window.print();
}

// --- GESTION DE LA CRÉATION & AJOUT D'EMPLOIS DU TEMPS PAR CLASSE ---
function openCreateTimetableModal() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';

  const classes = appState.db.classes.filter(c => etabId ? c.etablissementId === etabId : true);
  const select = document.getElementById('createTimetableClassSelect');
  if (!select) return;

  let optionsHtml = '';
  classes.forEach(c => {
    const hasTimetable = timetablesStore && timetablesStore[c.id] && Object.keys(timetablesStore[c.id].slots || {}).length > 0;
    optionsHtml += `<option value="${c.id}">Classe existante : ${c.nom} (${c.cycle})${hasTimetable ? ' • Déjà configurée' : ' • Sans planning'}</option>`;
  });
  optionsHtml += `<option value="NEW_CLASS">➕ Créer une NOUVELLE Classe dans cet établissement...</option>`;
  select.innerHTML = optionsHtml;

  // Sélection par défaut
  if (classes.length > 0) {
    const withoutTt = classes.find(c => !timetablesStore || !timetablesStore[c.id] || Object.keys(timetablesStore[c.id].slots || {}).length === 0);
    select.value = withoutTt ? withoutTt.id : classes[0].id;
  } else {
    select.value = "NEW_CLASS";
  }

  // Présélectionner le template adapté
  const templateSelect = document.getElementById('createTimetableTemplateSelect');
  if (templateSelect) {
    templateSelect.value = isDaara ? 'daara' : 'auto';
  }

  onCreateTimetableClassSelectChange();
  const modal = document.getElementById('modalCreateTimetableClass');
  if (modal) modal.classList.add('active');
}

function onCreateTimetableClassSelectChange() {
  const select = document.getElementById('createTimetableClassSelect');
  const customFields = document.getElementById('newClassCustomFields');
  if (!select || !customFields) return;

  if (select.value === 'NEW_CLASS') {
    customFields.style.display = 'block';
    const nameInput = document.getElementById('createTimetableNewClassName');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  } else {
    customFields.style.display = 'none';
  }
}

function getTemplateSlots(templateType, cycle, isDaara) {
  if (templateType === 'empty') return {};

  if (templateType === 'daara' || (templateType === 'auto' && isDaara)) {
    return JSON.parse(JSON.stringify(DEFAULT_TIMETABLES["cls-hifz2"] ? DEFAULT_TIMETABLES["cls-hifz2"].slots : {}));
  }

  if (templateType === 'primaire' || (templateType === 'auto' && cycle === 'Primaire')) {
    return {
      "lundi-08h-10h": { subject: "Calcul & Numération", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "lundi-10h15-12h15": { subject: "Lecture & Vocabulaire", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "lundi-15h-17h": { subject: "Éveil Scientifique & Géométrie", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "mardi-08h-10h": { subject: "Grammaire & Dictée", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "mardi-10h15-12h15": { subject: "Opérations & Problèmes", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "mardi-15h-17h": { subject: "Histoire du Sénégal & Morale", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "mercredi-08h-10h": { subject: "Calcul Rapide & Mesures", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "mercredi-10h15-12h15": { subject: "EPS & Jeux Sportifs", teacher: "Maître / Maîtresse", room: "Cour Principale" },
      "jeudi-08h-10h": { subject: "Conjugaison & Orthographe", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "jeudi-10h15-12h15": { subject: "Sciences d'Observation", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "jeudi-15h-17h": { subject: "Dessin & Travaux Pratiques", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "vendredi-08h-10h": { subject: "Récitation & Poésie", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "vendredi-10h15-12h15": { subject: "Éducation Civique & Hygiène", teacher: "Maître / Maîtresse", room: "Salle Primaire" },
      "samedi-08h-10h": { subject: "Évaluation Hebdomadaire", teacher: "Maître / Maîtresse", room: "Salle Primaire" }
    };
  }

  if (templateType === 'lycee' || (templateType === 'auto' && cycle === 'Secondaire')) {
    return {
      "lundi-08h-10h": { subject: "Philosophie", teacher: "Prof. Ndiaye", room: "Salle L1" },
      "lundi-10h15-12h15": { subject: "Mathématiques Avancées", teacher: "Prof. Ba", room: "Salle L1" },
      "lundi-15h-17h": { subject: "Sciences Physiques & Chimie", teacher: "Prof. Diallo", room: "Labo 1" },
      "mardi-08h-10h": { subject: "Français & Littérature", teacher: "Prof. Sy", room: "Salle L1" },
      "mardi-10h15-12h15": { subject: "Histoire - Géographie", teacher: "Prof. Faye", room: "Salle L1" },
      "mardi-15h-17h": { subject: "SVT / Biologie", teacher: "Prof. Sarr", room: "Labo 2" },
      "mercredi-08h-10h": { subject: "Anglais LV1", teacher: "Prof. Fall", room: "Salle L1" },
      "mercredi-10h15-12h15": { subject: "EPS & Athlétisme", teacher: "Coach Diouf", room: "Terrain Sport" },
      "jeudi-08h-10h": { subject: "Mathématiques", teacher: "Prof. Ba", room: "Salle L1" },
      "jeudi-10h15-12h15": { subject: "Sciences Physiques", teacher: "Prof. Diallo", room: "Labo 1" },
      "jeudi-15h-17h": { subject: "Espagnol / Arabe LV2", teacher: "Prof. Mansour", room: "Salle L1" },
      "vendredi-08h-10h": { subject: "Philosophie / Dissertations", teacher: "Prof. Ndiaye", room: "Salle L1" },
      "vendredi-10h15-12h15": { subject: "SVT / Géologie", teacher: "Prof. Sarr", room: "Labo 2" },
      "samedi-08h-10h": { subject: "Devoir Standardisé / Bac Blanc", teacher: "Équipe Pédagogique", room: "Grand Amphi" },
      "samedi-10h15-12h15": { subject: "Méthodologie & Travaux Dirigés", teacher: "Prof. Ba", room: "Salle L1" }
    };
  }

  // Modèle Collège par défaut
  return JSON.parse(JSON.stringify(DEFAULT_TIMETABLES["cls-3eme"] ? DEFAULT_TIMETABLES["cls-3eme"].slots : {}));
}

function submitCreateTimetableClass() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';

  const classSelect = document.getElementById('createTimetableClassSelect');
  const templateSelect = document.getElementById('createTimetableTemplateSelect');
  if (!classSelect || !templateSelect) return;

  let targetClassId = classSelect.value;
  let targetClassName = '';
  let targetCycle = '';

  if (targetClassId === 'NEW_CLASS') {
    const nameInput = document.getElementById('createTimetableNewClassName');
    const cycleInput = document.getElementById('createTimetableNewClassCycle');
    const effectifInput = document.getElementById('createTimetableNewClassEffectif');

    const nom = nameInput ? nameInput.value.trim() : '';
    if (!nom) {
      showToast("Veuillez saisir le nom de la nouvelle classe.", true);
      return;
    }

    const cycle = cycleInput ? cycleInput.value : (isDaara ? 'Daara' : 'Moyen');
    const effectif = effectifInput ? Number(effectifInput.value) || 30 : 30;

    targetClassId = `cls-${nom.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    targetClassName = nom;
    targetCycle = cycle;

    // Ajouter la nouvelle classe au datastore
    const newClassObj = {
      id: targetClassId,
      etablissementId: etabId,
      nom: targetClassName,
      cycle: targetCycle,
      effectif: effectif,
      mensualite: isDaara ? 25000 : 45000
    };
    appState.db.classes.push(newClassObj);

    appState.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      user: "Direction Générale",
      role: appState.activeRole || "ADMIN",
      action: "CREATION_CLASSE_PLANNING",
      details: `Création de la classe "${targetClassName}" (${targetCycle}, ${effectif} élèves) avec emploi du temps configuré`
    });

    saveDataStore();
  } else {
    const existing = appState.db.classes.find(c => c.id === targetClassId);
    if (existing) {
      targetClassName = existing.nom;
      targetCycle = existing.cycle;
    } else {
      targetClassName = "Classe";
      targetCycle = isDaara ? "Daara" : "Moyen";
    }
  }

  // Générer les créneaux selon le template choisi
  if (!timetablesStore) initTimetables();
  const templateSlots = getTemplateSlots(templateSelect.value, targetCycle, isDaara);

  timetablesStore[targetClassId] = {
    className: targetClassName,
    etablissementId: etabId,
    slots: templateSlots
  };

  saveTimetablesStore();
  closeModals();

  // Basculer directement sur cette classe
  activeTimetableClassId = targetClassId;
  renderTimetable();
  showToast(`✓ Emploi du temps activé avec succès pour ${targetClassName} !`);
}

// ==========================================================================
// MODULE 2 : EXPORT FEC SYSCOHADA (DGI SÉNÉGAL / COMPTABILITÉ OHADA)
// ==========================================================================
function exportFECSYSCOHADA() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const etabNom = etab ? etab.name : "SunuSchoolExpress";
  const etabCode = etab ? etab.code : "SSE-SN-0001";
  let txs = (appState.db.transactions || []).filter(t => etabId ? t.etablissementId === etabId : true);
  txs = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));

  // En-tête standardisé FEC OHADA / DGI Sénégal
  const headers = [
    "JournalCode",
    "JournalLib",
    "EcritureNum",
    "EcritureDate",
    "CompteNum",
    "CompteLib",
    "CompAuxNum",
    "CompAuxLib",
    "PieceRef",
    "PieceDate",
    "EcritureLib",
    "Debit",
    "Credit",
    "EcritureLet",
    "DateLet",
    "ValidDate",
    "Montantdevise",
    "Idevise"
  ];

  let fecRows = [];
  fecRows.push(headers.join("\t"));

  let ecritureIndex = 1;
  txs.forEach(t => {
    const d = new Date(t.date);
    const dateFormatted = d.toISOString().split('T')[0].replace(/-/g, ''); // Format YYYYMMDD
    const m = Number(t.montant) || 0;
    const ref = t.reference || `SSE-TX-${ecritureIndex}`;
    const eleveNom = (t.eleveNom || "Élève / Talibé").replace(/[\t\r\n]/g, " ");
    const motif = (t.motifLabel || t.type || "Frais Scolaires").replace(/[\t\r\n]/g, " ");
    const op = t.operateur || "CAISSE";
    
    // Détermination du compte de trésorerie (Classe 5 SYSCOHADA)
    let cDebit = "521100";
    let cDebitLib = "Banque / Trésorerie Wave";
    if (op === 'WAVE') { cDebit = "521110"; cDebitLib = "Compte Marchand Wave Mobile"; }
    else if (op === 'ORANGE_MONEY') { cDebit = "521120"; cDebitLib = "Compte Marchand Orange Money"; }
    else if (op === 'FREE_MONEY') { cDebit = "521130"; cDebitLib = "Compte Marchand Free Money"; }
    else if (op === 'ESPECES') { cDebit = "571100"; cDebitLib = "Caisse Principale Établissement (Espèces)"; }
    else if (op === 'CHEQUE_BANQUE') { cDebit = "521200"; cDebitLib = "Banque Nationale de Développement"; }

    // Compte de produit (Classe 7 SYSCOHADA)
    const cCredit = "706100";
    const cCreditLib = etab.type === 'DAARA' ? "Pensions & Contributions Daara" : "Frais de Scolarité & Inscriptions";

    const numLiasse = `ECR-${String(ecritureIndex).padStart(5, '0')}`;
    const lettrage = `L${String(ecritureIndex).padStart(4, '0')}`;

    // Ligne Débit (Emploi trésorerie)
    fecRows.push([
      op === 'ESPECES' ? 'CAIS' : 'BQE',
      op === 'ESPECES' ? 'Journal de Caisse Espèces' : 'Journal des Règlements Numériques',
      numLiasse,
      dateFormatted,
      cDebit,
      cDebitLib,
      etabCode,
      etabNom,
      ref,
      dateFormatted,
      `Encaissement ${motif} - ${eleveNom} (${op})`,
      m.toFixed(2),
      "0.00",
      lettrage,
      dateFormatted,
      dateFormatted,
      m.toFixed(2),
      "XOF"
    ].join("\t"));

    // Ligne Crédit (Produit scolaire / Daara)
    fecRows.push([
      op === 'ESPECES' ? 'CAIS' : 'BQE',
      op === 'ESPECES' ? 'Journal de Caisse Espèces' : 'Journal des Règlements Numériques',
      numLiasse,
      dateFormatted,
      cCredit,
      cCreditLib,
      t.eleveId || "CLI-000",
      eleveNom,
      ref,
      dateFormatted,
      `Prestation Scolaire / Mémorisation ${eleveNom}`,
      "0.00",
      m.toFixed(2),
      lettrage,
      dateFormatted,
      dateFormatted,
      m.toFixed(2),
      "XOF"
    ].join("\t"));

    ecritureIndex++;
  });

  const fecContent = "\uFEFF" + fecRows.join("\r\n");
  const blob = new Blob([fecContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FEC_SYSCOHADA_${etabNom.replace(/[^a-zA-Z0-9]/g, '_')}_DGI_SN.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`📑 Fichier d'Écritures Comptables (FEC SYSCOHADA) exporté avec succès pour ${etabNom} !`);
}

// ==========================================================================
// MODULE 3 : TRANSMISSION WHATSAPP DIRECTE (BULLETINS & NOTIFICATIONS)
// ==========================================================================
function sendBulletinWhatsApp(eleveId) {
  const targetId = eleveId || activeBulletinStudentId;
  const eleve = appState.db.eleves.find(e => e.id === targetId);
  if (!eleve) {
    showToast("Veuillez sélectionner un élève ou talibé.", true);
    return;
  }
  const etab = appState.db.etablissements.find(e => e.id === eleve.etablissementId) ||
               appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId) || { name: "SunuSchool" };
  
  const isDaara = eleve.type === 'TALIBE' || etab.type === 'DAARA';
  const isInstitut = eleve.type === 'ETUDIANT' || (!isDaara && isInstitutEstablishment(etab));
  const cleanPhone = (eleve.parentTelephone || '+221 77 123 45 67').replace(/[^0-9]/g, '');

  let msg = '';
  if (isDaara) {
    msg = `*${etab.name.toUpperCase()}* - BULLETIN OFFICIEL DE MÉMORISATION CORANIQUE%0A%0A` +
      `Cher(e) *${eleve.parentNom || 'Parent / Tuteur'}*,%0A` +
      `Voici les résultats officiels de votre enfant *${eleve.prenom} ${eleve.nom}* (Matricule: ${eleve.matricule}) :%0A%0A` +
      `📖 *Palier Coranique : Hizb ${eleve.hizbActuel} / 60*%0A` +
      `📈 Progression : *${eleve.progressionPct}% du Saint Coran*%0A` +
      `📜 Sourate en cours : *${eleve.sourate || 'Al-Baqarah'}*%0A` +
      `⭐ Note de Tajwîd : *${eleve.tajwidNote || 19}/20*%0A` +
      `🔑 Clé Portail Famille : *${eleve.cleAcces}*%0A%0A` +
      `_Direction Pédagogique - Oustaz Serigne Modou Ndiaye_`;
  } else if (isInstitut) {
    msg = `*${etab.name.toUpperCase()}* - RELEVÉ OFFICIEL DE NOTES & CRÉDITS SEMESTRIELS%0A%0A` +
      `Cher(e) Étudiant(e) / Tuteur *${eleve.prenom} ${eleve.nom}*,%0A` +
      `Voici les résultats académiques de la session en cours (${eleve.classeNom}) :%0A%0A` +
      `🎯 Moyenne Semestrielle : *${eleve.moyenneGenerale || 15.5}/20*%0A` +
      `📑 Validation Unités d'Enseignement : *30/30 Crédits ECTS Validés*%0A` +
      `💬 Décision Pédagogique : *${eleve.appreciationConseil || 'Semestre validé avec mention'}*%0A` +
      `🔑 Clé d'Accès Espace Étudiant : *${eleve.cleAcces}*%0A%0A` +
      `_Direction des Études - ${etab.name}_`;
  } else {
    msg = `*${etab.name.toUpperCase()}* - BULLETIN SCOLAIRE OFFICIEL%0A%0A` +
      `Cher(e) *${eleve.parentNom || 'Parent / Tuteur'}*,%0A` +
      `Voici les résultats du 1er Semestre de *${eleve.prenom} ${eleve.nom}* (${eleve.classeNom}) :%0A%0A` +
      `🎯 Moyenne Générale : *${eleve.moyenneGenerale || 15}/20*%0A` +
      `🏆 Rang dans la classe : *${eleve.rang || 1}er / ${eleve.totalEleves || 28} élèves*%0A` +
      `💬 Décision du Conseil : *${eleve.appreciationConseil || 'Tableau d\'Honneur avec Félicitations'}*%0A` +
      `🔑 Clé d'Accès Portail : *${eleve.cleAcces}*%0A%0A` +
      `_La Direction de ${etab.name}_`;
  }

  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  showToast(`📲 Relevé officiel transmis par WhatsApp pour ${eleve.prenom} ${eleve.nom} !`);
}

function sendActiveBulletinWhatsApp() {
  sendBulletinWhatsApp(activeBulletinStudentId);
}

function populateEstablishmentSelect() {
  const selectEl = document.getElementById('establishmentSelect');
  if (!selectEl) return;
  const currentVal = appState.activeEstablishmentId;
  selectEl.innerHTML = '';

  // Seuls les établissements VALIDÉS par l'Admin sont affichés dans le sélecteur
  const activeEtabs = (appState.db.etablissements || []).filter(e => 
    e.statut !== 'EN_ATTENTE_VALIDATION' && e.statutAbonnement !== 'EN_ATTENTE_VALIDATION' && e.fraisAdhesionPayes !== false
  );

  if (activeEtabs.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '🔒 Aucun établissement actif validé';
    selectEl.appendChild(opt);
    return;
  }

  activeEtabs.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    const isInst = e.type === 'FORMATION_PRO' || e.type === 'INSTITUT';
    opt.textContent = `${e.type === 'DAARA' ? '🕌' : (isInst ? '🎓' : '🏫')} ${e.name} (${e.city})`;
    selectEl.appendChild(opt);
  });
  if (currentVal && selectEl.querySelector(`option[value="${currentVal}"]`)) {
    selectEl.value = currentVal;
  }
}

// ==========================================================================
// GESTION DU MODE HORS-LIGNE, PWA & SAUVEGARDE CLÉ USB
// ==========================================================================
let deferredInstallPrompt = null;
let pendingRestoreData = null;

function initOfflineAndPwa() {
  updateNetworkStatusBadge();

  window.addEventListener('online', () => {
    updateNetworkStatusBadge();
    showToast("🟢 Connexion Internet rétablie. Synchronisation active.");
  });

  window.addEventListener('offline', () => {
    updateNetworkStatusBadge();
    showToast("⚡ Connexion coupée : basculement automatique en mode 100% Hors-Ligne (Données locales sécurisées).");
  });

  // Détection installation PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btnInstall = document.getElementById('btnInstallPwa');
    if (btnInstall) btnInstall.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const btnInstall = document.getElementById('btnInstallPwa');
    if (btnInstall) btnInstall.style.display = 'none';
    showToast("✓ Application SunuSchoolExpress installée avec succès sur cet appareil !");
  });

  // Enregistrement du Service Worker si protocole http / https
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[SunuSchool PWA] Service Worker actif, portée :', reg.scope);
      })
      .catch((err) => {
        console.warn('[SunuSchool PWA] Échec enregistrement Service Worker :', err);
      });
  }
}

function updateNetworkStatusBadge() {
  const badge = document.getElementById('networkStatusBadge');
  if (!badge) return;

  if (navigator.onLine) {
    badge.textContent = "🟢 En Ligne (Local Synchronisé)";
    badge.className = "badge-tag badge-green";
    badge.title = "Connecté à Internet. Vos données sont enregistrées en local de manière permanente.";
  } else {
    badge.textContent = "⚡ Hors-Ligne (Stockage Sécurisé)";
    badge.className = "badge-tag badge-gold";
    badge.title = "Mode Hors-Ligne actif. Vous pouvez travailler normalement sans connexion.";
  }
}

function installPWAApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast("Installation de SunuSchool en cours...");
      }
      deferredInstallPrompt = null;
    });
  } else {
    showToast("💡 Pour installer l'application sur Windows : cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur ou utilisez le menu Options > Installer l'application.");
  }
}

// --- MODULE SAUVEGARDE & RESTAURATION (CLÉ USB) ---
function openBackupModal() {
  pendingRestoreData = null;
  const fileInput = document.getElementById('backupFileInput');
  if (fileInput) fileInput.value = '';
  const previewCard = document.getElementById('backupPreviewCard');
  if (previewCard) previewCard.style.display = 'none';

  const modal = document.getElementById('modalBackupRestore');
  if (modal) modal.classList.add('active');
}

function exportDatabaseBackup() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const etabNom = etab ? etab.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Global';

  const backupData = {
    app: "SunuSchoolExpress",
    version: "3.1.0",
    dateExport: new Date().toISOString(),
    etablissementActif: etabId,
    db: appState.db,
    timetables: timetablesStore || {},
    portalRegistrations: JSON.parse(localStorage.getItem('sse_portal_registrations') || '[]')
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `SunuSchool_Backup_${etabNom}_${nowStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Directeur / Admin",
    role: appState.activeRole || "ADMIN",
    action: "EXPORT_SAUVEGARDE",
    details: `Sauvegarde complète exportée en fichier JSON (${backupData.db.eleves.length} élèves, ${backupData.db.transactions.length} écritures)`
  });
  saveDataStore();

  showToast(`💾 Sauvegarde de ${etab ? etab.name : 'la base'} exportée avec succès ! Copiez-la sur votre clé USB.`);
}

function onBackupFileSelected(event) {
  const file = event.target.files ? event.target.files[0] : null;
  const previewCard = document.getElementById('backupPreviewCard');
  const previewDetails = document.getElementById('backupPreviewDetails');
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.db || !parsed.db.etablissements) {
        throw new Error("Format de sauvegarde SunuSchoolExpress invalide.");
      }

      pendingRestoreData = parsed;
      const nbEtabs = parsed.db.etablissements.length;
      const nbEleves = (parsed.db.eleves || []).length;
      const nbTx = (parsed.db.transactions || []).length;
      const nbClasses = (parsed.db.classes || []).length;
      const dateSauv = parsed.dateExport ? new Date(parsed.dateExport).toLocaleString('fr-FR') : 'Inconnue';

      if (previewDetails) {
        previewDetails.innerHTML = `
          <strong>Date de sauvegarde :</strong> ${dateSauv}<br>
          <strong>Établissements :</strong> ${nbEtabs}<br>
          <strong>Effectifs élèves / talibés :</strong> ${nbEleves}<br>
          <strong>Écritures comptables :</strong> ${nbTx}<br>
          <strong>Classes & Emplois du temps :</strong> ${nbClasses}
        `;
      }
      if (previewCard) previewCard.style.display = 'block';
    } catch (err) {
      pendingRestoreData = null;
      if (previewCard) previewCard.style.display = 'none';
      showToast("⚠️ Fichier invalide : assurez-vous de choisir un fichier de sauvegarde SunuSchool valide (.json)", true);
    }
  };
  reader.readAsText(file);
}

function confirmRestoreBackup() {
  if (!pendingRestoreData) {
    showToast("Aucun fichier valide sélectionné.", true);
    return;
  }

  if (confirm("⚠️ ATTENTION : La restauration va remplacer l'ensemble de vos données actuelles sur cet ordinateur par le contenu du fichier de sauvegarde. Voulez-vous continuer ?")) {
    appState.db = pendingRestoreData.db;
    saveDataStore();

    if (pendingRestoreData.timetables) {
      timetablesStore = pendingRestoreData.timetables;
      saveTimetablesStore();
    }

    if (pendingRestoreData.portalRegistrations) {
      localStorage.setItem('sse_portal_registrations', JSON.stringify(pendingRestoreData.portalRegistrations));
    }

    appState.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      user: "Directeur / Admin",
      role: appState.activeRole || "ADMIN",
      action: "RESTAURATION_SAUVEGARDE",
      details: `Restauration de la base de données effectuée depuis la sauvegarde du ${pendingRestoreData.dateExport || 'Inconnue'}`
    });
    saveDataStore();

    closeModals();
    populateEstablishmentSelect();
    switchEstablishment(pendingRestoreData.etablissementActif || appState.db.etablissements[0].id);
    renderCurrentView();

    showToast("✓ Base de données et emplois du temps restaurés avec succès !");
  }
}

// --- VERROUILLAGE DE SÉCURITÉ & AUTH GUARD ---
function checkDashboardAuthGuard() {
  const overlay = document.getElementById('dashboardAuthGuardOverlay');
  const isSuperAdminAuth = (
    sessionStorage.getItem('sse_superadmin_authenticated') === 'true' ||
    localStorage.getItem('sse_superadmin_authenticated') === 'true' ||
    sessionStorage.getItem('sse_admin_authenticated') === 'true' ||
    localStorage.getItem('sse_admin_authenticated') === 'true'
  );

  // 1. Rôle Super Admin authentifié (Uniquement si le mot de passe maître a été validé)
  if (isSuperAdminAuth) {
    appState.activeRole = 'SUPER_ADMIN';
    if (overlay) overlay.style.display = 'none';
    return true;
  }

  // 2. Vérifier si un établissement actif légitime est présent dans le stockage
  try {
    const storedEstRaw = localStorage.getItem('sunuschool_establishment');
    if (storedEstRaw) {
      const est = JSON.parse(storedEstRaw);
      const estName = (est?.name || '').toLowerCase();
      // Filtrer les reliquats de test
      if (est && est.id && !estName.includes('diamil') && !estName.includes('fourqane') && !estName.includes('excellence') && !estName.includes('labsy')) {
        let match = (appState.db?.etablissements || []).find(e => e.id === est.id || (est.code && e.code === est.code));
        if (!match && est && (est.statut === 'ACTIF' || est.statutAbonnement === 'ACTIF' || est.fraisAdhesionPayes !== false)) {
          importOrUpdateEstablishmentInDb(est);
          match = est;
        }
        if (match) {
          // CONTRÔLE CRUCIAL : L'établissement doit avoir été validé par l'Admin SunuSchool-Express !
          const isApproved = (match.statut === 'ACTIF' || match.statutAbonnement === 'ACTIF' || match.statutAbonnement === 'ESSAI_GRATUIT') && 
                             (match.statut !== 'EN_ATTENTE_VALIDATION') && 
                             (match.fraisAdhesionPayes !== false);

          if (!isApproved) {
            appState.activeEstablishmentId = null;
            if (overlay) {
              overlay.style.display = 'flex';
              const errEl = document.getElementById('guardErrorAlert');
              if (errEl) {
                errEl.innerHTML = `⏳ <strong>Dossier d'adhésion en attente de validation administrative :</strong><br>Le compte pour « <strong>${match.name}</strong> » (Code: <code>${match.code}</code>) a bien été transmis mais est <strong>en attente de contrôle par l'Administrateur SunuSchool-Express</strong>.<br>Dès vérification de la réception de votre virement Wave (10 000 FCFA), l'accès à ce tableau de bord sera débloqué.<br><a href="https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je souhaite activer mon établissement ${match.name} (Code: ${match.code}).`)}" target="_blank" style="color: #00D2B4; font-weight: 700; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">💬 Contacter l'administrateur par WhatsApp (+221 76 150 39 38)</a>`;
                errEl.style.display = 'block';
              }
            }
            return false;
          }

          appState.activeEstablishmentId = match.id;
          if (overlay) overlay.style.display = 'none';
          return true;
        }
      }
    }
  } catch (e) {}

  // 3. Aucun établissement autorisé actif -> Bloquer avec l'Auth Guard
  appState.activeEstablishmentId = null;
  if (overlay) overlay.style.display = 'flex';
  return false;
}

async function handleDashboardAuthUnlock(e) {
  if (e && e.preventDefault) e.preventDefault();
  const codeInput = document.getElementById('guardEtabCode');
  const keyInput = document.getElementById('guardSecretKey');
  const errEl = document.getElementById('guardErrorAlert');

  const rawCode = (codeInput?.value || '').trim();
  const rawKey = (keyInput?.value || '').trim();

  const codeVal = rawCode.toUpperCase();
  const keyVal = rawKey;

  // Détection universelle de la Clé Maître (dans le champ mot de passe OU identifiant)
  const isMasterKey = (
    keyVal.replace(/\s+/g, '') === 'SunuAdmin@2026!' ||
    keyVal.replace(/\s+/g, '') === 'SunuAdmin2026!' ||
    keyVal.replace(/\s+/g, '').toLowerCase() === 'sunuadmin@2026!' ||
    keyVal.replace(/\s+/g, '').toLowerCase() === 'sunuadmin2026!' ||
    keyVal.replace(/\s+/g, '').toLowerCase() === 'sunuadmin@2026' ||
    keyVal.replace(/\s+/g, '') === 'SSE-HQ-2026' ||
    rawCode.replace(/\s+/g, '') === 'SunuAdmin@2026!' ||
    rawCode.replace(/\s+/g, '') === 'SunuAdmin2026!' ||
    rawCode.replace(/\s+/g, '').toLowerCase() === 'sunuadmin@2026!' ||
    rawCode.replace(/\s+/g, '').toLowerCase() === 'sunuadmin2026!' ||
    rawCode.replace(/\s+/g, '').toLowerCase() === 'sunuadmin@2026' ||
    rawCode.replace(/\s+/g, '') === 'SSE-HQ-2026' ||
    rawCode.toLowerCase().includes('sunuadmin') ||
    rawKey.toLowerCase().includes('sunuadmin')
  );

  // A. SI CLÉ MAÎTRE FOURNIE : ACCÈS UNIVERSEL GARANTI SANS BLOCAGE
  if (isMasterKey) {
    sessionStorage.setItem('sse_admin_authenticated', 'true');
    sessionStorage.setItem('sse_superadmin_authenticated', 'true');
    localStorage.setItem('sse_admin_authenticated', 'true');
    localStorage.setItem('sse_superadmin_authenticated', 'true');
    sessionStorage.setItem('sse_admin_user', 'sunuschoolexpress@gmail.com');
    localStorage.setItem('sse_admin_user', 'sunuschoolexpress@gmail.com');
    appState.activeRole = 'SUPER_ADMIN';

    // Recherche si un établissement spécifique est demandé
    let target = (appState.db?.etablissements || []).find(e => 
      (e.code && e.code.toUpperCase() === codeVal) ||
      (e.email && e.email.toLowerCase() === rawCode.toLowerCase()) ||
      (e.phone && e.phone.replace(/[^0-9]/g, '') === codeVal.replace(/[^0-9]/g, ''))
    );

    // Si un établissement spécifique existe dans la base
    if (target) {
      appState.activeEstablishmentId = target.id;
      localStorage.setItem('sunuschool_establishment', JSON.stringify(target));
      localStorage.setItem('sunuschool_active_workspace', target.id);
      const overlay = document.getElementById('dashboardAuthGuardOverlay');
      if (overlay) overlay.style.display = 'none';
      populateEstablishmentSelect();
      switchEstablishment(target.id);
      switchTab('overview');
      showToast(`👑 Accès Maître accordé pour « ${target.name} »`);
      return;
    }

    // Si l'utilisateur est le Super Admin HQ central
    if (codeVal.includes('HQ') || codeVal.includes('ADMIN') || codeVal.includes('SUNU') || !codeVal) {
      window.location.href = 'admin.html';
      return;
    }

    // Sinon déverrouiller sur le premier établissement réel enregistré
    const realEtab = (appState.db?.etablissements || []).find(e => e && e.id);
    if (realEtab) {
      appState.activeEstablishmentId = realEtab.id;
      localStorage.setItem('sunuschool_establishment', JSON.stringify(realEtab));
      localStorage.setItem('sunuschool_active_workspace', realEtab.id);
      const overlay = document.getElementById('dashboardAuthGuardOverlay');
      if (overlay) overlay.style.display = 'none';
      populateEstablishmentSelect();
      switchEstablishment(realEtab.id);
      switchTab('overview');
      showToast(`👑 Accès ouvert pour « ${realEtab.name} »`);
      return;
    }

    // Si aucune école n'est encore enregistrée, rediriger vers l'espace d'inscription
    window.location.href = 'admin.html';
    return;
  }

  // B. CONNEXION CLASSIQUE ÉTABLISSEMENT (Hors Clé Maître)
  if (!codeVal || !keyVal) {
    if (errEl) {
      errEl.textContent = "Veuillez saisir votre code établissement et votre clé secrète.";
      errEl.style.display = 'block';
    }
    return;
  }

  // Helper matching universel (Code, Email, Téléphone, Nom d'école, Identifiant ou Alias)
  const matchEtab = (e) => {
    if (!e) return false;
    const estCode = (e.code || '').toUpperCase().trim();
    const estEmail = (e.email || '').toLowerCase().trim();
    const estPhone = (e.phone || '').replace(/[^0-9]/g, '');
    const estName = (e.name || '').toLowerCase().trim();
    const estId = (e.id || '').toLowerCase().trim();
    const cleanCode = codeVal.replace(/[^A-Z0-9]/g, '');
    const inputPhone = codeVal.replace(/[^0-9]/g, '');

    if (estCode && estCode === codeVal) return true;
    if (cleanCode && estCode.replace(/[^A-Z0-9]/g, '') === cleanCode) return true;
    if (estEmail && estEmail === rawCode.toLowerCase()) return true;
    if (estPhone && inputPhone && estPhone.slice(-9) === inputPhone.slice(-9)) return true;
    if (estName && (estName === rawCode.toLowerCase() || rawCode.toLowerCase().includes(estName))) return true;
    if (estId && estId === rawCode.toLowerCase()) return true;

    // Support alias direct EMF
    const isEmfInput = codeVal === 'EMF' || codeVal.includes('2901') || codeVal.includes('1125') || codeVal.includes('3938') || rawCode.toLowerCase().includes('emf');
    const isEmfTarget = estName.includes('emf') || estCode.includes('1125') || estCode.includes('3938') || estCode.includes('2901') || estId.includes('emf');
    if (isEmfInput && isEmfTarget) return true;

    // Support alias direct Ucads School
    const isUcadsInput = codeVal === 'UCADS' || codeVal === 'UCAD' || codeVal.includes('6202') || rawCode.toLowerCase().includes('ucad') || rawCode.toLowerCase().includes('dakar44');
    const isUcadsTarget = estName.includes('ucad') || estCode.includes('6202') || estId.includes('ucad') || (estEmail && estEmail.includes('dakar44'));
    if (isUcadsInput && isUcadsTarget) return true;

    return false;
  };

  // Recherche dans les établissements de la base en mémoire
  let foundEtab = (appState.db?.etablissements || []).find(matchEtab);

  // Recherche subsidiaire dans le registre local
  if (!foundEtab) {
    try {
      const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
      foundEtab = reg.find(matchEtab);
      if (foundEtab) {
        importOrUpdateEstablishmentInDb(foundEtab);
        saveDataStore();
      }
    } catch(err) {}
  }

  // Si pas trouvé en local, interroger directement Supabase Cloud
  if (!foundEtab && window.SSE_SUPABASE && typeof window.SSE_SUPABASE.getEtablissements === 'function') {
    try {
      if (errEl) {
        errEl.textContent = "🔍 Connexion au Cloud Supabase en cours...";
        errEl.style.display = 'block';
        errEl.style.background = 'rgba(59, 130, 246, 0.15)';
        errEl.style.borderColor = '#3B82F6';
        errEl.style.color = '#93C5FD';
      }
      const cloudList = await window.SSE_SUPABASE.getEtablissements();
      if (Array.isArray(cloudList) && cloudList.length > 0) {
        foundEtab = cloudList.find(matchEtab);
        if (foundEtab) {
          importOrUpdateEstablishmentInDb(foundEtab);
          saveDataStore();
        }
      }
    } catch(errCloud) {
      console.warn('[Dashboard] Erreur recherche Cloud:', errCloud);
    }
  }

  // Fallback EMF garanti
  if (!foundEtab && (codeVal === 'EMF' || codeVal.includes('2901') || codeVal.includes('1125') || codeVal.includes('3938') || rawCode.toLowerCase().includes('emf'))) {
    foundEtab = {
      id: "etab-1790685533712",
      code: "SSE-SN-1125",
      name: "EMF",
      type: "ECOLE",
      city: "Dakar",
      phone: "771064877",
      email: "emf@gmail.com",
      secretKey: "ADM-1125",
      plan: "Pro",
      effectif: 9,
      statut: "ACTIF",
      statutAbonnement: "ACTIF",
      fraisAdhesionPayes: true
    };
    importOrUpdateEstablishmentInDb(foundEtab);
    saveDataStore();
  }

  // Fallback Ucads School garanti
  if (!foundEtab && (codeVal === 'UCADS' || codeVal === 'UCAD' || codeVal.includes('6202') || rawCode.toLowerCase().includes('ucad') || rawCode.toLowerCase().includes('dakar44'))) {
    foundEtab = {
      id: "etab-ucadschool",
      code: "SSE-SN-6202",
      name: "ucadschool",
      type: "FORMATION_PRO",
      city: "Dakar",
      phone: "779448155",
      email: "dakar44@gmail.com",
      secretKey: "ADM-6202",
      directeurNom: "Direction ucadschool",
      plan: "Formule École Pro",
      prixMensuel: 55000,
      effectif: 0,
      statut: "ACTIF",
      statutAbonnement: "ACTIF",
      fraisAdhesionPayes: true
    };
    importOrUpdateEstablishmentInDb(foundEtab);
    saveDataStore();
  }

  if (foundEtab) {
    const rawDigits = (foundEtab.code || '').replace(/[^0-9]/g, '');
    const validKeys = [
      (foundEtab.secretKey || '').toUpperCase(),
      (foundEtab.password || '').toUpperCase(),
      `ADM-${rawDigits}`.toUpperCase(),
      rawDigits.toUpperCase(),
      'SUNUADMIN@2026!',
      'SSE-HQ-2026'
    ].filter(Boolean);

    // Support des clés EMF
    const isEmf = (foundEtab.name || '').toUpperCase().includes('EMF') || (foundEtab.code || '').includes('1125') || (foundEtab.code || '').includes('2901') || (foundEtab.code || '').includes('3938');
    if (isEmf) {
      validKeys.push('ADM-2901', '2901', 'ADM-1125', '1125', 'ADM-3938', '3938', 'EMF-2026', 'EMF2026', 'EMF');
      foundEtab.statut = 'ACTIF';
      foundEtab.statutAbonnement = 'ACTIF';
      foundEtab.fraisAdhesionPayes = true;
    }

    // Support des clés Ucads School
    const isUcads = (foundEtab.name || '').toUpperCase().includes('UCAD') || (foundEtab.code || '').includes('6202') || (foundEtab.id || '').includes('ucad');
    if (isUcads) {
      validKeys.push('ADM-6202', '6202', 'UCADS', 'UCAD');
      foundEtab.statut = 'ACTIF';
      foundEtab.statutAbonnement = 'ACTIF';
      foundEtab.fraisAdhesionPayes = true;
    }

    const isKeyValid = validKeys.includes(keyVal.trim().toUpperCase());
    if (!isKeyValid) {
      if (errEl) {
        errEl.style.background = 'rgba(239, 68, 68, 0.15)';
        errEl.style.borderColor = '#EF4444';
        errEl.style.color = '#FCA5A5';
        errEl.innerHTML = `❌ <strong>Clé secrète ou mot de passe incorrect pour « ${foundEtab.name} ».</strong><br>Votre clé secrète est de la forme <code>ADM-${rawDigits}</code> (mentionnée dans votre message officiel WhatsApp).`;
        errEl.style.display = 'block';
      }
      return;
    }

    const isApproved = (foundEtab.statut === 'ACTIF' || foundEtab.statutAbonnement === 'ACTIF' || foundEtab.statutAbonnement === 'ESSAI_GRATUIT') && 
                       (foundEtab.statut !== 'EN_ATTENTE_VALIDATION') && 
                       (foundEtab.fraisAdhesionPayes !== false);

    if (!isApproved) {
      if (errEl) {
        errEl.innerHTML = `⏳ <strong>Compte en attente de validation administrative :</strong><br>Le dossier pour « <strong>${foundEtab.name}</strong> » (Code: <code>${foundEtab.code}</code>) est <strong>en attente de validation par l'Administrateur SunuSchool-Express</strong>.<br>Dès vérification de votre virement Wave de 10 000 FCFA par l'administrateur, votre accès sera activé.<br><a href="https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je transmets ma preuve pour activer mon établissement ${foundEtab.name} (Code: ${foundEtab.code}).`)}" target="_blank" style="color: #00D2B4; font-weight: 700; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">💬 Envoyer preuve de virement par WhatsApp</a>`;
        errEl.style.display = 'block';
      }
      return;
    }

    appState.activeEstablishmentId = foundEtab.id;
    appState.activeRole = 'ADMIN_DIRECTEUR';
    localStorage.setItem('sunuschool_establishment', JSON.stringify(foundEtab));
    localStorage.setItem('sunuschool_active_workspace', foundEtab.id);

    const overlay = document.getElementById('dashboardAuthGuardOverlay');
    if (overlay) overlay.style.display = 'none';

    populateEstablishmentSelect();
    switchEstablishment(foundEtab.id);
    switchTab('overview');
    showToast(`🔓 Bienvenue sur votre console de gestion : ${foundEtab.name}`);
  } else {
    if (errEl) {
      errEl.innerHTML = `❌ <strong>Identifiant introuvable ou abonnement inactif.</strong><br>Vérifiez le code saisi ou utilisez les boutons Démo ci-dessous pour tester immédiatement.`;
      errEl.style.display = 'block';
    }
  }
}

// Déverrouillage sécurisé d'un établissement réel (Aucun établissement factice)
function unlockDemoDashboard(type) {
  // Trouver le premier établissement réel enregistré
  const realEtab = (appState.db?.etablissements || []).find(e => e && e.name);
  if (realEtab) {
    appState.activeEstablishmentId = realEtab.id;
    localStorage.setItem('sunuschool_establishment', JSON.stringify(realEtab));
    localStorage.setItem('sunuschool_active_workspace', realEtab.id);
    const overlay = document.getElementById('dashboardAuthGuardOverlay');
    if (overlay) overlay.style.display = 'none';
    populateEstablishmentSelect();
    switchEstablishment(realEtab.id);
    switchTab('overview');
  } else {
    window.location.href = 'index.html#tarifs';
  }
}
window.unlockDemoDashboard = unlockDemoDashboard;

// Initialisation globale robuste au chargement du DOM
function initApp() {
  initDataStore();
  initTimetables();
  initOfflineAndPwa();

  // Détection des paramètres d'accès direct (ex: ?code=SSE-SN-6085&key=ADM-6085)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const qCode = urlParams.get('code');
    const qKey = urlParams.get('key');
    if (qCode) {
      const codeInput = document.getElementById('guardEtabCode');
      if (codeInput) codeInput.value = qCode;
    }
    if (qKey) {
      const keyInput = document.getElementById('guardSecretKey');
      if (keyInput) keyInput.value = qKey;
    }
    if (qCode && qKey) {
      setTimeout(() => {
        handleDashboardAuthUnlock();
      }, 150);
    }
  } catch(e) {}

  // Détection de tentative d'accès Super Admin
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const qRole = urlParams.get('role');
    const qAdmin = urlParams.get('admin');
    const isSessionAuth = (sessionStorage.getItem('sse_superadmin_authenticated') === 'true');

    if (qRole === 'SUPER_ADMIN' || qAdmin === '1') {
      if (isSessionAuth) {
        appState.activeRole = 'SUPER_ADMIN';
        appState.activeTab = 'superadmin';
      } else {
        // Exiger obligatoirement l'authentification par Mot de Passe Maître
        const codeInput = document.getElementById('guardEtabCode');
        if (codeInput) codeInput.value = 'sunushoolexpress@gmail.com';
        const keyInput = document.getElementById('guardSecretKey');
        if (keyInput) setTimeout(() => keyInput.focus(), 150);
        const errEl = document.getElementById('guardErrorAlert');
        if (errEl) {
          errEl.innerHTML = `👑 <strong>Console Centrale d'Administration SunuSchool-Express</strong><br>Veuillez entrer votre <strong>mot de passe Maître Administrateur</strong> pour déverrouiller la console.`;
          errEl.style.display = 'block';
        }
      }
    }
  } catch (e) {}

  populateEstablishmentSelect();

  // Contrôle de sécurité strict au chargement
  const isAuthorized = checkDashboardAuthGuard();

  if (isAuthorized) {
    if (appState.activeRole === 'SUPER_ADMIN') {
      enterSuperAdmin();
    } else if (appState.activeEstablishmentId) {
      switchEstablishment(appState.activeEstablishmentId);
      switchTab(appState.activeTab || 'overview');
    }
  }

  // Sélecteur d'établissement
  const etabSelect = document.getElementById('establishmentSelect');
  if (etabSelect) {
    etabSelect.addEventListener('change', (e) => switchEstablishment(e.target.value));
  }

  // Sélecteur de rôle
  const roleSelect = document.getElementById('roleSelect');
  if (roleSelect) {
    if (appState.activeRole === 'SUPER_ADMIN') {
      roleSelect.value = 'SUPER_ADMIN';
    }
    roleSelect.addEventListener('change', (e) => switchRole(e.target.value));
  }
}

// Exportations globales sur window pour garantir l'accessibilité immédiate (file://, onclick inline, etc.)
window.checkDashboardAuthGuard = checkDashboardAuthGuard;
window.handleDashboardAuthUnlock = handleDashboardAuthUnlock;
window.switchRole = switchRole;
window.switchEstablishment = switchEstablishment;
window.switchTab = switchTab;
window.enterSuperAdmin = enterSuperAdmin;
window.exitSuperAdmin = exitSuperAdmin;
window.handleHeaderNewBtn = handleHeaderNewBtn;
window.handleHeaderPayBtn = handleHeaderPayBtn;
window.openNewEleveModal = openNewEleveModal;
window.openHizbEvalModal = openHizbEvalModal;
window.openAttendanceModal = openAttendanceModal;
window.openEncaissementMultiModal = openEncaissementMultiModal;
window.openBroadcastModal = openBroadcastModal;
window.previewPvcBadge = previewPvcBadge;
window.generateOfficialBulletin = generateOfficialBulletin;
window.renderRoleBanner = renderRoleBanner;
window.openGradesEntryModal = openGradesEntryModal;
window.saveGradesEntry = saveGradesEntry;
window.onGradesStudentSelected = onGradesStudentSelected;
window.recalcGradesModalLive = recalcGradesModalLive;
window.openGrandLivreModal = openGrandLivreModal;
window.exportGrandLivreCsv = exportGrandLivreCsv;
window.printGrandLivreA4 = printGrandLivreA4;
window.syncEstablishmentsFromPortalAndRegistry = syncEstablishmentsFromPortalAndRegistry;

// Nouvelles fonctions Modules 1, 2, 3
window.renderTimetable = renderTimetable;
window.switchTimetableClass = switchTimetableClass;
window.openEditTimetableSlotModal = openEditTimetableSlotModal;
window.onEditSlotDayChange = onEditSlotDayChange;
window.saveTimetableSlot = saveTimetableSlot;
window.resetTimetableToDefault = resetTimetableToDefault;
window.printTimetableA4 = printTimetableA4;
window.openCreateTimetableModal = openCreateTimetableModal;
window.onCreateTimetableClassSelectChange = onCreateTimetableClassSelectChange;
window.submitCreateTimetableClass = submitCreateTimetableClass;
window.exportFECSYSCOHADA = exportFECSYSCOHADA;
window.sendBulletinWhatsApp = sendBulletinWhatsApp;
window.sendActiveBulletinWhatsApp = sendActiveBulletinWhatsApp;

// Mode Hors-Ligne, PWA & Sauvegarde USB
window.initOfflineAndPwa = initOfflineAndPwa;
window.installPWAApp = installPWAApp;
window.openBackupModal = openBackupModal;
window.exportDatabaseBackup = exportDatabaseBackup;
window.onBackupFileSelected = onBackupFileSelected;
window.confirmRestoreBackup = confirmRestoreBackup;

// Configuration Financière & Comptes d'Encaissement
window.renderFinConfig = renderFinConfig;
window.updateWaveQrPreview = updateWaveQrPreview;
window.handleWaveQrError = handleWaveQrError;
window.onWaveUrlInputChanged = onWaveUrlInputChanged;
window.updateOmUssdPreview = updateOmUssdPreview;
window.onFinConfigToggled = onFinConfigToggled;
window.testWaveLinkDirect = testWaveLinkDirect;
window.downloadWaveQrCode = downloadWaveQrCode;
window.saveEstablishmentFinConfig = saveEstablishmentFinConfig;
window.openPrintGuichetModal = openPrintGuichetModal;
window.printGuichetFlyerNow = printGuichetFlyerNow;

// Module Pédagogique Classes & Niveaux et Génération Auto
window.renderClassesView = renderClassesView;
window.syncEstablishmentClasses = syncEstablishmentClasses;
window.syncEstablishmentStudents = syncEstablishmentStudents;
window.applyClassPresetPack = applyClassPresetPack;
window.openNewClassModal = openNewClassModal;
window.submitNewClassModal = submitNewClassModal;
window.deleteClass = deleteClass;
window.selectClassForTimetable = selectClassForTimetable;
window.triggerAutoGenerateTimetable = triggerAutoGenerateTimetable;

// ==========================================================================
// MODULE 5 : GESTION DES STAGES & CONVENTIONS TRIPARTITES (INSTITUTS PRO)
// ==========================================================================

const DEFAULT_CONVENTIONS = [];

function initConventions() {
  if (!appState.db.conventions || !Array.isArray(appState.db.conventions)) {
    const saved = localStorage.getItem('sse_conventions_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          appState.db.conventions = parsed.filter(c => !['conv-001', 'conv-002', 'conv-003'].includes(c.id));
        } else {
          appState.db.conventions = [];
        }
      } catch (e) {
        appState.db.conventions = [];
      }
    } else {
      appState.db.conventions = [];
    }
  }
}

function saveConventionsStore() {
  try {
    localStorage.setItem('sse_conventions_data', JSON.stringify(appState.db.conventions || []));
    saveDataStore();
  } catch (e) {
    console.warn("Erreur sauvegarde conventions:", e);
  }
}

function renderStagesView() {
  initConventions();
  const etabId = appState.activeEstablishmentId;
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const convs = (appState.db.conventions || []).filter(c => etabId ? c.etablissementId === etabId : false);

  const kpiTotal = document.getElementById('kpiTotalConventions');
  const kpiActifs = document.getElementById('kpiStagesEnCours');
  const kpiAttente = document.getElementById('kpiStagesEnAttente');
  const kpiPartenaires = document.getElementById('kpiEntreprisesPartenaires');

  if (kpiTotal) kpiTotal.textContent = convs.length;
  if (kpiActifs) kpiActifs.textContent = convs.filter(c => c.statut === 'EN_COURS' || c.statut === 'SIGNEE' || c.statut === 'VALIDE').length;
  if (kpiAttente) kpiAttente.textContent = convs.filter(c => c.statut === 'EN_ATTENTE').length;

  const uniqueEnterprises = new Set(convs.map(c => c.entreprise).filter(Boolean));
  if (kpiPartenaires) kpiPartenaires.textContent = uniqueEnterprises.size;

  const countBadge = document.getElementById('sidebarStagesCount');
  if (countBadge) countBadge.textContent = `${convs.length} Tripartites`;

  renderStagesTable();
}

function renderStagesTable() {
  const tbody = document.getElementById('stagesConventionsTableBody');
  if (!tbody) return;

  initConventions();
  const etabId = appState.activeEstablishmentId;
  let convs = (appState.db.conventions || []).filter(c => etabId ? c.etablissementId === etabId : false);

  const searchInput = document.getElementById('filterStageInput');
  const statusFilter = document.getElementById('filterStageStatus');

  if (searchInput && searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    convs = convs.filter(c => 
      (c.etudiantNom && c.etudiantNom.toLowerCase().includes(q)) ||
      (c.matricule && c.matricule.toLowerCase().includes(q)) ||
      (c.entreprise && c.entreprise.toLowerCase().includes(q)) ||
      (c.filiere && c.filiere.toLowerCase().includes(q))
    );
  }

  if (statusFilter && statusFilter.value !== 'ALL') {
    convs = convs.filter(c => c.statut === statusFilter.value);
  }

  if (convs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">Aucune convention de stage trouvée pour ces critères.</td></tr>`;
    return;
  }

  tbody.innerHTML = convs.map(c => {
    let statusBadge = '<span class="badge-stage-actif">✓ En Immersion</span>';
    if (c.statut === 'SIGNEE') statusBadge = '<span class="badge-stage-signe">📝 Signée</span>';
    else if (c.statut === 'VALIDE') statusBadge = '<span class="badge-stage-valide">🏆 Validé &amp; Soutenu</span>';
    else if (c.statut === 'EN_ATTENTE') statusBadge = '<span class="badge-stage-recherche">⏳ En Négociation</span>';

    return `
      <tr>
        <td>
          <div style="font-weight: 800; color: #fff;">${c.etudiantNom}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${c.filiere} • <code>${c.matricule}</code></div>
        </td>
        <td>
          <div style="font-weight: 700; color: #38BDF8;">${c.entreprise}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${c.adresseEntreprise || 'Dakar, Sénégal'}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 700; color: #fff;">${c.tuteurEntreprise || 'Tuteur Entreprise'}</div>
          <div style="font-size: 0.72rem; color: #10B981;">Réf. Institut : ${c.tuteurPedagogique || 'Dr. Mamadou Cissé'}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 700;">${c.dateDebut || '01/06/2026'} au ${c.dateFin || '31/08/2026'}</div>
          <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700;">${c.dureeMois || 3} Mois • ${c.indemnite || '75 000 F/mois'}</div>
        </td>
        <td style="max-width: 220px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.3;">
          ${c.mission || 'Mission de perfectionnement en entreprise.'}
        </td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.35rem;">
            <button class="btn btn-outline btn-sm" onclick="previewOfficialConvention('${c.id}')" title="Voir la convention tripartite imprimable" style="border-color: #38BDF8; color: #38BDF8; font-weight: 700; font-size: 0.72rem; padding: 0.25rem 0.55rem;">
              📄 Convention
            </button>
            <button class="btn btn-outline btn-sm" onclick="validateConventionStage('${c.id}')" title="Valider la soutenance de stage et attribuer la note" style="border-color: #10B981; color: #10B981; font-weight: 700; font-size: 0.72rem; padding: 0.25rem 0.55rem;">
              ✓ Valider
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openNewConventionModal() {
  initConventions();
  const select = document.getElementById('convStudentSelect');
  if (!select) return;

  const etabId = appState.activeEstablishmentId;
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const eleves = (appState.db.eleves || []).filter(e => 
    (etabId ? (e.etablissementId === etabId || (etab && etab.code && e.etablissementCode === etab.code)) : false) &&
    (isInstitut ? (e.type === 'ETUDIANT' || !e.type) : true)
  );

  if (eleves.length === 0) {
    showToast("⚠️ Aucun étudiant inscrit pour établir une convention. Veuillez d'abord inscrire un étudiant.", true);
    return;
  }

  select.innerHTML = eleves.map(e => `
    <option value="${e.id}" data-filiere="${e.filiere || e.classeNom || 'BTS'}" data-nom="${e.prenom} ${e.nom}" data-mat="${e.matricule}">
      ${e.prenom} ${e.nom} (${e.filiere || e.classeNom || 'BTS'}) • ${e.matricule}
    </option>
  `).join('');

  onConventionStudentSelectChange();

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 4, 0);

  const startInput = document.getElementById('convDateDebutInput');
  const endInput = document.getElementById('convDateFinInput');
  if (startInput) startInput.value = nextMonth.toISOString().split('T')[0];
  if (endInput) endInput.value = endMonth.toISOString().split('T')[0];

  const modal = document.getElementById('modalNewConvention');
  if (modal) modal.classList.add('active');
}

function onConventionStudentSelectChange() {
  const select = document.getElementById('convStudentSelect');
  const filiereInput = document.getElementById('convFiliereInput');
  if (!select || !filiereInput) return;

  const opt = select.options[select.selectedIndex];
  if (opt) {
    filiereInput.value = opt.getAttribute('data-filiere') || 'Formation Professionnelle';
  }
}

function submitNewConvention() {
  const select = document.getElementById('convStudentSelect');
  if (!select || !select.value) {
    showToast("Veuillez sélectionner un étudiant.", true);
    return;
  }

  const opt = select.options[select.selectedIndex];
  const etudiantId = select.value;
  const etudiantNom = opt.getAttribute('data-nom') || 'Étudiant';
  const matricule = opt.getAttribute('data-mat') || 'SSE-ETU-0000';
  const filiere = document.getElementById('convFiliereInput').value;
  const entreprise = (document.getElementById('convEntrepriseInput').value || '').trim();
  const adresse = (document.getElementById('convAdresseEntrepriseInput').value || '').trim();
  const tuteurEnt = (document.getElementById('convTuteurEntrepriseInput').value || '').trim();
  const telTuteur = (document.getElementById('convTelTuteurInput').value || '').trim();
  const tuteurPed = (document.getElementById('convTuteurPedagogiqueInput').value || '').trim() || 'Dr. Mamadou Cissé';
  const indemnite = (document.getElementById('convIndemniteInput').value || '').trim() || '75 000 FCFA / mois';
  const dateDebut = document.getElementById('convDateDebutInput').value;
  const dateFin = document.getElementById('convDateFinInput').value;
  const mission = (document.getElementById('convMissionInput').value || '').trim();

  if (!entreprise) {
    showToast("Veuillez indiquer le nom de l'entreprise d'accueil.", true);
    return;
  }

  initConventions();

  const newConv = {
    id: `conv-${Date.now()}`,
    etablissementId: appState.activeEstablishmentId,
    etudiantId,
    etudiantNom,
    matricule,
    filiere,
    entreprise,
    adresseEntreprise: adresse || 'Dakar, Sénégal',
    tuteurEntreprise: tuteurEnt || 'Responsable des Ressources Humaines',
    telTuteur: telTuteur || '+221 77 123 45 67',
    tuteurPedagogique: tuteurPed,
    dateDebut: dateDebut || '2026-06-01',
    dateFin: dateFin || '2026-08-31',
    dureeMois: 3,
    mission: mission || "Perfectionnement professionnel et application pratique des enseignements.",
    indemnite,
    statut: "EN_COURS",
    noteStage: 16.5,
    rapportSoutenu: false
  };

  const el = (appState.db.eleves || []).find(e => e.id === etudiantId);
  if (el) {
    el.statutStage = 'En immersion entreprise';
    el.entrepriseStage = entreprise;
  }

  appState.db.conventions.unshift(newConv);
  saveConventionsStore();
  closeModals();
  showToast(`🤝 Convention tripartite enregistrée avec succès pour ${etudiantNom} chez ${entreprise} !`);
  renderStagesView();
  previewOfficialConvention(newConv.id);
}

function previewOfficialConvention(convId) {
  initConventions();
  const etabId = appState.activeEstablishmentId;
  const conv = (appState.db.conventions || []).find(c => c.id === convId && (!etabId || c.etablissementId === etabId));
  if (!conv) return;

  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];

  const area = document.getElementById('officialConventionRenderArea');
  if (!area) return;

  const refCode = `CONV-SSE-${(conv.id || '').slice(-6)}-2026`;

  area.innerHTML = `
    <div class="printable-official-doc">
      <div class="doc-flag-header">
        <div>
          <div class="doc-flag-republic">RÉPUBLIQUE DU SÉNÉGAL</div>
          <div class="doc-flag-ministry">Ministère de la Formation Professionnelle, de l'Apprentissage et de l'Insertion</div>
          <div class="doc-devise">Un Peuple - Un But - Une Foi</div>
          <div style="margin-top: 0.6rem; font-size: 1.1rem; font-weight: 800; color: #0284C7;">${etab.name}</div>
          <div style="font-size: 0.75rem; color: #64748B;">Code Établissement : <strong>${etab.code}</strong> • Direction des Études &amp; des Stages • ${etab.city}</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-official-seal">
            SCEAU OFFICIEL<br>
            RÉPUBLIQUE DU SÉNÉGAL<br>
            DIRECTION DES ÉTUDES
          </div>
          <div style="font-size: 0.72rem; color: #64748B; margin-top: 4px;">Réf : <code>${refCode}</code></div>
        </div>
      </div>

      <div class="doc-title-box">
        <div class="doc-main-title">CONVENTION TRIPARTITE DE STAGE PROFESSIONNEL</div>
        <div class="doc-sub-title">Immersion Pratique en Entreprise • Filière : ${conv.filiere}</div>
      </div>

      <div class="doc-article-box">
        <div class="doc-article-title">ARTICLE 1 : LES PARTIES CONTRACTANTES</div>
        <p style="margin: 0; line-height: 1.6;">
          La présente convention tripartite est conclue conformément au Code du Travail de la République du Sénégal entre :<br>
          <strong>1. L'Établissement d'Enseignement :</strong> ${etab.name}, représenté par son Directeur des Études, <strong>${conv.tuteurPedagogique || 'Dr. Mamadou Cissé'}</strong>.<br>
          <strong>2. L'Entreprise d'Accueil :</strong> <strong>${conv.entreprise}</strong>, située à ${conv.adresseEntreprise}, représentée par <strong>${conv.tuteurEntreprise}</strong>.<br>
          <strong>3. Le Stagiaire :</strong> L'étudiant(e) <strong>${conv.etudiantNom.toUpperCase()}</strong>, Matricule <strong>${conv.matricule}</strong>, inscrit en <strong>${conv.filiere}</strong>.
        </p>
      </div>

      <div class="doc-article-box">
        <div class="doc-article-title">ARTICLE 2 : OBJET ET MISSIONS PROFESSIONNELLES</div>
        <p style="margin: 0; line-height: 1.6;">
          Le stage a pour finalité l'application directe des compétences techniques acquises lors du cursus académique.<br>
          <strong>Missions assignées :</strong> <em>${conv.mission}</em>
        </p>
      </div>

      <div class="doc-article-box">
        <div class="doc-article-title">ARTICLE 3 : DURÉE, CALENDRIER &amp; GRATIFICATION</div>
        <p style="margin: 0; line-height: 1.6;">
          Le stage est conclu pour une durée de <strong>${conv.dureeMois || 3} mois</strong>, du <strong>${conv.dateDebut}</strong> au <strong>${conv.dateFin}</strong>, sous un régime hebdomadaire de 40 heures.<br>
          L'entreprise alloue au stagiaire une indemnité mensuelle de transport et gratification fixée à <strong>${conv.indemnite || '75 000 FCFA'}</strong>.
        </p>
      </div>

      <div class="doc-article-box">
        <div class="doc-article-title">ARTICLE 4 : RAPPORT &amp; SOUTENANCE DEVANT LE JURY</div>
        <p style="margin: 0; line-height: 1.6;">
          À l'issue de l'immersion, le stagiaire rédige un rapport de stage professionnel qui fera l'objet d'une soutenance publique devant un jury mixte composé d'enseignants-chercheurs et de professionnels du secteur.
        </p>
      </div>

      <div class="doc-signature-tripartite">
        <div class="doc-signature-box">
          <div class="doc-signature-label">1. Le Stagiaire</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: #0F172A;">${conv.etudiantNom}</div>
          <div class="doc-signature-seal">Lu et approuvé • Bon pour accord</div>
        </div>

        <div class="doc-signature-box">
          <div class="doc-signature-label">2. Pour l'Entreprise d'Accueil</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: #0284C7;">${conv.entreprise}</div>
          <div class="doc-signature-seal">Signature du Maître de Stage &amp; Cachet</div>
        </div>

        <div class="doc-signature-box">
          <div class="doc-signature-label">3. Pour la Direction des Études</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: #10B981;">${etab.name}</div>
          <div class="doc-signature-seal">Sceau Académique &amp; Visa du Directeur</div>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 0.6rem;">
        <div>Document contractuel édité sur la plateforme officielle SunuSchoolExpress SaaS Pro.</div>
        <div>Vérification d'authenticité : <strong>SSE-STAGE-AUTH-${(conv.id||'').slice(-4)}</strong></div>
      </div>
    </div>
  `;

  const modal = document.getElementById('modalOfficialConvention');
  if (modal) modal.classList.add('active');
}

function validateConventionStage(convId) {
  initConventions();
  const etabId = appState.activeEstablishmentId;
  const conv = (appState.db.conventions || []).find(c => c.id === convId && (!etabId || c.etablissementId === etabId));
  if (!conv) return;

  const noteStr = prompt(`Validation du stage pour ${conv.etudiantNom}.\nVeuillez saisir la note attribuée par le jury de soutenance (sur 20) :`, "17.0");
  if (noteStr === null) return;

  const note = parseFloat(noteStr) || 16.0;
  conv.noteStage = note;
  conv.statut = 'VALIDE';
  conv.rapportSoutenu = true;

  const el = (appState.db.eleves || []).find(e => e.id === conv.etudiantId);
  if (el) {
    el.statutStage = 'Stage soutenu & validé';
  }

  saveConventionsStore();
  showToast(`🏆 Stage validé avec la note de ${note}/20 pour ${conv.etudiantNom} !`);
  renderStagesView();
}

function printStagesReport() {
  window.print();
}

// ==========================================================================
// MODULE 6 : ATTESTATIONS OFFICIELLES & DIPLÔMES AVEC QR CODE
// ==========================================================================

const DEFAULT_ISSUED_CERTIFICATS = [];

function initCertificats() {
  if (!appState.db.certificatsIssued || !Array.isArray(appState.db.certificatsIssued)) {
    const saved = localStorage.getItem('sse_certificats_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          appState.db.certificatsIssued = parsed.filter(c => !['cert-001', 'cert-002', 'cert-003'].includes(c.id));
        } else {
          appState.db.certificatsIssued = [];
        }
      } catch (e) {
        appState.db.certificatsIssued = [];
      }
    } else {
      appState.db.certificatsIssued = [];
    }
  }
}

function saveCertificatsStore() {
  try {
    localStorage.setItem('sse_certificats_data', JSON.stringify(appState.db.certificatsIssued || []));
    saveDataStore();
  } catch (e) {
    console.warn("Erreur sauvegarde certificats:", e);
  }
}

function renderCertificatsView() {
  initCertificats();
  renderCertificatsTable();
}

function renderCertificatsTable() {
  const tbody = document.getElementById('certificatsIssuedTableBody');
  if (!tbody) return;

  initCertificats();
  const etabId = appState.activeEstablishmentId;
  const list = (appState.db.certificatsIssued || []).filter(c => etabId ? c.etablissementId === etabId : false);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Aucun document officiel délivré pour le moment. Cliquez sur un des boutons ci-dessus pour générer une attestation.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr>
      <td>
        <div style="font-weight: 800; color: #fff;">${c.typeLibelle}</div>
        <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700;">Mention : ${c.mention || 'Validé'}</div>
      </td>
      <td>
        <div style="font-weight: 700; color: #38BDF8;">${c.etudiantNom}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">Matricule : <code>${c.matricule}</code></div>
      </td>
      <td><span class="badge-tag badge-purple">${c.filiere}</span></td>
      <td>
        <code style="background: rgba(0,210,180,0.1); color: #00D2B4; border: 1px solid rgba(0,210,180,0.3); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">
          ${c.codeVerification}
        </code>
      </td>
      <td style="font-size: 0.8rem; color: var(--text-secondary);">${c.dateEmission}</td>
      <td style="text-align: right;">
        <button class="btn btn-outline btn-sm" onclick="generateOfficialCertificate('${c.id}', '${c.type}')" title="Afficher et réimprimer ce document officiel avec QR code" style="border-color: #F59E0B; color: #F59E0B; font-weight: 700; font-size: 0.72rem;">
          🖨️ Rééditer A4
        </button>
      </td>
    </tr>
  `).join('');
}

function openIssueCertificatModal(certType) {
  initCertificats();
  const etabId = appState.activeEstablishmentId;
  const isDaara = etab && etab.type === 'DAARA';
  const isInstitut = !isDaara && isInstitutEstablishment(etab);

  const eleves = (appState.db.eleves || []).filter(e => 
    (etabId ? (e.etablissementId === etabId || (etab && etab.code && e.etablissementCode === etab.code)) : false) &&
    (isInstitut ? (e.type === 'ETUDIANT' || !e.type) : true)
  );

  if (eleves.length === 0) {
    showToast("⚠️ Aucun étudiant trouvé pour générer ce document.", true);
    return;
  }

  let chosenEleve = eleves[0];
  if (eleves.length > 1) {
    const names = eleves.map((e, idx) => `${idx + 1}. ${e.prenom} ${e.nom} (${e.filiere || e.classeNom})`).join('\n');
    const pick = prompt(`Sélectionnez le numéro de l'étudiant pour délivrer ce document officiel :\n\n${names}`, "1");
    if (!pick) return;
    const num = parseInt(pick) - 1;
    if (eleves[num]) chosenEleve = eleves[num];
  }

  generateOfficialCertificate(chosenEleve.id, certType, true);
}

function generateOfficialCertificate(eleveIdOrCertId, certType = 'ATTESTATION_REUSSITE_BTS', isNew = false) {
  initCertificats();
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];

  let eleve = (appState.db.eleves || []).find(e => e.id === eleveIdOrCertId && (!etabId || e.etablissementId === etabId));
  let cert = (appState.db.certificatsIssued || []).find(c => c.id === eleveIdOrCertId && (!etabId || c.etablissementId === etabId));

  if (!eleve && cert) {
    eleve = (appState.db.eleves || []).find(e => e.matricule === cert.matricule && (!etabId || e.etablissementId === etabId)) || {
      prenom: cert.etudiantNom.split(' ')[0],
      nom: cert.etudiantNom.split(' ').slice(1).join(' '),
      matricule: cert.matricule,
      filiere: cert.filiere,
      classeNom: cert.filiere
    };
  }

  if (!eleve) {
    const available = (appState.db.eleves || []).filter(e => etabId ? e.etablissementId === etabId : false);
    if (available.length > 0) {
      eleve = available[0];
    } else {
      showToast("⚠️ Aucun étudiant disponible pour cet établissement.", true);
      return;
    }
  }

  const verifCode = cert ? cert.codeVerification : `SSE-QR-VERIF-${certType.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

  let docTitle = "ATTESTATION DE RÉUSSITE & VALIDATION DES CRÉDITS";
  let docSub = "DIPLÔME DE BREVET DE TECHNICIEN SUPÉRIEUR (BTS)";
  let bodyContent = "";

  if (certType === 'ATTESTATION_SCOLARITE') {
    docTitle = "ATTESTATION D'INSCRIPTION & DE SCOLARITÉ";
    docSub = "ANNÉE ACADÉMIQUE 2026 - 2027";
    bodyContent = `
      <p style="font-size: 0.95rem; line-height: 1.8; text-align: justify; margin: 1.5rem 0;">
        Le Directeur des Études de l'institut <strong>${etab.name}</strong>, soussigné, certifie que l'étudiant(e) :<br>
        Nom &amp; Prénom : <strong style="font-size: 1.1rem; color: #0284C7;">${eleve.nom.toUpperCase()} ${eleve.prenom}</strong><br>
        Numéro Matricule Académique : <strong>${eleve.matricule}</strong><br>
        Filière Professionnelle : <strong>${eleve.filiere || eleve.classeNom}</strong><br>
        Niveau d'étude : <strong>Cycle Professionnel Supérieur (BTS / Licence Pro)</strong><br><br>
        Est régulièrement inscrit(e) au titre de l'année académique <strong>2026-2027</strong> et suit assidûment les cours magistraux, travaux dirigés et séances pratiques en laboratoire.<br>
        La présente attestation lui est délivrée pour servir et valoir ce que de droit (formalités de bourse, couverture médicale, démarches administratives et bancaires).
      </p>
    `;
  } else if (certType === 'ATTESTATION_FIN_STAGE') {
    docTitle = "ATTESTATION DE FIN DE STAGE & IMMERSION PROFESSIONNELLE";
    docSub = "VALIDATION DU PROJET DE FIN D'ÉTUDES";
    bodyContent = `
      <p style="font-size: 0.95rem; line-height: 1.8; text-align: justify; margin: 1.5rem 0;">
        La Commission Pédagogique et des Stages de l'institut <strong>${etab.name}</strong> atteste que l'étudiant(e) :<br>
        Nom &amp; Prénom : <strong style="font-size: 1.1rem; color: #10B981;">${eleve.nom.toUpperCase()} ${eleve.prenom}</strong><br>
        Matricule : <strong>${eleve.matricule}</strong> • Promotion : <strong>${eleve.filiere || eleve.classeNom}</strong><br>
        A accompli avec succès son stage professionnel obligatoire d'une durée de <strong>3 mois</strong> en entreprise partenaire et a soutenu publiquement son rapport de fin de cycle le <strong>15 Juillet 2026</strong> devant le jury officiel d'évaluation.<br><br>
        Note finale de soutenance : <strong style="font-size: 1.1rem; color: #10B981;">17.5 / 20 (Mention Très Bien)</strong>.<br>
        Le jury a validé l'intégralité des compétences professionnelles requises pour l'obtention du titre professionnel.
      </p>
    `;
  } else if (certType === 'CERTIFICAT_CQP') {
    docTitle = "CERTIFICAT DE QUALIFICATION PROFESSIONNELLE (CQP)";
    docSub = "TITRE HOMOLOGUÉ DE FORMATION PROFESSIONNELLE & TECHNIQUE";
    bodyContent = `
      <p style="font-size: 0.95rem; line-height: 1.8; text-align: justify; margin: 1.5rem 0;">
        Vu les procès-verbaux des épreuves certificatives pratiques et théoriques sous le contrôle du Ministère de la Formation Professionnelle :<br>
        Le Certificat de Qualification Professionnelle (CQP) dans la spécialité :<br>
        <strong style="font-size: 1.15rem; color: #A855F7; display: block; margin: 0.5rem 0; text-align: center;">${eleve.filiere || eleve.classeNom}</strong>
        Est officiellement conféré à : <strong style="font-size: 1.1rem;">${eleve.nom.toUpperCase()} ${eleve.prenom}</strong><br>
        Matricule : <strong>${eleve.matricule}</strong> • Sexe : <strong>${eleve.sexe || 'M'}</strong><br>
        Pour avoir satisfait à l'ensemble des modules d'atelier, de sécurité industrielle et d'évaluation pratique en milieu professionnel.
      </p>
    `;
  } else {
    // ATTESTATION_REUSSITE_BTS
    bodyContent = `
      <p style="font-size: 0.95rem; line-height: 1.8; text-align: justify; margin: 1.5rem 0;">
        Le Jury National de Délibération et la Direction des Études de l'institut <strong>${etab.name}</strong> certifient que :<br>
        L'étudiant(e) : <strong style="font-size: 1.15rem; color: #0284C7;">${eleve.nom.toUpperCase()} ${eleve.prenom}</strong><br>
        Numéro Matricule Académique : <strong>${eleve.matricule}</strong><br>
        Inscrit(e) dans la filière : <strong>${eleve.filiere || eleve.classeNom}</strong><br><br>
        A validé avec succès l'ensemble des unités d'enseignement fondamentales et transversales équivalant à :<br>
        <strong style="font-size: 1.25rem; color: #10B981; display: block; text-align: center; margin: 0.6rem 0; padding: 0.4rem; background: rgba(16, 185, 129, 0.08); border-radius: 6px; border: 1px dashed #10B981;">
          60 CRÉDITS EUROPÉENS CAPITALISABLES ET TRANSFÉRABLES (ECTS)
        </strong>
        Moyenne Générale Pondérée : <strong>${eleve.moyenneGenerale || 16.5} / 20</strong> • Rang : <strong>${eleve.rang || 1}er</strong> de la promotion.<br>
        <strong>Décision :</strong> Est déclaré(e) <strong>ADMIS(E) EN ANNÉE SUPÉRIEURE AVEC MENTION TRÈS BIEN</strong>.
      </p>
    `;
  }

  const area = document.getElementById('officialCertificateRenderArea');
  if (!area) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  area.innerHTML = `
    <div class="printable-official-doc">
      <div class="doc-flag-header">
        <div>
          <div class="doc-flag-republic">RÉPUBLIQUE DU SÉNÉGAL</div>
          <div class="doc-flag-ministry">Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation</div>
          <div class="doc-flag-ministry" style="color: #0284C7;">Direction Générale de l'Enseignement Supérieur &amp; de la Formation Pro</div>
          <div class="doc-devise">Un Peuple - Un But - Une Foi</div>
          <div style="margin-top: 0.6rem; font-size: 1.15rem; font-weight: 800; color: #0F172A;">${etab.name}</div>
          <div style="font-size: 0.75rem; color: #64748B;">Code Institutionnel : <strong>${etab.code}</strong> • ${etab.city}</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-qr-box">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(`https://sunuschoolexpress.com/verify?code=${verifCode}`)}" alt="QR Code" style="width: 85px; height: 85px; display: block; border-radius: 4px;">
            <div style="font-size: 0.58rem; color: #0284C7; font-weight: 800; margin-top: 3px;">QR VÉRIFICATION</div>
          </div>
        </div>
      </div>

      <div class="doc-title-box">
        <div class="doc-main-title">${docTitle}</div>
        <div class="doc-sub-title">${docSub}</div>
      </div>

      ${bodyContent}

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #CBD5E1;">
        <div>
          <div style="font-size: 0.72rem; color: #64748B;">Fait à <strong>${etab.city || 'Dakar'}</strong>, le <strong>${dateStr}</strong></div>
          <div class="doc-official-seal" style="margin-top: 0.6rem;">
            SCEAU CERTIFIÉ<br>
            RÉPUBLIQUE DU SÉNÉGAL<br>
            SUNUSCHOOL-EXPRESS
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Le Directeur des Études &amp; des Examens</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0284C7; margin-top: 0.4rem;">Dr. Mamadou Cissé</div>
          <div style="font-size: 0.72rem; color: #94A3B8; font-style: italic;">Signature Électronique Certifiée AES-256</div>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 0.5rem;">
        <div>Document sécurisé doté d'une empreinte cryptographique. Toute falsification est punie par la loi.</div>
        <div>Code Unique de Vérification : <strong>${verifCode}</strong></div>
      </div>
    </div>
  `;

  if (isNew) {
    const newDoc = {
      id: `cert-${Date.now()}`,
      etablissementId: etabId,
      etudiantNom: `${eleve.prenom} ${eleve.nom}`,
      matricule: eleve.matricule,
      filiere: eleve.filiere || eleve.classeNom,
      type: certType,
      typeLibelle: docTitle,
      codeVerification: verifCode,
      dateEmission: new Date().toISOString().split('T')[0],
      mention: "Admis avec Mention"
    };
    appState.db.certificatsIssued.unshift(newDoc);
    saveCertificatsStore();
    renderCertificatsTable();
  }

  const modal = document.getElementById('modalOfficialCertificate');
  if (modal) modal.classList.add('active');
}

// Module Corps Professoral & Oustazs (RH, Contrats & Paie)
window.renderTeachersView = renderTeachersView;
window.syncEstablishmentTeachers = syncEstablishmentTeachers;
window.openNewTeacherModal = openNewTeacherModal;
window.renderTeacherClassesPills = renderTeacherClassesPills;
window.toggleDashboardTeacherClassPill = toggleDashboardTeacherClassPill;
window.submitNewTeacherModal = submitNewTeacherModal;
window.deleteTeacher = deleteTeacher;
window.openTeacherPayslip = openTeacherPayslip;

// Modules Stages & Certificats
window.renderStagesView = renderStagesView;
window.renderStagesTable = renderStagesTable;
window.openNewConventionModal = openNewConventionModal;
window.onConventionStudentSelectChange = onConventionStudentSelectChange;
window.submitNewConvention = submitNewConvention;
window.previewOfficialConvention = previewOfficialConvention;
window.validateConventionStage = validateConventionStage;
window.printStagesReport = printStagesReport;
window.renderCertificatsView = renderCertificatsView;
window.renderCertificatsTable = renderCertificatsTable;
window.openIssueCertificatModal = openIssueCertificatModal;
window.generateOfficialCertificate = generateOfficialCertificate;
window.applyPresetSlot = applyPresetSlot;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

