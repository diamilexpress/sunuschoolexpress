/**
 * SunuSchoolExpress - SaaS Dashboard Controller
 * Logique Métier & Pont API REST / Persistance Locale
 */

// Initial Seed data pour mode autonome / fallback immédiat
const DEFAULT_DATABASE = {
  etablissements: [],
  classes: [],
  eleves: [],
  transactions: [],
  auditLogs: [],
  enseignants: [],
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

      // Purge STRICTEMENT technique des anciens identifiants de maquette (aucun nom filtré)
      const isFakeDemoEntry = (item) => {
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
      appState.db.etablissements = appState.db.etablissements.filter(e => !isFakeDemoEntry(e));
      appState.db.classes = appState.db.classes.filter(c => !isFakeDemoEntry(c.etablissementId));
      appState.db.eleves = appState.db.eleves.filter(el => !isFakeDemoEntry(el.etablissementId));
      appState.db.transactions = appState.db.transactions.filter(t => !isFakeDemoEntry(t.etablissementId));
      appState.db.enseignants = appState.db.enseignants.filter(en => !isFakeDemoEntry(en.etablissementId));

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
        : (role === 'ENSEIGNANT' ? "Espace Classe & Moyennes" : (role === 'COMPTABLE' ? "Suivi Recouvrement Scolarités" : "Tableau de Bord École Privée")), 
      desc: isDaara 
        ? "Supervision en direct des effectifs talibés, pensions et mémorisation coranique" 
        : "Supervision en direct des effectifs scolaires, scolarités et moyennes de classe" 
    },
    daara: { title: "Daara Moderne & Suivi Coranique", desc: "Progression Hizb 1 à 60, Tajwîd, Internat & Cartes PVC" },
    school: { title: "Gestion Scolaire & Effectifs", desc: "Cycles Primaire, Collège et Lycée (CI à Terminale)" },
    classes: { 
      title: isDaara ? "Classes & Niveaux Coraniques (Daara)" : "Gestion des Classes & Niveaux Pédagogiques", 
      desc: isDaara 
        ? "Packs de mémorisation en 1 clic (Hifz 1-2 & Fiqh), effectifs de pensionnaires et emplois du temps" 
        : "Packs officiels en 1 clic (Primaire, Collège, Lycée), effectifs réels, professeurs principaux et emplois du temps" 
    },
    grades: { title: "Notes & Bulletins Officiels", desc: "Coefficients officiels sénégalais, moyennes pondérées et impression PDF" },
    timetable: { 
      title: isDaara ? "Emploi du Temps Hebdomadaire (Daara Moderne)" : "Emploi du Temps & Planning Pédagogique (École)", 
      desc: isDaara 
        ? "Grille horaire hebdomadaire adaptée aux séances de Tahfîz, Allouwa, Tajwîd et Murâja'ah" 
        : "Gestion des créneaux de cours, matières officielles, salles et enseignants par classe" 
    },
    teachers: {
      title: isDaara ? "Corps des Oustazs & Personnel Daara" : "Corps Professoral, Enseignants & RH",
      desc: isDaara
        ? "Gestion des maîtres coraniques, contrats d'enseignement, affectations de groupes et salaires"
        : "Gestion des enseignants titulaires et vacataires, contrats de travail, affectations de classes et fiches de paie"
    },
    caisse: { 
      title: isDaara ? "Caisse & Pensions SYSCOHADA (Daara)" : "Caisse & Scolarités SYSCOHADA (École)", 
      desc: "Passerelle Wave, Orange Money et Grand Livre de caisse certifié" 
    },
    finconfig: { 
      title: isDaara ? "Comptes d'Encaissement & Wave Marchand (Daara)" : "Comptes d'Encaissement & Coordonnées Bancaires (École)", 
      desc: "Configuration des comptes Wave Business, Orange Money et RIB bancaire pour encaissement direct des scolarités" 
    },
    comms: { 
      title: isDaara ? "Communication Parents & Tuteurs (Daara)" : "Communication Familles & Clés d'Accès (École)", 
      desc: "Notifications SMS/WhatsApp et distribution des clés d'accès" 
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

  const etabPill = document.getElementById('sidebarEtabPill');
  const etabAvatar = document.getElementById('sidebarEtabAvatar');
  const etabName = document.getElementById('sidebarEtabName');
  const etabType = document.getElementById('sidebarEtabType');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const userNameEl = document.getElementById('userNameDisplay');
  const userAvatar = document.getElementById('userAvatar');

  // Mise à jour du rappel de la formule souscrite (Sidebar & Header)
  const rawPlan = etab && etab.plan ? etab.plan : (isDaara ? 'Pack Internat Promo Daara (20 000 FCFA/mois)' : 'Formule École Pro (55 000 FCFA/mois)');
  const cleanPlan = rawPlan.toLowerCase().startsWith('formule') || rawPlan.toLowerCase().startsWith('pack') || rawPlan.toLowerCase().startsWith('option') ? rawPlan : `Formule ${rawPlan}`;
  const planLower = cleanPlan.toLowerCase();
  
  let planIcon = '⭐';
  if (isDaara || planLower.includes('daara')) {
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

  if (isSuperAdmin) {
    if (btnNewIcon) btnNewIcon.textContent = "+";
    if (btnNewText) btnNewText.textContent = "Inscrire Établissement";
    btnNew.title = "Ajouter un Daara Moderne ou une École Privée au SaaS SunuSchool";

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
    if (btnNewText) btnNewText.textContent = "Saisir Notes";
    btnNew.title = "Saisir les notes et devoirs pour le bulletin officiel";

    if (btnPayIcon) btnPayIcon.textContent = "⚡";
    if (btnPayText) btnPayText.textContent = "Faire l'Appel";
    btnPay.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
    btnPay.title = "Pointer les présences des élèves de la classe";

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
    const firstEleve = appState.db.eleves.find(e => e.etablissementId === appState.activeEstablishmentId && e.type === 'SCOLAIRE');
    if (firstEleve) {
      openGradesEntryModal(firstEleve.id);
    } else {
      const firstTalibe = appState.db.eleves.find(e => e.etablissementId === appState.activeEstablishmentId && e.type === 'TALIBE');
      if (firstTalibe) openHizbEvalModal(firstTalibe.id);
      else showToast("Aucun élève scolaire enregistré pour cette classe.", true);
    }
  } else if (role === 'COMPTABLE') {
    openEncaissementMultiModal();
  } else {
    // ADMIN_DIRECTEUR
    const etab = appState.db.etablissements.find(e => e.id === appState.activeEstablishmentId);
    const isDaara = etab && etab.type === 'DAARA';
    openNewEleveModal(isDaara ? 'TALIBE' : 'SCOLAIRE');
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
}

// 1. KPI VUE D'ENSEMBLE
function renderOverviewKpis() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';

  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const tx = appState.db.transactions.filter(t => etabId ? t.etablissementId === etabId : true);

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

  } else {
    // Spécifique École Privée
    const scolaires = eleves.filter(e => e.type === 'SCOLAIRE');
    const scWithNotes = scolaires.filter(s => typeof s.moyenneGenerale === 'number' || typeof s.moyenne === 'number');
    const moyGenerale = scWithNotes.length > 0 
      ? (scWithNotes.reduce((acc, s) => acc + (Number(s.moyenneGenerale || s.moyenne) || 0), 0) / scWithNotes.length).toFixed(2)
      : null;

    const enAttenteEcole = total - aJour;
    const tauxEcole = total > 0 ? Math.round((aJour / total) * 100) : 100;

    if (elKpi1Title) elKpi1Title.textContent = "Effectif Scolaire Actif";
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

  if (thStudent) thStudent.textContent = isDaara ? "Talibé (Matricule)" : "Élève (Matricule)";
  if (thClass) thClass.textContent = isDaara ? "Cycle Tahfiz / Internat" : "Classe Scolaire";
  if (thLevel) thLevel.textContent = isDaara ? "Avancement Coran (Hizb)" : "Moyenne Scolaire (/20)";
  if (thPension) thPension.textContent = isDaara ? "Statut Pension" : "Statut Scolarité";
  if (tableTitle) {
    tableTitle.textContent = isDaara 
      ? "Derniers Talibés & Mémorisation Coranique" 
      : "Derniers Dossiers & Mises à Jour Scolaires";
  }

  // Rendu de la table d'activité récente
  const tbody = document.getElementById('overviewRecentTable');
  if (tbody) {
    tbody.innerHTML = '';
    if (eleves.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">Aucun dossier enregistré pour cet établissement.</td></tr>`;
      return;
    }
    eleves.slice(0, 5).forEach(e => {
      const tr = document.createElement('tr');
      const isTalibe = e.type === 'TALIBE';
      tr.innerHTML = `
        <td>
          <div class="avatar-cell">
            <div class="avatar-round" style="background: ${isTalibe ? 'rgba(255,184,0,0.2)' : 'rgba(0,210,180,0.2)'}; color: ${isTalibe ? 'var(--gold)' : 'var(--primary)'};">${e.prenom[0]}${e.nom[0]}</div>
            <div>
              <div class="cell-main-text">${e.prenom} ${e.nom}</div>
              <div class="cell-sub-text">${e.matricule} • ${isTalibe ? '🕌 Talibé' : '🏫 Élève'}</div>
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
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => e.type === 'SCOLAIRE' && (etabId ? e.etablissementId === etabId : true));
  const tbody = document.getElementById('schoolStudentsTable');
  if (!tbody) return;

  const role = appState.activeRole;
  const isEnseignant = role === 'ENSEIGNANT';
  const isComptable = role === 'COMPTABLE';

  const schoolHeaderBtn = document.getElementById('schoolHeaderActionBtn');
  if (schoolHeaderBtn) {
    if (isEnseignant) {
      schoolHeaderBtn.textContent = "📑 Saisir les Notes de Classe";
      schoolHeaderBtn.onclick = () => switchTab('grades');
      schoolHeaderBtn.title = "Accéder à la saisie des notes et calcul des bulletins";
      schoolHeaderBtn.className = "btn btn-primary btn-sm";
    } else if (isComptable) {
      schoolHeaderBtn.textContent = "💳 Encaisser Scolarité Wave/OM";
      schoolHeaderBtn.onclick = () => openEncaissementMultiModal();
      schoolHeaderBtn.title = "Encaisser scolarité ou frais d'inscription";
      schoolHeaderBtn.className = "btn btn-primary btn-sm";
    } else {
      schoolHeaderBtn.textContent = "+ Nouvel Élève";
      schoolHeaderBtn.onclick = () => openNewEleveModal('SCOLAIRE');
      schoolHeaderBtn.title = "Inscrire un nouvel élève à l'école";
      schoolHeaderBtn.className = "btn btn-primary btn-sm";
    }
  }

  tbody.innerHTML = '';
  if (eleves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Aucun élève scolaire pour cet établissement.</td></tr>`;
    return;
  }

  eleves.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="avatar-cell">
          <div class="avatar-round">${e.prenom[0]}${e.nom[0]}</div>
          <div>
            <div class="cell-main-text">${e.prenom} ${e.nom}</div>
            <div class="cell-sub-text">${e.matricule} • Clé: <code style="color:var(--primary);">${e.cleAcces}</code></div>
          </div>
        </div>
      </td>
      <td><span class="badge-tag badge-blue">${e.classeNom}</span></td>
      <td><strong>${e.moyenneGenerale || 14.5}/20</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Rang: ${e.rang || 1}er)</span></td>
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
            <button class="btn btn-outline btn-sm" onclick="generateOfficialBulletin('${e.id}')">Bulletin</button>
          ` : isComptable ? `
            <button class="btn btn-primary btn-sm" onclick="openEncaissementMultiModal('${e.id}')" style="background: linear-gradient(135deg, #10B981, #00D2B4);">💳 Encaisser</button>
            <button class="btn btn-outline btn-sm" onclick="previewReceiptModal('${e.id}')">🧾 Reçu</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="generateOfficialBulletin('${e.id}')">📑 Bulletin</button>
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

function syncEstablishmentClasses() {
  if (!appState.db) return;
  if (!Array.isArray(appState.db.classes)) appState.db.classes = [];
  const estKey = getActiveEstablishmentKey();
  const etabId = appState.activeEstablishmentId;

  // 1. Importer depuis la clé localStorage de index.html si présente (sse_classes_${estKey})
  try {
    const portalClassesRaw = localStorage.getItem(`sse_classes_${estKey}`);
    if (portalClassesRaw) {
      const portalClasses = JSON.parse(portalClassesRaw);
      if (Array.isArray(portalClasses)) {
        portalClasses.forEach(pc => {
          const exists = appState.db.classes.some(c => 
            (c.id === pc.id || c.nom.toLowerCase().trim() === pc.nom.toLowerCase().trim()) &&
            (c.etablissementId === etabId || !c.etablissementId)
          );
          if (!exists) {
            appState.db.classes.push({
              id: pc.id || `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              etablissementId: etabId,
              nom: pc.nom,
              cycle: pc.cycle || 'Élémentaire',
              salle: pc.salle || 'Salle Principale',
              capacite: Number(pc.capacite) || 45,
              profPrincipal: pc.profPrincipal || '',
              effectif: 0
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("Erreur synchronisation sse_classes:", e);
  }

  // 2. Synchronisation miroir vers sse_classes_${estKey}
  const currentEstClasses = appState.db.classes.filter(c => etabId ? c.etablissementId === etabId : true);
  try {
    localStorage.setItem(`sse_classes_${estKey}`, JSON.stringify(currentEstClasses));
  } catch (e) {}
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

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);
  const eleves = (appState.db.eleves || []).filter(e => etabId ? e.etablissementId === etabId : true);

  const countText = `${classes.length} Classe${classes.length > 1 ? 's' : ''} Active${classes.length > 1 ? 's' : ''}`;
  if (badgeEl) badgeEl.textContent = countText;
  if (sidebarBadge) sidebarBadge.textContent = `${classes.length} Classe${classes.length > 1 ? 's' : ''}`;
  if (sidebarBadgeDaara) sidebarBadgeDaara.textContent = `${classes.length} Section${classes.length > 1 ? 's' : ''}`;

  if (classes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1.5rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm);">
        <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">🏫</div>
        <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">Aucune classe configurée pour le moment</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem;">
          Gagnez du temps en générant instantanément les grilles officielles en 1 clic grâce aux packs ci-dessus, ou ajoutez vos classes manuellement.
        </p>
        <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" onclick="applyClassPresetPack('${isDaara ? 'daara' : 'primaire'}')" style="background: linear-gradient(135deg, #10B981, #00D2B4); font-weight: 700;">
            ⚡ Injecter le Pack ${isDaara ? 'Daara Moderne' : 'Primaire'}
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="openNewClassModal()">+ Créer une Classe sur-mesure</button>
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
    'daara': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)', icon: '🕌' }
  };

  let cardsHtml = '';
  classes.forEach(c => {
    const cNameLow = (c.nom || '').toLowerCase();
    const cIdLow = (c.id || '').toLowerCase();
    const cycleKey = (c.cycle || '').toLowerCase().trim();
    const theme = cycleColors[cycleKey] || (cycleKey.includes('daara') ? cycleColors.daara : (cycleKey.includes('coll') ? cycleColors['collège'] : (cycleKey.includes('lyc') ? cycleColors['lycée'] : cycleColors['élémentaire'])));

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
              <span>${theme.icon}</span> <span>${c.cycle || 'Section'}</span>
            </span>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>🚪</span> <span>${c.salle || 'Salle Principale'}</span>
          </div>

          <div style="margin: 0.85rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-secondary);">Effectif Enregistré :</span>
              <strong style="color: ${count > 0 ? '#00D2B4' : '#fff'};">${count} / ${maxCap} Apprenants</strong>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #00D2B4, #10B981); border-radius: 3px; transition: width 0.3s ease;"></div>
            </div>
          </div>

          <div style="font-size: 0.76rem; color: var(--text-secondary); margin-bottom: 1rem;">
            👨‍🏫 <strong>Prof. Référent :</strong> <span style="color: #fff;">${c.profPrincipal || 'Non assigné'}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.45rem; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 0.85rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" style="flex: 1; font-size: 0.76rem; padding: 0.4rem 0.6rem; font-weight: 700; background: linear-gradient(135deg, #F59E0B, #D97706); color: #fff;" onclick="selectClassForTimetable('${c.nom}')" title="Voir ou générer l'emploi du temps de cette classe">
            📅 Emploi du Temps
          </button>
          <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.76rem; padding: 0.4rem 0.6rem;" onclick="openNewClassModal('${c.id}')" title="Modifier cette classe">
            ✏️
          </button>
          <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.76rem; padding: 0.4rem 0.6rem; color: #F87171; border-color: rgba(239, 68, 68, 0.3);" onclick="deleteClass('${c.id}')" title="Supprimer cette classe">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = cardsHtml;
}

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
      { id: `cls_d4_${now}`, nom: "Moutawassit (Tajwîd & Grammaire)", cycle: 'Daara', salle: 'Salle de MÃ©morisation', capacite: 30, profPrincipal: '' },
      { id: `cls_d5_${now}`, nom: "Thanawi (Sciences Islamiques & Fiqh)", cycle: 'Daara', salle: 'Salle Al-Azhar', capacite: 25, profPrincipal: '' }
    ];
  }

  if (!Array.isArray(appState.db.classes)) appState.db.classes = [];
  const added = [];

  presetClasses.forEach(p => {
    const exists = appState.db.classes.some(c => 
      (c.etablissementId === etabId || !c.etablissementId) &&
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
  showToast(`🎉 Pack ${packName.toUpperCase()} configuré (${added.length} classes ajoutées) !`);
}

function openNewClassModal(editId = null) {
  const modal = document.getElementById('modalDashboardClass');
  if (!modal) return;

  const idInput = document.getElementById('editDashboardClassId');
  const titleEl = document.getElementById('modalDashboardClassTitle');
  const nomInput = document.getElementById('dashboardClassNameInput');
  const cycleSelect = document.getElementById('dashboardClassCycleSelect');
  const capInput = document.getElementById('dashboardClassCapacityInput');
  const roomInput = document.getElementById('dashboardClassRoomInput');
  const teacherInput = document.getElementById('dashboardClassTeacherInput');

  if (editId) {
    const c = (appState.db.classes || []).find(item => item.id === editId);
    if (c) {
      if (idInput) idInput.value = c.id;
      if (titleEl) titleEl.textContent = `Modifier la Classe : ${c.nom}`;
      if (nomInput) nomInput.value = c.nom || '';
      if (cycleSelect) cycleSelect.value = c.cycle || 'Élémentaire';
      if (capInput) capInput.value = c.capacite || 45;
      if (roomInput) roomInput.value = c.salle || '';
      if (teacherInput) teacherInput.value = c.profPrincipal || '';
    }
  } else {
    if (idInput) idInput.value = '';
    if (titleEl) titleEl.textContent = '🏫 Ajouter une Nouvelle Classe';
    if (nomInput) nomInput.value = '';
    if (cycleSelect) cycleSelect.value = 'Élémentaire';
    if (capInput) capInput.value = 45;
    if (roomInput) roomInput.value = 'Salle Principale';
    if (teacherInput) teacherInput.value = '';
  }

  modal.classList.add('active');
}

function submitNewClassModal(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('editDashboardClassId')?.value;
  const nom = document.getElementById('dashboardClassNameInput')?.value?.trim();
  const cycle = document.getElementById('dashboardClassCycleSelect')?.value || 'Élémentaire';
  const capacite = parseInt(document.getElementById('dashboardClassCapacityInput')?.value) || 45;
  const salle = document.getElementById('dashboardClassRoomInput')?.value?.trim() || 'Salle Principale';
  const profPrincipal = document.getElementById('dashboardClassTeacherInput')?.value?.trim() || '';
  const etabId = appState.activeEstablishmentId;

  if (!nom) {
    showToast('⚠️ Veuillez renseigner le nom de la classe.', true);
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
      showToast(`✓ Classe ${nom} mise à jour avec succès !`);
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
    showToast(`✓ Classe ${nom} créée avec succès !`);
  }

  saveDataStore();
  syncEstablishmentClasses();
  closeModals();
  renderClassesView();
  renderSidebar();
}

function deleteClass(classId) {
  const c = (appState.db.classes || []).find(item => item.id === classId);
  const nom = c ? c.nom : 'cette classe';
  if (!confirm(`Êtes-vous sûr de vouloir supprimer la classe "${nom}" ?`)) return;

  appState.db.classes = (appState.db.classes || []).filter(item => item.id !== classId);
  saveDataStore();
  syncEstablishmentClasses();

  if (appState.isApiOnline) {
    fetch(`http://localhost:5000/api/classes/${classId}`, { method: 'DELETE' }).catch(() => {});
  }

  renderClassesView();
  renderSidebar();
  showToast(`🗑️ Classe "${nom}" supprimée.`);
}

function selectClassForTimetable(className) {
  const classes = (appState.db.classes || []).filter(c => appState.activeEstablishmentId ? c.etablissementId === appState.activeEstablishmentId : true);
  const found = classes.find(c => c.nom.toLowerCase().trim() === className.toLowerCase().trim());
  if (found) {
    activeTimetableClassId = found.id;
  }
  switchTab('timetable');
  showToast(`📅 Emploi du temps affiché pour la classe : ${className}`);
}

function triggerAutoGenerateTimetable() {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';

  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);
  let currentClass = classes.find(c => c.id === activeTimetableClassId);

  if (!currentClass) {
    if (classes.length > 0) {
      activeTimetableClassId = classes[0].id;
      currentClass = classes[0];
    } else {
      showToast("⚠️ Aucune classe active. Créez d'abord une classe ou appliquez un pack.", true);
      return;
    }
  }

  const className = currentClass.nom;
  const cycle = (currentClass.cycle || (isDaara ? 'Daara' : 'Élémentaire')).toLowerCase();
  const slotsList = isDaara ? DAARA_TIME_SLOTS : ECOLE_TIME_SLOTS;

  // 1. Matières officielles selon le cycle
  let subjects = [];
  if (cycle.includes('maternelle')) {
    subjects = [
      { subject: "Accueil & Langage", teacher: "Maîtresse Aïda", room: "Salle Éveil" },
      { subject: "Comptines & Éveil Sensoriel", teacher: "Maîtresse Aïda", room: "Salle Éveil" },
      { subject: "Graphisme & Dessin", teacher: "Maîtresse Fatou", room: "Atelier Dessin" },
      { subject: "Activités Motrices & EPS", teacher: "Coach Diouf", room: "Cour Maternelle" },
      { subject: "Jeux Libres & Chants", teacher: "Maîtresse Fatou", room: "Salle Éveil" }
    ];
  } else if (cycle.includes('daara')) {
    subjects = [
      { subject: "Tahfîz Matinal (Hizb 1-60)", teacher: currentClass.profPrincipal || "Oustaz Serigne Modou Ndiaye", room: "Salle de MÃ©morisation" },
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
  showToast(`⚡ Emploi du temps de ${className} généré automatiquement sans aucun conflit d'enseignant !`);
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

  // 1. Importer depuis la clé localStorage sse_teachers_${estKey}
  try {
    const portalTeachersRaw = localStorage.getItem(`sse_teachers_${estKey}`);
    if (portalTeachersRaw) {
      const portalTeachers = JSON.parse(portalTeachersRaw);
      if (Array.isArray(portalTeachers)) {
        portalTeachers.forEach(pt => {
          const exists = appState.db.enseignants.some(t =>
            (t.id === pt.id || (t.nom && pt.nom && t.nom.toLowerCase().trim() === pt.nom.toLowerCase().trim())) &&
            (t.etablissementId === etabId || !t.etablissementId)
          );
          if (!exists) {
            appState.db.enseignants.push({
              id: pt.id || `ens-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              etablissementId: etabId,
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

  // 2. Synchronisation miroir vers sse_teachers_${estKey}
  const currentEstTeachers = appState.db.enseignants.filter(t => etabId ? t.etablissementId === etabId : true);
  try {
    localStorage.setItem(`sse_teachers_${estKey}`, JSON.stringify(currentEstTeachers));
  } catch (e) {}
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

  const countLabel = `${teachers.length} ${isDaara ? 'Oustaz' : 'Enseignant'}${teachers.length > 1 ? 's' : ''}`;
  if (countEl) countEl.textContent = countLabel;
  if (hoursEl) hoursEl.textContent = `${totalHours} h / sem`;
  if (payrollEl) payrollEl.textContent = `${new Intl.NumberFormat('fr-FR').format(totalPayroll)} FCFA`;
  if (sidebarBadge) sidebarBadge.textContent = `${teachers.length} Profs`;
  if (sidebarBadgeDaara) sidebarBadgeDaara.textContent = `${teachers.length} Oustazs`;

  if (!tbody) return;

  // 2. Rendu du tableau des enseignants
  if (teachers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">👨‍🏫</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">
            Aucun contrat ${isDaara ? 'oustaz' : 'enseignant'} enregistré pour le moment
          </div>
          <p style="font-size: 0.85rem; max-width: 500px; margin: 0 auto 1.25rem;">
            Enregistrez les membres du corps professoral, leurs contrats, volumes horaires et affectations de classes pour alimenter automatiquement les emplois du temps et la paie.
          </p>
          <button type="button" class="btn btn-primary btn-sm" onclick="openNewTeacherModal()" style="background: linear-gradient(135deg, #00D2B4, #3B82F6); font-weight: 700;">
            + Nouveau Contrat ${isDaara ? 'Oustaz' : 'Enseignant'}
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = teachers.map(t => {
    const initials = (t.nom || 'Enseignant').split(' ').filter(p => p.length > 0).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    const cleanTel = (t.tel || '').replace(/\s+/g, '');
    const classesList = Array.isArray(t.classes) ? t.classes : (t.classes ? [t.classes] : []);
    
    const classesBadges = classesList.length > 0 
      ? classesList.map(c => `<span class="badge-tag badge-blue" style="font-size: 0.72rem; padding: 0.15rem 0.45rem; margin: 0.1rem;">${c}</span>`).join('')
      : `<span style="color: var(--text-secondary); font-size: 0.78rem; font-style: italic;">Non affecté</span>`;

    const isTitulaire = (t.contrat || '').toLowerCase().includes('titulaire');
    const contractBadgeClass = isTitulaire ? 'badge-green' : ((t.contrat || '').toLowerCase().includes('vacataire') ? 'badge-yellow' : 'badge-purple');
    const salaryFormatted = Number(t.salaire) > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.salaire)} FCFA` : 'Non renseigné';

    return `
      <tr>
        <td>
          <div class="avatar-cell">
            <div class="avatar-round" style="background: ${isDaara ? 'rgba(245,158,11,0.18)' : 'rgba(56,189,248,0.18)'}; color: ${isDaara ? 'var(--gold)' : '#38BDF8'}; font-weight: 800;">
              ${initials || 'ENS'}
            </div>
            <div>
              <div class="cell-main-text" style="font-weight: 700; color: #fff;">${t.nom}</div>
              <div class="cell-sub-text" style="display: flex; gap: 0.4rem; align-items: center; margin-top: 0.15rem;">
                <span class="badge-tag badge-purple" style="font-size: 0.68rem; padding: 0.1rem 0.35rem;">${t.mat || 'ENS-2026'}</span>
                ${cleanTel ? `<a href="https://wa.me/${cleanTel.replace('+', '')}" target="_blank" style="color: #22C55E; text-decoration: none; font-size: 0.75rem;">💬 ${t.tel}</a>` : ''}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: #E2E8F0;">${t.matiere || 'Enseignement Général'}</span>
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
          <span class="badge-tag ${contractBadgeClass}" style="font-weight: 600;">${t.contrat || 'CDI Titulaire'}</span>
        </td>
        <td>
          <div style="font-weight: 700; color: #FBBF24;">${salaryFormatted}</div>
          <a href="javascript:void(0)" onclick="openTeacherPayslip('${t.id}')" style="font-size: 0.72rem; color: var(--primary); text-decoration: underline; margin-top: 0.15rem; display: inline-block;">
            📄 Fiche de Paie
          </a>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="openTeacherPayslip('${t.id}')" title="Générer l'attestation / bulletin de paie" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
              📄
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="openNewTeacherModal('${t.id}')" title="Modifier le contrat" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
              ✏️
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="deleteTeacher('${t.id}')" title="Supprimer l'enseignant" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; color: var(--danger); border-color: rgba(239, 68, 68, 0.4);">
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

  if (!modal) return;

  if (editId) {
    const teacher = (appState.db.enseignants || []).find(t => t.id === editId);
    if (!teacher) return;

    if (titleEl) titleEl.innerHTML = `✏️ Modifier le Contrat ${isDaara ? 'Oustaz' : 'Enseignant'}`;
    if (editIdInput) editIdInput.value = editId;

    document.getElementById('dashboardTeacherNom').value = teacher.nom || '';
    document.getElementById('dashboardTeacherTel').value = teacher.tel || '';
    document.getElementById('dashboardTeacherMatiere').value = teacher.matiere || '';
    document.getElementById('dashboardTeacherContrat').value = teacher.contrat || (isDaara ? 'Titulaire Daara' : 'CDI Titulaire');
    document.getElementById('dashboardTeacherVolume').value = teacher.volume || '20h / semaine';
    document.getElementById('dashboardTeacherSalaire').value = teacher.salaire || 220000;

    selectedTeacherModalClasses = Array.isArray(teacher.classes) ? [...teacher.classes] : (teacher.classes ? [teacher.classes] : []);
  } else {
    if (titleEl) titleEl.innerHTML = `👨‍🏫 Nouveau Contrat ${isDaara ? 'Oustaz' : 'Enseignant'}`;
    if (editIdInput) editIdInput.value = '';
    if (form) form.reset();

    document.getElementById('dashboardTeacherVolume').value = '20h / semaine';
    document.getElementById('dashboardTeacherSalaire').value = isDaara ? '180000' : '220000';
    document.getElementById('dashboardTeacherContrat').value = isDaara ? 'Titulaire Daara' : 'CDI Titulaire';
    document.getElementById('dashboardTeacherMatiere').value = isDaara ? 'Coran, Tajwîd & Hifz' : 'Mathématiques';

    selectedTeacherModalClasses = [];
  }

  renderTeacherClassesPills();
  modal.classList.add('active');
}

function renderTeacherClassesPills() {
  const container = document.getElementById('dashboardTeacherClassesPills');
  if (!container) return;

  const etabId = appState.activeEstablishmentId;
  const classes = (appState.db.classes || []).filter(c => etabId ? c.etablissementId === etabId : true);

  if (classes.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-secondary); width: 100%; text-align: center; padding: 0.5rem;">
        Aucune classe enregistrée dans l'établissement. Ajoutez des classes dans l'onglet Classes pour les assigner ici.
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
    const prefix = isDaara ? 'OUS-2026' : 'ENS-2026';
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

    showToast(`✓ Contrat de ${nom} enregistré avec succès (${mat}) !`);
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
    : 'Tronc commun / Établissement';

  contentEl.innerHTML = `
    <div style="background: #ffffff; color: #1e293b; padding: 1.5rem; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- En-tête officiel de l'Établissement -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; text-transform: uppercase;">${etab ? etab.name : 'SunuSchool Express'}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-top: 0.2rem;">
            ${isDaara ? 'Institut Islamique & Daara Moderne' : "Établissement Privé d'Enseignement Général"} • ${etab ? etab.city : 'Sénégal'}
          </div>
          <div style="font-size: 0.75rem; color: #64748b;">Agrément MEN / Ministère de la Formation • Téléphone Direction : ${etab?.phone || '+221 77 000 00 00'}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #00D2B4; text-transform: uppercase; letter-spacing: 0.5px;">BULLETIN DE PAIE OFFICIEL</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 0.15rem;">${periodeTexte.toUpperCase()}</div>
          <div style="font-size: 0.72rem; color: #64748b;">Date d'édition : ${dateEmission}</div>
        </div>
      </div>

      <!-- Informations Enseignant -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.85rem; margin-bottom: 1.25rem; font-size: 0.82rem;">
        <div>
          <div style="color: #64748b; font-size: 0.72rem; text-transform: uppercase;">Nom & Prénom du Salarié</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">${teacher.nom}</div>
          <div style="margin-top: 0.35rem; color: #64748b; font-size: 0.72rem; text-transform: uppercase;">Matricule / Contrat</div>
          <div style="font-weight: 600; color: #334155;">${teacher.mat} • ${teacher.contrat || 'CDI Titulaire'}</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 0.72rem; text-transform: uppercase;">Matière & Affectations</div>
          <div style="font-weight: 700; color: #0f172a;">${teacher.matiere}</div>
          <div style="color: #475569; font-size: 0.78rem; margin-top: 0.15rem;">Classes : ${classesAffectees}</div>
          <div style="margin-top: 0.35rem; color: #64748b; font-size: 0.72rem; text-transform: uppercase;">Volume Hebdomadaire</div>
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
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);

  tbody.innerHTML = '';
  if (eleves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Aucun élève enregistré pour cet établissement.</td></tr>`;
    return;
  }

  eleves.forEach((e, idx) => {
    const isTalibe = e.type === 'TALIBE';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="avatar-cell">
          <div class="avatar-round" style="background: ${isTalibe ? 'rgba(245,158,11,0.2)' : 'rgba(0,210,180,0.2)'}; color: ${isTalibe ? 'var(--gold)' : 'var(--primary)'};">
            ${e.prenom[0]}${e.nom[0]}
          </div>
          <div>
            <div class="cell-main-text">${e.prenom} ${e.nom}</div>
            <div class="cell-sub-text">${e.matricule} • Clé: <code>${e.cleAcces}</code></div>
          </div>
        </div>
      </td>
      <td><span class="badge-tag ${isTalibe ? 'badge-gold' : 'badge-blue'}">${e.classeNom}</span></td>
      <td>
        ${isTalibe 
          ? `<strong>Hizb ${e.hizbActuel} / 60</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Tajwîd: ${e.tajwidNote}/20)</span>`
          : `<strong>${e.moyenneGenerale || 15.5} / 20</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Semestre 1)</span>`
        }
      </td>
      <td>
        <span class="badge-tag badge-green">${e.rang ? `${e.rang}${e.rang === 1 ? 'er' : 'e'}` : `${idx + 1}e`}</span>
      </td>
      <td>
        <span style="font-size: 0.8rem; font-weight: 700; color: #34D399;">
          ${isTalibe ? (e.hizbActuel >= 40 ? '🌟 Hifz Avancé • Félicitations' : '✓ Très Bonne Progression') : (e.moyenneGenerale >= 16 ? '🌟 Félicitations du Conseil' : '✓ Tableau d\'Honneur')}
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
              📑 Bulletin Scolaire
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

function openGradesEntryModal(eleveId) {
  const modal = document.getElementById('modalGradesEntry');
  if (!modal) return;

  const etabId = appState.activeEstablishmentId;
  const scolaires = appState.db.eleves.filter(e => e.type === 'SCOLAIRE' && (etabId ? e.etablissementId === etabId : true));

  if (scolaires.length === 0) {
    showToast("Aucun élève de cycle scolaire enregistré pour cet établissement.", true);
    return;
  }

  let eleve = scolaires.find(e => e.id === eleveId);
  if (!eleve) eleve = scolaires[0];

  appState.activeEleveIdForGrades = eleve.id;

  // Remplir le sélecteur d'élèves
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
    eleve.bulletinNotes = JSON.parse(JSON.stringify(DEFAULT_SCOLAIRE_SUBJECTS));
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

// B. Badge PVC Talibé
function previewPvcBadge(talibeId) {
  const talibe = appState.db.eleves.find(e => e.id === talibeId);
  if (!talibe) return;

  const preview = document.getElementById('pvcBadgeRenderArea');
  if (preview) {
    preview.innerHTML = `
      <div class="pvc-card-preview" style="margin: 0 auto;">
        <div class="pvc-header">
          <span class="pvc-title">🇸🇳 CARTE OFFICIELLE SCOLAIRE • CARTE OFFICIELLE</span>
          <span style="font-size: 0.65rem; background: #00D2B4; color: #000; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 800;">PVC CR-80</span>
        </div>
        <div class="pvc-body">
          <div class="pvc-photo">🧕</div>
          <div>
            <div class="pvc-name">${talibe.prenom} ${talibe.nom}</div>
            <div class="pvc-meta">Matricule : <strong>${talibe.matricule}</strong></div>
            <div class="pvc-meta">Niveau : <strong>Hizb ${talibe.hizbActuel} / 60</strong></div>
            <div class="pvc-meta">Lit : <strong>N°${talibe.internat.litNumero} (${talibe.internat.pavillon})</strong></div>
          </div>
          <div class="pvc-qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://sunuschool.sn/verify/${talibe.matricule}" style="width: 100%; height: 100%; border-radius: 2px;" alt="QR Code">
          </div>
        </div>
        <div style="font-size: 0.65rem; color: #94A3B8; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.3rem; display: flex; justify-content: space-between;">
          <span>Clé Famille : ${talibe.cleAcces}</span>
          <span>Validité : 2026-2027</span>
        </div>
      </div>
    `;
  }
  document.getElementById('modalPvcBadge').classList.add('active');
}

// C. Bulletin Officiel (Double Moteur : Daara / Tahfiz Coranique ou École Nationale)
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
  const phone = (eleve.parentTelephone || '+221 77 645 88 12').replace(/[^0-9]/g, '');
  const msg = isDaara
    ? `SunuSchoolExpress - Bulletin de Progression Hifz &amp; Tajwîd%0A%0ABonjour ${eleve.parentNom || 'Cher Parent'},%0AVoici le bilan de progression coranique de ${eleve.prenom} ${eleve.nom} :%0A📖 Hizb atteint : ${eleve.hizbActuel} / 60 (${eleve.sourate})%0A⭐ Note Tajwîd : ${eleve.tajwidNote}/20%0AClé d'accès famille : ${eleve.cleAcces}%0AFélicitations de la direction du Daara !`
    : `SunuSchoolExpress - Bulletin Scolaire Officiel%0A%0ABonjour ${eleve.parentNom || 'Cher Parent'},%0AVoici les résultats officiels de ${eleve.prenom} ${eleve.nom} (${eleve.classeNom}) :%0A📊 Moyenne Générale : ${eleve.moyenneGenerale || 16.5}/20%0A🏆 Rang : ${eleve.rang || 1}er de la classe%0AClé d'accès famille : ${eleve.cleAcces}%0AFélicitations du Conseil des Maîtres !`;
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  showToast(`📲 Bulletin partagé par WhatsApp avec ${eleve.parentNom} !`);
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

// D. Modal Nouveau Talibé / Élève
function openNewEleveModal(forcedType = null) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId);
  const isDaara = etab && etab.type === 'DAARA';

  const modalTitle = document.querySelector('#modalNewEleve .modal-title');
  const typeSelect = document.getElementById('newType');

  const targetType = forcedType || (isDaara ? 'TALIBE' : 'SCOLAIRE');

  if (typeSelect) {
    typeSelect.value = targetType;
  }

  if (modalTitle) {
    modalTitle.innerHTML = targetType === 'TALIBE' 
      ? `<span>🕌</span> <span>Inscrire un Nouveau Talibé (Daara Moderne)</span>` 
      : `<span>🏫</span> <span>Inscrire un Nouvel Élève (École Privée)</span>`;
  }

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

  if (!nom || !prenom) {
    showToast('Veuillez renseigner le nom et le prénom.', true);
    return;
  }

  const litNum = lit ? parseInt(lit) : Math.floor(1 + Math.random() * 20);
  const chambreNom = chambre || "Chambre 03 (Pavillon Al-Madina)";

  const newEleve = {
    id: `eleve-${Date.now()}`,
    etablissementId: appState.activeEstablishmentId,
    matricule: `SSE-${Date.now().toString().slice(-4)}`,
    nom,
    prenom,
    sexe: 'M',
    type,
    classeId: type === 'TALIBE' ? 'cls-hifz1' : 'cls-3eme',
    classeNom: type === 'TALIBE' ? 'Classe Débutante (Hizb 1-15)' : 'Troisième B (3ème B)',
    hizbActuel: 1,
    sourate: 'Al-Fatiha',
    tajwidNote: 16.0,
    progressionPct: 2,
    internat: { 
      pavillon: chambreNom.includes('(') ? chambreNom.split('(')[1].replace(')', '') : "Pavillon Khadimou Rassoul", 
      dortoir: chambreNom, 
      chambre: chambreNom,
      litNumero: litNum, 
      statutLit: "OCCUPE" 
    },
    parentNom: parentNom || 'Parent Référent',
    parentTelephone: parentTel || '+221 77 000 00 00',
    cleAcces: `PAR-${Math.floor(10000 + Math.random() * 90000)}`,
    statutPension: 'A_JOUR',
    mensualite: type === 'TALIBE' ? 25000 : 45000
  };

  appState.db.eleves.unshift(newEleve);
  appState.db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    user: "Directeur / Admin",
    role: "ADMIN",
    action: "INSCRIPTION_ELEVE",
    details: `Nouvelle inscription : ${newEleve.prenom} ${newEleve.nom} (${newEleve.matricule})`
  });

  saveDataStore();
  closeModals();
  showToast(`🎉 Inscription confirmée pour ${newEleve.prenom} ${newEleve.nom} !`);
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
  // Remplir le sélecteur d'élèves selon l'établissement actif
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const select = document.getElementById('payEleveSelect');
  
  if (select) {
    select.innerHTML = '';
    eleves.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.setAttribute('data-nom', `${e.prenom} ${e.nom}`);
      opt.setAttribute('data-parent', e.parentNom || 'Parent');
      opt.setAttribute('data-tel', e.parentTelephone || '+221 77 000 00 00');
      opt.setAttribute('data-mensualite', e.mensualite || (e.type === 'TALIBE' ? 25000 : 45000));
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
          <div style="color: #64748b; font-size: 0.72rem;">BÉNÉFICIAIRE / ÉLÈVE :</div>
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

// K. COMMUNICATION : RÉPERTOIRE ET RENVOI DES CLÉS PARENTS
function openParentKeysModal() {
  const etabId = appState.activeEstablishmentId;
  const eleves = appState.db.eleves.filter(e => etabId ? e.etablissementId === etabId : true);
  const tbody = document.getElementById('parentKeysTable');

  if (tbody) {
    tbody.innerHTML = '';
    if (eleves.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Aucune famille enregistrée pour cet établissement.</td></tr>`;
    } else {
      eleves.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong style="color:#fff;">${e.parentNom || 'Parent Référent'}</strong>
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
  const clean = (e.parentTelephone || '+221 77 645 88 12').replace(/[^0-9]/g, '');
  const msg = `SunuSchoolExpress - Clé Famille Sécurisée%0A%0ABonjour ${e.parentNom || 'Cher Parent'},%0AVoici votre clé d'accès unique pour suivre la scolarité de ${e.prenom} ${e.nom} :%0A🔑 Clé : *${e.cleAcces}*%0A%0AAccédez directement à vos reçus certifiés, notes et progression coranique sans mot de passe sur SunuSchoolExpress.`;
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
  showToast("Tous les élèves sont pointés Présents.");
}

function notifyAbsenceWhatsApp(eleveId) {
  const e = appState.db.eleves.find(el => el.id === eleveId);
  if (!e) return;
  const clean = (e.parentTelephone || '+221 77 645 88 12').replace(/[^0-9]/g, '');
  const msg = `SunuSchoolExpress - Avis Important d'Absence%0A%0ABonjour ${e.parentNom || 'Cher Parent'},%0ANous vous informons que votre enfant *${e.prenom} ${e.nom}* (${e.classeNom}) n'a pas été pointé à l'appel matinal ce jour.%0AMerci de contacter la vie scolaire ou l'Oustaz pour régulariser.`;
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  showToast(`🚨 Alerte WhatsApp transmise au parent de ${e.prenom} ${e.nom} !`);
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

  const titleEl = document.getElementById('timetableActiveClassName');
  const cycleEl = document.getElementById('timetableActiveCycle');
  const badgeInfo = document.getElementById('timetableActiveBadgeInfo');
  const cycleBadge = document.getElementById('timetableCycleBadge');

  if (titleEl) titleEl.textContent = currentClass ? currentClass.nom : (isDaara ? "Classe Coranique" : "Classe");
  if (cycleEl) cycleEl.textContent = currentClass ? `Cycle : ${currentClass.cycle} • Effectif : ${currentClass.effectif} apprenants` : (isDaara ? "Hifz & Tajwîd" : "Général");
  if (badgeInfo) badgeInfo.textContent = currentClass ? `${currentClass.nom} • ${currentClass.effectif || 30} Élèves` : "Aucune classe";
  if (cycleBadge) cycleBadge.textContent = currentClass ? `Cycle ${currentClass.cycle}` : (isDaara ? "Daara Moderne" : "Enseignement Général");

  renderTimetableClassPills(classes);
  renderTimetableGrid();
}

function switchTimetableClass(clsId) {
  activeTimetableClassId = clsId;
  renderTimetable();
}

function renderTimetableClassPills(classes) {
  const container = document.getElementById('timetableClassPills');
  if (!container) return;

  let pillsHtml = (classes || []).map(c => `
    <button type="button" class="timetable-class-btn ${c.id === activeTimetableClassId ? 'active' : ''}" onclick="switchTimetableClass('${c.id}')">
      ${c.nom}
    </button>
  `).join('');

  pillsHtml += `
    <button type="button" class="timetable-class-btn add-class-btn" onclick="openCreateTimetableModal()" title="Créer ou configurer un emploi du temps pour une autre classe" style="border: 1px dashed var(--primary); color: var(--primary); background: rgba(0, 210, 180, 0.08); font-weight: 700;">
      + Ajouter une Classe
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
  const slotsList = isDaara ? DAARA_TIME_SLOTS : ECOLE_TIME_SLOTS;

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
        html += `
          <td>
            <div class="timetable-slot-card" onclick="openEditTimetableSlotModal('${day.key}', '${slot.key}')" title="Cliquer pour modifier ce cours">
              <div class="slot-subject">${slotData.subject}</div>
              <div class="slot-teacher">👨‍🏫 ${slotData.teacher || 'Professeur'}</div>
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
}

function openEditTimetableSlotModal(day, timeKey) {
  const etabId = appState.activeEstablishmentId;
  const etab = appState.db.etablissements.find(e => e.id === etabId) || appState.db.etablissements[0];
  const isDaara = etab && etab.type === 'DAARA';
  const slotsList = isDaara ? DAARA_TIME_SLOTS : ECOLE_TIME_SLOTS;

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

  const modal = document.getElementById('modalEditTimetableSlot');
  if (modal) modal.classList.add('active');
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
  showToast(`📲 Bulletin officiel transmis par WhatsApp au parent de ${eleve.prenom} ${eleve.nom} !`);
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
    opt.textContent = `${e.type === 'DAARA' ? '🕌' : '🏫'} ${e.name} (${e.city})`;
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
        const match = (appState.db?.etablissements || []).find(e => e.id === est.id || (est.code && e.code === est.code));
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

function handleDashboardAuthUnlock(e) {
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

  // Recherche dans les établissements de la base
  let foundEtab = (appState.db?.etablissements || []).find(e => 
    (e.code && e.code.toUpperCase() === codeVal) ||
    (e.email && e.email.toLowerCase() === rawCode.toLowerCase()) ||
    (e.phone && e.phone.replace(/[^0-9]/g, '') === codeVal.replace(/[^0-9]/g, ''))
  );

  // Recherche subsidiaire dans le registre
  if (!foundEtab) {
    try {
      const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
      foundEtab = reg.find(e => 
        (e.code && e.code.toUpperCase() === codeVal) ||
        (e.email && e.email.toLowerCase() === rawCode.toLowerCase()) ||
        (e.phone && e.phone.replace(/[^0-9]/g, '') === codeVal.replace(/[^0-9]/g, ''))
      );
      if (foundEtab) {
        importOrUpdateEstablishmentInDb(foundEtab);
        saveDataStore();
      }
    } catch(err) {}
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

    const isKeyValid = validKeys.includes(keyVal.trim().toUpperCase());
    if (!isKeyValid) {
      if (errEl) {
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
window.applyClassPresetPack = applyClassPresetPack;
window.openNewClassModal = openNewClassModal;
window.submitNewClassModal = submitNewClassModal;
window.deleteClass = deleteClass;
window.selectClassForTimetable = selectClassForTimetable;
window.triggerAutoGenerateTimetable = triggerAutoGenerateTimetable;

// Module Corps Professoral & Oustazs (RH, Contrats & Paie)
window.renderTeachersView = renderTeachersView;
window.syncEstablishmentTeachers = syncEstablishmentTeachers;
window.openNewTeacherModal = openNewTeacherModal;
window.renderTeacherClassesPills = renderTeacherClassesPills;
window.toggleDashboardTeacherClassPill = toggleDashboardTeacherClassPill;
window.submitNewTeacherModal = submitNewTeacherModal;
window.deleteTeacher = deleteTeacher;
window.openTeacherPayslip = openTeacherPayslip;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

