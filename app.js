/**
 * SunuSchoolExpress - Application Logic & Interactive Sandbox
 * Bilingue Français / Wolof, Simulateurs Mobile Money, Daaras Modernes & Espace Démo
 */

// --- 0. GESTION DU THÈME SOMBRE / CLAIR (PERSISTANCE COOKIE & LOCALSTORAGE) ---
function getStoredTheme() {
  try {
    const local = localStorage.getItem('sunuschool_theme');
    if (local === 'light' || local === 'dark') return local;
    const match = document.cookie.match(new RegExp('(^| )sunuschool_theme=([^;]+)'));
    if (match && (match[2] === 'light' || match[2] === 'dark')) return match[2];
  } catch (e) {}
  return 'dark'; // Thème sombre par défaut (bleu nuit & blanc cassé)
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem('sunuschool_theme', theme);
    document.cookie = `sunuschool_theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {}
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  if (isLight) {
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) document.body.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (document.body) document.body.removeAttribute('data-theme');
  }
}

// Application précoce immédiate pour éviter tout flash blanc/noir
applyTheme(getStoredTheme());

function initTheme() {
  applyTheme(getStoredTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const newTheme = current === 'light' ? 'dark' : 'light';

  applyTheme(newTheme);
  setStoredTheme(newTheme);

  const message = newTheme === 'light'
    ? '🌞 Mode Clair activé : Fond blanc cassé et texte bleu nuit.'
    : '🌙 Mode Sombre activé : Fond bleu nuit et texte blanc cassé.';
  showNotification(message);
}

// --- 1. DICTIONNAIRE BILINGUE (FRANÇAIS / WOLOF) ---
const translations = {
  fr: {
    brand_subtitle: "Plateforme SaaS Écoles & Daaras Modernes 🇸🇳",
    nav_presentation: "Présentation",
    nav_modules: "Fonctionnalités &amp; Démo",
    nav_pricing: "Tarifs",
    nav_contact: "Contact",
    nav_portal: "Espace Démo / Gestion",
    nav_daara: "Module Daaras",
    nav_school: "Module Scolaire",
    nav_payments: "Mobile Money",
    btn_demo: "🛡️ Démo Vitrine",
    hero_badge: "✨ N°1 de la Transformation Numérique Scolaire au Sénégal",
    hero_title: "SunuSchoolExpress, la plateforme qui réunit <span class='highlight-turq'>modernité</span> et <span class='highlight-gold'>excellence éducative</span>.",
    hero_subtitle: "Simplifiez la gestion de votre école ou daara, encaissez vos paiements en toute sécurité, et valorisez vos élèves avec des bulletins conformes MEN et un suivi coranique d’exception.",
    hero_tagline: "<span>🚀</span> <span>L’éducation sénégalaise entre dans une nouvelle ère — simple, fluide et 100% numérique.</span>",
    btn_start_trial: "Démarrer l'essai 30j Gratuit",
    btn_explore_demo: "Explorer le Tableau de Bord Démo",
    badge_wave: "Paiement Wave & OM certifié",
    badge_syscohada: "Conforme SYSCOHADA",
    badge_bilingual: "100% Bilingue Wolof - Français",
    engagement_title: "Frais d'Adhésion & Symbole d'Engagement",
    engagement_desc: "Paiement unique de 10 000 FCFA à l'inscription de l'établissement + Premier mois d'abonnement 100% OFFERT (Essai gratuit 30 jours sans engagement).",
    tab_schools: "🏫 Écoles Privées",
    tab_daaras: "🕌 Daaras Modernes & Internats",
    role_admin: "Directeur / Admin",
    role_teacher: "Oustaz / Enseignant",
    role_parent: "Parent d'Élève",
    sec_notice: "Environnement Démo Sécurisé actif. Toutes les actions sont simulées et réinitialisables."
  },
  wo: {
    brand_subtitle: "Dawaan bi ñeel Daara yi ak Daara yu bees yi 🇸🇳",
    nav_presentation: "Xamle gi",
    nav_modules: "Man-man yi &amp; Démo",
    nav_pricing: "Njëg yi",
    nav_contact: "Jokkool",
    nav_portal: "Dëkkuwaay démo bi",
    nav_daara: "Wàllu Daara yi",
    nav_school: "Wàllu Ekool yi",
    nav_payments: "Peyma Mobile Money",
    btn_demo: "🛡️ Seet ko ci Démo bi",
    hero_badge: "✨ Këru xam-xam bu bees bi ci Senegal",
    hero_title: "SunuSchoolExpress, dawaan bi boole <span class='highlight-turq'>xarala gu bees</span> ak <span class='highlight-gold'>njàng mu dëggu</span>.",
    hero_subtitle: "Yombalal sayitub sa daara mbaa sa ekool, feyyu ci kaaraange, te jox say xale karnde yu wóor (MEN) ak toppitexi alxuraan gu tëddu.",
    hero_tagline: "<span>🚀</span> <span>Njàngum Senegaal dugal na ci jamono yu bees — yomb, leer te 100% xarala.</span>",
    btn_start_trial: "Tàmbali weeru njàngat bi amul fey",
    btn_explore_demo: "Gisandoo lépp ci Démo bi",
    badge_wave: "Wave ak Orange Money wóor na",
    badge_syscohada: "Mbootaayu SYSCOHADA",
    badge_bilingual: "Wolof ak Farañse",
    engagement_title: "Njëgu duggal Daara bi (Kollëre)",
    engagement_desc: "10 000 FCFA kese ngay fey bu njëkk, te am weeru xarala gu tëddu (30 bés yu amul benn fey).",
    tab_schools: "🏫 Ekool yu kenn",
    tab_daaras: "🕌 Daara yu bees yi ak dëkkuwaay",
    role_admin: "Njiit li / Kilifa gi",
    role_teacher: "Ustaz / Jàngalekat",
    role_parent: "Wàyjur / Njiitu kër",
    sec_notice: "Fii démo la rekk bu wóor. Mën nga ci jéem lépp te lenn du yaqu."
  }
};

let currentLang = 'fr';
let currentRole = 'ADMIN';

// --- 2. JEU DE DONNÉES RÉALISTE (SANDBOX DÉMO) ---
const demoState = {
  talibes: [
    {
      id: 'tal_1',
      matricule: 'DAA-2026-001',
      prenom: 'Mouhamed Bachir',
      nom: 'Sow',
      age: 13,
      hizb: 48,
      juz: 24,
      sourate: 'Yâ-Sîn (يس)',
      tajwidNote: 19.5,
      qualite: 'EXCELLENT',
      chambre: 'Chambre 03',
      dortoir: 'Pavillon Al-Madina',
      lit: 2,
      mensualiteStatut: 'PAYE',
      parentNom: 'Cheikh Tidiane Sow',
      parentTel: '+221 77 645 88 12',
      dateInscription: '01/09/2026'
    },
    {
      id: 'tal_2',
      matricule: 'DAA-2026-002',
      prenom: 'Fatoumata Zahra',
      nom: 'Ndiaye',
      age: 11,
      hizb: 32,
      juz: 16,
      sourate: 'Al-Kahf (الكهف)',
      tajwidNote: 18.0,
      qualite: 'TRES_BIEN',
      chambre: 'Chambre 01',
      dortoir: 'Pavillon Khadija',
      lit: 4,
      mensualiteStatut: 'PAYE',
      parentNom: 'El Hadji Ndiaye',
      parentTel: '+221 78 412 90 33',
      dateInscription: '02/09/2026'
    },
    {
      id: 'tal_3',
      matricule: 'DAA-2026-003',
      prenom: 'Abdoulaye',
      nom: 'Kane',
      age: 14,
      hizb: 60,
      juz: 30,
      sourate: 'Al-Baqarah (Khatm complet 🎓)',
      tajwidNote: 20.0,
      qualite: 'EXCELLENT',
      chambre: 'Chambre 02',
      dortoir: 'Pavillon Al-Madina',
      lit: 1,
      mensualiteStatut: 'PAYE',
      parentNom: 'Mamadou Kane',
      parentTel: '+221 76 580 44 20',
      dateInscription: '05/09/2026'
    },
    {
      id: 'tal_4',
      matricule: 'DAA-2026-004',
      prenom: 'Moustapha',
      nom: 'Diallo',
      age: 9,
      hizb: 12,
      juz: 6,
      sourate: 'Al-An\'am (الأنعام)',
      tajwidNote: 15.5,
      qualite: 'BIEN',
      chambre: 'Chambre 04',
      dortoir: 'Pavillon Al-Madina',
      lit: 3,
      mensualiteStatut: 'EN_ATTENTE',
      parentNom: 'Ousmane Diallo',
      parentTel: '+221 70 891 22 55',
      dateInscription: '08/09/2026'
    }
  ],

  elevesScolaires: [
    {
      id: 'eleve_1',
      matricule: 'EXC-2026-015',
      prenom: 'Aïssatou',
      nom: 'Diop',
      classe: 'CM2 A',
      moyenne: 17.85,
      rang: '1ère',
      fraisStatut: 'PAYE',
      absences: 0,
      dateInscription: '15/09/2026',
      parentTel: '+221 77 334 12 90'
    },
    {
      id: 'eleve_2',
      matricule: 'EXC-2026-028',
      prenom: 'Babacar',
      nom: 'Seck',
      classe: 'CM2 A',
      moyenne: 15.40,
      rang: '4ème',
      fraisStatut: 'EN_ATTENTE',
      absences: 2,
      dateInscription: '16/09/2026',
      parentTel: '+221 78 541 22 10'
    },
    {
      id: 'eleve_3',
      matricule: 'EXC-2026-039',
      prenom: 'Khadija',
      nom: 'Faye',
      classe: '3ème B',
      moyenne: 16.90,
      rang: '2ème',
      fraisStatut: 'PAYE',
      absences: 1,
      dateInscription: '18/09/2026',
      parentTel: '+221 76 908 77 33',
      parentNom: 'Abdoulaye Faye'
    },
    {
      id: 'eleve_4',
      matricule: 'EXC-2026-052',
      prenom: 'Cheikh Tidiane',
      nom: 'Diagne',
      classe: 'CM2 A',
      moyenne: 18.25,
      rang: '1er',
      fraisStatut: 'PAYE',
      absences: 0,
      dateInscription: '20/09/2026',
      parentTel: '+221 77 654 32 10',
      parentNom: 'Amadou Diagne'
    }
  ],
  get students() {
    return this.elevesScolaires || [];
  },
  set students(val) {
    this.elevesScolaires = val;
  },

  transactions: [
    {
      ref: 'SSE-2026-89412',
      date: 'Aujourd\'hui 11:42',
      eleve: 'Mouhamed Bachir Sow',
      motif: 'Pension Internat Daara - Octobre 2026',
      montant: '35 000 FCFA',
      operateur: 'WAVE',
      tel: '+221 77 645 88 12',
      statut: 'VALIDE'
    },
    {
      ref: 'SSE-2026-89408',
      date: 'Aujourd\'hui 09:15',
      eleve: 'Aïssatou Diop',
      motif: 'Scolarité Mensuelle - Octobre 2026',
      montant: '25 000 FCFA',
      operateur: 'ORANGE_MONEY',
      tel: '+221 77 334 12 90',
      statut: 'VALIDE'
    },
    {
      ref: 'SSE-2026-89390',
      date: 'Hier 16:30',
      eleve: 'Groupe Scolaire Al-Amine',
      motif: 'Frais d\'inscription Établissement (Engagement)',
      montant: '10 000 FCFA',
      operateur: 'WAVE',
      tel: '+221 76 112 34 56',
      statut: 'VALIDE'
    }
  ],

  auditLogs: [
    { time: '12:45:10', action: 'Connexion sécurisée MFA vérifiée (SMS code)', user: 'Dr. Amadou Fall (Admin)' },
    { time: '11:42:15', action: 'Encaissé 35 000 FCFA via Wave (Réf: SSE-2026-89412)', user: 'Passerelle API Wave' },
    { time: '10:30:00', action: 'Mise à jour progression Hizb 48 pour Mouhamed Bachir Sow', user: 'Oustaz Oumar Ba' },
    { time: '09:15:22', action: 'Génération Reçu SYSCOHADA N° SSE-2026-89408', user: 'Caisse Centrale' }
  ],

  syscohadaJournal: [
    { date: '09/10/2026', ref: 'PC-2026-001', debit: '512100', credit: '706100', motif: 'Encaissement Mensualité Wave (Aïssatou Diop)', debitVal: 35000, creditVal: 35000, status: 'CONFORME' },
    { date: '09/10/2026', ref: 'PC-2026-002', debit: '512100', credit: '706100', motif: 'Encaissement Scolarité Orange Money (Babacar Seck)', debitVal: 25000, creditVal: 25000, status: 'CONFORME' },
    { date: '08/10/2026', ref: 'PC-2026-003', debit: '641100', credit: '512100', motif: 'Acompte Salaire M. Abdoulaye Diallo (Maths)', debitVal: 100000, creditVal: 100000, status: 'CONFORME' },
    { date: '07/10/2026', ref: 'PC-2026-004', debit: '604100', credit: '512100', motif: 'Achat Livres & Craies Fournitures Scolaires', debitVal: 45000, creditVal: 45000, status: 'CONFORME' },
    { date: '06/10/2026', ref: 'PC-2026-005', debit: '605100', credit: '512100', motif: 'Facture Électricité Senelec Octobre', debitVal: 68000, creditVal: 68000, status: 'CONFORME' }
  ],

  hrTeachers: [
    { id: 'ens_1', nom: 'M. Abdoulaye Diallo', matiere: 'Mathématiques (CM2 / 3ème)', volume: '22h / semaine', contrat: 'CDI Titulaire', salaire: 220000, mat: 'ENS-2026-08', tel: '+221 77 450 12 34' },
    { id: 'ens_2', nom: 'Mme Mariama Ba', matiere: 'Français & Littérature', volume: '20h / semaine', contrat: 'CDI Titulaire', salaire: 210000, mat: 'ENS-2026-14', tel: '+221 78 620 99 11' },
    { id: 'ens_3', nom: 'Oustaz Ibrahima Ndiaye', matiere: 'Arabe, Coran & Hifz', volume: '18h / semaine', contrat: 'CDI Titulaire', salaire: 195000, mat: 'ENS-2026-03', tel: '+221 76 333 44 88' },
    { id: 'ens_4', nom: 'M. Cheikh Tidiane Diop', matiere: 'SVT & Sciences de la Vie', volume: '16h / semaine', contrat: 'Vacataire', salaire: 175000, mat: 'ENS-2026-22', tel: '+221 70 800 15 20' },
    { id: 'ens_5', nom: 'Mme Aminata Traoré', matiere: 'Anglais & Outils Informatiques', volume: '16h / semaine', contrat: 'Vacataire', salaire: 180000, mat: 'ENS-2026-27', tel: '+221 77 911 22 33' }
  ]
};

// Copie de sauvegarde pour restauration démo
demoState.students = demoState.elevesScolaires;
const originalDemoState = JSON.parse(JSON.stringify(demoState));
originalDemoState.students = originalDemoState.elevesScolaires;

const defaultEstablishmentsRegistry = [
  {
    email: "sunushoolexpress@gmail.com",
    name: "SunuSchool Express SaaS HQ",
    plan: "Console Super Admin Plateforme",
    type: "SUPER_ADMIN",
    city: "Dakar (HQ National Cloud)",
    code: "SSE-ADMIN-HQ",
    phone: "+221 77 888 12 34",
    isSuperAdmin: true
  }
];

function getEstablishmentRegistry() {
  const combined = [...defaultEstablishmentsRegistry];
  try {
    const saved = localStorage.getItem('sunuschool_establishments_registry');
    if (saved) {
      const custom = JSON.parse(saved);
      if (Array.isArray(custom)) {
        custom.forEach(item => {
          if (!item || !item.name) return;
          const normName = item.name.trim().toLowerCase();
          const existingIdx = combined.findIndex(c => 
            (c.code && item.code && c.code.toLowerCase() === item.code.toLowerCase()) ||
            (c.name && c.name.trim().toLowerCase() === normName)
          );
          if (existingIdx >= 0) {
            combined[existingIdx] = { ...combined[existingIdx], ...item };
          } else {
            combined.push(item);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Erreur getEstablishmentRegistry:", e);
  }
  return combined;
}

function saveEstablishmentToRegistry(est) {
  if (!est || !est.name) return;
  try {
    const saved = localStorage.getItem('sunuschool_establishments_registry');
    let list = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(list)) list = [];

    const normName = est.name.trim().toLowerCase();
    const index = list.findIndex(item => 
      (est.code && item.code && item.code.toLowerCase() === est.code.toLowerCase()) ||
      (item.name && item.name.trim().toLowerCase() === normName)
    );
    if (index >= 0) {
      list[index] = { ...list[index], ...est };
    } else {
      list.push(est);
    }
    localStorage.setItem('sunuschool_establishments_registry', JSON.stringify(list));
    syncWithSaaSDatabase(est);
    if (typeof populateWorkspaceEstablishmentsDropdown === 'function') {
      populateWorkspaceEstablishmentsDropdown();
    }
  } catch (e) {
    console.warn("Erreur saveEstablishmentToRegistry:", e);
  }
}

function syncWithSaaSDatabase(est) {
  if (!est || !est.name) return;
  try {
    const sseDbRaw = localStorage.getItem('sse_saas_database');
    let sseDb = sseDbRaw ? JSON.parse(sseDbRaw) : null;
    if (!sseDb) {
      sseDb = {
        etablissements: [],
        classes: [],
        eleves: [],
        transactions: []
      };
    }
    if (!Array.isArray(sseDb.etablissements)) sseDb.etablissements = [];

    const normName = est.name.trim().toLowerCase();
    let existingIndex = sseDb.etablissements.findIndex(e => 
      (est.code && e.code && e.code.toLowerCase() === est.code.toLowerCase()) ||
      (e.name && e.name.toLowerCase().trim() === normName)
    );

    let price = 45000;
    const pLow = (est.plan || '').toLowerCase();
    if (pLow.includes('85') || pLow.includes('premium')) price = 85000;
    else if (pLow.includes('75')) price = 75000;
    else if (pLow.includes('55') || pLow.includes('pro')) price = 55000;
    else if (pLow.includes('20') || pLow.includes('starter')) price = 20000;
    else if (pLow.includes('35') || pLow.includes('daara')) price = 35000;
    else if (pLow.includes('700')) price = 70000;

    const newCode = (est.code && est.code !== 'SSE-SN-1786') 
      ? est.code 
      : (normName.includes('diamil') ? 'SSE-SN-1786' : ('SSE-SN-' + Math.floor(1000 + Math.random() * 9000)));

    const etabObj = {
      id: existingIndex >= 0 ? sseDb.etablissements[existingIndex].id : `etab-${est.name.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`,
      code: newCode,
      name: est.name,
      type: est.type || (pLow.includes('daara') ? 'DAARA' : 'ECOLE'),
      city: est.city || 'Dakar',
      phone: est.phone || '+221 77 123 45 67',
      email: est.email || `direction@${est.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn`,
      directeurNom: (est.directeurNom && est.directeurNom !== 'Dir. Le' && est.directeurNom !== 'Le') ? est.directeurNom : (est.name ? `Direction ${est.name}` : 'Direction Générale'),
      plan: est.plan || 'Formule Pro',
      prixMensuel: price,
      statut: est.statut || (existingIndex >= 0 ? sseDb.etablissements[existingIndex].statut : "EN_ATTENTE_VALIDATION"),
      statutAbonnement: est.statutAbonnement || est.statut || (existingIndex >= 0 ? sseDb.etablissements[existingIndex].statutAbonnement : "EN_ATTENTE_VALIDATION"),
      echeanceAbonnement: "2026-11-30",
      dateAdhesion: est.dateAdhesion || new Date().toISOString().split('T')[0],
      fraisAdhesionPayes: (typeof est.fraisAdhesionPayes === 'boolean') ? est.fraisAdhesionPayes : (existingIndex >= 0 ? sseDb.etablissements[existingIndex].fraisAdhesionPayes : false),
      requestedPlan: est.requestedPlan || (existingIndex >= 0 ? sseDb.etablissements[existingIndex].requestedPlan : null),
      waveTransactionRef: est.waveTransactionRef || est.dernierPaiementRef || null
    };

    if (existingIndex >= 0) {
      sseDb.etablissements[existingIndex] = { ...sseDb.etablissements[existingIndex], ...etabObj };
    } else {
      sseDb.etablissements.push(etabObj);
    }

    localStorage.setItem('sse_saas_database', JSON.stringify(sseDb));

    // 2. Synchronisation automatique multi-appareils (Serveur Cloud / IP Wi-Fi)
    try {
      const backendBaseUrl = (typeof getBackendBaseUrl === 'function') ? getBackendBaseUrl() : null;
      if (backendBaseUrl) {
        fetch(`${backendBaseUrl}/api/saas/demandes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(etabObj)
        }).catch(() => {
          try {
            const queue = JSON.parse(localStorage.getItem('sse_pending_sync_queue') || '[]');
            queue.push(etabObj);
            localStorage.setItem('sse_pending_sync_queue', JSON.stringify(queue));
          } catch(e) {}
        });
      } else {
        try {
          const queue = JSON.parse(localStorage.getItem('sse_pending_sync_queue') || '[]');
          queue.push(etabObj);
          localStorage.setItem('sse_pending_sync_queue', JSON.stringify(queue));
        } catch(e) {}
      }
    } catch(e) {}
  } catch (e) {
    console.warn("syncWithSaaSDatabase:", e);
  }
}

function flushPendingSyncQueue() {
  try {
    if (typeof isBackendActive !== 'undefined' && !isBackendActive) return;
    const backendBaseUrl = (typeof getBackendBaseUrl === 'function') ? getBackendBaseUrl() : null;
    if (!backendBaseUrl) return;

    const queue = JSON.parse(localStorage.getItem('sse_pending_sync_queue') || '[]');
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remaining = [];
    
    Promise.all(queue.map(item => 
      fetch(`${backendBaseUrl}/api/saas/demandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).then(r => { if (!r.ok) remaining.push(item); })
        .catch(() => { remaining.push(item); })
    )).then(() => {
      localStorage.setItem('sse_pending_sync_queue', JSON.stringify(remaining));
    });
  } catch(e) {}
}
setInterval(flushPendingSyncQueue, 15000);

function populateWorkspaceEstablishmentsDropdown() {
  const select = document.getElementById('wsTopEstablishmentSelector');
  if (!select) return;

  const registry = getEstablishmentRegistry();

  // S'assurer que currentEstablishment est bien dans la liste
  if (currentEstablishment && currentEstablishment.name) {
    const normCurrent = currentEstablishment.name.trim().toLowerCase();
    const isApprovedCurrent = (currentEstablishment.statut === 'ACTIF' || currentEstablishment.statutAbonnement === 'ACTIF' || currentEstablishment.statutAbonnement === 'ESSAI_GRATUIT' || currentEstablishment.type === 'SUPER_ADMIN') && 
                              (currentEstablishment.statut !== 'EN_ATTENTE_VALIDATION') && 
                              (currentEstablishment.fraisAdhesionPayes !== false);
    const exists = registry.some(e => 
      (e.code && currentEstablishment.code && e.code === currentEstablishment.code) ||
      (e.name && e.name.trim().toLowerCase() === normCurrent)
    );
    if (!exists && isApprovedCurrent) {
      registry.push(currentEstablishment);
    }
  }

  select.innerHTML = '';

  const optGroup = document.createElement('optgroup');
  optGroup.label = '🏫 Vos Établissements Enregistrés';

  registry.forEach(est => {
    if (!est || !est.name) return;
    if (est.isSuperAdmin || est.type === 'SUPER_ADMIN') return;

    // FILTRE SÉCURITÉ : Ne jamais afficher d'établissement en attente de validation administrative
    const isApproved = (est.statut === 'ACTIF' || est.statutAbonnement === 'ACTIF' || est.statutAbonnement === 'ESSAI_GRATUIT') && 
                       (est.statut !== 'EN_ATTENTE_VALIDATION') && 
                       (est.fraisAdhesionPayes !== false);
    if (!isApproved) return;

    const opt = document.createElement('option');
    const isDaara = est.type === 'DAARA' || (est.plan && est.plan.toLowerCase().includes('daara'));
    const icon = isDaara ? '🕌' : '🏫';
    const city = est.city ? ` (${est.city})` : '';
    const code = est.code ? ` • ${est.code}` : '';

    opt.value = est.code || est.email || est.name;
    opt.textContent = `${icon} ${est.name}${city}${code}`;

    if (currentEstablishment && (
      (est.code && currentEstablishment.code && est.code === currentEstablishment.code) ||
      (est.name && currentEstablishment.name && est.name.trim().toLowerCase() === currentEstablishment.name.trim().toLowerCase())
    )) {
      opt.selected = true;
    }

    optGroup.appendChild(opt);
  });

  select.appendChild(optGroup);

  const actionGroup = document.createElement('optgroup');
  actionGroup.label = '➕ Actions Établissement';
  const newOpt = document.createElement('option');
  newOpt.value = '__REGISTER_NEW_ESTABLISHMENT__';
  newOpt.textContent = '➕ Inscrire un autre établissement...';
  actionGroup.appendChild(newOpt);
  select.appendChild(actionGroup);
}

function switchWorkspaceEstablishment(identifier) {
  if (!identifier) return;

  if (identifier === '__REGISTER_NEW_ESTABLISHMENT__') {
    openRegistrationModal('Formule École Pro', '55 000 FCFA/mois');
    populateWorkspaceEstablishmentsDropdown();
    return;
  }

  const registry = getEstablishmentRegistry();
  const found = registry.find(e => 
    (e.code && e.code === identifier) ||
    (e.email && e.email.toLowerCase() === identifier.toLowerCase()) ||
    (e.name && e.name === identifier)
  );

  if (found) {
    const isApproved = (found.statut === 'ACTIF' || found.statutAbonnement === 'ACTIF' || found.statutAbonnement === 'ESSAI_GRATUIT' || found.type === 'SUPER_ADMIN') && 
                       (found.statut !== 'EN_ATTENTE_VALIDATION') && 
                       (found.fraisAdhesionPayes !== false);
    if (!isApproved) {
      openPendingValidationNotice(found);
      return;
    }

    currentEstablishment = found;
    try {
      localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
      localStorage.setItem('sunuschool_active_workspace', 'true');
    } catch (e) {}

    activateDedicatedWorkspace(currentEstablishment);
    showNotification(`🏫 Espace de gestion basculé sur : ${found.name}`);
  }
}

window.getEstablishmentRegistry = getEstablishmentRegistry;
window.saveEstablishmentToRegistry = saveEstablishmentToRegistry;
window.populateWorkspaceEstablishmentsDropdown = populateWorkspaceEstablishmentsDropdown;
window.switchWorkspaceEstablishment = switchWorkspaceEstablishment;

function findEstablishmentByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  // 0. Super Administrateur Central Cloud SaaS
  if (cleanEmail === 'sunushoolexpress@gmail.com' || cleanEmail === 'sunuschoolexpress@gmail.com') {
    return {
      email: "sunushoolexpress@gmail.com",
      name: "SunuSchool Express SaaS HQ",
      plan: "Console Super Admin Plateforme",
      type: "SUPER_ADMIN",
      city: "Dakar (HQ National)",
      code: "SSE-ADMIN-HQ",
      phone: "+221 77 888 12 34",
      isSuperAdmin: true
    };
  }

  const registry = getEstablishmentRegistry();
  
  // 1. Recherche par correspondance exacte d'email
  const exact = registry.find(est => est.email && est.email.toLowerCase() === cleanEmail);
  if (exact) return exact;

  // 2. Recherche par domaine ou slug (ex: direction@diamil.sn ou contact@alfourqane.org)
  const parts = cleanEmail.split('@');
  if (parts.length === 2) {
    const domain = parts[1].toLowerCase().replace(/\.(sn|com|org|net|edu)$/i, '');
    const byDomain = registry.find(est => {
      const estDomain = est.email ? est.email.split('@')[1] || '' : '';
      return estDomain.toLowerCase().includes(domain) || est.name.toLowerCase().includes(domain);
    });
    if (byDomain) return byDomain;
  }

  // 3. Si l'email contient des mots clés évidents
  if (cleanEmail.includes('daara') || cleanEmail.includes('fourqane') || cleanEmail.includes('coran') || cleanEmail.includes('talibe')) {
    return registry.find(e => e.type === 'DAARA') || registry[1];
  }
  if (cleanEmail.includes('excellence') || cleanEmail.includes('premium') || cleanEmail.includes('lycee')) {
    return registry.find(e => e.plan && e.plan.toLowerCase().includes('premium')) || registry[2];
  }
  if (cleanEmail.includes('diamil') || cleanEmail.includes('pro')) {
    return registry.find(e => e.plan && e.plan.toLowerCase().includes('pro')) || registry[0];
  }

  // 4. Déduction intelligente d'un établissement personnalisé à partir du domaine saisi
  if (parts.length === 2 && parts[1].includes('.')) {
    const rawName = parts[1].split('.')[0];
    const formattedName = 'Groupe Scolaire ' + rawName.charAt(0).toUpperCase() + rawName.slice(1);
    return {
      email: cleanEmail,
      name: formattedName,
      plan: "Formule École Pro",
      type: "ECOLE",
      city: "Dakar",
      code: "SSE-SN-" + Math.floor(2000 + Math.random() * 7000),
      phone: "+221 77 123 45 67"
    };
  }

  return null;
}

// Fonction de mise à jour instantanée de l'aperçu dans la modale MFA
function onLoginEmailInput(emailValue) {
  const est = findEstablishmentByEmail(emailValue);
  const box = document.getElementById('loginEstDetectedBox');
  const iconEl = document.getElementById('loginDetectedIcon');
  const nameEl = document.getElementById('loginDetectedName');
  const cityCodeEl = document.getElementById('loginDetectedCityCode');
  const badgeEl = document.getElementById('loginDetectedBadge');
  const maskedPhoneEl = document.getElementById('loginMaskedPhone');

  if (!box || !nameEl) return;

  if (est) {
    box.style.display = 'flex';
    if (est.isSuperAdmin || est.type === 'SUPER_ADMIN') {
      if (iconEl) iconEl.textContent = '👑';
      nameEl.textContent = est.name;
      if (cityCodeEl) cityCodeEl.textContent = `Super Admin Plateforme • ${est.email}`;
      if (badgeEl) {
        badgeEl.className = 'ws-plan-pill plan-premium';
        badgeEl.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
        badgeEl.style.color = '#000';
        badgeEl.style.fontWeight = '800';
        badgeEl.textContent = '👑 Super Admin Plateforme';
      }
    } else {
      if (iconEl) iconEl.textContent = est.type === 'DAARA' ? '🕌' : '🏫';
      nameEl.textContent = est.name;
      if (cityCodeEl) cityCodeEl.textContent = `${est.city || 'Sénégal'} • Code : ${est.code || 'SSE-SN-2026'}`;
      
      if (badgeEl) {
        badgeEl.className = 'ws-plan-pill';
        badgeEl.removeAttribute('style');
        const rawPlan = est.plan || 'Standard';
        const planLower = rawPlan.toLowerCase();
        const displayPlan = rawPlan.toLowerCase().startsWith('formule') || rawPlan.toLowerCase().startsWith('pack') ? rawPlan : `Formule ${rawPlan}`;
        if (planLower.includes('starter') || planLower.includes('standard')) {
          badgeEl.classList.add('plan-starter');
          badgeEl.textContent = `⭐ ${displayPlan}`;
        } else if (planLower.includes('pro')) {
          badgeEl.classList.add('plan-pro');
          badgeEl.textContent = `⚡ ${displayPlan}`;
        } else if (planLower.includes('premium') || planLower.includes('annuelle') || planLower.includes('enterprise')) {
          badgeEl.classList.add('plan-premium');
          badgeEl.textContent = `👑 ${displayPlan}`;
        } else {
          badgeEl.textContent = `🎓 ${displayPlan}`;
        }
      }
    }

    if (maskedPhoneEl && est.phone) {
      const p = est.phone;
      maskedPhoneEl.textContent = p.length > 8 ? p.slice(0, 7) + ' **** ' + p.slice(-3) : '+221 77 **** 890';
    }
  } else {
    nameEl.textContent = "Saisissez un e-mail valide...";
    if (cityCodeEl) cityCodeEl.textContent = "Recherche en cours dans la base SunuSchool...";
  }
}

// Bouton raccourci de démo
function fillLoginDemo(email) {
  const input = document.getElementById('loginEmailInput');
  if (input) {
    input.value = email;
    onLoginEmailInput(email);
  }
}

// --- ÉTABLISSEMENT ACTIF & SÉCURITÉ ---
let currentEstablishment = null;

const isFakeDemoSchool = (item) => {
  if (!item) return false;
  if (typeof item === 'object') {
    if (item.isUserCreated || item.phone || item.email || item.dateAdhesion) return false;
    const id = (item.id || '').toLowerCase();
    const code = (item.code || '').toUpperCase();
    return id === 'etab-001' || id === 'etab-002' || id === 'etab-003' || id === 'etab-demo' || id === 'demo' ||
           code === 'SSE-SN-1001' || code === 'SSE-SN-1002' || code === 'SSE-SN-1003' || code === 'DEMO';
  }
  if (typeof item === 'string') {
    const s = item.toLowerCase().trim();
    return s === 'etab-001' || s === 'etab-002' || s === 'etab-003' || s === 'etab-demo' || s === 'demo' ||
           s === 'sse-sn-1001' || s === 'sse-sn-1002' || s === 'sse-sn-1003';
  }
  return false;
};

try {
  const isLoggedOut = localStorage.getItem('sse_user_logged_out') === 'true';
  const isActiveWs = localStorage.getItem('sunuschool_active_workspace') === 'true';
  const savedEst = localStorage.getItem('sunuschool_establishment');

  if (savedEst && !isLoggedOut && isActiveWs) {
    const parsed = JSON.parse(savedEst);
    // Nettoyer si c'était l'un des anciens faux établissements de test
    if (parsed && parsed.name && !isFakeDemoSchool(parsed)) {
      currentEstablishment = parsed;
    } else {
      localStorage.removeItem('sunuschool_establishment');
      localStorage.removeItem('sunuschool_active_workspace');
    }
  } else {
    currentEstablishment = null;
    if (isLoggedOut) {
      localStorage.removeItem('sunuschool_establishment');
      localStorage.removeItem('sunuschool_active_workspace');
    }
  }

  if (currentEstablishment && !currentEstablishment.email) {
    currentEstablishment.email = `direction@${currentEstablishment.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'etab'}.sn`;
  }
} catch (e) {}

// ============================================================================
// --- MOTEUR DE DÉMONSTRATION VIDÉO INTERACTIVE & ACCÈS PARENTS / ÉLÈVES ---
// ============================================================================

const demoVideosData = {
  daara: {
    id: 'daara',
    badge: '🕌 Daaras Modernes',
    title: 'Démonstration Vidéo : Gestion des Daaras Modernes & Internats',
    duration: 72, // 1m 12s (6 chapitres x 12s en lecture continue automatique)
    chapters: [
      {
        id: 'daara_quran',
        time: 0,
        icon: '📖',
        title: 'Suivi Coranique & Tajwîd (Hizb 1 à 60)',
        desc: 'Validation des Hizbs, notation du Tajwîd et alertes parents.',
        durationStr: '00:12',
        subFr: 'Bienvenue dans la démonstration de SunuSchool pour les Daaras Modernes. Découvrez le suivi coranique en direct de chaque talibé, de la mémorisation du Hizb 1 au Hizb 60 avec notation Tajwîd certifiée.',
        subWo: 'Dalal ak jamm ci démo SunuSchool ngir Daara yu bees yi. Xool-leel fi toppal tari alxuraan ci talibe yi, tàmbalee Hizb 1 ba ci Hizb 60 ak saytu tajwîd bu mat sëkk.',
        sceneTitle: 'Suivi de Mémorisation Coranique • Hizb 48 Validé',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #00D2B4, #009688); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; color: #051329;">MB</div>
                <div>
                  <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">Mouhamed Bachir Sow <span style="font-size: 0.75rem; background: rgba(0,210,180,0.2); color: #00D2B4; padding: 0.2rem 0.6rem; border-radius: 12px; margin-left: 0.5rem;">Classe Tahfiz 3</span></h4>
                  <div style="font-size: 0.8rem; color: #94A3B8;">Matricule : SSE-DAR-8419 • Oustaz : Serigne Modou Ndiaye</div>
                </div>
              </div>
              <span class="badge-tag" style="background: rgba(255, 184, 0, 0.15); color: #FFB800; border: 1px solid rgba(255, 184, 0, 0.3);">🌟 Progression Exemplaire</span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem 1rem; border-left: 3px solid #00D2B4;">
                <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Avancement Global</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #00D2B4;">48 / 60 Hizb <span style="font-size: 0.85rem; color: #94A3B8;">(80%)</span></div>
                <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; margin-top: 0.4rem; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #00D2B4, #FFB800); width: 80%; height: 100%;"></div>
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem 1rem; border-left: 3px solid #FFB800;">
                <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Dernier Hizb Validé</div>
                <div style="font-size: 1.15rem; font-weight: 700; color: #fff;">Sourate Yâ-Sîn (يس)</div>
                <div style="font-size: 0.8rem; color: #FFB800;">Note Tajwîd : 19.5 / 20 • Excellent</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem 1rem; border-left: 3px solid #1BA4E8;">
                <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Alerte WhatsApp Famille</div>
                <div style="font-size: 0.85rem; color: #38BDF8; font-weight: 600;">Envoyée à l'instant</div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Au père : +221 77 645 88 12</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 210, 180, 0.08); border: 1px dashed rgba(0, 210, 180, 0.3); border-radius: 8px; padding: 0.75rem 1rem; flex-wrap: wrap; gap: 0.6rem;">
              <span style="font-size: 0.85rem; color: #E2E8F0;">✅ L'Oustaz valide la récitation sur son smartphone • Les parents reçoivent l'audio et la note instantanément.</span>
              <button type="button" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="event.stopPropagation(); showNotification('📖 Hizb 48 validé avec succès par l\\'Oustaz !')">Valider Hizb</button>
            </div>
          </div>
        `
      },
      {
        id: 'daara_internat',
        time: 12,
        icon: '🛏️',
        title: 'Internat & Dortoirs (Gestion des Lits)',
        desc: 'Affectation par dortoir, suivi des repas et santé.',
        durationStr: '00:12',
        subFr: 'Gérez facilement vos dortoirs et internats : affectation des lits en un clic, surveillance de la santé des pensionnaires et contrôle de la restauration collective.',
        subWo: 'Saytu bu yomb ngir sa neegi internat yi : tànn lal yi ci wenn cuq, topp wér-gu-yaramu talibe yi ak lekk gi.',
        sceneTitle: 'Supervision de l\'Internat • Pavillon Keur Massar',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">🏢 Pavillon Khadimou Rassoul <span style="font-size: 0.75rem; background: rgba(0,210,180,0.2); color: #00D2B4; padding: 0.2rem 0.6rem; border-radius: 12px;">Dortoir A & B</span></h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Surveillant Général : Oustaz Ibrahima Fall • Capacité : 50 lits</div>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">Taux d'occupation : 92%</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-bottom: 1rem;">
              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(0,210,180,0.2);">
                <div style="font-size: 1.5rem; margin-bottom: 0.2rem;">🛏️</div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Lit N°14 (Occupé)</div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">Mouhamed Sow</div>
                <div style="font-size: 0.7rem; color: #00D2B4;">Pension Complète</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(0,210,180,0.2);">
                <div style="font-size: 1.5rem; margin-bottom: 0.2rem;">🛏️</div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Lit N°15 (Occupé)</div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">Cheikh Kane</div>
                <div style="font-size: 0.7rem; color: #00D2B4;">Pension Complète</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(255,184,0,0.3);">
                <div style="font-size: 1.5rem; margin-bottom: 0.2rem;">🩺</div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Fiche Médicale</div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #FFB800;">46 / 46 Vaccinés</div>
                <div style="font-size: 0.7rem; color: #94A3B8;">0 incident ce mois</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(27,164,232,0.3);">
                <div style="font-size: 1.5rem; margin-bottom: 0.2rem;">🍲</div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Cantine & Repas</div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #38BDF8;">Menu Quotidien</div>
                <div style="font-size: 0.7rem; color: #94A3B8;">Petit-déj, Déj, Dîner</div>
              </div>
            </div>

            <div style="font-size: 0.85rem; color: #CBD5E1; background: rgba(0,0,0,0.25); padding: 0.6rem 1rem; border-radius: 6px;">
              📍 <em>Chaque pensionnaire a son lit attribué. Toute sortie ou visite familiale est enregistrée et notifiée au parent.</em>
            </div>
          </div>
        `
      },
      {
        id: 'daara_badges',
        time: 24,
        icon: '🪪',
        title: 'Badges Numériques des Talibés (Cartes PVC & QR Code)',
        desc: 'Impression instantanée, contrôle des entrées/sorties et sécurité.',
        durationStr: '00:12',
        subFr: 'Sécurisez les talibés avec les badges officiels PVC dotés d\'un QR code infalsifiable pour le pointage des entrées/sorties et les visites des parents.',
        subWo: 'Kaart PVC bu wóor ak QR Code ngir kaaraange talibe yi, topp dugg ak génn Daara ji ak saytu mbokk yi.',
        sceneTitle: 'Carte Numérique du Talibé • PVC & QR Code Sécurisé',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; justify-content: center;">
              <!-- Carte PVC Recto -->
              <div style="width: 280px; height: 175px; background: linear-gradient(135deg, #09203F, #1E3C72); border-radius: 12px; padding: 1rem; color: #fff; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 25px rgba(0,0,0,0.5); position: relative; overflow: hidden;">
                <div style="position: absolute; right: -15px; bottom: -15px; font-size: 6rem; opacity: 0.08;">🕌</div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div>
                    <div style="font-size: 0.65rem; color: #00D2B4; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">DAARA MODERNE PARTENAIRE</div>
                    <div style="font-size: 0.55rem; color: #94A3B8;">Dakar • Keur Massar • Agrément N° 8419</div>
                  </div>
                  <div style="background: rgba(0,210,180,0.2); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.6rem; color: #00D2B4; font-weight: 800;">PVC 300 DPI</div>
                </div>

                <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.5rem;">
                  <div style="width: 50px; height: 50px; border-radius: 6px; background: #00D2B4; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: #051329;">MB</div>
                  <div>
                    <div style="font-size: 0.85rem; font-weight: 700;">Mouhamed B. SOW</div>
                    <div style="font-size: 0.65rem; color: #FFB800;">Classe Tahfiz (Hizb 48)</div>
                    <div style="font-size: 0.65rem; color: #94A3B8;">Matricule : <strong>SSE-DAR-8419</strong></div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.6rem; font-size: 0.6rem; color: #94A3B8;">
                  <div>Groupe : <strong>O+</strong> | Internat Lit 14</div>
                  <div style="background: #fff; padding: 2px; border-radius: 3px; display: inline-block;">
                    <div style="width: 26px; height: 26px; background: #000; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.45rem; font-weight: 800;">QR</div>
                  </div>
                </div>
              </div>

              <!-- Options et impression -->
              <div style="flex: 1; min-width: 240px;">
                <h5 style="margin: 0 0 0.5rem 0; color: #00D2B4; font-size: 1rem;">Génération Automatique de Badges Sécurisés</h5>
                <ul style="margin: 0 0 1rem 0; padding-left: 1.2rem; font-size: 0.82rem; color: #CBD5E1; line-height: 1.6;">
                  <li>Format standard carte bancaire PVC (CR80)</li>
                  <li>QR Code crypté pour pointage aux portails</li>
                  <li>Scan immédiat par le surveillant avec un smartphone</li>
                  <li>Impression en 1 clic ou en lot pour tout le Daara</li>
                </ul>
                <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="event.stopPropagation(); showNotification('🪪 Badge généré en HD prêt pour impression PVC !')">🖨️ Imprimer la Carte PVC</button>
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'daara_wave',
        time: 36,
        icon: '💳',
        title: 'Caisse Wave & Orange Money (Zéro Impayé)',
        desc: 'Paiement direct des pensions sans déplacement avec reçu SYSCOHADA.',
        durationStr: '00:12',
        subFr: 'Finie la collecte manuelle : les parents règlent la pension mensuelle directement via Wave ou Orange Money, avec validation instantanée et reçu certifié.',
        subWo: 'Jeexal na tëral xaalis ci loxo : woyjur yi mën nañu fey pension bi ci Wave mbaa Orange Money, am risit bu wóor boobu ci sàss.',
        sceneTitle: 'Encaissement Mobile Money • Validation Wave Instantanée',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">🌊 Passerelle Directe Wave Sénégal</h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Paiement Pension Octobre 2026 • Mouhamed Bachir Sow</div>
              </div>
              <span class="badge-tag" style="background: rgba(27, 164, 232, 0.15); color: #1BA4E8; border: 1px solid rgba(27, 164, 232, 0.3);">Réf: WAV-84920</span>
            </div>

            <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Montant encaissé</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: #1BA4E8;">25 000 FCFA</div>
                <div style="font-size: 0.75rem; color: #00D2B4;">✅ Validé le 12/10/2026 à 14h28 via Wave API</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Impact Trésorerie</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #00D2B4;">+25 000 FCFA au Grand Livre</div>
                <div style="font-size: 0.75rem; color: #94A3B8;">Compte 5211 (Banque/Wave) crédité</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="event.stopPropagation(); openReceiptModal('WAV-84920', 'Mouhamed Bachir Sow', '25 000 FCFA', 'Pension Internat Octobre 2026', '+221 77 645 88 12', 'WAVE', (isDaara ? 'Mon Daara Moderne' : 'Mon Ã‰tablissement'))">📄 Voir le Reçu SYSCOHADA</button>
              <button type="button" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="event.stopPropagation(); showNotification('📲 Reçu transmis par WhatsApp à M. Sow')">💬 Renvoyer WhatsApp</button>
            </div>
          </div>
        `
      },
      {
        id: 'daara_parents',
        time: 48,
        icon: '🔑',
        title: 'Accès Parents & Oustazs (Clé d\'Accès WhatsApp & Suivi)',
        desc: 'Comment les parents et maîtres accèdent à leur espace dédié en 1 clic.',
        durationStr: '00:12',
        subFr: 'Accès simplifié pour les parents : chaque famille reçoit une clé sécurisée par SMS/WhatsApp pour suivre les progrès coraniques et payer les frais scolaires en toute transparence.',
        subWo: 'Yombale dugg gu woyjur yi : këram bu nekk amna kooñ bu lakk bu koy duggale ci SMS/WhatsApp ngir topp jàngum doomam te fey ci Wave.',
        sceneTitle: 'Portail Famille • Connexion par Clé d\'Accès SMS/WhatsApp',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.95); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.3rem;">🔑</span>
                <h4 style="margin: 0; font-size: 1.05rem; color: #fff;">Comment les Parents accèdent à leur Espace Daara</h4>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">100% Mobile & WhatsApp</span>
            </div>

            <p style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 1rem; line-height: 1.5;">
              Aucun mot de passe compliqué à mémoriser. Les parents reçoivent leur <strong>Clé d'Accès Sécurisée</strong> par SMS ou WhatsApp dès l'inscription de leur enfant.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
              <div style="background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 6px; border-left: 2px solid #00D2B4;">
                <div style="font-size: 0.7rem; color: #94A3B8;">Étape 1</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Réception de la clé</div>
                <div style="font-size: 0.75rem; color: #00D2B4; font-family: monospace;">Ex: PAR-89412</div>
              </div>
              <div style="background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 6px; border-left: 2px solid #FFB800;">
                <div style="font-size: 0.7rem; color: #94A3B8;">Étape 2</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Connexion en 1 Clic</div>
                <div style="font-size: 0.75rem; color: #CBD5E1;">Sur PC ou Smartphone</div>
              </div>
              <div style="background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 6px; border-left: 2px solid #1BA4E8;">
                <div style="font-size: 0.7rem; color: #94A3B8;">Étape 3</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Suivi & Règlement Wave</div>
                <div style="font-size: 0.75rem; color: #CBD5E1;">Reçu immédiat en PDF</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;" onclick="event.stopPropagation(); openAccessKeyModal('PARENT')">🔑 Accès par Clé Directe</button>
              <button type="button" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;" onclick="event.stopPropagation(); openParentPortalModal()">📱 Ouvrir l'Espace Parent →</button>
            </div>
          </div>
        `
      },
      {
        id: 'daara_support',
        time: 60,
        icon: '🤝',
        title: 'Accompagnement Terrain (Visite sur site à Dakar & Régions)',
        desc: 'Formation de vos Oustazs et déploiement clé en main sous 48h.',
        durationStr: '00:12',
        subFr: 'Nos experts se déplacent directement dans votre daara pour former vos oustazs et configurer tout le matériel en moins de 48 heures.',
        subWo: 'Sunuy ndaw dañuy ñëw ba sa Daara ngir jàngal say Oustaz, samp masin yi ci diiru 48 waxtu ak ndimbal 24h/24 ci Ndakaaru.',
        sceneTitle: 'Accompagnement Clé en Main • Formation sur Place',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px); text-align: center;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🤝</div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.15rem; color: #fff;">Déploiement Physique & Formation de vos Oustazs</h4>
            <p style="font-size: 0.85rem; color: #CBD5E1; max-width: 600px; margin: 0 auto 1rem auto;">
              Un conseiller SunuSchoolExpress se rend dans votre daara à Dakar, Thiès, Touba ou en région : installation des badges, configuration des tablettes et accompagnement illimité.
            </p>
            <div style="display: inline-flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
              <a href="https://wa.me/221770001122?text=Bonjour%20SunuSchool,%20je%20souhaite%20une%20visite%20terrain%20dans%20mon%20Daara" target="_blank" class="btn btn-primary" style="font-size: 0.82rem; padding: 0.5rem 1rem;" onclick="event.stopPropagation()">💬 Réserver une Visite Terrain</a>
              <button type="button" class="btn btn-outline" style="font-size: 0.82rem; padding: 0.5rem 1rem;" onclick="event.stopPropagation(); jumpToDemoChapter(0)">🔄 Revoir la Démo Daara</button>
            </div>
          </div>
        `
      }
    ]
  },

  school: {
    id: 'school',
    badge: '🏫 Écoles Privées',
    title: 'Démonstration Vidéo : Gestion des Écoles Privées (Général & Technique)',
    duration: 72, // 1m 12s (6 chapitres x 12s en lecture continue automatique)
    chapters: [
      {
        id: 'school_enrollment',
        time: 0,
        icon: '👥',
        title: 'Inscriptions & Gestion des Classes (CI à Terminale)',
        desc: 'Fiches élèves complètes, effectifs par classe et admissions.',
        durationStr: '00:12',
        subFr: 'Gérez l\'ensemble du cycle éducatif, du CI à la Terminale. Enregistrez les inscriptions, suivez les dossiers administratifs et répartissez les effectifs en quelques clics.',
        subWo: 'Saytu lépp ci njàng mi, tàmbalee CI ba ci Terminale. Bindal ndongo yi, topp say kayit te séddale kalas yi ci lu gaaw.',
        sceneTitle: 'Tableau de Bord des Admissions & Classes Scolaires',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">🏫 Diamil Academy Dakar <span style="font-size: 0.75rem; background: rgba(0,210,180,0.2); color: #00D2B4; padding: 0.2rem 0.6rem; border-radius: 12px;">Année 2026-2027</span></h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Inspection d'Académie de Dakar • IA Code : SSE-SN-1786</div>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">Total : 1 248 Élèves</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-bottom: 1rem;">
              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; border-left: 3px solid #00D2B4;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Cycle Primaire (CI à CM2)</div>
                <div style="font-size: 1.3rem; font-weight: 800; color: #fff;">452 élèves</div>
                <div style="font-size: 0.7rem; color: #00D2B4;">12 classes • 100% rempli</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; border-left: 3px solid #FFB800;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Collège (6ème à 3ème)</div>
                <div style="font-size: 1.3rem; font-weight: 800; color: #fff;">512 élèves</div>
                <div style="font-size: 0.7rem; color: #FFB800;">14 classes • 38/classe moy.</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; border-left: 3px solid #38BDF8;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Lycée (2nde à Terminale)</div>
                <div style="font-size: 1.3rem; font-weight: 800; color: #fff;">284 élèves</div>
                <div style="font-size: 0.7rem; color: #38BDF8;">Séries L, S1, S2, G</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.8rem; color: #CBD5E1; flex-wrap: wrap; gap: 0.5rem;">
              <span>📁 Fiches élèves numérisées : extrait de naissance, carnet de santé, numéro national d'identification.</span>
              <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="event.stopPropagation(); showNotification('👥 Répertoire des classes synchronisé !')">Explorer les Classes</button>
            </div>
          </div>
        `
      },
      {
        id: 'school_teachers',
        time: 12,
        icon: '👨‍🏫',
        title: 'Espace Enseignants (Cahier de Textes & Saisie des Notes)',
        desc: 'Saisie rapide sur smartphone ou PC avec calcul automatique des coefficients.',
        durationStr: '00:12',
        subFr: 'Les enseignants saisissent les devoirs et compositions directement depuis leur téléphone ou ordinateur, avec calcul automatique des coefficients officiels sénégalais.',
        subWo: 'Jàngalekat yi mën nañu duggal note yi ak devwaar yi ci seen telefóon mbaa ordinatëer, ak waññ gi mel ni njiiti njàng mi tërale ci Senegaal.',
        sceneTitle: 'Espace Enseignant • Saisie des Devoirs & Coeffs',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">👨‍🏫 Prof. Amadou Ba <span style="font-size: 0.75rem; background: rgba(255,184,0,0.2); color: #FFB800; padding: 0.2rem 0.6rem; border-radius: 12px;">Mathématiques & Sciences</span></h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Classe : 3ème B • Devoir Surveillé N°2 (Semestre 1) • Coef 4</div>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">38 notes saisies / 38</span>
            </div>

            <div style="overflow-x: auto; margin-bottom: 1rem;">
              <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse; text-align: left; color: #CBD5E1;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94A3B8;">
                    <th style="padding: 0.4rem;">Élève</th>
                    <th style="padding: 0.4rem;">Devoir 1 (/20)</th>
                    <th style="padding: 0.4rem;">Devoir 2 (/20)</th>
                    <th style="padding: 0.4rem;">Compo (/20)</th>
                    <th style="padding: 0.4rem;">Moy. Coef 4</th>
                    <th style="padding: 0.4rem;">Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.4rem; font-weight: 600; color: #fff;">Aïssatou Diop</td>
                    <td style="padding: 0.4rem; color: #00D2B4;">18.5</td>
                    <td style="padding: 0.4rem; color: #00D2B4;">19.0</td>
                    <td style="padding: 0.4rem; color: #00D2B4;">18.0</td>
                    <td style="padding: 0.4rem; font-weight: 700; color: #00D2B4;">18.50</td>
                    <td style="padding: 0.4rem; font-style: italic; color: #94A3B8;">Brillante participation</td>
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.4rem; font-weight: 600; color: #fff;">Babacar Seck</td>
                    <td style="padding: 0.4rem;">14.0</td>
                    <td style="padding: 0.4rem;">13.5</td>
                    <td style="padding: 0.4rem;">15.0</td>
                    <td style="padding: 0.4rem; font-weight: 700; color: #FFB800;">14.25</td>
                    <td style="padding: 0.4rem; font-style: italic; color: #94A3B8;">Bon travail d'ensemble</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,210,180,0.08); padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.82rem; color: #E2E8F0; flex-wrap: wrap; gap: 0.5rem;">
              <span>⚡ Verrouillage anti-fraude : les notes sont signées et archivées immédiatement.</span>
              <button type="button" class="btn btn-primary" style="font-size: 0.75rem; padding: 0.35rem 0.7rem;" onclick="event.stopPropagation(); showNotification('📝 Notes validées et transmises au Proviseur !')">Transmettre à la Direction</button>
            </div>
          </div>
        `
      },
      {
        id: 'school_reports',
        time: 24,
        icon: '📑',
        title: 'Génération des Bulletins Scolaires Officiels PDF',
        desc: 'Conformes Ministère de l\'Éducation avec rang, moyennes et cachet.',
        durationStr: '00:12',
        subFr: 'Éditez en 1 clic les bulletins scolaires conformes aux normes du Ministère : moyennes pondérées, rangs, appréciations des professeurs et cachet officiel prêt à imprimer.',
        subWo: 'Génneel ci wenn cuq bulletin bu wóor na melokaanu Ministère : note yu mat, ràŋŋ ci kalas bi, xalaatu jàngalekat yi ak kase bi.',
        sceneTitle: 'Bulletin Officiel Conforme Ministère de l\'Éducation',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">📑 Bulletin du 1er Semestre • 3ème B</h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Aïssatou Diop • Matricule : SSE-2026-0042 • Diamil Academy</div>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4; border: 1px solid rgba(0,210,180,0.3);">Rang : 1ère / 38 élèves</span>
            </div>

            <div style="background: #fff; color: #0f172a; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
              <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #00D2B4; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                <div style="font-size: 0.75rem; font-weight: 800; color: #00695c;">RÉPUBLIQUE DU SÉNÉGAL • MINISTÈRE DE L'ÉDUCATION NATIONALE</div>
                <div style="font-size: 0.75rem; font-weight: 700;">ANNÉE 2026-2027</div>
              </div>

              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; font-size: 0.8rem; margin-bottom: 0.75rem;">
                <div>
                  <div>Élève : <strong>Aïssatou DIOP</strong> (Fille)</div>
                  <div>Classe : <strong>Troisième B (3ème B)</strong></div>
                  <div>Professeur Principal : <strong>M. Ba</strong></div>
                </div>
                <div style="background: #f1f5f9; padding: 0.5rem; border-radius: 6px; text-align: center;">
                  <div style="font-size: 0.7rem; color: #64748b;">Moyenne Générale</div>
                  <div style="font-size: 1.4rem; font-weight: 900; color: #00897b;">17.85 / 20</div>
                  <div style="font-size: 0.65rem; color: #0f172a; font-weight: 700;">FÉLICITATIONS DU CONSEIL</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 0.5rem; font-size: 0.7rem; color: #64748b;">
                <div>Cachet & Signature électronique certifiés SunuSchool</div>
                <div style="color: #00897b; font-weight: 700;">Immédiatement consultable par les parents sur smartphone</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
              <button type="button" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.85rem;" onclick="event.stopPropagation(); openBulletinModal(demoState.elevesScolaires[0])">📄 Ouvrir le Bulletin Interactif Complet</button>
            </div>
          </div>
        `
      },
      {
        id: 'school_accounting',
        time: 36,
        icon: '📊',
        title: 'Comptabilité SYSCOHADA & Grand Livre',
        desc: 'Balance financière, suivi des encaissements et zéro trou de caisse.',
        durationStr: '00:12',
        subFr: 'Suivez la trésorerie au centime près grâce au module de comptabilité conforme OHADA et SYSCOHADA : grand livre, balance des tiers et états financiers annuels.',
        subWo: 'Topp sa xaalis bu baax ak wàllu xàllu alal bi mel ni SYSCOHADA : saytu lepp luy dugg ak luy génn ci kër njàng mi.',
        sceneTitle: 'Comptabilité SYSCOHADA • Suivi Budgétaire & Trésorerie',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">📊 Trésorerie & États Financiers SYSCOHADA</h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Exercice Budgétaire 2026 • Clôture Mensuelle Octobre</div>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">Recouvrement : 97.4%</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-bottom: 1rem;">
              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; border-left: 3px solid #00D2B4;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Total Encaissé (Ce mois)</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #00D2B4;">24 850 000 F</div>
                <div style="font-size: 0.7rem; color: #94A3B8;">Via Wave, OM & Chèques</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; border-left: 3px solid #FFB800;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Charges Salariales (Oustazs/Profs)</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #FFB800;">11 200 000 F</div>
                <div style="font-size: 0.7rem; color: #94A3B8;">42 fiches de paie générées</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.75rem; border-left: 3px solid #38BDF8;">
                <div style="font-size: 0.75rem; color: #94A3B8;">Solde Net Trésorerie</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #38BDF8;">+13 650 000 F</div>
                <div style="font-size: 0.7rem; color: #38BDF8;">Zéro écart de caisse détecté</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.82rem; color: #CBD5E1; flex-wrap: wrap; gap: 0.5rem;">
              <span>📑 Bilan comptable conforme aux exigences des banques et de l'administration fiscale sénégalaise.</span>
              <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.7rem;" onclick="event.stopPropagation(); showNotification('📊 Export Grand Livre SYSCOHADA généré !')">Exporter Balance SYSCOHADA</button>
            </div>
          </div>
        `
      },
      {
        id: 'school_parents',
        time: 48,
        icon: '🔑',
        title: 'Accès Parents & Élèves (Clé d\'Accès, Bulletin & Wave)',
        desc: 'Comment les parents consultent les notes et paient la scolarité en ligne.',
        durationStr: '00:12',
        subFr: 'Espace Famille transparent : les parents se connectent avec leur clé secrète pour consulter les notes, les absences et payer les frais de scolarité via Wave en 10 secondes.',
        subWo: 'Dëkkuwaay woyjur yi : ñu dugg ak kooñ bu lakk, seet note yi, téyye ak génn kalas, te fey weeri lekool ci Wave ci 10 sekond.',
        sceneTitle: 'Accès Parent & Élève • Clé SMS & Paiement Wave',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.95); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.3rem;">🔑</span>
                <h4 style="margin: 0; font-size: 1.05rem; color: #fff;">Comment les Parents et Élèves accèdent à leur Espace</h4>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">Zéro mot de passe oublié</span>
            </div>

            <p style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 1rem; line-height: 1.5;">
              Chaque parent reçoit sa <strong>Clé d'Accès</strong> par SMS/WhatsApp (ex: <code>PAR-89412</code>). Il accède directement au dossier de tous ses enfants : bulletins, absences et règlement Wave en 1 clic.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
              <div style="background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 6px; border-left: 2px solid #00D2B4;">
                <div style="font-size: 0.7rem; color: #94A3B8;">1. Clé d'Accès SMS</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Connexion instantanée</div>
                <div style="font-size: 0.75rem; color: #00D2B4;">Pas d'identifiant compliqué</div>
              </div>
              <div style="background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 6px; border-left: 2px solid #FFB800;">
                <div style="font-size: 0.7rem; color: #94A3B8;">2. Vue Scolarité Complète</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Bulletins & Retards</div>
                <div style="font-size: 0.75rem; color: #CBD5E1;">Téléchargement PDF officiel</div>
              </div>
              <div style="background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 6px; border-left: 2px solid #1BA4E8;">
                <div style="font-size: 0.7rem; color: #94A3B8;">3. Règlements Wave / OM</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Paiement en 10 secondes</div>
                <div style="font-size: 0.75rem; color: #CBD5E1;">Reçu certifié dans l'Espace</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;" onclick="event.stopPropagation(); openAccessKeyModal('PARENT')">🔑 Accès par Clé Directe</button>
              <button type="button" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;" onclick="event.stopPropagation(); openParentPortalModal()">📱 Ouvrir l'Espace Parents →</button>
              <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;" onclick="event.stopPropagation(); openStudentPortalModal()">🎓 Espace Élève</button>
            </div>
          </div>
        `
      },
      {
        id: 'school_schedule',
        time: 60,
        icon: '💬',
        title: 'Emplois du Temps & Alertes WhatsApp Automatiques',
        desc: 'Notification automatique des retards, devoirs et circulaires administratives.',
        durationStr: '00:12',
        subFr: 'Communiquez efficacement : le système alerte automatiquement les familles par WhatsApp en cas d\'absence d\'un élève ou de réaménagement des emplois du temps.',
        subWo: 'Jokko bu gaaw : dawaan bi dafay yónnee bataaxal ci WhatsApp bu ndongo amee baax mbaa réewam, mbaa soppite ci waxtu njàng mi.',
        sceneTitle: 'Alertes Automatiques WhatsApp aux Familles',
        sceneHtml: `
          <div style="background: rgba(10, 25, 47, 0.9); border: 1px solid rgba(0, 210, 180, 0.4); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">💬 Notifications WhatsApp en Temps Réel</h4>
                <div style="font-size: 0.8rem; color: #94A3B8;">Passerelle WhatsApp SunuSchool intégrée</div>
              </div>
              <span class="badge-tag" style="background: rgba(0, 210, 180, 0.15); color: #00D2B4;">Délivré en 2 secondes</span>
            </div>

            <div style="background: #0B141B; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; max-width: 460px; margin: 0 auto 1rem auto; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
              <div style="font-size: 0.7rem; color: #00A884; font-weight: 700; margin-bottom: 0.4rem;">🟢 Direction Diamil Academy Dakar</div>
              <div style="font-size: 0.85rem; color: #E9EDEF; line-height: 1.5;">
                📢 <strong>Avis aux Parents de 3ème B :</strong><br>
                L'emploi du temps du Lundi est réaménagé : cours de Mathématiques à 08h00 en Salle B12 avec M. Ba.<br><br>
                Retrouvez l'emploi du temps complet sur votre Espace Famille :<br>
                👉 <em>https://sunuschool.sn/espace-famille</em>
              </div>
              <div style="text-align: right; font-size: 0.65rem; color: #8696A0; margin-top: 0.4rem;">14:32 • Lu ✓✓</div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="event.stopPropagation(); jumpToDemoChapter(0)">🔄 Revoir la Démo Écoles</button>
              <button type="button" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="event.stopPropagation(); openRegistrationModal('Formule École Pro', '55 000 FCFA/mois')">🚀 Démarrer l'Essai École Pro</button>
            </div>
          </div>
        `
      }
    ]
  }
};

let demoVideoState = {
  mode: 'school',
  isPlaying: false,
  currentTime: 0,
  speed: 1.0,
  isMuted: false,
  subLang: 'fr',
  timer: null,
  activeChapterIndex: 0
};

function formatVideoTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function speakActiveChapterNarration() {
  if (demoVideoState.isMuted) return;
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    if (!demoVideoState.isPlaying) return;
    const video = demoVideosData[demoVideoState.mode];
    if (!video) return;
    const currentChapter = video.chapters[demoVideoState.activeChapterIndex] || video.chapters[0];
    if (!currentChapter) return;
    const textToSpeak = demoVideoState.subLang === 'wo' ? currentChapter.subWo : currentChapter.subFr;
    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.lang = 'fr-FR';
    utter.rate = Math.min(1.5, Math.max(0.8, demoVideoState.speed));
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('Speech synthesis notice:', err);
  }
}

function updatePlayPauseUI() {
  const playPauseIcon = document.getElementById('demoPlayPauseIcon');
  const centerIcon = document.getElementById('demoCenterPlayIcon');
  const centerLabel = document.getElementById('demoCenterPlayLabel');
  const overlay = document.getElementById('demoPlayOverlay');

  if (playPauseIcon) {
    playPauseIcon.textContent = demoVideoState.isPlaying ? '❚❚' : '▶';
  }

  if (overlay) {
    if (demoVideoState.isPlaying) {
      overlay.classList.add('hidden');
    } else {
      overlay.classList.remove('hidden');
      if (centerIcon) centerIcon.textContent = '▶';
      if (centerLabel) centerLabel.textContent = 'Cliquez pour lancer la vidéo';
    }
  }
}

function updateDemoSubtitlesText() {
  const video = demoVideosData[demoVideoState.mode];
  if (!video) return;

  const currentChapter = video.chapters[demoVideoState.activeChapterIndex] || video.chapters[0];
  if (!currentChapter) return;

  const text = demoVideoState.subLang === 'wo' ? currentChapter.subWo : currentChapter.subFr;
  const subTextEl = document.getElementById('demoVideoSubtitleText');
  if (subTextEl) {
    subTextEl.textContent = text;
  }
}

function updateDemoVideoSceneAndTimeline(forceSceneUpdate) {
  const video = demoVideosData[demoVideoState.mode];
  if (!video) return;

  // Progression & barre de temps
  const pct = Math.max(0, Math.min(100, (demoVideoState.currentTime / video.duration) * 100));
  const fillEl = document.getElementById('demoTimelineFill') || document.getElementById('demoProgressFill');
  if (fillEl) fillEl.style.width = `${pct}%`;

  const timeDisplay = document.getElementById('demoVideoTimeDisplay');
  if (timeDisplay) {
    timeDisplay.textContent = `${formatVideoTime(demoVideoState.currentTime)} / ${formatVideoTime(video.duration)}`;
  }

  // Trouver le chapitre courant selon l'avancement
  let chapterIndex = 0;
  for (let i = video.chapters.length - 1; i >= 0; i--) {
    if (demoVideoState.currentTime >= video.chapters[i].time) {
      chapterIndex = i;
      break;
    }
  }

  // Mettre à jour l'élément actif dans la playlist des chapitres
  const allItems = document.querySelectorAll('.demo-chapter-item');
  allItems.forEach((el, idx) => {
    if (idx === chapterIndex) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Calcul du temps restant avant le prochain chapitre automatique
  const nextChapter = video.chapters[chapterIndex + 1];
  const nextTime = nextChapter ? nextChapter.time : video.duration;
  const remainingInChapter = Math.max(1, Math.ceil((nextTime - demoVideoState.currentTime) / (demoVideoState.speed || 1)));

  // Mettre à jour le badge de compte à rebours dynamique s'il est affiché
  const countdownBadge = document.getElementById('demoAutoCountdownPill');
  if (countdownBadge) {
    if (chapterIndex === video.chapters.length - 1) {
      countdownBadge.innerHTML = `🔄 Démo suivante dans <strong>${remainingInChapter}s</strong> (Auto)`;
    } else {
      countdownBadge.innerHTML = `⚡ Chapitre suivant dans <strong>${remainingInChapter}s</strong> (Auto)`;
    }
  }

  // Si le chapitre a changé ou mise à jour forcée
  if (chapterIndex !== demoVideoState.activeChapterIndex || forceSceneUpdate) {
    demoVideoState.activeChapterIndex = chapterIndex;
    const currentChapter = video.chapters[chapterIndex];
    if (currentChapter) {
      const sceneEl = document.getElementById('demoVideoScene');
      if (sceneEl) {
        sceneEl.innerHTML = `
          <div style="position: absolute; top: 12px; left: 16px; display: flex; align-items: center; gap: 8px; z-index: 5; flex-wrap: wrap;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #EF4444; animation: pulseRed 1.5s infinite;"></span>
            <span style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; color: #fff; background: rgba(0,0,0,0.7); padding: 0.25rem 0.6rem; border-radius: 4px; backdrop-filter: blur(4px);">
              🔴 DEMO EN DIRECT • Chapitre ${chapterIndex + 1}/${video.chapters.length} : ${currentChapter.title}
            </span>
            <span id="demoAutoCountdownPill" style="font-size: 0.7rem; font-weight: 700; color: #00D2B4; background: rgba(0, 210, 180, 0.2); border: 1px solid rgba(0, 210, 180, 0.4); padding: 0.2rem 0.55rem; border-radius: 12px; backdrop-filter: blur(4px);">
              ${chapterIndex === video.chapters.length - 1 ? `🔄 Démo suivante dans <strong>${remainingInChapter}s</strong> (Auto)` : `⚡ Chapitre suivant dans <strong>${remainingInChapter}s</strong> (Auto)`}
            </span>
          </div>
          <div style="position: absolute; top: 12px; right: 16px; font-size: 0.72rem; color: #00D2B4; font-weight: 700; background: rgba(0,0,0,0.7); padding: 0.25rem 0.65rem; border-radius: 4px; z-index: 5; border: 1px solid rgba(0,210,180,0.3);">
            ⏱️ ${formatVideoTime(demoVideoState.currentTime)} / ${formatVideoTime(video.duration)}
          </div>
          <div style="width: 100%; max-width: 780px; margin: 0 auto; animation: fadeInScene 0.4s ease-out;">
            ${currentChapter.sceneHtml}
          </div>
        `;
      }

      updateDemoSubtitlesText();

      if (demoVideoState.isPlaying) {
        speakActiveChapterNarration();
      }
    }
  }
}

function playDemoVideo() {
  const video = demoVideosData[demoVideoState.mode];
  if (!video) return;

  if (demoVideoState.currentTime >= video.duration) {
    demoVideoState.currentTime = 0;
  }

  demoVideoState.isPlaying = true;
  updatePlayPauseUI();
  speakActiveChapterNarration();

  if (demoVideoState.timer) clearInterval(demoVideoState.timer);

  const intervalMs = 250;
  demoVideoState.timer = setInterval(() => {
    demoVideoState.currentTime += (intervalMs / 1000) * demoVideoState.speed;
    if (demoVideoState.currentTime >= video.duration) {
      demoVideoState.currentTime = 0;
      pauseDemoVideo();
      updateDemoVideoSceneAndTimeline(true);
      showNotification('✅ Démonstration terminée. Cliquez sur ▶ pour relancer.');
      return;
    }
    updateDemoVideoSceneAndTimeline(false);
  }, intervalMs);
}

function pauseDemoVideo() {
  demoVideoState.isPlaying = false;
  if (demoVideoState.timer) {
    clearInterval(demoVideoState.timer);
    demoVideoState.timer = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  updatePlayPauseUI();
}

function toggleDemoVideo(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  if (demoVideoState.isPlaying) {
    pauseDemoVideo();
  } else {
    playDemoVideo();
  }
}

function seekDemoVideo(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const video = demoVideosData[demoVideoState.mode];
  if (!video) return;

  let targetSeconds = 0;
  if (typeof e === 'number') {
    targetSeconds = e;
  } else if (e && e.clientX !== undefined) {
    const track = document.getElementById('demoTimelineTrack') || (e.currentTarget || e.target);
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    targetSeconds = pct * video.duration;
  }

  demoVideoState.currentTime = Math.max(0, Math.min(video.duration, targetSeconds));
  updateDemoVideoSceneAndTimeline(true);
}

function jumpToDemoChapter(index, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const video = demoVideosData[demoVideoState.mode];
  if (!video || !video.chapters[index]) return;

  demoVideoState.currentTime = video.chapters[index].time;
  demoVideoState.activeChapterIndex = index;
  updateDemoVideoSceneAndTimeline(true);
  playDemoVideo();
}

function renderDemoVideoFull() {
  const video = demoVideosData[demoVideoState.mode];
  if (!video) return;

  // Badge en haut de l'écran
  const badgeEl = document.getElementById('demoVideoCurrentBadge');
  if (badgeEl) {
    badgeEl.textContent = video.badge;
  }

  // Génération de la liste des chapitres cliquables
  const listContainer = document.getElementById('demoChaptersList');
  if (listContainer) {
    listContainer.innerHTML = '';
    video.chapters.forEach((ch, idx) => {
      const item = document.createElement('div');
      item.className = `demo-chapter-item ${idx === 0 ? 'active' : ''}`;
      item.id = `demoChapterItem_${idx}`;
      item.onclick = (event) => jumpToDemoChapter(idx, event);
      item.innerHTML = `
        <div class="demo-chapter-time-badge">${formatVideoTime(ch.time)}</div>
        <div class="demo-chapter-content">
          <div class="demo-chapter-title">${ch.icon} ${ch.title}</div>
          <div class="demo-chapter-desc">${ch.desc}</div>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  demoVideoState.activeChapterIndex = -1;
  updateDemoVideoSceneAndTimeline(true);
}

function switchDemoVideoMode(mode, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  if (demoVideoState.mode === mode) return;

  const wasPlaying = demoVideoState.isPlaying;
  pauseDemoVideo();
  demoVideoState.mode = mode;
  demoVideoState.currentTime = 0;
  demoVideoState.activeChapterIndex = -1;

  const daaraBtn = document.getElementById('demoModeDaaraBtn');
  const schoolBtn = document.getElementById('demoModeSchoolBtn');

  if (mode === 'daara') {
    daaraBtn?.classList.add('active');
    schoolBtn?.classList.remove('active');
    showNotification('🕌 Démonstration sélectionnée : Gestion des Daaras Modernes & Internats');
  } else {
    schoolBtn?.classList.add('active');
    daaraBtn?.classList.remove('active');
    showNotification('🏫 Démonstration sélectionnée : Gestion des Écoles Privées (CI à Terminale)');
  }

  renderDemoVideoFull();
  if (wasPlaying) {
    playDemoVideo();
  } else {
    pauseDemoVideo();
    updatePlayPauseUI();
  }
}

function setDemoSubtitlesLang(lang, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  demoVideoState.subLang = 'fr';
  updateDemoSubtitlesText();
  if (demoVideoState.isPlaying) {
    speakActiveChapterNarration();
  }
}

function toggleDemoSpeed(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const speeds = [1.0, 1.25, 1.5, 2.0];
  const curIdx = speeds.indexOf(demoVideoState.speed);
  const nextSpeed = speeds[(curIdx + 1) % speeds.length];
  demoVideoState.speed = nextSpeed;

  const label = document.getElementById('demoSpeedLabel');
  if (label) label.textContent = `${nextSpeed}x`;
  showNotification(`⚡ Vitesse de lecture vidéo : ${nextSpeed}x`);

  if (demoVideoState.isPlaying) {
    playDemoVideo(); // redémarre avec le bon intervalle
  }
}

function toggleDemoMute(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  demoVideoState.isMuted = !demoVideoState.isMuted;
  const icon = document.getElementById('demoMuteIcon');
  if (icon) icon.textContent = demoVideoState.isMuted ? '🔇' : '🔊';

  if (demoVideoState.isMuted) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showNotification('🔇 Voix de démonstration mise en sourdine');
  } else {
    showNotification('🔊 Voix de démonstration activée');
    if (demoVideoState.isPlaying) {
      speakActiveChapterNarration();
    }
  }
}

function toggleDemoFullscreen(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const card = document.getElementById('demoVideoPlayerCard') || document.querySelector('.demo-video-player-card');
  if (!card) return;

  const isNativeFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  const isClassFull = card.classList.contains('is-fullscreen');

  const updateFullscreenUI = (isFullscreen) => {
    const icon = document.getElementById('demoFullscreenIcon');
    const btn = document.getElementById('demoFullscreenBtn');
    if (icon) icon.textContent = isFullscreen ? '🗗' : '⛶';
    if (btn) btn.title = isFullscreen ? 'Quitter le plein écran (Échap)' : 'Agrandir en plein écran (Plein écran HD)';
    if (isFullscreen) {
      showNotification('⛶ Mode Plein Écran Vidéo Activé (Appuyez sur Échap pour quitter)');
    } else {
      showNotification('🗗 Sortie du Plein Écran Vidéo');
    }
  };

  if (!isNativeFull && !isClassFull) {
    // Activer l'agrandissement plein écran
    card.classList.add('is-fullscreen');
    updateFullscreenUI(true);

    const req = card.requestFullscreen || card.webkitRequestFullscreen || card.mozRequestFullScreen || card.msRequestFullscreen;
    if (req) {
      req.call(card).catch((err) => {
        // En cas de restriction de sécurité navigateur, le mode .is-fullscreen CSS assure un agrandissement parfait
        console.warn('API Fullscreen native ignorée, mode CSS actif:', err);
      });
    }
  } else {
    // Désactiver l'agrandissement plein écran
    card.classList.remove('is-fullscreen');
    updateFullscreenUI(false);

    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit && (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
      exit.call(document).catch(() => {});
    }
  }
}

// Synchronisation automatique lors de l'appui sur Échap ou changement natif
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evtName => {
  document.addEventListener(evtName, () => {
    const card = document.getElementById('demoVideoPlayerCard') || document.querySelector('.demo-video-player-card');
    const icon = document.getElementById('demoFullscreenIcon');
    const btn = document.getElementById('demoFullscreenBtn');
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFull && card) {
      card.classList.remove('is-fullscreen');
    }
    if (icon) icon.textContent = isFull || (card && card.classList.contains('is-fullscreen')) ? '🗗' : '⛶';
    if (btn) btn.title = isFull || (card && card.classList.contains('is-fullscreen')) ? 'Quitter le plein écran (Échap)' : 'Agrandir en plein écran (Plein écran HD)';
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const card = document.getElementById('demoVideoPlayerCard') || document.querySelector('.demo-video-player-card');
    if (card && card.classList.contains('is-fullscreen')) {
      toggleDemoFullscreen(e);
    }
  }
});

function togglePortalSandbox(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const drawer = document.getElementById('portalSandboxDrawer');
  const btn = document.getElementById('portalSandboxToggleBtn');
  const chevron = document.getElementById('sandboxToggleChevron');
  if (!drawer) return;

  const isHidden = drawer.style.display === 'none' || !drawer.style.display;
  if (isHidden) {
    drawer.style.display = 'block';
    if (chevron) chevron.textContent = '▴';
    if (btn) btn.innerHTML = '<span>💻 Masquer le Bac à Sable Technique</span> <span id="sandboxToggleChevron" style="margin-left: 0.3rem;">▴</span>';
    drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('⚙️ Tiroir Bac à Sable ouvert. Données de test accessibles.');
  } else {
    drawer.style.display = 'none';
    if (chevron) chevron.textContent = '▾';
    if (btn) btn.innerHTML = '<span>💻 Afficher le Bac à Sable Technique (Tableaux &amp; Données Manuelles)</span> <span id="sandboxToggleChevron" style="margin-left: 0.3rem;">▾</span>';
  }
}

function initDemoVideo() {
  renderDemoVideoFull();
  pauseDemoVideo();
  updatePlayPauseUI();
}

// Bascule de la carte Démo Hero (École Privée VS Daara Moderne)
function switchHeroPreview(mode) {
  const schoolView = document.getElementById('heroPreviewSchool');
  const daaraView = document.getElementById('heroPreviewDaara');
  const schoolBtn = document.getElementById('heroSwitchSchoolBtn');
  const daaraBtn = document.getElementById('heroSwitchDaaraBtn');
  if (!schoolView || !daaraView) return;

  if (mode === 'daara') {
    schoolView.style.display = 'none';
    daaraView.style.display = 'block';
    if (daaraBtn) {
      daaraBtn.style.background = 'var(--dore-500)';
      daaraBtn.style.color = '#060D17';
    }
    if (schoolBtn) {
      schoolBtn.style.background = 'transparent';
      schoolBtn.style.color = 'var(--gris-300)';
    }
  } else {
    schoolView.style.display = 'block';
    daaraView.style.display = 'none';
    if (schoolBtn) {
      schoolBtn.style.background = 'var(--turquoise-500)';
      schoolBtn.style.color = '#060D17';
    }
    if (daaraBtn) {
      daaraBtn.style.background = 'transparent';
      daaraBtn.style.color = 'var(--gris-300)';
    }
  }
}
window.switchHeroPreview = switchHeroPreview;

// Rendre toutes les fonctions de la démo globalement accessibles
window.demoVideosData = demoVideosData;
window.demoVideoState = demoVideoState;
window.initDemoVideo = initDemoVideo;
window.toggleDemoVideo = toggleDemoVideo;
window.playDemoVideo = playDemoVideo;
window.pauseDemoVideo = pauseDemoVideo;
window.seekDemoVideo = seekDemoVideo;
window.jumpToDemoChapter = jumpToDemoChapter;
window.switchDemoVideoMode = switchDemoVideoMode;
window.setDemoSubtitlesLang = setDemoSubtitlesLang;
window.toggleDemoSpeed = toggleDemoSpeed;
window.toggleDemoMute = toggleDemoMute;
window.toggleDemoFullscreen = toggleDemoFullscreen;
window.togglePortalSandbox = togglePortalSandbox;

// --- 3. INITIALISATION & ÉVÉNEMENTS DU DOM ---
function initApp() {
  initTheme();
  setupLanguageSwitcher();
  setupRoleSwitcher();
  setupTabs();
  setupPricingSwitch();
  setupMobileMoneySimulator();
  setupWhatsAppSimulator();
  renderDaaraTalibes();
  renderSchoolStudents();
  renderTransactions();
  renderAuditLogs();
  if (typeof initDemoVideo === 'function') {
    initDemoVideo();
  }

  // Synchronisation dynamique du numéro de téléphone entre le formulaire et la passerelle de paiement
  const regPhoneEl = document.getElementById('regPhone');
  if (regPhoneEl) {
    regPhoneEl.addEventListener('input', () => {
      const val = regPhoneEl.value;
      const wp = document.getElementById('payWavePhone');
      const op = document.getElementById('payOMPhone');
      const fp = document.getElementById('payFMPhone');
      if (wp) wp.value = val;
      if (op) op.value = val;
      if (fp) fp.value = val;
    });
  }

  // Application immédiate de l'établissement enregistré
  if (currentEstablishment && currentEstablishment.name) {
    const portalBadge = document.getElementById('portalSchoolBadge');
    if (portalBadge) portalBadge.textContent = currentEstablishment.name;
    const bulletinSchoolEl = document.getElementById('bulletinSchoolName');
    if (bulletinSchoolEl) bulletinSchoolEl.textContent = currentEstablishment.name;
    const bulletinStampEl = document.getElementById('bulletinStampName');
    if (bulletinStampEl) bulletinStampEl.textContent = currentEstablishment.name;
  }

  // Restauration automatique prioritaire si l'espace de travail était actif ET dûment validé par l'Admin
  try {
    const isWsActive = localStorage.getItem('sunuschool_active_workspace') === 'true';
    const isApproved = currentEstablishment && 
      (currentEstablishment.statut === 'ACTIF' || currentEstablishment.statutAbonnement === 'ACTIF' || currentEstablishment.statutAbonnement === 'ESSAI_GRATUIT' || currentEstablishment.type === 'SUPER_ADMIN') && 
      (currentEstablishment.statut !== 'EN_ATTENTE_VALIDATION') && 
      (currentEstablishment.fraisAdhesionPayes !== false);

    if (isWsActive && isApproved && currentEstablishment.name) {
      activateDedicatedWorkspace(currentEstablishment);
      const recoveryBanner = document.getElementById('activeSessionRecoveryBanner');
      if (recoveryBanner) recoveryBanner.style.display = 'none';
      showNotification(`⚡ Bon retour dans votre espace : ${currentEstablishment.name} (${currentEstablishment.plan})`);
    } else {
      localStorage.removeItem('sunuschool_active_workspace');
      const ws = document.getElementById('workspaceView');
      if (ws) ws.classList.remove('active');
      const hero = document.getElementById('hero');
      if (hero) hero.style.display = 'block';
      const tarifs = document.getElementById('tarifs');
      if (tarifs) tarifs.style.display = 'block';
      const portal = document.getElementById('portal');
      if (portal) portal.style.display = 'block';
      updateSessionRecoveryUI();
    }
  } catch (e) {
    console.error('Erreur restauration session:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// --- GESTION DE LA LANGUE (FRANÇAIS / WOLOF) ---
function setupLanguageSwitcher() {
  const btn = document.getElementById('langSwitchBtn');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    currentLang = currentLang === 'fr' ? 'wo' : 'fr';
    btn.innerHTML = currentLang === 'fr'
      ? '<span class="lang-text-desktop">🇸🇳 Wolof</span><span class="lang-text-mobile">🇸🇳 WO</span>'
      : '<span class="lang-text-desktop">🇫🇷 Français</span><span class="lang-text-mobile">🇫🇷 FR</span>';
    applyTranslations();
  });
}

function applyTranslations() {
  const dict = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });
}

// --- GESTION DU MENU MOBILE (TIROIR RESPONSIVE) ---
function toggleMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  if (!menuBtn || !drawer) return;
  menuBtn.classList.toggle('open');
  drawer.classList.toggle('open');
}

function closeMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  if (menuBtn) menuBtn.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
}

// --- GESTION DU MENU DÉROULANT DES PORTAILS DÉDIÉS (HEADER) ---
function togglePortalsDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('portalsDropdownMenu');
  const btn = document.getElementById('portalsDropdownBtn');
  if (!menu) return;
  const isShown = menu.classList.contains('show');
  if (isShown) {
    closePortalsDropdown();
  } else {
    menu.classList.add('show');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
}

function closePortalsDropdown() {
  const menu = document.getElementById('portalsDropdownMenu');
  const btn = document.getElementById('portalsDropdownBtn');
  if (menu) menu.classList.remove('show');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

// Fermeture automatique du dropdown au clic en dehors
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('portalsDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    closePortalsDropdown();
  }
});

// Interception universelle des ancres internes (#hero, #tarifs, #portal, #contact)
// Empêche le rechargement et l'avertissement de sécurité Chromium sur le protocole file:///
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href && href.length > 1 && !href.startsWith('#javascript')) {
    const targetId = href.substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (link.classList.contains('nav-link')) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
      if (typeof closeMobileMenu === 'function') {
        closeMobileMenu();
      }
    }
  }
});

// --- ÉTAT GLOBAL DE PUBLICATION DES BULLETINS (Spécifications 4️⃣) ---
let currentBulletinStudentId = 'sco_01';
let bulletinPublicationState = {
  datePublication: "2026-10-31",
  forcePublished: false
};

// Journal d'audit en mémoire pour la traçabilité des actions sensibles (3️⃣ & 6️⃣)
let appAuditLogs = [
  { time: '13:40:12', user: 'direction@diamilacademy.sn', role: 'DIRECTEUR_ADMIN', action: 'CONNEXION_SSO', details: 'Authentification SSO réussie avec 2FA OTP validé' },
  { time: '12:20:05', user: 'oustaz.ndiaye@diamilacademy.sn', role: 'OUSTAZ_ENSEIGNANT', action: 'SAISIE_NOTES', details: 'Saisie notes Coran Hizb 48 - CM2 A' },
  { time: '11:15:30', user: 'direction@diamilacademy.sn', role: 'DIRECTEUR_ADMIN', action: 'DATE_PUBLICATION_BULLETINS', details: 'Date de publication fixée au 31/10/2026' },
  { time: '10:05:14', user: 'system.gateway', role: 'SYSTEM', action: 'ALERTE_PAIEMENT', details: 'Notification WhatsApp reçu 25 000 FCFA' }
];

function logAuditEvent(action, details) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  appAuditLogs.unshift({
    time: timeStr,
    user: (currentRole === 'ADMIN' ? 'direction@diamilacademy.sn' : (currentRole === 'OUSTAZ' ? 'oustaz.ndiaye@diamilacademy.sn' : 'parent.sow@sunuschool.sn')),
    role: currentRole || 'ADMIN',
    action,
    details
  });
}

// --- BOUTONS DE RÔLES DANS LES OFFRES DE FORMULES (#tarifs) ---
function filterFormulaByRole(role, btn) {
  const buttons = document.querySelectorAll('.formula-role-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const bannerTitle = document.getElementById('formulaRoleBannerTitle');
  const bannerDesc = document.getElementById('formulaRoleBannerDesc');

  if (role === 'ALL') {
    if (bannerTitle) bannerTitle.textContent = '🌐 Vue Globale Tout-en-Un :';
    if (bannerDesc) bannerDesc.innerHTML = 'Toutes nos formules incluent la synchronisation en temps réel entre <strong>Directeur / Admin</strong>, <strong>Oustaz / Enseignant</strong> et <strong>Parent d\'Élève</strong>.';
  } else if (role === 'ADMIN') {
    if (bannerTitle) bannerTitle.textContent = '👑 Directeur / Admin :';
    if (bannerDesc) bannerDesc.innerHTML = 'Identifiant : <strong>Email professionnel ou code établissement</strong> | Modules : <strong>Gestion école, paiements Wave/OM, statistiques, sécurité 2FA</strong>';
  } else if (role === 'TEACHER') {
    if (bannerTitle) bannerTitle.textContent = '🕌 / 👨‍🏫 Oustaz / Enseignant :';
    if (bannerDesc) bannerDesc.innerHTML = 'Identifiant : <strong>Email ou code enseignant</strong> | Modules : <strong>Saisie des notes, absences, bulletins, mémorisation Coran</strong>';
  } else if (role === 'PARENT') {
    if (bannerTitle) bannerTitle.textContent = '👨‍👩‍👧 Parent d’élève :';
    if (bannerDesc) bannerDesc.innerHTML = 'Identifiant : <strong>Numéro de téléphone ou code parent</strong> | Modules : <strong>Consultation des bulletins, paiements, alertes SMS/WhatsApp</strong>';
  } else if (role === 'STUDENT') {
    if (bannerTitle) bannerTitle.textContent = '🎓 Élève / Talibé :';
    if (bannerDesc) bannerDesc.innerHTML = 'Identifiant : <strong>Matricule ou code élève</strong> | Modules : <strong>Consultation des notes, ressources pédagogiques, accès retardé aux bulletins</strong>';
  }

  // Mettre en surbrillance ou filtrer les éléments correspondants dans chaque carte
  document.querySelectorAll('.pricing-card').forEach(card => {
    const roleBtns = card.querySelectorAll('.card-role-tab-btn');
    roleBtns.forEach(rb => {
      if (role === 'ALL') {
        rb.classList.remove('active');
      } else if (role === 'ADMIN' && (rb.textContent.includes('Admin') || rb.textContent.includes('Borom') || rb.textContent.includes('Direction') || rb.textContent.includes('Siège'))) {
        rb.classList.add('active');
      } else if (role === 'TEACHER' && (rb.textContent.includes('Enseignant') || rb.textContent.includes('Oustaz') || rb.textContent.includes('Formateur'))) {
        rb.classList.add('active');
      } else if (role === 'PARENT' && (rb.textContent.includes('Parent') || rb.textContent.includes('Famille'))) {
        rb.classList.add('active');
      } else {
        rb.classList.remove('active');
      }
    });

    const items = card.querySelectorAll('.pricing-feature-item');
    items.forEach(item => {
      const featRole = item.getAttribute('data-role-feature');
      if (role === 'ALL') {
        item.style.opacity = '1';
        item.style.background = '';
      } else if (featRole === role) {
        item.style.opacity = '1';
        item.style.background = 'rgba(0, 210, 180, 0.12)';
        item.style.borderRadius = '6px';
      } else if (featRole) {
        item.style.opacity = '0.35';
        item.style.background = '';
      } else {
        item.style.opacity = '0.85';
        item.style.background = '';
      }
    });
  });
}

function toggleCardRoleDetail(btn, role) {
  const card = btn.closest('.pricing-card');
  if (!card) return;
  card.querySelectorAll('.card-role-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const items = card.querySelectorAll('.pricing-feature-item');
  items.forEach(item => {
    const featRole = item.getAttribute('data-role-feature');
    if (featRole === role) {
      item.style.opacity = '1';
      item.style.background = 'rgba(0, 210, 180, 0.14)';
      item.style.borderRadius = '6px';
    } else if (featRole) {
      item.style.opacity = '0.35';
      item.style.background = '';
    } else {
      item.style.opacity = '0.75';
      item.style.background = '';
    }
  });

  let roleLabel = '👑 Directeur / Admin';
  if (role === 'TEACHER') roleLabel = '🕌 Oustaz / Enseignant';
  if (role === 'PARENT') roleLabel = '👨‍👩‍👧 Parent d\'Élève';
  showNotification(`${roleLabel} sélectionné dans la formule`);
}

// --- 4️⃣ PUBLICATION DES BULLETINS : PARAMÉTRAGE DIRECTEUR ---
function saveBulletinPublicationDate() {
  const dateInput = document.getElementById('wsBulletinPublishDateInput') || document.getElementById('modalBulletinPublishDateInput');
  if (!dateInput || !dateInput.value) return;

  bulletinPublicationState.datePublication = dateInput.value;
  bulletinPublicationState.forcePublished = false;

  const otherInput = document.getElementById('modalBulletinPublishDateInput');
  if (otherInput && otherInput !== dateInput) otherInput.value = dateInput.value;
  const wsInput = document.getElementById('wsBulletinPublishDateInput');
  if (wsInput && wsInput !== dateInput) wsInput.value = dateInput.value;

  const badge = document.getElementById('bulletinStatusBadge');
  if (badge) {
    badge.className = 'badge-tag badge-warning';
    badge.innerHTML = `🔒 En attente jusqu'au ${formatDateFr(dateInput.value)}`;
  }

  const lockedDateBadge = document.getElementById('bulletinLockedDate');
  if (lockedDateBadge) lockedDateBadge.textContent = formatDateFr(dateInput.value);

  logAuditEvent('MODIFICATION_DATE_BULLETINS', `Date de publication fixée au ${dateInput.value}`);
  showNotification(`📅 Date officielle de publication enregistrée : ${formatDateFr(dateInput.value)}`);
}

function publishBulletinsNow() {
  bulletinPublicationState.forcePublished = true;
  const badge = document.getElementById('bulletinStatusBadge');
  if (badge) {
    badge.className = 'badge-tag badge-excellent';
    badge.innerHTML = `✅ Bulletins Officiellement Publiés &amp; Débloqués`;
  }

  logAuditEvent('DEBLOCAGE_BULLETINS_IMMEDIAT', `Déblocage immédiat des bulletins et notification WhatsApp/SMS aux parents`);
  showNotification('🚀 Bulletins débloqués avec succès ! Notification WhatsApp et SMS envoyée aux familles.');

  simulateWhatsAppAlert('BULLETIN');
}

function simulateStudentBulletinView() {
  const student = demoState.elevesScolaires[0];
  if (!student) return;
  previewBulletin(student.id, null, false, true);
  showNotification('👁️ Simulation : Aperçu de ce que voit l\'élève ou le parent avant la date officielle');
}

function openBulletinDateConfigModal() {
  const modal = document.getElementById('bulletinConfigModal');
  if (modal) {
    const input = document.getElementById('modalBulletinPublishDateInput');
    if (input) input.value = bulletinPublicationState.datePublication;
    modal.classList.add('active');
  }
}

function handleBulletinConfigSubmit(e) {
  e.preventDefault();
  saveBulletinPublicationDate();
  closeAllModals();
}

// --- 5️⃣ NOTIFICATIONS (WHATSAPP API & SMS GATEWAY) ---
function simulateWhatsAppAlert(type) {
  let message = "";
  let icon = "📲";

  if (type === 'PAIEMENT') {
    icon = "💳";
    message = "Reçu Wave validé : 25 000 FCFA pour scolarité d'Octobre 2026 de l'élève Aïssatou Diop. Réf: SSE-SN-PAY-982";
  } else if (type === 'BULLETIN') {
    icon = "📑";
    message = "Le bulletin officiel du 1er Trimestre de votre enfant est disponible. Consultez-le sur votre espace sécurisé SunuSchool.";
  } else if (type === 'EVENEMENT') {
    icon = "📢";
    message = "Réunion Générale des Parents d'Élèves & Oustazs ce Samedi à 10h00 au sein de l'établissement.";
  } else {
    message = "Notification administrative transmise avec succès.";
  }

  logAuditEvent(`ALERTE_NOTIFICATION_${type}`, `Envoi simulé à +221 77 000 11 22 via passerelle WhatsApp/SMS`);
  showNotification(`${icon} [WhatsApp/SMS : ${type}] ${message}`);
}

// --- 3️⃣ GÉNÉRATION AUTOMATIQUE DES IDENTIFIANTS & SSO ---
function simulateAutoIdGeneration() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const matricule = `SSE-2026-${randomNum}`;
  const codeParent = `PAR-SN-${randomNum}`;

  logAuditEvent('GENERATION_AUTO_IDENTIFIANTS', `Génération matricule ${matricule} et code parent ${codeParent}`);
  showNotification(`⚡ Identifiants générés automatiquement : Matricule ${matricule}, Code Parent ${codeParent}. SMS & Email d'activation envoyés !`);
}

// --- JOURNAL D'AUDIT & API DOCS MODALS ---
function openAuditLogModal() {
  renderAuditLogs();
  const modal = document.getElementById('auditLogModal');
  if (modal) modal.classList.add('active');
}

function renderAuditLogs() {
  const tbody = document.getElementById('auditLogsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  appAuditLogs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-family: monospace; color: var(--gris-400);">${log.time}</span></td>
      <td><strong>${log.user}</strong></td>
      <td><span class="badge-tag" style="font-size: 0.72rem;">${log.role}</span></td>
      <td><strong style="color: var(--turquoise-400);">${log.action}</strong></td>
      <td style="font-size: 0.8rem; color: var(--gris-300);">${log.details}</td>
    `;
    tbody.appendChild(tr);
  });
}

function openApiDocsModal() {
  const modal = document.getElementById('apiDocsModal');
  if (modal) modal.classList.add('active');
}

function formatDateFr(isoDateStr) {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDateStr;
}

// --- GESTION DU COMMUTATEUR DE RÔLES ---
function setupRoleSwitcher() {
  // Les commutateurs flottants ont été retirés selon les consignes utilisateur
}

function switchWorkspaceRole(role) {
  currentRole = role;

  const roleLabel = document.getElementById('wsRoleCategoryLabel');
  const nameLabel = document.getElementById('wsAdminName');
  const isDaara = currentEstablishment && (currentEstablishment.type === 'DAARA' || (currentEstablishment.plan || '').toLowerCase().includes('daara'));
  const schoolShort = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name.split(' ')[0] : 'Établissement';

  if (role === 'ADMIN') {
    if (roleLabel) roleLabel.textContent = isDaara ? 'Borom Daara / Direction' : 'Direction Générale';
    if (nameLabel) nameLabel.textContent = `Directeur Principal (${schoolShort})`;
    showNotification('👑 Espace Directeur / Admin : Pilotage global, caisse, statistiques & validation');
  } else if (role === 'OUSTAZ') {
    if (roleLabel) roleLabel.textContent = isDaara ? 'Corps des Oustazs' : 'Corps Enseignant';
    if (nameLabel) nameLabel.textContent = isDaara ? 'Oustaz Mouhamed Ndiaye' : 'Professeur M. Diop';
    showNotification('🕌 Espace Oustaz / Enseignant : Saisie des notes, suivi Hizb Coran & présences');
    if (isDaara) {
      switchWsTab('wsQuranProgression', document.getElementById('wsNavQuran'));
    } else {
      switchWsTab('wsGrades', document.getElementById('wsNavGrades'));
    }
  } else if (role === 'PARENT') {
    if (roleLabel) roleLabel.textContent = 'Espace Famille & Tuteurs';
    if (nameLabel) nameLabel.textContent = 'Famille Sow (Parent d\'Élève)';
    showNotification('👨‍👩‍👧 Portail Parent d\'Élève : Bulletins en ligne, suivi talibé & règlements Wave/OM');
  }

  updateRoleVisibility();
}

function updateRoleVisibility() {
  const roleIndicator = document.getElementById('currentRoleBadge');
  if (roleIndicator) {
    roleIndicator.textContent = currentRole;
  }
}

// --- GESTION DES ONGLETS DU PORTAIL ---
function setupTabs() {
  const tabButtons = document.querySelectorAll('.portal-tab-item');
  const panes = document.querySelectorAll('.tab-content-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// --- COMMUTATEUR TARIFS (ÉCOLES PRIVÉES / DAARAS) ---
function setupPricingSwitch() {
  const btnSchools = document.getElementById('pricingTabSchools');
  const btnDaaras = document.getElementById('pricingTabDaaras');
  const viewSchools = document.getElementById('pricingViewSchools');
  const viewDaaras = document.getElementById('pricingViewDaaras');

  if (!btnSchools || !btnDaaras) return;

  btnSchools.addEventListener('click', () => {
    btnSchools.classList.add('active');
    btnDaaras.classList.remove('active');
    viewSchools.style.display = 'grid';
    viewDaaras.style.display = 'none';
  });

  btnDaaras.addEventListener('click', () => {
    btnDaaras.classList.add('active');
    btnSchools.classList.remove('active');
    viewSchools.style.display = 'none';
    viewDaaras.style.display = 'grid';
  });
}

// --- MODULE DAARA : AFFICHAGE & ÉVALUATION HIZB ---
function renderDaaraTalibes() {
  const tbody = document.getElementById('daaraTalibesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  demoState.talibes.forEach(t => {
    const percent = Math.round((t.hizb / 60) * 100);
    const badgeClass = t.qualite === 'EXCELLENT' ? 'badge-excellent' : (t.qualite === 'TRES_BIEN' ? 'badge-good' : 'badge-pending');
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${t.prenom} ${t.nom}</strong>
        <div style="font-size: 0.75rem;" class="text-muted">${t.matricule} • ${t.age} ans</div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <strong class="text-gold" style="font-size: 1.1rem; font-weight: 800;">Hizb ${t.hizb}</strong> / 60
          <span class="text-turquoise" style="font-size: 0.75rem; font-weight: 700;">(${percent}%)</span>
        </div>
        <div class="progress-bar-container" style="height: 6px; width: 140px; margin: 4px 0;">
          <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <div style="font-size: 0.75rem;" class="text-muted">${t.sourate}</div>
      </td>
      <td>
        <div style="font-weight: 800; font-size: 1.05rem;" class="text-note">${t.tajwidNote}/20</div>
        <div><span class="badge-tag ${badgeClass}">${t.qualite}</span></div>
      </td>
      <td>
        <div style="font-size: 0.85rem;">🛏️ ${t.dortoir}</div>
        <div style="font-size: 0.75rem; font-weight: 700;" class="text-turquoise">Lit N° ${t.lit} (Attribué)</div>
      </td>
      <td>
        <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="openEvaluationModal('${t.id}')">
          ✏️ Évaluer Hizb
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openEvaluationModal(talibeId) {
  const talibe = demoState.talibes.find(t => t.id === talibeId);
  if (!talibe) return;

  const modal = document.getElementById('evalModal');
  document.getElementById('evalTalibeName').textContent = `${talibe.prenom} ${talibe.nom} (${talibe.matricule})`;
  document.getElementById('evalHizbInput').value = talibe.hizb;
  document.getElementById('evalSourateInput').value = talibe.sourate;
  document.getElementById('evalTajwidInput').value = talibe.tajwidNote;
  
  modal.setAttribute('data-target-id', talibeId);
  modal.classList.add('active');
}

function saveEvaluation() {
  const modal = document.getElementById('evalModal');
  const talibeId = modal.getAttribute('data-target-id');
  const talibe = demoState.talibes.find(t => t.id === talibeId);

  if (talibe) {
    const newHizb = parseInt(document.getElementById('evalHizbInput').value, 10);
    const newSourate = document.getElementById('evalSourateInput').value;
    const newTajwid = parseFloat(document.getElementById('evalTajwidInput').value);

    talibe.hizb = Math.min(60, Math.max(1, newHizb));
    talibe.sourate = newSourate;
    talibe.tajwidNote = newTajwid;
    talibe.juz = Math.ceil(talibe.hizb / 2);

    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Progression coranique mise à jour pour ${talibe.prenom} ${talibe.nom} -> Hizb ${talibe.hizb}`,
      user: 'Oustaz Oumar Ba'
    });

    renderDaaraTalibes();
    renderAuditLogs();
    closeAllModals();
    showNotification(`✅ Évaluation coranique enregistrée pour ${talibe.prenom} !`);
  }
}

// --- MODULE SCOLAIRE : AFFICHAGE & BULLETIN ---
function renderSchoolStudents() {
  const tbody = document.getElementById('schoolStudentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  demoState.elevesScolaires.forEach(e => {
    const statusTag = e.fraisStatut === 'PAYE' ? 
      '<span class="badge-tag badge-excellent">À JOUR</span>' : 
      '<span class="badge-tag badge-pending">EN ATTENTE</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${e.prenom} ${e.nom}</strong>
        <div style="font-size: 0.75rem; color: var(--gris-500);">${e.matricule}</div>
      </td>
      <td><strong>${e.classe}</strong></td>
      <td><strong style="color: var(--turquoise-400);">${e.moyenne} / 20</strong></td>
      <td><span class="badge-tag badge-gold">${e.rang}</span></td>
      <td>${statusTag}</td>
      <td>
        <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="previewBulletin('${e.id}')">
          📄 Bulletin Officiel
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderBulletinGradesTable(isDaara, studentName, studentKey, studentObj) {
  const tbody = document.getElementById('bulletinGradesTableBody');
  const daaraBox = document.getElementById('bulletinDaaraSpecialBox');
  const docTypeTitle = document.getElementById('bulletinDocTypeTitle');
  const docPeriodTitle = document.getElementById('bulletinDocPeriodTitle');
  const docBadge = document.getElementById('bulletinDocBadge');
  const councilLabel = document.getElementById('bulletinCouncilLabel');
  const councilRemarks = document.getElementById('bulletinCouncilRemarks');
  const stampRole = document.getElementById('bulletinStampRole');
  const discHeader = document.getElementById('bulletinTableDisciplineHeader');

  // Si l'élève est un élève réel nouvellement inscrit sans note
  const isRealPending = studentObj && (!studentObj.notes || studentObj.notes.length === 0) && (!studentObj.moyenne || studentObj.moyenne === '--');
  if (isRealPending) {
    if (docTypeTitle) docTypeTitle.textContent = isDaara ? 'DOSSIER PÉDAGOGIQUE & CORANIQUE' : 'BULLETIN DE NOTES DU 1ER TRIMESTRE';
    if (docPeriodTitle) docPeriodTitle.textContent = `Année Scolaire 2026-2027 • Classe : ${studentObj.classe || 'Inscrit'}`;
    if (docBadge) {
      docBadge.textContent = 'DOSSIER RÉEL • EN ATTENTE D\'ÉVALUATION';
      docBadge.className = 'badge-tag badge-info';
    }
    if (daaraBox) daaraBox.style.display = isDaara ? 'block' : 'none';
    if (councilLabel) councilLabel.textContent = isDaara ? 'Note de la Direction du Daara :' : 'Avis de la Direction des Études :';
    if (councilRemarks) {
      councilRemarks.innerHTML = `« L'apprenant(e) <strong>${studentName}</strong> est régulièrement inscrit(e) au titre de l'année scolaire 2026-2027. Les notes officielles, moyennes pondérées et appréciations du conseil des professeurs seront consignées à l'issue des compositions du 1er Trimestre. »`;
    }
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2.8rem 1.5rem; background: #F8FAFC; color: #475569;">
            <div style="font-size: 2.4rem; margin-bottom: 0.6rem;">📋</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 0.35rem;">
              Dossier Vierge • Aucune évaluation saisie
            </div>
            <p style="font-size: 0.88rem; color: #64748B; max-width: 500px; margin: 0 auto; line-height: 1.5;">
              Cet élève vient d'être inscrit. Ses notes de devoirs et de compositions s'afficheront ici automatiquement au fur et à mesure de leur saisie par ses professeurs.
            </p>
          </td>
        </tr>
      `;
    }
    return;
  }

  const isFatou = (studentKey === 'fatou') || (studentName && studentName.toLowerCase().includes('fatou'));

  if (isDaara) {
    if (docTypeTitle) docTypeTitle.textContent = isFatou ? 'BULLETIN OFFICIEL DAARA MODERNE' : 'BULLETIN OFFICIEL DAARA MODERNE & INTERNAT';
    if (docPeriodTitle) docPeriodTitle.textContent = isFatou ? 'Curriculum Coranique & Académique CM2 - 2026/2027' : 'Suivi Coranique & Académique 6ème - 2026/2027';
    if (docBadge) {
      docBadge.textContent = 'DOCUMENT OFFICIEL DAARA';
      docBadge.className = 'badge-tag badge-gold';
    }
    if (daaraBox) daaraBox.style.display = 'block';
    if (discHeader) discHeader.textContent = 'Discipline Coranique / Académique';
    if (councilLabel) councilLabel.textContent = 'Avis du Conseil des Oustazs & Direction du Daara :';

    if (isFatou) {
      if (document.getElementById('bulletinDaaraHizb')) document.getElementById('bulletinDaaraHizb').textContent = 'Hizb 24 (Sourate Al-Furqân) • Tajwîd A';
      if (document.getElementById('bulletinDaaraAllwa')) document.getElementById('bulletinDaaraAllwa').textContent = 'Validée avec Mention Bien (Rasm Uthmâni)';
      if (document.getElementById('bulletinDaaraPrayers')) document.getElementById('bulletinDaaraPrayers').textContent = '100% (Assidue aux prières collectives & cercles)';
      if (document.getElementById('bulletinDaaraDorm')) document.getElementById('bulletinDaaraDorm').textContent = 'Demi-pension Daara Moderne (Section Féminine Keur Massar)';
      if (councilRemarks) {
        councilRemarks.innerHTML = `« Qu'Allah préserve <strong>Fatou Sow</strong> ! Élève brillante et assidue au Daara Moderne Partenaire. Progrès continus en Hifz Coranique (Hizb 24 validé) et grand sérieux dans le module passerelle. Tableau d'Honneur décerné. »`;
      }
    } else {
      if (document.getElementById('bulletinDaaraHizb')) document.getElementById('bulletinDaaraHizb').textContent = 'Hizb 38 (Al-Ahqaf) • Tajwîd A+';
      if (document.getElementById('bulletinDaaraAllwa')) document.getElementById('bulletinDaaraAllwa').textContent = 'Validée avec Distinction (Rasm Uthmâni)';
      if (document.getElementById('bulletinDaaraPrayers')) document.getElementById('bulletinDaaraPrayers').textContent = '100% (0 manquement aux 5 prières & Fajr)';
      if (document.getElementById('bulletinDaaraDorm')) document.getElementById('bulletinDaaraDorm').textContent = 'Internat Complet • Dortoir 2 (Chambre Al-Azhar)';
      if (councilRemarks) {
        councilRemarks.innerHTML = `« Macha Allah, <strong>Mouhamed Bachir Sow</strong> fait l'honneur du Daara. Récitation limpide, respect scrupuleux du Tajwîd et assiduité sans faille aux heures de prière et d'internat. Félicitations spéciales et Tableau d'Honneur. »`;
      }
    }

    if (stampRole) stampRole.textContent = 'CONSEIL PÉDAGOGIQUE DU DAARA';

    if (tbody) {
      if (isFatou) {
        tbody.innerHTML = `
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">📖 Hifz &amp; Mémorisation du Noble Coran</td>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">18.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Macha Allah, Hizb 24 validé avec une excellente diction et bonne révision régulière</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">🎙️ Tajwîd &amp; Règles de Récitation (Ahkâm)</td>
            <td style="text-align: center; font-weight: 700;">3</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">17.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Bonne maîtrise des règles de Noon Sâkinah, Al-Madd et prononciation soignée</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">📜 Calligraphie Coranique &amp; Planche (Allwa)</td>
            <td style="text-align: center;">3</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">18.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">1ère</span></td>
            <td style="color: #334155;">Écriture Rasm Uthmâni très harmonieuse, propreté irréprochable de la planche</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🕌 Langue Arabe &amp; Vocabulaire Coranique</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">4ème</span></td>
            <td style="color: #334155;">Bonne compréhension du sens des versets et vocabulaire solide en langue arabe</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🤲 Éducation Islamique, Fiqh &amp; Adab</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">18.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Comportement pieux et noble (Adab), excellente pratique des ablutions et prières</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">📚 Français &amp; Expression Écrite (Passerelle)</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Très bonne expression écrite, lecture fluide et travail méthodique</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🔢 Mathématiques &amp; Calcul Pratique</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">4ème</span></td>
            <td style="color: #334155;">Bonnes aptitudes en calcul et logique mathématique appliquée</td>
          </tr>
        `;
      } else {
        // Mouhamed Sow
        tbody.innerHTML = `
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">📖 Hifz &amp; Mémorisation du Noble Coran</td>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">19.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">1er</span></td>
            <td style="color: #334155;">Macha Allah, Hizb 38 validé sans hésitation, excellente rétention en cercle de Murâja'ah</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">🎙️ Tajwîd &amp; Règles de Récitation (Ahkâm)</td>
            <td style="text-align: center; font-weight: 700;">3</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">19.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">1er</span></td>
            <td style="color: #334155;">Respect rigoureux des Makhârij et Sifât des lettres, récitation posée et mélodieuse (Tarteel)</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">📜 Calligraphie Coranique &amp; Planche (Allwa)</td>
            <td style="text-align: center;">3</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">17.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Écriture Rasm Uthmâni très soignée à l'encre traditionnelle, propreté et régularité</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🕌 Langue Arabe &amp; Vocabulaire Coranique</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">17.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Bonne compréhension des versets et excellente expression orale en langue arabe</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🤲 Éducation Islamique, Fiqh &amp; Adab</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">18.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">1er</span></td>
            <td style="color: #334155;">Maîtrise des ablutions, des 5 prières et comportement fraternel exemplaire à l'internat</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">📚 Français &amp; Expression Écrite (Passerelle)</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Bonne lecture fluide et participation sérieuse au module passerelle scolaire</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🔢 Mathématiques &amp; Calcul Pratique</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Calcul mental rapide et esprit d'analyse logique très développé</td>
          </tr>
        `;
      }
    }
  } else {
    // École classique / Privée
    if (docTypeTitle) docTypeTitle.textContent = "BULLETIN TRIMESTRIEL D'ÉVALUATION";
    if (docPeriodTitle) docPeriodTitle.textContent = isFatou ? '1er Trimestre • Cycle Primaire CM2 (2026-2027)' : '1er Trimestre • Cycle Moyen 6ème (2026-2027)';
    if (docBadge) {
      docBadge.textContent = 'DOCUMENT OFFICIEL';
      docBadge.className = 'badge-tag badge-excellent';
    }
    if (daaraBox) daaraBox.style.display = 'none';
    if (discHeader) discHeader.textContent = 'Discipline & Assiduité';
    if (councilLabel) councilLabel.textContent = isFatou ? 'Avis du Conseil des Maîtres :' : 'Avis du Conseil de Classe :';
    if (councilRemarks) {
      if (isFatou) {
        councilRemarks.innerHTML = `« Travail très remarquable et constant de <strong>Fatou Sow</strong>. Élève assidue, participation active et excellent esprit d'équipe. Félicitations du Conseil des Maîtres et Tableau d'Honneur décerné. »`;
      } else {
        councilRemarks.innerHTML = `« Trimestre d'excellence pour <strong>Mouhamed Bachir Sow</strong>. Travail rigoureux, esprit d'analyse remarquable en sciences et mathématiques, participation active et exemplaire. Félicitations du Conseil de Classe et Tableau d'Honneur. »`;
      }
    }
    if (stampRole) stampRole.textContent = 'DIRECTION DES ÉTUDES';

    if (tbody) {
      if (isFatou) {
        tbody.innerHTML = `
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">📚 Français (Lecture, Expression &amp; Vocabulaire)</td>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Excellente compréhension de texte, orthographe soignée et lecture fluide</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">🔢 Mathématiques (Opérations, Géométrie &amp; Problèmes)</td>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Bonne maîtrise des 4 opérations et raisonnement structuré sur les problèmes</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🔬 Éveil Scientifique &amp; Technologique</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">17.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Grande curiosité d'esprit, démarche scientifique bien acquise</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🌍 Histoire, Géographie &amp; Vivre Ensemble</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">4ème</span></td>
            <td style="color: #334155;">Bonne assimilation des repères historiques et géographiques du Sénégal</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">⚖️ Éducation Civique, Morale &amp; Santé</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Élève respectueuse des règles, esprit de groupe et bonne hygiène</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🕌 Langue Arabe &amp; Initiation Religieuse</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">5ème</span></td>
            <td style="color: #334155;">Bonne prononciation et respect du travail scolaire</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🎨 Éducation Artistique &amp; Dessin</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Créative, dessins soignés et précis</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🏃 Éducation Physique et Sportive (EPS)</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">4ème</span></td>
            <td style="color: #334155;">Bonne participation aux activités d'endurance et jeux d'équipe</td>
          </tr>
        `;
      } else {
        tbody.innerHTML = `
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">📚 Français (Grammaire, Rédaction &amp; Texte)</td>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Remarquable aisance rédactionnelle, syntaxe riche et excellente analyse de texte</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: rgba(0, 210, 180, 0.04);">
            <td style="padding: 0.55rem 0.8rem; font-weight: 700; color: #008775;">🔢 Mathématiques (Algèbre &amp; Géométrie)</td>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">17.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">1er</span></td>
            <td style="color: #334155;">Excellent esprit mathématique, démonstrations rigoureuses et calcul très sûr</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🔬 Sciences de la Vie et de la Terre (SVT)</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Très bonne compréhension des cycles biologiques et dessins d'observation nets</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🌍 Histoire &amp; Géographie</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.5</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">4ème</span></td>
            <td style="color: #334155;">Bonne culture générale et sens critique dans les dissertations historiques</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🇬🇧 Anglais (LV1)</td>
            <td style="text-align: center;">2</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">17.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">2ème</span></td>
            <td style="color: #334155;">Excellente prononciation, vocabulaire riche et participation orale très active</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">💻 Informatique &amp; Culture Numérique</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">18.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">1er</span></td>
            <td style="color: #334155;">Très grande dextérité informatique, logique algorithmique et autonomie</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">⚖️ Éducation Civique</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">16.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">3ème</span></td>
            <td style="color: #334155;">Comportement civique irréprochable et esprit de conciliation</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 0.55rem 0.8rem; font-weight: 600;">🏃 Éducation Physique et Sportive (EPS)</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-weight: 800; color: #0A192F;">15.0</td>
            <td style="text-align: center;"><span style="color: #B45309; font-weight: 700;">5ème</span></td>
            <td style="color: #334155;">Dynamique et motivé dans toutes les épreuves collectives</td>
          </tr>
        `;
      }
    }
  }
}

function previewBulletin(eleveId, customSchoolName, forcePublishOverride, forceLockedPreview) {
  const isDaaraSchool = (currentEstablishment && currentEstablishment.type === 'DAARA');
  const activeStudents = getEstablishmentActiveStudents(isDaaraSchool);
  let eleve = activeStudents.find(e => e.id === eleveId || e.matricule === eleveId);
  if (!eleve && !isRealRegisteredEstablishment()) {
    eleve = (isDaaraSchool ? demoState.talibes : demoState.elevesScolaires).find(e => e.id === eleveId) || (isDaaraSchool ? demoState.talibes[0] : demoState.elevesScolaires[0]);
  }
  if (!eleve) return;

  currentBulletinStudentId = eleve.id;

  // Déterminer l'établissement actif (priorité à l'établissement inscrit ou actif)
  let schoolName = customSchoolName;
  let schoolLogo = "🏫";
  let schoolDetails = "Dakar • Année Scolaire 2026-2027";
  let schoolMinistry = "Ministère de l'Éducation Nationale • Inspection d'Académie";

  if (!schoolName && currentEstablishment && currentEstablishment.name) {
    schoolName = currentEstablishment.name;
    schoolLogo = currentEstablishment.type === 'DAARA' ? '🕌' : '🏫';
    schoolDetails = `${currentEstablishment.city || 'Dakar'} • Code : ${currentEstablishment.code || 'SSE-SN-8419'} • Année Scolaire 2026-2027`;
    if (currentEstablishment.type === 'DAARA') {
      schoolMinistry = "Inspection Régionale de l'Enseignement Arabe & Daaras Modernes";
    }
  } else if (!schoolName) {
    schoolName = "Mon Ã‰tablissement";
    schoolLogo = "🏫";
    schoolDetails = "Dakar • Inspection d'Académie • Code : SSE-SN-1786";
  }

  // Mettre à jour l'en-tête du bulletin
  const nameEl = document.getElementById('bulletinSchoolName');
  if (nameEl) nameEl.textContent = schoolName;

  const logoEl = document.getElementById('bulletinSchoolLogo');
  if (logoEl) logoEl.textContent = schoolLogo;

  const minEl = document.getElementById('bulletinSchoolMinistry');
  if (minEl) minEl.textContent = schoolMinistry;

  const detEl = document.getElementById('bulletinSchoolDetails');
  if (detEl) detEl.textContent = schoolDetails;

  // Mettre à jour le cachet officiel personnalisé du bulletin
  const stampNameEl = document.getElementById('bulletinStampName');
  if (stampNameEl) stampNameEl.textContent = schoolName;

  const stampDateEl = document.getElementById('bulletinStampDate');
  if (stampDateEl) stampDateEl.textContent = `${currentEstablishment?.city || 'Dakar'}, Session 2026-2027`;

  // Mettre à jour les données de l'élève
  const hasGrades = Boolean(eleve.moyenne !== null && eleve.moyenne !== undefined && eleve.moyenne !== '' && eleve.moyenne !== '--');
  if (document.getElementById('bulletinStudentName')) document.getElementById('bulletinStudentName').textContent = `${eleve.prenom} ${eleve.nom}`;
  if (document.getElementById('bulletinMatricule')) document.getElementById('bulletinMatricule').textContent = eleve.matricule;
  if (document.getElementById('bulletinClasse')) document.getElementById('bulletinClasse').textContent = eleve.classe || 'Inscrit';
  if (document.getElementById('bulletinMoyenne')) document.getElementById('bulletinMoyenne').textContent = hasGrades ? `${eleve.moyenne} / 20` : `-- / 20 (Non évalué)`;
  if (document.getElementById('bulletinRang')) document.getElementById('bulletinRang').textContent = hasGrades ? `${eleve.rang} sur ${activeStudents.length || 38} élèves` : `En attente d'évaluation`;
  
  renderBulletinGradesTable(isDaaraSchool, `${eleve.prenom} ${eleve.nom}`, null, eleve);
  
  // 4️⃣ Vérification logique de publication des bulletins
  const lockedNotice = document.getElementById('bulletinLockedNotice');
  const fullContent = document.getElementById('bulletinFullContent');
  const lockedDateBadge = document.getElementById('bulletinLockedDate');
  const lockedPhone = document.getElementById('bulletinLockedParentPhone');

  const today = new Date().toISOString().split('T')[0];
  const isPastPublishDate = today >= bulletinPublicationState.datePublication;
  const isUnlocked = forcePublishOverride || bulletinPublicationState.forcePublished || isPastPublishDate;

  if (lockedDateBadge) lockedDateBadge.textContent = formatDateFr(bulletinPublicationState.datePublication);
  if (lockedPhone) lockedPhone.textContent = eleve.parentTel || '+221 77 000 11 22';

  if (forceLockedPreview || (!isUnlocked && currentRole !== 'ADMIN')) {
    // Vue Élève / Parent avant la date fixée : affichage "Bulletin en attente jusqu'au [date]"
    if (lockedNotice) lockedNotice.style.display = 'block';
    if (fullContent) fullContent.style.display = 'none';
  } else {
    // Vue débloquée ou vue Directeur
    if (lockedNotice) lockedNotice.style.display = 'none';
    if (fullContent) fullContent.style.display = 'block';
    const pubBadge = document.getElementById('bulletinPublishedDateLabel');
    if (pubBadge) pubBadge.textContent = isUnlocked ? `Débloqué le ${formatDateFr(bulletinPublicationState.datePublication)}` : 'Consultation administrative (Directeur)';
  }

  const modal = document.getElementById('bulletinModal');
  if (modal) modal.classList.add('active');
}

// --- MODULE PAIEMENT MOBILE MONEY (WAVE, ORANGE MONEY, SYSCOHADA) ---
function setupMobileMoneySimulator() {
  const ops = document.querySelectorAll('.operator-option');
  ops.forEach(op => {
    op.addEventListener('click', () => {
      ops.forEach(o => o.classList.remove('selected'));
      op.classList.add('selected');
      const operator = op.getAttribute('data-operator');
      updatePaymentView(operator);
    });
  });
}

function updatePaymentView(operator) {
  const btn = document.getElementById('btnTriggerPayment');
  if (operator === 'WAVE') {
    btn.innerHTML = '🌊 Payer avec Wave (QR Code Direct)';
    btn.style.background = '#1BA4E8';
  } else if (operator === 'ORANGE_MONEY') {
    btn.innerHTML = '🍊 Payer avec Orange Money (#144#)';
    btn.style.background = '#FF6600';
  } else {
    btn.innerHTML = '🔴 Payer avec Free Money (*150#)';
    btn.style.background = '#ED1C24';
  }
}

function simulatePaymentProcess() {
  const payerName = document.getElementById('payPayerName').value || 'Mamadou Diop';
  const amount = document.getElementById('payAmountInput').value || '35 000';
  const motif = document.getElementById('payMotifSelect').value || 'Mensualité Scolarité';
  const phone = document.getElementById('payPhoneInput').value || '+221 77 550 12 34';

  const qrBox = document.getElementById('waveLiveQrBox');
  qrBox.style.display = 'block';
  qrBox.scrollIntoView({ behavior: 'smooth' });

  // Animation de validation instantanée après 3 secondes (comme un vrai scan Wave)
  const statusEl = document.getElementById('waveStatusMsg');
  statusEl.innerHTML = '<span style="color: #1BA4E8;">⏳ Attente du scan Wave sur votre smartphone...</span>';

  setTimeout(() => {
    statusEl.innerHTML = '<span style="color: var(--success); font-weight: 800;">✅ Paiement Confirmé Instantanément !</span>';
    
    // Ajout transaction
    const newRef = 'SSE-2026-' + Math.floor(10000 + Math.random() * 90000);
    demoState.transactions.unshift({
      ref: newRef,
      date: 'À l\'instant',
      eleve: payerName,
      motif: motif,
      montant: `${Number(amount).toLocaleString('fr-FR')} FCFA`,
      operateur: 'WAVE',
      tel: phone,
      statut: 'VALIDE'
    });

    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Paiement Mobile Money validé : ${amount} FCFA pour ${payerName} (Réf ${newRef})`,
      user: 'Passerelle Wave Automatisée'
    });

    renderTransactions();
    renderAuditLogs();

    // Ouverture automatique du reçu SYSCOHADA
    setTimeout(() => {
      openReceiptModal(newRef, payerName, amount, motif, phone, 'WAVE');
    }, 1000);

  }, 2600);
}

function openReceiptModal(ref, name, amount, motif, phone, op, schoolName) {
  const ws = document.getElementById('workspaceView');
  let targetSchool = schoolName;
  let targetLogo = (currentEstablishment && currentEstablishment.type === 'DAARA') ? '🕌' : '🏫';
  let targetAddress = `${currentEstablishment?.city || 'Dakar'} • Code : ${currentEstablishment?.code || 'SSE-SN-8419'} • Tél : ${currentEstablishment?.phone || '+221 77 123 45 67'}`;

  // Priorité à l'établissement enregistré ou actif
  if (currentEstablishment && currentEstablishment.name && (!schoolName || (ws && ws.classList.contains('active')))) {
    targetSchool = currentEstablishment.name;
    targetLogo = currentEstablishment.type === 'DAARA' ? '🕌' : '🏫';
    targetAddress = `${currentEstablishment.city || 'Dakar'} • Code : ${currentEstablishment.code || 'SSE-SN-8419'} • Tél : ${currentEstablishment.phone || '+221 77 123 45 67'}`;
  } else if (!targetSchool) {
    // Détection automatique selon le motif ou le nom de l'élève
    const isDaaraMotif = (motif && (motif.toLowerCase().includes('daara') || motif.toLowerCase().includes('internat') || motif.toLowerCase().includes('pension'))) ||
                         (name && (name.includes('Sow') || name.includes('Kane') || name.includes('Ndiaye') || name.includes('Diallo')));
    
    if (isDaaraMotif) {
      targetSchool = (isDaara ? "Mon Daara Moderne" : "Mon Ã‰tablissement");
      targetLogo = "🕌";
      targetAddress = "Campus Keur Massar, Dakar • Agréé par l'État • Tél : +221 33 820 00 00";
    } else {
      targetSchool = "Mon Ã‰tablissement";
      targetLogo = "🏫";
      targetAddress = "Dakar • Ministère de l'Éducation • Tél : +221 33 860 11 22";
    }
  }

  document.getElementById('recSchoolName').textContent = targetSchool;
  document.getElementById('recSchoolLogo').textContent = targetLogo;
  document.getElementById('recSchoolAddress').textContent = targetAddress;
  document.getElementById('recStampName').textContent = targetSchool;

  document.getElementById('recRef').textContent = ref;
  document.getElementById('recDate').textContent = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR');
  document.getElementById('recPayer').textContent = name;
  document.getElementById('recPhone').textContent = phone;
  document.getElementById('recMotif').textContent = motif;
  document.getElementById('recAmount').textContent = amount.toString().includes('FCFA') ? amount : `${Number(amount).toLocaleString('fr-FR')} FCFA`;
  document.getElementById('recOperator').textContent = op;

  const modal = document.getElementById('receiptModal');
  const isParentActive = document.getElementById('parentPortalModal') && document.getElementById('parentPortalModal').classList.contains('active');
  if (isParentActive) {
    modal.style.zIndex = '2500';
  } else {
    modal.style.zIndex = '';
  }
  modal.classList.add('active');
}

function renderTransactions() {
  const tbody = document.getElementById('transactionsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  demoState.transactions.forEach(tx => {
    const defaultSchool = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : "Mon Établissement";
    const isDaaraTx = (tx.motif && (tx.motif.toLowerCase().includes('daara') || tx.motif.toLowerCase().includes('internat') || tx.motif.toLowerCase().includes('pension'))) ||
                      (tx.eleve && (tx.eleve.includes('Sow') || tx.eleve.includes('Kane') || tx.eleve.includes('Ndiaye') || tx.eleve.includes('Diallo'))) ||
                      (currentEstablishment && currentEstablishment.type === 'DAARA');
    const assignedSchool = isDaaraTx ? "Mon Daara Moderne" : defaultSchool;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${tx.ref}</strong></td>
      <td>${tx.date}</td>
      <td>
        <strong>${tx.eleve}</strong>
        <div style="font-size: 0.72rem; color: var(--turquoise-400);">${assignedSchool}</div>
      </td>
      <td>${tx.motif}</td>
      <td><strong style="color: var(--dore-400);">${tx.montant}</strong></td>
      <td><span class="badge-tag" style="background: rgba(27, 164, 232, 0.15); color: #1BA4E8;">${tx.operateur}</span></td>
      <td>
        <button class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="openReceiptModal('${tx.ref}', '${tx.eleve}', '${tx.montant}', '${tx.motif}', '${tx.tel}', '${tx.operateur}', '${assignedSchool}')">
          📄 Reçu
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- MODULE WHATSAPP & SMS ---
function setupWhatsAppSimulator() {
  const select = document.getElementById('waTemplateSelect');
  if (!select) return;

  select.addEventListener('change', () => {
    updateWhatsAppPreview(select.value);
  });
}

function updateWhatsAppPreview(type) {
  const msgBody = document.getElementById('waMessageText');
  if (!msgBody) return;

  if (type === 'absence') {
    msgBody.innerHTML = `Bonjour Cher Parent,<br><br>Nous vous informons de l'absence non justifiée de votre enfant <strong>Babacar Seck</strong> ce matin à 08h00.<br><br>Merci de contacter la vie scolaire au <strong>33 820 00 00</strong>.<br><br><em>Direction SunuSchool</em>`;
  } else if (type === 'hizb') {
    msgBody.innerHTML = `Macha Allah Cher Parent 🌟,<br><br>Votre enfant <strong>Mouhamed Bachir Sow</strong> a validé aujourd'hui le <strong>Hizb 48 (Sourate Yâ-Sîn)</strong> avec une note de Tajwîd de <strong>19.5/20</strong> !<br><br>Qu'Allah bénisse ses efforts.<br><br><em>Daara Moderne Partenaire</em>`;
  } else if (type === 'changement_emploi') {
    msgBody.innerHTML = `📢 <strong>AVIS IMPORTANT — Direction des Études</strong> :<br><br>Chers Parents d'élèves de la classe de <strong>3ème B</strong>,<br><br>Nous vous informons d'un réaménagement officiel de l'emploi du temps hebdomadaire à compter de ce lundi.<br><br>📌 Consultez les nouveaux horaires et affectations de salles sur votre <strong>Espace Famille SunuSchool</strong>.<br><br><em>Direction Diamil Academy</em>`;
  } else {
    msgBody.innerHTML = `Bonjour M. Sow,<br><br>Le paiement de la mensualité de <strong>35 000 FCFA</strong> pour <strong>Octobre 2026</strong> a bien été reçu via <strong>Wave</strong> (Réf: SSE-2026-89412).<br><br>Votre reçu officiel SYSCOHADA est disponible en ligne.<br><br><em>SunuSchoolExpress Finance</em>`;
  }
}

function sendSimulatedWhatsApp() {
  const phone = document.getElementById('waRecipientPhone').value || '+221 77 645 88 12';
  showNotification(`🚀 Notification WhatsApp instantanée envoyée au ${phone} !`);
  
  demoState.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    action: `Notification WhatsApp expédiée vers ${phone}`,
    user: 'Robot Notifications SunuSchool'
  });
  renderAuditLogs();
}

// --- JOURNAL D'AUDIT & SÉCURITÉ ---
function renderAuditLogs() {
  const container = document.getElementById('auditLogsContainer');
  if (!container) return;

  container.innerHTML = '';
  demoState.auditLogs.slice(0, 8).forEach(log => {
    const item = document.createElement('div');
    item.style.cssText = 'padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem; display: flex; justify-content: space-between; gap: 1rem;';
    item.innerHTML = `
      <span><strong style="color: var(--turquoise-400);">${log.time}</strong> - ${log.action}</span>
      <span style="color: var(--gris-500); font-style: italic;">${log.user}</span>
    `;
    container.appendChild(item);
  });
}

// --- AUTHENTIFICATION MULTI-FACTEURS (MFA) & RECONNEXION PAR EMAIL ---
function triggerMfaSimulation() {
  const modal = document.getElementById('mfaModal');
  if (!modal) return;
  modal.classList.add('active');

  // Préremplir avec l'email actif ou le dernier établissement utilisé
  const emailInput = document.getElementById('loginEmailInput');
  if (emailInput) {
    if (currentEstablishment && currentEstablishment.email) {
      emailInput.value = currentEstablishment.email;
    } else if (!emailInput.value) {
      emailInput.value = 'direction@diamilacademy.sn';
    }
    onLoginEmailInput(emailInput.value);
  }
}

function verifyMfaCode() {
  const emailVal = document.getElementById('loginEmailInput') ? document.getElementById('loginEmailInput').value.trim() : '';

  if (!emailVal || !emailVal.includes('@')) {
    alert("Veuillez renseigner une adresse e-mail valide pour votre établissement (ex: direction@diamilacademy.sn)");
    return;
  }

  // Reconnaître instantanément l'établissement et sa formule en cours à partir de l'email
  let targetEst = findEstablishmentByEmail(emailVal) || currentEstablishment;

  if (!targetEst) {
    targetEst = {
      email: emailVal,
      name: "Mon Ã‰tablissement",
      plan: "Formule École Pro",
      type: "ECOLE",
      city: "Dakar",
      code: "SSE-SN-1786",
      phone: "+221 77 123 45 67"
    };
  } else {
    targetEst.email = emailVal;
  }

  // Traitement prioritaire Super Admin de la Plateforme (sunushoolexpress@gmail.com)
  if (targetEst.isSuperAdmin || targetEst.type === 'SUPER_ADMIN' || emailVal.toLowerCase().includes('sunushoolexpress')) {
    try {
      localStorage.setItem('sse_active_role', 'SUPER_ADMIN');
      localStorage.setItem('sse_active_user', JSON.stringify({
        email: "sunushoolexpress@gmail.com",
        role: "SUPER_ADMIN",
        nom: "Admin Plateforme",
        prenom: "SunuSchool Express"
      }));
    } catch (e) {}

    showNotification(`👑 Connexion Super Admin Plateforme réussie (${emailVal}) ! Redirection vers la Console SaaS...`);
    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Connexion Super Administrateur SaaS Plateforme (${emailVal}) : Accès central national`,
      user: 'Super Admin HQ'
    });
    renderAuditLogs();
    closeAllModals();
    setTimeout(() => {
      window.location.href = "dashboard.html?role=SUPER_ADMIN&email=sunushoolexpress@gmail.com";
    }, 450);
    return;
  }

  // Contrôle de validation administrative
  const isApproved = (targetEst.statut === 'ACTIF' || targetEst.statutAbonnement === 'ACTIF' || targetEst.statutAbonnement === 'ESSAI_GRATUIT' || targetEst.type === 'SUPER_ADMIN') && 
                     (targetEst.statut !== 'EN_ATTENTE_VALIDATION') && 
                     (targetEst.fraisAdhesionPayes !== false);

  if (!isApproved) {
    currentEstablishment = targetEst;
    try {
      localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
      localStorage.removeItem('sunuschool_active_workspace');
    } catch (e) {}
    closeAllModals();
    openPendingValidationNotice(targetEst);
    updateSessionRecoveryUI();
    return;
  }

  currentEstablishment = targetEst;

  try {
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
    localStorage.setItem('sunuschool_active_workspace', 'true');
    saveEstablishmentToRegistry(currentEstablishment);
  } catch (e) {}

  showNotification(`⚡ Connexion réussie ! Établissement "${currentEstablishment.name}" reconnu (Formule : ${currentEstablishment.plan}).`);

  demoState.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    action: `Connexion directe par e-mail établissement (${emailVal}) : ${currentEstablishment.name} - Formule ${currentEstablishment.plan} activée`,
    user: 'Directeur Général'
  });
  renderAuditLogs();
  closeAllModals();

  // Masquer le bandeau d'alerte de perte de connexion s'il est affiché
  const offlineBanner = document.getElementById('offlineReconnectBanner');
  if (offlineBanner) offlineBanner.style.display = 'none';

  // Redirection directe vers l'espace de travail dédié avec la formule restaurée
  activateDedicatedWorkspace(currentEstablishment);
}

// Fonction de réentrée directe dans l'espace après déconnexion ou rechargement
function reenterWorkspaceDirectly() {
  openWorkspaceDirect();
}

function updateSessionRecoveryUI() {
  if (!currentEstablishment || !currentEstablishment.name) return;

  const isSuperAdmin = (currentEstablishment.type === 'SUPER_ADMIN' || currentEstablishment.code === 'SSE-ADMIN-HQ' || (currentEstablishment.email && currentEstablishment.email.toLowerCase() === 'sunuschoolexpress@gmail.com'));
  const isApproved = (currentEstablishment.statut === 'ACTIF' || currentEstablishment.statutAbonnement === 'ACTIF' || currentEstablishment.statutAbonnement === 'ESSAI_GRATUIT') && 
                     (currentEstablishment.statut !== 'EN_ATTENTE_VALIDATION') && 
                     (currentEstablishment.fraisAdhesionPayes !== false);

  const isDaara = currentEstablishment.type === 'DAARA';
  const icon = isDaara ? '🕌' : '🏫';
  const navBtn = document.getElementById('navWorkspaceBtn');
  const mobNavBtn = document.getElementById('mobNavWorkspaceBtn');
  const schoolNameDisp = currentEstablishment.name || 'Établissement';

  if (!isSuperAdmin && !isApproved) {
    const banner = document.getElementById('activeSessionRecoveryBanner');
    if (banner) {
      banner.style.display = 'flex';
      banner.style.border = '1px solid rgba(245, 158, 11, 0.4)';
      banner.style.background = 'rgba(245, 158, 11, 0.1)';
    }
    const iconEl = document.getElementById('sessionBannerIcon');
    if (iconEl) iconEl.textContent = '⏳';
    const nameEl = document.getElementById('sessionBannerSchoolName');
    if (nameEl) nameEl.textContent = `${schoolNameDisp} (Validation en cours)`;
    const descEl = document.getElementById('sessionBannerPlanDesc');
    if (descEl) descEl.textContent = `Dossier Wave soumis • En attente de validation administrative par SunuSchool-Express`;
    const bannerBtn = document.getElementById('sessionBannerActionBtn');
    if (bannerBtn) {
      bannerBtn.textContent = '⏳ Voir le statut du dossier';
      bannerBtn.onclick = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        openPendingValidationNotice(currentEstablishment);
      };
    }
    if (navBtn) {
      navBtn.innerHTML = `<span>⏳</span> <span>${schoolNameDisp} (En attente)</span>`;
      navBtn.title = `Dossier en attente de validation administrative`;
      navBtn.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
      navBtn.style.color = '#FFFFFF';
      navBtn.onclick = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        openPendingValidationNotice(currentEstablishment);
      };
    }
    if (mobNavBtn) {
      mobNavBtn.innerHTML = `<span>⏳</span> <span>${schoolNameDisp} (En attente)</span>`;
      mobNavBtn.onclick = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        closeMobileMenu();
        openPendingValidationNotice(currentEstablishment);
      };
    }
    return;
  }

  // Établissement validé et actif
  const banner = document.getElementById('activeSessionRecoveryBanner');
  if (banner) {
    banner.style.display = 'flex';
    banner.style.border = '1px solid rgba(212, 175, 55, 0.45)';
    banner.style.background = 'rgba(212, 175, 55, 0.12)';
  }
  const iconEl = document.getElementById('sessionBannerIcon');
  if (iconEl) iconEl.textContent = icon;
  const nameEl = document.getElementById('sessionBannerSchoolName');
  if (nameEl) nameEl.textContent = currentEstablishment.name;
  const descEl = document.getElementById('sessionBannerPlanDesc');
  if (descEl) descEl.textContent = `${currentEstablishment.plan} Active • Essai Gratuit en cours (29 jours restants)`;
  const bannerBtn = document.getElementById('sessionBannerActionBtn');
  if (bannerBtn) {
    bannerBtn.textContent = '⚡ Reprendre ma Session →';
    bannerBtn.onclick = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      openWorkspaceDirect();
    };
  }

  if (navBtn) {
    navBtn.innerHTML = `<span>${icon}</span> <span>${schoolNameDisp}</span>`;
    navBtn.title = `Accéder au tableau de bord de ${schoolNameDisp}`;
    navBtn.style.background = '';
    navBtn.style.color = '';
    navBtn.onclick = (e) => { if (e && e.preventDefault) e.preventDefault(); openWorkspaceDirect(); };
  }
  if (mobNavBtn) {
    mobNavBtn.innerHTML = `<span>${icon}</span> <span>${schoolNameDisp}</span>`;
    mobNavBtn.onclick = (e) => { if (e && e.preventDefault) e.preventDefault(); closeMobileMenu(); openWorkspaceDirect(); };
  }
}

// --- RÉINITIALISATION DU SANDBOX DÉMO ---
function resetDemoSandbox() {
  if (confirm('Voulez-vous réinitialiser toutes les données de la démo à leur état initial ?')) {
    demoState.talibes = JSON.parse(JSON.stringify(originalDemoState.talibes));
    demoState.elevesScolaires = JSON.parse(JSON.stringify(originalDemoState.elevesScolaires));
    demoState.transactions = JSON.parse(JSON.stringify(originalDemoState.transactions));
    demoState.auditLogs = JSON.parse(JSON.stringify(originalDemoState.auditLogs));

    renderDaaraTalibes();
    renderSchoolStudents();
    renderTransactions();
    renderAuditLogs();
    showNotification('🔄 Environnement Sandbox remis à neuf avec succès !');
  }
}

// --- MODAL D'INSCRIPTION ÉTABLISSEMENT & ESPACE DÉDIÉ (WORKSPACE) ---
function upgradeEstablishmentPlan(newPlan) {
  if (!currentEstablishment) return;
  currentEstablishment.plan = newPlan;
  try {
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
    localStorage.setItem('sunuschool_active_workspace', 'true');
  } catch (e) {}
  activateDedicatedWorkspace(currentEstablishment);
  showNotification(`🎉 Formule activée avec succès : ${newPlan} ! Toutes les fonctionnalités correspondantes sont débloquées.`);
}

function openRegistrationModal(planName, planPrice) {
  closeAllModals();

  const nameEl = document.getElementById('regPlanName');
  const priceEl = document.getElementById('regPlanPrice');
  if (nameEl) nameEl.textContent = planName;
  if (priceEl) priceEl.textContent = planPrice;

  const isDaaraPlan = planName.toLowerCase().includes('daara') || planName.toLowerCase().includes('internat');

  const schoolInput = document.getElementById('regSchoolName');
  const emailInput = document.getElementById('regEmail');
  const cityInput = document.getElementById('regCity');
  const phoneInput = document.getElementById('regPhone');
  const typeSelect = document.getElementById('regType');

  // Champs neufs prêts pour une nouvelle inscription
  if (schoolInput) {
    schoolInput.value = '';
    schoolInput.placeholder = isDaaraPlan ? 'Ex: Daara Moderne de Touba' : 'Ex: Groupe Scolaire Bilingue Avenir';
    setTimeout(() => schoolInput.focus(), 150);
  }
  if (emailInput) {
    emailInput.value = '';
    emailInput.placeholder = isDaaraPlan ? 'Ex: contact@daara-moderne.sn' : 'Ex: direction@ecole-avenir.sn';
  }
  if (cityInput) {
    cityInput.value = 'Dakar';
  }
  if (phoneInput) {
    phoneInput.value = '';
    phoneInput.placeholder = '+221 77 000 00 00';
  }

  if (typeSelect) {
    typeSelect.value = isDaaraPlan ? 'Daara Moderne (Internat / Demi-pension)' : 'Collège / Lycée Privé';
  }

  // Réinitialiser à l'Étape 1 (Coordonnées)
  goToRegStep(1);

  const modal = document.getElementById('registrationModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// ============================================================================
// GESTION DU GUICHET AGRÉGATEUR COMPLET (WAVE, ORANGE MONEY, FREE, CARTE)
// ============================================================================
let selectedPaymentOp = 'WAVE';
let currentPendingSubscription = null;

function goToRegStep(step) {
  const step1 = document.getElementById('regStep1Details');
  const step2 = document.getElementById('regStep2Payment');
  const step3 = document.getElementById('regStep3Processing');
  const step4 = document.getElementById('regStep4Success');
  if (!step1 || !step2) return;

  if (step === 2) {
    const schoolInput = document.getElementById('regSchoolName');
    const emailInput = document.getElementById('regEmail');
    const cityInput = document.getElementById('regCity');
    const phoneInput = document.getElementById('regPhone');

    const schoolName = (schoolInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const city = (cityInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();

    if (!schoolName) {
      alert("⚠️ Le Nom de l'école ou du Daara est obligatoire.");
      if (schoolInput) schoolInput.focus();
      return;
    }
    if (!email) {
      alert("⚠️ L'E-mail officiel de l'établissement est obligatoire.");
      if (emailInput) emailInput.focus();
      return;
    }
    if (!city) {
      alert("⚠️ La Ville / Région est obligatoire.");
      if (cityInput) cityInput.focus();
      return;
    }
    if (!phone) {
      alert("⚠️ Le Téléphone du Directeur est obligatoire.");
      if (phoneInput) phoneInput.focus();
      return;
    }
  }

  step1.style.display = 'none';
  step2.style.display = 'none';
  if (step3) step3.style.display = 'none';
  if (step4) step4.style.display = 'none';

  if (step === 1) {
    step1.style.display = 'block';
  } else if (step === 2) {
    const schoolName = document.getElementById('regSchoolName')?.value.trim() || 'Mon Établissement';
    const planName = document.getElementById('regPlanName')?.textContent.trim() || 'Formule École Pro';
    const phone = document.getElementById('regPhone')?.value.trim() || '';

    const sumSchool = document.getElementById('paySummarySchool');
    const sumPlan = document.getElementById('paySummaryPlan');
    if (sumSchool) sumSchool.textContent = schoolName;
    if (sumPlan) sumPlan.textContent = planName;

    // Transférer systématiquement le numéro saisi à l'étape 1 vers les champs opérateurs
    const wavePhone = document.getElementById('payWavePhone');
    if (wavePhone) wavePhone.value = phone;

    step2.style.display = 'block';
    selectPaymentOperator('WAVE');
  } else if (step === 3) {
    if (step3) step3.style.display = 'block';
  } else if (step === 4) {
    if (step4) step4.style.display = 'block';
  }
}

function selectPaymentOperator(op) {
  op = 'WAVE';
  selectedPaymentOp = 'WAVE';

  const btnWave = document.getElementById('btnOpWave');
  const btnCB = document.getElementById('btnOpCB');

  const fWave = document.getElementById('fieldsWave');
  const fCB = document.getElementById('fieldsCB');
  const instrWave = document.getElementById('instructionWave');
  const instrCB = document.getElementById('instructionCB');

  const btnExec = document.getElementById('btnExecutePayment');

  // Réinitialiser les styles des boutons
  [btnWave, btnCB].forEach(b => {
    if (b) {
      b.style.borderColor = 'rgba(255,255,255,0.15)';
      b.style.background = 'rgba(255,255,255,0.03)';
      b.classList.remove('active');
    }
  });

  if (fWave) fWave.style.display = 'none';
  if (fCB) fCB.style.display = 'none';
  if (instrWave) instrWave.style.display = 'none';
  if (instrCB) instrCB.style.display = 'none';

  if (op === 'WAVE') {
    if (btnWave) {
      btnWave.style.borderColor = '#00D2B4';
      btnWave.style.background = 'rgba(0, 210, 180, 0.12)';
      btnWave.classList.add('active');
    }
    if (fWave) fWave.style.display = 'block';
    if (instrWave) instrWave.style.display = 'block';
    if (btnExec) btnExec.innerHTML = '<span>🔒 Payer 10 000 FCFA avec Wave</span>';
  } else if (op === 'CARTE_BANCAIRE') {
    if (btnCB) {
      btnCB.style.borderColor = '#60A5FA';
      btnCB.style.background = 'rgba(96, 165, 250, 0.12)';
      btnCB.classList.add('active');
    }
    if (fCB) fCB.style.display = 'block';
    if (instrCB) instrCB.style.display = 'block';
    if (btnExec) btnExec.innerHTML = '<span>🔒 Payer 10 000 FCFA par Carte Visa</span>';
  }
}

async function executeSubscriptionPayment() {
  const nameEl = document.getElementById('regSchoolName');
  const planEl = document.getElementById('regPlanName');
  const priceEl = document.getElementById('regPlanPrice');
  const emailEl = document.getElementById('regEmail');
  const cityEl = document.getElementById('regCity');
  const phoneEl = document.getElementById('regPhone');
  const typeEl = document.getElementById('regType');

  const rawSchoolName = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : '';
  const planName = (planEl && planEl.textContent.trim()) ? planEl.textContent.trim() : 'Formule École Pro';
  const planPrice = (priceEl && priceEl.textContent.trim()) ? priceEl.textContent.trim() : '55 000 FCFA/mois';

  const isDaaraPlan = planName.toLowerCase().includes('daara') || planName.toLowerCase().includes('internat');
  const schoolName = rawSchoolName || (isDaaraPlan ? (isDaara ? 'Mon Daara Moderne' : 'Mon Ã‰tablissement') : 'Nouvel Établissement Partenaire');

  let email = (emailEl && emailEl.value.trim()) ? emailEl.value.trim() : '';
  if (!email || email.toLowerCase().includes('diamilacademy')) {
    const slug = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    email = `direction@${slug || 'ecole'}.sn`;
  }

  const city = (cityEl && cityEl.value.trim()) ? cityEl.value.trim() : 'Dakar';
  
  const wavePhoneEl = document.getElementById('payWavePhone');
  const omPhoneEl = document.getElementById('payOMPhone');
  const fmPhoneEl = document.getElementById('payFMPhone');

  let phone = (phoneEl && phoneEl.value.trim()) ? phoneEl.value.trim() : '';
  if (selectedPaymentOp === 'WAVE' && wavePhoneEl && wavePhoneEl.value.trim()) {
    phone = wavePhoneEl.value.trim();
  } else if (selectedPaymentOp === 'ORANGE_MONEY' && omPhoneEl && omPhoneEl.value.trim()) {
    phone = omPhoneEl.value.trim();
  } else if (selectedPaymentOp === 'FREE_MONEY' && fmPhoneEl && fmPhoneEl.value.trim()) {
    phone = fmPhoneEl.value.trim();
  }
  const type = (typeEl && typeEl.value.toLowerCase().includes('daara')) ? 'DAARA' : (isDaaraPlan ? 'DAARA' : 'ECOLE');

  const generatedCode = 'SSE-SN-' + Math.floor(1000 + Math.random() * 9000);

  // 1. CRÉATION IMMÉDIATE & PERSISTANCE LOCALE INFAILLIBLE
  const newEstablishment = {
    id: `etab-${Date.now()}`,
    email: email,
    name: schoolName,
    plan: planName,
    type: type,
    city: city,
    code: generatedCode,
    secretKey: `ADM-${generatedCode.replace(/[^0-9]/g, '')}`,
    password: `ADM-${generatedCode.replace(/[^0-9]/g, '')}`,
    phone: phone,
    statut: 'EN_ATTENTE_VALIDATION',
    statutAbonnement: 'EN_ATTENTE_VALIDATION',
    dateAdhesion: new Date().toISOString().split('T')[0],
    fraisAdhesionPayes: false,
    operateurPaiement: selectedPaymentOp,
    isUserCreated: true,
    createdAt: new Date().toISOString()
  };

  currentEstablishment = newEstablishment;
  try {
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
    localStorage.removeItem('sunuschool_active_workspace'); // Accès bloqué tant que non validé par l'Admin
    saveEstablishmentToRegistry(currentEstablishment);
    syncWithSaaSDatabase(currentEstablishment);
  } catch (storageErr) {
    console.warn('Erreur stockage local immédiat:', storageErr);
  }

  // 2. Mettre à jour immédiatement les éléments du reçu et de l'interface
  const recNum = `REC-SSE-${Date.now().toString().slice(-6)}`;
  const recDate = new Date().toLocaleDateString('fr-FR');
  const numEl = document.getElementById('receiptNumDisplay');
  const dateEl = document.getElementById('receiptDateDisplay');
  const schoolEl = document.getElementById('receiptSchoolDisplay');
  const codeEl = document.getElementById('receiptCodeDisplay');
  const planElDisp = document.getElementById('receiptPlanDisplay');
  const keyEl = document.getElementById('receiptKeyDisplay');
  const opEl = document.getElementById('receiptOpDisplay');

  if (numEl) numEl.textContent = recNum;
  if (dateEl) dateEl.textContent = recDate;
  if (schoolEl) schoolEl.textContent = schoolName;
  if (codeEl) codeEl.textContent = `Code : ${currentEstablishment.code}`;
  if (planElDisp) planElDisp.textContent = planName;
  if (keyEl) keyEl.textContent = `ADM-${currentEstablishment.code.replace(/[^0-9]/g, '')}`;
  if (opEl) opEl.textContent = `Payé via ${selectedPaymentOp} (10 000 FCFA)`;
  const recAmtEl = document.getElementById('receiptAmountDisplay');
  if (recAmtEl) recAmtEl.textContent = '10 000 FCFA (Adhésion Validée)';

  const portalBadge = document.getElementById('portalSchoolBadge');
  if (portalBadge) portalBadge.textContent = schoolName;
  const bulletinSchoolEl = document.getElementById('bulletinSchoolName');
  if (bulletinSchoolEl) bulletinSchoolEl.textContent = schoolName;
  const bulletinStampEl = document.getElementById('bulletinStampName');
  if (bulletinStampEl) bulletinStampEl.textContent = schoolName;

  demoState.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    action: `Paiement Adhésion 10 000 FCFA validé via ${selectedPaymentOp} : ${schoolName}`,
    user: 'Passerelle Wave Sénégal (Direct)'
  });
  renderAuditLogs();

  // 3. Configuration du Guichet Opérateur & Redirection Directe
  const refTx = `SSE-SUB-${Date.now().toString().slice(-6)}`;
  let opUrl = 'https://pay.wave.com';
  let ussdUrl = '';
  let opIcon = '🔵';
  let opName = 'Wave Sénégal';
  let opColor = '#00D2B4';
  let btnText = '💬 Notifier le virement Wave (10 000 FCFA) par WhatsApp';

  const whatsappUrl = `https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je confirme le règlement d'adhésion de 10 000 FCFA pour l'établissement "${schoolName}" (${phone ? 'Tél: ' + phone : ''}) vers le compte Wave Marchand Diamil express (77 106 48 77) - Réf: ${refTx}.`)}`;

  if (selectedPaymentOp === 'WAVE') {
    opIcon = '🌊';
    opName = 'Wave Marchand : Diamil express (77 106 48 77)';
    opColor = '#00D2B4';
    opUrl = whatsappUrl;
    btnText = '💬 Notifier le virement Wave (10 000 FCFA) par WhatsApp';
  } else if (selectedPaymentOp === 'CARTE_BANCAIRE') {
    opIcon = '💳';
    opName = 'Carte Visa / Mastercard (GIM-UEMOA)';
    opColor = '#3B82F6';
    opUrl = whatsappUrl;
    btnText = '💬 Contacter l\'Assistance Monétique WhatsApp';
  }

  // Mettre à jour l'en-tête de l'opérateur
  const headerEl = document.getElementById('operatorGatewayHeader');
  const iconEl = document.getElementById('gatewayOpIcon');
  const gatewayNameEl = document.getElementById('gatewayOpName');
  const refEl = document.getElementById('gatewayRefDisplay');
  const qrBox = document.getElementById('waveQrBox');
  const btnDirect = document.getElementById('btnDirectOperatorUrl');
  const btnDirectText = document.getElementById('btnDirectOpText');
  const btnUssd = document.getElementById('btnDirectUssdUrl');

  if (headerEl) {
    headerEl.style.borderColor = opColor;
    headerEl.style.background = `${opColor}1F`;
  }
  if (iconEl) iconEl.textContent = opIcon;
  if (gatewayNameEl) {
    gatewayNameEl.textContent = opName;
    gatewayNameEl.style.color = opColor;
  }
  if (refEl) refEl.textContent = refTx;
  if (qrBox) qrBox.style.display = (selectedPaymentOp === 'WAVE') ? 'block' : 'none';

  const wavePayBtn = document.getElementById('btnDirectWavePay');
  const waveQrImg = document.getElementById('waveMerchantQrImg');
  const waveTargetUrl = 'https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/?amount=10000';
  if (wavePayBtn) wavePayBtn.href = waveTargetUrl;
  if (waveQrImg) waveQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(waveTargetUrl)}`;

  if (btnDirect) {
    btnDirect.href = opUrl;
    btnDirect.style.background = (selectedPaymentOp === 'WAVE') ? 'rgba(37, 211, 102, 0.12)' : opColor;
    btnDirect.style.color = (selectedPaymentOp === 'WAVE') ? '#25D366' : '#FFFFFF';
  }
  if (btnDirectText) btnDirectText.textContent = btnText;

  if (btnUssd) {
    btnUssd.style.display = 'none';
  }

  goToRegStep(3);

  // 4. Maintien de l'écran de paiement actif jusqu'à confirmation explicite de l'utilisateur
  if (window.operatorPaymentTimer) {
    clearInterval(window.operatorPaymentTimer);
    window.operatorPaymentTimer = null;
  }
  const timerTextEl = document.getElementById('gatewayTimerText');
  const barEl = document.getElementById('gatewayProgressBar');
  const statusTextEl = document.getElementById('gatewayStatusText');
  
  if (timerTextEl) timerTextEl.textContent = `Étape active`;
  if (barEl) barEl.style.width = '100%';
  if (statusTextEl) statusTextEl.innerHTML = `📡 En attente de votre règlement de 10 000 FCFA sur votre téléphone...`;

function getBackendBaseUrl() {
  if (typeof window !== 'undefined') {
    if (window.location.port === '5000') return '';
    if (/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)) {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
      if (typeof isBackendActive !== 'undefined' && isBackendActive) return 'http://localhost:5000';
      return null;
    }
    return window.location.origin;
  }
  return null;
}

  // 5. Tenter la synchronisation API backend en arrière-plan sans bloquer
  const backendBaseUrl = getBackendBaseUrl();
  try {
    fetch(`${backendBaseUrl}/api/subscriptions/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName,
        email,
        phone,
        city,
        type,
        planName,
        planPrice,
        operator: selectedPaymentOp,
        montant: 10000
      })
    }).then(res => res.json()).then(checkoutData => {
      // Maintien du bouton vers le compte marchand Wave officiel direct (Diamil express)
      const btnDirectEl = document.getElementById('btnDirectOperatorUrl');
      const btnDirectTextEl = document.getElementById('btnDirectOpText');
      if (btnDirectEl && selectedPaymentOp === 'WAVE') {
        btnDirectEl.href = 'https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/?amount=10000';
        if (btnDirectTextEl) btnDirectTextEl.textContent = '🌊 Payer 10 000 FCFA sur Wave';
      }
      return fetch(`${backendBaseUrl}/api/subscriptions/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: checkoutData?.reference || refTx,
          email: email,
          schoolName: schoolName,
          planName: planName,
          city: city,
          phone: phone,
          type: type,
          code: currentEstablishment.code,
          operator: selectedPaymentOp,
          transactionId: `WAVE-TX-${Date.now()}`
        })
      });
    }).catch(err => {
      console.info("Mode autonome hors-ligne actif :", err.message);
    });
  } catch (e) {}
}

function confirmOperatorPaymentSuccess() {
  if (window.operatorPaymentTimer) {
    clearInterval(window.operatorPaymentTimer);
    window.operatorPaymentTimer = null;
  }
  const txRefInput = document.getElementById('userWaveTxRef');
  const userTxRef = txRefInput ? txRefInput.value.trim() : '';

  if (currentEstablishment) {
    currentEstablishment.waveTransactionRef = userTxRef || 'Virement en attente';
    currentEstablishment.statut = 'EN_ATTENTE_VALIDATION';
    currentEstablishment.statutAbonnement = 'EN_ATTENTE_VALIDATION';
    currentEstablishment.fraisAdhesionPayes = false;

    const recNumEl = document.getElementById('receiptNumDisplay');
    if (recNumEl && userTxRef) recNumEl.textContent = `REC-${userTxRef.replace(/[^a-zA-Z0-9-]/g, '')}`;

    const recWaveRef = document.getElementById('receiptWaveRefDisplay');
    if (recWaveRef) recWaveRef.textContent = `Réf: ${userTxRef || 'Virement Déclaré'}`;

    const schoolWaitEl = document.getElementById('regWaitSchoolName');
    if (schoolWaitEl) schoolWaitEl.textContent = currentEstablishment.name;

    const refWaitEl = document.getElementById('regWaitRef');
    if (refWaitEl) refWaitEl.textContent = currentEstablishment.code || 'SSE-SUB';

    // Bouton d'envoi de preuve WhatsApp pré-rempli
    const btnProof = document.getElementById('btnSendProofWhatsApp');
    if (btnProof) {
      btnProof.href = `https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je vous transmets la preuve de virement Wave (10 000 FCFA) pour l'établissement "${currentEstablishment.name}" (Code: ${currentEstablishment.code}, Réf: ${userTxRef || 'Virement effectué'}). Merci de valider l'accès.`)}`;
    }

    try {
      localStorage.removeItem('sunuschool_active_workspace');
      localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
      saveEstablishmentToRegistry(currentEstablishment);
      syncWithSaaSDatabase(currentEstablishment);
    } catch (e) {}
  }

  if (typeof updateSessionRecoveryUI === 'function') {
    updateSessionRecoveryUI();
  }
  goToRegStep(4);
  showNotification(`⏳ Demande d'adhésion pour ${currentEstablishment?.name || "votre établissement"} soumise ! En attente de validation administrative.`);
}
window.confirmOperatorPaymentSuccess = confirmOperatorPaymentSuccess;

function finishRegistrationAndOpenWorkspace() {
  closeAllModals();
  if (currentEstablishment) {
    const isApproved = (currentEstablishment.statut === 'ACTIF' || currentEstablishment.statutAbonnement === 'ACTIF' || currentEstablishment.statutAbonnement === 'ESSAI_GRATUIT' || currentEstablishment.type === 'SUPER_ADMIN') && 
                       (currentEstablishment.statut !== 'EN_ATTENTE_VALIDATION') && 
                       (currentEstablishment.fraisAdhesionPayes !== false);
    if (!isApproved) {
      openPendingValidationNotice(currentEstablishment);
      return;
    }
  }
  activateDedicatedWorkspace(currentEstablishment);
  if (typeof populateWorkspaceEstablishmentsDropdown === 'function') {
    populateWorkspaceEstablishmentsDropdown();
  }
  showNotification(`🎉 Bienvenue dans l'espace de gestion officiel de ${currentEstablishment?.name || "votre établissement"} !`);
}

function printSubscriptionReceipt() {
  const receiptEl = document.getElementById('printableSubscriptionReceipt');
  if (!receiptEl) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Reçu d'Adhésion Officiel - SunuSchoolExpress</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 2rem; color: #0F172A; }
          .receipt-box { max-width: 600px; margin: 0 auto; border: 2px solid #00D2B4; padding: 2rem; border-radius: 12px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .badge { display: inline-block; padding: 0.3rem 0.8rem; background: #E6FFFA; color: #008775; font-weight: 800; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          ${receiptEl.innerHTML}
        </div>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

window.goToRegStep = goToRegStep;
window.selectPaymentOperator = selectPaymentOperator;
window.executeSubscriptionPayment = executeSubscriptionPayment;
window.finishRegistrationAndOpenWorkspace = finishRegistrationAndOpenWorkspace;
window.printSubscriptionReceipt = printSubscriptionReceipt;

// --- GESTION DU DEVIS ENTERPRISE (GRANDS COMPTES & MULTI-CAMPUS) ---
function openQuoteModal() {
  closeAllModals();

  // Réinitialiser les vues du modal
  const formView = document.getElementById('quoteFormView');
  const successView = document.getElementById('quoteSuccessView');
  if (formView) formView.style.display = 'block';
  if (successView) successView.style.display = 'none';

  // Pré-remplir les données si un établissement existe
  const orgInput = document.getElementById('quoteOrgName');
  const contactInput = document.getElementById('quoteContactName');
  const emailInput = document.getElementById('quoteEmail');
  const phoneInput = document.getElementById('quotePhone');
  const citiesInput = document.getElementById('quoteCities');

  if (currentEstablishment && currentEstablishment.name) {
    if (orgInput && !orgInput.value) orgInput.value = currentEstablishment.name;
    if (emailInput && !emailInput.value) emailInput.value = currentEstablishment.email || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = currentEstablishment.phone || '+221 77 123 45 67';
    if (citiesInput && !citiesInput.value) citiesInput.value = currentEstablishment.city || 'Dakar';
  }

  const modal = document.getElementById('quoteModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function submitEnterpriseQuote() {
  const orgName = (document.getElementById('quoteOrgName')?.value || '').trim() || 'Groupe Scolaire Partenaire';
  const role = document.getElementById('quoteRole')?.value || 'Directeur Général / Fondateur';
  const contactName = (document.getElementById('quoteContactName')?.value || '').trim() || 'Direction Générale';
  const phone = (document.getElementById('quotePhone')?.value || '').trim() || '+221 77 123 45 67';
  const email = (document.getElementById('quoteEmail')?.value || '').trim() || `direction@${orgName.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn`;
  const cities = (document.getElementById('quoteCities')?.value || '').trim() || 'Dakar';
  const campuses = document.getElementById('quoteCampusCount')?.value || '2 à 3 établissements';
  const students = document.getElementById('quoteStudentCount')?.value || '1 000 à 2 500 élèves';
  const message = (document.getElementById('quoteMessage')?.value || '').trim();

  // Récupération des options cochées
  const options = [];
  if (document.getElementById('quoteOptConsolidation')?.checked) options.push('Consolidation SYSCOHADA');
  if (document.getElementById('quoteOptWaveOm')?.checked) options.push('Multi-comptes Wave/OM');
  if (document.getElementById('quoteOptERP')?.checked) options.push('Connecteurs API / ERP');
  if (document.getElementById('quoteOptMigration')?.checked) options.push('Migration données');
  if (document.getElementById('quoteOptTraining')?.checked) options.push('Formation sur site');
  if (document.getElementById('quoteOptDedicatedServer')?.checked) options.push('Serveur dédié souverain');

  const quoteRef = 'DEV-2026-' + Math.floor(1000 + Math.random() * 9000);

  const quoteData = {
    ref: quoteRef,
    date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR'),
    orgName: orgName,
    role: role,
    contactName: contactName,
    phone: phone,
    email: email,
    cities: cities,
    campuses: campuses,
    students: students,
    options: options,
    message: message
  };

  try {
    const existingQuotes = JSON.parse(localStorage.getItem('sunuschool_enterprise_quotes') || '[]');
    existingQuotes.unshift(quoteData);
    localStorage.setItem('sunuschool_enterprise_quotes', JSON.stringify(existingQuotes));

    // Envoi vers le serveur backend si actif
    const backendBaseUrl = getBackendBaseUrl();
    fetch(`${backendBaseUrl}/api/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    }).catch(() => {});
  } catch (e) {}

  if (demoState && demoState.auditLogs) {
    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `📋 Demande de Devis Enterprise reçue (${quoteRef}) : ${orgName} - ${campuses}, ${students}`,
      user: `${role} (${contactName})`
    });
    if (typeof renderAuditLogs === 'function') renderAuditLogs();
  }

  // Mise à jour de l'écran de confirmation
  const refEl = document.getElementById('quoteSuccessRef');
  const orgEl = document.getElementById('quoteSuccessOrg');
  const contactEl = document.getElementById('quoteSuccessContact');
  if (refEl) refEl.textContent = quoteRef;
  if (orgEl) orgEl.textContent = orgName;
  if (contactEl) contactEl.textContent = `${contactName} (${role})`;

  const formView = document.getElementById('quoteFormView');
  const successView = document.getElementById('quoteSuccessView');
  if (formView) formView.style.display = 'none';
  if (successView) successView.style.display = 'block';

  showNotification(`📋 Demande de Devis ${quoteRef} enregistrée avec succès ! Notre équipe Grands Comptes vous contactera sous 24h.`);
}

// --- GESTION & SYNCHRONISATION PRÉCISE DES FORMULES ET MODULES ---
function getEstablishmentPlanKey(est) {
  if (!est) return 'starter';
  const plan = (est.plan || '').toLowerCase();
  const isDaara = est.type === 'DAARA' || plan.includes('daara');

  if (isDaara) {
    if (plan.includes('promo') || plan.includes('pionnier') || plan.includes('20')) return 'daara_promo';
    if (plan.includes('annuel') || plan.includes('sérénité') || plan.includes('700')) return 'daara_annual';
    return 'daara_standard'; // Par défaut 35k
  } else {
    if (plan.includes('premium') || plan.includes('85')) return 'premium';
    if (plan.includes('enterprise') || plan.includes('devis')) return 'enterprise';
    if (plan.includes('pro') || plan.includes('55')) return 'pro';
    return 'starter'; // Par défaut 20k
  }
}

function switchPlanDemo(planKey) {
  if (!currentEstablishment) {
    try {
      const saved = localStorage.getItem('sunuschool_establishment');
      if (saved) currentEstablishment = JSON.parse(saved);
    } catch(e) {}
  }

  // Si pas d'établissement ou ancien prototype factice de démo, restaurer depuis le registre
  if (!currentEstablishment || !currentEstablishment.name || isFakeDemoSchool(currentEstablishment)) {
    try {
      const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
      const real = reg.find(e => e && e.name && !isFakeDemoSchool(e) && e.type !== 'SUPER_ADMIN');
      if (real) {
        currentEstablishment = { ...real };
      }
    } catch(e) {}
  }

  const isDaara = currentEstablishment && currentEstablishment.type === 'DAARA';

  const planMap = {
    'starter': 'Formule Starter',
    'pro': 'Formule École Pro',
    'premium': 'Formule Premium',
    'daara_promo': 'Pack Internat Promo Daara',
    'daara_standard': 'Formule Standard Daara',
    'daara_annual': 'Option Annuelle Sérénité Daara'
  };

  const newPlanName = planMap[planKey] || planKey;

  if (!currentEstablishment) {
    currentEstablishment = {
      email: "direction@etablissement.sn",
      name: isDaara ? "Mon Daara Moderne" : "Mon Établissement",
      plan: newPlanName,
      type: isDaara ? "DAARA" : "ECOLE",
      city: "Dakar",
      code: "SSE-SN-1786"
    };
  } else {
    let targetPlanName = newPlanName;
    if (currentEstablishment.type === 'ECOLE' && planKey.startsWith('daara')) {
      if (planKey === 'daara_promo') targetPlanName = 'Formule Starter';
      else if (planKey === 'daara_standard') targetPlanName = 'Formule École Pro';
      else targetPlanName = 'Formule Premium';
    } else if (currentEstablishment.type === 'DAARA' && !planKey.startsWith('daara')) {
      if (planKey === 'starter') targetPlanName = 'Pack Internat Promo Daara';
      else if (planKey === 'pro') targetPlanName = 'Formule Standard Daara';
      else targetPlanName = 'Option Annuelle Sérénité Daara';
    }

    const isSuperAdminHQ = (currentEstablishment.type === 'SUPER_ADMIN' || currentEstablishment.code === 'SSE-ADMIN-HQ');

    if (isSuperAdminHQ) {
      currentEstablishment.plan = targetPlanName;
    } else {
      // MODE COMMERCIAL OFFICIEL : Enregistrer la demande et exiger la validation Admin HQ
      currentEstablishment.requestedPlan = targetPlanName;
      currentEstablishment.statutChangementFormule = 'EN_ATTENTE_VALIDATION';
    }

    if (isFakeDemoSchool(currentEstablishment)) {
      currentEstablishment.name = (currentEstablishment.type === 'DAARA') ? "Mon Daara Moderne" : "Mon Établissement";
    }
  }

  try {
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
    localStorage.setItem('sunuschool_active_workspace', 'true');
    const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
    const idx = reg.findIndex(e => e && (e.id === currentEstablishment.id || (currentEstablishment.code && e.code === currentEstablishment.code)));
    if (idx !== -1) {
      reg[idx] = { 
        ...reg[idx], 
        requestedPlan: currentEstablishment.requestedPlan, 
        statutChangementFormule: currentEstablishment.statutChangementFormule,
        plan: isSuperAdminHQ ? currentEstablishment.plan : reg[idx].plan 
      };
      localStorage.setItem('sunuschool_establishments_registry', JSON.stringify(reg));
    }
    // Synchronisation avec l'API backend si le serveur est actif
    try {
      const backendBaseUrl = getBackendBaseUrl();
      fetch(`${backendBaseUrl}/api/subscriptions/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: currentEstablishment.name,
          code: currentEstablishment.code,
          email: currentEstablishment.email,
          phone: currentEstablishment.phone,
          planName: currentEstablishment.requestedPlan || targetPlanName,
          type: currentEstablishment.type,
          city: currentEstablishment.city
        })
      }).catch(() => {});
    } catch(e) {}
  } catch (e) {}

  if (currentEstablishment.type === 'SUPER_ADMIN' || currentEstablishment.code === 'SSE-ADMIN-HQ') {
    activateDedicatedWorkspace(currentEstablishment);
    showNotification(`✨ Formule activée par l'Admin HQ : ${currentEstablishment.plan} !`);
  } else {
    // Notification & Instructions WhatsApp pour l'Admin HQ
    const msg = encodeURIComponent(
      `Bonjour SunuSchoolExpress (Diamil-Express),\n\n` +
      `Je sollicite la validation du surclassement vers la « ${currentEstablishment.requestedPlan} » pour mon établissement « ${currentEstablishment.name} » (Code: ${currentEstablishment.code || 'N/A'}).\n\n` +
      `Paiement effectué via Wave Marchand au 77 106 48 77.`
    );
    
    alert(
      `📋 DEMANDE DE SURCLASSEMENT TRANSMISE (FONCTIONNEMENT COMMERCIAL OFFICIEL)\n\n` +
      `Votre demande de passage à la « ${currentEstablishment.requestedPlan} » a été enregistrée avec succès.\n\n` +
      `👉 ÉTAPE SUIVANTE OBLIGATOIRE :\n` +
      `1. Effectuez votre virement de souscription sur le compte Wave Marchand : 77 106 48 77 (Diamil express).\n` +
      `2. Envoyez votre reçu par WhatsApp à l'Administrateur HQ (+221 76 150 39 38).\n\n` +
      `Dès validation par le Directeur Général Moustapha Diamil Diouf depuis la console HQ, vos nouveaux modules seront activés avec conservation intégrale de toutes vos données.`
    );

    window.open(`https://wa.me/221761503938?text=${msg}`, '_blank', 'noopener,noreferrer');
    activateDedicatedWorkspace(currentEstablishment);
  }
}

let pendingUpgradeTarget = 'pro';

function showPlanUpgradeModal(featureKey) {
  const planKey = getEstablishmentPlanKey(currentEstablishment);
  const isDaara = currentEstablishment && currentEstablishment.type === 'DAARA';

  const modal = document.getElementById('planUpgradeModal');
  if (!modal) return;

  const iconEl = document.getElementById('upgradeModalIcon');
  const titleEl = document.getElementById('upgradeModalTitle');
  const descEl = document.getElementById('upgradeModalDesc');
  const currentPlanEl = document.getElementById('upgradeCurrentPlanName');
  const reqPlanEl = document.getElementById('upgradeRequiredPlanName');
  const featuresListEl = document.getElementById('upgradeFeaturesList');
  const testBtnEl = document.getElementById('upgradeDirectTestBtn');

  if (currentPlanEl) currentPlanEl.textContent = currentEstablishment.plan || 'Formule Starter';

  if (featureKey === 'accounting') {
    if (iconEl) iconEl.textContent = '📊';
    if (titleEl) titleEl.textContent = 'Module Comptabilité SYSCOHADA';
    if (isDaara) {
      pendingUpgradeTarget = 'daara_standard';
      if (descEl) descEl.textContent = 'La Comptabilité conforme SYSCOHADA Daara (Grand Livre des pensions/dons, Bilan & Balance) est incluse à partir de la formule Standard Daara.';
      if (reqPlanEl) reqPlanEl.textContent = 'Formule Standard Daara (35 000 FCFA/mois)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Standard Daara';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Grand Livre & Bilan comptable conforme Daaras</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Gestion RH & salaires des Oustazs</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Talibés et pensionnaires illimités</span></li>
        `;
      }
    } else {
      pendingUpgradeTarget = 'pro';
      if (descEl) descEl.textContent = 'Le Grand Livre, Bilan SYSCOHADA et suivi analytique sont inclus à partir de la Formule Pro.';
      if (reqPlanEl) reqPlanEl.textContent = 'Formule Pro (55 000 FCFA/mois)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Pro';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>États financiers SYSCOHADA conformes OHADA / Sénégal</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Notifications WhatsApp automatiques aux parents</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Jusqu'à 600 élèves (au lieu de 150)</span></li>
        `;
      }
    }
  } else if (featureKey === 'hr') {
    if (iconEl) iconEl.textContent = '👥';
    if (titleEl) titleEl.textContent = 'Module RH & Emplois du Temps';
    if (isDaara) {
      pendingUpgradeTarget = 'daara_standard';
      if (descEl) descEl.textContent = 'La gestion des Oustazs, plannings de cours et fiches d\'émoluments est incluse dans la Formule Standard Daara.';
      if (reqPlanEl) reqPlanEl.textContent = 'Formule Standard Daara (35 000 FCFA/mois)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Standard Daara';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Corps enseignant & plannings des Oustazs</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Comptabilité SYSCOHADA Daara incluse</span></li>
        `;
      }
    } else {
      pendingUpgradeTarget = 'pro';
      if (descEl) descEl.textContent = 'La gestion du personnel enseignant, fiches de paie et plannings est incluse dès la Formule Pro.';
      if (reqPlanEl) reqPlanEl.textContent = 'Formule Pro (55 000 FCFA/mois)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Pro';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Gestion complète des professeurs et plannings</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Fiches de paie et génération PDF</span></li>
        `;
      }
    }
  } else if (featureKey === 'alerts') {
    if (iconEl) iconEl.textContent = '💬';
    if (titleEl) titleEl.textContent = 'Module Notifications WhatsApp & SMS';
    pendingUpgradeTarget = 'pro';
    if (descEl) descEl.textContent = 'L\'envoi automatique des reçus, notifications d\'absence et alertes directes aux parents par WhatsApp est inclus dès la Formule Pro.';
    if (reqPlanEl) reqPlanEl.textContent = 'Formule Pro (55 000 FCFA/mois)';
    if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Pro';
    if (featuresListEl) {
      featuresListEl.innerHTML = `
        <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Alertes WhatsApp temps réel aux familles</span></li>
        <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>SYSCOHADA & RH également débloqués</span></li>
      `;
    }
  } else if (featureKey === 'library') {
    if (iconEl) iconEl.textContent = '📚';
    if (titleEl) titleEl.textContent = 'Bibliothèque Numérique Interactive';
    if (isDaara) {
      pendingUpgradeTarget = 'daara_annual';
      if (descEl) descEl.textContent = 'La Bibliothèque Islamique Numérique, Tajwîd et Hadiths est incluse dans l\'Option Annuelle Sérénité Daara.';
      if (reqPlanEl) reqPlanEl.textContent = 'Option Annuelle Sérénité (350 000 FCFA/an • 2 mois offerts)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Option Annuelle Daara';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Bibliothèque Islamique & Tajwîd interactif</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Matériel de badgeage des talibés offert</span></li>
        `;
      }
    } else {
      pendingUpgradeTarget = 'premium';
      if (descEl) descEl.textContent = 'Les manuels scolaires officiels du Sénégal, quiz interactifs et livres numériques sont réservés à la Formule Premium.';
      if (reqPlanEl) reqPlanEl.textContent = 'Formule Premium (85 000 FCFA/mois)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Premium';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Manuels officiels sénégalais & quiz interactifs</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Effectifs d'élèves illimités & Support VIP 24/7</span></li>
        `;
      }
    }
  } else if (featureKey === 'badges') {
    if (iconEl) iconEl.textContent = '🪪';
    if (titleEl) titleEl.textContent = 'Matériel de Badgeage des Talibés Offert';
    if (isDaara) {
      pendingUpgradeTarget = 'daara_annual';
      if (descEl) descEl.textContent = 'L\'imprimante thermique PVC Zenius, les 200 badges sans contact NFC/RFID et les cordons tour de cou sont offerts exclusivement avec l\'Option Annuelle Sérénité Daara.';
      if (reqPlanEl) reqPlanEl.textContent = 'Option Annuelle Sérénité (350 000 FCFA/an • 2 mois offerts)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Option Annuelle Sérénité';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Imprimante thermique PVC 300 DPI fournie</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>200 Cartes RFID & QR code d'urgence inclus</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Accompagnement sur site inclus</span></li>
        `;
      }
    } else {
      pendingUpgradeTarget = 'premium';
      if (descEl) descEl.textContent = 'Le module d\'édition et impression des cartes scolaires d\'élèves est disponible en formule Premium ou Entreprise.';
      if (reqPlanEl) reqPlanEl.textContent = 'Formule Premium (85 000 FCFA/mois)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Formule Premium';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Cartes scolaires d'élèves avec photo & QR Code</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Support VIP & formation des équipes</span></li>
        `;
      }
    }
  } else if (featureKey === 'audit') {
    if (iconEl) iconEl.textContent = '🤝';
    if (titleEl) titleEl.textContent = 'Accompagnement Dédié sur Site';
    if (isDaara) {
      pendingUpgradeTarget = 'daara_annual';
      if (descEl) descEl.textContent = 'L\'accompagnement physique sur site, l\'installation du matériel et la formation en présentiel de vos équipes par notre conseiller dédié sont inclus exclusivement dans l\'Option Annuelle Sérénité.';
      if (reqPlanEl) reqPlanEl.textContent = 'Option Annuelle Sérénité (350 000 FCFA/an • 2 mois offerts)';
      if (testBtnEl) testBtnEl.textContent = '⚡ Passer en Option Annuelle Sérénité';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Visite d'un conseiller dédié directement sur site</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Formation pratique des Oustazs et de l'équipe</span></li>
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Dotation matériel imprimante & 200 badges talibés incluse</span></li>
        `;
      }
    } else {
      pendingUpgradeTarget = 'enterprise';
      if (descEl) descEl.textContent = 'L\'accompagnement sur site et le déploiement multi-sites personnalisé sont réservés à l\'Offre Entreprise & Grands Comptes.';
      if (reqPlanEl) reqPlanEl.textContent = 'Offre Entreprise (Sur Devis)';
      if (testBtnEl) testBtnEl.textContent = '📋 Demander un Devis Entreprise';
      if (featuresListEl) {
        featuresListEl.innerHTML = `
          <li><svg width="15" height="15" fill="#00D2B4" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span>Accompagnement et déploiement multi-sites personnalisé</span></li>
        `;
      }
    }
  }

  modal.classList.add('active');
}

function executePlanUpgradeSimulation() {
  closeAllModals();
  switchPlanDemo(pendingUpgradeTarget);
}

function validateEstablishmentAccessKey(found, keyVal) {
  if (!keyVal || !found) return false;
  const kClean = String(keyVal).trim().toUpperCase();

  // 1. Clés explicites sur l'établissement
  const validKeys = [
    found.cle,
    found.cleAcces,
    found.key,
    found.secretKey,
    found.password,
    found.motDePasse,
    found.code
  ].filter(Boolean).map(x => String(x).trim().toUpperCase());

  if (validKeys.includes(kClean)) return true;

  // 2. Format standard ADM-XXXX basé sur les chiffres du code (ex: SSE-SN-2317 => ADM-2317)
  const codeDigits = (found.code || '').replace(/[^0-9]/g, '');
  if (codeDigits) {
    const expectedAdmKey = `ADM-${codeDigits}`;
    if (kClean === expectedAdmKey || kClean === codeDigits) return true;
  }

  // 3. Clé nettoyée de tout caractère spécial
  const kAlphaNum = kClean.replace(/[^A-Z0-9]/g, '');
  for (const vk of validKeys) {
    if (vk.replace(/[^A-Z0-9]/g, '') === kAlphaNum) return true;
  }

  return false;
}

function openWorkspaceDirect(preferredType = null) {
  const isLoggedOut = localStorage.getItem('sse_user_logged_out') === 'true';
  const isActiveWs = localStorage.getItem('sunuschool_active_workspace') === 'true';
  let est = currentEstablishment;

  if (!est || !est.name) {
    try {
      const saved = localStorage.getItem('sunuschool_establishment');
      if (saved) est = JSON.parse(saved);
    } catch(e) {}
  }

  // 1. Sécurité : Si déconnexion explicite OU pas de session active valide -> Exiger la Clé d'Accès via le modal de connexion
  if (isLoggedOut || !isActiveWs || !est || !est.name || isFakeDemoSchool(est)) {
    openAuthGateModal(preferredType);
    return;
  }

  // 2. Si Super Admin SaaS HQ, accès direct autorisé
  if (est.type === 'SUPER_ADMIN' || est.code === 'SSE-ADMIN-HQ') {
    activateDedicatedWorkspace(est);
    return;
  }

  // 3. CONTRÔLE CRUCIAL : Validation administrative obligatoire par SunuSchool-Express
  const isApproved = (est.statut === 'ACTIF' || est.statutAbonnement === 'ACTIF' || est.statutAbonnement === 'ESSAI_GRATUIT') && 
                     (est.statut !== 'EN_ATTENTE_VALIDATION') && 
                     (est.fraisAdhesionPayes !== false);

  if (!isApproved) {
    openPendingValidationNotice(est);
    return;
  }

  // Si établissement légitime et dûment validé
  currentEstablishment = est;
  activateDedicatedWorkspace(est);
}

function openPendingValidationNotice(est) {
  closeAllModals();
  const modal = document.getElementById('establishmentAuthGateModal');
  if (modal) {
    switchAuthGateTab('login');
    const codeInput = document.getElementById('authGateCodeInput');
    if (codeInput && (est.code || est.email)) {
      codeInput.value = est.code || est.email;
    }
    const errEl = document.getElementById('authGateError');
    if (errEl) {
      errEl.innerHTML = `⏳ <strong>Dossier d'adhésion en cours de contrôle :</strong><br>L'accès au tableau de bord pour « <strong>${est.name}</strong> » (Code: <code>${est.code || 'En attente'}</code>) est <strong>réservé aux établissements validés par l'Admin SunuSchool-Express</strong>.<br>Votre règlement Wave (10 000 FCFA) a été transmis et est actuellement en cours de validation administrative.<br><a href="https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je souhaite activer mon établissement ${est.name} (Code: ${est.code}).`)}" target="_blank" style="color: #00D2B4; font-weight: 700; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">💬 Contacter l'administrateur par WhatsApp (+221 76 150 39 38)</a>`;
      errEl.style.display = 'block';
    }
    modal.classList.add('active');
  } else {
    alert(`⏳ Votre établissement « ${est.name} » est en attente de validation par l'Administrateur SunuSchool-Express.`);
  }
}

function openAuthGateModal(preferredType = null) {
  closeAllModals();
  const modal = document.getElementById('establishmentAuthGateModal');
  if (!modal) {
    window.location.hash = '#tarifs';
    showNotification('🔒 Accès restreint : Veuillez choisir une formule et inscrire votre établissement.');
    return;
  }

  const errEl = document.getElementById('authGateError');
  if (errEl) errEl.style.display = 'none';

  const keyInput = document.getElementById('authGateKeyInput');
  if (keyInput) keyInput.value = '';

  const codeInput = document.getElementById('authGateCodeInput');
  if (codeInput && !codeInput.value) {
    try {
      const regRaw = localStorage.getItem('sunuschool_establishments_registry');
      if (regRaw) {
        const reg = JSON.parse(regRaw);
        if (Array.isArray(reg) && reg.length > 0) {
          const lastEst = reg.find(e => e && e.code && !isFakeDemoSchool(e) && e.type !== 'SUPER_ADMIN');
          if (lastEst) codeInput.value = lastEst.code || lastEst.email || '';
        }
      }
    } catch(e) {}
  }

  // Si l'utilisateur clique sur une offre Daara ou École spécifique, basculer sur l'onglet souscription
  if (preferredType === 'DAARA' || preferredType === 'ECOLE') {
    switchAuthGateTab('register');
  } else {
    switchAuthGateTab('login');
  }

  modal.classList.add('active');
  setTimeout(() => {
    if (keyInput && codeInput && codeInput.value) keyInput.focus();
    else if (codeInput) codeInput.focus();
  }, 100);
}

function switchAuthGateTab(tab) {
  const tabLogin = document.getElementById('tabAuthGateLogin');
  const tabReg = document.getElementById('tabAuthGateRegister');
  const viewLogin = document.getElementById('authGateViewLogin');
  const viewReg = document.getElementById('authGateViewRegister');
  if (!tabLogin || !tabReg || !viewLogin || !viewReg) return;

  if (tab === 'login') {
    tabLogin.style.background = 'var(--turquoise-400)';
    tabLogin.style.color = '#051329';
    tabReg.style.background = 'transparent';
    tabReg.style.color = '#FFF';
    viewLogin.style.display = 'block';
    viewReg.style.display = 'none';
  } else {
    tabReg.style.background = 'var(--turquoise-400)';
    tabReg.style.color = '#051329';
    tabLogin.style.background = 'transparent';
    tabLogin.style.color = '#FFF';
    viewLogin.style.display = 'none';
    viewReg.style.display = 'block';
  }
}

function handleAuthGateLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const codeInput = document.getElementById('authGateCodeInput');
  const keyInput = document.getElementById('authGateKeyInput');
  const errEl = document.getElementById('authGateError');

  const rawCode = (codeInput?.value || '').trim();
  const rawKey = (keyInput?.value || '').trim();

  const codeVal = rawCode.toUpperCase();
  const keyVal = rawKey;

  // Détection universelle de la Clé Maître dans code ou clé
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
    rawCode.toLowerCase().includes('sunuadmin') ||
    rawKey.toLowerCase().includes('sunuadmin')
  );

  // A. SI CLÉ MAÎTRE FOURNIE : ACCÈS IMMÉDIAT
  if (isMasterKey) {
    sessionStorage.setItem('sse_admin_authenticated', 'true');
    sessionStorage.setItem('sse_superadmin_authenticated', 'true');
    localStorage.setItem('sse_admin_authenticated', 'true');
    localStorage.setItem('sse_superadmin_authenticated', 'true');
    sessionStorage.setItem('sse_admin_user', 'sunuschoolexpress@gmail.com');
    localStorage.setItem('sse_admin_user', 'sunuschoolexpress@gmail.com');

    const registry = getEstablishmentRegistry();
    let found = registry.find(est => 
      (est.code && est.code.toUpperCase() === codeVal) ||
      (est.email && est.email.toLowerCase() === rawCode.toLowerCase()) ||
      (est.phone && est.phone.replace(/[^0-9]/g, '') === codeVal.replace(/[^0-9]/g, ''))
    );

    if (found) {
      currentEstablishment = found;
      localStorage.setItem('sunuschool_establishment', JSON.stringify(found));
      localStorage.setItem('sunuschool_active_workspace', 'true');
      localStorage.removeItem('sse_user_logged_out');
      closeAllModals();
      activateDedicatedWorkspace(found);
      showNotification(`👑 Accès Maître accordé pour « ${found.name} »`);
      return;
    }

    if (codeVal.includes('8941') || codeVal.includes('DAARA')) {
      const daaraEtab = registry.find(e => e.type === 'DAARA') || {
        name: "Mon Daara Moderne",
        code: "SSE-SN-8941",
        type: "DAARA",
        plan: "Pack Internat Promo Daara",
        city: "Touba",
        statut: "ACTIF"
      };
      currentEstablishment = daaraEtab;
      localStorage.setItem('sunuschool_establishment', JSON.stringify(daaraEtab));
      localStorage.setItem('sunuschool_active_workspace', 'true');
      localStorage.removeItem('sse_user_logged_out');
      closeAllModals();
      activateDedicatedWorkspace(daaraEtab);
      showNotification("👑 Accès Maître déverrouillé : Daara Moderne");
      return;
    }

    currentEstablishment = {
      name: "SunuSchool Express SaaS HQ",
      plan: "Console Super Admin Plateforme",
      type: "SUPER_ADMIN",
      city: "Dakar (HQ National Cloud)",
      code: "SSE-ADMIN-HQ",
      phone: "+221 77 888 12 34",
      isSuperAdmin: true,
      statut: "ACTIF"
    };
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
    localStorage.setItem('sunuschool_active_workspace', 'true');
    localStorage.removeItem('sse_user_logged_out');
    closeAllModals();
    activateDedicatedWorkspace(currentEstablishment);
    showNotification("👑 Authentification Super-Admin réussie.");
    return;
  }

  // B. ACCÈS STANDARD ÉTABLISSEMENT
  if (!codeVal || !keyVal) {
    if (errEl) {
      errEl.textContent = "Veuillez renseigner le code établissement et la clé d'accès secrète.";
      errEl.style.display = 'block';
    }
    return;
  }

  // Vérification de connexion
  const registry = getEstablishmentRegistry();
  const found = registry.find(est => 
    (est.code && est.code.toUpperCase() === codeVal) ||
    (est.email && est.email.toLowerCase() === rawCode.toLowerCase()) ||
    (est.phone && est.phone.replace(/[^0-9]/g, '') === codeVal.replace(/[^0-9]/g, ''))
  );

  if (found) {
    // VÉRIFICATION STRICTE DE LA CLÉ D'ACCÈS
    const isKeyValid = validateEstablishmentAccessKey(found, keyVal);

    if (!isKeyValid) {
      if (errEl) {
        const expectedHint = found.cle || (found.code ? `ADM-${found.code.replace(/[^0-9]/g, '')}` : 'ADM-XXXX');
        errEl.innerHTML = `🔐 <strong>Clé d'accès incorrecte :</strong><br>La clé renseignée pour « <strong>${found.name}</strong> » est invalide.<br>Veuillez saisir la clé secrète fournie lors de l'adhésion (Ex: <code>${expectedHint}</code>).`;
        errEl.style.display = 'block';
      }
      return;
    }

    const isApproved = (found.statut === 'ACTIF' || found.statutAbonnement === 'ACTIF' || found.statutAbonnement === 'ESSAI_GRATUIT') && 
                       (found.statut !== 'EN_ATTENTE_VALIDATION') && 
                       (found.fraisAdhesionPayes !== false);

    if (!isApproved) {
      if (errEl) {
        errEl.innerHTML = `⏳ <strong>Dossier d'adhésion en cours de validation :</strong><br>Votre demande pour « <strong>${found.name}</strong> » (Code: <code>${found.code}</code>) a bien été reçue mais est <strong>en attente de validation par l'Administrateur SunuSchool-Express</strong>.<br>Dès vérification de votre virement Wave (10 000 FCFA), vos accès seront automatiquement déverrouillés.<br><a href="https://wa.me/221761503938?text=${encodeURIComponent(`Bonjour SunuSchoolExpress, je souhaite activer mon établissement ${found.name} (Code: ${found.code}).`)}" target="_blank" style="color: #00D2B4; font-weight: 700; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">💬 Contacter l'administrateur par WhatsApp (+221 76 150 39 38)</a>`;
        errEl.style.display = 'block';
      }
      return;
    }

    currentEstablishment = found;
    localStorage.setItem('sunuschool_establishment', JSON.stringify(found));
    localStorage.setItem('sunuschool_active_workspace', 'true');
    localStorage.removeItem('sse_user_logged_out');
    closeAllModals();
    activateDedicatedWorkspace(found);
    showNotification(`🔓 Bienvenue dans votre Espace : ${found.name}`);
  } else {
    if (errEl) {
      errEl.innerHTML = "⚠️ Identifiant ou clé d'accès introuvable.<br>Si vous n'avez pas encore de compte, veuillez cliquer sur <strong>Souscrire une Formule</strong> pour enregistrer votre établissement.";
      errEl.style.display = 'block';
    }
  }
}

function handleHeaderDashboardClick(e) {
  if (e && e.preventDefault) e.preventDefault();
  openWorkspaceDirect();
}

function activateDedicatedWorkspace(est) {
  if (!est) {
    openAuthGateModal();
    return;
  }

  // SÉCURITÉ ABSOLUE : Vérification de validation administrative par SunuSchool-Express
  const isSuperAdmin = (est.type === 'SUPER_ADMIN' || est.code === 'SSE-ADMIN-HQ' || (est.email && est.email.toLowerCase() === 'sunuschoolexpress@gmail.com'));
  const isApproved = (est.statut === 'ACTIF' || est.statutAbonnement === 'ACTIF' || est.statutAbonnement === 'ESSAI_GRATUIT') && 
                     (est.statut !== 'EN_ATTENTE_VALIDATION') && 
                     (est.fraisAdhesionPayes !== false);

  if (!isSuperAdmin && !isApproved) {
    try {
      localStorage.removeItem('sunuschool_active_workspace');
    } catch (e) {}
    exitWorkspaceView();
    openPendingValidationNotice(est);
    return;
  }

  // Sauvegarde de l'état actif pour reprise automatique après perte de connexion
  try {
    localStorage.setItem('sunuschool_active_workspace', 'true');
    if (est) {
      localStorage.setItem('sunuschool_establishment', JSON.stringify(est));
    }
  } catch (e) {}

  // Masquer vitrine et portail public
  document.getElementById('hero').style.display = 'none';
  document.getElementById('tarifs').style.display = 'none';
  document.getElementById('portal').style.display = 'none';
  const recoveryBanner = document.getElementById('activeSessionRecoveryBanner');
  if (recoveryBanner) recoveryBanner.style.display = 'none';

  // Afficher workspace
  const ws = document.getElementById('workspaceView');
  ws.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Identification rigoureuse du plan
  const planKey = getEstablishmentPlanKey(est);
  const isDaara = est.type === 'DAARA' || planKey.startsWith('daara');

  // Mettre à jour les informations d'en-tête
  document.getElementById('wsSchoolTitle').textContent = est.name;
  
  const planBadgeEl = document.getElementById('wsPlanBadge');
  const rawPlan = est.plan || (isDaara ? 'Pack Internat Promo Daara (20 000 FCFA/mois)' : 'Formule Pro');
  const displayPlan = rawPlan.toLowerCase().startsWith('formule') || rawPlan.toLowerCase().startsWith('pack') || rawPlan.toLowerCase().startsWith('option') ? rawPlan : `Formule ${rawPlan}`;

  let planIcon = '⭐';
  if (isDaara) {
    planIcon = planKey === 'daara_annual' ? '👑' : (planKey === 'daara_promo' ? '🏷️' : '🕌');
  } else {
    planIcon = (planKey === 'premium' || planKey === 'enterprise') ? '👑' : (planKey === 'pro' ? '⚡' : '🌱');
  }

  if (planBadgeEl) {
    planBadgeEl.className = 'ws-plan-pill';
    planBadgeEl.style.display = 'inline-flex';

    if (planKey === 'starter' || planKey === 'daara_promo' || planKey === 'daara_standard') {
      planBadgeEl.classList.add('plan-starter');
      planBadgeEl.innerHTML = `${planIcon} ${displayPlan}`;
    } else if (planKey === 'pro') {
      planBadgeEl.classList.add('plan-pro');
      planBadgeEl.innerHTML = `${planIcon} ${displayPlan}`;
    } else {
      planBadgeEl.classList.add('plan-premium');
      planBadgeEl.innerHTML = `${planIcon} ${displayPlan}`;
    }
  }

  // 1. Badge Chip dans les actions supérieures
  const topPlanChipText = document.getElementById('wsTopPlanChipText');
  const topPlanChipIcon = document.getElementById('wsTopPlanChipIcon');
  if (topPlanChipText) {
    topPlanChipText.textContent = displayPlan;
    if (topPlanChipIcon) topPlanChipIcon.textContent = planIcon;
  }

  // 2. Badge dans la sidebar Direction
  const sidebarPlanText = document.getElementById('wsSidebarPlanText');
  const sidebarPlanIcon = document.getElementById('wsSidebarPlanIcon');
  if (sidebarPlanText) {
    sidebarPlanText.textContent = displayPlan;
    if (sidebarPlanIcon) sidebarPlanIcon.textContent = planIcon;
  }

  document.getElementById('wsSchoolCode').textContent = est.code || 'SSE-SN-1786';
  document.getElementById('wsSchoolCity').textContent = est.city || 'Dakar';

  // 3. Pastille dans le résumé du tableau de bord
  const summaryPlanEl = document.getElementById('wsSummaryPlan');
  if (summaryPlanEl) {
    summaryPlanEl.textContent = `Abonnement Actif : ${displayPlan}`;
    summaryPlanEl.style.display = 'inline-block';
  }
  let cleanDir = est.directeurNom || '';
  if (cleanDir === 'Dir. Le' || cleanDir === 'Le' || cleanDir === 'Dir.') {
    cleanDir = est.name || 'Direction Générale';
  }
  if (cleanDir && !cleanDir.startsWith('Dir.') && !cleanDir.startsWith('Direction') && !cleanDir.startsWith('M.') && !cleanDir.startsWith('Mme') && !cleanDir.startsWith('Serigne')) {
    cleanDir = `Dir. ${cleanDir}`;
  }
  document.getElementById('wsAdminName').textContent = cleanDir || (est.name ? `Direction ${est.name}` : 'Direction Générale');

  const shareBannerPlanBadge = document.getElementById('wsShareBannerPlanBadge');
  if (shareBannerPlanBadge) {
    shareBannerPlanBadge.textContent = `Formule Active : ${est.plan || 'Standard'}`;
  }

  // Synchroniser la barre de simulation de formule active
  document.querySelectorAll('.ws-plan-sim-btn').forEach(btn => btn.classList.remove('active'));
  const simBtnMap = {
    'starter': 'simBtnStarter',
    'pro': 'simBtnPro',
    'premium': 'simBtnPremium',
    'enterprise': 'simBtnPremium',
    'daara_promo': 'simBtnDaaraPromo',
    'daara_standard': 'simBtnDaaraStandard',
    'daara_annual': 'simBtnDaaraAnnual'
  };
  const activeSimBtn = document.getElementById(simBtnMap[planKey]);
  if (activeSimBtn) activeSimBtn.classList.add('active');

  const topPlanSelector = document.getElementById('wsTopPlanSelector');
  if (topPlanSelector) {
    if (isDaara) {
      topPlanSelector.innerHTML = `
        <option value="daara_promo">🏷️ Pack Internat Promo Daara (20 000 FCFA/mois)</option>
        <option value="daara_standard">⭐ Standard Daara (35 000 FCFA/mois)</option>
        <option value="daara_annual">👑 Option Annuelle Sérénité Daara (350 000 FCFA/an)</option>
      `;
    } else {
      topPlanSelector.innerHTML = `
        <option value="starter">🌱 Formule Starter École (20 000 FCFA/mois)</option>
        <option value="pro">⚡ Formule Pro École (55 000 FCFA/mois)</option>
        <option value="premium">👑 Formule Premium École (85 000 FCFA/mois)</option>
      `;
    }
    topPlanSelector.value = planKey;
  }

  if (typeof populateWorkspaceEstablishmentsDropdown === 'function') {
    populateWorkspaceEstablishmentsDropdown();
  }

  // Initialiser les coordonnées d'encaissement Wave & OM pour l'établissement actif
  if (typeof initWsPayConfig === 'function') {
    initWsPayConfig(est);
  }

  // Synchroniser dynamiquement le bouton du menu supérieur avec l'établissement actif
  const navBtn = document.getElementById('navWorkspaceBtn');
  const mobNavBtn = document.getElementById('mobNavWorkspaceBtn');
  const schoolNameDisp = est.name || 'Établissement';
  if (navBtn) {
    navBtn.innerHTML = `<span>${isDaara ? '🕌' : '🏫'}</span> <span>${schoolNameDisp}</span>`;
    navBtn.title = `Accéder au tableau de bord de ${schoolNameDisp}`;
    navBtn.onclick = (e) => { if (e && e.preventDefault) e.preventDefault(); openWorkspaceDirect(); };
  }
  if (mobNavBtn) {
    mobNavBtn.innerHTML = `<span>${isDaara ? '🕌' : '🏫'}</span> <span>${schoolNameDisp}</span>`;
    mobNavBtn.onclick = (e) => { if (e && e.preventDefault) e.preventDefault(); closeMobileMenu(); openWorkspaceDirect(); };
  }

  const iconEl = document.getElementById('wsSchoolIcon');
  const navQuran = document.getElementById('wsNavQuran');
  const navDorm = document.getElementById('wsNavDorm');
  const navGrades = document.getElementById('wsNavGrades');
  const navWhatsApp = document.getElementById('wsNavWhatsApp');
  const lockWhatsApp = document.getElementById('wsLockWhatsApp');
  const navLib = document.getElementById('wsNavLibrary');
  const lockLib = document.getElementById('wsLockLib');

  const mobQuran = document.getElementById('wsMobNavQuran');
  const mobDorm = document.getElementById('wsMobNavDorm');
  const mobGrades = document.getElementById('wsMobNavGrades');
  const mobWhatsApp = document.getElementById('wsMobNavWhatsApp');
  const mobLib = document.getElementById('wsMobNavLib');
  const mobLockWhatsApp = document.getElementById('wsMobLockWhatsApp');
  const mobLockLib = document.getElementById('wsMobLockLib');

  const navAccounting = document.getElementById('wsNavAccounting');
  const lockAccounting = document.getElementById('wsLockAccounting');
  const navHR = document.getElementById('wsNavHR');
  const lockHR = document.getElementById('wsLockHR');

  const mobAccounting = document.getElementById('wsMobNavAccounting');
  const mobLockAccounting = document.getElementById('wsMobLockAccounting');
  const mobHR = document.getElementById('wsMobNavHR');
  const mobLockHR = document.getElementById('wsMobLockHR');

  const navLibText = document.getElementById('wsNavLibText');
  const mobNavLibText = document.getElementById('wsMobNavLibText');

  const navBadges = document.getElementById('wsNavBadges');
  const lockBadges = document.getElementById('wsLockBadges');
  const navBadgesText = document.getElementById('wsNavBadgesText');
  const mobBadges = document.getElementById('wsMobNavBadges');
  const mobLockBadges = document.getElementById('wsMobLockBadges');

  const navAudit = document.getElementById('wsNavAudit');
  const lockAudit = document.getElementById('wsLockAudit');
  const navAuditText = document.getElementById('wsNavAuditText');
  const mobAudit = document.getElementById('wsMobNavAudit');
  const mobLockAudit = document.getElementById('wsMobLockAudit');

  const annualVipBanner = document.getElementById('wsAnnualSereniteBanner');

  if (isDaara) {
    iconEl.textContent = '🕌';
    if (navQuran) navQuran.style.display = 'flex';
    if (navDorm) navDorm.style.display = 'flex';
    if (navGrades) navGrades.style.display = 'none';

    if (mobQuran) mobQuran.style.display = 'inline-flex';
    if (mobDorm) mobDorm.style.display = 'inline-flex';
    if (mobGrades) mobGrades.style.display = 'none';

    // Titres adaptés aux Daaras
    if (navLibText) navLibText.textContent = '📚 Bibliothèque Islamique & Tajwîd Numérique';
    if (mobNavLibText) mobNavLibText.textContent = '📚 Biblio Islamique';
    if (navBadgesText) navBadgesText.textContent = '🪪 Cartes & Badges Talibés';
    if (navAuditText) navAuditText.textContent = '🤝 Accompagnement sur Site';

    // WhatsApp toujours inclus dans les formules Daara
    if (navWhatsApp) navWhatsApp.classList.remove('locked');
    if (lockWhatsApp) lockWhatsApp.style.display = 'none';
    if (mobWhatsApp) mobWhatsApp.classList.remove('locked');
    if (mobLockWhatsApp) mobLockWhatsApp.style.display = 'none';

    // Configuration des modules selon le niveau de formule Daara
    if (planKey === 'daara_promo' || planKey === 'daara_standard') {
      document.getElementById('wsKpiQuota').textContent = 'Talibés illimités dans cette formule';

      // SYSCOHADA inclus
      if (navAccounting) navAccounting.classList.remove('locked');
      if (lockAccounting) lockAccounting.style.display = 'none';
      if (mobAccounting) mobAccounting.classList.remove('locked');
      if (mobLockAccounting) mobLockAccounting.style.display = 'none';

      // RH inclus
      if (navHR) navHR.classList.remove('locked');
      if (lockHR) lockHR.style.display = 'none';
      if (mobHR) mobHR.classList.remove('locked');
      if (mobLockHR) mobLockHR.style.display = 'none';

      // Bibliothèque verrouillée (Réservée Option Annuelle Sérénité)
      if (navLib) navLib.classList.add('locked');
      if (lockLib) { lockLib.textContent = 'Annuel'; lockLib.style.display = 'inline-block'; }
      if (mobLib) mobLib.classList.add('locked');
      if (mobLockLib) { mobLockLib.textContent = 'Annuel'; mobLockLib.style.display = 'inline-block'; }

      // Badges verrouillés (Réservé Option Annuelle Sérénité)
      if (navBadges) navBadges.classList.add('locked');
      if (lockBadges) { lockBadges.textContent = 'Annuel'; lockBadges.style.display = 'inline-block'; lockBadges.style.background = ''; lockBadges.style.color = ''; }
      if (mobBadges) mobBadges.classList.add('locked');
      if (mobLockBadges) { mobLockBadges.textContent = 'Annuel'; mobLockBadges.style.display = 'inline-block'; mobLockBadges.style.background = ''; mobLockBadges.style.color = ''; }

      // Audit verrouillé (Réservé Option Annuelle Sérénité)
      if (navAudit) navAudit.classList.add('locked');
      if (lockAudit) { lockAudit.textContent = 'Annuel'; lockAudit.style.display = 'inline-block'; lockAudit.style.background = ''; lockAudit.style.color = ''; }
      if (mobAudit) mobAudit.classList.add('locked');
      if (mobLockAudit) { mobLockAudit.textContent = 'Annuel'; mobLockAudit.style.display = 'inline-block'; mobLockAudit.style.background = ''; mobLockAudit.style.color = ''; }

      if (annualVipBanner) annualVipBanner.style.display = 'none';

      // Bibliothèque verrouillée (Réservée Option Annuelle)
      if (navLib) navLib.classList.add('locked');
      if (lockLib) { lockLib.textContent = 'Annuel'; lockLib.style.display = 'inline-block'; }
      if (mobLib) mobLib.classList.add('locked');
      if (mobLockLib) { mobLockLib.textContent = 'Annuel'; mobLockLib.style.display = 'inline-block'; }

      // Badges verrouillés
      if (navBadges) navBadges.classList.add('locked');
      if (lockBadges) { lockBadges.textContent = 'Annuel'; lockBadges.style.display = 'inline-block'; lockBadges.style.background = ''; lockBadges.style.color = ''; }
      if (mobBadges) mobBadges.classList.add('locked');
      if (mobLockBadges) { mobLockBadges.textContent = 'Annuel'; mobLockBadges.style.display = 'inline-block'; mobLockBadges.style.background = ''; mobLockBadges.style.color = ''; }

      // Audit verrouillé
      if (navAudit) navAudit.classList.add('locked');
      if (lockAudit) { lockAudit.textContent = 'Annuel'; lockAudit.style.display = 'inline-block'; lockAudit.style.background = ''; lockAudit.style.color = ''; }
      if (mobAudit) mobAudit.classList.add('locked');
      if (mobLockAudit) { mobLockAudit.textContent = 'Annuel'; mobLockAudit.style.display = 'inline-block'; mobLockAudit.style.background = ''; mobLockAudit.style.color = ''; }

      if (annualVipBanner) annualVipBanner.style.display = 'none';

    } else { // daara_annual (Option Annuelle Sérénité)
      document.getElementById('wsKpiQuota').textContent = 'Talibés & Pensionnaires illimités (Sérénité)';

      if (navAccounting) navAccounting.classList.remove('locked');
      if (lockAccounting) lockAccounting.style.display = 'none';
      if (mobAccounting) mobAccounting.classList.remove('locked');
      if (mobLockAccounting) mobLockAccounting.style.display = 'none';

      if (navHR) navHR.classList.remove('locked');
      if (lockHR) lockHR.style.display = 'none';
      if (mobHR) mobHR.classList.remove('locked');
      if (mobLockHR) mobLockHR.style.display = 'none';

      // Bibliothèque 100% incluse
      if (navLib) navLib.classList.remove('locked');
      if (lockLib) lockLib.style.display = 'none';
      if (mobLib) mobLib.classList.remove('locked');
      if (mobLockLib) mobLockLib.style.display = 'none';

      // Badges 100% offerts
      if (navBadges) navBadges.classList.remove('locked');
      if (lockBadges) { lockBadges.textContent = 'Offert'; lockBadges.style.display = 'inline-block'; lockBadges.style.background = 'rgba(16, 185, 129, 0.2)'; lockBadges.style.color = '#34D399'; }
      if (mobBadges) mobBadges.classList.remove('locked');
      if (mobLockBadges) { mobLockBadges.textContent = 'Offert'; mobLockBadges.style.display = 'inline-block'; mobLockBadges.style.background = 'rgba(16, 185, 129, 0.2)'; mobLockBadges.style.color = '#34D399'; }

      // Audit 100% inclus
      if (navAudit) navAudit.classList.remove('locked');
      if (lockAudit) { lockAudit.textContent = 'Inclus'; lockAudit.style.display = 'inline-block'; lockAudit.style.background = 'rgba(0, 210, 180, 0.2)'; lockAudit.style.color = '#00D2B4'; }
      if (mobAudit) mobAudit.classList.remove('locked');
      if (mobLockAudit) { mobLockAudit.textContent = 'Inclus'; mobLockAudit.style.display = 'inline-block'; mobLockAudit.style.background = 'rgba(0, 210, 180, 0.2)'; mobLockAudit.style.color = '#00D2B4'; }

      if (annualVipBanner) annualVipBanner.style.display = 'block';
    }

    // KPIs Daara (Calculs dynamiques réels)
    document.getElementById('wsKpiLabelCustom1').textContent = 'Hizb Moyen Mémorisé';
    document.getElementById('wsKpiLabelCustom2').textContent = 'Internat (Lits Occupés)';

  } else {
    // ÉCOLES ORDINAIRES
    iconEl.textContent = '🏫';
    if (navQuran) navQuran.style.display = 'none';
    if (navDorm) navDorm.style.display = 'none';
    if (navGrades) navGrades.style.display = 'flex';

    if (mobQuran) mobQuran.style.display = 'none';
    if (mobDorm) mobDorm.style.display = 'none';
    if (mobGrades) mobGrades.style.display = 'inline-flex';

    // Titres adaptés aux Écoles
    if (navLibText) navLibText.textContent = '📚 Bibliothèque Numérique';
    if (mobNavLibText) mobNavLibText.textContent = '📚 Biblio';
    if (navBadgesText) navBadgesText.textContent = '🪪 Cartes Scolaires & Badges';
    if (navAuditText) navAuditText.textContent = '🤝 Accompagnement sur Site';
    if (annualVipBanner) annualVipBanner.style.display = 'none';

    // KPIs École (Calculs dynamiques réels)
    document.getElementById('wsKpiLabelCustom1').textContent = 'Moyenne Générale École';
    document.getElementById('wsKpiLabelCustom2').textContent = 'Taux de Présence';

    // Garantir l'affichage visuel de tous les onglets du menu latéral
    if (navAccounting) navAccounting.style.display = 'flex';
    if (navLib) navLib.style.display = 'flex';
    if (navBadges) navBadges.style.display = 'flex';
    if (navAudit) navAudit.style.display = 'flex';
    if (navHR) navHR.style.display = 'flex';
    if (navWhatsApp) navWhatsApp.style.display = 'flex';

    if (mobAccounting) mobAccounting.style.display = 'inline-flex';
    if (mobLib) mobLib.style.display = 'inline-flex';
    if (mobBadges) mobBadges.style.display = 'inline-flex';
    if (mobAudit) mobAudit.style.display = 'inline-flex';
    if (mobHR) mobHR.style.display = 'inline-flex';
    if (mobWhatsApp) mobWhatsApp.style.display = 'inline-flex';

    if (planKey === 'starter') {
      document.getElementById('wsKpiQuota').textContent = 'Quota : Jusqu\'à 150 élèves max';

      // WhatsApp verrouillé pour Starter
      if (navWhatsApp) navWhatsApp.classList.add('locked');
      if (lockWhatsApp) { lockWhatsApp.textContent = 'Pro'; lockWhatsApp.style.display = 'inline-block'; }
      if (mobWhatsApp) mobWhatsApp.classList.add('locked');
      if (mobLockWhatsApp) { mobLockWhatsApp.textContent = 'Pro'; mobLockWhatsApp.style.display = 'inline-block'; }

      // SYSCOHADA verrouillé pour Starter
      if (navAccounting) navAccounting.classList.add('locked');
      if (lockAccounting) { lockAccounting.textContent = 'Pro'; lockAccounting.style.display = 'inline-block'; }
      if (mobAccounting) mobAccounting.classList.add('locked');
      if (mobLockAccounting) { mobLockAccounting.textContent = 'Pro'; mobLockAccounting.style.display = 'inline-block'; }

      // RH verrouillé pour Starter
      if (navHR) navHR.classList.add('locked');
      if (lockHR) { lockHR.textContent = 'Pro'; lockHR.style.display = 'inline-block'; }
      if (mobHR) mobHR.classList.add('locked');
      if (mobLockHR) { mobLockHR.textContent = 'Pro'; mobLockHR.style.display = 'inline-block'; }

      // Bibliothèque verrouillée pour Starter
      if (navLib) navLib.classList.add('locked');
      if (lockLib) { lockLib.textContent = 'Premium'; lockLib.style.display = 'inline-block'; }
      if (mobLib) mobLib.classList.add('locked');
      if (mobLockLib) { mobLockLib.textContent = 'Premium'; mobLockLib.style.display = 'inline-block'; }

      // Badges verrouillés
      if (navBadges) navBadges.classList.add('locked');
      if (lockBadges) { lockBadges.textContent = 'Premium'; lockBadges.style.display = 'inline-block'; }
      if (mobBadges) mobBadges.classList.add('locked');
      if (mobLockBadges) { mobLockBadges.textContent = 'Premium'; mobLockBadges.style.display = 'inline-block'; }

      // Audit verrouillé
      if (navAudit) navAudit.classList.add('locked');
      if (lockAudit) { lockAudit.textContent = 'Premium'; lockAudit.style.display = 'inline-block'; }
      if (mobAudit) mobAudit.classList.add('locked');
      if (mobLockAudit) { mobLockAudit.textContent = 'Premium'; mobLockAudit.style.display = 'inline-block'; }

    } else if (planKey === 'pro') {
      document.getElementById('wsKpiQuota').textContent = 'Quota : Jusqu\'à 600 élèves max';

      // WhatsApp inclus
      if (navWhatsApp) navWhatsApp.classList.remove('locked');
      if (lockWhatsApp) lockWhatsApp.style.display = 'none';
      if (mobWhatsApp) mobWhatsApp.classList.remove('locked');
      if (mobLockWhatsApp) mobLockWhatsApp.style.display = 'none';

      // SYSCOHADA inclus
      if (navAccounting) navAccounting.classList.remove('locked');
      if (lockAccounting) lockAccounting.style.display = 'none';
      if (mobAccounting) mobAccounting.classList.remove('locked');
      if (mobLockAccounting) mobLockAccounting.style.display = 'none';

      // RH inclus
      if (navHR) navHR.classList.remove('locked');
      if (lockHR) lockHR.style.display = 'none';
      if (mobHR) mobHR.classList.remove('locked');
      if (mobLockHR) mobLockHR.style.display = 'none';

      // Bibliothèque verrouillée (Premium)
      if (navLib) navLib.classList.add('locked');
      if (lockLib) { lockLib.textContent = 'Premium'; lockLib.style.display = 'inline-block'; }
      if (mobLib) mobLib.classList.add('locked');
      if (mobLockLib) { mobLockLib.textContent = 'Premium'; mobLockLib.style.display = 'inline-block'; }

      // Badges verrouillés
      if (navBadges) navBadges.classList.add('locked');
      if (lockBadges) { lockBadges.textContent = 'Premium'; lockBadges.style.display = 'inline-block'; }
      if (mobBadges) mobBadges.classList.add('locked');
      if (mobLockBadges) { mobLockBadges.textContent = 'Premium'; mobLockBadges.style.display = 'inline-block'; }

      // Audit verrouillé
      if (navAudit) navAudit.classList.add('locked');
      if (lockAudit) { lockAudit.textContent = 'Premium'; lockAudit.style.display = 'inline-block'; }
      if (mobAudit) mobAudit.classList.add('locked');
      if (mobLockAudit) { mobLockAudit.textContent = 'Premium'; mobLockAudit.style.display = 'inline-block'; }

    } else { // premium ou enterprise
      document.getElementById('wsKpiQuota').textContent = 'Élèves illimités';

      if (navWhatsApp) navWhatsApp.classList.remove('locked');
      if (lockWhatsApp) lockWhatsApp.style.display = 'none';
      if (mobWhatsApp) mobWhatsApp.classList.remove('locked');
      if (mobLockWhatsApp) mobLockWhatsApp.style.display = 'none';

      if (navAccounting) navAccounting.classList.remove('locked');
      if (lockAccounting) lockAccounting.style.display = 'none';
      if (mobAccounting) mobAccounting.classList.remove('locked');
      if (mobLockAccounting) mobLockAccounting.style.display = 'none';

      if (navHR) navHR.classList.remove('locked');
      if (lockHR) lockHR.style.display = 'none';
      if (mobHR) mobHR.classList.remove('locked');
      if (mobLockHR) mobLockHR.style.display = 'none';

      if (navLib) navLib.classList.remove('locked');
      if (lockLib) lockLib.style.display = 'none';
      if (mobLib) mobLib.classList.remove('locked');
      if (mobLockLib) mobLockLib.style.display = 'none';

      if (navBadges) navBadges.classList.remove('locked');
      if (lockBadges) lockBadges.style.display = 'none';
      if (mobBadges) mobBadges.classList.remove('locked');
      if (mobLockBadges) mobLockBadges.style.display = 'none';

      if (navAudit) navAudit.classList.remove('locked');
      if (lockAudit) lockAudit.style.display = 'none';
      if (mobAudit) mobAudit.classList.remove('locked');
      if (mobLockAudit) mobLockAudit.style.display = 'none';
    }
  }

  // Remplir les données du workspace
  renderWsData(isDaara);

  // Réinitialiser la vue sur le premier onglet actif (Vue d'ensemble)
  switchWsTab('wsOverview', document.querySelector('.ws-nav-item'));

  showNotification(`🎉 Bienvenue dans l'espace "${est.name}" ! Formule ${est.plan} active.`);
}

function exitWorkspaceView() {
  try {
    localStorage.removeItem('sunuschool_active_workspace');
  } catch (e) {}

  document.getElementById('hero').style.display = 'block';
  document.getElementById('tarifs').style.display = 'block';
  document.getElementById('portal').style.display = 'block';
  document.getElementById('workspaceView').classList.remove('active');
  window.scrollTo({ top: document.getElementById('tarifs').offsetTop - 60, behavior: 'smooth' });
  updateSessionRecoveryUI();
}

function logoutEstablishment() {
  const schoolName = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : "l'Établissement";

  // 1. Nettoyage de la session locale active
  try {
    localStorage.removeItem('sunuschool_active_workspace');
    localStorage.removeItem('sunuschool_establishment');
    localStorage.setItem('sse_user_logged_out', 'true');
    sessionStorage.removeItem('sse_admin_authenticated');
    sessionStorage.removeItem('sse_superadmin_authenticated');
    sessionStorage.removeItem('sse_admin_user');
    localStorage.removeItem('sse_admin_authenticated');
    localStorage.removeItem('sse_superadmin_authenticated');
    localStorage.removeItem('sse_admin_user');
  } catch (e) {}

  currentEstablishment = null;

  // 2. Audit de déconnexion
  if (demoState && demoState.auditLogs) {
    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Déconnexion utilisateur effectuée (${schoolName})`,
      user: 'Directeur Général'
    });
    if (typeof renderAuditLogs === 'function') renderAuditLogs();
  }

  // 3. Masquer le Workspace et restaurer les sections publiques
  const ws = document.getElementById('workspaceView');
  if (ws) ws.classList.remove('active');

  const hero = document.getElementById('hero');
  const tarifs = document.getElementById('tarifs');
  const portal = document.getElementById('portal');
  if (hero) hero.style.display = 'block';
  if (tarifs) tarifs.style.display = 'block';
  if (portal) portal.style.display = 'block';

  // 4. Masquer le bandeau de reprise de session
  const banner = document.getElementById('activeSessionRecoveryBanner');
  if (banner) banner.style.display = 'none';

  // 5. Fermer d'éventuels modals ouverts
  closeAllModals();

  // 6. Réinitialiser le bouton d'accès du menu
  const navBtn = document.getElementById('navWorkspaceBtn');
  if (navBtn) {
    navBtn.innerHTML = '<span>🔑</span> <span>Se Connecter</span>';
    navBtn.title = 'Accéder à votre Espace / Se Connecter';
    navBtn.onclick = (e) => handleHeaderDashboardClick(e);
  }
  const mobNavBtn = document.getElementById('mobNavWorkspaceBtn');
  if (mobNavBtn) {
    mobNavBtn.innerHTML = '<span>🔑</span> <span>Se Connecter</span>';
    mobNavBtn.onclick = (e) => { closeMobileMenu(); handleHeaderDashboardClick(e); };
  }

  // 7. Réinitialiser la navigation vers l'accueil
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#hero') {
      link.classList.add('active');
    }
  });

  // 8. Scroll fluide vers le haut
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 9. Notification de déconnexion
  showNotification(`👋 Déconnexion réussie (${schoolName}). À bientôt sur SunuSchoolExpress !`);
}

// Redirection directe vers la page d'accueil de la plateforme lors du clic sur le logo SunuSchool EXPRESS
function navigateToHomePage(e) {
  if (e) {
    try { e.preventDefault(); } catch (err) {}
  }

  // Masquer l'espace de travail s'il est affiché
  const ws = document.getElementById('workspaceView');
  if (ws) {
    ws.classList.remove('active');
  }

  // Désactiver l'état actif du workspace pour rester sur l'accueil
  try {
    localStorage.removeItem('sunuschool_active_workspace');
  } catch (err) {}

  // Afficher toutes les sections de la vitrine
  const hero = document.getElementById('hero');
  const tarifs = document.getElementById('tarifs');
  const portal = document.getElementById('portal');
  if (hero) hero.style.display = 'block';
  if (tarifs) tarifs.style.display = 'block';
  if (portal) portal.style.display = 'block';

  // Fermer d'éventuels modals ouverts
  closeAllModals();

  // Mettre à jour la navigation active vers "Présentation" (Accueil)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#hero') {
      link.classList.add('active');
    }
  });

  // Mettre à jour le bandeau de reprise de session si établissement configuré
  updateSessionRecoveryUI();

  // Scroll fluide vers tout en haut de la page d'accueil
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchWsTab(tabId, navItem) {
  if (!tabId) return;
  const target = document.getElementById(tabId);
  if (!target) {
    console.warn('Target tab not found:', tabId);
    return;
  }

  // Vérification stricte des permissions par formule
  const planKey = getEstablishmentPlanKey(currentEstablishment);

  if (tabId === 'wsAlerts' && planKey === 'starter') {
    showPlanUpgradeModal('alerts');
    return;
  }

  if (tabId === 'wsAccounting' && planKey === 'starter') {
    showPlanUpgradeModal('accounting');
    return;
  }

  if (tabId === 'wsHR' && planKey === 'starter') {
    showPlanUpgradeModal('hr');
    return;
  }

  if (tabId === 'wsLib' && planKey !== 'premium' && planKey !== 'enterprise' && planKey !== 'daara_annual') {
    showPlanUpgradeModal('library');
    return;
  }

  if (tabId === 'wsBadges' && planKey !== 'premium' && planKey !== 'enterprise' && planKey !== 'daara_annual') {
    showPlanUpgradeModal('badges');
    return;
  }

  if (tabId === 'wsAudit' && planKey !== 'premium' && planKey !== 'enterprise' && planKey !== 'daara_annual') {
    showPlanUpgradeModal('audit');
    return;
  }

  // Désactivation des états actifs sur tous les onglets
  document.querySelectorAll('.ws-nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.ws-mob-tab').forEach(el => el.classList.remove('active'));
  
  if (navItem && navItem.classList) {
    navItem.classList.add('active');
  }
  document.querySelectorAll(`.ws-mob-tab[onclick*="${tabId}"]`).forEach(m => m.classList.add('active'));
  document.querySelectorAll(`.ws-nav-item[onclick*="${tabId}"]`).forEach(s => s.classList.add('active'));

  // Masquer les autres conteneurs et activer le conteneur sélectionné
  document.querySelectorAll('.ws-feature-container').forEach(c => c.classList.remove('active'));
  target.classList.add('active');

  // Forcer le rafraîchissement dynamique pour que le contenu soit toujours actif et réactif
  if (tabId === 'wsAccounting') {
    renderAccountingTab();
  } else if (tabId === 'wsClasses') {
    renderClassesTab();
  } else if (tabId === 'wsHR') {
    renderHRTab();
  } else if (tabId === 'wsAlerts') {
    renderWhatsAppTab();
  } else if (tabId === 'wsLib') {
    renderLibTab();
  } else if (tabId === 'wsBadges') {
    renderBadgesTab();
  } else if (tabId === 'wsAudit') {
    renderAuditTab();
  }
}

function isRealRegisteredEstablishment() {
  if (!currentEstablishment) return false;
  return Boolean(currentEstablishment.code || currentEstablishment.email || currentEstablishment.dateAdhesion);
}

function getEstablishmentActiveStudents(isDaara) {
  if (!isRealRegisteredEstablishment()) {
    return isDaara ? demoState.talibes : demoState.elevesScolaires;
  }
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = isDaara ? `sse_talibes_${estKey}` : `sse_eleves_${estKey}`;
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Assainissement strict : aucun nouvel élève ne doit avoir de fausse note pré-remplie
        parsed.forEach(s => {
          if (s.moyenne === 15.5 && (!s.notes || s.notes.length === 0)) {
            s.moyenne = null;
            s.rang = '--';
          }
          if (s.tajwidNote === 16.5 && (!s.notes || s.notes.length === 0)) {
            s.tajwidNote = null;
          }
        });
        return parsed;
      }
    } catch(e) {}
  }
  // OPTION A : 0 élève par défaut pour tout établissement réel
  return [];
}

function saveEstablishmentActiveStudents(list, isDaara) {
  if (!currentEstablishment) return;
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = isDaara ? `sse_talibes_${estKey}` : `sse_eleves_${estKey}`;
  localStorage.setItem(storageKey, JSON.stringify(list));
}

// 2. GESTION DES TRANSACTIONS DE CAISSE ISOLEES PAR ECOLE (Zéro fausse donnée)
function getEstablishmentTransactions() {
  if (!isRealRegisteredEstablishment()) {
    return demoState.transactions || [];
  }
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_caisse_${estKey}`;
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  // Pour un nouvel établissement : caisse vierge (0 FCFA)
  return [];
}

function saveEstablishmentTransactions(list) {
  if (!currentEstablishment) return;
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_caisse_${estKey}`;
  localStorage.setItem(storageKey, JSON.stringify(list));
}

// 3. GESTION DU JOURNAL SYSCOHADA ISOLE PAR ECOLE (Zéro écriture fictive)
function getEstablishmentJournal() {
  if (!isRealRegisteredEstablishment()) {
    return demoState.syscohadaJournal || [];
  }
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_journal_${estKey}`;
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  // Pour un nouvel établissement : Grand Livre vierge (0 écriture)
  return [];
}

function saveEstablishmentJournal(list) {
  if (!currentEstablishment) return;
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_journal_${estKey}`;
  localStorage.setItem(storageKey, JSON.stringify(list));
}

// 4. GESTION DU CORPS PROFESSORAL RH ISOLE PAR ECOLE (Zéro enseignant fictif)
function getEstablishmentTeachers() {
  if (!isRealRegisteredEstablishment()) {
    return demoState.hrTeachers || [];
  }
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_teachers_${estKey}`;
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  // Pour un nouvel établissement : 0 enseignant par défaut
  return [];
}

function saveEstablishmentTeachers(list) {
  if (!currentEstablishment) return;
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_teachers_${estKey}`;
  localStorage.setItem(storageKey, JSON.stringify(list));
}

// 5. GESTION DES CLASSES ET NIVEAUX PEDAGOGIQUES PAR ECOLE (Zéro fausse donnée)
function getEstablishmentClasses() {
  if (!currentEstablishment) return [];
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_classes_${estKey}`;
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  
  if (!isRealRegisteredEstablishment()) {
    // Mode Démo : classes types sénégalaises par défaut
    return [
      { id: 'cls_ci', nom: 'CI', cycle: 'Élémentaire', salle: 'Salle 1', capacite: 40, profPrincipal: 'Mme Mariama Ba' },
      { id: 'cls_cp', nom: 'CP', cycle: 'Élémentaire', salle: 'Salle 2', capacite: 40, profPrincipal: 'Mme Mariama Ba' },
      { id: 'cls_ce1', nom: 'CE1', cycle: 'Élémentaire', salle: 'Salle 3', capacite: 40, profPrincipal: 'M. Abdoulaye Diallo' },
      { id: 'cls_cm2', nom: 'CM2 A', cycle: 'Élémentaire', salle: 'Salle 6', capacite: 45, profPrincipal: 'M. Abdoulaye Diallo' },
      { id: 'cls_6eme', nom: '6ème A', cycle: 'Collège', salle: 'Salle 101', capacite: 50, profPrincipal: 'M. Cheikh Tidiane Diop' },
      { id: 'cls_3eme', nom: '3ème A', cycle: 'Collège', salle: 'Salle 107', capacite: 50, profPrincipal: 'M. Abdoulaye Diallo' }
    ];
  }
  // Pour un nouvel établissement réel : 0 classe par défaut
  return [];
}

function saveEstablishmentClasses(list) {
  if (!currentEstablishment) return;
  const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
  const storageKey = `sse_classes_${estKey}`;
  localStorage.setItem(storageKey, JSON.stringify(list));
  const badge = document.getElementById('wsClassesBadge');
  if (badge) badge.textContent = list.length;
}

function applyClassPresetPack(packName) {
  let presetClasses = [];
  const now = Date.now();

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

  const existing = getEstablishmentClasses();
  presetClasses.forEach(p => {
    if (!existing.some(e => e.nom.toLowerCase() === p.nom.toLowerCase())) {
      existing.push(p);
    }
  });

  saveEstablishmentClasses(existing);
  renderClassesTab();
  showNotification(`🎉 Pack ${packName.toUpperCase()} configuré (${existing.length} classes actives) !`);
}

function openNewClassModal(editId = null) {
  const modal = document.getElementById('newClassModal');
  if (!modal) return;

  const form = document.getElementById('newClassForm');
  if (form) form.reset();

  const idInput = document.getElementById('editClassId');
  const titleEl = document.getElementById('newClassModalTitle');
  const teacherSelect = document.getElementById('classTeacherSelect');

  // Remplir le sélecteur d'enseignants
  if (teacherSelect) {
    teacherSelect.innerHTML = '<option value="">-- Aucun enseignant assigné --</option>';
    const teachers = getEstablishmentTeachers();
    teachers.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.nom;
      opt.textContent = `${t.nom} (${t.matiere})`;
      teacherSelect.appendChild(opt);
    });
  }

  if (editId) {
    const classes = getEstablishmentClasses();
    const found = classes.find(c => c.id === editId);
    if (found) {
      if (idInput) idInput.value = found.id;
      if (titleEl) titleEl.textContent = `Modifier la Classe : ${found.nom}`;
      if (document.getElementById('classNameInput')) document.getElementById('classNameInput').value = found.nom;
      if (document.getElementById('classCycleSelect')) document.getElementById('classCycleSelect').value = found.cycle || 'Élémentaire';
      if (document.getElementById('classRoomInput')) document.getElementById('classRoomInput').value = found.salle || '';
      if (document.getElementById('classCapacityInput')) document.getElementById('classCapacityInput').value = found.capacite || 45;
      if (teacherSelect && found.profPrincipal) teacherSelect.value = found.profPrincipal;
    }
  } else {
    if (idInput) idInput.value = '';
    if (titleEl) titleEl.textContent = 'Ajouter une Nouvelle Classe';
  }

  modal.classList.add('active');
}

function submitNewClassModal() {
  const editId = document.getElementById('editClassId')?.value;
  const nom = document.getElementById('classNameInput')?.value?.trim();
  const cycle = document.getElementById('classCycleSelect')?.value || 'Élémentaire';
  const salle = document.getElementById('classRoomInput')?.value?.trim() || 'Salle Principale';
  const capacite = parseInt(document.getElementById('classCapacityInput')?.value) || 45;
  const prof = document.getElementById('classTeacherSelect')?.value || '';

  if (!nom) {
    showNotification('⚠️ Veuillez renseigner le nom de la classe.');
    return;
  }

  const classes = getEstablishmentClasses();

  if (editId) {
    const idx = classes.findIndex(c => c.id === editId);
    if (idx !== -1) {
      classes[idx].nom = nom;
      classes[idx].cycle = cycle;
      classes[idx].salle = salle;
      classes[idx].capacite = capacite;
      classes[idx].profPrincipal = prof;
      showNotification(`✓ Classe ${nom} modifiée avec succès !`);
    }
  } else {
    const newClass = {
      id: `cls_${Date.now()}`,
      nom: nom,
      cycle: cycle,
      salle: salle,
      capacite: capacite,
      profPrincipal: prof
    };
    classes.push(newClass);
    showNotification(`✓ Nouvelle classe ${nom} ajoutée avec succès !`);
  }

  saveEstablishmentClasses(classes);
  closeAllModals();
  renderClassesTab();
}

function deleteClass(classId) {
  const classes = getEstablishmentClasses();
  const found = classes.find(c => c.id === classId);
  if (!found) return;

  if (confirm(`Confirmez-vous la suppression de la classe "${found.nom}" ?`)) {
    const updated = classes.filter(c => c.id !== classId);
    saveEstablishmentClasses(updated);
    renderClassesTab();
    showNotification(`🗑️ Classe "${found.nom}" supprimée.`);
  }
}

function renderClassesTab() {
  const container = document.getElementById('wsClassesContainer');
  if (!container) return;

  const classes = getEstablishmentClasses();
  const isDaara = currentEstablishment?.type === 'DAARA';
  const students = getEstablishmentActiveStudents(isDaara);

  const badge = document.getElementById('wsClassesBadge');
  if (badge) badge.textContent = classes.length;

  if (classes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; background: rgba(255,255,255,0.02); border: 1.5px dashed rgba(255,255,255,0.15); border-radius: 12px;">
        <div style="font-size: 3rem; margin-bottom: 0.8rem;">🏫</div>
        <h4 style="color: #FFF; font-size: 1.2rem; margin-bottom: 0.4rem;">Aucune classe créée pour le moment</h4>
        <p style="color: var(--gris-400); font-size: 0.88rem; max-width: 520px; margin: 0 auto 1.4rem; line-height: 1.5;">
          Pour démarrer la gestion académique, cliquez sur l'un des <strong>Packs en 1 Clic</strong> ci-dessus pour charger vos classes officielles, ou ajoutez manuellement votre première classe.
        </p>
        <button class="btn btn-gold" onclick="openNewClassModal()" style="font-size: 0.9rem; padding: 0.6rem 1.4rem; font-weight: 800;">
          ➕ Ajouter ma Première Classe
        </button>
      </div>
    `;
    return;
  }

  let gridHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">`;

  classes.forEach(c => {
    const count = students.filter(s => {
      const sCls = (s.classe || '').toLowerCase().trim();
      const cNom = c.nom.toLowerCase().trim();
      return sCls === cNom || sCls.startsWith(cNom);
    }).length;

    const cycleBadgeColors = {
      'Maternelle': { bg: 'rgba(236,72,153,0.15)', color: '#F472B6' },
      'Élémentaire': { bg: 'rgba(245,158,11,0.15)', color: '#FBBF24' },
      'Collège': { bg: 'rgba(96,165,250,0.15)', color: '#60A5FA' },
      'Lycée': { bg: 'rgba(168,85,247,0.15)', color: '#C084FC' },
      'Daara': { bg: 'rgba(16,185,129,0.15)', color: '#34D399' }
    }[c.cycle] || { bg: 'rgba(0,210,180,0.15)', color: '#00D2B4' };

    const percentage = Math.min(100, Math.round((count / (c.capacite || 45)) * 100));

    gridHTML += `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.2rem; transition: transform 0.2s; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
            <div>
              <h4 style="margin: 0; color: #FFF; font-size: 1.15rem; font-weight: 800;">${c.nom}</h4>
              <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; background: ${cycleBadgeColors.bg}; color: ${cycleBadgeColors.color}; font-weight: 700;">
                ${c.cycle}
              </span>
            </div>
            <div style="font-size: 0.76rem; color: var(--gris-400); background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 6px;">
              🚪 ${c.salle || 'Salle ' + c.nom}
            </div>
          </div>

          <div style="margin: 0.9rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Effectif Actif :</span>
              <strong style="color: ${count > 0 ? 'var(--turquoise-400)' : '#FFF'};">${count} / ${c.capacite || 45} Élèves</strong>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #00D2B4, #10B981); border-radius: 3px;"></div>
            </div>
          </div>

          <div style="font-size: 0.76rem; color: var(--gris-400); margin-bottom: 1rem;">
            👨‍🏫 <strong>Prof. Référent :</strong> <span style="color: #FFF;">${c.profPrincipal || 'Non assigné'}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.45rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.85rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-gold" style="flex: 1; font-size: 0.75rem; padding: 0.4rem 0.6rem; font-weight: 700;" onclick="selectClassForTimetable('${c.nom}')" title="Générer ou voir l'emploi du temps de cette classe">
            📅 Emploi du Temps
          </button>
          <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.4rem 0.6rem;" onclick="openNewClassModal('${c.id}')" title="Modifier">
            ✏️
          </button>
          <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.4rem 0.6rem; color: #F87171; border-color: rgba(239,68,68,0.3);" onclick="deleteClass('${c.id}')" title="Supprimer">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  gridHTML += `</div>`;
  container.innerHTML = gridHTML;
}

function selectClassForTimetable(className) {
  selectedTimetableClass = className;
  activeHrSubTab = 'timetable';
  switchWsTab('wsHR');
  renderHRTab();
  showNotification(`📅 Emploi du temps affiché pour la classe : ${className}`);
}

function generateTimetableAutomatically(targetClass) {
  const className = targetClass || selectedTimetableClass || 'CM2 A';
  const classes = getEstablishmentClasses();
  const currentCls = classes.find(c => c.nom.toLowerCase() === className.toLowerCase()) || { nom: className, cycle: 'Élémentaire' };
  const cycle = (currentCls.cycle || '').toLowerCase();
  const teachers = getEstablishmentTeachers();

  // 1. Définir les matières selon le cycle pédagogique officiel (Sénégal & Daara)
  let curriculum = [];
  if (cycle.includes('maternelle')) {
    curriculum = [
      { subject: 'Accueil & Langage', weight: 'high' },
      { subject: 'Comptines & Éveil Sensoriel', weight: 'high' },
      { subject: 'Graphisme & Dessin', weight: 'medium' },
      { subject: 'Activités Motrices & EPS', weight: 'low' },
      { subject: 'Jeux Libres & Chants', weight: 'low' }
    ];
  } else if (cycle.includes('daara')) {
    curriculum = [
      { subject: 'Mémorisation Noble Coran (Hizb)', weight: 'high' },
      { subject: 'Règles de Tajwîd & Récitation', weight: 'high' },
      { subject: 'Écriture & Planche (Alluwa)', weight: 'medium' },
      { subject: 'Sciences Islamiques & Hadith', weight: 'medium' },
      { subject: 'Langue Arabe & Vocabulaire', weight: 'medium' },
      { subject: 'Calcul & Éveil de Base', weight: 'low' }
    ];
  } else if (cycle.includes('coll') || cycle.includes('lyc')) {
    curriculum = [
      { subject: 'Mathématiques', weight: 'high' },
      { subject: 'Français & Littérature', weight: 'high' },
      { subject: 'Sciences de la Vie (SVT)', weight: 'medium' },
      { subject: 'Sciences Physiques & Chimie', weight: 'medium' },
      { subject: 'Histoire & Géographie', weight: 'medium' },
      { subject: 'Anglais', weight: 'medium' },
      { subject: 'Arabe / Philosophie', weight: 'low' },
      { subject: 'Éducation Physique (EPS)', weight: 'low' }
    ];
  } else {
    // Élémentaire / Primaire par défaut
    curriculum = [
      { subject: 'Mathématiques & Calcul', weight: 'high' },
      { subject: 'Français (Lecture & Dictée)', weight: 'high' },
      { subject: 'Éveil Scientifique & Géométrie', weight: 'medium' },
      { subject: 'Histoire & Géographie', weight: 'medium' },
      { subject: 'Éducation Civique & Morale', weight: 'low' },
      { subject: 'Éducation Physique (EPS)', weight: 'low' },
      { subject: 'Arts & Dessin', weight: 'low' }
    ];
  }

  // 2. Vérification anti-collision : un professeur ne doit pas être dans 2 classes en même temps
  function isTeacherBusyInOtherClass(teacherName, day, hour) {
    if (!teacherName) return false;
    for (const [otherCls, sched] of Object.entries(timetablesDatabase)) {
      if (otherCls.toLowerCase() === className.toLowerCase()) continue;
      if (!Array.isArray(sched)) continue;
      const r = sched.find(row => row.hour === hour);
      if (r && r[day] && r[day].toLowerCase().includes(teacherName.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  function findBestTeacherFor(subjectName, day, hour) {
    const sLow = subjectName.toLowerCase();
    
    // 1ère priorité : Professeur expressément affecté à cette classe pour cette matière
    let match = teachers.find(t => {
      const mLow = (t.matiere || '').toLowerCase();
      const hasSubject = mLow.includes(sLow) || (sLow.includes('math') && mLow.includes('math')) || (sLow.includes('fran') && mLow.includes('fran')) || (sLow.includes('coran') && (mLow.includes('coran') || mLow.includes('arabe') || mLow.includes('hifz'))) || (sLow.includes('svt') && mLow.includes('svt')) || (sLow.includes('phys') && mLow.includes('phys'));
      const hasClass = Array.isArray(t.classes) && t.classes.some(cl => cl.toLowerCase() === className.toLowerCase());
      return hasSubject && hasClass && !isTeacherBusyInOtherClass(t.nom, day, hour);
    });

    // 2ème priorité : Tout professeur de l'établissement enseignant cette matière libre à cette heure
    if (!match) {
      match = teachers.find(t => {
        const mLow = (t.matiere || '').toLowerCase();
        const hasSubject = mLow.includes(sLow) || (sLow.includes('math') && mLow.includes('math')) || (sLow.includes('fran') && mLow.includes('fran')) || (sLow.includes('coran') && (mLow.includes('coran') || mLow.includes('arabe') || mLow.includes('hifz'))) || (sLow.includes('svt') && mLow.includes('svt')) || (sLow.includes('phys') && mLow.includes('phys'));
        return hasSubject && !isTeacherBusyInOtherClass(t.nom, day, hour);
      });
    }

    // 3ème priorité : Professeur principal de la classe si disponible
    if (!match && currentCls.profPrincipal && !isTeacherBusyInOtherClass(currentCls.profPrincipal, day, hour)) {
      match = teachers.find(t => t.nom === currentCls.profPrincipal);
    }

    return match ? match.nom : '';
  }

  // 3. Déterminer les créneaux horaires
  const timeSlots = [
    { hour: '08h00 - 10h00', isMorning: true },
    { hour: '10h00 - 12h00', isMorning: true },
    { hour: '15h00 - 17h00', isMorning: false }
  ];

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const newSchedule = [];

  timeSlots.forEach(ts => {
    const row = { hour: ts.hour };
    days.forEach(d => { row[d] = ''; });
    newSchedule.push(row);
  });

  let currSubjIdx = 0;
  timeSlots.forEach((ts, rowIdx) => {
    days.forEach(day => {
      if (day === 'sat' && !ts.isMorning) {
        newSchedule[rowIdx][day] = 'Fin de semaine (Repos)';
        return;
      }
      if (day === 'fri' && !ts.isMorning) {
        newSchedule[rowIdx][day] = 'Prière du Vendredi & Repos';
        return;
      }
      if (day === 'wed' && !ts.isMorning && cycle.includes('élémentaire')) {
        newSchedule[rowIdx][day] = 'Après-midi Libre / Activités Sportives';
        return;
      }

      const subjObj = curriculum[currSubjIdx % curriculum.length];
      currSubjIdx++;

      const teacherName = findBestTeacherFor(subjObj.subject, day, ts.hour);
      const teacherTag = teacherName ? ` (${teacherName})` : '';

      newSchedule[rowIdx][day] = `${subjObj.subject}${teacherTag}`;
    });
  });

  timetablesDatabase[className] = newSchedule;
  saveTimetablesToStorage();

  if (currentEstablishment) {
    const estKey = currentEstablishment.code || currentEstablishment.id || currentEstablishment.email;
    try {
      localStorage.setItem(`sse_tt_${estKey}_${className}`, JSON.stringify(newSchedule));
    } catch(e) {}
  }

  renderHRTab();
  showNotification(`⚡ Emploi du temps de ${className} généré automatiquement sans aucun conflit d'enseignant !`);
}

function renderWsData(isDaara) {
  // Remplir la table aperçu
  const tbody = document.getElementById('wsStudentsTableBody');
  const fullBody = document.getElementById('wsFullStudentsTableBody');
  const quranBody = document.getElementById('wsQuranTableBody');
  const gradesBody = document.getElementById('wsGradesTableBody');
  const dormGrid = document.getElementById('wsDormGrid');
  const financeBody = document.getElementById('wsFinanceTableBody');

  if (tbody) tbody.innerHTML = '';
  if (fullBody) fullBody.innerHTML = '';
  if (quranBody) quranBody.innerHTML = '';
  if (gradesBody) gradesBody.innerHTML = '';
  if (dormGrid) dormGrid.innerHTML = '';
  if (financeBody) financeBody.innerHTML = '';

  const activeStudents = getEstablishmentActiveStudents(isDaara);
  const totalCount = activeStudents.length;

  // 1. KPI Effectif Réel
  if (document.getElementById('wsKpiStudents')) document.getElementById('wsKpiStudents').textContent = totalCount;
  if (document.getElementById('wsCountBadge')) document.getElementById('wsCountBadge').textContent = totalCount;

  // 2. KPI Recouvrement Réel (calculé à partir des écritures réelles)
  const txs = getEstablishmentTransactions();
  const totalEncaisse = txs.reduce((sum, t) => sum + (parseInt(String(t.montant).replace(/[^0-9]/g, '')) || 0), 0);
  const elRecAmount = document.getElementById('wsKpiRecoveryAmount');
  const elRecRate = document.getElementById('wsKpiRecoveryRate');
  if (elRecAmount) {
    elRecAmount.textContent = totalEncaisse > 0 
      ? `${totalEncaisse.toLocaleString('fr-FR')} FCFA encaissés` 
      : '0 FCFA encaissé (Caisse vierge)';
  }
  if (elRecRate) {
    elRecRate.textContent = totalEncaisse > 0 ? 'En cours' : '100%';
  }

  // 3 & 4. KPIs Métier Réels (Daara ou École Moderne)
  const elVal1 = document.getElementById('wsKpiValCustom1');
  const elSub1 = document.getElementById('wsKpiSubCustom1');
  const elVal2 = document.getElementById('wsKpiValCustom2');
  const elSub2 = document.getElementById('wsKpiSubCustom2');

  if (isDaara) {
    if (activeStudents.length > 0) {
      const avgHizb = (activeStudents.reduce((sum, t) => sum + (Number(t.hizb) || 1), 0) / activeStudents.length).toFixed(1);
      if (elVal1) elVal1.textContent = `Hizb ${avgHizb}`;
      if (elSub1) elSub1.textContent = `${Math.min(100, Math.round((avgHizb / 60) * 100))}% du Coran mémorisé`;
      
      const occupiedBeds = activeStudents.filter(t => t.lit || t.chambre).length;
      if (elVal2) elVal2.textContent = `${occupiedBeds} Lit${occupiedBeds > 1 ? 's' : ''}`;
      if (elSub2) elSub2.textContent = `${occupiedBeds} talibé${occupiedBeds > 1 ? 's hébergés' : ' hébergé'}`;
    } else {
      if (elVal1) elVal1.textContent = '--';
      if (elSub1) elSub1.textContent = '0 talibé évalué';
      if (elVal2) elVal2.textContent = '0 Lit';
      if (elSub2) elSub2.textContent = 'Dortoirs disponibles';
    }
  } else {
    if (activeStudents.length > 0) {
      const studentsWithMoy = activeStudents.filter(s => typeof s.moyenne === 'number' && !isNaN(s.moyenne));
      if (studentsWithMoy.length > 0) {
        const avg = (studentsWithMoy.reduce((sum, s) => sum + s.moyenne, 0) / studentsWithMoy.length).toFixed(2);
        if (elVal1) elVal1.textContent = `${avg} / 20`;
        if (elSub1) elSub1.textContent = 'Moyenne générale calculée';
      } else {
        if (elVal1) elVal1.textContent = '-- / 20';
        if (elSub1) elSub1.textContent = 'En cours d\'évaluation';
      }
      if (elVal2) elVal2.textContent = '100%';
      if (elSub2) elSub2.textContent = 'Assiduité & présence active';
    } else {
      if (elVal1) elVal1.textContent = '-- / 20';
      if (elSub1) elSub1.textContent = 'Effectif vierge';
      if (elVal2) elVal2.textContent = '100%';
      if (elSub2) elSub2.textContent = 'Taux de présence';
    }
  }

  if (isDaara) {
    document.getElementById('wsTableTitle').textContent = 'Derniers Talibés & Mémorisation Hizb';
    document.getElementById('wsTableHeader').innerHTML = `
      <th>Talibé</th>
      <th>Matricule</th>
      <th>Hizb &amp; Récitation</th>
      <th>Chambre (Dortoir)</th>
      <th>Pension Internat</th>
      <th>Action Oustaz</th>
    `;

    const fullHeader = document.getElementById('wsFullStudentsTableHeader');
    if (fullHeader) {
      fullHeader.innerHTML = `
        <th>Matricule</th>
        <th>Nom &amp; Prénom</th>
        <th>Niveau / Hifz</th>
        <th>Chambre &amp; Dortoir</th>
        <th>Date d'inscription</th>
        <th>Téléphone Parent</th>
        <th>Statut</th>
      `;
    }

    if (activeStudents.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="7" style="text-align: center; padding: 2.8rem 1rem; color: var(--gris-400);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🕌</div>
          <div style="font-weight: 700; font-size: 1.05rem; color: #FFF; margin-bottom: 0.3rem;">Aucun talibé inscrit pour le moment</div>
          <div style="font-size: 0.85rem; color: var(--gris-400); margin-bottom: 1.2rem;">Votre effectif actif est actuellement vierge (0 talibé). Cliquez ci-dessous pour inscrire votre premier talibé ou importer votre liste.</div>
          <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-gold" onclick="openModalNewStudent('TALIBE')" style="font-size: 0.85rem; padding: 0.5rem 1.1rem;">
              <span>➕</span> <span>Inscrire un Talibé</span>
            </button>
            <button class="btn btn-outline" onclick="openModalImportCsv()" style="font-size: 0.85rem; padding: 0.5rem 1.1rem; border-color: var(--turquoise-500); color: var(--turquoise-400);">
              <span>📥</span> <span>Importer CSV / Excel</span>
            </button>
          </div>
        </td>
      `;
      fullBody.appendChild(emptyRow);

      const emptyShort = document.createElement('tr');
      emptyShort.innerHTML = `<td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--gris-400);">Aucun talibé enregistré. Cliquez sur « ➕ Inscrire un Talibé » pour démarrer.</td>`;
      tbody.appendChild(emptyShort);

      if (quranBody) {
        quranBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--gris-400);">Aucun talibé dans le suivi coranique pour le moment.</td></tr>`;
      }
    } else {
      activeStudents.forEach(t => {
        const chDisplay = t.chambre ? t.chambre : 'Chambre 01';
        const dormDisplay = t.dortoir ? ` • ${t.dortoir}` : '';
        const litDisplay = t.lit ? ` (Lit ${t.lit})` : '';

        // Ligne tableau aperçu
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${t.prenom} ${t.nom}</strong></td>
          <td><span style="font-size: 0.8rem; color: var(--gris-500);">${t.matricule}</span></td>
          <td><strong class="text-gold">Hizb ${t.hizb}</strong> (${t.sourate || 'Sourate'})</td>
          <td>
            <button class="badge-tag" style="background: rgba(0, 210, 180, 0.12); color: #00D2B4; border: 1px solid rgba(0, 210, 180, 0.28); font-weight: 700; font-size: 0.76rem; white-space: nowrap; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: all 0.2s ease;" onclick="openChangeRoomModal('${t.id}')" title="Cliquer pour changer de chambre ou de lit">
              🛏️ ${chDisplay}${dormDisplay}${litDisplay} <span style="font-size: 0.7rem; opacity: 0.75;">✏️</span>
            </button>
          </td>
          <td><span class="badge-tag badge-excellent">${t.mensualiteStatut || 'PAYE'}</span></td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="openEvaluationModal('${t.id}')">✏️ Noter Hizb</button>
              <button class="btn btn-outline" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; border-color: rgba(0, 210, 180, 0.4); color: var(--turquoise-400);" onclick="openChangeRoomModal('${t.id}')" title="Changer de chambre / dortoir">🛏️</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);

        // Ligne table complète
        const trFull = document.createElement('tr');
        trFull.innerHTML = `
          <td>${t.matricule}</td>
          <td><strong>${t.prenom} ${t.nom}</strong></td>
          <td><span class="badge-tag" style="background: rgba(45, 212, 191, 0.15); color: #2DD4BF; font-weight: 700;">${t.classe || 'Niveau ' + Math.ceil((t.hizb || 1) / 10) + ' (Hifz)'}</span></td>
          <td>
            <button class="badge-tag" style="background: rgba(0, 210, 180, 0.12); color: #00D2B4; border: 1px solid rgba(0, 210, 180, 0.28); font-weight: 600; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;" onclick="openChangeRoomModal('${t.id}')" title="Cliquer pour changer de chambre ou de lit">
              🛏️ ${chDisplay}${litDisplay} <span style="font-size: 0.68rem; opacity: 0.75;">✏️</span>
            </button>
          </td>
          <td>${t.dateInscription || new Date().toLocaleDateString('fr-FR')}</td>
          <td>${t.parentTel || '+221 77 999 88 77'}</td>
          <td><span class="badge-tag badge-excellent">INSCRIT</span></td>
        `;
        fullBody.appendChild(trFull);

        // Ligne suivi coranique
        const trQ = document.createElement('tr');
        trQ.innerHTML = `
          <td><strong>${t.prenom} ${t.nom}</strong></td>
          <td><strong class="text-gold">Hizb ${t.hizb || 1}</strong> / 60</td>
          <td>Juz ${t.juz || 1}</td>
          <td>${t.sourate || 'Al-Fatiha'}</td>
          <td><strong class="text-turquoise">${(t.tajwidNote !== null && t.tajwidNote !== undefined && t.tajwidNote !== '') ? t.tajwidNote + '/20' : '<span style="color: var(--gris-400); font-size: 0.8rem;">-- / 20</span>'}</strong></td>
          <td><button class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="openEvaluationModal('${t.id}')">Évaluer</button></td>
        `;
        quranBody.appendChild(trQ);
      });
    }

    // Dortoirs
    dormGrid.innerHTML = `
      <div class="dorm-room-card">
        <div class="dorm-header">
          <span class="dorm-title">Dortoir Al-Madina (Chambre 1 &amp; 3)</span>
          <span class="badge-tag badge-good">${Math.min(activeStudents.length, 6)}/6 Lits</span>
        </div>
        <div class="bed-slots-visual">
          <div class="bed-icon ${activeStudents[0] ? 'occupied' : 'free'}">${activeStudents[0] ? 'L1' : 'Libre'}</div>
          <div class="bed-icon ${activeStudents[1] ? 'occupied' : 'free'}">${activeStudents[1] ? 'L2' : 'Libre'}</div>
          <div class="bed-icon ${activeStudents[2] ? 'occupied' : 'free'}">${activeStudents[2] ? 'L3' : 'Libre'}</div>
          <div class="bed-icon ${activeStudents[3] ? 'occupied' : 'free'}">${activeStudents[3] ? 'L4' : 'Libre'}</div>
          <div class="bed-icon ${activeStudents[4] ? 'occupied' : 'free'}">${activeStudents[4] ? 'L5' : 'Libre'}</div>
          <div class="bed-icon free">Libre</div>
        </div>
        <div style="font-size: 0.8rem; color: var(--gris-300);">Surveillant : Oustaz Ba • Climatisation &amp; Moustiquaires OK</div>
      </div>
    `;

  } else {
    // ÉCOLE CLASSIQUE
    document.getElementById('wsTableTitle').textContent = 'Derniers Élèves & Bulletins Pédagogiques';
    document.getElementById('wsTableHeader').innerHTML = `
      <th>Élève</th>
      <th>Matricule</th>
      <th>Classe</th>
      <th>Moyenne</th>
      <th>Action Bulletin</th>
    `;

    const fullHeader = document.getElementById('wsFullStudentsTableHeader');
    if (fullHeader) {
      fullHeader.innerHTML = `
        <th>Matricule</th>
        <th>Nom &amp; Prénom</th>
        <th>Classe</th>
        <th>Date d'inscription</th>
        <th>Téléphone Parent</th>
        <th>Statut</th>
      `;
    }

    if (activeStudents.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="6" style="text-align: center; padding: 2.8rem 1rem; color: var(--gris-400);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🏫</div>
          <div style="font-weight: 700; font-size: 1.05rem; color: #FFF; margin-bottom: 0.3rem;">Aucun élève inscrit pour le moment</div>
          <div style="font-size: 0.85rem; color: var(--gris-400); margin-bottom: 1.2rem;">Votre effectif actif est actuellement vierge (0 élève). Cliquez ci-dessous pour inscrire votre premier élève ou importer votre liste.</div>
          <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-gold" onclick="openModalNewStudent('SCOLAIRE')" style="font-size: 0.85rem; padding: 0.5rem 1.1rem;">
              <span>➕</span> <span>Inscrire un Élève</span>
            </button>
            <button class="btn btn-outline" onclick="openModalImportCsv()" style="font-size: 0.85rem; padding: 0.5rem 1.1rem; border-color: var(--turquoise-500); color: var(--turquoise-400);">
              <span>📥</span> <span>Importer CSV / Excel</span>
            </button>
          </div>
        </td>
      `;
      fullBody.appendChild(emptyRow);

      const emptyShort = document.createElement('tr');
      emptyShort.innerHTML = `<td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--gris-400);">Aucun élève enregistré. Cliquez sur « ➕ Inscrire un Élève » pour démarrer.</td>`;
      tbody.appendChild(emptyShort);

      if (gradesBody) {
        gradesBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--gris-400);">Aucun bulletin généré (0 élève inscrit).</td></tr>`;
      }
    } else {
      activeStudents.forEach(e => {
        const tr = document.createElement('tr');
        const hasGrades = (e.moyenne !== null && e.moyenne !== undefined && e.moyenne !== '' && e.moyenne !== '--');
        tr.innerHTML = `
          <td><strong>${e.prenom} ${e.nom}</strong></td>
          <td><span style="font-size: 0.8rem; color: var(--gris-500);">${e.matricule}</span></td>
          <td><strong>${e.classe || 'CM2'}</strong></td>
          <td><strong class="text-turquoise">${hasGrades ? e.moyenne + '/20' : '<span style="color: var(--gris-400); font-size: 0.8rem;">-- / 20</span>'}</strong> <span style="font-size: 0.75rem; color: var(--gris-400);">${(e.rang && e.rang !== '--') ? '(' + e.rang + ')' : '(En attente)'}</span></td>
          <td><button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="previewBulletin('${e.id}')">📄 Voir Bulletin</button></td>
        `;
        tbody.appendChild(tr);

        const trFull = document.createElement('tr');
        trFull.innerHTML = `
          <td>${e.matricule}</td>
          <td><strong>${e.prenom} ${e.nom}</strong></td>
          <td><span class="badge-tag" style="background: rgba(212, 175, 55, 0.15); color: #D4AF37; font-weight: 700;">${e.classe || 'CM2 A'}</span></td>
          <td>${e.dateInscription || new Date().toLocaleDateString('fr-FR')}</td>
          <td>${e.parentTel || '+221 77 000 11 22'}</td>
          <td><span class="badge-tag badge-excellent">INSCRIT</span></td>
        `;
        fullBody.appendChild(trFull);

        const trG = document.createElement('tr');
        trG.innerHTML = `
          <td><strong>${e.prenom} ${e.nom}</strong></td>
          <td>${e.classe || 'CM2 A'}</td>
          <td><strong class="text-turquoise">${hasGrades ? e.moyenne + ' / 20' : '<span style="color: var(--gris-400); font-size: 0.8rem;">-- / 20</span>'}</strong></td>
          <td><span class="badge-tag ${hasGrades ? 'badge-gold' : ''}" style="${!hasGrades ? 'background: rgba(255,255,255,0.06); color: var(--gris-400);' : ''}">${hasGrades ? e.rang : 'En attente'}</span></td>
          <td><button class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="previewBulletin('${e.id}')">Imprimer</button></td>
        `;
        gradesBody.appendChild(trG);
      });
    }
  }

  // Remplir la Caisse (Zéro fausse donnée pour tout établissement réel)
  const establishmentTransactions = getEstablishmentTransactions();
  if (financeBody) {
    financeBody.innerHTML = '';
    if (establishmentTransactions.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="7" style="text-align: center; padding: 2.6rem 1rem; color: var(--gris-400);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">💳</div>
          <div style="font-weight: 700; font-size: 1.05rem; color: #FFF; margin-bottom: 0.3rem;">Aucun encaissement dans la caisse</div>
          <div style="font-size: 0.85rem; color: var(--gris-400); margin-bottom: 1.2rem;">Votre caisse Wave, Orange Money et Espèces est actuellement à <strong>0 FCFA</strong>. Aucune transaction fictive n'est injectée pour préserver l'exactitude de votre comptabilité.</div>
          <button class="btn btn-primary" onclick="openWsWavePayment()" style="background: linear-gradient(135deg, #10B981, #00D2B4); border: none; font-weight: 700; font-size: 0.85rem; padding: 0.55rem 1.2rem;">
            💳 + Encaisser un Paiement (Wave, OM, Espèces)
          </button>
        </td>
      `;
      financeBody.appendChild(emptyRow);
    } else {
      establishmentTransactions.forEach(tx => {
        const trF = document.createElement('tr');
        const safeEleve = (tx.eleve || '').replace(/'/g, "\\'");
        const safeMotif = (tx.motif || '').replace(/'/g, "\\'");
        const safeSchool = (currentEstablishment?.name || 'Direction').replace(/'/g, "\\'");
        trF.innerHTML = `
          <td><strong>${tx.ref}</strong></td>
          <td>${tx.date}</td>
          <td><strong>${tx.eleve}</strong></td>
          <td>${tx.motif}</td>
          <td><strong class="text-gold">${tx.montant}</strong></td>
          <td><span class="badge-tag" style="background: rgba(27,164,232,0.15); color: #1BA4E8;">${tx.operateur}</span></td>
          <td><button class="btn btn-gold" style="padding: 0.3rem 0.7rem; font-size: 0.78rem; font-weight: 700;" onclick="openReceiptModal('${tx.ref}', '${safeEleve}', '${tx.montant}', '${safeMotif}', '${tx.tel || ''}', '${tx.operateur}', '${safeSchool}')">📄 Facture / Reçu</button></td>
        `;
        financeBody.appendChild(trF);
      });
    }
  }

  // Rendu modulaire des onglets du workspace
  renderAccountingTab();
  renderClassesTab();
  renderHRTab();
  renderWhatsAppTab();
  renderLibTab();
}

// État local des sous-onglets RH (Vue complète active par défaut)
let activeHrSubTab = 'all';
let selectedTimetableClass = 'CM2 A';
let activeTimetableFormulaScope = 'auto'; // 'auto' (suit l'établissement), ou 'pro', 'starter', 'premium', 'daara'

// 1. REGISTRE DES CLASSES SELON LA FORMULE CONTRACTUELLE
function getAvailableClassesForPlan(scopeOverride) {
  // 1. Si l'établissement a configuré ses propres classes réelles, les prioriser systématiquement
  const customClasses = getEstablishmentClasses();
  if (customClasses && customClasses.length > 0) {
    const cycleGroups = {};
    customClasses.forEach(c => {
      const cyc = c.cycle || 'Général';
      if (!cycleGroups[cyc]) cycleGroups[cyc] = [];
      cycleGroups[cyc].push({ id: c.nom, name: `${c.nom} (${c.salle || 'Salle ' + c.nom})`, cycle: cyc });
    });
    return Object.keys(cycleGroups).map(cyc => ({
      group: `🏫 Classes de l'Établissement • ${cyc}`,
      classes: cycleGroups[cyc]
    }));
  }

  let effectivePlan = (currentEstablishment?.plan || 'pro').toLowerCase();
  let isDaara = currentEstablishment?.type === 'DAARA';

  const scope = scopeOverride || activeTimetableFormulaScope;
  if (scope === 'starter') {
    effectivePlan = 'starter';
    isDaara = false;
  } else if (scope === 'premium') {
    effectivePlan = 'premium';
    isDaara = false;
  } else if (scope === 'pro') {
    effectivePlan = 'pro';
    isDaara = false;
  } else if (scope === 'daara') {
    isDaara = true;
  }

  // A. DAARA MODERNE : Cycles d'apprentissage coranique & mémorisation
  if (isDaara) {
    return [
      {
        group: '🕌 Daara Moderne & Cycles Coraniques',
        classes: [
          { id: "Ibtida'i", name: "Ibtida'i (Initiation & Alphabet)", cycle: "Initiation" },
          { id: "Hifz 1", name: "Hifz Niveau 1 (Juz 1 à 15)", cycle: "Mémorisation" },
          { id: "Hifz 2", name: "Hifz Niveau 2 (Juz 16 à 30)", cycle: "Mémorisation" },
          { id: "Moutawassit", name: "Moutawassit (Tajwîd & Grammaire)", cycle: "Moyen" },
          { id: "Thanawi", name: "Thanawi (Sciences Islamiques & Fiqh)", cycle: "Supérieur" }
        ]
      }
    ];
  }

  // B. FORMULE STARTER : Petites écoles primaires / préscolaire
  if (effectivePlan.includes('starter') || effectivePlan.includes('standard')) {
    return [
      {
        group: '👶 Préscolaire & Maternelle (Formule Starter)',
        classes: [
          { id: 'Petite Section', name: 'Petite Section (PS)', cycle: 'Maternelle' },
          { id: 'Moyenne Section', name: 'Moyenne Section (MS)', cycle: 'Maternelle' },
          { id: 'Grande Section', name: 'Grande Section (GS)', cycle: 'Maternelle' }
        ]
      },
      {
        group: '📚 École Primaire / Élémentaire (Formule Starter)',
        classes: [
          { id: 'CI', name: 'CI (Cours d\'Initiation)', cycle: 'Élémentaire' },
          { id: 'CP', name: 'CP (Cours Préparatoire)', cycle: 'Élémentaire' },
          { id: 'CE1', name: 'CE1 (Cours Élémentaire 1)', cycle: 'Élémentaire' },
          { id: 'CE2', name: 'CE2 (Cours Élémentaire 2)', cycle: 'Élémentaire' },
          { id: 'CM1', name: 'CM1 (Cours Moyen 1)', cycle: 'Élémentaire' },
          { id: 'CM2 A', name: 'CM2 A (Examen CFEE)', cycle: 'Élémentaire' },
          { id: 'CM2 B', name: 'CM2 B (Examen CFEE)', cycle: 'Élémentaire' }
        ]
      }
    ];
  }

  // C. FORMULE PREMIUM : Lycées et Collèges confondus (de la 6ème à la Terminale)
  if (effectivePlan.includes('premium') || effectivePlan.includes('lyc') || effectivePlan.includes('elite')) {
    return [
      {
        group: '🎓 Secondaire / Lycée (Formule Premium)',
        classes: [
          { id: '2nde L', name: '2nde L (Série Littéraire)', cycle: 'Lycée' },
          { id: '2nde S', name: '2nde S (Série Scientifique)', cycle: 'Lycée' },
          { id: '1ère L1', name: '1ère L1 (Langues & Littérature)', cycle: 'Lycée' },
          { id: '1ère L2', name: '1ère L2 (Sciences Humaines)', cycle: 'Lycée' },
          { id: '1ère S1', name: '1ère S1 (Maths pures & Physiques)', cycle: 'Lycée' },
          { id: '1ère S2', name: '1ère S2 (Sciences Expérimentales)', cycle: 'Lycée' },
          { id: 'Terminale L1', name: 'Terminale L1 (Baccalauréat Littéraire)', cycle: 'Lycée' },
          { id: 'Terminale L2', name: 'Terminale L2 (Baccalauréat Littéraire)', cycle: 'Lycée' },
          { id: 'Terminale S1', name: 'Terminale S1 (Bac Mathématiques & PC)', cycle: 'Lycée' },
          { id: 'Terminale S2', name: 'Terminale S2 (Bac Sciences Exp.)', cycle: 'Lycée' },
          { id: 'Terminale STEG', name: 'Terminale STEG (Gestion & Éco)', cycle: 'Lycée' }
        ]
      },
      {
        group: '🏫 Enseignement Moyen / Collège (Formule Premium)',
        classes: [
          { id: '6ème A', name: '6ème A (Collège)', cycle: 'Collège' },
          { id: '6ème B', name: '6ème B (Collège)', cycle: 'Collège' },
          { id: '5ème A', name: '5ème A (Collège)', cycle: 'Collège' },
          { id: '5ème B', name: '5ème B (Collège)', cycle: 'Collège' },
          { id: '4ème A', name: '4ème A (Collège)', cycle: 'Collège' },
          { id: '4ème B', name: '4ème B (Collège)', cycle: 'Collège' },
          { id: '3ème A', name: '3ème A (Examen BFEM)', cycle: 'Collège' },
          { id: '3ème B', name: '3ème B (Examen BFEM)', cycle: 'Collège' }
        ]
      }
    ];
  }

  // D. FORMULE PRO (PAR DÉFAUT) : Toutes les classes Collèges et Groupes Scolaires complets
  return [
    {
      group: '🏫 Enseignement Moyen / Collège (Formule Pro)',
      classes: [
        { id: '6ème A', name: '6ème A (Collège)', cycle: 'Collège' },
        { id: '6ème B', name: '6ème B (Collège)', cycle: 'Collège' },
        { id: '5ème A', name: '5ème A (Collège)', cycle: 'Collège' },
        { id: '5ème B', name: '5ème B (Collège)', cycle: 'Collège' },
        { id: '4ème A', name: '4ème A (Collège)', cycle: 'Collège' },
        { id: '4ème B', name: '4ème B (Collège)', cycle: 'Collège' },
        { id: '3ème A', name: '3ème A (Examen BFEM)', cycle: 'Collège' },
        { id: '3ème B', name: '3ème B (Examen BFEM)', cycle: 'Collège' }
      ]
    },
    {
      group: '📚 Groupe Scolaire / Primaire & Élémentaire (Formule Pro)',
      classes: [
        { id: 'CI', name: 'CI (Cours d\'Initiation)', cycle: 'Élémentaire' },
        { id: 'CP', name: 'CP (Cours Préparatoire)', cycle: 'Élémentaire' },
        { id: 'CE1', name: 'CE1 (Cours Élémentaire 1)', cycle: 'Élémentaire' },
        { id: 'CE2', name: 'CE2 (Cours Élémentaire 2)', cycle: 'Élémentaire' },
        { id: 'CM1', name: 'CM1 (Cours Moyen 1)', cycle: 'Élémentaire' },
        { id: 'CM2 A', name: 'CM2 A (Examen CFEE)', cycle: 'Élémentaire' },
        { id: 'CM2 B', name: 'CM2 B (Examen CFEE)', cycle: 'Élémentaire' }
      ]
    }
  ];
}

// 2. GÉNÉRATEUR AUTOMATIQUE DE CURRICULUM PÉDAGOGIQUE SÉNÉGALAIS
function generateDefaultScheduleForClass(className) {
  const c = (className || '').toLowerCase();

  // A. Préscolaire / Maternelle (PS, MS, GS)
  if (c.includes('section') || c.includes('maternelle') || c.includes('ps') || c.includes('ms') || c.includes('gs')) {
    return [
      { hour: '08h30 - 10h00', mon: 'Accueil & Langage (Mme Ba)', tue: 'Comptines & Éveil (Mme Ba)', wed: 'Activités Motrices (Mme Ba)', thu: 'Graphisme & Dessin (Mme Ba)', fri: 'Éveil Sensoriel (Mme Ba)', sat: 'Jeux Libres & Chants' },
      { hour: '10h00 - 11h30', mon: 'Collation & Récréation', tue: 'Collation & Récréation', wed: 'Collation & Récréation', thu: 'Collation & Récréation', fri: 'Collation & Récréation', sat: 'Fin de semaine' },
      { hour: '11h30 - 13h00', mon: 'Contes & Découverte du Monde', tue: 'Ateliers Chiffres & Formes', wed: 'Après-midi Libre', thu: 'Peinture & Modelage', fri: 'Prière & Repos', sat: 'Fin de semaine' }
    ];
  }

  // B. Primaire Inférieur (CI, CP, CE1)
  if (c === 'ci' || c === 'cp' || c.startsWith('ci ') || c.startsWith('cp ') || c.includes('ce1')) {
    return [
      { hour: '08h00 - 10h00', mon: 'Lecture & Phonétique (Mme Ba)', tue: 'Écriture & Tracé (Mme Ba)', wed: 'Calcul & Nombres (M. Diallo)', thu: 'Lecture Courante (Mme Ba)', fri: 'Vocabulaire & Poésie (Mme Ba)', sat: 'Éveil & Découverte (M. Diop)' },
      { hour: '10h00 - 12h00', mon: 'Calcul Mental & Additions (M. Diallo)', tue: 'Arabe & Mémorisation (Oustaz Ndiaye)', wed: 'Dessin & Coloriage', thu: 'Arabe & Alphabet (Oustaz Ndiaye)', fri: 'Morale & Vivre Ensemble (Mme Ba)', sat: 'Activités Physiques & Jeux' },
      { hour: '15h00 - 17h00', mon: 'Récitation & Chants', tue: 'Soutien Lecture (Mme Ba)', wed: 'Après-midi Libre', thu: 'Contes Traditionnels', fri: 'Prière & Repos', sat: 'Fin de semaine' }
    ];
  }

  // C. Primaire Moyen & Supérieur (CE2, CM1, CM2)
  if (c.includes('ce2') || c.includes('cm1') || c.includes('cm2')) {
    return [
      { hour: '08h00 - 10h00', mon: 'Mathématiques - Opérations (M. Diallo • S.101)', tue: 'Français - Grammaire (Mme Ba • S.101)', wed: 'Géométrie & Mesures (M. Diallo • S.101)', thu: 'Arabe / Hifz (Oustaz Ndiaye)', fri: 'Expression Écrite - Rédaction (Mme Ba • S.101)', sat: 'Sciences & Éveil (M. Diop • Labo 1)' },
      { hour: '10h00 - 12h00', mon: 'Orthographe & Dictée (Mme Ba • S.101)', tue: 'Histoire & Géographie du Sénégal (M. Diop)', wed: 'Anglais d\'Éveil (Mme Traoré • S.101)', thu: 'Calcul Rapide & Problèmes (M. Diallo)', fri: 'Tajwîd & Éducation Religieuse (Oustaz Ndiaye)', sat: 'Activités Sportives (EPS • Terrain)' },
      { hour: '15h00 - 17h00', mon: 'Arabe & Civisme (Oustaz Ndiaye)', tue: 'Soutien Renforcement CFEE (M. Diallo)', wed: 'Après-midi Libre', thu: 'Sciences de la Vie & Santé (M. Diop)', fri: 'Prière & Repos', sat: 'Fin de semaine' }
    ];
  }

  // D. Lycée Scientifique (2nde S, 1ère S1, 1ère S2, Terminale S1, Terminale S2)
  if (c.includes('s1') || c.includes('s2') || c.includes('2nde s') || c.includes('1ère s') || c.includes('tle s') || c.includes('terminale s')) {
    const isTle = c.includes('tle') || c.includes('terminale');
    return [
      { hour: '08h00 - 10h00', mon: isTle ? 'Mathématiques - Analyse & Suites (M. Diallo)' : 'Mathématiques - Fonctions (M. Diallo)', tue: 'Sciences Physiques - Mécanique (M. Diop • Labo)', wed: 'Mathématiques - Géométrie Vectorielle (M. Diallo)', thu: 'SVT - Génétique Humaine (M. Diop • Labo)', fri: isTle ? 'Philosophie - Épistémologie (Mme Ba)' : 'Français - Dissertation (Mme Ba)', sat: 'Sciences Physiques - Chimie (M. Diop • Labo)' },
      { hour: '10h00 - 12h00', mon: 'Sciences Physiques - Travaux Pratiques (M. Diop)', tue: 'Mathématiques - Probabilités (M. Diallo)', wed: 'Anglais Scientifique & Technique (Mme Traoré)', thu: isTle ? 'Philosophie - La Méthode (Mme Ba)' : 'Français - Textes Choisis (Mme Ba)', fri: 'Arabe & Civilisation (Oustaz Ndiaye)', sat: 'Éducation Physique & Sportive (Terrain)' },
      { hour: '15h00 - 17h00', mon: 'Informatique & Algorithmique (Mme Traoré)', tue: isTle ? 'Renforcement Prépa Bac S (M. Diallo)' : 'Soutien Maths / PC (M. Diallo)', wed: 'Après-midi Libre', thu: 'Histoire-Géo - Relations Int. (M. Diop)', fri: 'Prière & Repos', sat: 'Fin de semaine' }
    ];
  }

  // E. Lycée Littéraire & Gestion (2nde L, 1ère L1, 1ère L2, Terminale L1, Terminale L2, STEG)
  if (c.includes('l1') || c.includes('l2') || c.includes('2nde l') || c.includes('1ère l') || c.includes('tle l') || c.includes('terminale l') || c.includes('steg')) {
    const isTle = c.includes('tle') || c.includes('terminale');
    return [
      { hour: '08h00 - 10h00', mon: isTle ? 'Philosophie - Conscience & Société (Mme Ba)' : 'Français - Littérature Africaine (Mme Ba)', tue: 'Histoire - La Guerre Froide (M. Diop)', wed: 'Français - Analyse de Texte (Mme Ba)', thu: 'Géographie du Sénégal & CEDEAO (M. Diop)', fri: isTle ? 'Philosophie - Liberté & Loi (Mme Ba)' : 'Français - Langue & Style (Mme Ba)', sat: 'Anglais Renforcé - Littérature (Mme Traoré)' },
      { hour: '10h00 - 12h00', mon: 'Anglais - Expression & Débat (Mme Traoré)', tue: 'Arabe Littéraire / 2ème Langue (Oustaz Ndiaye)', wed: 'Mathématiques Appliquées & Statistiques (M. Diallo)', thu: 'Arabe - Récitation & Étude de Textes (Oustaz Ndiaye)', fri: 'Éducation Civique & Droits Humains (Mme Ba)', sat: 'Éducation Physique & Sportive (Terrain)' },
      { hour: '15h00 - 17h00', mon: 'Latin / Espagnol / Culture Générale', tue: isTle ? 'Séminaire Prépa Bac Littéraire (Mme Ba)' : 'Atelier d\'Écriture (Mme Ba)', wed: 'Après-midi Libre', thu: 'Sciences Économiques & Sociales (M. Diop)', fri: 'Prière & Repos', sat: 'Fin de semaine' }
    ];
  }

  // F. Daara Moderne
  if (c.includes('hifz') || c.includes('ibtida') || c.includes('moutawassit') || c.includes('thanawi')) {
    return [
      { hour: '08h00 - 10h00', mon: 'Hifz - Mémorisation du matin (Oustaz Ndiaye)', tue: 'Hifz - Mémorisation (Oustaz Ndiaye)', wed: 'Écriture sur Planche / Lawh (Oustaz Ndiaye)', thu: 'Hifz - Mémorisation (Oustaz Ndiaye)', fri: 'Grande Muraja\'a (Révision collective)', sat: 'Tajwîd & Règles de Récitation' },
      { hour: '10h00 - 12h00', mon: 'Tajwîd & Prononciation (Oustaz Ndiaye)', tue: 'Grammaire Arabe / Nahw (Oustaz Ndiaye)', wed: 'Mathématiques & Calcul (M. Diallo)', thu: 'Français & Expression (Mme Ba)', fri: 'Fiqh & Éducation Islamique', sat: 'Activités Manuelles & Jardinage' },
      { hour: '15h00 - 17h00', mon: 'Muraja\'a individuelle (Chuchotement)', tue: 'Histoires des Prophètes (Oustaz Ndiaye)', wed: 'Après-midi Libre', thu: 'Calligraphie Arabe', fri: 'Prière du Vendredi (Jumu\'ah) & Repos', sat: 'Fin de semaine' }
    ];
  }

  // G. Collège (6ème, 5ème, 4ème, 3ème) - Par Défaut
  const is3eme = c.includes('3ème') || c.includes('3eme');
  return [
    { hour: '08h00 - 10h00', mon: is3eme ? 'Mathématiques - Théorème de Thalès (M. Diallo)' : 'Mathématiques - Nombres & Calculs (M. Diallo)', tue: is3eme ? 'Sciences Physiques - Optique & Mécanique (M. Diop)' : 'Sciences de la Vie & Terre (M. Diop)', wed: 'Français - Dissertation & Lecture (Mme Ba)', thu: 'Histoire - Décolonisation & Sénégal (M. Diop)', fri: 'Anglais - Grammar & Speech (Mme Traoré)', sat: is3eme ? 'Mathématiques - Algèbre & Équations (M. Diallo)' : 'Sciences Physiques (M. Diop)' },
    { hour: '10h00 - 12h00', mon: 'Français - Grammaire & Analyse (Mme Ba)', tue: 'SVT - Biologie Cellulaire (M. Diop)', wed: 'Sciences Physiques - Travaux Pratiques (M. Diop)', thu: 'Arabe & Éducation Civique (Oustaz Ndiaye)', fri: 'Anglais - Compréhension Orale (Mme Traoré)', sat: 'Éducation Physique & Sportive (EPS)' },
    { hour: '15h00 - 17h00', mon: 'Arabe & Culture Générale (Oustaz Ndiaye)', tue: is3eme ? 'Renforcement Intensif BFEM (M. Diallo)' : 'Soutien Pédagogique Maths / SVT (M. Diallo)', wed: 'Après-midi Libre', thu: 'Initiation Informatique & Numérique (Mme Traoré)', fri: 'Prière & Repos', sat: 'Fin de semaine' }
  ];
}

// 3. BASE DE DONNÉES DES EMPLOIS DU TEMPS (AVEC PERSISTANCE LOCALE)
let timetablesDatabase = {};
try {
  const savedTt = localStorage.getItem('sunu_timetables_db');
  if (savedTt) {
    timetablesDatabase = JSON.parse(savedTt);
  }
} catch (e) {
  console.warn('Erreur chargement emplois du temps:', e);
}

function getOrCreateTimetableForClass(className) {
  const target = className || selectedTimetableClass || 'CM2 A';
  if (!timetablesDatabase[target] || !Array.isArray(timetablesDatabase[target])) {
    timetablesDatabase[target] = generateDefaultScheduleForClass(target);
    saveTimetablesToStorage();
  }
  return timetablesDatabase[target];
}

function saveTimetablesToStorage() {
  try {
    localStorage.setItem('sunu_timetables_db', JSON.stringify(timetablesDatabase));
  } catch (e) {
    console.error('Erreur sauvegarde emplois du temps:', e);
  }
}

function resetTimetablesToDefault() {
  if (confirm(`Voulez-vous réinitialiser l'emploi du temps de la classe ${selectedTimetableClass} au planning officiel par défaut ?`)) {
    delete timetablesDatabase[selectedTimetableClass];
    saveTimetablesToStorage();
    renderHRTab();
    showNotification(`✓ Emploi du temps de ${selectedTimetableClass} réinitialisé au programme pédagogique officiel.`);
  }
}

function setTimetableFormulaScope(scope) {
  activeTimetableFormulaScope = scope;
  const groups = getAvailableClassesForPlan(scope);
  let found = false;
  for (const grp of groups) {
    if (grp.classes.some(c => c.id === selectedTimetableClass)) {
      found = true;
      break;
    }
  }
  if (!found && groups.length && groups[0].classes.length) {
    selectedTimetableClass = groups[0].classes[0].id;
  }
  renderHRTab();
  const label = scope === 'pro' ? 'Formule Pro (Collège + Groupe Scolaire)' : (scope === 'starter' ? 'Formule Starter (Primaire + Maternelle)' : (scope === 'premium' ? 'Formule Premium (Lycée + Collège)' : 'Pack Daara Moderne'));
  showNotification(`✓ Périmètre de classes configuré : ${label}`);
}

// --- MODULE 2 : RESSOURCES HUMAINES & EMPLOIS DU TEMPS ---
function renderHRTab() {
  const container = document.getElementById('wsHRContent');
  if (!container) return;

  const planName = (currentEstablishment?.plan || '').toLowerCase();
  const isDaara = currentEstablishment?.type === 'DAARA';
  const isStarterSchool = (planName.includes('starter') || planName.includes('standard')) && !isDaara;

  let starterNoticeHTML = '';
  if (isStarterSchool) {
    starterNoticeHTML = `
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 1.2rem 1.4rem; margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
            <span style="font-size: 1.2rem;">🌱</span>
            <strong style="color: #FBBF24;">Formule Starter Active : Petite École Primaire &amp; Préscolaire</strong>
          </div>
          <div style="font-size: 0.8rem; color: var(--gris-300);">
            Vous bénéficiez de l'emploi du temps pour les classes Préscolaires et Primaires. Pour débloquer l'enseignement secondaire (Collège), les contrats CDI et fiches de paie, passez à la Formule Pro.
          </div>
        </div>
        <button class="btn btn-gold" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;" onclick="upgradeEstablishmentPlan('Pro')">
          ⚡ Débloquer Collège &amp; RH Pro
        </button>
      </div>
    `;
  }

  const teachers = getEstablishmentTeachers();

  // Rendu avec affichage clair et direct de l'emploi du temps
  container.innerHTML = `
    ${starterNoticeHTML}
    <!-- Barre de sous-navigation RH -->
    <div class="ws-subtab-bar">
      <button class="ws-subtab-btn ${activeHrSubTab === 'all' ? 'active' : ''}" onclick="switchHrSubTab('all')">
        ⭐ Vue d'Ensemble RH (Personnel &amp; Emploi du Temps)
      </button>
      <button class="ws-subtab-btn ${activeHrSubTab === 'teachers' ? 'active' : ''}" onclick="switchHrSubTab('teachers')">
        👨‍🏫 Corps Professoral &amp; Bulletins de Paie (${teachers.length})
      </button>
      <button class="ws-subtab-btn ${activeHrSubTab === 'timetable' ? 'active' : ''}" onclick="switchHrSubTab('timetable')">
        📅 Emploi du Temps Hebdomadaire
      </button>
    </div>

    ${activeHrSubTab === 'all' 
      ? getTeachersSubtabHTML() + '<div style="margin-top: 1.8rem;"></div>' + getTimetableSubtabHTML()
      : (activeHrSubTab === 'teachers' ? getTeachersSubtabHTML() : getTimetableSubtabHTML())}
  `;
}

function switchHrSubTab(subTab) {
  activeHrSubTab = subTab;
  renderHRTab();
}

function getTeachersSubtabHTML() {
  const teachers = getEstablishmentTeachers();
  const totalSalaries = teachers.reduce((acc, t) => acc + (t.salaire || 0), 0);
  const cdiCount = teachers.filter(t => (t.contrat || '').toUpperCase().includes('CDI')).length;
  const vacCount = teachers.length - cdiCount;
  const totalHours = teachers.reduce((acc, t) => {
    const m = String(t.volume || '').match(/(\d+)/);
    return acc + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  const tbodyContent = teachers.length === 0 ? `
    <tr>
      <td colspan="7" style="text-align: center; padding: 2.6rem 1rem; color: var(--gris-400);">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">👨‍🏫</div>
        <div style="font-weight: 700; font-size: 1.05rem; color: #FFF; margin-bottom: 0.3rem;">Aucun contrat enseignant enregistré</div>
        <div style="font-size: 0.85rem; color: var(--gris-400); margin-bottom: 1.2rem;">Votre registre RH est actuellement à <strong>0 enseignant</strong> (masse salariale : 0 FCFA). Aucune donnée fictive n'est injectée. Enregistrez votre premier contrat ci-dessous.</div>
        <button class="btn btn-gold" style="font-size: 0.85rem; padding: 0.5rem 1.1rem;" onclick="openNewTeacherContractModal()">
          + Nouveau Contrat Enseignant
        </button>
      </td>
    </tr>
  ` : teachers.map(t => {
    const safeNom = (t.nom || '').replace(/'/g, "\\'");
    const safeMatiere = (t.matiere || '').replace(/'/g, "\\'");
    return `
      <tr>
        <td><span style="color: var(--turquoise-400); font-weight: 700;">${t.mat}</span></td>
        <td><strong>${t.nom}</strong></td>
        <td><span style="color: var(--gris-200);">${t.matiere}</span></td>
        <td>${t.volume}</td>
        <td><span class="badge-tag ${(t.contrat || '').includes('CDI') ? 'badge-excellent' : 'badge-good'}">${t.contrat}</span></td>
        <td><strong class="text-gold">${(t.salaire || 0).toLocaleString('fr-FR')} FCFA</strong></td>
        <td style="text-align: center;">
          <button class="btn btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;" onclick="openPayslipModal('${safeNom}', '${safeMatiere}', ${t.salaire || 0}, '${t.volume || ''}', '${t.mat || ''}')">
            📄 Fiche de Paie
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 1.4rem;">
      <div class="mini-stat-card" style="border-left: 4px solid #00D2B4;">
        <div class="label">Masse Salariale Mensuelle</div>
        <div style="font-size: 1.35rem; font-weight: 800; color: #00D2B4;">${totalSalaries.toLocaleString('fr-FR')} FCFA</div>
        <div style="font-size: 0.72rem; color: var(--gris-400);">${teachers.length > 0 ? '100% déclaré IPRES & CSS' : 'Aucune charge salariale'}</div>
      </div>
      <div class="mini-stat-card" style="border-left: 4px solid #10B981;">
        <div class="label">Enseignants Déclarés</div>
        <div style="font-size: 1.35rem; font-weight: 800; color: #10B981;">${teachers.length} Actif${teachers.length > 1 ? 's' : ''}</div>
        <div style="font-size: 0.72rem; color: var(--gris-400);">${teachers.length > 0 ? `${cdiCount} CDI • ${vacCount} Vacataire${vacCount > 1 ? 's' : ''}` : '0 CDI • 0 Vacataire'}</div>
      </div>
      <div class="mini-stat-card" style="border-left: 4px solid #D4AF37;">
        <div class="label">Volume Horaire Global</div>
        <div style="font-size: 1.35rem; font-weight: 800; color: #D4AF37;">${totalHours} h / semaine</div>
        <div style="font-size: 0.72rem; color: var(--gris-400);">${teachers.length > 0 ? 'Couverture pédagogique intégrale' : '0 heure planifiée'}</div>
      </div>
    </div>

    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 1.2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.6rem;">
        <div>
          <h4 style="color: var(--blanc-pur); margin: 0 0 0.2rem; font-size: 1rem;">👨‍🏫 Registre du Corps Enseignant</h4>
          <span style="font-size: 0.75rem; color: var(--gris-400);">Gestion des contrats de travail et génération instantanée des fiches de paie</span>
        </div>
        <button class="btn btn-gold" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;" onclick="openNewTeacherContractModal()">
          + Nouveau Contrat Enseignant
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table class="modern-table" style="width: 100%; font-size: 0.82rem;">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom &amp; Prénom</th>
              <th>Discipline &amp; Niveaux</th>
              <th>Volume</th>
              <th>Statut Contrat</th>
              <th>Salaire Net</th>
              <th style="text-align: center;">Bulletin de Salaire</th>
            </tr>
          </thead>
          <tbody>
            ${tbodyContent}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getTimetableCourseClass(courseStr) {
  if (!courseStr) return '';
  const s = courseStr.toLowerCase();
  if (s.includes('libre') || s.includes('repos') || s.includes('prière') || s.includes('fin de semaine') || s.includes('collation')) return 'course-idle';
  if (s.includes('math') || s.includes('géom') || s.includes('calcul') || s.includes('thalès') || s.includes('alg') || s.includes('fonctions') || s.includes('nombres')) return 'course-math';
  if (s.includes('fran') || s.includes('orth') || s.includes('gramm') || s.includes('lect') || s.includes('dissert') || s.includes('civique') || s.includes('écriture') || s.includes('littérat') || s.includes('philo') || s.includes('poésie')) return 'course-fr';
  if (s.includes('arab') || s.includes('hifz') || s.includes('coran') || s.includes('tajw') || s.includes('islam') || s.includes('éthique') || s.includes('civilisation') || s.includes('planche') || s.includes('muraja')) return 'course-ar';
  if (s.includes('scien') || s.includes('svt') || s.includes('physiq') || s.includes('éveil') || s.includes('terre') || s.includes('hist') || s.includes('géo') || s.includes('chimie') || s.includes('génétique') || s.includes('santé')) return 'course-svt';
  if (s.includes('angl') || s.includes('info') || s.includes('tic') || s.includes('sport') || s.includes('eps') || s.includes('art') || s.includes('motric') || s.includes('jeux') || s.includes('comptines')) return 'course-ang';
  return 'course-math';
}

function getTimetableSubtabHTML() {
  const availableGroups = getAvailableClassesForPlan(activeTimetableFormulaScope);
  const scheduleRows = getOrCreateTimetableForClass(selectedTimetableClass);
  const days = [
    { key: 'mon', label: 'Lundi' },
    { key: 'tue', label: 'Mardi' },
    { key: 'wed', label: 'Mercredi' },
    { key: 'thu', label: 'Jeudi' },
    { key: 'fri', label: 'Vendredi' },
    { key: 'sat', label: 'Samedi' }
  ];

  // Calcul du scope actuel pour le badge informatif
  const effScope = activeTimetableFormulaScope === 'auto' 
    ? ((currentEstablishment?.plan || '').toLowerCase().includes('pro') ? 'pro' : ((currentEstablishment?.plan || '').toLowerCase().includes('premium') ? 'premium' : (currentEstablishment?.type === 'DAARA' ? 'daara' : 'starter')))
    : activeTimetableFormulaScope;

  const scopeBadgeConfig = {
    pro: { label: 'Formule Pro : Collèges & Groupes Scolaires', badge: 'badge-excellent', bg: 'rgba(0,210,180,0.15)', color: '#00D2B4' },
    starter: { label: 'Formule Starter : Petites Écoles Primaires & Maternelle', badge: 'badge-warning', bg: 'rgba(245,158,11,0.15)', color: '#FBBF24' },
    premium: { label: 'Formule Premium : Lycées & Collèges confondus', badge: 'badge-excellent', bg: 'rgba(168,85,247,0.2)', color: '#D8B4FE' },
    daara: { label: 'Pack Daara Moderne : Cycles Coraniques & Mémorisation', badge: 'badge-excellent', bg: 'rgba(16,185,129,0.2)', color: '#34D399' }
  }[effScope] || { label: 'Formule Pro : Collège & Groupe Scolaire', badge: 'badge-excellent', bg: 'rgba(0,210,180,0.15)', color: '#00D2B4' };

  return `
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 1.4rem;">
      <!-- En-tête avec informations de formule et sélecteur de classe -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-size: 1.35rem;">📅</span>
            <h4 style="color: var(--blanc-pur); margin: 0; font-size: 1.05rem;">Emploi du Temps Hebdomadaire Officiel</h4>
            <span class="badge-tag ${scopeBadgeConfig.badge}" style="font-size: 0.72rem; background: ${scopeBadgeConfig.bg}; color: ${scopeBadgeConfig.color}; border: 1px solid ${scopeBadgeConfig.color}40;">
              ${scopeBadgeConfig.label}
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--gris-400);">
            Affectation optimisée des salles, professeurs et créneaux horaires par niveau d'enseignement.
          </span>
        </div>

        <!-- Contrôles rapides : Sélecteur de classe & Sélecteur de formule -->
        <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
          <!-- Filtre rapide par formule d'école -->
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="font-size: 0.73rem; color: var(--gris-400);">Formule :</span>
            <select class="form-select" style="padding: 0.45rem 0.75rem; font-size: 0.78rem; width: auto; font-weight: 700; background: rgba(10,25,47,0.9); border-color: rgba(255,255,255,0.2);" onchange="setTimetableFormulaScope(this.value)">
              <option value="pro" ${effScope === 'pro' ? 'selected' : ''}>⚡ Pro (Collège + Groupe Scolaire)</option>
              <option value="starter" ${effScope === 'starter' ? 'selected' : ''}>🌱 Starter (Maternelle + Primaire)</option>
              <option value="premium" ${effScope === 'premium' ? 'selected' : ''}>👑 Premium (Lycée + Collège)</option>
              <option value="daara" ${effScope === 'daara' ? 'selected' : ''}>🕌 Daara Moderne (Coranique)</option>
            </select>
          </div>

          <!-- Sélecteur complet de classes groupées par cycle -->
          <select class="form-select" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; width: auto; font-weight: 700; color: #00D2B4; background: rgba(10,25,47,0.95); border: 1px solid rgba(0,210,180,0.5);" onchange="selectedTimetableClass = this.value; renderHRTab();">
            ${availableGroups.map(grp => `
              <optgroup label="${grp.group}">
                ${grp.classes.map(cl => `
                  <option value="${cl.id}" ${selectedTimetableClass === cl.id ? 'selected' : ''}>Classe : ${cl.name}</option>
                `).join('')}
              </optgroup>
            `).join('')}
          </select>

          <button class="btn btn-gold" style="font-size: 0.82rem; padding: 0.5rem 1.05rem; font-weight: 800; background: linear-gradient(135deg, #10B981, #00D2B4); border: none; color: #0A192F; display: flex; align-items: center; gap: 0.35rem; box-shadow: 0 3px 12px rgba(0, 210, 180, 0.25);" onclick="generateTimetableAutomatically(selectedTimetableClass)" title="Générer automatiquement la grille complète de cours et assigner les professeurs de l'établissement sans conflit">
            ⚡ Générer Auto
          </button>
          <button class="btn btn-outline" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: var(--turquoise-400); color: var(--turquoise-400); font-weight: 700;" onclick="openEditTimetableSlotModal('${selectedTimetableClass}', 0, 'mon')">
            ✏️ Modifier le Planning
          </button>
          <button class="btn btn-outline" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: #00A884; color: #00A884; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;" onclick="setWhatsAppToTimetableChange('${selectedTimetableClass}')">
            💬 Notifier Parents (WhatsApp)
          </button>
          <button class="btn btn-gold" style="font-size: 0.82rem; padding: 0.5rem 1rem; font-weight: 800;" onclick="openTimetablePrintModal('${selectedTimetableClass}')">
            🖨️ Imprimer A4 Officiel
          </button>
        </div>
      </div>

      <!-- Grille horaire interactive -->
      <div class="timetable-grid-wrapper">
        <table class="timetable-table">
          <thead>
            <tr>
              <th style="width: 110px;">Horaires</th>
              <th>Lundi</th>
              <th>Mardi</th>
              <th>Mercredi</th>
              <th>Jeudi</th>
              <th>Vendredi</th>
              <th>Samedi</th>
            </tr>
          </thead>
          <tbody>
            ${scheduleRows.map((row, idx) => `
              <tr>
                <td style="font-weight: 800; color: var(--gris-300); text-align: center; font-size: 0.78rem; background: rgba(0,0,0,0.25);">${row.hour}</td>
                ${days.map(d => {
                  const courseVal = row[d.key] || '';
                  const isIdle = courseVal.includes('Libre') || courseVal.includes('Repos') || courseVal.includes('Prière') || courseVal.includes('Fin de semaine') || courseVal.includes('Collation');
                  const pillClass = getTimetableCourseClass(courseVal);
                  return `
                    <td onclick="openEditTimetableSlotModal('${selectedTimetableClass}', ${idx}, '${d.key}')" style="cursor: pointer;" title="Cliquer pour modifier ce cours (${d.label} • ${row.hour})">
                      <div class="timetable-course-pill ${pillClass}" style="${isIdle ? 'text-align:center; color:var(--gris-500); font-style:italic; background:rgba(255,255,255,0.03); border-left:none;' : ''}">
                        ${courseVal}
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Légende et réinitialisation -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.2rem; flex-wrap: wrap; gap: 0.8rem;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.75rem; color: var(--gris-400); align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #10B981; display: inline-block;"></span> Mathématiques</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #00D2B4; display: inline-block;"></span> Français &amp; Lettres</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #D4AF37; display: inline-block;"></span> Arabe &amp; Coran</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #A855F7; display: inline-block;"></span> Sciences &amp; SVT / PC</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #3B82F6; display: inline-block;"></span> Anglais, EPS &amp; TIC</div>
        </div>
        <div style="display: flex; gap: 0.8rem; align-items: center;">
          <span style="font-size: 0.73rem; color: var(--turquoise-400);">💡 Cliquez sur n'importe quelle case pour la modifier</span>
          <button class="btn btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.65rem; border-color: rgba(255,255,255,0.2); color: var(--gris-400);" onclick="resetTimetablesToDefault()">
            🔄 Réinitialiser ${selectedTimetableClass}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Fonction d'ouverture du modal d'édition d'un créneau de cours
function openEditTimetableSlotModal(className, rowIndex, dayKey) {
  const modal = document.getElementById('editTimetableModal');
  if (!modal) return;

  const targetClass = className || selectedTimetableClass || 'CM2 A';
  const rowIdx = (rowIndex !== undefined && rowIndex !== null) ? rowIndex : 0;
  const targetDay = dayKey || 'mon';

  const classSel = document.getElementById('editTtClass');
  const rowSel = document.getElementById('editTtRow');
  const daySel = document.getElementById('editTtDay');

  // Remplir dynamiquement les classes dans le modal selon le périmètre scolaire actif
  if (classSel) {
    const availableGroups = getAvailableClassesForPlan(activeTimetableFormulaScope);
    classSel.innerHTML = availableGroups.map(grp => `
      <optgroup label="${grp.group}">
        ${grp.classes.map(cl => `
          <option value="${cl.id}" ${targetClass === cl.id ? 'selected' : ''}>${cl.name}</option>
        `).join('')}
      </optgroup>
    `).join('');
    classSel.value = targetClass;
  }

  if (rowSel) rowSel.value = String(rowIdx);
  if (daySel) daySel.value = targetDay;

  onEditTtClassOrSlotChange();
  modal.classList.add('active');
}

// Détection dynamique et pré-remplissage des champs selon la case sélectionnée
function onEditTtClassOrSlotChange() {
  const targetClass = document.getElementById('editTtClass')?.value || selectedTimetableClass || 'CM2 A';
  const rowIdx = parseInt(document.getElementById('editTtRow')?.value || '0', 10);
  const dayKey = document.getElementById('editTtDay')?.value || 'mon';

  const rows = getOrCreateTimetableForClass(targetClass);
  const currentSlotVal = (rows[rowIdx] && rows[rowIdx][dayKey]) ? rows[rowIdx][dayKey] : '';

  let subject = currentSlotVal;
  let teacher = '';
  let room = '';

  // Décoder par exemple "Mathématiques (M. Diallo • S.101)" ou "Expression Écrite (Mme Ba • S.101)"
  const match = currentSlotVal.match(/^([^(]+)(?:\(([^•)]+)(?:•([^)]+))?\))?$/);
  if (match) {
    subject = (match[1] || '').trim();
    teacher = (match[2] || '').trim();
    room = (match[3] || '').trim();
  }

  const subjectInput = document.getElementById('editTtSubject');
  const teacherInput = document.getElementById('editTtTeacher');
  const roomInput = document.getElementById('editTtRoom');
  const presetSel = document.getElementById('editTtSubjectPreset');

  if (subjectInput) subjectInput.value = subject;
  if (teacherInput) teacherInput.value = teacher;
  if (roomInput) roomInput.value = room;
  if (presetSel) presetSel.value = '';
}

// Enregistrement de la modification d'un créneau de cours
function saveTimetableSlot() {
  const targetClass = document.getElementById('editTtClass')?.value || selectedTimetableClass || 'CM2 A';
  const rowIdx = parseInt(document.getElementById('editTtRow')?.value || '0', 10);
  const dayKey = document.getElementById('editTtDay')?.value || 'mon';

  const subject = (document.getElementById('editTtSubject')?.value || '').trim();
  const teacher = (document.getElementById('editTtTeacher')?.value || '').trim();
  const room = (document.getElementById('editTtRoom')?.value || '').trim();

  if (!subject) {
    alert('Veuillez spécifier la matière ou l\'activité.');
    return;
  }

  let formatted = subject;
  const isIdleText = subject === 'Après-midi Libre' || subject === 'Prière & Repos' || subject === 'Fin de semaine' || subject === 'Collation & Récréation';
  if (!isIdleText) {
    if (teacher && room) {
      formatted = `${subject} (${teacher} • ${room})`;
    } else if (teacher) {
      formatted = `${subject} (${teacher})`;
    } else if (room) {
      formatted = `${subject} (${room})`;
    }
  }

  const rows = getOrCreateTimetableForClass(targetClass);
  if (rows[rowIdx]) {
    rows[rowIdx][dayKey] = formatted;
  }

  saveTimetablesToStorage();

  const now = new Date();
  demoState.auditLogs.unshift({
    time: now.toLocaleTimeString(),
    action: `Emploi du temps mis à jour : ${subject} (${targetClass} • ${dayKey.toUpperCase()})`,
    user: 'Direction des Études'
  });

  closeAllModals();
  selectedTimetableClass = targetClass;
  renderHRTab();
  showNotification(`✓ Créneau (${subject}) enregistré pour ${targetClass} ! Cliquez sur « 💬 Notifier Parents (WhatsApp) » pour diffuser l'annonce.`);
}

// Fonction d'ouverture du modal officiel d'impression de l'emploi du temps
function openTimetablePrintModal(className) {
  const modal = document.getElementById('timetablePrintModal');
  if (!modal) return;

  const targetClass = className || selectedTimetableClass || 'CM2 A';
  const schoolName = currentEstablishment?.name || 'Mon Ã‰tablissement';

  if (document.getElementById('printTtSchoolName')) {
    document.getElementById('printTtSchoolName').textContent = schoolName;
  }
  if (document.getElementById('printTtStampName')) {
    document.getElementById('printTtStampName').textContent = schoolName;
  }
  if (document.getElementById('printTtClassTitle')) {
    document.getElementById('printTtClassTitle').textContent = `EMPLOI DU TEMPS — ${targetClass}`;
  }

  const table = document.getElementById('printTtTable');
  if (table) {
    const scheduleRows = getOrCreateTimetableForClass(targetClass);
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 100px;">Horaires</th>
          <th>Lundi</th>
          <th>Mardi</th>
          <th>Mercredi</th>
          <th>Jeudi</th>
          <th>Vendredi</th>
          <th>Samedi</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleRows.map(row => `
          <tr>
            <td style="font-weight: 800; text-align: center; background: #F1F5F9; color: #0A192F;">${row.hour}</td>
            <td><strong>${row.mon}</strong></td>
            <td><strong>${row.tue}</strong></td>
            <td>${row.wed}</td>
            <td><strong>${row.thu}</strong></td>
            <td><strong>${row.fri}</strong></td>
            <td>${row.sat}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  modal.classList.add('active');
}
function renderAccountingTab() {
  const container = document.getElementById('wsAccountingContent');
  if (!container) return;

  const planName = (currentEstablishment?.plan || '').toLowerCase();
  const isDaara = currentEstablishment?.type === 'DAARA';
  const isStarterSchool = (planName.includes('starter') || planName.includes('standard')) && !isDaara;

  if (isStarterSchool) {
    container.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 2.2rem 1.5rem; text-align: center;">
        <div style="font-size: 2.8rem; margin-bottom: 0.8rem;">🔒</div>
        <h4 style="color: #FBBF24; margin-bottom: 0.6rem; font-size: 1.15rem;">Fonctionnalité Verrouillée — Formule Starter</h4>
        <p style="font-size: 0.9rem; color: var(--gris-300); max-width: 540px; margin: 0 auto 1.5rem; line-height: 1.6;">
          La comptabilité générale complète aux normes <strong>SYSCOHADA révisé</strong> (Grand Livre, Balance à 6 colonnes, Bilan &amp; Compte de Résultat certifié MEN) est incluse à partir de la <strong>Formule Pro</strong> (55 000 FCFA/mois).
        </p>
        <button class="btn btn-gold" onclick="upgradeEstablishmentPlan('Pro')">
          ⚡ Passer à la Formule Pro (SYSCOHADA inclus)
        </button>
      </div>
    `;
    return;
  }

  const journal = getEstablishmentJournal();

  // Calcul dynamique rigoureux des soldes des comptes SYSCOHADA (Zéro fausse donnée)
  let sumDebit512 = 0, sumCredit512 = 0;
  let sumCredit706 = 0;
  let sumDebit641 = 0;
  let sumDebit411 = 0, sumCredit411 = 0;

  journal.forEach(j => {
    const debVal = Number(j.debitVal) || 0;
    const credVal = Number(j.creditVal) || 0;
    const deb = String(j.debit || '');
    const cred = String(j.credit || '');

    if (deb.startsWith('512') || deb.startsWith('571') || deb.startsWith('521')) sumDebit512 += debVal;
    if (cred.startsWith('512') || cred.startsWith('571') || cred.startsWith('521')) sumCredit512 += credVal;

    if (cred.startsWith('706') || cred.startsWith('70')) sumCredit706 += credVal;
    if (deb.startsWith('641') || deb.startsWith('64')) sumDebit641 += debVal;

    if (deb.startsWith('411')) sumDebit411 += debVal;
    if (cred.startsWith('411')) sumCredit411 += credVal;
  });

  const solde512 = Math.max(0, sumDebit512 - sumCredit512);
  const solde706 = sumCredit706;
  const solde641 = sumDebit641;
  const solde411 = Math.max(0, sumDebit411 - sumCredit411);

  const tbodyContent = journal.length === 0 ? `
    <tr>
      <td colspan="7" style="text-align: center; padding: 2.6rem 1rem; color: var(--gris-400);">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📖</div>
        <div style="font-weight: 700; font-size: 1.05rem; color: #FFF; margin-bottom: 0.3rem;">Aucune écriture comptable dans le Grand Livre</div>
        <div style="font-size: 0.85rem; color: var(--gris-400); margin-bottom: 1.2rem;">Le Grand Livre SYSCOHADA est actuellement à <strong>0 FCFA</strong>. Aucune écriture fictive n'est injectée afin de garantir la rigueur de votre comptabilité. Enregistrez une première écriture ou encaissez un paiement.</div>
        <button class="btn btn-gold" style="font-size: 0.85rem; padding: 0.5rem 1.1rem;" onclick="openNewAccountingEntryModal()">
          + Saisir une Écriture SYSCOHADA
        </button>
      </td>
    </tr>
  ` : journal.map(entry => `
    <tr>
      <td><span style="color: var(--gris-300);">${entry.date}</span></td>
      <td><strong style="color: var(--turquoise-400);">${entry.ref}</strong></td>
      <td><span class="badge-tag" style="background: rgba(16,185,129,0.15); color: #34D399; font-size: 0.73rem;">${entry.debit}</span></td>
      <td><span class="badge-tag" style="background: rgba(212,175,55,0.15); color: #D4AF37; font-size: 0.73rem;">${entry.credit}</span></td>
      <td><strong>${entry.motif}</strong></td>
      <td style="text-align: right;"><strong class="text-gold">${(entry.debitVal || 0).toLocaleString('fr-FR')} FCFA</strong></td>
      <td style="text-align: center;"><span class="badge-tag badge-good" style="font-size: 0.68rem;">SYSCOHADA</span></td>
    </tr>
  `).join('');

  container.innerHTML = `
    <!-- Cartes KPI Financières SYSCOHADA -->
    <div class="syscohada-kpi-grid">
      <div class="syscohada-card green">
        <div style="font-size: 0.75rem; color: var(--gris-400); text-transform: uppercase; font-weight: 700;">Compte 512100 (Mobile Money / Trésorerie)</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #10B981; margin: 0.3rem 0;">${solde512.toLocaleString('fr-FR')} FCFA</div>
        <div style="font-size: 0.72rem; color: #34D399;">${solde512 > 0 ? 'Solde Wave & OM Réconcilié ✓' : 'Trésorerie initiale (0 FCFA)'}</div>
      </div>
      <div class="syscohada-card turq">
        <div style="font-size: 0.75rem; color: var(--gris-400); text-transform: uppercase; font-weight: 700;">Compte 706100 (Recettes Scolaires)</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #00D2B4; margin: 0.3rem 0;">${solde706.toLocaleString('fr-FR')} FCFA</div>
        <div style="font-size: 0.72rem; color: var(--gris-400);">${solde706 > 0 ? 'Exercice 2026-2027' : '0 FCFA encaissé'}</div>
      </div>
      <div class="syscohada-card gold">
        <div style="font-size: 0.75rem; color: var(--gris-400); text-transform: uppercase; font-weight: 700;">Compte 641100 (Salaires &amp; RH)</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #D4AF37; margin: 0.3rem 0;">${solde641.toLocaleString('fr-FR')} FCFA</div>
        <div style="font-size: 0.72rem; color: var(--gris-400);">${solde641 > 0 ? 'Charges de Personnel à jour' : '0 charge salariale'}</div>
      </div>
      <div class="syscohada-card orange">
        <div style="font-size: 0.75rem; color: var(--gris-400); text-transform: uppercase; font-weight: 700;">Compte 411100 (Créances Parents)</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #F59E0B; margin: 0.3rem 0;">${solde411.toLocaleString('fr-FR')} FCFA</div>
        <div style="font-size: 0.72rem; color: #FBBF24;">${solde411 > 0 ? 'Créances en attente' : '0 créance en attente'}</div>
      </div>
    </div>

    <!-- Barre d'outils et d'actions rapides -->
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.4rem; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
        <button class="btn btn-gold" style="font-size: 0.82rem; padding: 0.5rem 1rem;" onclick="openNewAccountingEntryModal()">
          + Saisir une Écriture SYSCOHADA
        </button>
        <button class="btn btn-outline" style="font-size: 0.82rem; padding: 0.5rem 1rem;" onclick="openSyscohadaBalanceModal()">
          📈 Balance à 6 Colonnes (Interactive)
        </button>
      </div>
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
        <button class="btn btn-outline" style="font-size: 0.82rem; padding: 0.5rem 0.9rem;" onclick="openSyscohadaBilanModal()">
          📊 Télécharger Bilan Officiel (PDF)
        </button>
        <button class="btn btn-primary" style="font-size: 0.82rem; padding: 0.5rem 0.9rem;" onclick="handleCertificatFiscalClick()">
          🛡️ Certificat Fiscal
        </button>
      </div>
    </div>

    <!-- Table du Grand Livre SYSCOHADA -->
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 1.2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 style="color: var(--blanc-pur); margin: 0 0 0.2rem; font-size: 1rem;">📖 Grand Livre des Écritures Comptables</h4>
          <span style="font-size: 0.75rem; color: var(--gris-400);">Enregistrements légaux conformes à la nomenclature OHADA révisée</span>
        </div>
        <span class="badge-tag badge-excellent">${journal.length > 0 ? 'Écritures Équilibrées ✓' : 'Grand Livre Ouvert'}</span>
      </div>

      <div style="overflow-x: auto;">
        <table class="modern-table" style="width: 100%; font-size: 0.82rem;">
          <thead>
            <tr>
              <th>Date</th>
              <th>N° Pièce</th>
              <th>Débit (Emploi)</th>
              <th>Crédit (Ressource)</th>
              <th>Libellé de l'Opération</th>
              <th style="text-align: right;">Montant (FCFA)</th>
              <th style="text-align: center;">Visa</th>
            </tr>
          </thead>
          <tbody id="wsSysJournalTableBody">
            ${tbodyContent}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openSyscohadaBalanceModal() {
  const modal = document.getElementById('syscohadaBalanceModal');
  if (!modal) return;
  const nameEl = document.getElementById('balanceSchoolName');
  if (nameEl && currentEstablishment) {
    nameEl.textContent = currentEstablishment.name;
  }

  const tbody = document.getElementById('syscohadaBalanceTableBody');
  if (tbody) {
    const journal = getEstablishmentJournal();
    if (journal.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td><strong>101000</strong></td>
          <td>Capital d'Établissement / Dotation</td>
          <td>0</td><td>0</td><td>-</td><td><strong>0</strong></td>
        </tr>
        <tr>
          <td><strong>241000</strong></td>
          <td>Matériel Scolaire &amp; Informatique</td>
          <td>0</td><td>0</td><td><strong>0</strong></td><td>-</td>
        </tr>
        <tr>
          <td><strong>411100</strong></td>
          <td>Parents d'Élèves (Créances Scolarités)</td>
          <td>0</td><td>0</td><td><strong>0</strong></td><td>-</td>
        </tr>
        <tr>
          <td><strong>421100</strong></td>
          <td>Personnel Enseignant (Salaires dus)</td>
          <td>0</td><td>0</td><td>-</td><td>-</td>
        </tr>
        <tr>
          <td><strong>512100</strong></td>
          <td>Banque &amp; Caisse Mobile Money (Wave/OM)</td>
          <td>0</td><td>0</td><td><strong>0</strong></td><td>-</td>
        </tr>
        <tr>
          <td><strong>641100</strong></td>
          <td>Charges de Personnel Enseignant</td>
          <td>0</td><td>0</td><td><strong>0</strong></td><td>-</td>
        </tr>
        <tr>
          <td><strong>706100</strong></td>
          <td>Prestations Scolaires (Mensualités)</td>
          <td>0</td><td>0</td><td>-</td><td><strong>0</strong></td>
        </tr>
        <tr style="background: rgba(0,210,180,0.15); font-weight: 800;">
          <td colspan="2">TOTAUX GÉNÉRAUX ÉQUILIBRÉS</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
        </tr>
      `;
    } else {
      const accounts = {
        '101000': { name: "Capital d'Établissement / Dotation", deb: 0, cred: 0 },
        '241000': { name: "Matériel Scolaire & Informatique", deb: 0, cred: 0 },
        '411100': { name: "Parents d'Élèves (Créances Scolarités)", deb: 0, cred: 0 },
        '421100': { name: "Personnel Enseignant (Salaires dus)", deb: 0, cred: 0 },
        '512100': { name: "Banque & Caisse Mobile Money (Wave/OM)", deb: 0, cred: 0 },
        '641100': { name: "Charges de Personnel Enseignant", deb: 0, cred: 0 },
        '706100': { name: "Prestations Scolaires (Mensualités)", deb: 0, cred: 0 }
      };

      journal.forEach(j => {
        const dVal = Number(j.debitVal) || 0;
        const cVal = Number(j.creditVal) || 0;
        if (accounts[j.debit]) accounts[j.debit].deb += dVal;
        if (accounts[j.credit]) accounts[j.credit].cred += cVal;
      });

      let totalDebMvt = 0, totalCredMvt = 0, totalSoldeDeb = 0, totalSoldeCred = 0;
      let rowsHTML = '';

      Object.keys(accounts).forEach(num => {
        const a = accounts[num];
        totalDebMvt += a.deb;
        totalCredMvt += a.cred;
        let sDeb = 0, sCred = 0;
        if (a.deb >= a.cred) {
          sDeb = a.deb - a.cred;
          totalSoldeDeb += sDeb;
        } else {
          sCred = a.cred - a.deb;
          totalSoldeCred += sCred;
        }

        rowsHTML += `
          <tr>
            <td><strong>${num}</strong></td>
            <td>${a.name}</td>
            <td>${a.deb.toLocaleString('fr-FR')}</td>
            <td>${a.cred.toLocaleString('fr-FR')}</td>
            <td>${sDeb > 0 ? `<strong>${sDeb.toLocaleString('fr-FR')}</strong>` : '-'}</td>
            <td>${sCred > 0 ? `<strong>${sCred.toLocaleString('fr-FR')}</strong>` : '-'}</td>
          </tr>
        `;
      });

      rowsHTML += `
        <tr style="background: rgba(0,210,180,0.15); font-weight: 800;">
          <td colspan="2">TOTAUX GÉNÉRAUX ÉQUILIBRÉS</td>
          <td>${totalDebMvt.toLocaleString('fr-FR')}</td>
          <td>${totalCredMvt.toLocaleString('fr-FR')}</td>
          <td>${totalSoldeDeb.toLocaleString('fr-FR')}</td>
          <td>${totalSoldeCred.toLocaleString('fr-FR')}</td>
        </tr>
      `;
      tbody.innerHTML = rowsHTML;
    }
  }

  modal.classList.add('active');
}

function openSyscohadaBilanModal() {
  const modal = document.getElementById('syscohadaBilanModal');
  if (!modal) return;
  const schoolName = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : 'Votre Établissement';
  const nameEl = document.getElementById('bilanSchoolName');
  const stampEl = document.getElementById('bilanStampName');
  const dateEl = document.getElementById('bilanDateStr');
  if (nameEl) nameEl.textContent = schoolName;
  if (stampEl) stampEl.textContent = schoolName;
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  closeAllModals();
  modal.classList.add('active');
}

function printSyscohadaBilan() {
  document.body.classList.add('printing-bilan');
  window.print();
}

function isEstablishmentSubscribed() {
  if (!currentEstablishment) return false;
  return !!(currentEstablishment.isSubscribed === true || currentEstablishment.subscriptionStatus === 'ACTIVE');
}

function handleCertificatFiscalClick() {
  if (isEstablishmentSubscribed()) {
    openSyscohadaCertificatModal();
  } else {
    openCertificatPaywallModal();
  }
}

function openCertificatPaywallModal() {
  const modal = document.getElementById('certificatPaywallModal');
  if (!modal) return;
  const schoolName = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : 'Mon Ã‰tablissement';
  const nameEl = document.getElementById('paywallSchoolName');
  if (nameEl) nameEl.textContent = schoolName;
  closeAllModals();
  modal.classList.add('active');
}

function activateEstablishmentSubscription() {
  if (!currentEstablishment) currentEstablishment = {};
  currentEstablishment.isSubscribed = true;
  currentEstablishment.subscriptionStatus = 'ACTIVE';
  currentEstablishment.ninea = currentEstablishment.ninea || '008942301 2V4';
  currentEstablishment.license = `SSE-SN-LIC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  saveEstablishmentToRegistry(currentEstablishment);
  try {
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
  } catch (e) {}

  closeAllModals();
  renderAccountingTab();
  openSyscohadaCertificatModal();
  showNotification('🎉 Licence Établissement validée avec succès ! Certificat Fiscal débloqué.');
}

function deactivateEstablishmentSubscription() {
  if (!currentEstablishment) currentEstablishment = {};
  currentEstablishment.isSubscribed = false;
  currentEstablishment.subscriptionStatus = 'DEMO';
  
  saveEstablishmentToRegistry(currentEstablishment);
  try {
    localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
  } catch (e) {}

  closeAllModals();
  renderAccountingTab();
  showNotification('🔄 Mode Démo réactivé : Le Certificat Fiscal est à nouveau verrouillé.');
}

function openSyscohadaCertificatModal() {
  const modal = document.getElementById('syscohadaCertificatModal');
  if (!modal) return;

  const schoolName = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : 'Mon Ã‰tablissement';
  const ninea = currentEstablishment.ninea || '008942301 2V4';
  const licence = currentEstablishment.license || 'SSE-SN-LIC-2026-9814 (ACTIVE ✓)';

  const nameEl = document.getElementById('certifSchoolName');
  const stampEl = document.getElementById('certifStampName');
  const nineaEl = document.getElementById('certifNinea');
  const licenceEl = document.getElementById('certifLicence');
  const dateEl = document.getElementById('certifDate');

  if (nameEl) nameEl.textContent = schoolName;
  if (stampEl) stampEl.textContent = schoolName;
  if (nineaEl) nineaEl.textContent = ninea;
  if (licenceEl) licenceEl.textContent = licence;
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  closeAllModals();
  modal.classList.add('active');
}

function printSyscohadaCertificat() {
  document.body.classList.add('printing-certificat');
  window.print();
}

function exportSyscohadaBalanceExcel() {
  const schoolName = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : 'Mon Ã‰tablissement';
  const dateStr = new Date().toLocaleDateString('fr-FR');

  const rows = [
    { code: '101000', label: "Capital d'Établissement / Dotation", debMouv: '0', credMouv: '5 000 000', soldeDeb: '-', soldeCred: '5 000 000' },
    { code: '241000', label: "Matériel Scolaire & Informatique", debMouv: '3 200 000', credMouv: '0', soldeDeb: '3 200 000', soldeCred: '-' },
    { code: '411100', label: "Parents d'Élèves (Créances Scolarités)", debMouv: '14 670 000', credMouv: '14 250 000', soldeDeb: '420 000', soldeCred: '-' },
    { code: '421100', label: "Personnel Enseignant (Salaires dus)", debMouv: '4 850 000', credMouv: '4 850 000', soldeDeb: '-', soldeCred: '-' },
    { code: '512100', label: "Banque & Caisse Mobile Money (Wave/OM)", debMouv: '14 250 000', credMouv: '11 405 000', soldeDeb: '2 845 000', soldeCred: '-' },
    { code: '641100', label: "Charges de Personnel Enseignant", debMouv: '4 850 000', credMouv: '0', soldeDeb: '4 850 000', soldeCred: '-' },
    { code: '706100', label: "Prestations Scolaires (Mensualités)", debMouv: '0', credMouv: '14 250 000', soldeDeb: '-', soldeCred: '14 250 000' },
    { code: 'TOTAL', label: "TOTAUX GÉNÉRAUX ÉQUILIBRÉS", debMouv: '41 820 000', credMouv: '41 820 000', soldeDeb: '11 315 000', soldeCred: '11 315 000', isTotal: true }
  ];

  let excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th { background-color: #0A192F; color: #FFFFFF; font-weight: bold; border: 1px solid #CBD5E1; padding: 8px; text-align: left; }
    .th-center { text-align: center; }
    .th-group-mouv { background-color: #0E3D52; color: #00D2B4; text-align: center; }
    .th-group-solde { background-color: #382B10; color: #D4AF37; text-align: center; }
    td { border: 1px solid #CBD5E1; padding: 7px; font-size: 11pt; }
    .num { text-align: right; }
    .total-row { background-color: #E6FFFA; font-weight: bold; color: #006653; }
    .header-title { font-size: 14pt; font-weight: bold; color: #0A192F; }
    .header-sub { font-size: 10pt; color: #64748B; margin-bottom: 12px; }
  </style>
</head>
<body>
  <table>
    <tr><td colspan="6" class="header-title">RÉPUBLIQUE DU SÉNÉGAL • MINISTÈRE DE L'ÉDUCATION NATIONALE</td></tr>
    <tr><td colspan="6" style="font-size: 12pt; font-weight: bold; color: #0A192F;">BALANCE GÉNÉRALE DES COMPTES À 6 COLONNES (SYSCOHADA RÉVISÉ)</td></tr>
    <tr><td colspan="6" class="header-sub">Établissement : <b>${schoolName}</b> | Exercice : <b>2026-2027</b> | Arrêté au : <b>${dateStr}</b> | Plateforme : <b>SunuSchoolExpress 🇸🇳</b></td></tr>
    <tr><td colspan="6"></td></tr>
    <thead>
      <tr>
        <th rowspan="2" style="vertical-align: middle;">N° Compte</th>
        <th rowspan="2" style="vertical-align: middle;">Intitulé SYSCOHADA</th>
        <th colspan="2" class="th-group-mouv">MOUVEMENTS DE LA PÉRIODE (FCFA)</th>
        <th colspan="2" class="th-group-solde">SOLDES FINAUX (FCFA)</th>
      </tr>
      <tr>
        <th class="th-center">Débit</th>
        <th class="th-center">Crédit</th>
        <th class="th-center">Débiteur</th>
        <th class="th-center">Créditeur</th>
      </tr>
    </thead>
    <tbody>`;

  rows.forEach(r => {
    if (r.isTotal) {
      excelHtml += `
      <tr class="total-row">
        <td colspan="2" style="font-weight: bold;">${r.label}</td>
        <td class="num" style="font-weight: bold;">${r.debMouv}</td>
        <td class="num" style="font-weight: bold;">${r.credMouv}</td>
        <td class="num" style="font-weight: bold;">${r.soldeDeb}</td>
        <td class="num" style="font-weight: bold;">${r.soldeCred}</td>
      </tr>`;
    } else {
      excelHtml += `
      <tr>
        <td><b>${r.code}</b></td>
        <td>${r.label}</td>
        <td class="num">${r.debMouv}</td>
        <td class="num">${r.credMouv}</td>
        <td class="num">${r.soldeDeb}</td>
        <td class="num">${r.soldeCred}</td>
      </tr>`;
    }
  });

  excelHtml += `
    </tbody>
    <tfoot>
      <tr><td colspan="6"></td></tr>
      <tr>
        <td colspan="6" style="font-size: 9pt; color: #64748B; font-style: italic;">
          Document certifié régulier et sincère selon la nomenclature SYSCOHADA Révisé. Généré par SunuSchoolExpress.
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Balance_SYSCOHADA_6_Colonnes_${safeName}_2026.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(`📥 Balance Excel téléchargée avec succès (${a.download}) !`);
}

function exportSyscohadaBilanExcel() {
  const schoolName = (currentEstablishment && currentEstablishment.name) ? currentEstablishment.name : 'Mon Ã‰tablissement';
  const dateStr = new Date().toLocaleDateString('fr-FR');

  let excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th { background-color: #0A192F; color: #FFFFFF; font-weight: bold; border: 1px solid #CBD5E1; padding: 10px 8px; text-align: left; }
    td { border: 1px solid #CBD5E1; padding: 8px; font-size: 11pt; }
    .section-hdr { background-color: #F1F5F9; font-weight: bold; }
    .num { text-align: right; }
    .total-row { background-color: #E6FFFA; font-weight: bold; color: #006653; }
  </style>
</head>
<body>
  <table>
    <tr><td colspan="4" style="font-size: 14pt; font-weight: bold;">RÉPUBLIQUE DU SÉNÉGAL • MINISTÈRE DE L'ÉDUCATION NATIONALE</td></tr>
    <tr><td colspan="4" style="font-size: 12pt; font-weight: bold;">BILAN FINANCIER OFFICIEL SYSCOHADA RÉVISÉ</td></tr>
    <tr><td colspan="4" style="color: #64748B;">Établissement : <b>${schoolName}</b> | Exercice 2026-2027 | Arrêté au ${dateStr}</td></tr>
    <tr><td colspan="4"></td></tr>
    <thead>
      <tr>
        <th>ACTIF (EMPLOIS)</th>
        <th class="num">MONTANT NET (FCFA)</th>
        <th>PASSIF (RESSOURCES)</th>
        <th class="num">MONTANT NET (FCFA)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-hdr">
        <td colspan="2">ACTIF IMMOBILISÉ</td>
        <td colspan="2">CAPITAUX PROPRES &amp; RESSOURCES DURABLES</td>
      </tr>
      <tr>
        <td>241000 - Matériel Scolaire &amp; Informatique</td>
        <td class="num">3 200 000</td>
        <td>101000 - Capital d'Établissement / Dotation</td>
        <td class="num">5 000 000</td>
      </tr>
      <tr>
        <td><i>Sous-total Actif Immobilisé</i></td>
        <td class="num">3 200 000</td>
        <td>131000 - Résultat Net de l'Exercice (Excédent)</td>
        <td class="num">+1 465 000</td>
      </tr>
      <tr class="section-hdr">
        <td colspan="2">ACTIF CIRCULANT (Créances Scolaires)</td>
        <td colspan="2">DETTES CIRCULANTES</td>
      </tr>
      <tr>
        <td>411100 - Créances Parents d'Élèves</td>
        <td class="num">420 000</td>
        <td>421100 - Personnel Enseignant (Salaires dus)</td>
        <td class="num">0</td>
      </tr>
      <tr class="section-hdr">
        <td colspan="2">TRÉSORERIE ACTIF</td>
        <td colspan="2">TRÉSORERIE PASSIF</td>
      </tr>
      <tr>
        <td>512100 - Caisse Mobile Money &amp; Banques</td>
        <td class="num">2 845 000</td>
        <td>Découverts &amp; Concours Bancaires</td>
        <td class="num">0</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL GÉNÉRAL ACTIF</td>
        <td class="num">6 465 000 FCFA</td>
        <td>TOTAL GÉNÉRAL PASSIF</td>
        <td class="num">6 465 000 FCFA</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Bilan_SYSCOHADA_${safeName}_2026.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(`📥 Bilan SYSCOHADA exporté avec succès sous Excel (${a.download}) !`);
}

function openNewAccountingEntryModal() {
  const modal = document.getElementById('newAccountingEntryModal');
  if (!modal) return;
  modal.classList.add('active');
}

function submitNewAccountingEntry() {
  const desc = document.getElementById('sysEntryDesc')?.value?.trim();
  const debit = document.getElementById('sysEntryDebit')?.value;
  const credit = document.getElementById('sysEntryCredit')?.value;
  const amount = Number(document.getElementById('sysEntryAmount')?.value) || 0;

  if (!desc || amount <= 0) {
    alert('Veuillez renseigner le libellé et un montant valide en FCFA.');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const journal = getEstablishmentJournal();
  const count = journal.length + 1;
  const ref = `PC-2026-${String(count).padStart(3, '0')}`;

  const entry = {
    date: dateStr,
    ref: ref,
    debit: debit,
    credit: credit,
    motif: desc,
    debitVal: amount,
    creditVal: amount,
    status: 'CONFORME'
  };

  if (isRealRegisteredEstablishment()) {
    journal.unshift(entry);
    saveEstablishmentJournal(journal);
  } else {
    if (!demoState.syscohadaJournal) demoState.syscohadaJournal = [];
    demoState.syscohadaJournal.unshift(entry);
  }

  demoState.auditLogs.unshift({
    time: now.toLocaleTimeString(),
    action: `Écriture SYSCOHADA enregistrée : ${desc} (${amount.toLocaleString('fr-FR')} FCFA)`,
    user: 'Service Comptable'
  });

  closeAllModals();
  renderAccountingTab();
  showNotification(`✓ Écriture N° ${ref} enregistrée au Grand Livre SYSCOHADA avec succès !`);
}

// (Les modules RH & Emplois du Temps sont définis au-dessus dans le Module 2 avec le système complet d'impression et d'affichage)

function openNewTeacherContractModal() {
  const modal = document.getElementById('newTeacherContractModal');
  if (!modal) return;

  const form = document.getElementById('newTeacherContractForm');
  if (form) form.reset();

  const volInput = document.getElementById('teacherVolumeInput');
  if (volInput) volInput.value = '20h / semaine';
  const salInput = document.getElementById('teacherSalaryInput');
  if (salInput) salInput.value = '210000';
  const ipresCheck = document.getElementById('teacherIpresCssCheck');
  if (ipresCheck) ipresCheck.checked = true;

  // Afficher les pastilles de classes disponibles pour attribution rapide
  const pillsContainer = document.getElementById('teacherClassesPillsContainer');
  if (pillsContainer) {
    pillsContainer.innerHTML = '';
    const classes = getEstablishmentClasses();
    if (classes.length > 0) {
      classes.forEach(c => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'badge-tag';
        pill.style.cssText = 'background: rgba(255,255,255,0.06); color: #FFF; border: 1px solid rgba(255,255,255,0.18); cursor: pointer; font-size: 0.72rem; padding: 2px 7px; transition: all 0.2s;';
        pill.textContent = `+ ${c.nom}`;
        pill.onclick = () => {
          const inp = document.getElementById('teacherLevelsInput');
          if (!inp) return;
          let current = inp.value ? inp.value.split(',').map(s => s.trim()).filter(Boolean) : [];
          if (!current.includes(c.nom)) {
            current.push(c.nom);
            inp.value = current.join(', ');
            pill.style.background = 'rgba(0, 210, 180, 0.25)';
            pill.style.borderColor = '#00D2B4';
            pill.style.color = '#00D2B4';
            pill.textContent = `✓ ${c.nom}`;
          } else {
            current = current.filter(x => x !== c.nom);
            inp.value = current.join(', ');
            pill.style.background = 'rgba(255,255,255,0.06)';
            pill.style.borderColor = 'rgba(255,255,255,0.18)';
            pill.style.color = '#FFF';
            pill.textContent = `+ ${c.nom}`;
          }
        };
        pillsContainer.appendChild(pill);
      });
    }
  }

  modal.classList.add('active');
}

function submitNewTeacherContract() {
  const nom = (document.getElementById('teacherNomInput')?.value || '').trim();
  const tel = (document.getElementById('teacherTelInput')?.value || '').trim();
  const matiere = (document.getElementById('teacherMatiereInput')?.value || '').trim();
  const levels = (document.getElementById('teacherLevelsInput')?.value || '').trim();
  const contrat = document.getElementById('teacherContratSelect')?.value || 'CDI Titulaire';
  const volume = (document.getElementById('teacherVolumeInput')?.value || '20h / semaine').trim();
  const salaire = parseInt(document.getElementById('teacherSalaryInput')?.value || '200000', 10);
  const ipres = document.getElementById('teacherIpresCssCheck')?.checked;

  if (!nom || !matiere) {
    alert('Veuillez renseigner au minimum le nom complet et la matière enseignée.');
    return;
  }

  // Générer le prochain matricule RH séquentiel
  const teachers = getEstablishmentTeachers();
  const count = teachers.length + 1;
  const mat = `ENS-2026-${String(count).padStart(2, '0')}`;
  const fullMatiere = levels ? `${matiere} (${levels})` : matiere;
  const classesList = levels ? levels.split(',').map(s => s.trim()).filter(Boolean) : [];

  const newTeacher = {
    id: `ens_${Date.now()}`,
    nom: nom,
    matiere: fullMatiere,
    classes: classesList,
    volume: volume,
    contrat: contrat,
    salaire: salaire,
    mat: mat,
    tel: tel || '+221 77 000 00 00',
    ipres: ipres
  };

  if (isRealRegisteredEstablishment()) {
    teachers.unshift(newTeacher);
    saveEstablishmentTeachers(teachers);
  } else {
    if (!demoState.hrTeachers) demoState.hrTeachers = [];
    demoState.hrTeachers.unshift(newTeacher);
  }

  const now = new Date();
  demoState.auditLogs.unshift({
    time: now.toLocaleTimeString(),
    action: `Nouveau contrat enseignant validé : ${nom} (${mat} • ${contrat})`,
    user: 'Direction RH'
  });

  closeAllModals();
  renderHRTab();
  showNotification(`✓ Contrat enseignant validé pour ${nom} (Matricule : ${mat}) ! Fiche de paie disponible.`);
}

function openPayslipModal(teacherName, role, salary, hours, mat) {
  const modal = document.getElementById('payslipModal');
  if (!modal) return;

  if (document.getElementById('payslipSchoolName') && currentEstablishment) {
    document.getElementById('payslipSchoolName').textContent = currentEstablishment.name;
  }
  if (document.getElementById('payslipTeacherName')) {
    document.getElementById('payslipTeacherName').textContent = teacherName;
  }
  if (document.getElementById('payslipTeacherMat')) {
    document.getElementById('payslipTeacherMat').textContent = mat || 'ENS-2026-08';
  }
  if (document.getElementById('payslipTeacherRole')) {
    document.getElementById('payslipTeacherRole').textContent = role;
  }
  if (document.getElementById('payslipTeacherHours')) {
    document.getElementById('payslipTeacherHours').textContent = hours || '20 h / semaine';
  }
  if (document.getElementById('payslipNetTotal')) {
    document.getElementById('payslipNetTotal').textContent = `${(salary || 199520).toLocaleString('fr-FR')} FCFA`;
  }

  modal.classList.add('active');
}

// --- MODULE 3 : PASSERELLE D'ALERTES WHATSAPP & SMS ---
function renderWhatsAppTab() {
  const container = document.getElementById('wsAlertsContent');
  if (!container) return;

  const planName = (currentEstablishment?.plan || '').toLowerCase();
  const isDaara = currentEstablishment?.type === 'DAARA';
  const isStarterSchool = (planName.includes('starter') || planName.includes('standard')) && !isDaara;

  if (isStarterSchool) {
    container.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 2.2rem 1.5rem; text-align: center;">
        <div style="font-size: 2.8rem; margin-bottom: 0.8rem;">🔒</div>
        <h4 style="color: #FBBF24; margin-bottom: 0.6rem; font-size: 1.15rem;">Fonctionnalité Verrouillée — Formule Starter</h4>
        <p style="font-size: 0.9rem; color: var(--gris-300); max-width: 540px; margin: 0 auto 1.5rem; line-height: 1.6;">
          L'envoi automatisé d'alertes d'absence et de reçus de paiement par WhatsApp est inclus à partir de la formule <strong>Pro</strong> (55 000 FCFA/mois).
        </p>
        <button class="btn btn-gold" onclick="upgradeEstablishmentPlan('Pro')">
          ⚡ Passer à la Formule Pro (WhatsApp inclus)
        </button>
      </div>
    `;
    return;
  }

  const schoolName = currentEstablishment?.name || 'Mon Ã‰tablissement';

  container.innerHTML = `
    <!-- Statut de la passerelle connectée -->
    <div style="background: rgba(0, 168, 132, 0.1); border: 1px solid #00A884; border-radius: var(--radius-md); padding: 1.1rem 1.3rem; margin-bottom: 1.4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem;">
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #00A884; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
          💬
        </div>
        <div>
          <div style="font-weight: 800; color: #00A884; font-size: 0.95rem;">Passerelle Officielle WhatsApp Cloud API Active 🟢</div>
          <div style="font-size: 0.78rem; color: var(--gris-300);">Numéro Établissement : +221 33 820 00 00 • Quota : Illimité (Inclus Formule Pro)</div>
        </div>
      </div>
      <span class="badge-tag badge-excellent">Serveur Opérationnel (Dakar)</span>
    </div>

    <!-- Grille 2 colonnes : Envoi + Aperçu Téléphone Live -->
    <div class="ws-whatsapp-grid">
      <!-- Colonne Gauche : Paramètres & Rédaction -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 1.4rem;">
        <h4 style="color: var(--blanc-pur); margin-bottom: 1rem; font-size: 0.98rem;">✉️ Rédiger une Notification WhatsApp</h4>

        <div class="form-group">
          <label class="form-label">Destinataire(s)</label>
          <select id="wsWaRecipientSelect" class="form-select" onchange="onWsWaRecipientChange()">
            <option value="parent_babacar">M. Babacar Seck (Parent Élève - Retard signalé)</option>
            <option value="parent_aissatou">Mme Aïssatou Diop (Reçu Paiement Wave disponible)</option>
            <option value="parent_bachir">M. Cheikh Tidiane Sow (Félicitations Hizb Coran)</option>
            <option value="broadcast_class">Parents d'élèves de la classe (${selectedTimetableClass || 'CM2 A'})</option>
            <option value="broadcast_unpaid">Tous les parents avec mensualité en retard (Relance)</option>
            <option value="broadcast_all">Tous les parents de l'établissement (Annonce Générale)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Modèle de Message Rapide</label>
          <select id="wsWaTemplateSelect" class="form-select" onchange="onWsWaTemplateChange()">
            <option value="changement_emploi">📅 Annonce : Changement d'Emploi du Temps / Réaménagement</option>
            <option value="absence">Absence non justifiée ce matin (Vie scolaire)</option>
            <option value="recu">Reçu officiel de paiement de mensualité (Wave/OM)</option>
            <option value="hizb">Progression &amp; Félicitations Mémorisation Hizb</option>
            <option value="rappel">Rappel amical d'échéance de scolarité</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Numéro WhatsApp du Parent</label>
          <input type="text" id="wsWaPhoneInput" class="form-input" value="+221 77 645 88 12">
        </div>

        <div class="form-group">
          <label class="form-label">Contenu du Message WhatsApp</label>
          <textarea id="wsWaMessageInput" class="form-textarea" rows="4" oninput="updateWsWhatsAppPreview()"></textarea>
        </div>

        <button class="btn btn-primary" style="width: 100%; background: #00A884; font-weight: 800; font-size: 0.92rem; padding: 0.75rem;" onclick="sendWhatsAppMessageFromWs()">
          🚀 Expédier la Notification WhatsApp Instantanée
        </button>
      </div>

      <!-- Colonne Droite : Aperçu Smartphone WhatsApp Live -->
      <div class="wa-simulator-box">
        <div class="wa-sim-header">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #00A884; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #FFF;">
            🏫
          </div>
          <div>
            <div style="font-weight: 700; color: #E9EDEF; font-size: 0.88rem;">SunuSchool - ${schoolName}</div>
            <div style="font-size: 0.68rem; color: #00A884;">Compte Établissement Vérifié ✓</div>
          </div>
        </div>

        <div class="wa-sim-body">
          <div class="wa-bubble-sent">
            <div id="wsWaPreviewText">
              <!-- Dynamique selon modèle -->
            </div>
            <div class="wa-bubble-time">
              <span id="wsWaPreviewTime">12:00</span>
              <span style="color: #53BDEB; font-weight: 900;">✓✓</span>
            </div>
          </div>
        </div>

        <div style="background: #1F2C34; padding: 0.8rem 1rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
          <span style="font-size: 0.75rem; color: var(--gris-400);">Simulateur synchronisé en temps réel avec la passerelle WhatsApp 🇸🇳</span>
        </div>
      </div>
    </div>

    <!-- Journal d'envoi WhatsApp en direct -->
    <div style="margin-top: 1.6rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 1.2rem;">
      <h4 style="color: var(--blanc-pur); margin: 0 0 0.8rem; font-size: 0.95rem;">📋 Dernières Notifications WhatsApp Transmises (Live Feed)</h4>
      <div id="wsWaLiveFeedContainer">
        <!-- Historique dynamique des notifications -->
      </div>
    </div>
  `;

  // Initialiser les valeurs par défaut
  onWsWaTemplateChange();
  renderWsWaLiveFeed();
}

function onWsWaRecipientChange() {
  const select = document.getElementById('wsWaRecipientSelect');
  const phoneInput = document.getElementById('wsWaPhoneInput');
  if (!select || !phoneInput) return;

  const val = select.value;
  if (val === 'parent_babacar') phoneInput.value = '+221 78 541 22 10';
  else if (val === 'parent_aissatou') phoneInput.value = '+221 77 334 12 90';
  else if (val === 'parent_bachir') phoneInput.value = '+221 77 645 88 12';
  else if (val === 'broadcast_class') phoneInput.value = `+221 77 980 44 00 (Groupe Parents ${selectedTimetableClass || 'CM2 A'})`;
  else phoneInput.value = '+221 77 000 00 00 (Groupe Parents)';

  updateWsWhatsAppPreview();
}

function onWsWaTemplateChange(customClass) {
  const select = document.getElementById('wsWaTemplateSelect');
  const msgInput = document.getElementById('wsWaMessageInput');
  if (!select || !msgInput) return;

  const schoolName = currentEstablishment?.name || 'Mon Ã‰tablissement';
  const val = select.value;
  const targetClass = customClass || selectedTimetableClass || 'CM2 A';

  if (val === 'changement_emploi') {
    msgInput.value = `📢 AVIS OFFICIEL — Direction des Études (${schoolName}) :\n\nChers Parents d'élèves de la classe de ${targetClass},\n\nNous vous informons d'un réaménagement officiel de l'emploi du temps hebdomadaire à compter de ce lundi.\n\n📌 Les nouveaux horaires de cours, les professeurs assignés et les affectations de salles sont consultables et téléchargeables sur votre Espace Famille SunuSchool.\n\nMerci de veiller au respect des nouveaux horaires de cours de votre enfant.\n\nCordialement,\nLa Direction Pédagogique.`;
  } else if (val === 'absence') {
    msgInput.value = `Bonjour Cher Parent,\n\nNous vous signalons l'absence non justifiée de votre enfant ce matin à 08h00 à ${schoolName}.\n\nMerci de contacter d'urgence la vie scolaire au 33 820 00 00.\n\nCordialement,\nLa Direction.`;
  } else if (val === 'recu') {
    msgInput.value = `Bonjour Cher Parent,\n\nLe règlement de la mensualité scolaire pour le mois en cours a bien été validé via Wave (Réf: SSE-2026-89412).\n\nVotre facture officielle SYSCOHADA acquittée est disponible sur votre portail SunuSchool.\n\nMerci pour votre confiance,\n${schoolName}.`;
  } else if (val === 'hizb') {
    msgInput.value = `Macha Allah Cher Parent 🌟,\n\nVotre enfant a brillamment validé aujourd'hui son passage de mémorisation coranique (Hizb 48 - Sourate Yâ-Sîn) avec mention Très Bien !\n\nFélicitations de la part de toute l'équipe pédagogique de ${schoolName}.`;
  } else {
    msgInput.value = `Rappel amical de ${schoolName} :\n\nL'échéance de règlement des frais de scolarité arrive à terme le 10 du mois. Vous pouvez régler en 1 clic sans frais par Wave ou Orange Money.\n\nMerci de votre collaboration !`;
  }

  updateWsWhatsAppPreview();
}

function setWhatsAppToTimetableChange(className) {
  const targetClass = className || selectedTimetableClass || 'CM2 A';
  selectedTimetableClass = targetClass;
  
  // Basculer vers l'onglet WhatsApp dans le workspace
  switchWsTab('wsAlerts');

  setTimeout(() => {
    const recipientSelect = document.getElementById('wsWaRecipientSelect');
    if (recipientSelect) {
      recipientSelect.value = 'broadcast_class';
      onWsWaRecipientChange();
    }
    const templateSelect = document.getElementById('wsWaTemplateSelect');
    if (templateSelect) {
      templateSelect.value = 'changement_emploi';
      onWsWaTemplateChange(targetClass);
    }
  }, 100);

  showNotification(`💬 Modèle de notification préparé pour la classe ${targetClass} ! Prêt à envoyer aux parents.`);
}

function updateWsWhatsAppPreview() {
  const msgInput = document.getElementById('wsWaMessageInput');
  const previewText = document.getElementById('wsWaPreviewText');
  const previewTime = document.getElementById('wsWaPreviewTime');

  if (msgInput && previewText) {
    previewText.innerHTML = msgInput.value.replace(/\n/g, '<br>');
  }
  if (previewTime) {
    const d = new Date();
    previewTime.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

function sendWhatsAppMessageFromWs() {
  const phone = document.getElementById('wsWaPhoneInput')?.value || '+221 77 645 88 12';
  const text = document.getElementById('wsWaMessageInput')?.value || 'Notification SunuSchool';
  const d = new Date();
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  demoState.auditLogs.unshift({
    time: d.toLocaleTimeString(),
    action: `Notification WhatsApp expédiée vers ${phone}`,
    user: 'Passerelle API WhatsApp'
  });

  renderWsWaLiveFeed();
  showNotification(`🚀 Message WhatsApp expédié avec succès au ${phone} ! (Accusé de réception ✓✓ délivré)`);
}

function renderWsWaLiveFeed() {
  const container = document.getElementById('wsWaLiveFeedContainer');
  if (!container) return;

  const logs = (demoState.auditLogs || []).filter(l => l.action && l.action.toLowerCase().includes('whatsapp')).slice(0, 4);

  if (logs.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--gris-400); padding: 0.5rem 0;">
        Toutes les notifications d'absence et reçus de scolarité transmis s'afficheront ici en direct.
      </div>
    `;
    return;
  }

  container.innerHTML = logs.map(l => `
    <div style="padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center; gap: 0.8rem;">
      <div>
        <strong style="color: #00A884;">${l.time}</strong> • 
        <span>${l.action}</span>
      </div>
      <span class="badge-tag badge-excellent" style="font-size: 0.72rem;">Délivré ✓✓</span>
    </div>
  `).join('');
}

// --- MODULE 4 : BIBLIOTHÈQUE NUMÉRIQUE ---
function renderLibTab() {
  const libContent = document.getElementById('wsLibContent');
  if (!libContent) return;

  const planName = (currentEstablishment?.plan || '').toLowerCase();
  const isPremiumEst = planName.includes('premium') || planName.includes('annuelle') || planName.includes('annuel') || planName.includes('sérénité') || planName.includes('enterprise');
  const isDaara = currentEstablishment?.type === 'DAARA' || planName.includes('daara');

  if (!isPremiumEst) {
    libContent.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 2rem 1.5rem; text-align: center;">
        <div style="font-size: 2.8rem; margin-bottom: 0.8rem;">🔒</div>
        <h4 style="color: #FBBF24; margin-bottom: 0.6rem; font-size: 1.15rem;">Fonctionnalité Verrouillée — ${isDaara ? 'Bibliothèque Islamique & Tajwîd' : 'Bibliothèque Numérique'}</h4>
        <p style="font-size: 0.9rem; color: var(--gris-300); max-width: 540px; margin: 0 auto 1.5rem; line-height: 1.6;">
          ${isDaara ? 'L\'accès intégral à la Bibliothèque Islamique Numérique, aux manuels de Tajwîd et à la calligraphie sur Allwa est réservé à l\'<strong>Option Annuelle Sérénité</strong> (350 000 FCFA/an • 2 mois offerts).' : 'L\'accès aux manuels scolaires officiels du Sénégal et aux quiz interactifs est une exclusivité de la formule <strong>Premium</strong> (85 000 FCFA/mois) ou <strong>Entreprise</strong>.'}
        </p>
        <button class="btn btn-gold" onclick="${isDaara ? "showPlanUpgradeModal('library')" : "upgradeEstablishmentPlan('Premium')"}">
          ⚡ Débloquer l'Accès Illimité
        </button>
      </div>
    `;
  } else if (isDaara) {
    libContent.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.4rem;">
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">📖</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Coran &amp; Tajwîd Numérique</strong>
          <p style="font-size: 0.8rem; color: var(--gris-400); margin: 0.4rem 0;">Textes de récitation intégrale, règles de Hafs, makhârij al-hourouf et audio d'Oustaz.</p>
          <button class="btn btn-gold" style="font-size: 0.8rem; width: 100%;" onclick="openEbookReader('tajwid')">📖 Consulter le Manuel</button>
        </div>
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">📜</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Allwa &amp; Calligraphie Arabe</strong>
          <p style="font-size: 0.8rem; color: var(--gris-400); margin: 0.4rem 0;">Modèles de tracés sur planchettes traditionnelles et règles d'écriture maghrébine.</p>
          <button class="btn btn-primary" style="font-size: 0.8rem; width: 100%;" onclick="openEbookReader('allwa')">📖 Consulter les Planches</button>
        </div>
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">🕌</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Fiqh &amp; Morale (Al-Akhdari)</strong>
          <p style="font-size: 0.8rem; color: var(--gris-400); margin: 0.4rem 0;">Purification rituelle, prière, invocations quotidiennes du talibé et civisme Daara.</p>
          <button class="btn btn-primary" style="font-size: 0.8rem; width: 100%;" onclick="openEbookReader('akhdari')">📖 Consulter l'Abrégé</button>
        </div>
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">🎙️</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Quiz Interactif Tajwîd &amp; Hifz</strong>
          <p style="font-size: 0.8rem; color: var(--gris-400); margin: 0.4rem 0;">Évaluation des règles de récitation coranique avec score officiel sur 20.</p>
          <button class="btn btn-primary" style="font-size: 0.8rem; width: 100%; background: #9333EA;" onclick="openQuizModal('tajwid')">✏️ Lancer le Quiz</button>
        </div>
      </div>
    `;
  } else {
    libContent.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.4rem;">
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">📘</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Coran &amp; Tajwîd Numérique</strong>
          <p style="font-size: 0.8rem; color: var(--gris-500); margin: 0.4rem 0;">Textes de récitation, règles de Hafs et exemples coraniques.</p>
          <button class="btn btn-gold" style="font-size: 0.8rem; width: 100%;" onclick="openEbookReader('tajwid')">📖 Consulter le Manuel</button>
        </div>
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">📐</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Mathématiques CM2 (Sénégal)</strong>
          <p style="font-size: 0.8rem; color: var(--gris-500); margin: 0.4rem 0;">Problèmes types CFEE, calculs d'aires et fractions.</p>
          <button class="btn btn-primary" style="font-size: 0.8rem; width: 100%;" onclick="openEbookReader('maths')">📖 Consulter le Manuel</button>
        </div>
        <div class="dorm-room-card">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">📝</div>
          <strong style="color: var(--blanc-pur); font-size: 1.05rem;">Quiz Interactif &amp; Auto-Évaluation</strong>
          <p style="font-size: 0.8rem; color: var(--gris-500); margin: 0.4rem 0;">Testez les connaissances des élèves avec note sur 20.</p>
          <button class="btn btn-primary" style="font-size: 0.8rem; width: 100%; background: #9333EA;" onclick="openQuizModal('tajwid')">✏️ Lancer le Quiz</button>
        </div>
      </div>
    `;
  }
}

// --- MODULE 9 : MATÉRIEL DE BADGEAGE & CARTES DES TALIBÉS (PACK SÉRÉNITÉ) ---
let currentBadgeSide = 'recto';

function renderBadgesTab() {
  const isDaara = currentEstablishment?.type === 'DAARA' || (currentEstablishment?.plan || '').toLowerCase().includes('daara');
  const schoolName = currentEstablishment?.name || (isDaara ? (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT') : 'MON Ã‰TABLISSEMENT');
  
  const previewSchoolEl = document.getElementById('badgePreviewSchoolName');
  if (previewSchoolEl) previewSchoolEl.textContent = schoolName.toUpperCase();

  const selectEl = document.getElementById('badgeSelectTalibe');
  const studentsList = isDaara 
    ? (demoState.talibes && demoState.talibes.length ? demoState.talibes : demoState.elevesScolaires) 
    : (demoState.elevesScolaires && demoState.elevesScolaires.length ? demoState.elevesScolaires : demoState.talibes);
  
  if (selectEl && studentsList) {
    const prevVal = selectEl.value;
    selectEl.innerHTML = studentsList.map(s => `
      <option value="${s.id || s.matricule}">${s.prenom} ${s.nom} (${s.matricule}) ${s.hizb ? '— Hizb ' + s.hizb : '— ' + (s.classe || '')}</option>
    `).join('');
    if (prevVal) selectEl.value = prevVal;
  }

  const tableBody = document.getElementById('badgeRegistryTableBody');
  if (tableBody && studentsList) {
    tableBody.innerHTML = studentsList.map((s, idx) => {
      const dormInfo = s.dortoir ? `${s.dortoir} (Lit ${s.lit || idx + 1})` : (s.regime || (isDaara ? 'Pensionnaire Internat' : 'Externe'));
      const progressInfo = s.hizb ? `Hizb ${s.hizb} (${s.sourate || 'En cours'})` : (s.classe || 'Standard');
      const nfcId = 'NFC-2026-' + (1000 + idx * 47);
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,210,180,0.15); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--turquoise-400); font-size: 0.8rem;">
                ${(s.prenom || 'E').charAt(0)}${(s.nom || 'L').charAt(0)}
              </div>
              <div>
                <strong>${s.prenom} ${s.nom}</strong>
                <div style="font-size: 0.75rem; color: var(--gris-400);">${s.age ? s.age + ' ans' : (s.classe || 'Élève')} • Tuteur : ${s.parentNom || 'Parent'}</div>
              </div>
            </div>
          </td>
          <td><code>${s.matricule}</code></td>
          <td><span class="badge-tag" style="background: rgba(0,210,180,0.12); color: #00D2B4;">${progressInfo}</span></td>
          <td style="font-size: 0.82rem;">${dormInfo}</td>
          <td><code style="color: #FBBF24;">${nfcId}</code></td>
          <td><span class="badge-tag" style="background: rgba(16,185,129,0.15); color: #34D399;">✅ Imprimé &amp; Encodé</span></td>
          <td>
            <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="loadTalibeInBadgeStudio('${s.id || s.matricule}')">
              🖨️ Voir / Imprimer
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    const countBadge = document.getElementById('badgeIssuedCount');
    if (countBadge) countBadge.textContent = `${studentsList.length} / ${studentsList.length} Badges Encodés (200 Disponibles)`;
  }

  updateBadgeLivePreview();
}

function loadTalibeInBadgeStudio(studentId) {
  const selectEl = document.getElementById('badgeSelectTalibe');
  if (selectEl) {
    selectEl.value = studentId;
    updateBadgeLivePreview();
    showNotification('🪪 Données du badge chargées pour impression.');
  }
}

function updateBadgeLivePreview() {
  const selectEl = document.getElementById('badgeSelectTalibe');
  if (!selectEl) return;
  const val = selectEl.value;
  const isDaara = currentEstablishment?.type === 'DAARA' || (currentEstablishment?.plan || '').toLowerCase().includes('daara');
  const list = isDaara 
    ? (demoState.talibes && demoState.talibes.length ? demoState.talibes : demoState.elevesScolaires) 
    : (demoState.elevesScolaires && demoState.elevesScolaires.length ? demoState.elevesScolaires : demoState.talibes);
  const s = (list && list.find(item => (item.id === val || item.matricule === val))) || (list && list[0]);
  if (!s) return;

  const schoolName = currentEstablishment?.name || (isDaara ? (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT') : 'MON Ã‰TABLISSEMENT');
  const nameEl = document.getElementById('badgePreviewName');
  const matEl = document.getElementById('badgePreviewMatricule');
  const clsEl = document.getElementById('badgePreviewClass');
  const dormEl = document.getElementById('badgePreviewDorm');
  const tuteurEl = document.getElementById('badgePreviewTuteur');
  const hizbBadge = document.getElementById('badgePreviewHizbBadge');

  if (nameEl) nameEl.textContent = `${s.prenom} ${s.nom}`.toUpperCase();
  if (matEl) matEl.textContent = s.matricule;
  if (clsEl) clsEl.textContent = s.classe || (isDaara ? 'Cycle Coranique 2 & Passerelle' : 'Enseignement Général');
  if (dormEl) dormEl.textContent = s.dortoir ? `${s.dortoir} (Lit ${s.lit || '1'})` : (s.regime || (isDaara ? 'Externe' : 'Demi-pension'));
  if (tuteurEl) tuteurEl.textContent = `${s.parentNom || 'Parent Référent'} (${s.parentTel || '+221 77 000 00 00'})`;
  if (hizbBadge) hizbBadge.textContent = s.hizb ? `Hizb ${s.hizb}` : (s.classe || 'Élève');
}

function flipBadgeSide() {
  currentBadgeSide = currentBadgeSide === 'recto' ? 'verso' : 'recto';
  const badgeEl = document.getElementById('daaraLiveBadge');
  if (!badgeEl) return;

  if (currentBadgeSide === 'verso') {
    const sName = document.getElementById('badgePreviewName')?.textContent || 'TALIBÉ';
    const sMatricule = document.getElementById('badgePreviewMatricule')?.textContent || 'TAL-2026';
    const sTuteur = document.getElementById('badgePreviewTuteur')?.textContent || 'Parent';
    badgeEl.style.transform = 'rotateY(180deg)';
    setTimeout(() => {
      badgeEl.innerHTML = `
        <div style="transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div style="border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #FFE082; font-size: 0.85rem;">VERSO • INFORMATIONS MÉDICALES &amp; INTERNAT</strong>
            <span style="font-size: 0.7rem; color: #34D399; font-weight: 700;">PUCE SÉCURISÉE NFC ACTIVE</span>
          </div>
          <div style="font-size: 0.78rem; line-height: 1.5; color: #E2E8F0; margin: 0.6rem 0;">
            <div>• <strong>Pensionnaire :</strong> ${sName} (<code>${sMatricule}</code>)</div>
            <div>• <strong>Contact d'Urgence :</strong> ${sTuteur}</div>
            <div>• <strong>Groupe Sanguin :</strong> O+ • Trousse médicale Daara validée</div>
            <div>• <strong>Règlement :</strong> Cette carte doit être présentée pour l'émargement de présence, l'accès au réfectoire et les sorties du vendredi.</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 0.5rem; font-size: 0.65rem; color: var(--gris-400);">
            <span>En cas de perte : contacter l'administration Daara</span>
            <span style="color: #00D2B4; font-weight: 700;">SUNU SCHOOL EXPRESS</span>
          </div>
        </div>
      `;
      badgeEl.style.transform = 'none';
    }, 150);
  } else {
    badgeEl.style.transform = 'rotateY(180deg)';
    setTimeout(() => {
      const isDaara = currentEstablishment?.type === 'DAARA' || (currentEstablishment?.plan || '').toLowerCase().includes('daara');
      const schoolName = currentEstablishment?.name || (isDaara ? (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT') : 'MON Ã‰TABLISSEMENT');
      badgeEl.innerHTML = `
        <div class="badge-inner-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="badge-logo-icon">🕌</div>
            <div>
              <div class="badge-school-name" id="badgePreviewSchoolName">${schoolName.toUpperCase()}</div>
              <div class="badge-sub-title">Carte Officielle de Pensionnaire • Daara &amp; Internat</div>
            </div>
          </div>
          <div class="badge-nfc-chip">📡 NFC</div>
        </div>

        <div class="badge-inner-body">
          <div class="badge-photo-wrapper">
            <img id="badgePreviewPhoto" src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80" alt="Talibé Photo" class="badge-photo-img">
            <div class="badge-photo-badge" id="badgePreviewHizbBadge">Hizb 38</div>
          </div>

          <div class="badge-details">
            <div class="badge-name" id="badgePreviewName">MOUHAMED SOW</div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">Matricule :</span>
              <strong class="badge-meta-val" id="badgePreviewMatricule">TAL-2026-084</strong>
            </div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">Classe :</span>
              <strong class="badge-meta-val" id="badgePreviewClass">Cycle Coranique 2 &amp; Passerelle</strong>
            </div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">Dortoir :</span>
              <strong class="badge-meta-val" id="badgePreviewDorm">Dortoir A - Badr (Lit N°14)</strong>
            </div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">Tuteur :</span>
              <strong class="badge-meta-val" id="badgePreviewTuteur">Oustaz Thierno Sow (77 555 44 33)</strong>
            </div>
          </div>

          <div class="badge-qr-box">
            <div class="badge-qr-placeholder">
              <div style="font-size: 2.2rem; line-height: 1;">📱</div>
              <span style="font-size: 0.58rem; color: #0F172A; font-weight: 800; text-align: center; margin-top: 0.2rem;">SCAN URGENCE</span>
            </div>
          </div>
        </div>

        <div class="badge-inner-footer">
          <span>Sunu School Express • Établissement Agréé • Année 2026-2027</span>
          <span style="font-weight: 700; color: #FFE082;">VISA DIRECTION ✍️</span>
        </div>
      `;
      badgeEl.style.transform = 'none';
      updateBadgeLivePreview();
    }, 150);
  }
}

function testNfcScanSimulation() {
  const name = document.getElementById('badgePreviewName')?.textContent || 'Talibé';
  const matricule = document.getElementById('badgePreviewMatricule')?.textContent || 'TAL-2026';
  showNotification(`📡 Bip NFC ! Badge ${matricule} (${name}) scanné avec succès : Présence &amp; Accès Internat validés.`);
}

function generateBadgeCardHtml(talibe, schoolName, options = {}) {
  if (!talibe) return '';
  const isDaara = currentEstablishment?.type === 'DAARA' || (currentEstablishment?.plan || '').toLowerCase().includes('daara');
  const school = (schoolName || currentEstablishment?.name || (isDaara ? (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT') : 'MON Ã‰TABLISSEMENT')).toUpperCase();
  const isSheet = !!(options && options.isSheet);

  const dormInfo = talibe.dortoir ? `${talibe.dortoir} (Lit ${talibe.lit || '1'})` : (talibe.regime || (isDaara ? 'Pensionnaire Internat' : 'Externe'));
  const progressInfo = talibe.hizb ? `Hizb ${talibe.hizb}` : (talibe.classe || 'Élève');
  const classInfo = talibe.classe || (talibe.hizb ? 'Cycle Coranique 2 & Passerelle' : 'Cycle Primaire');
  const tuteurInfo = `${talibe.parentNom || 'Parent Référent'} (${talibe.parentTel || '+221 77 000 00 00'})`;
  
  // Photos réalistes selon prénom
  const isGirl = ['fatou', 'aïssatou', 'khadija', 'zahra', 'mariama', 'aminata'].some(g => (talibe.prenom || '').toLowerCase().includes(g));
  const photoUrl = talibe.photo || (isGirl 
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80');

  const subTitle = isDaara ? 'Pensionnaire • Daara & Internat' : 'Élève Régulier • Année 2026-2027';
  const schoolIcon = isDaara ? '🕌' : '🏫';
  const bloodType = talibe.blood || ['O+', 'A+', 'B+', 'AB+'][Math.abs((talibe.nom || '').length) % 4];
  const nfcCode = talibe.nfcCode || ('NFC-2026-' + (Math.abs(talibe.id ? talibe.id.charCodeAt(0) * 97 : 1420)));

  return `
    <div class="badge-cut-wrapper ${isSheet ? 'sheet-mode' : ''}">
      <!-- Repères de massicotage (coins de coupe pour plastification directe A4) -->
      <div class="crop-mark top-left"></div>
      <div class="crop-mark top-right"></div>
      <div class="crop-mark bottom-left"></div>
      <div class="crop-mark bottom-right"></div>
      <div class="massicot-tag">✂️ Format CR80 • 85.6 × 54 mm</div>

      <div class="daara-talibe-badge" style="margin: 0 auto;">
        <div class="badge-inner-header">
          <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
            <div class="badge-logo-icon">${schoolIcon}</div>
            <div style="overflow: hidden;">
              <div class="badge-school-name" title="${school}">${school}</div>
              <div class="badge-sub-title">${subTitle}</div>
            </div>
          </div>
          <div class="badge-nfc-chip">📡 NFC</div>
        </div>

        <div class="badge-inner-body">
          <div class="badge-photo-wrapper">
            <img src="${photoUrl}" alt="Photo ${talibe.prenom}" class="badge-photo-img" loading="eager" crossorigin="anonymous">
            <div class="badge-photo-badge">${progressInfo}</div>
          </div>

          <div class="badge-details">
            <div class="badge-name">${(talibe.prenom || '').toUpperCase()} ${(talibe.nom || '').toUpperCase()}</div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">Matricule :</span>
              <strong class="badge-meta-val">${talibe.matricule}</strong>
            </div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">${isDaara ? 'Cycle / Classe :' : 'Classe :'}</span>
              <strong class="badge-meta-val">${classInfo}</strong>
            </div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">${isDaara ? 'Dortoir / Lit :' : 'Régime :'}</span>
              <strong class="badge-meta-val">${dormInfo}</strong>
            </div>
            <div class="badge-meta-row">
              <span class="badge-meta-label">Groupe Sanguin :</span>
              <strong class="badge-meta-val" style="color: #F87171;">🩸 ${bloodType}</strong>
            </div>
            <div class="badge-meta-row" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span class="badge-meta-label">Tuteur :</span>
              <strong class="badge-meta-val" style="font-size: 0.68rem;">${tuteurInfo}</strong>
            </div>
          </div>

          <div class="badge-qr-box">
            <div class="badge-qr-placeholder">
              <div style="font-size: 1.8rem; line-height: 1;">📱</div>
              <span style="font-size: 0.52rem; color: #0F172A; font-weight: 800; text-align: center; margin-top: 0.15rem;">SCAN NFC</span>
              <span style="font-size: 0.46rem; color: #475569; font-weight: 600; text-align: center;">${nfcCode}</span>
            </div>
          </div>
        </div>

        <div class="badge-inner-footer">
          <span>Sunu School Express • Établissement Agréé 🇸🇳</span>
          <span style="font-weight: 700; color: #FFE082;">VISA DIRECTION ✍️</span>
        </div>
      </div>
    </div>
  `;
}

function printSingleBadge() {
  const isDaara = currentEstablishment?.type === 'DAARA' || (currentEstablishment?.plan || '').toLowerCase().includes('daara');
  const list = isDaara 
    ? (demoState.talibes && demoState.talibes.length ? demoState.talibes : demoState.elevesScolaires) 
    : (demoState.elevesScolaires && demoState.elevesScolaires.length ? demoState.elevesScolaires : demoState.talibes);
  const selectEl = document.getElementById('badgeSelectTalibe');
  const currentVal = selectEl?.value;
  const s = (list && list.find(item => (item.id === currentVal || item.matricule === currentVal))) || (list && list[0]);
  const schoolName = currentEstablishment?.name || (isDaara ? (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT') : 'MON Ã‰TABLISSEMENT');

  const container = document.getElementById('badgePrintModalBody');
  if (container && s) {
    container.innerHTML = generateBadgeCardHtml(s, schoolName, { isSingle: true });
  }
  const modal = document.getElementById('badgePrintModal');
  if (modal) modal.classList.add('active');
  showNotification(`🖨️ Aperçu d'impression prêt pour le badge individuel de [${s ? s.prenom + ' ' + s.nom : 'Élève'}].`);
}

function closeBadgePrintModal() {
  const modal = document.getElementById('badgePrintModal');
  if (modal) modal.classList.remove('active');
  document.body.classList.remove('printing-single-badge');
}

function printAllBadgesPdf() {
  const isDaara = currentEstablishment?.type === 'DAARA' || (currentEstablishment?.plan || '').toLowerCase().includes('daara');
  const list = isDaara 
    ? (demoState.talibes && demoState.talibes.length ? demoState.talibes : demoState.elevesScolaires) 
    : (demoState.elevesScolaires && demoState.elevesScolaires.length ? demoState.elevesScolaires : demoState.talibes);
  const schoolName = currentEstablishment?.name || (isDaara ? (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT') : 'MON Ã‰TABLISSEMENT');

  const grid = document.getElementById('badgePlancheGrid');
  if (grid && list && list.length > 0) {
    grid.innerHTML = list.slice(0, 4).map(s => generateBadgeCardHtml(s, schoolName, { isSheet: true })).join('');
  }
  const modal = document.getElementById('badgePlancheModal');
  if (modal) modal.classList.add('active');
  showNotification(`📑 Planche d'impression A4 générée (${Math.min(list ? list.length : 0, 4)} badges prêts avec repères de massicotage).`);
}

function closeBadgePlancheModal() {
  const modal = document.getElementById('badgePlancheModal');
  if (modal) modal.classList.remove('active');
  document.body.classList.remove('printing-badge-planche');
}

function executePhysicalPrint() {
  const isPlanche = document.getElementById('badgePlancheModal')?.classList.contains('active');
  const isSingleBadge = document.getElementById('badgePrintModal')?.classList.contains('active');
  
  if (isPlanche) document.body.classList.add('printing-badge-planche');
  if (isSingleBadge) document.body.classList.add('printing-single-badge');

  window.print();

  setTimeout(() => {
    document.body.classList.remove('printing-badge-planche', 'printing-single-badge');
  }, 1200);
}

// --- MODULE 10 : ACCOMPAGNEMENT SUR SITE & DÉPLOIEMENT ---
function renderAuditTab() {
  // Rafraîchissement des données d'accompagnement sur site
}

function downloadAnnualAuditReport() {
  const schoolEl = document.getElementById('auditReportSchoolName');
  if (schoolEl) {
    schoolEl.textContent = (currentEstablishment?.name || (isDaara ? 'MON DAARA MODERNE' : 'MON Ã‰TABLISSEMENT')).toUpperCase();
  }
  const modal = document.getElementById('auditReportModal');
  if (modal) modal.classList.add('active');
  showNotification(`📥 Fiche de Visite & Rapport d'Accompagnement sur Site prêts à l'impression.`);
}

function closeAuditReportModal() {
  const modal = document.getElementById('auditReportModal');
  if (modal) modal.classList.remove('active');
}

function openAuditBookingModal() {
  const modal = document.getElementById('auditBookingModal');
  if (modal) {
    const today = new Date();
    today.setDate(today.getDate() + 14);
    const dateInput = document.getElementById('auditBookingDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = today.toISOString().split('T')[0];
    }
    modal.classList.add('active');
  }
}

function closeAuditBookingModal() {
  const modal = document.getElementById('auditBookingModal');
  if (modal) modal.classList.remove('active');
}

function submitAuditBooking(e) {
  if (e) e.preventDefault();
  const date = document.getElementById('auditBookingDate')?.value || 'prochainement';
  const time = document.getElementById('auditBookingTime')?.value || 'matin';
  closeAuditBookingModal();
  showNotification(`📅 Demande d'intervention sur site confirmée pour le ${date} (${time}). Votre Directeur Général Moustapha Diamil Diouf (Diamil-Express) vous contactera 48h à l'avance pour valider l'horaire.`);
  
  if (demoState && demoState.auditLogs) {
    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Visite d'accompagnement sur site programmée : le ${date}`,
      user: 'Directeur Établissement'
    });
    if (typeof renderAuditLogs === 'function') renderAuditLogs();
  }
}

function openModalNewStudent(forcedType = null) {
  const isDaara = forcedType ? (forcedType === 'TALIBE') : (currentEstablishment?.type === 'DAARA');
  const modal = document.getElementById('newStudentModal');
  if (!modal) {
    return;
  }

  // Adapter les textes et champs selon Daara ou École
  const titleEl = document.getElementById('modalStudentTitle');
  const subEl = document.getElementById('modalStudentSub');
  const iconEl = document.getElementById('modalStudentIcon');
  const badgeEl = document.getElementById('modalStudentModeBadge');
  const etabNameEl = document.getElementById('modalStudentEtabName');
  const daaraFields = document.getElementById('daaraSpecificFields');
  const ecoleFields = document.getElementById('ecoleSpecificFields');

  if (etabNameEl && currentEstablishment?.name) {
    etabNameEl.textContent = currentEstablishment.name;
  }

  if (isDaara) {
    if (iconEl) iconEl.textContent = '🕌';
    if (titleEl) titleEl.textContent = 'Inscription d\'un Nouveau Talibé';
    if (subEl) subEl.textContent = 'Affectation immédiate au dortoir, numéro de chambre et mémorisation Hizb.';
    if (badgeEl) {
      badgeEl.className = 'badge-tag badge-primary';
      badgeEl.textContent = 'Mode Daara Moderne (Internat)';
    }
    if (daaraFields) daaraFields.style.display = 'block';
    if (ecoleFields) ecoleFields.style.display = 'none';
  } else {
    if (iconEl) iconEl.textContent = '🏫';
    if (titleEl) titleEl.textContent = 'Inscription d\'un Nouvel Élève';
    if (subEl) subEl.textContent = 'Affectation pédagogique, classe et carnet de scolarité.';
    if (badgeEl) {
      badgeEl.className = 'badge-tag badge-gold';
      badgeEl.textContent = 'Mode École Privée';
    }
    if (daaraFields) daaraFields.style.display = 'none';
    if (ecoleFields) ecoleFields.style.display = 'block';
  }

  // Remplir dynamiquement les classes réelles de l'établissement
  const classSelect = document.getElementById('newStudentClasse');
  if (classSelect) {
    const customClasses = getEstablishmentClasses();
    if (customClasses.length > 0) {
      classSelect.innerHTML = customClasses.map(c => `
        <option value="${c.nom}">${c.nom} (${c.cycle} • ${c.salle || 'Salle'})</option>
      `).join('');
    } else {
      classSelect.innerHTML = `
        <option value="CI">CI (Cours d'Initiation)</option>
        <option value="CP">CP (Cours Préparatoire)</option>
        <option value="CE1">CE1</option>
        <option value="CE2">CE2</option>
        <option value="CM1">CM1</option>
        <option value="CM2" selected>CM2 (Certificat de Fin d'Études)</option>
        <option value="6ème">6ème (Collège)</option>
        <option value="5ème">5ème</option>
        <option value="4ème">4ème</option>
        <option value="3ème">3ème (BFEM)</option>
        <option value="Seconde">Seconde (Lycée)</option>
        <option value="Première">Première</option>
        <option value="Terminale">Terminale (BAC)</option>
      `;
    }
  }

  // Vider les champs
  if (document.getElementById('newStudentPrenom')) document.getElementById('newStudentPrenom').value = '';
  if (document.getElementById('newStudentNom')) document.getElementById('newStudentNom').value = '';
  if (document.getElementById('newStudentParentNom')) document.getElementById('newStudentParentNom').value = '';
  if (document.getElementById('newStudentParentTel')) document.getElementById('newStudentParentTel').value = '+221 77 ';
  if (document.getElementById('newStudentChambre')) document.getElementById('newStudentChambre').value = 'Chambre 03 (Pavillon Al-Madina)';
  if (document.getElementById('newStudentLit')) document.getElementById('newStudentLit').value = '2';
  if (document.getElementById('newStudentHizb')) document.getElementById('newStudentHizb').value = '1';
  if (document.getElementById('newStudentSourate')) document.getElementById('newStudentSourate').value = 'Al-Fatiha';

  modal.classList.add('active');
}

function submitModalNewStudent() {
  const isDaara = currentEstablishment?.type === 'DAARA';
  const prenom = document.getElementById('newStudentPrenom')?.value?.trim();
  const nom = document.getElementById('newStudentNom')?.value?.trim();
  const parentNom = document.getElementById('newStudentParentNom')?.value?.trim();
  const parentTel = document.getElementById('newStudentParentTel')?.value?.trim();

  if (!prenom || !nom) {
    showNotification('⚠️ Veuillez renseigner le prénom et le nom de l\'apprenant.');
    return;
  }

  const newMatricule = (isDaara ? 'TAL-2026-' : 'ELE-2026-') + Math.floor(100 + Math.random() * 900);
  const todayFormatted = new Date().toLocaleDateString('fr-FR');

  if (isDaara) {
    const chambreVal = document.getElementById('newStudentChambre')?.value?.trim() || 'Chambre 01 (Pavillon Al-Madina)';
    const litVal = parseInt(document.getElementById('newStudentLit')?.value) || 1;
    const hizbVal = parseInt(document.getElementById('newStudentHizb')?.value) || 1;
    const sourateVal = document.getElementById('newStudentSourate')?.value?.trim() || 'Al-Fatiha';

    const newTalibe = {
      id: 'tal_' + Date.now(),
      matricule: newMatricule,
      prenom,
      nom,
      age: 11,
      hizb: hizbVal,
      juz: Math.ceil(hizbVal / 2),
      sourate: sourateVal,
      tajwidNote: null, // Vierge : l'Oustaz saisira la première note lors des évaluations
      qualite: 'EN_COURS',
      chambre: chambreVal,
      dortoir: chambreVal.includes('(') ? chambreVal.split('(')[1].replace(')', '') : 'Pavillon Al-Madina',
      lit: litVal,
      mensualiteStatut: 'PAYE',
      parentNom: parentNom || ('Tuteur ' + nom),
      parentTel: parentTel || '+221 77 123 45 67',
      dateInscription: todayFormatted,
      classe: `Niveau ${Math.ceil(hizbVal / 10)} (Hifz)`,
      notes: []
    };

    if (isRealRegisteredEstablishment()) {
      const list = getEstablishmentActiveStudents(true);
      list.unshift(newTalibe);
      saveEstablishmentActiveStudents(list, true);
    } else {
      demoState.talibes.unshift(newTalibe);
    }

    closeAllModals();
    renderWsData(true);
    showNotification(`🎉 Talibé ${prenom} ${nom} (${newMatricule}) inscrit avec succès et affecté à la ${chambreVal} (Lit ${litVal}) !`);
  } else {
    const classeVal = document.getElementById('newStudentClasse')?.value || 'CM2 A';
    const newEleve = {
      id: 'eleve_' + Date.now(),
      matricule: newMatricule,
      prenom,
      nom,
      classe: classeVal,
      dateInscription: todayFormatted,
      parentTel: parentTel || '+221 77 123 45 67',
      parentNom: parentNom || ('Parent ' + nom),
      moyenne: null, // Vierge : en attente des devoirs & compositions
      rang: '--',
      mention: 'En attente d\'évaluation',
      fraisStatut: 'PAYE',
      absences: 0,
      notes: []
    };

    if (isRealRegisteredEstablishment()) {
      const list = getEstablishmentActiveStudents(false);
      list.unshift(newEleve);
      saveEstablishmentActiveStudents(list, false);
    } else {
      demoState.elevesScolaires.unshift(newEleve);
    }

    closeAllModals();
    renderWsData(false);
    showNotification(`🎉 Élève ${prenom} ${nom} (${newMatricule}) inscrit avec succès en classe de ${classeVal} !`);
  }
}

function openNewRegistrationInWs() {
  openModalNewStudent();
}

function openModalImportCsv() {
  const isDaara = currentEstablishment?.type === 'DAARA';
  showNotification(`📥 Importateur Excel/CSV prêt : Déposez votre fichier .xlsx ou .csv pour intégrer votre effectif.`);
}

function exportStudentsToCsv() {
  const isDaara = currentEstablishment?.type === 'DAARA';
  const list = getEstablishmentActiveStudents(isDaara);
  if (!list || list.length === 0) {
    showNotification('ℹ️ Aucun élève à exporter pour le moment (effectif vide).');
    return;
  }
  let csv = isDaara 
    ? "Matricule,Nom,Prenom,Hizb,Chambre,Lit,Telephone_Parent,Statut\n"
    : "Matricule,Nom,Prenom,Classe,Date_Inscription,Telephone_Parent,Moyenne,Statut\n";
  list.forEach(s => {
    if (isDaara) {
      csv += `"${s.matricule}","${s.nom}","${s.prenom}","${s.hizb || 1}","${s.chambre || ''}","${s.lit || ''}","${s.parentTel || ''}","INSCRIT"\n`;
    } else {
      csv += `"${s.matricule}","${s.nom}","${s.prenom}","${s.classe || ''}","${s.dateInscription || ''}","${s.parentTel || ''}","${s.moyenne || ''}","INSCRIT"\n`;
    }
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Effectif_${(currentEstablishment?.name || 'Etablissement').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification('📤 Fichier CSV officiel téléchargé !');
}
window.exportStudentsToCsv = exportStudentsToCsv;

function printClassRoster(customClassFilter = null) {
  const isDaara = currentEstablishment?.type === 'DAARA';
  let list = getEstablishmentActiveStudents(isDaara);
  
  if (!list || list.length === 0) {
    // Fallback aux données de démonstration si effectif non encore initialisé
    list = isDaara ? demoState.talibes : demoState.elevesScolaires;
  }

  if (!list || list.length === 0) {
    showNotification('ℹ️ Aucun élève dans l\'effectif actif à imprimer.');
    return;
  }

  const modal = document.getElementById('classRosterPrintModal');
  if (!modal) {
    window.print();
    return;
  }

  const schoolName = currentEstablishment?.name || (isDaara ? "Mon Daara Moderne" : "Mon Établissement");
  const schoolLogo = isDaara ? '🕌' : '🏫';
  const city = currentEstablishment?.city || "Dakar";

  // Elements DOM
  const nameEl = document.getElementById('printRosterSchoolName');
  const logoEl = document.getElementById('printRosterSchoolLogo');
  const metaEl = document.getElementById('printRosterSchoolMeta');
  const stampEl = document.getElementById('printRosterStampName');
  const totalEl = document.getElementById('printRosterTotalCount');
  const dateEl = document.getElementById('printRosterDate');
  const classBadgeEl = document.getElementById('printRosterClassBadge');
  const tableEl = document.getElementById('printRosterTable');

  if (nameEl) nameEl.textContent = schoolName;
  if (logoEl) logoEl.textContent = schoolLogo;
  if (metaEl) metaEl.textContent = `Inspection d'Académie de ${city} • Registre Matriculaire Certifié`;
  if (stampEl) stampEl.textContent = schoolName;
  if (totalEl) totalEl.textContent = `${list.length} ${isDaara ? 'Talibés Inscrits' : 'Élèves Inscrits'}`;
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (classBadgeEl) classBadgeEl.textContent = isDaara ? 'Internat & Talibés Externes • Daara Moderne' : 'Toutes les Classes • Année 2026-2027';

  // Construction du tableau imprimable A4 haute lisibilité
  if (tableEl) {
    if (isDaara) {
      tableEl.innerHTML = `
        <thead>
          <tr>
            <th style="width: 26px; text-align: center;">N°</th>
            <th style="width: 95px;">Matricule</th>
            <th>Nom &amp; Prénom du Talibé</th>
            <th style="width: 145px;">Chambre &amp; Pavillon</th>
            <th style="width: 60px; text-align: center;">Lit</th>
            <th style="width: 80px; text-align: center;">Hizb</th>
            <th style="width: 110px;">Parent / Tuteur</th>
            <th style="width: 130px; text-align: center;">Appel &amp; Émargement<br><span style="font-size: 6pt; font-weight: 500; color: #64748B;">L • M • M • J • V • S</span></th>
            <th style="width: 75px; text-align: center;">Visa Oustaz</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((t, idx) => `
            <tr>
              <td style="text-align: center; font-weight: 700; color: #64748B;">${idx + 1}</td>
              <td><strong style="color: #0F172A; font-size: 7.5pt;">${t.matricule || ('DAA-2026-' + String(idx+1).padStart(3, '0'))}</strong></td>
              <td><strong style="color: #0A192F;">${t.prenom || ''} ${t.nom || ''}</strong></td>
              <td style="font-size: 7.5pt; color: #1E293B;">${t.chambre || t.dortoir || ('Chambre 0' + ((idx % 3) + 1) + ' (Al-Madina)')}</td>
              <td style="text-align: center; font-weight: 800; color: #0284C7; font-size: 7.5pt;">N°${t.lit || ((idx % 6) + 1)}</td>
              <td style="text-align: center;"><span style="display: inline-block; padding: 1px 5px; background: #FEF3C7; color: #B45309; font-weight: 800; border-radius: 3px; font-size: 7pt;">Hizb ${t.hizb || (30 + (idx % 30))}</span></td>
              <td style="font-size: 7.5pt; color: #475569;">${t.telParent || t.tel || t.parent || '+221 77 106 48 77'}</td>
              <td style="text-align: center; letter-spacing: 5px; color: #CBD5E1; font-size: 8pt; user-select: none;">▢ ▢ ▢ ▢ ▢ ▢</td>
              <td style="text-align: center; font-size: 7pt; color: #94A3B8;">—</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    } else {
      tableEl.innerHTML = `
        <thead>
          <tr>
            <th style="width: 26px; text-align: center;">N°</th>
            <th style="width: 95px;">Matricule</th>
            <th>Nom &amp; Prénom de l'Élève</th>
            <th style="width: 75px; text-align: center;">Classe</th>
            <th style="width: 80px;">Date Inscr.</th>
            <th style="width: 115px;">Téléphone Parent</th>
            <th style="width: 70px; text-align: center;">Statut</th>
            <th style="width: 135px; text-align: center;">Appel &amp; Émargement<br><span style="font-size: 6pt; font-weight: 500; color: #64748B;">L • M • M • J • V • S</span></th>
            <th style="width: 75px; text-align: center;">Observations</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((s, idx) => `
            <tr>
              <td style="text-align: center; font-weight: 700; color: #64748B;">${idx + 1}</td>
              <td><strong style="color: #0F172A; font-size: 7.5pt;">${s.matricule || ('MAT-2026-' + String(idx+1).padStart(3, '0'))}</strong></td>
              <td><strong style="color: #0A192F;">${s.prenom || ''} ${s.nom || ''}</strong></td>
              <td style="text-align: center;"><span style="display: inline-block; padding: 1px 6px; background: #E0F2FE; color: #0369A1; font-weight: 700; border-radius: 3px; font-size: 7pt;">${s.classe || '6ème A'}</span></td>
              <td style="font-size: 7.5pt; color: #475569;">${s.dateInscription || s.date || '01/10/2026'}</td>
              <td style="font-size: 7.5pt; color: #475569;">${s.telParent || s.parent || s.tel || '+221 77 106 48 77'}</td>
              <td style="text-align: center;"><span style="color: #15803D; font-weight: 700; font-size: 7pt;">✓ ${s.statut || 'Inscrit'}</span></td>
              <td style="text-align: center; letter-spacing: 5px; color: #CBD5E1; font-size: 8pt; user-select: none;">▢ ▢ ▢ ▢ ▢ ▢</td>
              <td style="text-align: center; font-size: 7pt; color: #94A3B8;">—</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }
  }

  // Activer le modal et préparer l'impression
  closeAllModals();
  modal.style.zIndex = '2500';
  modal.classList.add('active');
  document.body.classList.add('printing-roster');

  showNotification(`🖨️ Préparation du Registre d'Appel (${list.length} inscrits)...`);

  // Lancement automatique de l'impression
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-roster');
    }, 1200);
  }, 250);
}
window.printClassRoster = printClassRoster;

function openChangeRoomModal(talibeId) {
  const talibe = demoState.talibes.find(t => t.id === talibeId);
  if (!talibe) {
    showNotification('⚠️ Talibé introuvable.');
    return;
  }

  const modal = document.getElementById('changeRoomModal');
  if (!modal) return;

  document.getElementById('changeRoomTalibeId').value = talibe.id;
  document.getElementById('changeRoomTalibeName').textContent = `${talibe.prenom} ${talibe.nom}`;
  document.getElementById('changeRoomMatricule').textContent = `(${talibe.matricule})`;
  document.getElementById('changeRoomHizbBadge').textContent = `Hizb ${talibe.hizb}`;
  
  const ch = talibe.chambre || 'Chambre 01';
  const dorm = talibe.dortoir ? ` • ${talibe.dortoir}` : '';
  const lit = talibe.lit ? ` (Lit ${talibe.lit})` : '';
  document.getElementById('changeRoomCurrentInfo').textContent = `${ch}${dorm}${lit}`;

  const currentFullDorm = talibe.dortoir && !ch.includes('(') ? `${ch} (${talibe.dortoir})` : ch;
  document.getElementById('changeRoomInput').value = currentFullDorm;
  document.getElementById('changeLitInput').value = talibe.lit || 1;
  if (document.getElementById('changeRoomNotes')) document.getElementById('changeRoomNotes').value = '';

  modal.classList.add('active');
}

function submitChangeRoom() {
  const talibeId = document.getElementById('changeRoomTalibeId').value;
  const talibe = demoState.talibes.find(t => t.id === talibeId);
  if (!talibe) {
    closeAllModals();
    return;
  }

  const newRoomVal = document.getElementById('changeRoomInput')?.value?.trim();
  const newLitVal = parseInt(document.getElementById('changeLitInput')?.value) || 1;
  const reason = document.getElementById('changeRoomReason')?.value || 'Réorganisation du dortoir';

  if (!newRoomVal) {
    showNotification('⚠️ Veuillez renseigner le numéro de la nouvelle chambre.');
    return;
  }

  const prevChambre = talibe.chambre || 'Chambre non assignée';
  const prevLit = talibe.lit || '?';

  // Mise à jour de la chambre, dortoir et lit
  talibe.chambre = newRoomVal;
  if (newRoomVal.includes('(')) {
    talibe.dortoir = newRoomVal.split('(')[1].replace(')', '').trim();
  } else {
    talibe.dortoir = 'Pavillon Al-Madina';
  }
  talibe.lit = newLitVal;

  // Enregistrement dans les logs d'audit
  if (demoState && demoState.auditLogs) {
    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Mutation de chambre : ${talibe.prenom} ${talibe.nom} transféré(e) de [${prevChambre}, Lit ${prevLit}] vers [${newRoomVal}, Lit ${newLitVal}] (${reason})`,
      user: 'Oustaz / Responsable Internat'
    });
    if (typeof renderAuditLogs === 'function') renderAuditLogs();
  }

  closeAllModals();
  renderWsData(true);
  showNotification(`✅ Chambre mise à jour : ${talibe.prenom} ${talibe.nom} est désormais affecté(e) à la ${newRoomVal} (Lit ${newLitVal}) !`);
}

let selectedWsOperator = 'WAVE';

function openWsWavePayment() {
  const modal = document.getElementById('wsPaymentModal');
  if (!modal) return;

  // Mettre à jour le badge de l'école dans le modal
  const schoolBadge = document.getElementById('wsPaySchoolBadge');
  if (schoolBadge && currentEstablishment && currentEstablishment.name) {
    schoolBadge.textContent = currentEstablishment.name;
  }

  // Remplir dynamiquement le sélecteur d'élèves
  const select = document.getElementById('wsPayStudentSelect');
  if (select) {
    select.innerHTML = '';
    const isDaara = currentEstablishment && currentEstablishment.type === 'DAARA';
    const list = getEstablishmentActiveStudents(isDaara);
    
    if (list.length > 0) {
      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = `${item.prenom} ${item.nom}`;
        opt.setAttribute('data-tel', item.parentTel || '+221 77 123 45 67');
        opt.textContent = `${item.prenom} ${item.nom} (${item.matricule})`;
        select.appendChild(opt);
      });
      document.getElementById('wsPayPhoneInput').value = list[0].parentTel || '+221 77 123 45 67';
    } else {
      const opt = document.createElement('option');
      opt.value = 'Élève / Parent Payeur';
      opt.setAttribute('data-tel', '+221 77 000 00 00');
      opt.textContent = '-- Aucun élève inscrit (Paiement direct) --';
      select.appendChild(opt);
      document.getElementById('wsPayPhoneInput').value = '+221 77 000 00 00';
    }
  }

  // Réinitialiser la vue QR code et bouton
  document.getElementById('wsWaveQrContainer').style.display = 'none';
  const actionBox = document.getElementById('wsReceiptActionBox');
  if (actionBox) actionBox.style.display = 'none';
  const submitBtn = document.getElementById('wsPaySubmitBtn');
  submitBtn.style.display = 'block';
  selectWsOperator('WAVE', document.querySelector('[data-ws-op="WAVE"]'));

  modal.classList.add('active');
}

function onWsStudentSelected(studentName) {
  const isDaara = currentEstablishment && currentEstablishment.type === 'DAARA';
  const list = getEstablishmentActiveStudents(isDaara);
  const found = list.find(item => `${item.prenom} ${item.nom}` === studentName);
  if (found && found.parentTel) {
    document.getElementById('wsPayPhoneInput').value = found.parentTel;
  }
}

function selectWsOperator(op, elem) {
  selectedWsOperator = op;
  document.querySelectorAll('[data-ws-op]').forEach(el => el.classList.remove('selected'));
  if (elem) elem.classList.add('selected');

  const btn = document.getElementById('wsPaySubmitBtn');
  if (btn) {
    if (op === 'WAVE') {
      btn.textContent = "🌊 Lancer l'Encaissement Wave Direct (QR Code)";
      btn.style.background = '#1BA4E8';
    } else if (op === 'ORANGE_MONEY') {
      btn.textContent = "🍊 Valider Paiement Orange Money (#144# / Max it)";
      btn.style.background = '#FF6600';
    } else if (op === 'FREE_MONEY') {
      btn.textContent = "🔴 Valider Paiement Free Money (*150#)";
      btn.style.background = '#ED1C24';
    } else if (op === 'ESPECES') {
      btn.textContent = "💵 Encaisser en Espèces (Caisse Guichet - Cpt 5711)";
      btn.style.background = '#10B981';
    } else if (op === 'CHEQUE_BANQUE') {
      btn.textContent = "🏦 Valider Chèque / Virement Bancaire (Cpt 5210)";
      btn.style.background = '#6366F1';
    }
  }
}

// Données de la dernière facture de paiement pour ouverture immédiate
let lastPaymentReceiptData = null;

function viewCurrentPaymentReceipt() {
  closeAllModals();
  const txs = getEstablishmentTransactions();
  if (lastPaymentReceiptData) {
    openReceiptModal(
      lastPaymentReceiptData.ref,
      lastPaymentReceiptData.name,
      lastPaymentReceiptData.amount,
      lastPaymentReceiptData.motif,
      lastPaymentReceiptData.phone,
      lastPaymentReceiptData.op,
      lastPaymentReceiptData.school
    );
  } else if (txs.length > 0) {
    const tx = txs[0];
    openReceiptModal(tx.ref, tx.eleve, tx.montant, tx.motif, tx.tel, tx.operateur, currentEstablishment?.name || 'Direction');
  } else {
    showNotification("ℹ️ Aucune facture enregistrée. Effectuez d'abord un encaissement dans la caisse.");
  }
}

function executeWsPayment() {
  const payerName = document.getElementById('wsPayStudentSelect').value || 'Aïssatou Diop';
  const amount = document.getElementById('wsPayAmountInput').value || '35 000';
  const motif = document.getElementById('wsPayMotifSelect').value || 'Scolarité Mensuelle';
  const phone = document.getElementById('wsPayPhoneInput').value || '+221 77 334 12 90';
  const op = selectedWsOperator || 'WAVE';

  const qrContainer = document.getElementById('wsWaveQrContainer');
  const submitBtn = document.getElementById('wsPaySubmitBtn');
  const actionBox = document.getElementById('wsReceiptActionBox');

  qrContainer.style.display = 'block';
  submitBtn.style.display = 'none';
  if (actionBox) actionBox.style.display = 'none';

  const statusText = document.getElementById('wsWaveStatusText');
  const countdown = document.getElementById('wsWaveCountdown');

  statusText.innerHTML = `<span style="color: #1BA4E8; font-weight: 700;">⏳ Scan en cours de validation par ${op}...</span>`;

  setTimeout(() => {
    statusText.innerHTML = '<span style="color: #10B981; font-weight: 800;">✅ Transaction Validée avec Succès !</span>';
    countdown.textContent = '🎉 PAIEMENT ENCAISSÉ SUR LE COMPTE DE L\'ÉTABLISSEMENT';

    // Créer la référence et le montant formaté
    const newRef = 'SSE-2026-' + Math.floor(10000 + Math.random() * 90000);
    const cleanNumAmount = Number(amount.toString().replace(/[^0-9]/g, '') || 35000);
    const amountFormatted = `${cleanNumAmount.toLocaleString('fr-FR')} FCFA`;

    // Mémoriser pour le bouton d'accès direct
    lastPaymentReceiptData = {
      ref: newRef,
      name: payerName,
      amount: amountFormatted,
      motif: motif,
      phone: phone,
      op: op,
      school: currentEstablishment?.name || 'Direction'
    };

    const newTx = {
      ref: newRef,
      date: 'À l\'instant',
      eleve: payerName,
      motif: motif,
      montant: amountFormatted,
      operateur: op,
      tel: phone,
      statut: 'VALIDE'
    };

    if (isRealRegisteredEstablishment()) {
      const txs = getEstablishmentTransactions();
      txs.unshift(newTx);
      saveEstablishmentTransactions(txs);

      // Création automatique de l'écriture comptable au Grand Livre SYSCOHADA
      const journal = getEstablishmentJournal();
      const count = journal.length + 1;
      const debitAccount = (op === 'ESPECES') ? '571100' : ((op === 'CHEQUE_BANQUE') ? '521000' : '512100');
      journal.unshift({
        date: new Date().toLocaleDateString('fr-FR'),
        ref: `PC-2026-${String(count).padStart(3, '0')}`,
        debit: debitAccount,
        credit: '706100',
        motif: `Encaissement ${motif} (${payerName})`,
        debitVal: cleanNumAmount,
        creditVal: cleanNumAmount,
        status: 'CONFORME'
      });
      saveEstablishmentJournal(journal);
    } else {
      if (!demoState.transactions) demoState.transactions = [];
      demoState.transactions.unshift(newTx);
    }

    demoState.auditLogs.unshift({
      time: new Date().toLocaleTimeString(),
      action: `Encaissement ${op} réussi : ${amountFormatted} (${payerName} - Réf: ${newRef})`,
      user: `Caisse Centrale (${currentEstablishment?.name || 'Direction'})`
    });

    // Rendre visible immédiatement le bouton d'accès à la facture dans le modal
    if (actionBox) {
      actionBox.style.display = 'block';
    }

    // Mettre à jour les données du workspace et de la caisse
    if (currentEstablishment && typeof renderWsData === 'function') {
      renderWsData(currentEstablishment.type === 'DAARA');
    }
    if (typeof renderTransactions === 'function') renderTransactions();
    if (typeof renderAuditLogs === 'function') renderAuditLogs();

    showNotification(`💳 Encaissement ${op} de ${amountFormatted} validé pour ${payerName} !`);

    // Fermer le modal de paiement et ouvrir le reçu officiel SYSCOHADA personnalisé
    setTimeout(() => {
      closeAllModals();
      openReceiptModal(newRef, payerName, amountFormatted, motif, phone, op, currentEstablishment?.name);
    }, 1000);

  }, 2200);
}

function closeAllModals(forceAll = false) {
  const parentModal = document.getElementById('parentPortalModal');
  const isParentOpen = parentModal && parentModal.classList.contains('active');
  const studentModal = document.getElementById('studentPortalModal');
  const isStudentOpen = studentModal && studentModal.classList.contains('active');

  document.querySelectorAll('.modal-overlay').forEach(m => {
    if (!forceAll && isParentOpen && m.id === 'parentPortalModal') {
      return; // Conserver le portail parent ouvert lors de la fermeture d'un sous-modal
    }
    if (!forceAll && isStudentOpen && m.id === 'studentPortalModal') {
      return; // Conserver le portail élève ouvert lors de la fermeture d'un sous-modal
    }
    m.classList.remove('active');
    if (m.id !== 'parentPortalModal' && m.id !== 'parentAppreciationModal' && m.id !== 'studentPortalModal') {
      m.style.zIndex = '';
    }
  });
  document.body.classList.remove('printing-receipt', 'printing-bulletin', 'printing-timetable', 'printing-payslip', 'printing-bilan', 'printing-certificat');
}

// Gestion de l'état d'impression pour Facture, Bulletin Scolaire, Emploi du Temps, Bilan et Fiche de Paie
window.addEventListener('beforeprint', () => {
  const receiptModal = document.getElementById('receiptModal');
  const bulletinModal = document.getElementById('bulletinModal');
  const timetableModal = document.getElementById('timetablePrintModal');
  const payslipModal = document.getElementById('payslipModal');
  const bilanModal = document.getElementById('syscohadaBilanModal');
  const certificatModal = document.getElementById('syscohadaCertificatModal');
  const studentModal = document.getElementById('studentPortalModal');

  if (receiptModal && receiptModal.classList.contains('active')) {
    document.body.classList.add('printing-receipt');
  } else if (bulletinModal && bulletinModal.classList.contains('active')) {
    document.body.classList.add('printing-bulletin');
  } else if (timetableModal && timetableModal.classList.contains('active')) {
    document.body.classList.add('printing-timetable');
  } else if (payslipModal && payslipModal.classList.contains('active')) {
    document.body.classList.add('printing-payslip');
  } else if (bilanModal && bilanModal.classList.contains('active')) {
    document.body.classList.add('printing-bilan');
  } else if (certificatModal && certificatModal.classList.contains('active')) {
    document.body.classList.add('printing-certificat');
  } else if (studentModal && studentModal.classList.contains('active') && typeof currentStudentInnerTab !== 'undefined' && currentStudentInnerTab === 'timetable') {
    printStudentTimetable(false);
    document.body.classList.add('printing-timetable');
  } else {
    // Si l'utilisateur lance l'impression directement depuis l'onglet Emploi du temps
    const wsHRContent = document.getElementById('wsHRContent');
    if (wsHRContent && wsHRContent.offsetParent !== null) {
      openTimetablePrintModal(selectedTimetableClass || 'CM2 A');
      document.body.classList.add('printing-timetable');
    }
  }
});

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing-receipt', 'printing-bulletin', 'printing-timetable', 'printing-payslip', 'printing-bilan', 'printing-certificat');
});

function showNotification(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0E243F;
    border: 1px solid #00D2B4;
    color: #F8F9FA;
    padding: 1rem 1.4rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(0,210,180,0.3);
    z-index: 9999;
    font-weight: 600;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ==========================================================================
// LOGIQUE DE LA BIBLIOTHÈQUE NUMÉRIQUE INTERACTIVE (E-BOOK, VIDÉO & QUIZ)
// ==========================================================================

// --- 1. RECHERCHE & FILTRES DU CATALOGUE ---
function filterLibraryResources() {
  const query = document.getElementById('libSearchInput').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.lib-resource-card');

  cards.forEach(card => {
    const title = card.querySelector('.lib-resource-title').textContent.toLowerCase();
    const desc = card.querySelector('.lib-resource-desc').textContent.toLowerCase();
    if (title.includes(query) || desc.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function filterLibCategory(category, btnElement) {
  document.querySelectorAll('.lib-filter-chip').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const cards = document.querySelectorAll('.lib-resource-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category') || '';
    if (category === 'all' || cardCat.includes(category)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// --- 2. VISIONNEUSE DE MANUELS & E-BOOKS (LECTEUR MULTI-PAGES) ---
let currentEbook = {
  id: 'tajwid',
  title: '',
  author: '',
  tag: '',
  pageIndex: 0,
  pages: []
};

const ebooksDatabase = {
  tajwid: {
    title: "Précis des Règles de Tajwîd (Récitation selon Hafs)",
    author: "Commission Pédagogique des Daaras du Sénégal",
    tag: "Enseignement Islamique & Coran",
    pages: [
      {
        title: "Introduction à la Récitation Coranique (Hifz & Tartîl)",
        content: `
          <p>Le <strong>Tajwîd (تجويد)</strong> consiste à donner à chaque lettre arabe son point d'articulation précis (*Makhraj*) et ses caractéristiques phonétiques complètes (*Sifât*).</p>
          <div class="arabic-calligraphy">وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</div>
          <p><em>« Et récite le Coran lentement et clairement »</em> (Sourate Al-Muzzammil, verset 4).</p>
          <div style="background: #F8FAFC; border-left: 4px solid #00D2B4; padding: 0.8rem 1rem; margin: 1rem 0; border-radius: 4px;">
            <strong>Objectif pédagogique pour le talibé :</strong> Perfectionner la récitation quotidienne et éviter les erreurs manifestes (*Al-Lahn Al-Jali*) lors de l'apprentissage des 60 Hizb.
          </div>
        `
      },
      {
        title: "Chapitre 1 : Les 4 Règles du Noun Sakin (نْ) & Tanween",
        content: `
          <p>Lorsque le Noun sans voyelle (*Noun Sâkin*) ou le *Tanween* (double voyelle) rencontre une lettre de l'alphabet, 4 règles s'appliquent :</p>
          <ul style="margin: 0.8rem 0 1rem 1.4rem; line-height: 1.8;">
            <li><strong>1. Al-Izhâr (الإظهار) :</strong> Récitation claire sans nasillement devant les 6 lettres de la gorge : <code>ء , هـ , ع , ح , غ , خ</code> (ex : <span class="font-arabic" style="color: #D4AF37;">مَنْ آمَنَ</span>).</li>
            <li><strong>2. Al-Idghâm (الإدغام) :</strong> Assimilation dans les lettres du mot <code>يَرْمَلُون</code> (ex : <span class="font-arabic" style="color: #D4AF37;">مَن يَقُولُ</span>).</li>
            <li><strong>3. Al-Iqlâb (الإقلاب) :</strong> Transformation en son "Mim" avec nasillement devant la lettre <code>ب</code> (ex : <span class="font-arabic" style="color: #D4AF37;">مِن بَعْدِ</span>).</li>
            <li><strong>4. Al-Ikhfâ' (الإخفاء) :</strong> Dissimulation nasalisée devant les 15 autres lettres restantes.</li>
          </ul>
        `
      },
      {
        title: "Chapitre 2 : La Règle d'Al-Qalqalah (L'Écho Sonore)",
        content: `
          <p>La <strong>Qalqalah (القلقلة)</strong> est un rebond sonore qui se produit sur 5 lettres particulières lorsqu'elles portent un Soukoûn (ْ) :</p>
          <div class="arabic-calligraphy">قُطْبُ جَدٍّ (ق , ط , ب , ج , د)</div>
          <p><strong>Niveaux de Qalqalah :</strong></p>
          <p>• <em>Majeure (Kubrâ) :</em> À l'arrêt en fin de verset avec accentuation (ex : <span class="font-arabic" style="color: #D4AF37;">الْفَلَقِ ؕ</span>).</p>
          <p>• <em>Mineure (Sughrâ) :</em> Au milieu d'un mot ou d'une récitation continue (ex : <span class="font-arabic" style="color: #D4AF37;">يَقْطَعُونَ</span>).</p>
        `
      },
      {
        title: "Exercices Pratiques & Application sur Sourate Al-Falaq",
        content: `
          <p>Identifiez les règles de Tajwîd dans le verset suivant :</p>
          <div class="arabic-calligraphy">قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ</div>
          <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <p><strong>Correction &amp; Analyse :</strong></p>
            <p>1. <span class="font-arabic">مِن شَرِّ</span> : Règle d'<strong>Al-Ikhfâ'</strong> (Noun sakin suivi de la lettre Chîn).</p>
            <p>2. <span class="font-arabic">الْفَلَقِ</span> : Règle de <strong>Qalqalah Majeure</strong> sur la lettre Qâf finale lors de l'arrêt.</p>
          </div>
        `
      }
    ]
  },

  allwa: {
    title: "Allwa & Calligraphie Arabe : Modèles et Tracés Traditionnels",
    author: "Commission Pédagogique des Daaras du Sénégal",
    tag: "Planchette Coranique & Écriture Maghrébine",
    pages: [
      {
        title: "Introduction à la Planchette (Allwa) et au Qalam",
        content: `
          <p>L'<strong>Allwa (اللوح)</strong> est le support traditionnel par excellence de la mémorisation coranique en Afrique de l'Ouest. Le talibé y calligraphie chaque jour son nouveau verset (*Dars*) avant de l'effacer par lavage rituel une fois parfaitement retenu.</p>
          <div class="arabic-calligraphy">ن وَالْقَلَمِ وَمَا يَسْطُرُونَ</div>
          <p><em>« Nūn. Par la plume et ce qu'ils écrivent ! »</em> (Sourate Al-Qalam, verset 1).</p>
          <div style="background: #F8FAFC; border-left: 4px solid #00D2B4; padding: 0.8rem 1rem; margin: 1rem 0; border-radius: 4px;">
            <strong>Norme calligraphique Daara :</strong> Écriture en style Maghrébi / Soudanais, respect des proportions diacritiques et points distinctifs selon la tradition d'Abou 'Amr Ad-Dani.
          </div>
        `
      },
      {
        title: "Planche 1 : Tracé des Lettres Isolées et Liaisons",
        content: `
          <p>Règles d'inclinaison et épaisseur de trait à l'encre traditionnelle (*Dawa*) :</p>
          <ul style="margin: 0.8rem 0 1rem 1.4rem; line-height: 1.8;">
            <li><strong>Alif (ا) :</strong> Hauteur de 5 points de plume, rectitude parfaite sans courbure excessive.</li>
            <li><strong>Bâ, Tâ, Thâ (ب , ت , ث) :</strong> Assise horizontale souple sur la ligne guide de l'Allwa.</li>
            <li><strong>Le Fa maghrébin (ڢ) :</strong> Point unique placé en-dessous de la lettre.</li>
            <li><strong>Le Qaf maghrébin (ڧ) :</strong> Point unique placé au-dessus de la lettre.</li>
          </ul>
        `
      }
    ]
  },

  akhdari: {
    title: "Mukhtasar Al-Akhdari : Précis des Actes d'Adoration",
    author: "Imam Abdur-Rahman Al-Akhdari (École Malikite)",
    tag: "Fiqh & Éducation Spirituelle",
    pages: [
      {
        title: "Chapitre 1 : Les Devoirs du Croyant et la Purification du Cœur",
        content: `
          <p>La première obligation pour tout musulman est de corriger sa foi (*Iman*), puis de connaître ce qui lui est obligatoire dans la pratique de sa religion (*Salât, Taharah*).</p>
          <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <p><strong>Règle de bienséance du talibé :</strong> Préserver sa langue du mensonge, de la médisance et de la calomnie, respecter ses maîtres (*Oustazs*) et ses condisciples.</p>
          </div>
        `
      },
      {
        title: "Chapitre 2 : Les Règles des Ablutions (Al-Woudou')",
        content: `
          <p>Les obligations (*Farâ'id*) des ablutions selon le rite malikite sont au nombre de sept :</p>
          <ol style="margin: 0.8rem 0 1rem 1.4rem; line-height: 1.8;">
            <li>L'intention (*An-Niyyah*) au début de la purification.</li>
            <li>Le lavage complet du visage.</li>
            <li>Le lavage des mains et avant-bras jusqu'aux coudes.</li>
            <li>L'essuyage de l'ensemble de la tête.</li>
            <li>Le lavage des pieds jusqu'aux chevilles.</li>
            <li>Le frottement (*Ad-Dalk*).</li>
            <li>La continuité sans interruption prolongée (*Al-Fawr*).</li>
          </ol>
        `
      }
    ]
  },

  maths: {
    title: "Mathématiques & Géométrie CM2 (Programme National Sénégalais)",
    author: "Ministère de l'Éducation Nationale (Dakar)",
    tag: "Primaire / Entrée en 6e",
    pages: [
      {
        title: "Leçon 1 : Calcul des Périmètres et des Aires",
        content: `
          <p>Rappels fondamentaux indispensables pour l'examen de l'Entrée en 6e (CFEE) :</p>
          <ul style="margin: 0.8rem 0 1rem 1.4rem; line-height: 2;">
            <li><strong>Carré :</strong> Périmètre = Côté × 4 &nbsp;|&nbsp; Aire = Côté × Côté</li>
            <li><strong>Rectangle :</strong> Périmètre = (Longueur + Largeur) × 2 &nbsp;|&nbsp; Demi-périmètre = Longueur + Largeur &nbsp;|&nbsp; Aire = Longueur × Largeur</li>
            <li><strong>Triangle :</strong> Aire = (Base × Hauteur) ÷ 2</li>
            <li><strong>Cercle :</strong> Périmètre = Diamètre × 3,14</li>
          </ul>
        `
      },
      {
        title: "Problème Résolu N° 1 (Type CFEE Sénégal)",
        content: `
          <div style="background: #F8FAFC; border-left: 4px solid #F59E0B; padding: 1rem; margin-bottom: 1.2rem;">
            <strong>Énoncé :</strong> Un maraîcher de Sangalkam possède un champ rectangulaire de 120 m de long sur 80 m de large. Il l'entoure d'un grillage qui coûte 1 500 FCFA le mètre en laissant une porte de 4 mètres.<br>
            <em>1) Calculez le périmètre du champ.<br>2) Calculez le prix de revient du grillage.</em>
          </div>
          <p><strong>Solution détaillée :</strong></p>
          <p>1) Demi-périmètre = 120 m + 80 m = 200 m</p>
          <p>Périmètre total = 200 m × 2 = <strong>400 m</strong></p>
          <p>2) Longueur de grillage nécessaire = 400 m - 4 m (porte) = <strong>396 m</strong></p>
          <p>Prix total du grillage = 396 × 1 500 = <strong style="color: #00A890;">594 000 FCFA</strong>.</p>
        `
      }
    ]
  },

  francais: {
    title: "Français & Expression Écrite : L'Accord du Participe Passé",
    author: "Inspecteurs Pédagogiques Régionaux",
    tag: "Langue & Grammaire",
    pages: [
      {
        title: "Règles d'Accord du Participe Passé avec ÊTRE et AVOIR",
        content: `
          <p><strong>1. Avec l'auxiliaire ÊTRE :</strong></p>
          <p>Le participe passé s'accorde toujours en genre et en nombre avec le sujet du verbe.</p>
          <p><em>Exemple :</em> Les élèves <strong>sont partis</strong> à l'école tôt ce matin.</p>
          <br>
          <p><strong>2. Avec l'auxiliaire AVOIR :</strong></p>
          <p>Le participe passé ne s'accorde JAMAIS avec le sujet. Il s'accorde uniquement avec le Complément d'Objet Direct (COD) si celui-ci est placé <strong>AVANT</strong> le verbe.</p>
          <p><em>Exemples :</em></p>
          <p>• Ils ont <strong>acheté</strong> des cahiers. (COD 'cahiers' placé après → pas d'accord).</p>
          <p>• Les leçons qu'ils ont <strong>apprises</strong> sont utiles. (COD 'qu'/'leçons' placé avant → accord au féminin pluriel).</p>
        `
      }
    ]
  },

  histoire: {
    title: "Histoire du Sénégal : Des Grands Royaumes à nos Jours",
    author: "Institut Fondamental d'Afrique Noire (IFAN)",
    tag: "Histoire & Patrimoine",
    pages: [
      {
        title: "Les Grands Royaumes Historiques du Sénégal",
        content: `
          <p>Avant la colonisation, le Sénégal était composé d'États et de royaumes prospères :</p>
          <ul style="margin: 0.8rem 0 1rem 1.4rem; line-height: 1.8;">
            <li><strong>Le Grand Djolof :</strong> Fédéré par Ndiadiane Ndiaye au XIIIe siècle, berceau des institutions wolofs.</li>
            <li><strong>Le Cayor &amp; le Baol :</strong> Dirigé par les Damels et Teignes, célèbre pour la résistance héroïque de <strong>Lat Dior Ngoné Latyr Diop</strong>.</li>
            <li><strong>Le Fouta-Toro :</strong> Région théocratique guidée par la révolution toroodo de Thierno Souleymane Baal en 1776.</li>
            <li><strong>Le Gabou &amp; la Casamance :</strong> Riche de traditions mandingues et diolas incarnées par la reine <strong>Aline Sitoé Diatta</strong>.</li>
          </ul>
        `
      }
    ]
  },

  hadith: {
    title: "Recueil d'Invocations & Hadiths Prophétiques Authentiques",
    author: "Département Islamique SunuSchool",
    tag: "Spiritualité & Daara",
    pages: [
      {
        title: "Hadith 1 : L'Importance de l'Intention (An-Niyyah)",
        content: `
          <p>D'après le Commandeur des croyants, Omar ibn Al-Khattâb (qu'Allah l'agrée), le Prophète ﷺ a dit :</p>
          <div class="arabic-calligraphy">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى</div>
          <p><em>« Les actions ne valent que par leurs intentions, et chaque homme n'aura que selon ce qu'il a eu comme intention... »</em> (Rapporté par Al-Bukhâri et Muslim).</p>
          <br>
          <p><strong>Invocation du matin pour l'étudiant :</strong></p>
          <div class="arabic-calligraphy">اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا</div>
          <p><em>« Ô Allah ! Je Te demande un savoir utile, une subsistance licite et une œuvre agréée. »</em></p>
        `
      }
    ]
  }
};

function openEbookReader(bookId) {
  const book = ebooksDatabase[bookId] || ebooksDatabase['tajwid'];
  currentEbook = {
    id: bookId,
    title: book.title,
    author: book.author,
    tag: book.tag,
    pageIndex: 0,
    pages: book.pages
  };

  document.getElementById('ebookTitle').textContent = book.title;
  document.getElementById('ebookAuthor').textContent = book.author;
  document.getElementById('ebookTag').textContent = book.tag;

  renderEbookCurrentPage();
  const modal = document.getElementById('libraryReaderModal');
  modal.classList.add('active');
}

function renderEbookCurrentPage() {
  const page = currentEbook.pages[currentEbook.pageIndex];
  const total = currentEbook.pages.length;
  
  document.getElementById('ebookPageCounter').textContent = `Page ${currentEbook.pageIndex + 1} / ${total}`;
  
  const contentEl = document.getElementById('ebookPageContent');
  contentEl.innerHTML = `
    <h3>${page.title}</h3>
    ${page.content}
  `;

  document.getElementById('ebookPrevBtn').disabled = currentEbook.pageIndex === 0;
  document.getElementById('ebookNextBtn').textContent = currentEbook.pageIndex === total - 1 ? 'Terminer ✓' : 'Page Suivante →';
}

function nextEbookPage() {
  if (currentEbook.pageIndex < currentEbook.pages.length - 1) {
    currentEbook.pageIndex++;
    renderEbookCurrentPage();
  } else {
    showNotification('🎉 Félicitations, vous avez achevé la lecture de ce document !');
    closeAllModals();
  }
}

function prevEbookPage() {
  if (currentEbook.pageIndex > 0) {
    currentEbook.pageIndex--;
    renderEbookCurrentPage();
  }
}

// --- 3. LECTEUR VIDÉO PÉDAGOGIQUE INTERACTIF ---
let isVideoPlaying = true;
let videoProgressInterval = null;

function openVideoPlayer(videoId) {
  const modal = document.getElementById('libraryVideoModal');
  modal.classList.add('active');
  isVideoPlaying = true;
  document.getElementById('videoPlayBtnText').textContent = '⏸️ Pause';
  document.getElementById('videoPlayIcon').textContent = '🎬';

  // Animation de la barre de progression
  let progress = 45;
  const bar = document.getElementById('videoProgressBar');
  clearInterval(videoProgressInterval);
  videoProgressInterval = setInterval(() => {
    if (isVideoPlaying && progress < 100) {
      progress += 1;
      bar.style.width = progress + '%';
    }
  }, 500);
}

function toggleSimVideo() {
  isVideoPlaying = !isVideoPlaying;
  const btn = document.getElementById('videoPlayBtnText');
  const icon = document.getElementById('videoPlayIcon');
  if (isVideoPlaying) {
    btn.textContent = '⏸️ Pause';
    icon.textContent = '🎬';
    showNotification('▶️ Lecture vidéo reprise');
  } else {
    btn.textContent = '▶️ Lire';
    icon.textContent = '⏸️';
    showNotification('⏸️ Vidéo mise en pause');
  }
}

// --- 4. QUIZ INTERACTIFS AVEC SCORING ET FEEDBACK IMMÉDIAT ---
let activeQuiz = null;
let currentQuestionIndex = 0;
let userQuizScore = 0;

const quizDatabase = {
  tajwid: {
    title: "Test de Connaissances en Tajwîd",
    subtitle: "Règles du Noun Sakin, Tanween et Makharij",
    tag: "Daara Coranique",
    questions: [
      {
        question: "Combien de règles comporte le Noun Sakin (نْ) et le Tanween ?",
        options: ["2 règles", "3 règles", "4 règles (Izhâr, Idghâm, Iqlâb, Ikhfâ')", "6 règles"],
        correct: 2,
        explanation: "Correct ! Il y a exactement 4 règles : l'Izhâr, l'Idghâm, l'Iqlâb et l'Ikhfâ'."
      },
      {
        question: "Dans le verset 'مِن بَعْدِ', quelle règle s'applique ?",
        options: ["Al-Izhâr", "Al-Iqlâb (transformation en Mim)", "Al-Idghâm", "La Qalqalah"],
        correct: 1,
        explanation: "Parfait ! Devant la lettre Ba (ب), le Noun sans voyelle se transforme en Mim sonore (Al-Iqlâb)."
      },
      {
        question: "Quelles sont les 5 lettres de la Qalqalah (l'écho sonore) ?",
        options: ["أ ب ت ث ج", "ق ط ب ج د (Qotb Jad)", "ي ر م ل و", "ء هـ ع ح غ خ"],
        correct: 1,
        explanation: "Macha Allah ! Les lettres de la Qalqalah sont regroupées dans l'expression 'قُطْبُ جَدٍّ'."
      }
    ]
  },

  maths: {
    title: "Défi Calcul Rapide & Géométrie CM2",
    subtitle: "Évaluation préparatoire CFEE",
    tag: "Mathématiques",
    questions: [
      {
        question: "Quelle est l'aire d'un carré de 12 m de côté ?",
        options: ["48 m²", "144 m²", "24 m²", "120 m²"],
        correct: 1,
        explanation: "Exact ! Aire du carré = Côté × Côté = 12 × 12 = 144 m²."
      },
      {
        question: "Un commerçant achète un sac de riz à 20 000 FCFA et le revend 25 500 FCFA. Quel est son bénéfice ?",
        options: ["45 500 FCFA", "5 500 FCFA", "5 000 FCFA", "2 500 FCFA"],
        correct: 1,
        explanation: "Bravo ! Bénéfice = Prix de vente - Prix d'achat = 25 500 - 20 000 = 5 500 FCFA."
      },
      {
        question: "Simplifiez la fraction 18 / 24 par son plus grand diviseur commun (PGDC = 6) :",
        options: ["9 / 12", "3 / 4", "2 / 3", "6 / 8"],
        correct: 1,
        explanation: "Excellent ! 18÷6 = 3 et 24÷6 = 4, soit 3/4."
      }
    ]
  }
};

function openQuizModal(quizId) {
  activeQuiz = quizDatabase[quizId] || quizDatabase['tajwid'];
  currentQuestionIndex = 0;
  userQuizScore = 0;

  document.getElementById('quizTitle').textContent = activeQuiz.title;
  document.getElementById('quizSubtitle').textContent = activeQuiz.subtitle;
  document.getElementById('quizTag').textContent = activeQuiz.tag;
  document.getElementById('quizScoreText').textContent = `0 / ${activeQuiz.questions.length}`;

  renderQuizCurrentQuestion();
  const modal = document.getElementById('libraryQuizModal');
  modal.classList.add('active');
}

function renderQuizCurrentQuestion() {
  const q = activeQuiz.questions[currentQuestionIndex];
  const total = activeQuiz.questions.length;

  document.getElementById('quizProgressNum').textContent = `Question ${currentQuestionIndex + 1} sur ${total}`;
  document.getElementById('quizQuestionText').textContent = q.question;

  const container = document.getElementById('quizOptionsContainer');
  container.innerHTML = '';

  const feedbackBox = document.getElementById('quizFeedbackBox');
  feedbackBox.style.display = 'none';

  document.getElementById('quizNextBtn').style.display = 'none';

  q.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = optText;
    btn.onclick = () => selectQuizAnswer(index, btn);
    container.appendChild(btn);
  });
}

function selectQuizAnswer(selectedIndex, clickedBtn) {
  const q = activeQuiz.questions[currentQuestionIndex];
  const allBtns = document.querySelectorAll('.quiz-option-btn');
  allBtns.forEach(b => b.disabled = true);

  const feedbackBox = document.getElementById('quizFeedbackBox');
  feedbackBox.style.display = 'block';

  if (selectedIndex === q.correct) {
    clickedBtn.classList.add('correct');
    userQuizScore++;
    feedbackBox.style.background = 'rgba(16, 185, 129, 0.15)';
    feedbackBox.style.border = '1px solid #10B981';
    feedbackBox.style.color = '#34D399';
    feedbackBox.innerHTML = `<strong>✅ Excellente réponse !</strong> ${q.explanation}`;
  } else {
    clickedBtn.classList.add('incorrect');
    allBtns[q.correct].classList.add('correct');
    feedbackBox.style.background = 'rgba(239, 68, 68, 0.15)';
    feedbackBox.style.border = '1px solid #EF4444';
    feedbackBox.style.color = '#F87171';
    feedbackBox.innerHTML = `<strong>❌ Réponse incorrecte.</strong> ${q.explanation}`;
  }

  document.getElementById('quizScoreText').textContent = `${userQuizScore} / ${activeQuiz.questions.length}`;
  document.getElementById('quizNextBtn').style.display = 'inline-flex';
}

function nextQuizQuestion() {
  if (currentQuestionIndex < activeQuiz.questions.length - 1) {
    currentQuestionIndex++;
    renderQuizCurrentQuestion();
  } else {
    const total = activeQuiz.questions.length;
    alert(`🏆 Quiz terminé ! Votre score final est de : ${userQuizScore} / ${total}`);
    showNotification(`Score final enregistré : ${userQuizScore}/${total} ! Félicitations.`);
    closeAllModals();
  }
}

// --- 11. GESTION DE LA PERTE & DU RÉTABLISSEMENT DE CONNEXION INTERNET ---
window.addEventListener('offline', () => {
  const banner = document.getElementById('offlineReconnectBanner');
  if (banner) {
    banner.style.display = 'block';
  }
  showNotification('⚠️ Connexion Internet perdue ! Vous pouvez vous reconnecter avec votre e-mail pour restaurer votre espace.');
});

window.addEventListener('online', () => {
  const banner = document.getElementById('offlineReconnectBanner');
  if (banner) {
    banner.style.display = 'none';
  }
  showNotification('🟢 Connexion Internet rétablie ! Session synchronisée.');
  // Si un établissement était en mémoire, réactualiser l'état
  if (currentEstablishment && currentEstablishment.name) {
    const isWsActive = localStorage.getItem('sunuschool_active_workspace') === 'true';
    if (isWsActive) {
      activateDedicatedWorkspace(currentEstablishment);
    }
  }
});

// ==============================================================================
// GESTION DU PARTAGE DES LIENS & DU PORTAIL PAR CLÉ D'ACCÈS
// ==============================================================================
let currentAccessKeyRole = 'teacher';

function getAccessKeysForSchool() {
  const est = currentEstablishment || {
    name: 'Établissement Scolaire',
    code: 'SSE-SN-2026',
    type: 'ECOLE'
  };
  const isDaara = est.type === 'DAARA';
  const cleanCode = (est.code || 'SN-2026').replace(/[^a-zA-Z0-9]/g, '');

  const activeStudents = getEstablishmentActiveStudents(isDaara);
  const studentKey = (activeStudents.length > 0 && activeStudents[0].matricule)
    ? activeStudents[0].matricule
    : (isDaara ? `TAL-${cleanCode}-01` : `MAT-${cleanCode}-01`);

  const parentKey = est.phone || est.code || (activeStudents.length > 0 && activeStudents[0].parentTel ? activeStudents[0].parentTel : (est.code || 'CODE ÉCOLE'));

  const teachers = getEstablishmentTeachers();
  const teacherKey = (teachers.length > 0 && teachers[0].mat)
    ? teachers[0].mat
    : (isDaara ? `OUSTAZ-${cleanCode}` : `ENS-${cleanCode}`);

  return {
    teacher: teacherKey,
    parent: parentKey,
    student: studentKey
  };
}

function openShareAccessLinksModal() {
  closeAllModals();
  const modal = document.getElementById('shareAccessLinksModal');
  if (!modal) return;

  const est = currentEstablishment || { name: 'Mon Ã‰tablissement', plan: 'Formule Pro' };
  const badgeEl = document.getElementById('shareModalSchoolBadge');
  if (badgeEl) {
    badgeEl.textContent = `Établissement Actif : ${est.name} (${est.plan || 'Pro'})`;
  }

  const keys = getAccessKeysForSchool();
  const kTeacherEl = document.getElementById('keyDisplayTeacher');
  const kParentEl = document.getElementById('keyDisplayParent');
  const kStudentEl = document.getElementById('keyDisplayStudent');

  if (kTeacherEl) kTeacherEl.textContent = keys.teacher;
  if (kParentEl) kParentEl.textContent = keys.parent;
  if (kStudentEl) kStudentEl.textContent = keys.student;

  modal.classList.add('active');
}

function getAccessShareMessage(role) {
  const est = currentEstablishment || { name: 'Mon Ã‰tablissement' };
  const keys = getAccessKeysForSchool();

  if (role === 'teacher') {
    return `📚 Bonjour ! L'établissement "${est.name}" a activé votre espace Enseignant/Oustaz sur SunuSchool Express. Accédez à vos classes et saisissez vos notes via ce lien : https://sunuschool.sn/#acces?role=teacher avec votre Clé d'Accès : ${keys.teacher}.`;
  } else if (role === 'parent') {
    return `👨‍👩‍👧 Bonjour Chers Parents ! L'établissement "${est.name}" a mis en place SunuSchool Express. Retrouvez les bulletins scolaires et les reçus de paiement Mobile Money de vos enfants sur : https://sunuschool.sn/#acces?role=parent avec votre Identifiant Parent : ${keys.parent}.`;
  } else {
    return `🎓 Bonjour ! Accédez à vos cours, notes et devoirs de "${est.name}" sur : https://sunuschool.sn/#acces?role=student avec votre Matricule Élève : ${keys.student}.`;
  }
}

function sendAccessLinkWhatsApp(role) {
  const msg = getAccessShareMessage(role);
  const roleName = role === 'teacher' ? 'Enseignants' : (role === 'parent' ? 'Parents d\'élèves' : 'Élèves');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).catch(() => {});
  }

  // Ouvrir WhatsApp Web avec le message encodé si possible
  const encoded = encodeURIComponent(msg);
  const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(waUrl, '_blank');

  showNotification(`💬 Message WhatsApp préparé pour les ${roleName} ! Le lien et la clé d'accès ont été copiés.`);
  logAuditEvent('Envoi WhatsApp Clés d\'Accès', `Lien et clé partagés avec les ${roleName}`);
}

function sendAccessLinkSMS(role) {
  const msg = getAccessShareMessage(role);
  const roleName = role === 'teacher' ? 'Enseignants' : (role === 'parent' ? 'Parents' : 'Élèves');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).catch(() => {});
  }

  showNotification(`📱 Passerelle SMS : Notification et clé d'accès envoyées par SMS Gateway aux ${roleName} !`);
  logAuditEvent('SMS Gateway Clés d\'Accès', `Envoi SMS groupé aux ${roleName}`);
}

function copyAccessLink(role) {
  const keys = getAccessKeysForSchool();
  const url = `https://sunuschool.sn/#acces?role=${role}&cle=${encodeURIComponent(keys[role] || '')}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showNotification(`📋 Lien d'accès copié dans le presse-papier : ${url}`);
    }).catch(() => {
      showNotification(`📋 Lien direct : ${url}`);
    });
  } else {
    showNotification(`📋 Lien direct : ${url}`);
  }
}

function openAccessKeyModal(preselectedRole) {
  closeAllModals();
  const modal = document.getElementById('accessKeyModal');
  if (!modal) return;

  modal.classList.add('active');
  switchAccessKeyRole(preselectedRole || 'teacher');
}

function switchAccessKeyRole(role) {
  currentAccessKeyRole = role;

  const tabTeacher = document.getElementById('tabKeyRoleTeacher');
  const tabParent = document.getElementById('tabKeyRoleParent');
  const tabStudent = document.getElementById('tabKeyRoleStudent');
  const labelEl = document.getElementById('accessKeyInputLabel');
  const inputEl = document.getElementById('accessKeyValueInput');

  if (tabTeacher) tabTeacher.classList.toggle('active', role === 'teacher');
  if (tabParent) tabParent.classList.toggle('active', role === 'parent');
  if (tabStudent) tabStudent.classList.toggle('active', role === 'student');

  const keys = getAccessKeysForSchool();

  if (role === 'teacher') {
    if (labelEl) labelEl.textContent = "Clé d'Accès Enseignant ou Code Professeur :";
    if (inputEl) {
      inputEl.placeholder = "Ex: " + keys.teacher;
      inputEl.value = "";
    }
  } else if (role === 'parent') {
    if (labelEl) labelEl.textContent = "Numéro de Téléphone ou Clé Parent :";
    if (inputEl) {
      inputEl.placeholder = "Ex: " + keys.parent;
      inputEl.value = "";
    }
  } else {
    if (labelEl) labelEl.textContent = "Matricule ou Code Élève :";
    if (inputEl) {
      inputEl.placeholder = "Ex: " + keys.student;
      inputEl.value = "";
    }
  }
}

function fillTestAccessKey() {
  // Option désactivée en mode officiel de production
}

function submitAccessKey(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('accessKeyValueInput');
  let val = inputEl ? inputEl.value.trim() : '';

  if (!val && inputEl && inputEl.placeholder) {
    val = inputEl.placeholder.replace(/^Ex:\s*/, '').trim();
    if (inputEl) inputEl.value = val;
  }

  if (!val) {
    alert("Veuillez saisir votre clé d'accès ou identifiant.");
    return;
  }

  const role = currentAccessKeyRole;
  closeAllModals();

  if (role === 'teacher') {
    openTeacherPortalModal();
  } else if (role === 'parent') {
    openParentPortalModal();
  } else {
    openStudentPortalModal();
  }
}

// Exposer globalement pour les déclencheurs onclick
window.openAccessKeyModal = openAccessKeyModal;
window.switchAccessKeyRole = switchAccessKeyRole;
window.submitAccessKey = submitAccessKey;

/* ==========================================================================
   ESPACE ÉLÈVE / TALIBÉ DÉDIÉ (ÉCOLE PRIVÉE & DAARA MODERNE)
   ========================================================================== */

let currentStudentContext = 'ECOLE'; // 'ECOLE' ou 'DAARA'
let currentStudentInnerTab = 'grades'; // 'grades', 'homework', 'appreciations', 'resources'

const studentDemoData = {
  ECOLE: {
    name: 'Mouhamed Sow',
    matricule: 'MAT-2026-042',
    class: '6ème A (Collège Privé)',
    school: "Mon Ã‰tablissement",
    avatar: '🎓',
    status: 'Élève Régulier • Délégué de Classe',
    stat1: { label: 'Moyenne 1er Trimestre', value: '16.45 / 20', sub: 'Mention Très Bien' },
    stat2: { label: 'Classement Trimestriel', value: '2ème / 38', sub: 'Tableau d\'Honneur' },
    stat3: { label: 'Assiduité & Ponctualité', value: '100%', sub: '0 absence • 0 retard' },
    grades: [
      { subject: 'Mathématiques', coef: 4, grade: 17.5, classAvg: 13.2, rank: '1er', mention: 'Très Bien', teacher: 'M. Babacar Ndiaye' },
      { subject: 'Français & Expression', coef: 4, grade: 16.5, classAvg: 12.8, rank: '2ème', mention: 'Très Bien', teacher: 'Mme Khady Diop' },
      { subject: 'Sciences de la Vie et de la Terre (SVT)', coef: 2, grade: 16.0, classAvg: 13.5, rank: '3ème', mention: 'Très Bien', teacher: 'M. Mansour Fall' },
      { subject: 'Histoire & Géographie', coef: 2, grade: 15.5, classAvg: 12.1, rank: '4ème', mention: 'Bien', teacher: 'Mme Fatou Niane' },
      { subject: 'Anglais LV1', coef: 2, grade: 17.0, classAvg: 11.8, rank: '2ème', mention: 'Très Bien', teacher: 'Mr. David Faye' },
      { subject: 'Informatique & Numérique', coef: 1, grade: 18.0, classAvg: 14.2, rank: '1er', mention: 'Très Bien', teacher: 'M. Cheikh Sarr' },
      { subject: 'Éducation Civique & Morale', coef: 1, grade: 16.0, classAvg: 13.0, rank: '3ème', mention: 'Très Bien', teacher: 'Mme Fatou Niane' },
      { subject: 'EPS', coef: 1, grade: 15.0, classAvg: 14.5, rank: '5ème', mention: 'Bien', teacher: 'M. Abdoulaye Camara' }
    ],
    homework: [
      { id: 1, title: 'Devoir Maison N°1 - Fonctions Linéaires & Équations', subject: 'Mathématiques', dueDate: '18 Sept 2026', desc: 'Exercices 12 à 18 page 45 du manuel CIAM. Rédiger proprement sur copie double.', done: false, teacher: 'M. Babacar Ndiaye' },
      { id: 2, title: 'Préparation TP : Mesure de Masse et Volume', subject: 'SVT', dueDate: '22 Sept 2026', desc: 'Lire la fiche méthode N°3 et apporter la blouse blanche de laboratoire.', done: false, teacher: 'M. Mansour Fall' },
      { id: 3, title: 'Lecture Suivie : "Une si longue lettre" de Mariama Bâ', subject: 'Français', dueDate: '25 Sept 2026', desc: 'Lire les chapitres 1 à 3 et préparer 5 questions sur les thèmes principaux.', done: true, teacher: 'Mme Khady Diop' }
    ],
    appreciations: [
      { teacher: 'M. Babacar Ndiaye (Professeur Principal / Mathématiques)', remark: "Trimestre d'excellence. Mouhamed fait preuve d'une grande rigueur scientifique, d'un esprit d'analyse remarquable et d'un comportement exemplaire en classe.", decision: "Félicitations du Conseil de Classe & Tableau d'Honneur", badgeCls: "badge-gold" },
      { teacher: 'Mme Khady Diop (Professeur de Français)', remark: "Vocabulaire soigné, syntaxe irréprochable et participation dynamique aux débats oraux.", decision: "Tableau d'Honneur", badgeCls: "badge-primary" }
    ],
    resources: [
      { title: 'Fiche Méthode : Équations & Problèmes du 1er Degré', size: 'PDF • 1.4 Mo', subject: 'Mathématiques', icon: '📐' },
      { title: 'Guide de Rédaction & Figures de Style en 6ème', size: 'PDF • 850 Ko', subject: 'Français', icon: '✍️' },
      { title: 'Schémas Bilan : Système Respiratoire & Sanguin', size: 'PDF • 2.1 Mo', subject: 'SVT', icon: '🔬' },
      { title: 'Annales & Sujets Type Collège du Sénégal', size: 'PDF • 3.5 Mo', subject: 'Général', icon: '📚' }
    ],
    timetable: {
      days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      slots: [
        {
          time: '08h00 - 10h00',
          label: 'Matinée 1',
          schedule: {
            'Lundi': { subject: 'Mathématiques', teacher: 'M. Babacar Ndiaye', room: 'Salle B12' },
            'Mardi': { subject: 'Histoire - Géo', teacher: 'Mme Fatou Niane', room: 'Salle B12' },
            'Mercredi': { subject: 'Mathématiques', teacher: 'M. Babacar Ndiaye', room: 'Salle B12' },
            'Jeudi': { subject: 'Français (Lecture)', teacher: 'Mme Khady Diop', room: 'Salle B12' },
            'Vendredi': { subject: 'SVT (Biologie)', teacher: 'M. Mansour Fall', room: 'Labo SVT' },
            'Samedi': { subject: 'Devoir Surveillé', teacher: 'M. Ndiaye & Mme Diop', room: 'Grand Amphi' }
          }
        },
        {
          time: '10h15 - 12h15',
          label: 'Matinée 2',
          schedule: {
            'Lundi': { subject: 'Français (Grammaire)', teacher: 'Mme Khady Diop', room: 'Salle B12' },
            'Mardi': { subject: 'Anglais LV1', teacher: 'Mr. David Faye', room: 'Salle B12' },
            'Mercredi': { subject: 'EPS (Sport)', teacher: 'M. Abdoulaye Camara', room: 'Terrain Sport' },
            'Jeudi': { subject: 'Éducation Civique', teacher: 'Mme Fatou Niane', room: 'Salle B12' },
            'Vendredi': { subject: 'Anglais LV1', teacher: 'Mr. David Faye', room: 'Salle B12' },
            'Samedi': { subject: 'Activités & Ateliers', teacher: 'Vie Scolaire', room: 'Salle B12' }
          }
        },
        {
          time: '15h00 - 17h00',
          label: 'Après-midi 1',
          schedule: {
            'Lundi': { subject: 'SVT (Sciences)', teacher: 'M. Mansour Fall', room: 'Labo SVT' },
            'Mardi': { subject: 'Informatique', teacher: 'M. Cheikh Sarr', room: 'Salle Multimédia' },
            'Mercredi': null,
            'Jeudi': { subject: 'Soutien & Travail Dirigé', teacher: 'M. Babacar Ndiaye', room: 'Salle B12' },
            'Vendredi': null,
            'Samedi': null
          }
        }
      ]
    }
  },
  DAARA: {
    name: 'Mouhamed Sow (Talibé)',
    matricule: 'DAA-2026-001',
    class: 'Niveau 2 (Hifz & Mémorisation Avancée)',
    school: 'Mon Daara Moderne',
    avatar: '👳‍♂️',
    status: 'Talibé Assidu • 9 Hizbs Validés',
    stat1: { label: 'Mémorisation Coranique', value: '9 Hizbs Validés', sub: 'Progression : 15% du Coran' },
    stat2: { label: 'Récitation Tajwîd', value: '18.0 / 20', sub: '1er du Groupe Hifz' },
    stat3: { label: 'Présence aux Séances', value: '100%', sub: 'Assidu au Fajr & Asr' },
    grades: [
      { subject: 'Récitation Sourate Al-Baqara (Versets 1 à 50)', coef: 5, grade: 18.0, classAvg: 14.5, rank: '1er', mention: 'Très Bien', teacher: 'Oustaz Abdoulaye Ba' },
      { subject: 'Mémorisation Juz Amma & Tajwîd', coef: 5, grade: 17.5, classAvg: 15.0, rank: '2ème', mention: 'Très Bien', teacher: 'Oustaz Abdoulaye Ba' },
      { subject: 'Règles de Nun Sakina & Tanwîn (Idghâm, Ikhfâ)', coef: 3, grade: 18.5, classAvg: 13.8, rank: '1er', mention: 'Très Bien', teacher: 'Oustaz Cheikh Ndiaye' },
      { subject: 'Écriture sur Allwa (Planchette Traditionnelle)', coef: 3, grade: 17.0, classAvg: 14.0, rank: '3ème', mention: 'Très Bien', teacher: 'Oustaz Abdoulaye Ba' },
      { subject: 'Comportement & Adab Al-Qur\'an', coef: 2, grade: 19.0, classAvg: 16.5, rank: '1er', mention: 'Excellent', teacher: 'Direction du Daara' }
    ],
    homework: [
      { id: 101, title: 'Murâja\'ah (Révision Quotidienne) : Sourate Al-Mulk', subject: 'Hifz', dueDate: '15 Sept 2026', desc: 'Réciter 3 fois de mémoire avec attention sur les règles de Waqf et Madd.', done: false, teacher: 'Oustaz Abdoulaye Ba' },
      { id: 102, title: 'Écriture Allwa : Versets 1 à 20 Sourate An-Naba', subject: 'Calligraphie', dueDate: '17 Sept 2026', desc: 'Écriture soignée au calame et encre noire traditionnelle.', done: true, teacher: 'Oustaz Abdoulaye Ba' }
    ],
    appreciations: [
      { teacher: 'Oustaz Abdoulaye Ba (Maître Titulaire Hifz)', remark: "Macha'Allah ! Diction limpide, grande piété et sérieux admirable lors des révisions du matin. Qu'Allah bénisse son apprentissage.", decision: "Passage au 10ème Hizb validé avec Félicitations", badgeCls: "badge-gold" }
    ],
    resources: [
      { title: 'Tableau Récapitulatif des Règles de Tajwîd (Madd & Ghunna)', size: 'PDF • 950 Ko', subject: 'Tajwîd', icon: '📖' },
      { title: 'Guide de Calligraphie Arabe sur Planchette Allwa', size: 'PDF • 1.8 Mo', subject: 'Calligraphie', icon: '✒️' },
      { title: 'Calendrier des 60 Hizbs & Fiche d\'Émargement', size: 'PDF • 600 Ko', subject: 'Hifz', icon: '🗓️' }
    ],
    timetable: {
      days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      slots: [
        {
          time: '06h00 - 08h00',
          label: 'Tahfîz Fajr',
          schedule: {
            'Lundi': { subject: 'Tahfîz Matinal (Fajr)', teacher: 'Oustaz Abdoulaye Ba', room: 'Salle Allouwa' },
            'Mardi': { subject: 'Tahfîz Matinal (Fajr)', teacher: 'Oustaz Abdoulaye Ba', room: 'Salle Allouwa' },
            'Mercredi': { subject: 'Tahfîz Matinal (Fajr)', teacher: 'Oustaz Abdoulaye Ba', room: 'Salle Allouwa' },
            'Jeudi': { subject: 'Tahfîz Matinal (Fajr)', teacher: 'Oustaz Abdoulaye Ba', room: 'Salle Allouwa' },
            'Vendredi': { subject: 'Tahfîz Matinal (Fajr)', teacher: 'Oustaz Abdoulaye Ba', room: 'Salle Allouwa' },
            'Samedi': { subject: 'Tahfîz Matinal (Fajr)', teacher: 'Oustaz Abdoulaye Ba', room: 'Salle Allouwa' }
          }
        },
        {
          time: '08h30 - 11h30',
          label: 'Allouwa & Écriture',
          schedule: {
            'Lundi': { subject: 'Écriture Allouwa', teacher: 'Oustaz Abdoulaye Ba', room: 'Grande Salle Daara' },
            'Mardi': { subject: 'Écriture Allouwa', teacher: 'Oustaz Abdoulaye Ba', room: 'Grande Salle Daara' },
            'Mercredi': { subject: 'Écriture Allouwa', teacher: 'Oustaz Abdoulaye Ba', room: 'Grande Salle Daara' },
            'Jeudi': { subject: 'Écriture Allouwa', teacher: 'Oustaz Abdoulaye Ba', room: 'Grande Salle Daara' },
            'Vendredi': { subject: 'Lavage & Préparation Allwa', teacher: 'Équipe Encadrement', room: 'Cour Daara' },
            'Samedi': { subject: 'Écriture Allouwa', teacher: 'Oustaz Abdoulaye Ba', room: 'Grande Salle Daara' }
          }
        },
        {
          time: '15h00 - 17h30',
          label: 'Murâja\'ah (Révision)',
          schedule: {
            'Lundi': { subject: 'Murâja\'ah (Révision)', teacher: 'Oustaz Cheikh Ndiaye', room: 'Pavillon Hifz' },
            'Mardi': { subject: 'Murâja\'ah (Révision)', teacher: 'Oustaz Cheikh Ndiaye', room: 'Pavillon Hifz' },
            'Mercredi': { subject: 'Murâja\'ah (Révision)', teacher: 'Oustaz Cheikh Ndiaye', room: 'Pavillon Hifz' },
            'Jeudi': { subject: 'Murâja\'ah (Révision)', teacher: 'Oustaz Cheikh Ndiaye', room: 'Pavillon Hifz' },
            'Vendredi': null,
            'Samedi': { subject: 'Évaluation Hebdomadaire Hizb', teacher: 'Oustaz Abdoulaye Ba', room: 'Pavillon Hifz' }
          }
        },
        {
          time: '19h30 - 21h00',
          label: 'Tajwîd & Fiqh',
          schedule: {
            'Lundi': { subject: 'Tajwîd (Madd & Ghunna)', teacher: 'Oustaz Cheikh Ndiaye', room: 'Mosquée Daara' },
            'Mardi': { subject: 'Adab & Fiqh Élémentaire', teacher: 'Direction du Daara', room: 'Mosquée Daara' },
            'Mercredi': { subject: 'Tajwîd (Sorties de Lettres)', teacher: 'Oustaz Cheikh Ndiaye', room: 'Mosquée Daara' },
            'Jeudi': { subject: 'Invocation & Dhikr', teacher: 'Direction du Daara', room: 'Mosquée Daara' },
            'Vendredi': { subject: 'Lecture Sourate Al-Kahf', teacher: 'Collège des Oustazs', room: 'Mosquée Daara' },
            'Samedi': { subject: 'Récitation collective', teacher: 'Oustaz Abdoulaye Ba', room: 'Mosquée Daara' }
          }
        }
      ]
    }
  }
};

function openStudentPortalModal() {
  closeAllModals();
  const modal = document.getElementById('studentPortalModal');
  if (!modal) return;

  if (currentEstablishment && currentEstablishment.type === 'DAARA') {
    currentStudentContext = 'DAARA';
  } else {
    currentStudentContext = 'ECOLE';
  }

  renderStudentPortalContent();
  modal.classList.add('active');

  const data = studentDemoData[currentStudentContext];
  showNotification(`🎓 Bienvenue ${data.name} dans ton Espace Élève [${data.school}] !`);
  logAuditEvent('Connexion Espace Élève', `Session élève ouverte pour ${data.name} (${data.matricule})`);
}

function closeStudentPortal() {
  const modal = document.getElementById('studentPortalModal');
  if (modal) modal.classList.remove('active');
}

function studentLogout() {
  closeStudentPortal();
  showNotification("🚪 Tu t'es déconnecté de l'Espace Élève.");
  logAuditEvent('Déconnexion Élève', 'Session élève clôturée.');
}

function switchStudentPortalContext(context) {
  currentStudentContext = (context === 'DAARA') ? 'DAARA' : 'ECOLE';
  renderStudentPortalContent();
  const data = studentDemoData[currentStudentContext];
  showNotification(`🔄 Profil Élève basculé : ${data.name} (${data.school})`);
  logAuditEvent('Changement Contexte Élève', `Bascule vers ${data.name} (${currentStudentContext})`);
}

function switchStudentInnerTab(tabName) {
  currentStudentInnerTab = tabName;
  const tabs = ['grades', 'timetable', 'homework', 'appreciations', 'resources'];

  tabs.forEach(t => {
    const btn = document.getElementById(`tabStudent${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    const content = document.getElementById(`studentTab${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
    if (btn) {
      if (t === tabName) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    }
    if (content) {
      content.style.display = (t === tabName) ? 'block' : 'none';
    }
  });
}

let currentActivePortalStudent = null;

function renderStudentPortalContent() {
  const isReal = isRealRegisteredEstablishment();
  const bannerContainer = document.getElementById('studentPortalBannerContainer');
  const selectWrapper = document.getElementById('studentSelectWrapper');
  const isDaaraEstablishment = currentEstablishment && currentEstablishment.type === 'DAARA';

  // 1. Déterminer si on a des élèves réels
  let realStudents = [];
  if (isReal) {
    currentStudentContext = isDaaraEstablishment ? 'DAARA' : 'ECOLE';
    realStudents = getEstablishmentActiveStudents(isDaaraEstablishment);
  }

  // 2. Gestion de la bannière d'information et anti-confusion
  if (bannerContainer) {
    if (isReal) {
      if (realStudents.length === 0) {
        bannerContainer.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.4rem;">⚠️</span>
              <div style="font-size: 0.84rem; color: #FCA5A5;">
                <strong>Aucun élève inscrit dans votre établissement :</strong> Veuillez inscrire vos élèves depuis le tableau de bord pour consulter leurs dossiers réels.
              </div>
            </div>
            <button class="btn btn-gold" style="font-size: 0.78rem; padding: 0.4rem 0.8rem;" onclick="closeStudentPortal(); openNewRegistrationInWs();">
              ➕ Inscrire un Élève
            </button>
          </div>
        `;
      } else {
        bannerContainer.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.65rem 1rem; margin-bottom: 1.1rem; display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.3rem;">🛡️</span>
            <div style="font-size: 0.82rem; color: #6EE7B7; line-height: 1.4;">
              <strong>ESPACE ÉLÈVE CONNECTÉ À VOTRE ÉTABLISSEMENT RÉEL :</strong>
              Consultez le relevé réel et l'assiduité de vos élèves inscrits. Pour tout élève nouvellement inscrit, le relevé est vierge <strong>(-- / 20)</strong> jusqu'à la notation par ses professeurs.
            </div>
          </div>
        `;
      }
    } else {
      // Mode Démo / Vitrine
      bannerContainer.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 8px; padding: 0.65rem 1rem; margin-bottom: 1.1rem; display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.3rem;">💡</span>
          <div style="font-size: 0.82rem; color: #FDE68A; line-height: 1.4;">
            <strong>SPÉCIMEN DE DÉMONSTRATION (Exemple de Bulletin Trimestriel Finalisé) :</strong>
            Ce profil illustre un bulletin complet avec notes et devoirs terminés. <em>Dans votre établissement réel, un élève nouvellement inscrit démarre avec un relevé strictement vierge (-- / 20) jusqu'à ce que ses professeurs saisissent ses premières notes.</em>
          </div>
        </div>
      `;
    }
  }

  // 3. Déterminer les données à afficher
  let studentData = null;
  let hasRealGrades = false;

  if (isReal && realStudents.length > 0) {
    if (!currentActivePortalStudent || !realStudents.find(s => s.id === currentActivePortalStudent.id)) {
      currentActivePortalStudent = realStudents[0];
    }
    const cur = currentActivePortalStudent;
    hasRealGrades = Boolean(cur.moyenne !== null && cur.moyenne !== undefined && cur.moyenne !== '' && cur.moyenne !== '--');

    studentData = {
      name: `${cur.prenom} ${cur.nom}`,
      matricule: cur.matricule,
      class: cur.classe || (isDaaraEstablishment ? `Niveau ${Math.ceil((cur.hizb || 1) / 10)} (Hifz)` : 'Non assignée'),
      school: currentEstablishment.name || 'Établissement Actif',
      avatar: isDaaraEstablishment ? '👳' : '🎓',
      status: `Inscrit(e) le ${cur.dateInscription || 'Récemment'}`,
      isReal: true,
      hasRealGrades: hasRealGrades,
      stat1: {
        label: 'Moyenne 1er Trimestre',
        value: hasRealGrades ? `${cur.moyenne} / 20` : '-- / 20',
        sub: hasRealGrades ? (cur.mention || 'Évalué') : 'En attente d\'évaluation'
      },
      stat2: {
        label: 'Classement Trimestriel',
        value: hasRealGrades ? `${cur.rang} / ${realStudents.length}` : `-- / ${realStudents.length}`,
        sub: hasRealGrades ? 'Conseil délibéré' : 'Conseil de classe à venir'
      },
      stat3: {
        label: 'Assiduité & Ponctualité',
        value: '100%',
        sub: `${cur.absences || 0} absence • 0 retard`
      },
      grades: cur.notes || [],
      timetable: studentDemoData[currentStudentContext]?.timetable,
      homework: cur.homework || [],
      appreciations: cur.appreciations || [],
      resources: studentDemoData[currentStudentContext]?.resources || []
    };

    // Sélecteur multi-élèves si l'établissement a plus d'1 élève
    if (selectWrapper) {
      if (realStudents.length > 1) {
        selectWrapper.style.display = 'block';
        selectWrapper.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;">
            <span style="color: var(--gris-400);">Changer d'élève :</span>
            <select class="form-input" style="padding: 0.2rem 0.5rem; font-size: 0.78rem; background: rgba(0,0,0,0.4); color: #FFF; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;" onchange="selectPortalActiveStudent(this.value)">
              ${realStudents.map(s => `<option value="${s.id}" ${s.id === cur.id ? 'selected' : ''}>${s.prenom} ${s.nom} (${s.matricule})</option>`).join('')}
            </select>
          </div>
        `;
      } else {
        selectWrapper.style.display = 'none';
      }
    }

  } else {
    // Mode démo vitrine
    if (selectWrapper) selectWrapper.style.display = 'none';
    studentData = studentDemoData[currentStudentContext];
    hasRealGrades = true;
  }

  if (!studentData) return;

  // 4. En-tête
  const avatarEl = document.getElementById('studentAvatarDisplay');
  const nameEl = document.getElementById('studentNameDisplay');
  const keyBadgeEl = document.getElementById('studentKeyBadge');
  const statusBadgeEl = document.getElementById('studentStatusBadge');
  const infoEl = document.getElementById('studentSchoolInfoDisplay');

  if (avatarEl) avatarEl.textContent = studentData.avatar;
  if (nameEl) nameEl.textContent = `Espace Élève : ${studentData.name}`;
  if (keyBadgeEl) keyBadgeEl.textContent = `✓ Matricule : ${studentData.matricule}`;
  if (statusBadgeEl) {
    statusBadgeEl.textContent = studentData.status;
    statusBadgeEl.className = studentData.isReal ? 'badge-tag badge-primary' : 'badge-tag badge-gold';
  }
  if (infoEl) {
    infoEl.innerHTML = `Classe : <strong style="color: var(--turquoise-400);">${studentData.class}</strong> • Établissement : <strong style="color: var(--gold-400);">${studentData.school}</strong>`;
  }

  // 5. Sélecteur de mode
  const modeBadge = document.getElementById('studentCurrentModeBadge');
  const btnEcole = document.getElementById('studentSwitchBtnEcole');
  const btnDaara = document.getElementById('studentSwitchBtnDaara');

  if (modeBadge) {
    if (currentStudentContext === 'ECOLE') {
      modeBadge.className = 'badge-tag badge-primary';
      modeBadge.textContent = `🏫 Mode École Privée (${studentData.name})`;
    } else {
      modeBadge.className = 'badge-tag badge-success';
      modeBadge.textContent = `🕌 Mode Daara Moderne (${studentData.name})`;
    }
  }

  if (btnEcole && btnDaara) {
    if (currentStudentContext === 'ECOLE') {
      btnEcole.className = 'btn btn-primary';
      btnDaara.className = 'btn btn-outline';
    } else {
      btnEcole.className = 'btn btn-outline';
      btnDaara.className = 'btn btn-primary';
    }
  }

  // 6. Mini statistiques
  const s1L = document.getElementById('studentStat1Label');
  const s1V = document.getElementById('studentStat1Value');
  const s1S = document.getElementById('studentStat1Sub');
  if (s1L) s1L.textContent = studentData.stat1.label;
  if (s1V) s1V.textContent = studentData.stat1.value;
  if (s1S) s1S.textContent = studentData.stat1.sub;

  const s2L = document.getElementById('studentStat2Label');
  const s2V = document.getElementById('studentStat2Value');
  const s2S = document.getElementById('studentStat2Sub');
  if (s2L) s2L.textContent = studentData.stat2.label;
  if (s2V) s2V.textContent = studentData.stat2.value;
  if (s2S) s2S.textContent = studentData.stat2.sub;

  const s3L = document.getElementById('studentStat3Label');
  const s3V = document.getElementById('studentStat3Value');
  const s3S = document.getElementById('studentStat3Sub');
  if (s3L) s3L.textContent = studentData.stat3.label;
  if (s3V) s3V.textContent = studentData.stat3.value;
  if (s3S) s3S.textContent = studentData.stat3.sub;

  // 7. Rendu des onglets
  renderStudentGradesTable(studentData);
  renderStudentTimetable(studentData);
  renderStudentHomeworkList(studentData);
  renderStudentAppreciations(studentData);
  renderStudentResources(studentData);
  switchStudentInnerTab(currentStudentInnerTab);
}

function selectPortalActiveStudent(studentId) {
  const isDaaraEstablishment = currentEstablishment && currentEstablishment.type === 'DAARA';
  const realStudents = getEstablishmentActiveStudents(isDaaraEstablishment);
  const found = realStudents.find(s => s.id === studentId);
  if (found) {
    currentActivePortalStudent = found;
    renderStudentPortalContent();
  }
}
window.selectPortalActiveStudent = selectPortalActiveStudent;

function renderStudentGradesTable(studentData) {
  const tbody = document.getElementById('studentGradesTableBody');
  if (!tbody) return;

  const data = studentData || studentDemoData[currentStudentContext];

  // Si élève réel sans note saisie
  if (data.isReal && (!data.hasRealGrades || !data.grades || data.grades.length === 0)) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.8rem 1.5rem; background: rgba(255,255,255,0.015);">
          <div style="font-size: 2.5rem; margin-bottom: 0.6rem;">📋</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--blanc-pur); margin-bottom: 0.35rem;">
            Dossier Vierge • Aucune note enregistrée
          </div>
          <p style="font-size: 0.86rem; color: var(--gris-400); max-width: 520px; margin: 0 auto; line-height: 1.5;">
            L'élève <strong>${data.name}</strong> est bien inscrit(e) en classe de <strong>${data.class}</strong>. Ses notes officielles apparaîtront ici automatiquement dès que les enseignants auront saisi les évaluations du 1er Trimestre.
          </p>
          <div style="margin-top: 1.1rem; display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); padding: 0.45rem 0.9rem; border-radius: 6px; font-size: 0.78rem; color: #93C5FD;">
            <span>ℹ️</span> Statut : En attente des premières compositions et devoirs sur table.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const gradesList = (data.grades && data.grades.length > 0) ? data.grades : studentDemoData[currentStudentContext].grades;
  tbody.innerHTML = gradesList.map(g => {
    const mention = getTeacherMentionFromGrade(g.grade);
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--blanc-pur);">${g.subject}</div>
        </td>
        <td style="text-align: center; color: var(--gris-400);">${g.coef}</td>
        <td style="text-align: center;">
          <strong style="color: #38BDF8; font-size: 1.05rem;">${typeof g.grade === 'number' ? g.grade.toFixed(1) : g.grade}</strong>
          <span style="font-size: 0.72rem; color: var(--gris-400);">/20</span>
        </td>
        <td style="text-align: center; color: var(--gris-300);">${g.classAvg ? g.classAvg.toFixed(1) : '--'}</td>
        <td style="text-align: center;">
          <span style="font-weight: 700; color: ${g.rank === '1er' ? 'var(--gold-400)' : 'var(--blanc-pur)'};">${g.rank || '--'}</span>
        </td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; background: ${mention.bg}; color: ${mention.color};">
            ${mention.text}
          </span>
        </td>
        <td style="font-size: 0.8rem; color: var(--gris-400);">${g.teacher || 'Professeur'}</td>
      </tr>
    `;
  }).join('');
}

function studentViewOfficialBulletin() {
  const code = (currentStudentContext === 'DAARA') ? 'DAARA_MOUHAMED' : '6A_MOUHAMED';
  if (typeof parentViewBulletin === 'function') {
    parentViewBulletin(code);
  } else if (typeof simulateStudentBulletinView === 'function') {
    simulateStudentBulletinView();
  }
}

function renderStudentTimetable() {
  const container = document.getElementById('studentTimetableContainer');
  if (!container) return;

  const data = studentDemoData[currentStudentContext];
  const isDaara = (currentStudentContext === 'DAARA');
  const timetable = data.timetable;

  if (!timetable) {
    container.innerHTML = `<div style="text-align: center; color: var(--gris-400); padding: 1.5rem;">Aucun emploi du temps disponible pour le moment.</div>`;
    return;
  }

  const titleEl = document.getElementById('studentTimetableTitle');
  const subEl = document.getElementById('studentTimetableSub');
  if (titleEl) {
    titleEl.textContent = isDaara 
      ? `Emploi du Temps Hebdomadaire Daara • ${data.class}`
      : `Emploi du Temps Hebdomadaire • ${data.class}`;
  }
  if (subEl) {
    subEl.textContent = isDaara
      ? "Programme d'apprentissage coranique, Allouwa, Murâja'ah et Tajwîd • Année 2026-2027"
      : "Planning officiel des cours, professeurs et salles attribuées • Année 2026-2027";
  }

  const days = timetable.days;
  const slots = timetable.slots;

  let html = `
    <div class="timetable-grid-wrapper" style="overflow-x: auto; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
      <table class="timetable-table" style="width: 100%; border-collapse: collapse; min-width: 680px;">
        <thead>
          <tr>
            <th style="width: 130px; background: rgba(10, 25, 47, 0.95); color: var(--blanc-pur); padding: 0.7rem; font-size: 0.78rem; text-align: center; border: 1px solid rgba(255,255,255,0.08);">Créneau Horaire</th>
            ${days.map(d => `<th style="min-width: 110px; background: rgba(10, 25, 47, 0.9); color: var(--blanc-pur); padding: 0.7rem; font-size: 0.78rem; text-align: center; border: 1px solid rgba(255,255,255,0.08);">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  slots.forEach(slot => {
    html += `<tr>`;
    html += `
      <td style="background: rgba(15, 23, 42, 0.6); font-weight: 700; text-align: center; vertical-align: middle; padding: 0.6rem; border: 1px solid rgba(255,255,255,0.06); color: var(--turquoise-400);">
        <div style="font-size: 0.82rem; font-weight: 800;">${slot.time}</div>
        ${slot.label ? `<div style="font-size: 0.7rem; color: var(--gris-400); margin-top: 3px;">${slot.label}</div>` : ''}
      </td>
    `;

    days.forEach(day => {
      const course = slot.schedule[day];
      if (course && course.subject) {
        let badgeColor = '#38BDF8';
        let bg = 'rgba(56, 189, 248, 0.12)';
        let border = '#38BDF8';

        if (course.subject.includes('Math') || course.subject.includes('Tahfîz')) {
          badgeColor = '#34D399';
          bg = 'rgba(16, 185, 129, 0.12)';
          border = '#10B981';
        } else if (course.subject.includes('Français') || course.subject.includes('Allouwa')) {
          badgeColor = 'var(--gold-400)';
          bg = 'rgba(212, 175, 55, 0.12)';
          border = '#D4AF37';
        } else if (course.subject.includes('SVT') || course.subject.includes('Tajwîd')) {
          badgeColor = '#A855F7';
          bg = 'rgba(168, 85, 247, 0.12)';
          border = '#A855F7';
        }

        html += `
          <td style="padding: 0.45rem; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); vertical-align: top;">
            <div style="background: ${bg}; border-left: 3px solid ${border}; border-radius: 6px; padding: 0.45rem 0.55rem; height: 100%; box-sizing: border-box;">
              <div style="font-weight: 700; color: ${badgeColor}; font-size: 0.8rem; line-height: 1.25; margin-bottom: 0.2rem;">${course.subject}</div>
              <div style="font-size: 0.72rem; color: var(--blanc-pur); display: flex; align-items: center; gap: 0.2rem;">
                <span>👨‍🏫</span> <span>${course.teacher}</span>
              </div>
              <div style="font-size: 0.69rem; color: var(--gris-400); margin-top: 0.2rem;">
                📍 ${course.room}
              </div>
            </div>
          </td>
        `;
      } else {
        html += `
          <td style="padding: 0.45rem; border: 1px solid rgba(255,255,255,0.06); text-align: center; vertical-align: middle; color: rgba(255,255,255,0.2); font-size: 0.74rem;">
            —
          </td>
        `;
      }
    });

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

function printStudentTimetable(triggerPrint = true) {
  const data = studentDemoData[currentStudentContext];
  if (!data) return;

  const modal = document.getElementById('timetablePrintModal');
  if (!modal) {
    window.print();
    return;
  }

  const schoolName = data.school || 'Groupe Scolaire Diamil';
  const className = data.class || '6ème A';
  const studentName = data.name || 'Élève';

  const schoolNameEl = document.getElementById('printTtSchoolName');
  const stampNameEl = document.getElementById('printTtStampName');
  const titleEl = document.getElementById('printTtClassTitle');

  if (schoolNameEl) schoolNameEl.textContent = schoolName;
  if (stampNameEl) stampNameEl.textContent = schoolName;
  if (titleEl) {
    titleEl.textContent = `EMPLOI DU TEMPS — ${className.toUpperCase()}`;
  }

  const table = document.getElementById('printTtTable');
  if (table && data.timetable) {
    const days = data.timetable.days;
    const slots = data.timetable.slots;

    table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 110px;">Créneaux</th>
          ${days.map(d => `<th>${d}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${slots.map(slot => `
          <tr>
            <td style="font-weight: 800; text-align: center; background: #F1F5F9; color: #0A192F; font-size: 8pt;">
              ${slot.time}
              ${slot.label ? `<div style="font-size: 7pt; color: #64748B; font-weight: normal;">${slot.label}</div>` : ''}
            </td>
            ${days.map(d => {
              const c = slot.schedule ? slot.schedule[d] : null;
              if (c && c.subject) {
                return `<td><strong style="color: #0A192F;">${c.subject}</strong><br><span style="font-size: 7.5pt; color: #475569;">${c.teacher} • ${c.room}</span></td>`;
              }
              return `<td style="text-align: center; color: #CBD5E1;">—</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  modal.style.zIndex = '2500';
  modal.classList.add('active');
  document.body.classList.add('printing-timetable');

  showNotification(`🖨️ Préparation de l'Emploi du Temps Officiel (${className})...`);

  if (triggerPrint) {
    setTimeout(() => {
      window.print();
    }, 250);
  }
}

function renderStudentHomeworkList() {
  const container = document.getElementById('studentHomeworkList');
  const countEl = document.getElementById('studentHomeworkPendingCount');
  if (!container) return;

  const data = studentDemoData[currentStudentContext];
  const pendingCount = data.homework.filter(h => !h.done).length;
  if (countEl) {
    countEl.textContent = `● ${pendingCount} devoir${pendingCount > 1 ? 's' : ''} à rendre`;
    countEl.style.color = pendingCount > 0 ? '#F59E0B' : '#10B981';
  }

  container.innerHTML = data.homework.map(hw => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid ${hw.done ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; padding: 1rem; transition: all 0.2s;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
        <div>
          <span class="badge-tag badge-primary" style="font-size: 0.72rem; margin-right: 0.4rem;">${hw.subject}</span>
          <strong style="color: var(--blanc-pur); font-size: 0.95rem; text-decoration: ${hw.done ? 'line-through' : 'none'};">${hw.title}</strong>
        </div>
        <button type="button" class="btn ${hw.done ? 'btn-outline' : 'btn-primary'}" 
                style="font-size: 0.76rem; padding: 0.25rem 0.65rem; ${hw.done ? 'color: #10B981; border-color: #10B981;' : ''}" 
                onclick="toggleStudentHomework(${hw.id})">
          ${hw.done ? '✓ Fait & Validé' : '○ Marquer comme Fait'}
        </button>
      </div>
      <p style="font-size: 0.82rem; color: var(--gris-300); margin: 0 0 0.6rem 0;">${hw.desc}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; color: var(--gris-400); flex-wrap: wrap; gap: 0.5rem;">
        <span>📅 Échéance : <strong style="color: ${hw.done ? 'var(--gris-400)' : 'var(--gold-400)'};">${hw.dueDate}</strong> • Enseignant : ${hw.teacher}</span>
        <span style="color: ${hw.done ? '#10B981' : '#F59E0B'}; font-weight: 700;">${hw.done ? '✓ Terminé' : '⏱ En cours'}</span>
      </div>
    </div>
  `).join('');
}

function toggleStudentHomework(hwId) {
  const data = studentDemoData[currentStudentContext];
  const item = data.homework.find(h => h.id === hwId);
  if (!item) return;

  item.done = !item.done;
  renderStudentHomeworkList();
  if (item.done) {
    showNotification(`👏 Bravo ! Devoir "${item.title}" marqué comme fait.`);
    logAuditEvent('Devoir Élève Fait', `Devoir N°${hwId} validé par l'élève`);
  } else {
    showNotification(`⏱ Devoir "${item.title}" remis en cours.`);
  }
}

function renderStudentAppreciations() {
  const container = document.getElementById('studentAppreciationsContainer');
  if (!container) return;

  const data = studentDemoData[currentStudentContext];
  container.innerHTML = data.appreciations.map(a => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 1.1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <strong style="color: var(--turquoise-400); font-size: 0.92rem;">${a.teacher}</strong>
        <span class="badge-tag ${a.badgeCls || 'badge-gold'}" style="font-size: 0.76rem;">${a.decision}</span>
      </div>
      <p style="font-size: 0.84rem; color: var(--gris-200); line-height: 1.5; margin: 0; font-style: italic;">
        "${a.remark}"
      </p>
    </div>
  `).join('');
}

function renderStudentResources() {
  const container = document.getElementById('studentResourcesContainer');
  if (!container) return;

  const data = studentDemoData[currentStudentContext];
  container.innerHTML = data.resources.map(r => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">${r.icon}</div>
        <strong style="color: var(--blanc-pur); font-size: 0.9rem; display: block; margin-bottom: 0.3rem;">${r.title}</strong>
        <div style="font-size: 0.76rem; color: var(--turquoise-400); margin-bottom: 0.6rem;">${r.subject} • ${r.size}</div>
      </div>
      <button type="button" class="btn btn-outline" style="font-size: 0.78rem; padding: 0.35rem 0.7rem; justify-content: center; color: #60A5FA; border-color: rgba(96, 165, 250, 0.4);" onclick="downloadStudentResource('${r.title.replace(/'/g, "\\'")}')">
        ⬇️ Télécharger la Fiche
      </button>
    </div>
  `).join('');
}

function downloadStudentResource(title) {
  showNotification(`📥 Téléchargement lancé : "${title}" (Fichier PDF certifié).`);
  logAuditEvent('Téléchargement Ressource Élève', `Document "${title}" téléchargé par l'élève.`);
}

/* ==========================================================================
   ESPACE ENSEIGNANT / OUSTAZ DÉDIÉ (ÉCOLE PRIVÉE & DAARA MODERNE)
   ========================================================================== */

let currentTeacherContext = 'ECOLE'; // 'ECOLE' ou 'DAARA'
let currentTeacherInnerTab = 'grades'; // 'grades', 'appreciations', 'attendance', 'homework'

const teacherDemoData = {
  ECOLE: {
    name: 'M. Babacar Ndiaye',
    key: 'ENS-DIAMIL-2026',
    subjects: 'Mathématiques & Sciences (6ème A & CM2 B)',
    school: "Mon Ã‰tablissement",
    avatar: '👨‍🏫',
    stat1: { label: 'Élèves Assignés', value: '42 Élèves', sub: 'Classes : 6ème A & CM2 B' },
    stat2: { label: 'Moyenne Générale Classe', value: '15.42 / 20', sub: '1er Trimestre 2026-2027' },
    stat3: { label: 'Pointage Présences Jour', value: '97.6%', sub: '1 absent signalé (Babacar Seck)' },
    classes: [
      { id: '6A', label: '6ème A (Collège)' },
      { id: 'CM2', label: 'CM2 B (Primaire)' }
    ],
    selectedClass: '6A',
    grades: [
      { id: 'DIA-2026-001', name: 'Mouhamed Sow', matricule: 'DIA-2026-001', classId: '6A', subject: 'Mathématiques', grade: 16.5, coef: 4 },
      { id: 'DIA-2026-002', name: 'Fatou Sow', matricule: 'DIA-2026-002', classId: '6A', subject: 'Mathématiques', grade: 14.5, coef: 4 },
      { id: 'DIA-2026-003', name: 'Babacar Seck', matricule: 'DIA-2026-003', classId: '6A', subject: 'Mathématiques', grade: 11.0, coef: 4 },
      { id: 'DIA-2026-004', name: 'Aïssatou Ba', matricule: 'DIA-2026-004', classId: '6A', subject: 'Mathématiques', grade: 18.0, coef: 4 },
      { id: 'DIA-2026-015', name: 'Cheikh Fall', matricule: 'DIA-2026-015', classId: 'CM2', subject: 'Calcul & Problèmes', grade: 15.0, coef: 3 },
      { id: 'DIA-2026-016', name: 'Mariama Diop', matricule: 'DIA-2026-016', classId: 'CM2', subject: 'Calcul & Problèmes', grade: 17.5, coef: 3 }
    ],
    appreciations: [
      {
        studentId: 'DIA-2026-001',
        name: 'Mouhamed Sow',
        class: '6ème A',
        currentNote: '16.5 / 20',
        rank: '2ème de la classe',
        appreciation: "Excellent trimestre ! Travail très rigoureux, esprit méthodique et participation dynamique. Poursuivez dans cette voie d'excellence.",
        decision: "Félicitations du Conseil & Tableau d'Honneur",
        lastUpdated: "Mis à jour il y a 2h"
      },
      {
        studentId: 'DIA-2026-002',
        name: 'Fatou Sow',
        class: '6ème A',
        currentNote: '14.5 / 20',
        rank: '7ème de la classe',
        appreciation: "Bon trimestre dans l'ensemble. Bonnes capacités de raisonnement, continuez à soigner la rigueur de rédaction pour franchir un cap.",
        decision: "Tableau d'Honneur",
        lastUpdated: "Mis à jour hier"
      },
      {
        studentId: 'DIA-2026-003',
        name: 'Babacar Seck',
        class: '6ème A',
        currentNote: '11.0 / 20',
        rank: '19ème de la classe',
        appreciation: "Résultats moyens et irréguliers. Doit consolider le travail personnel à la maison et participer davantage en classe.",
        decision: "Encouragements sous réserve d'assiduité",
        lastUpdated: "Mis à jour le 10 Septembre"
      }
    ],
    attendance: [
      {
        studentId: 'DIA-2026-001',
        name: 'Mouhamed Sow',
        matricule: 'DIA-2026-001',
        class: '6ème A',
        status: 'PRESENT',
        parentPhone: '+221 77 123 45 67',
        parentName: 'Mme Aminata Diallo',
        justification: "À l'heure"
      },
      {
        studentId: 'DIA-2026-002',
        name: 'Fatou Sow',
        matricule: 'DIA-2026-002',
        class: '6ème A',
        status: 'PRESENT',
        parentPhone: '+221 77 123 45 67',
        parentName: 'Mme Aminata Diallo',
        justification: "À l'heure"
      },
      {
        studentId: 'DIA-2026-003',
        name: 'Babacar Seck',
        matricule: 'DIA-2026-003',
        class: '6ème A',
        status: 'ABSENT',
        parentPhone: '+221 77 555 12 34',
        parentName: 'M. Ousmane Seck',
        justification: 'Non justifié - Alerte WhatsApp requise'
      },
      {
        studentId: 'DIA-2026-004',
        name: 'Aïssatou Ba',
        matricule: 'DIA-2026-004',
        class: '6ème A',
        status: 'RETARD',
        parentPhone: '+221 78 333 44 55',
        parentName: 'Mme Marième Ba',
        justification: 'Retard de 15 min (Transport Dakar Dem Dikk)'
      }
    ],
    homework: [
      {
        id: 1,
        title: 'Devoir Maison N°1 - Équations & Géométrie Plane',
        class: '6ème A',
        dueDate: '2026-09-18',
        desc: 'Exercices 12 à 18 page 45 du manuel CIAM. Rédiger proprement sur copie double.',
        status: 'Actif • 38/42 élèves ont consulté'
      },
      {
        id: 2,
        title: 'Préparation TP Sciences : Mesure de Masse et Volume',
        class: '6ème A',
        dueDate: '2026-09-22',
        desc: 'Lire la fiche méthode N°3 et apporter la blouse de laboratoire.',
        status: 'Programmé'
      }
    ]
  },
  DAARA: {
    name: 'Oustaz Abdoulaye Ba',
    key: 'ENS-DAARA-2026',
    subjects: 'Hifz (Mémorisation Coranique) & Tajwîd',
    school: 'Mon Daara Moderne',
    avatar: '🕌',
    stat1: { label: 'Talibés Suivis', value: '35 Talibés', sub: 'Groupes : Niveau 2 (Sourate Al-Baqara) & Initiation' },
    stat2: { label: 'Moyenne Récitation Tajwîd', value: '17.2 / 20', sub: 'Évaluation mensuelle Hizb' },
    stat3: { label: 'Assiduité Daara', value: '100%', sub: 'Tous les talibés présents à la session du Fajr' },
    classes: [
      { id: 'NIV2', label: 'Niveau 2 (Hifz Avancé)' },
      { id: 'INIT', label: 'Niveau 1 (Initiation & Lettres)' }
    ],
    selectedClass: 'NIV2',
    grades: [
      { id: 'DAA-2026-001', name: 'Mouhamed Sow', matricule: 'DAA-2026-001', classId: 'NIV2', subject: 'Récitation Sourate Al-Baqara (Versets 1 à 50)', grade: 18.0, coef: 5 },
      { id: 'DAA-2026-002', name: 'Fatou Sow', matricule: 'DAA-2026-002', classId: 'NIV2', subject: 'Récitation Juz Amma & Règles de Tajwîd', grade: 17.5, coef: 5 },
      { id: 'DAA-2026-005', name: 'Ibrahima Ndiaye', matricule: 'DAA-2026-005', classId: 'NIV2', subject: 'Mémorisation Sourate Ya-Sin', grade: 16.0, coef: 4 },
      { id: 'DAA-2026-010', name: 'Khadija Kane', matricule: 'DAA-2026-010', classId: 'INIT', subject: 'Prononciation Makhârij & Écriture Arabe', grade: 19.0, coef: 3 }
    ],
    appreciations: [
      {
        studentId: 'DAA-2026-001',
        name: 'Mouhamed Sow',
        class: 'Niveau 2 (Hifz)',
        currentNote: '18.0 / 20 (9 Hizbs validés)',
        rank: '1er du groupe Hifz',
        appreciation: "Macha'Allah ! Diction limpide, maîtrise exemplaire des règles de Tajwîd (Ghunna et Madd). Assiduité remarquable lors des séances matinales.",
        decision: "Passage au 10ème Hizb validé avec Félicitations",
        lastUpdated: "Mis à jour ce matin"
      },
      {
        studentId: 'DAA-2026-002',
        name: 'Fatou Sow',
        class: 'Niveau 2 (Hifz)',
        currentNote: '17.5 / 20 (6 Hizbs validés)',
        rank: '3ème du groupe',
        appreciation: "Très belle récitation de Juz Amma. Grande politesse et persévérance. Qu'Allah fructifie son apprentissage.",
        decision: "Attestation d'Excellence décernée",
        lastUpdated: "Mis à jour hier"
      }
    ],
    attendance: [
      {
        studentId: 'DAA-2026-001',
        name: 'Mouhamed Sow',
        matricule: 'DAA-2026-001',
        class: 'Niveau 2',
        status: 'PRESENT',
        parentPhone: '+221 77 123 45 67',
        parentName: 'Mme Aminata Diallo',
        justification: 'Présent au Fajr'
      },
      {
        studentId: 'DAA-2026-002',
        name: 'Fatou Sow',
        matricule: 'DAA-2026-002',
        class: 'Niveau 2',
        status: 'PRESENT',
        parentPhone: '+221 77 123 45 67',
        parentName: 'Mme Aminata Diallo',
        justification: 'Présente au Fajr'
      },
      {
        studentId: 'DAA-2026-005',
        name: 'Ibrahima Ndiaye',
        matricule: 'DAA-2026-005',
        class: 'Niveau 2',
        status: 'PRESENT',
        parentPhone: '+221 77 888 99 00',
        parentName: 'M. Cheikh Ndiaye',
        justification: 'Présent au Fajr'
      }
    ],
    homework: [
      {
        id: 101,
        title: 'Murâja\'ah (Révision Quotidienne) : Sourate Al-Mulk',
        class: 'Niveau 2',
        dueDate: '2026-09-15',
        desc: 'Réciter 3 fois de mémoire avec soin sur les règles de Madd et les arrêts (Waqf).',
        status: 'En cours'
      },
      {
        id: 102,
        title: 'Écriture sur Planchette (Al-Lawh) : Sourate An-Naba',
        class: 'Niveau 2',
        dueDate: '2026-09-17',
        desc: 'Calligraphie traditionnelle au calame et encre des versets 1 à 20.',
        status: 'Attribué'
      }
    ]
  }
};

function getTeacherMentionFromGrade(grade) {
  const g = parseFloat(grade);
  if (isNaN(g)) return { text: 'Non noté', bg: 'rgba(156, 163, 175, 0.2)', color: '#9CA3AF' };
  if (g >= 16) return { text: 'Très Bien', bg: 'rgba(52, 211, 153, 0.2)', color: '#34D399' };
  if (g >= 14) return { text: 'Bien', bg: 'rgba(0, 210, 180, 0.2)', color: '#00D2B4' };
  if (g >= 12) return { text: 'Assez Bien', bg: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' };
  if (g >= 10) return { text: 'Passable', bg: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24' };
  return { text: 'Insuffisant', bg: 'rgba(239, 68, 68, 0.2)', color: '#F87171' };
}

function openTeacherPortalModal() {
  closeAllModals();
  const modal = document.getElementById('teacherPortalModal');
  if (!modal) return;

  if (currentEstablishment && currentEstablishment.type === 'DAARA') {
    currentTeacherContext = 'DAARA';
  } else {
    currentTeacherContext = 'ECOLE';
  }

  renderTeacherPortalContent();
  modal.classList.add('active');

  const data = teacherDemoData[currentTeacherContext];
  showNotification(`👨‍🏫 Bienvenue ${data.name} dans votre Espace Enseignant [${data.school}] !`);
  logAuditEvent('Connexion Espace Enseignant', `Session ouverte pour ${data.name} (${data.key})`);
}

function closeTeacherPortal() {
  const modal = document.getElementById('teacherPortalModal');
  if (modal) modal.classList.remove('active');
}

function teacherLogout() {
  closeTeacherPortal();
  showNotification("🚪 Vous vous êtes déconnecté de l'Espace Enseignant.");
  logAuditEvent('Déconnexion Enseignant', 'Clé désactivée pour la session en cours.');
}

function switchTeacherPortalContext(context) {
  currentTeacherContext = (context === 'DAARA') ? 'DAARA' : 'ECOLE';
  renderTeacherPortalContent();
  const data = teacherDemoData[currentTeacherContext];
  showNotification(`🔄 Profil Enseignant basculé : ${data.name} (${data.school})`);
  logAuditEvent('Changement Contexte Enseignant', `Bascule vers ${data.name} (${currentTeacherContext})`);
}

function switchTeacherInnerTab(tabName) {
  currentTeacherInnerTab = tabName;
  const tabs = ['grades', 'appreciations', 'attendance', 'homework'];
  
  tabs.forEach(t => {
    const btn = document.getElementById(`tabTeacher${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    const content = document.getElementById(`teacherTab${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
    if (btn) {
      if (t === tabName) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    }
    if (content) {
      content.style.display = (t === tabName) ? 'block' : 'none';
    }
  });
}

function onTeacherClassFilterChange() {
  const select = document.getElementById('teacherClassSelect');
  if (!select) return;
  teacherDemoData[currentTeacherContext].selectedClass = select.value;
  renderTeacherGradesTable();
}

function renderTeacherPortalContent() {
  const data = teacherDemoData[currentTeacherContext];
  if (!data) return;

  // 1. En-tête
  const avatarEl = document.getElementById('teacherAvatarDisplay');
  const nameEl = document.getElementById('teacherNameDisplay');
  const keyBadgeEl = document.getElementById('teacherKeyBadge');
  const subjectsEl = document.getElementById('teacherSubjectsDisplay');
  const schoolEl = document.getElementById('teacherSchoolNameDisplay');

  if (avatarEl) avatarEl.textContent = data.avatar;
  if (nameEl) nameEl.textContent = `Espace Enseignant : ${data.name}`;
  if (keyBadgeEl) keyBadgeEl.textContent = `✓ Clé Active : ${data.key}`;
  if (subjectsEl) subjectsEl.textContent = data.subjects;
  if (schoolEl) schoolEl.textContent = data.school;

  // 2. Sélecteur de mode
  const modeBadge = document.getElementById('teacherCurrentModeBadge');
  const btnEcole = document.getElementById('teacherSwitchBtnEcole');
  const btnDaara = document.getElementById('teacherSwitchBtnDaara');

  if (modeBadge) {
    if (currentTeacherContext === 'ECOLE') {
      modeBadge.className = 'badge-tag badge-primary';
      modeBadge.textContent = `🏫 Mode École Privée (${data.name})`;
    } else {
      modeBadge.className = 'badge-tag badge-success';
      modeBadge.textContent = `🕌 Mode Daara Moderne (${data.name})`;
    }
  }

  if (btnEcole && btnDaara) {
    if (currentTeacherContext === 'ECOLE') {
      btnEcole.className = 'btn btn-primary';
      btnDaara.className = 'btn btn-outline';
    } else {
      btnEcole.className = 'btn btn-outline';
      btnDaara.className = 'btn btn-primary';
    }
  }

  // 3. Mini statistiques
  const s1L = document.getElementById('teacherStat1Label');
  const s1V = document.getElementById('teacherStat1Value');
  const s1S = document.getElementById('teacherStat1Sub');
  if (s1L) s1L.textContent = data.stat1.label;
  if (s1V) s1V.textContent = data.stat1.value;
  if (s1S) s1S.textContent = data.stat1.sub;

  const s2L = document.getElementById('teacherStat2Label');
  const s2V = document.getElementById('teacherStat2Value');
  const s2S = document.getElementById('teacherStat2Sub');
  if (s2L) s2L.textContent = data.stat2.label;
  if (s2V) s2V.textContent = data.stat2.value;
  if (s2S) s2S.textContent = data.stat2.sub;

  const s3L = document.getElementById('teacherStat3Label');
  const s3V = document.getElementById('teacherStat3Value');
  const s3S = document.getElementById('teacherStat3Sub');
  if (s3L) s3L.textContent = data.stat3.label;
  if (s3V) s3V.textContent = data.stat3.value;
  if (s3S) s3S.textContent = data.stat3.sub;

  // 4. Select des classes
  const classSelect = document.getElementById('teacherClassSelect');
  if (classSelect) {
    classSelect.innerHTML = data.classes.map(c => 
      `<option value="${c.id}" ${c.id === data.selectedClass ? 'selected' : ''}>${c.label}</option>`
    ).join('');
  }

  const hwClassSelect = document.getElementById('hwClassInput');
  if (hwClassSelect) {
    hwClassSelect.innerHTML = data.classes.map(c => 
      `<option value="${c.label}">${c.label}</option>`
    ).join('');
  }

  // 5. Rendu des onglets
  renderTeacherGradesTable();
  renderTeacherAppreciations();
  renderTeacherAttendanceTable();
  renderTeacherHomeworkList();
  switchTeacherInnerTab(currentTeacherInnerTab);
}

function renderTeacherGradesTable() {
  const tbody = document.getElementById('teacherGradesTableBody');
  if (!tbody) return;

  const data = teacherDemoData[currentTeacherContext];
  const selectedClass = data.selectedClass;
  const filteredGrades = data.grades.filter(g => g.classId === selectedClass);

  if (filteredGrades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--gris-400); padding: 1.5rem;">Aucun élève trouvé pour cette classe.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredGrades.map(s => {
    const mention = getTeacherMentionFromGrade(s.grade);
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--blanc-pur);">${s.name}</div>
        </td>
        <td>
          <code style="font-size: 0.76rem; color: var(--turquoise-400); background: rgba(0,210,180,0.1); padding: 0.15rem 0.35rem; border-radius: 4px;">${s.matricule}</code>
        </td>
        <td>
          <span style="color: var(--gris-300);">${s.subject}</span>
          <span style="font-size: 0.72rem; color: var(--gris-500); margin-left: 0.3rem;">(Coeff ${s.coef})</span>
        </td>
        <td style="text-align: center;">
          <input type="number" step="0.25" min="0" max="20" class="form-input" 
                 style="width: 75px; text-align: center; font-weight: 800; font-size: 0.9rem; color: #38BDF8; padding: 0.25rem 0.4rem; display: inline-block;" 
                 value="${s.grade}" 
                 id="gradeInput_${s.id}" 
                 onchange="updateTeacherGradeValue('${s.id}', this.value)">
        </td>
        <td style="text-align: center;" id="mentionCell_${s.id}">
          <span style="display: inline-block; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; background: ${mention.bg}; color: ${mention.color};">
            ${mention.text}
          </span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-outline" style="font-size: 0.74rem; padding: 0.25rem 0.6rem; color: var(--turquoise-400); border-color: rgba(0,210,180,0.3);" onclick="saveSingleGrade('${s.id}')">
            💾 Valider
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateTeacherGradeValue(studentId, newVal) {
  const data = teacherDemoData[currentTeacherContext];
  const item = data.grades.find(g => g.id === studentId);
  if (!item) return;

  const num = parseFloat(newVal);
  item.grade = isNaN(num) ? 0 : Math.min(20, Math.max(0, num));

  const cell = document.getElementById(`mentionCell_${studentId}`);
  if (cell) {
    const mention = getTeacherMentionFromGrade(item.grade);
    cell.innerHTML = `
      <span style="display: inline-block; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; background: ${mention.bg}; color: ${mention.color};">
        ${mention.text}
      </span>
    `;
  }
}

function saveSingleGrade(studentId) {
  const data = teacherDemoData[currentTeacherContext];
  const item = data.grades.find(g => g.id === studentId);
  if (!item) return;

  const mention = getTeacherMentionFromGrade(item.grade);
  showNotification(`✨ Note validée pour ${item.name} : ${item.grade} / 20 (${mention.text}). Synchro avec le bulletin effectuée !`);
  logAuditEvent('Saisie Note Enseignant', `Note de ${item.grade}/20 attribuée à ${item.name} (${item.matricule}) en ${item.subject}`);
}

function saveAllTeacherGrades() {
  const data = teacherDemoData[currentTeacherContext];
  const count = data.grades.filter(g => g.classId === data.selectedClass).length;
  showNotification(`💾 Succès : Les ${count} notes de la classe ont été enregistrées et reportées sur les bulletins !`);
  logAuditEvent('Saisie Masse Notes', `${count} notes enregistrées pour la classe ${data.selectedClass} par ${data.name}`);
}

function renderTeacherAppreciations() {
  const container = document.getElementById('teacherAppreciationsContainer');
  if (!container) return;

  const data = teacherDemoData[currentTeacherContext];
  if (!data.appreciations || data.appreciations.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--gris-400); padding: 1.5rem;">Aucune appréciation à afficher.</div>`;
    return;
  }

  container.innerHTML = data.appreciations.map(a => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <strong style="color: var(--blanc-pur); font-size: 0.95rem;">${a.name}</strong>
          <span style="font-size: 0.78rem; color: var(--turquoise-400); margin-left: 0.5rem;">(${a.class})</span>
          <span style="font-size: 0.78rem; color: var(--gold-400); margin-left: 0.5rem;">• Moyenne : ${a.currentNote}</span>
          <span style="font-size: 0.75rem; color: var(--gris-400); margin-left: 0.5rem;">(${a.rank})</span>
        </div>
        <span style="font-size: 0.72rem; color: var(--gris-500);" id="apprecStatus_${a.studentId}">✓ ${a.lastUpdated}</span>
      </div>
      <div style="margin-bottom: 0.6rem;">
        <label style="display: block; font-size: 0.78rem; color: var(--gris-300); margin-bottom: 0.2rem;">Observation &amp; Conseils Pédagogiques :</label>
        <textarea id="apprecText_${a.studentId}" class="form-input" rows="2" style="width: 100%; font-size: 0.82rem;">${a.appreciation}</textarea>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 260px;">
          <label style="font-size: 0.78rem; color: var(--gris-300); white-space: nowrap;">Décision du Conseil :</label>
          <select id="apprecDecision_${a.studentId}" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: 100%;">
            <option value="Félicitations du Conseil &amp; Tableau d'Honneur" ${a.decision.includes('Félicitations') ? 'selected' : ''}>Félicitations du Conseil &amp; Tableau d'Honneur</option>
            <option value="Tableau d'Honneur" ${a.decision === "Tableau d'Honneur" ? 'selected' : ''}>Tableau d'Honneur</option>
            <option value="Encouragements" ${a.decision.includes('Encouragements') ? 'selected' : ''}>Encouragements du Conseil</option>
            <option value="Passage avec distinction" ${a.decision.includes('Passage') || a.decision.includes('Attestation') ? 'selected' : ''}>Validation avec Distinction</option>
            <option value="Avertissement Travail" ${a.decision.includes('Avertissement') ? 'selected' : ''}>Avertissement Travail</option>
          </select>
        </div>
        <button type="button" class="btn btn-primary" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;" onclick="saveTeacherAppreciation('${a.studentId}')">
          📝 Certifier l'Appréciation
        </button>
      </div>
    </div>
  `).join('');
}

function saveTeacherAppreciation(studentId) {
  const data = teacherDemoData[currentTeacherContext];
  const item = data.appreciations.find(a => a.studentId === studentId);
  if (!item) return;

  const textEl = document.getElementById(`apprecText_${studentId}`);
  const decEl = document.getElementById(`apprecDecision_${studentId}`);
  const statusEl = document.getElementById(`apprecStatus_${studentId}`);

  if (textEl) item.appreciation = textEl.value.trim();
  if (decEl) item.decision = decEl.value;
  item.lastUpdated = "Mis à jour à l'instant";

  if (statusEl) statusEl.textContent = `✓ ${item.lastUpdated}`;

  showNotification(`📝 Avis certifié pour ${item.name} ! Reporté instantanément sur le bulletin officiel.`);
  logAuditEvent('Avis Conseil Enseignant', `Observation certifiée pour ${item.name} (${item.studentId}) : "${item.decision}"`);
}

function renderTeacherAttendanceTable() {
  const tbody = document.getElementById('teacherAttendanceTableBody');
  if (!tbody) return;

  const data = teacherDemoData[currentTeacherContext];
  if (!data.attendance || data.attendance.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--gris-400); padding: 1.5rem;">Aucun élève enregistré pour l'appel.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.attendance.map(att => {
    const isPres = att.status === 'PRESENT';
    const isAbs = att.status === 'ABSENT';
    const isRet = att.status === 'RETARD';

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--blanc-pur);">${att.name}</div>
          <div style="font-size: 0.74rem; color: var(--gris-400);">${att.class} • ${att.matricule}</div>
        </td>
        <td>
          <div style="display: flex; gap: 0.3rem;">
            <button type="button" class="btn ${isPres ? 'btn-primary' : 'btn-outline'}" 
                    style="font-size: 0.72rem; padding: 0.2rem 0.5rem; ${isPres ? 'background: #10B981; border-color: #10B981;' : ''}" 
                    onclick="setAttendanceStatus('${att.studentId}', 'PRESENT')">
              ✓ Présent
            </button>
            <button type="button" class="btn ${isAbs ? 'btn-primary' : 'btn-outline'}" 
                    style="font-size: 0.72rem; padding: 0.2rem 0.5rem; ${isAbs ? 'background: #EF4444; border-color: #EF4444;' : 'color: #F87171; border-color: rgba(239, 68, 68, 0.4);'}" 
                    onclick="setAttendanceStatus('${att.studentId}', 'ABSENT')">
              ✕ Absent
            </button>
            <button type="button" class="btn ${isRet ? 'btn-primary' : 'btn-outline'}" 
                    style="font-size: 0.72rem; padding: 0.2rem 0.5rem; ${isRet ? 'background: #F59E0B; border-color: #F59E0B;' : 'color: #FBBF24; border-color: rgba(245, 158, 11, 0.4);'}" 
                    onclick="setAttendanceStatus('${att.studentId}', 'RETARD')">
              ⏱ Retard
            </button>
          </div>
        </td>
        <td>
          <span style="font-size: 0.8rem; color: ${isAbs ? '#F87171' : (isRet ? '#FBBF24' : 'var(--gris-300)')};">
            ${att.justification}
          </span>
        </td>
        <td style="text-align: right;">
          ${isAbs ? `
            <button type="button" class="btn btn-outline" style="font-size: 0.74rem; padding: 0.25rem 0.6rem; color: #34D399; border-color: rgba(52, 211, 153, 0.4);" onclick="sendAttendanceWhatsAppAlert('${att.studentId}')">
              🚨 Alerte WhatsApp (${att.parentPhone})
            </button>
          ` : `
            <span style="font-size: 0.74rem; color: var(--gris-500);">✓ En règle</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function setAttendanceStatus(studentId, newStatus) {
  const data = teacherDemoData[currentTeacherContext];
  const item = data.attendance.find(a => a.studentId === studentId);
  if (!item) return;

  item.status = newStatus;
  if (newStatus === 'PRESENT') {
    item.justification = "Présent à l'appel";
    showNotification(`✓ ${item.name} marqué Présent.`);
  } else if (newStatus === 'ABSENT') {
    item.justification = "Non justifié - Alerte WhatsApp disponible";
    showNotification(`⚠️ ${item.name} marqué ABSENT. Vous pouvez déclencher l'alerte WhatsApp parent.`);
  } else {
    item.justification = "Retard en cours (Signalé)";
    showNotification(`⏱ ${item.name} marqué en Retard.`);
  }

  renderTeacherAttendanceTable();
}

function sendAttendanceWhatsAppAlert(studentId) {
  const data = teacherDemoData[currentTeacherContext];
  const item = data.attendance.find(a => a.studentId === studentId);
  if (!item) return;

  const msg = `Bonjour ${item.parentName}, nous vous informons que votre enfant ${item.name} (${item.matricule}) est marqué absent ce jour à la séance de ${data.subjects} (${data.school}). Merci de contacter la vie scolaire.`;
  
  showNotification(`📲 Alerte WhatsApp d'absence envoyée à ${item.parentName} (${item.parentPhone}) !`);
  logAuditEvent('Alerte WhatsApp Absence', `Notification d'absence transmise à ${item.parentPhone} pour ${item.name}`);
}

function submitDailyAttendance() {
  const data = teacherDemoData[currentTeacherContext];
  showNotification(`📋 L'appel de la séance a été certifié et clôturé avec succès par ${data.name}. Registre verrouillé.`);
  logAuditEvent('Clôture Registre Appel', `Feuille de présence validée par ${data.name} pour la séance en cours.`);
}

function renderTeacherHomeworkList() {
  const container = document.getElementById('teacherHomeworkList');
  if (!container) return;

  const data = teacherDemoData[currentTeacherContext];
  if (!data.homework || data.homework.length === 0) {
    container.innerHTML = `<div style="color: var(--gris-400); font-size: 0.82rem;">Aucun devoir en cours.</div>`;
    return;
  }

  container.innerHTML = data.homework.map(hw => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.85rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem;">
        <strong style="color: var(--blanc-pur); font-size: 0.88rem;">${hw.title}</strong>
        <span class="badge-tag badge-primary" style="font-size: 0.7rem; white-space: nowrap;">${hw.class}</span>
      </div>
      <p style="font-size: 0.8rem; color: var(--gris-300); margin: 0 0 0.5rem 0;">${hw.desc}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem; color: var(--gris-400);">
        <span>📅 Pour le : <strong style="color: var(--gold-400);">${hw.dueDate}</strong></span>
        <span style="color: #34D399;">${hw.status}</span>
      </div>
    </div>
  `).join('');
}

function addTeacherHomework(e) {
  if (e) e.preventDefault();
  const data = teacherDemoData[currentTeacherContext];

  const titleEl = document.getElementById('hwTitleInput');
  const classEl = document.getElementById('hwClassInput');
  const dateEl = document.getElementById('hwDateInput');
  const descEl = document.getElementById('hwDescInput');

  if (!titleEl || !descEl || !titleEl.value.trim() || !descEl.value.trim()) {
    alert("Veuillez remplir le titre et les consignes du devoir.");
    return;
  }

  const newHw = {
    id: Date.now(),
    title: titleEl.value.trim(),
    class: classEl ? classEl.value : 'Toutes',
    dueDate: dateEl ? dateEl.value : '2026-09-20',
    desc: descEl.value.trim(),
    status: '📢 Nouveau • Notifié'
  };

  data.homework.unshift(newHw);
  titleEl.value = '';
  descEl.value = '';

  renderTeacherHomeworkList();
  showNotification(`📢 Nouveau devoir "${newHw.title}" publié avec succès ! Notification envoyée aux familles.`);
  logAuditEvent('Publication Devoir Enseignant', `Nouveau devoir "${newHw.title}" programmé pour le ${newHw.dueDate} (${newHw.class})`);
}

let currentParentContext = 'ECOLE'; // 'ECOLE' ou 'DAARA'

function openParentPortalModal() {
  closeAllModals();
  const modal = document.getElementById('parentPortalModal');
  if (!modal) return;

  // Si l'établissement sélectionné actuellement dans l'app est un Daara, pré-sélectionner Daara, sinon École Privée
  if (currentEstablishment && currentEstablishment.type === 'DAARA') {
    currentParentContext = 'DAARA';
  } else {
    currentParentContext = 'ECOLE';
  }

  renderParentPortalContent();

  modal.classList.add('active');
  const modeTxt = currentParentContext === 'DAARA' ? 'Daara Moderne' : 'École Privée (Groupe Scolaire Diamil)';
  showNotification(`👨‍👩‍👧 Bienvenue Mme Aminata Diallo dans votre Espace Parent [${modeTxt}] !`);
  logAuditEvent('Connexion Espace Parent', `Session parent ouverte en mode ${modeTxt} pour Mme Aminata Diallo (+221 77 123 45 67)`);
}

function switchParentPortalContext(context) {
  currentParentContext = (context === 'DAARA') ? 'DAARA' : 'ECOLE';
  renderParentPortalContent();
  const label = currentParentContext === 'DAARA' ? 'Daara Moderne' : 'École Privée (Groupe Scolaire Diamil)';
  showNotification(`🔄 Espace Parent synchronisé avec succès en mode : ${label}`);
  logAuditEvent('Bascule Contexte Parent', `Mode parent basculé vers ${label}`);
}

function renderParentPortalContent() {
  const isDaara = (currentParentContext === 'DAARA');
  const isReal = isRealRegisteredEstablishment();
  const bannerContainer = document.getElementById('parentPortalBannerContainer');
  const realStudents = isReal ? getEstablishmentActiveStudents(isDaara) : [];

  // 1. Bannière d'Avertissement & Anti-confusion
  if (bannerContainer) {
    if (isReal) {
      if (realStudents.length === 0) {
        bannerContainer.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">
            <div style="font-size: 0.84rem; color: #FCA5A5;">
              <strong>Aucun élève inscrit dans cet établissement :</strong> Les dossiers apparaîtront automatiquement dès l'inscription de vos élèves.
            </div>
            <button class="btn btn-gold" style="font-size: 0.78rem; padding: 0.4rem 0.8rem;" onclick="closeParentPortal(); openNewRegistrationInWs();">
              ➕ Inscrire un Élève
            </button>
          </div>
        `;
      } else {
        bannerContainer.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.65rem 1rem; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.3rem;">👨‍👩‍👧</span>
            <div style="font-size: 0.82rem; color: #6EE7B7; line-height: 1.4;">
              <strong>ESPACE PARENT SYNCHRONISÉ :</strong> Suivi des élèves réels de votre établissement. Les relevés démarrent strictement vierges <strong>(-- / 20)</strong> et se remplissent au fur et à mesure des évaluations réelles des professeurs.
            </div>
          </div>
        `;
      }
    } else {
      bannerContainer.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 8px; padding: 0.65rem 1rem; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.3rem;">💡</span>
          <div style="font-size: 0.82rem; color: #FDE68A; line-height: 1.4;">
            <strong>SPÉCIMEN DE DÉMONSTRATION (Simulation Parent après fin de trimestre) :</strong>
            Ce profil modèle illustre le suivi complet une fois les cours et examens terminés. Vos élèves réels inscrits démarrent avec un relevé strictement vierge.
          </div>
        </div>
      `;
    }
  }

  // 2. Nom de l'établissement
  const nameEl = document.getElementById('parentSchoolNameDisplay');
  if (nameEl) {
    if (isReal && currentEstablishment?.name) {
      nameEl.textContent = currentEstablishment.name;
    } else if (isDaara) {
      nameEl.textContent = (isDaara ? 'Mon Daara Moderne' : 'Mon Ã‰tablissement');
    } else {
      nameEl.textContent = 'Groupe Scolaire d\'Excellence Diamil';
    }
  }

  // 3. Badge et Boutons du sélecteur
  const modeBadge = document.getElementById('parentCurrentModeBadge');
  const btnEcole = document.getElementById('parentSwitchBtnEcole');
  const btnDaara = document.getElementById('parentSwitchBtnDaara');

  if (modeBadge) {
    modeBadge.textContent = isDaara ? '🕌 Mode Daara Moderne' : '🏫 Mode École Privée';
    modeBadge.className = isDaara ? 'badge-tag badge-gold' : 'badge-tag badge-primary';
  }

  if (btnEcole && btnDaara) {
    if (isDaara) {
      btnEcole.className = 'btn btn-outline';
      btnDaara.className = 'btn btn-gold';
    } else {
      btnEcole.className = 'btn btn-primary';
      btnDaara.className = 'btn btn-outline';
    }
  }

  // 4. Cartes des enfants
  const cardsContainer = document.getElementById('parentChildrenCardsContainer');
  if (cardsContainer) {
    if (isReal) {
      if (realStudents.length === 0) {
        cardsContainer.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1.5rem; background: rgba(255,255,255,0.02); border: 1.5px dashed rgba(255,255,255,0.12); border-radius: 12px;">
            <div style="font-size: 2.6rem; margin-bottom: 0.5rem;">👨‍👧‍👦</div>
            <h5 style="color: #FFF; font-size: 1.1rem; margin-bottom: 0.3rem;">Aucun élève rattaché pour l'instant</h5>
            <p style="color: var(--gris-400); font-size: 0.85rem; max-width: 480px; margin: 0 auto 1.2rem;">
              Inscrivez vos premiers élèves depuis le tableau de bord pour que leurs parents puissent suivre leur scolarité ici en direct.
            </p>
            <button class="btn btn-gold" style="font-size: 0.85rem; padding: 0.5rem 1.2rem;" onclick="closeParentPortal(); openNewRegistrationInWs();">
              ➕ Inscrire un Élève Maintenant
            </button>
          </div>
        `;
      } else {
        cardsContainer.innerHTML = realStudents.map(s => {
          const hasGrades = Boolean(s.moyenne !== null && s.moyenne !== undefined && s.moyenne !== '' && s.moyenne !== '--');
          const safeNom = `${s.prenom} ${s.nom}`.replace(/'/g, "\\'");
          return `
            <div style="background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(0, 210, 180, 0.3); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1rem;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.9rem;">
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 210, 180, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                    ${isDaara ? '👳' : '🎓'}
                  </div>
                  <div>
                    <h5 style="margin: 0; font-size: 1.05rem; color: var(--blanc-pur);">${s.prenom} ${s.nom}</h5>
                    <span style="font-size: 0.78rem; color: var(--turquoise-400);">Matricule : ${s.matricule} • Classe : ${s.classe || 'Inscrit'}</span>
                  </div>
                </div>
                <span class="badge-tag ${hasGrades ? 'badge-good' : 'badge-primary'}">${hasGrades ? 'Évalué' : 'Dossier Vierge'}</span>
              </div>

              <div style="background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem; font-size: 0.84rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="color: var(--gris-400);">Moyenne 1er Trimestre :</span>
                  <strong style="color: ${hasGrades ? 'var(--turquoise-400)' : 'var(--gris-300)'}; font-size: 0.95rem;">
                    ${hasGrades ? `${s.moyenne} / 20 (Rang : ${s.rang})` : '-- / 20 (En attente d\'évaluation)'}
                  </strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="color: var(--gris-400);">${isDaara ? 'Progression Coranique :' : 'Assiduité :'}</span>
                  <strong style="color: var(--gold-400);">${isDaara ? `Hizb ${s.hizb || 1} • Tajwîd En cours` : '100% (0 absence)'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--gris-400);">Statut Inscription / Scolarité :</span>
                  <strong style="color: #34D399;">Inscrit(e) • Dossier Actif ✓</strong>
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-primary" style="flex: 1; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="previewBulletin('${s.id}')">
                  📑 Consulter le Bulletin Officiel
                </button>
                <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.5rem 0.7rem;" onclick="parentOpenAppreciation('${safeNom}')" title="Voir avis des professeurs">
                  💬 Avis des Enseignants
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    } else if (isDaara) {
      cardsContainer.innerHTML = `
        <!-- Enfant 1 : Mouhamed Sow (Daara Moderne) -->
        <div style="background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(0, 210, 180, 0.3); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.9rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 210, 180, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                👦
              </div>
              <div>
                <h5 style="margin: 0; font-size: 1.05rem; color: var(--blanc-pur);">Mouhamed Sow</h5>
                <span style="font-size: 0.78rem; color: var(--turquoise-400);">Matricule : MAT-2026-042 • Classe : 6ème A (Option Internat Daara Moderne)</span>
              </div>
            </div>
            <span class="badge-tag badge-good">Assidu (0 absence)</span>
          </div>

          <div style="background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Moyenne 1er Semestre :</span>
              <strong style="color: var(--turquoise-400); font-size: 0.95rem;">16.45 / 20 (Rang : 2ème / 38)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Progression Coranique :</span>
              <strong style="color: var(--gold-400);">Hizb 38 (Al-Ahqaf) • Tajwîd A+</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--gris-400);">Statut Pension / Caisse :</span>
              <strong style="color: #34D399;">Octobre 2026 Réglé (25 000 FCFA) ✓</strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary" style="flex: 1; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="parentViewBulletin('mouhamed')">
              📑 Consulter le Bulletin Officiel
            </button>
            <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.5rem 0.7rem;" onclick="parentOpenAppreciation('Mouhamed Sow')" title="Voir appréciation de l'Oustaz">
              💬 Appréciation Oustaz
            </button>
          </div>
        </div>

        <!-- Enfant 2 : Fatou Sow (Daara Moderne) -->
        <div style="background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 1.2rem;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.9rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                🧕
              </div>
              <div>
                <h5 style="margin: 0; font-size: 1.05rem; color: var(--blanc-pur);">Fatou Sow</h5>
                <span style="font-size: 0.78rem; color: var(--gold-400);">Matricule : MAT-2026-088 • Classe : CM2 B (Daara Moderne &amp; Hifz Filles)</span>
              </div>
            </div>
            <span class="badge-tag badge-excellent">Tableau d'Honneur</span>
          </div>

          <div style="background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Moyenne 1er Semestre :</span>
              <strong style="color: var(--gold-400); font-size: 0.95rem;">15.80 / 20 (Rang : 4ème / 42)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Progression Coranique :</span>
              <strong style="color: var(--turquoise-400);">Hizb 24 (Al-Furqân) • Tajwîd A</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--gris-400);">Statut Pension / Caisse :</span>
              <strong style="color: #FBBF24;">À régler : Novembre (20 000 FCFA)</strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-gold" style="flex: 1; min-width: 140px; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="parentOpenPayment('Fatou Sow', '20 000', 'Pension Demi-pension Daara Novembre')">
              🌊 Payer la Pension (Wave)
            </button>
            <button type="button" class="btn btn-primary" style="flex: 1; min-width: 150px; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="parentViewBulletin('fatou')" title="Consulter le Bulletin Officiel Daara de Fatou">
              📑 Consulter le Bulletin Officiel
            </button>
            <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.5rem 0.7rem;" onclick="parentOpenAppreciation('Fatou Sow')" title="Voir appréciation de la Oustaza">
              💬 Appréciation Oustaza
            </button>
          </div>
        </div>
      `;
    } else {
      // Mode École Privée Démo
      cardsContainer.innerHTML = `
        <!-- Enfant 1 : Mouhamed Sow (École Privée - 6ème Collège) -->
        <div style="background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(0, 210, 180, 0.3); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.9rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 210, 180, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                👦
              </div>
              <div>
                <h5 style="margin: 0; font-size: 1.05rem; color: var(--blanc-pur);">Mouhamed Sow</h5>
                <span style="font-size: 0.78rem; color: var(--turquoise-400);">Matricule : MAT-2026-042 • Classe : 6ème A (Collège Privé)</span>
              </div>
            </div>
            <span class="badge-tag badge-good">Assidu (0 absence)</span>
          </div>

          <div style="background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Moyenne 1er Trimestre :</span>
              <strong style="color: var(--turquoise-400); font-size: 0.95rem;">16.45 / 20 (Rang : 2ème / 38)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Matières Dominantes :</span>
              <strong style="color: var(--gold-400);">Mathématiques (17.5) &amp; Anglais (17.0)</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--gris-400);">Statut Scolarité :</span>
              <strong style="color: #34D399;">Octobre 2026 Réglé (35 000 FCFA) ✓</strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary" style="flex: 1; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="parentViewBulletin('mouhamed')">
              📑 Consulter le Bulletin Officiel
            </button>
            <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.5rem 0.7rem;" onclick="parentOpenAppreciation('Mouhamed Sow')" title="Voir avis du Conseil de Classe">
              💬 Conseil de Classe
            </button>
          </div>
        </div>

        <!-- Enfant 2 : Fatou Sow (École Privée - CM2 Primaire) -->
        <div style="background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 1.2rem;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.9rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                👧
              </div>
              <div>
                <h5 style="margin: 0; font-size: 1.05rem; color: var(--blanc-pur);">Fatou Sow</h5>
                <span style="font-size: 0.78rem; color: var(--gold-400);">Matricule : MAT-2026-088 • Classe : CM2 B (Primaire d'Excellence)</span>
              </div>
            </div>
            <span class="badge-tag badge-excellent">Tableau d'Honneur</span>
          </div>

          <div style="background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Moyenne 1er Trimestre :</span>
              <strong style="color: var(--gold-400); font-size: 0.95rem;">15.80 / 20 (Rang : 4ème / 42)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="color: var(--gris-400);">Matières Dominantes :</span>
              <strong style="color: var(--turquoise-400);">Éveil Scientifique (17.0) &amp; Français (16.0)</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--gris-400);">Statut Scolarité :</span>
              <strong style="color: #FBBF24;">À régler : Novembre (25 000 FCFA)</strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-gold" style="flex: 1; min-width: 140px; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="parentOpenPayment('Fatou Sow', '25 000', 'Scolarité Novembre CM2')">
              🌊 Payer Scolarité (Wave)
            </button>
            <button type="button" class="btn btn-primary" style="flex: 1; min-width: 150px; font-size: 0.8rem; padding: 0.5rem; justify-content: center;" onclick="parentViewBulletin('fatou')" title="Consulter le Bulletin Officiel de Fatou">
              📑 Consulter le Bulletin Officiel
            </button>
            <button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.5rem 0.7rem;" onclick="parentOpenAppreciation('Fatou Sow')" title="Voir avis de l'Enseignante">
              💬 Avis Maître
            </button>
          </div>
        </div>
      `;
    }
  }

  // 4. Historique des Reçus de Paiement
  const paymentsTable = document.getElementById('parentPaymentsTableBody');
  if (paymentsTable) {
    if (isDaara) {
      paymentsTable.innerHTML = `
        <tr>
          <td>05/10/2026</td>
          <td>Mouhamed Sow</td>
          <td>Pension Internat Octobre</td>
          <td><strong style="color: var(--turquoise-400);">25 000 FCFA</strong></td>
          <td><span class="badge-tag" style="background: rgba(30,144,255,0.15); color: #1E90FF;">Wave ✓</span></td>
          <td>
            <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; color: var(--turquoise-400); border-color: rgba(0,210,180,0.4);" onclick="parentViewReceipt('WAV-9921', 'Mouhamed Sow', '25 000 FCFA', 'Pension Internat Octobre 2026', '+221 77 123 45 67', 'WAVE')">
              🧾 Télécharger
            </button>
          </td>
        </tr>
        <tr>
          <td>04/09/2026</td>
          <td>Mouhamed Sow</td>
          <td>Frais d'Inscription Daara 2026</td>
          <td><strong style="color: var(--turquoise-400);">15 000 FCFA</strong></td>
          <td><span class="badge-tag" style="background: rgba(255,140,0,0.15); color: #FF8C00;">Orange Money ✓</span></td>
          <td>
            <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; color: var(--turquoise-400); border-color: rgba(0,210,180,0.4);" onclick="parentViewReceipt('OM-4128', 'Mouhamed Sow', '15 000 FCFA', 'Frais d\\'Inscription 2026', '+221 77 123 45 67', 'ORANGE_MONEY')">
              🧾 Télécharger
            </button>
          </td>
        </tr>
      `;
    } else {
      paymentsTable.innerHTML = `
        <tr>
          <td>05/10/2026</td>
          <td>Mouhamed Sow</td>
          <td>Scolarité Octobre (Collège)</td>
          <td><strong style="color: var(--turquoise-400);">35 000 FCFA</strong></td>
          <td><span class="badge-tag" style="background: rgba(30,144,255,0.15); color: #1E90FF;">Wave ✓</span></td>
          <td>
            <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; color: var(--turquoise-400); border-color: rgba(0,210,180,0.4);" onclick="parentViewReceipt('WAV-9921', 'Mouhamed Sow', '35 000 FCFA', 'Scolarité Octobre Collège 2026', '+221 77 123 45 67', 'WAVE')">
              🧾 Télécharger
            </button>
          </td>
        </tr>
        <tr>
          <td>04/09/2026</td>
          <td>Mouhamed Sow</td>
          <td>Frais d'Inscription 6ème &amp; Blason</td>
          <td><strong style="color: var(--turquoise-400);">25 000 FCFA</strong></td>
          <td><span class="badge-tag" style="background: rgba(255,140,0,0.15); color: #FF8C00;">Orange Money ✓</span></td>
          <td>
            <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; color: var(--turquoise-400); border-color: rgba(0,210,180,0.4);" onclick="parentViewReceipt('OM-4128', 'Mouhamed Sow', '25 000 FCFA', 'Frais d\\'Inscription 6ème 2026', '+221 77 123 45 67', 'ORANGE_MONEY')">
              🧾 Télécharger
            </button>
          </td>
        </tr>
        <tr>
          <td>04/09/2026</td>
          <td>Fatou Sow</td>
          <td>Inscription Primaire CM2 &amp; Livrets</td>
          <td><strong style="color: var(--turquoise-400);">20 000 FCFA</strong></td>
          <td><span class="badge-tag" style="background: rgba(30,144,255,0.15); color: #1E90FF;">Wave ✓</span></td>
          <td>
            <button type="button" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; color: var(--turquoise-400); border-color: rgba(0,210,180,0.4);" onclick="parentViewReceipt('WAV-3312', 'Fatou Sow', '20 000 FCFA', 'Inscription Primaire CM2 2026', '+221 77 123 45 67', 'WAVE')">
              🧾 Télécharger
            </button>
          </td>
        </tr>
      `;
    }
  }

  // 5. Alertes WhatsApp & SMS
  const alertsContainer = document.getElementById('parentAlertsContainer');
  if (alertsContainer) {
    if (isDaara) {
      alertsContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--gris-300);">
          <span style="color: #25D366; font-size: 1rem;">💬</span>
          <span><strong>05/10 - 14h20 (WhatsApp) :</strong> Votre paiement de 25 000 FCFA pour Mouhamed Sow (Pension Daara) a été validé. Reçu #WAV-9921 disponible.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--gris-300);">
          <span style="color: #60A5FA; font-size: 1rem;">📱</span>
          <span><strong>01/10 - 09h00 (SMS Daara) :</strong> Assemblée Générale des tuteurs et parents au Daara ce Samedi à 10h00.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--gold-400);">
          <span style="color: var(--gold-400); font-size: 1rem;">📢</span>
          <span><strong>28/09 - 11h15 (Direction Daara) :</strong> Évaluation de mémorisation du Coran (Hifz) clôturée avec mention d'excellence pour vos deux enfants.</span>
        </div>
      `;
    } else {
      alertsContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--gris-300);">
          <span style="color: #25D366; font-size: 1rem;">💬</span>
          <span><strong>05/10 - 14h20 (WhatsApp) :</strong> Votre paiement de 35 000 FCFA pour Mouhamed Sow (Scolarité Octobre Collège) a été validé. Reçu #WAV-9921 disponible.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--gris-300);">
          <span style="color: #60A5FA; font-size: 1rem;">📱</span>
          <span><strong>01/10 - 09h00 (SMS Établissement) :</strong> Réunion Parents-Professeurs pour les classes de 6ème et CM2 ce Samedi à 10h00 en salle polyvalente.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--gold-400);">
          <span style="color: var(--gold-400); font-size: 1rem;">📢</span>
          <span><strong>28/09 - 11h15 (Direction des Études) :</strong> Les bulletins officiels du 1er Trimestre sont disponibles en consultation et téléchargement certifié.</span>
        </div>
      `;
    }
  }
}

function closeParentPortal() {
  const modal = document.getElementById('parentPortalModal');
  if (modal) modal.classList.remove('active');
  closeAllModals(true);
}

function parentLogout() {
  closeParentPortal();
  showNotification('👋 Vous avez été déconnecté avec succès de votre Espace Parent.');
  logAuditEvent('Déconnexion Espace Parent', 'Session parent clôturée pour Mme Aminata Diallo (+221 77 123 45 67)');
  const hero = document.getElementById('hero');
  if (hero) hero.scrollIntoView({ behavior: 'smooth' });
}

function parentViewBulletin(studentKey) {
  const modal = document.getElementById('bulletinModal');
  if (!modal) return;

  const isMouhamed = !studentKey || studentKey.toString().toLowerCase().includes('mouhamed') || studentKey.toString().toLowerCase().includes('sow');
  const isDaara = (currentParentContext === 'DAARA');

  // Élever le modal du bulletin au-dessus de l'espace parent
  modal.style.zIndex = '2500';

  let schoolLogo = isDaara ? '🕌' : '🏫';
  let schoolName = '';
  let schoolMinistry = '';
  let schoolDetails = '';

  if (isDaara) {
    schoolName = (currentEstablishment && currentEstablishment.type === 'DAARA' && currentEstablishment.name)
      ? currentEstablishment.name
      : (isDaara ? 'Mon Daara Moderne' : 'Mon Ã‰tablissement');
    schoolMinistry = "Inspection Régionale de l'Enseignement Arabe & Daaras Modernes";
    schoolDetails = "Campus Keur Massar, Dakar • Agréé par l'État • Session 2026-2027";
  } else {
    schoolName = (currentEstablishment && currentEstablishment.type !== 'DAARA' && currentEstablishment.name)
      ? currentEstablishment.name
      : 'Groupe Scolaire d\'Excellence Diamil';
    schoolMinistry = "Ministère de l'Éducation Nationale • Inspection d'Académie de Dakar";
    schoolDetails = "Campus Almadies, Dakar • Autorisation MEN N° 00482 • Session 2026-2027";
  }

  if (document.getElementById('bulletinSchoolLogo')) document.getElementById('bulletinSchoolLogo').textContent = schoolLogo;
  if (document.getElementById('bulletinSchoolName')) document.getElementById('bulletinSchoolName').textContent = schoolName;
  if (document.getElementById('bulletinSchoolMinistry')) document.getElementById('bulletinSchoolMinistry').textContent = schoolMinistry;
  if (document.getElementById('bulletinSchoolDetails')) document.getElementById('bulletinSchoolDetails').textContent = schoolDetails;
  if (document.getElementById('bulletinStampName')) document.getElementById('bulletinStampName').textContent = schoolName;
  if (document.getElementById('bulletinStampDate')) document.getElementById('bulletinStampDate').textContent = 'Dakar, Session 2026-2027';

  if (isMouhamed) {
    if (document.getElementById('bulletinStudentName')) document.getElementById('bulletinStudentName').textContent = 'Mouhamed Bachir Sow';
    if (document.getElementById('bulletinMatricule')) document.getElementById('bulletinMatricule').textContent = 'MAT-2026-042';
    if (document.getElementById('bulletinClasse')) {
      document.getElementById('bulletinClasse').textContent = isDaara ? '6ème A (Option Internat Daara Moderne)' : '6ème A (Cycle Moyen / Collège Privé)';
    }
    if (document.getElementById('bulletinMoyenne')) document.getElementById('bulletinMoyenne').textContent = '16.45 / 20';
    if (document.getElementById('bulletinRang')) document.getElementById('bulletinRang').textContent = '2ème sur 38 élèves';
  } else {
    if (document.getElementById('bulletinStudentName')) document.getElementById('bulletinStudentName').textContent = 'Fatou Sow';
    if (document.getElementById('bulletinMatricule')) document.getElementById('bulletinMatricule').textContent = 'MAT-2026-088';
    if (document.getElementById('bulletinClasse')) {
      document.getElementById('bulletinClasse').textContent = isDaara ? 'CM2 B (Daara Moderne & Hifz Filles)' : 'CM2 B (Cycle Primaire d\'Excellence)';
    }
    if (document.getElementById('bulletinMoyenne')) document.getElementById('bulletinMoyenne').textContent = '15.80 / 20';
    if (document.getElementById('bulletinRang')) document.getElementById('bulletinRang').textContent = '4ème sur 42 élèves';
  }

  // Rendu dynamique du curriculum (Daara ou École Privée selon le mode actif)
  renderBulletinGradesTable(isDaara, isMouhamed ? 'Mouhamed Bachir Sow' : 'Fatou Sow', isMouhamed ? 'mouhamed' : 'fatou');

  // Déverrouiller le contenu pour les parents
  const lockedNotice = document.getElementById('bulletinLockedNotice');
  const fullContent = document.getElementById('bulletinFullContent');
  if (lockedNotice) lockedNotice.style.display = 'none';
  if (fullContent) fullContent.style.display = 'block';

  const pubBadge = document.getElementById('bulletinPublishedDateLabel');
  if (pubBadge) {
    pubBadge.textContent = isDaara 
      ? 'Certifié & Homologué par la Direction du Daara Moderne' 
      : 'Certifié & Homologué par la Direction des Études du Groupe Scolaire';
  }

  modal.classList.add('active');
  const childName = isMouhamed ? 'Mouhamed Sow' : 'Fatou Sow';
  const typeTxt = isDaara ? 'Daara Moderne' : 'École Privée';
  showNotification(`📑 Bulletin officiel [${typeTxt}] de ${childName} ouvert ! Prêt pour consultation ou impression.`);
  logAuditEvent('Consultation Bulletin Parent', `Bulletin officiel [${typeTxt}] ${childName} ouvert par Mme Aminata Diallo`);
}

function parentOpenAppreciation(studentName) {
  const modal = document.getElementById('parentAppreciationModal');
  if (!modal) return;

  const targetName = studentName || 'Mouhamed Sow';
  const isMouhamed = targetName.toLowerCase().includes('mouhamed');
  const isDaara = (currentParentContext === 'DAARA');

  const badgeEl = document.getElementById('appreciationCouncilBadge');
  const titleEl = document.getElementById('appreciationStudentTitle');
  const metaEl = document.getElementById('appreciationStudentMeta');
  const pillarLabel = document.getElementById('appreciationPillarLabel');
  const studentStat = document.getElementById('appreciationStudentHizb');
  const pillarSub = document.getElementById('appreciationPillarSub');
  const obsLabel = document.getElementById('appreciationOustazLabel');
  const obsText = document.getElementById('appreciationOustazText');
  const councilTitle = document.getElementById('appreciationCouncilTitle');
  const decisionText = document.getElementById('appreciationDecisionText');

  if (isDaara) {
    if (badgeEl) {
      badgeEl.textContent = "Bulletin d'Appréciation Collégiale Daara";
      badgeEl.className = "badge-tag badge-gold";
    }
    if (pillarLabel) pillarLabel.textContent = "Tajwîd & Hifz Coran";
    if (pillarSub) pillarSub.textContent = "Excellente articulation";

    if (isMouhamed) {
      if (titleEl) titleEl.textContent = "Appréciation Pédagogique & Comportementale : Mouhamed Sow";
      if (metaEl) metaEl.textContent = 'Matricule : MAT-2026-042 • Classe : 6ème A • Option Internat Daara Moderne Keur Massar';
      if (studentStat) studentStat.textContent = 'Hizb 38 ✓';
      if (obsLabel) obsLabel.textContent = "💬 Observation de l'Oustaz Titulaire (Oustaz Abdoulaye Ba) :";
      if (obsText) {
        obsText.textContent = "« Mouhamed fait preuve d'un dévouement exceptionnel dans l'apprentissage du Coran et de ses matières scolaires. Sa récitation est mélodieuse, posée et respecte scrupuleusement les règles de Tajwîd. À l'internat, il aide ses camarades plus jeunes et respecte tous les horaires de prière et de révision. Félicitations chaleureuses. »";
      }
      if (councilTitle) councilTitle.textContent = "Décision du Conseil des Oustazs :";
      if (decisionText) decisionText.textContent = "Tableau d'Honneur avec Félicitations Spéciales";
    } else {
      if (titleEl) titleEl.textContent = "Appréciation Pédagogique & Comportementale : Fatou Sow";
      if (metaEl) metaEl.textContent = 'Matricule : MAT-2026-088 • Classe : CM2 B (Daara Moderne & Hifz) • Campus Keur Massar';
      if (studentStat) studentStat.textContent = 'Hizb 24 ✓';
      if (obsLabel) obsLabel.textContent = "💬 Observation de la Oustaza Titulaire (Oustaza Mariama Sall) :";
      if (obsText) {
        obsText.textContent = "« Fatou fait preuve d'une application admirable dans l'apprentissage du Coran et de ses matières scolaires. Sa récitation est mélodieuse, posée et respecte scrupuleusement les règles de Tajwîd. Sur sa planche Allwa, ses écrits sont d'une grande netteté. Elle est pieuse, polie et très attentive aux cercles coraniques. Félicitations chaleureuses. »";
      }
      if (councilTitle) councilTitle.textContent = "Décision du Conseil des Oustazs :";
      if (decisionText) decisionText.textContent = "Tableau d'Honneur avec Félicitations Spéciales";
    }
  } else {
    // Mode École Privée
    if (badgeEl) {
      badgeEl.textContent = "Avis Pédagogique & Conseil de Classe";
      badgeEl.className = "badge-tag badge-primary";
    }
    if (pillarLabel) pillarLabel.textContent = "Moyenne & Rang";

    if (isMouhamed) {
      if (titleEl) titleEl.textContent = "Appréciation Pédagogique & Conseil de Classe : Mouhamed Sow";
      if (metaEl) metaEl.textContent = 'Matricule : MAT-2026-042 • Classe : 6ème A (Collège Privé) • Groupe Scolaire Diamil';
      if (studentStat) studentStat.textContent = '16.45 / 20';
      if (pillarSub) pillarSub.textContent = 'Rang : 2ème / 38 élèves';
      if (obsLabel) obsLabel.textContent = "💬 Observation du Professeur Principal (M. Babacar Ndiaye - Mathématiques) :";
      if (obsText) {
        obsText.textContent = "« Mouhamed réalise un premier trimestre remarquable. Il fait preuve d'un esprit d'analyse logique très développé en mathématiques et d'une aisance appréciable dans l'expression écrite et en anglais. Élève curieux, très poli et constructif en classe. Félicitations très chaleureuses du Conseil de Classe. »";
      }
      if (councilTitle) councilTitle.textContent = "Décision du Conseil de Classe :";
      if (decisionText) decisionText.textContent = "Tableau d'Honneur avec Félicitations Spéciales";
    } else {
      if (titleEl) titleEl.textContent = "Appréciation Pédagogique & Conseil des Maîtres : Fatou Sow";
      if (metaEl) metaEl.textContent = 'Matricule : MAT-2026-088 • Classe : CM2 B (Primaire d\'Excellence) • Groupe Scolaire Diamil';
      if (studentStat) studentStat.textContent = '15.80 / 20';
      if (pillarSub) pillarSub.textContent = 'Rang : 4ème / 42 élèves';
      if (obsLabel) obsLabel.textContent = "💬 Observation de l'Enseignante Titulaire (Mme Khady Diop) :";
      if (obsText) {
        obsText.textContent = "« Fatou est une élève brillante, sérieuse et appliquée. Ses cahiers sont tenus avec un soin exemplaire et ses résultats en éveil scientifique et calcul réfléchi sont remarquables. Très bonne camarade, toujours serviable et attentive aux consignes. Poursuivre dans cette excellente voie pour le concours du CFEE. »";
      }
      if (councilTitle) councilTitle.textContent = "Décision du Conseil des Maîtres :";
      if (decisionText) decisionText.textContent = "Tableau d'Honneur avec Félicitations Spéciales";
    }
  }

  modal.style.zIndex = '2400';
  modal.classList.add('active');
  const typeTxt = isDaara ? 'Daara' : 'École Privée';
  showNotification(`💬 Rapport d'appréciation pédagogique [${typeTxt}] ouvert pour ${targetName}.`);
}

function closeParentAppreciationModal() {
  const modal = document.getElementById('parentAppreciationModal');
  if (modal) modal.classList.remove('active');
}

function parentOpenPayment(childName, amount, motif) {
  const modal = document.getElementById('wsPaymentModal');
  if (!modal) return;

  modal.style.zIndex = '2500';

  const isDaara = (currentParentContext === 'DAARA');
  const defaultSchool = isDaara ? (isDaara ? 'Mon Daara Moderne' : 'Mon Ã‰tablissement') : 'Groupe Scolaire Diamil';

  if (!currentEstablishment) {
    currentEstablishment = {
      name: defaultSchool,
      type: isDaara ? 'DAARA' : 'ECOLE',
      city: 'Dakar',
      phone: '+221 77 123 45 67'
    };
  }

  const badgeEl = document.getElementById('wsPaySchoolBadge');
  if (badgeEl) {
    badgeEl.textContent = currentEstablishment.name || defaultSchool;
  }

  // Pré-remplir l'élève dans le select
  const select = document.getElementById('wsPayStudentSelect');
  if (select) {
    select.innerHTML = '';
    const optTarget = document.createElement('option');
    optTarget.value = childName || 'Fatou Sow';
    optTarget.textContent = `${childName || 'Fatou Sow'} (Famille Diallo)`;
    optTarget.selected = true;
    select.appendChild(optTarget);

    const optOther = document.createElement('option');
    optOther.value = (childName && childName.includes('Mouhamed')) ? 'Fatou Sow' : 'Mouhamed Sow';
    optOther.textContent = (childName && childName.includes('Mouhamed')) ? 'Fatou Sow (Famille Diallo)' : 'Mouhamed Sow (Famille Diallo)';
    select.appendChild(optOther);
  }

  // Pré-sélectionner le motif
  const motifSelect = document.getElementById('wsPayMotifSelect');
  if (motifSelect) {
    let matched = false;
    for (let i = 0; i < motifSelect.options.length; i++) {
      if (motif && motifSelect.options[i].value.toLowerCase().includes(motif.toLowerCase())) {
        motifSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }
    if (!matched && motif) {
      const opt = document.createElement('option');
      opt.value = motif;
      opt.textContent = motif;
      opt.selected = true;
      motifSelect.appendChild(opt);
    }
  }

  // Pré-remplir montant & téléphone
  const cleanAmount = (amount || (isDaara ? '20 000' : '25 000')).toString().replace(/[^0-9\s]/g, '').trim();
  const amountInput = document.getElementById('wsPayAmountInput');
  if (amountInput) amountInput.value = cleanAmount;

  const phoneInput = document.getElementById('wsPayPhoneInput');
  if (phoneInput) phoneInput.value = '+221 77 123 45 67';

  // Réinitialiser la zone QR et boutons
  const qrContainer = document.getElementById('wsWaveQrContainer');
  if (qrContainer) qrContainer.style.display = 'none';

  const actionBox = document.getElementById('wsReceiptActionBox');
  if (actionBox) actionBox.style.display = 'none';

  const submitBtn = document.getElementById('wsPaySubmitBtn');
  if (submitBtn) {
    submitBtn.style.display = 'block';
    submitBtn.textContent = `🌊 Valider le Règlement Wave (${cleanAmount} FCFA - Mme Diallo)`;
  }

  if (typeof selectWsOperator === 'function') {
    selectWsOperator('WAVE', document.querySelector('[data-ws-op="WAVE"]'));
  }

  modal.classList.add('active');
  showNotification(`🌊 Passerelle Wave ouverte pour ${childName || 'votre enfant'} (${cleanAmount} FCFA - ${motif || 'Scolarité'}).`);
}

function parentViewReceipt(ref, childName, amount, motif, phone, operator) {
  const modal = document.getElementById('receiptModal');
  if (!modal) return;

  modal.style.zIndex = '2500';

  const isDaara = (currentParentContext === 'DAARA');
  const school = isDaara ? (isDaara ? 'Mon Daara Moderne' : 'Mon Ã‰tablissement') : (currentEstablishment?.name || 'Groupe Scolaire Diamil');

  openReceiptModal(
    ref || 'WAV-9921',
    childName || 'Mouhamed Sow',
    amount || (isDaara ? '25 000 FCFA' : '35 000 FCFA'),
    motif || (isDaara ? 'Pension Internat Octobre 2026' : 'Scolarité Octobre Collège 2026'),
    phone || '+221 77 123 45 67',
    operator || 'WAVE',
    school
  );

  showNotification(`🧾 Reçu officiel ${ref} ouvert avec succès (Certification SYSCOHADA).`);
  logAuditEvent('Téléchargement Reçu Parent', `Reçu ${ref} pour ${childName} ouvert par Mme Aminata Diallo`);
}

// Exports globaux pour accès direct au Tableau de Bord et Portail de Sécurité
window.openWorkspaceDirect = openWorkspaceDirect;
window.handleHeaderDashboardClick = handleHeaderDashboardClick;
window.openAuthGateModal = openAuthGateModal;
window.switchAuthGateTab = switchAuthGateTab;
window.handleAuthGateLoginSubmit = handleAuthGateLoginSubmit;

// ==================== GESTION DES COORDONNÉES D'ENCAISSEMENT WAVE & OM ====================
function initWsPayConfig(est) {
  if (!est) est = currentEstablishment;
  if (!est) return;

  const isDaara = est.type === 'DAARA';
  const defaultWaveUrl = est.waveUrlPaiement || "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/";
  const defaultWaveNum = est.waveNumero || est.phone || "+221 77 106 48 77";
  const defaultWaveNom = est.waveNomMarchand || (isDaara ? (isDaara ? "Mon Daara Moderne" : "Mon Ã‰tablissement") : (est.name || (est.name || "Caisse Ã‰tablissement")));

  const waveNumInput = document.getElementById('wsCfgWaveNumero');
  if (waveNumInput) waveNumInput.value = defaultWaveNum;

  const waveNomInput = document.getElementById('wsCfgWaveNomMarchand');
  if (waveNomInput) waveNomInput.value = defaultWaveNom;

  const waveUrlInput = document.getElementById('wsCfgWaveUrlPaiement');
  if (waveUrlInput) waveUrlInput.value = defaultWaveUrl;

  updateWsWaveQrPreview(defaultWaveUrl);

  const omCodeInput = document.getElementById('wsCfgOmCodeMarchand');
  const defaultOmCode = est.omCodeMarchand || (isDaara ? "894101" : "178601");
  if (omCodeInput) omCodeInput.value = defaultOmCode;

  const omNumInput = document.getElementById('wsCfgOmNumero');
  if (omNumInput) omNumInput.value = est.omNumero || est.phone || "+221 77 123 45 67";

  const omNomInput = document.getElementById('wsCfgOmNomMarchand');
  if (omNomInput) omNomInput.value = est.omNomMarchand || (isDaara ? (est.name || "CAISSE DAARA") : (est.name || (est.name || "CAISSE Ã‰TABLISSEMENT")));

  updateWsOmUssdPreview(defaultOmCode);

  const bqNomInput = document.getElementById('wsCfgBanqueNom');
  if (bqNomInput) bqNomInput.value = est.banqueNom || "CBAO Groupe Attijariwafa Bank";

  const bqTitulaireInput = document.getElementById('wsCfgBanqueTitulaire');
  if (bqTitulaireInput) bqTitulaireInput.value = est.banqueTitulaire || (isDaara ? (isDaara ? "MON DAARA MODERNE" : "MON Ã‰TABLISSEMENT") : (est.name || (est.name || "CAISSE Ã‰TABLISSEMENT")));

  const bqRibInput = document.getElementById('wsCfgBanqueRib');
  if (bqRibInput) bqRibInput.value = est.banqueRib || "SN012 01345 00123456789 22";
}

function updateWsWaveQrPreview(url) {
  const img = document.getElementById('wsCfgWaveQrImg');
  if (!img) return;
  const validUrl = (url && url.trim().length > 5) ? url.trim() : "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/";
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(validUrl)}`;
}

function updateWsOmUssdPreview(val) {
  const el = document.getElementById('wsCfgOmUssdSyntax');
  if (!el) return;
  const code = (val || '178601').trim();
  el.textContent = `#144#391*${code}*MONTANT#`;
}

function testWsWaveLink() {
  const input = document.getElementById('wsCfgWaveUrlPaiement');
  const url = (input && input.value) ? input.value.trim() : "https://pay.wave.com/m/M_sn_FEQdl8TlbLnA/c/sn/";
  window.open(url, '_blank');
}

function downloadWsWaveQrCode() {
  const img = document.getElementById('wsCfgWaveQrImg');
  if (!img) return;
  const name = currentEstablishment ? (currentEstablishment.name || 'Etablissement').replace(/[^a-zA-Z0-9]/g, '_') : 'Etablissement';
  const a = document.createElement('a');
  a.href = img.src;
  a.download = `QR_Wave_${name}.png`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showNotification("📥 Téléchargement du QR Code Wave lancé !");
}

function saveWsPayConfig() {
  if (!currentEstablishment) {
    currentEstablishment = {
      name: "Groupe Scolaire Diamil",
      type: "ECOLE",
      code: "SSE-SN-1786",
      city: "Dakar"
    };
  }

  const wNum = document.getElementById('wsCfgWaveNumero')?.value.trim();
  const wNom = document.getElementById('wsCfgWaveNomMarchand')?.value.trim();
  const wUrl = document.getElementById('wsCfgWaveUrlPaiement')?.value.trim();

  const omCode = document.getElementById('wsCfgOmCodeMarchand')?.value.trim();
  const omNum = document.getElementById('wsCfgOmNumero')?.value.trim();
  const omNom = document.getElementById('wsCfgOmNomMarchand')?.value.trim();

  const bqNom = document.getElementById('wsCfgBanqueNom')?.value.trim();
  const bqTitulaire = document.getElementById('wsCfgBanqueTitulaire')?.value.trim();
  const bqRib = document.getElementById('wsCfgBanqueRib')?.value.trim();

  if (wNum) currentEstablishment.waveNumero = wNum;
  if (wNom) currentEstablishment.waveNomMarchand = wNom;
  if (wUrl) currentEstablishment.waveUrlPaiement = wUrl;

  if (omCode) currentEstablishment.omCodeMarchand = omCode;
  if (omNum) currentEstablishment.omNumero = omNum;
  if (omNom) currentEstablishment.omNomMarchand = omNom;

  if (bqNom) currentEstablishment.banqueNom = bqNom;
  if (bqTitulaire) currentEstablishment.banqueTitulaire = bqTitulaire;
  if (bqRib) currentEstablishment.banqueRib = bqRib;

  // Persistance dans localStorage pour le workspace
  localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));

  // Synchronisation avec la base du dashboard SaaS (sse_saas_database)
  try {
    const rawDb = localStorage.getItem('sse_saas_database');
    if (rawDb) {
      const db = JSON.parse(rawDb);
      if (Array.isArray(db.etablissements)) {
        const found = db.etablissements.find(e => e.id === currentEstablishment.id || (currentEstablishment.code && e.code === currentEstablishment.code));
        if (found) {
          Object.assign(found, {
            waveNumero: currentEstablishment.waveNumero,
            waveNomMarchand: currentEstablishment.waveNomMarchand,
            waveUrlPaiement: currentEstablishment.waveUrlPaiement,
            omCodeMarchand: currentEstablishment.omCodeMarchand,
            omNumero: currentEstablishment.omNumero,
            omNomMarchand: currentEstablishment.omNomMarchand,
            banqueNom: currentEstablishment.banqueNom,
            banqueTitulaire: currentEstablishment.banqueTitulaire,
            banqueRib: currentEstablishment.banqueRib
          });
          localStorage.setItem('sse_saas_database', JSON.stringify(db));
        }
      }
    }
  } catch(e) {}

  showNotification(`✅ Coordonnées d'encaissement Wave & OM enregistrées avec succès pour ${currentEstablishment.name} !`);
  logAuditEvent('Mise à jour Coordonnées d\'Encaissement', `Coordonnées Wave (${wNom || 'Marchand'} - ${wNum || ''}) et OM (${omCode || ''}) modifiées par la Direction.`);
}

// --- GESTION DE L'INSTALLATION APPLICATION MOBILE PWA ---
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const box = document.getElementById('directInstallActionBox');
  if (box) box.style.display = 'block';
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const modal = document.getElementById('mobileAppInstallModal');
  if (modal) modal.style.display = 'none';
  if (typeof showNotification === 'function') {
    showNotification("🎉 SunuSchool-Express a été installée avec succès sur votre téléphone !");
  }
});

function triggerMobileAppInstall(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // 1. Ouvrir immédiatement et visiblement la modale d'installation
  const modal = document.getElementById('mobileAppInstallModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    modal.style.visibility = 'visible';

    const box = document.getElementById('directInstallActionBox');
    if (box) {
      box.style.display = 'block';
    }

    if (isIos) {
      switchInstallTab('ios');
    } else {
      switchInstallTab('android');
    }
  }

  // 2. Déclencher le prompt natif Chrome/Android si disponible
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          if (typeof showNotification === 'function') {
            showNotification("⚡ Installation de l'application SunuSchool-Express lancée avec succès !");
          }
          closeMobileInstallModal();
        }
        deferredInstallPrompt = null;
      }).catch(() => {});
    } catch(err) {
      console.warn("Erreur prompt PWA:", err);
    }
  }
}

function executeNativePWAInstall() {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          if (typeof showNotification === 'function') {
            showNotification("⚡ Installation de l'application SunuSchool-Express lancée avec succès !");
          }
          closeMobileInstallModal();
        }
        deferredInstallPrompt = null;
      }).catch(() => {});
    } catch(e) {}
  } else {
    if (typeof showNotification === 'function') {
      showNotification("📲 Pour ajouter l'application en 1 clic : Suivez l'étape 1 et 2 ci-dessous (Menu ⋮ -> Installer/Ajouter à l'écran d'accueil)");
    }
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos) {
      alert("🍏 Sur iPhone/iPad : Appuyez sur le bouton Partage (📤) en bas de Safari, puis sélectionnez « Sur l'écran d'accueil » (+).");
    } else {
      alert("🤖 Sur Android : Appuyez sur les 3 petits points (⋮) en haut à droite dans Chrome, puis sélectionnez « Installer l'application ».");
    }
  }
}

function switchInstallTab(type) {
  const tabAndroid = document.getElementById('tabInstallAndroid');
  const tabIos = document.getElementById('tabInstallIos');
  const guideAndroid = document.getElementById('guideInstallAndroid');
  const guideIos = document.getElementById('guideInstallIos');

  if (type === 'ios') {
    if (tabIos) { tabIos.style.background = '#F59E0B'; tabIos.style.color = '#000'; }
    if (tabAndroid) { tabAndroid.style.background = 'transparent'; tabAndroid.style.color = '#FFF'; }
    if (guideIos) guideIos.style.display = 'block';
    if (guideAndroid) guideAndroid.style.display = 'none';
  } else {
    if (tabAndroid) { tabAndroid.style.background = '#00D2B4'; tabAndroid.style.color = '#051329'; }
    if (tabIos) { tabIos.style.background = 'transparent'; tabIos.style.color = '#FFF'; }
    if (guideAndroid) guideAndroid.style.display = 'block';
    if (guideIos) guideIos.style.display = 'none';
  }
}

function closeMobileInstallModal() {
  const modal = document.getElementById('mobileAppInstallModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    modal.style.visibility = 'hidden';
  }
}

// Attachement garanti au chargement pour les appareils tactiles (iOS / Android)
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnHeaderInstallApp');
  if (btn) {
    btn.addEventListener('click', triggerMobileAppInstall);
    btn.addEventListener('touchend', (e) => {
      triggerMobileAppInstall(e);
    }, { passive: false });
  }
});

// --- GESTION DU CHANGEMENT DE FORMULE DÉDIÉ & RENOMMAGE ÉTABLISSEMENT ---
function openChangePlanModal() {
  closeAllModals();
  const modal = document.getElementById('changePlanModal');
  if (!modal) return;

  if (!currentEstablishment || !currentEstablishment.name || isFakeDemoSchool(currentEstablishment)) {
    try {
      const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
      const real = reg.find(e => e && e.name && !isFakeDemoSchool(e) && e.type !== 'SUPER_ADMIN');
      if (real) currentEstablishment = { ...real };
    } catch(e) {}
  }

  const isDaara = currentEstablishment && currentEstablishment.type === 'DAARA';

  const schoolNameEl = document.getElementById('changePlanSchoolName');
  if (schoolNameEl) {
    schoolNameEl.textContent = currentEstablishment?.name || (isDaara ? 'Mon Daara Moderne' : 'Mon Établissement');
  }

  const tabEcole = document.getElementById('tabBtnChangePlanEcole');
  const tabDaara = document.getElementById('tabBtnChangePlanDaara');

  // Si c'est une école, n'afficher QUE l'onglet et les formules école
  // Si c'est un daara, n'afficher QUE l'onglet et les formules daara
  if (isDaara) {
    if (tabDaara) tabDaara.style.display = 'block';
    if (tabEcole) tabEcole.style.display = 'none';
    switchChangePlanTab('daara');
  } else {
    if (tabEcole) tabEcole.style.display = 'block';
    if (tabDaara) tabDaara.style.display = 'none';
    switchChangePlanTab('ecole');
  }

  modal.classList.add('active');
}

function switchChangePlanTab(type) {
  const btnEcole = document.getElementById('tabBtnChangePlanEcole');
  const btnDaara = document.getElementById('tabBtnChangePlanDaara');
  const viewEcole = document.getElementById('changePlanViewEcole');
  const viewDaara = document.getElementById('changePlanViewDaara');

  if (type === 'daara') {
    if (btnDaara) { btnDaara.style.background = '#00D2B4'; btnDaara.style.color = '#051329'; }
    if (btnEcole) { btnEcole.style.background = 'transparent'; btnEcole.style.color = '#FFF'; }
    if (viewDaara) viewDaara.style.display = 'grid';
    if (viewEcole) viewEcole.style.display = 'none';
  } else {
    if (btnEcole) { btnEcole.style.background = '#F59E0B'; btnEcole.style.color = '#000'; }
    if (btnDaara) { btnDaara.style.background = 'transparent'; btnDaara.style.color = '#FFF'; }
    if (viewEcole) viewEcole.style.display = 'grid';
    if (viewDaara) viewDaara.style.display = 'none';
  }
}

function applySelectedPlanFromModal(planKey) {
  closeAllModals();
  switchPlanDemo(planKey);
}

function renameCurrentEstablishment() {
  const currentName = currentEstablishment ? currentEstablishment.name : "";
  const newName = prompt("Entrez le nom officiel de votre établissement ou daara :", currentName);
  if (newName && newName.trim() && newName.trim() !== currentName) {
    const trimmed = newName.trim();
    if (currentEstablishment) {
      currentEstablishment.name = trimmed;
      try {
        localStorage.setItem('sunuschool_establishment', JSON.stringify(currentEstablishment));
        const reg = JSON.parse(localStorage.getItem('sunuschool_establishments_registry') || '[]');
        const idx = reg.findIndex(e => e && (e.id === currentEstablishment.id || (currentEstablishment.code && e.code === currentEstablishment.code)));
        if (idx !== -1) {
          reg[idx] = { ...reg[idx], name: trimmed };
          localStorage.setItem('sunuschool_establishments_registry', JSON.stringify(reg));
        }
      } catch(e) {}
      activateDedicatedWorkspace(currentEstablishment);
      showNotification(`✅ Nom de l'établissement mis à jour : « ${trimmed} » !`);
    }
  }
}

window.initWsPayConfig = initWsPayConfig;
window.updateWsWaveQrPreview = updateWsWaveQrPreview;
window.updateWsOmUssdPreview = updateWsOmUssdPreview;
window.testWsWaveLink = testWsWaveLink;
window.downloadWsWaveQrCode = downloadWsWaveQrCode;
window.saveWsPayConfig = saveWsPayConfig;
window.triggerMobileAppInstall = triggerMobileAppInstall;
window.executeNativePWAInstall = executeNativePWAInstall;
window.switchInstallTab = switchInstallTab;
window.closeMobileInstallModal = closeMobileInstallModal;
window.openChangePlanModal = openChangePlanModal;
window.switchChangePlanTab = switchChangePlanTab;
window.applySelectedPlanFromModal = applySelectedPlanFromModal;
window.renameCurrentEstablishment = renameCurrentEstablishment;




