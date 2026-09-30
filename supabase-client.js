/**
 * SunuSchoolExpress - Supabase Frontend Bridge
 * Permet au navigateur (Mobile & PC) de se synchroniser directement avec la base Supabase Cloud
 */

(function () {
  const SUPABASE_URL = 'https://hwrnkjzkwzlzzocfnxww.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cm5ranprd3psenpvY2ZueHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDUzMDgsImV4cCI6MjEwNjE4MTMwOH0.hkDRg0Tl36OPnSkd0SbCttp3cnUY53JJzluXrLasCP4';

  async function apiRequest(path, method = 'GET', body = null, extraHeaders = {}) {
    try {
      const url = `${SUPABASE_URL}${path}`;
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...extraHeaders
      };

      const options = {
        method,
        headers
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      if (!res.ok) {
        console.warn(`[Supabase Frontend] Erreur ${res.status} sur ${method} ${path}`);
        return null;
      }

      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.warn(`[Supabase Frontend] Erreur réseau :`, err.message);
      return null;
    }
  }

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

  window.SSE_SUPABASE = {
    // 1. Récupérer tous les établissements depuis le Cloud
    async getEtablissements() {
      const rows = await apiRequest('/rest/v1/etablissements?select=*&order=created_at.desc');
      if (!Array.isArray(rows)) return null;
      return rows.map(toAppEtab);
    },

    // 2. Enregistrer ou mettre à jour un établissement dans Supabase
    async saveEtablissement(etab) {
      const payload = toSupabaseEtab(etab);
      if (!payload || !payload.id) return false;

      // Éviter l'erreur 409 Conflict : si un établissement avec le même code ou id existe déjà, faire un update (PATCH)
      try {
        const query = payload.code 
          ? `?or=(id.eq.${encodeURIComponent(payload.id)},code.eq.${encodeURIComponent(payload.code)})&limit=1`
          : `?id=eq.${encodeURIComponent(payload.id)}&limit=1`;
        const existing = await apiRequest(`/rest/v1/etablissements${query}`);
        if (Array.isArray(existing) && existing.length > 0) {
          const match = existing[0];
          return await this.updateEtablissement(match.id, payload);
        }
      } catch(e) {}

      const res = await apiRequest(
        '/rest/v1/etablissements',
        'POST',
        payload,
        { 'Prefer': 'resolution=merge-duplicates,return=representation' }
      );
      return !!res;
    },

    // 3. Mettre à jour des champs précis
    async updateEtablissement(idOrCode, updates) {
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
      if (updates.effectif !== undefined) dbUpdates.effectif = Number(updates.effectif) || 0;
      if (updates.statut !== undefined) dbUpdates.statut = updates.statut;
      if (updates.statutAbonnement !== undefined) dbUpdates.statut_abonnement = updates.statutAbonnement;
      if (updates.fraisAdhesionPayes !== undefined) dbUpdates.frais_adhesion_payes = Boolean(updates.fraisAdhesionPayes);
      if (updates.echeanceAbonnement !== undefined) dbUpdates.echeance_abonnement = updates.echeanceAbonnement;
      dbUpdates.updated_at = new Date().toISOString();

      const res = await apiRequest(
        `/rest/v1/etablissements?or=(id.eq.${encodeURIComponent(idOrCode)},code.eq.${encodeURIComponent(idOrCode)})`,
        'PATCH',
        dbUpdates,
        { 'Prefer': 'return=representation' }
      );
      return !!res;
    },

    // 4. Supprimer un établissement
    async deleteEtablissement(idOrCode) {
      const res = await apiRequest(
        `/rest/v1/etablissements?or=(id.eq.${encodeURIComponent(idOrCode)},code.eq.${encodeURIComponent(idOrCode)})`,
        'DELETE'
      );
      return res !== null;
    },

    // 5. Récupérer les élèves depuis Supabase Cloud
    async getEleves(etabIdOrCode) {
      const query = etabIdOrCode 
        ? `?or=(etablissement_id.eq.${encodeURIComponent(etabIdOrCode)},etablissement_code.eq.${encodeURIComponent(etabIdOrCode)})` 
        : '';
      const rows = await apiRequest(`/rest/v1/eleves${query}`);
      if (!Array.isArray(rows)) return null;
      return rows.map(r => ({
        id: r.id,
        etablissementId: r.etablissement_id,
        etablissementCode: r.etablissement_code,
        matricule: r.matricule,
        prenom: r.prenom,
        nom: r.nom,
        sexe: r.sexe || 'M',
        type: r.type || 'SCOLAIRE',
        classe: r.classe_id,
        classeId: r.classe_id,
        statutPension: r.statut_pension || 'A_JOUR',
        cleAcces: r.matricule
      }));
    },

    // 6. Sauvegarder un élève dans Supabase Cloud
    async saveEleve(el) {
      if (!el || !el.matricule) return false;
      const payload = {
        id: el.id || `el-${Date.now()}`,
        etablissement_id: el.etablissementId || el.etablissement_id || null,
        etablissement_code: el.etablissementCode || el.etablissement_code || null,
        matricule: el.matricule,
        prenom: el.prenom,
        nom: el.nom,
        sexe: el.sexe || 'M',
        type: el.type || 'SCOLAIRE',
        classe_id: el.classeId || el.classe || null,
        statut_pension: el.statutPension || 'A_JOUR'
      };
      const res = await apiRequest('/rest/v1/eleves', 'POST', payload, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      });
      return !!res;
    },

    // 7. Sauvegarder un lot d'élèves dans Supabase Cloud (Batch Upsert)
    async saveElevesBatch(elevesList) {
      if (!Array.isArray(elevesList) || elevesList.length === 0) return true;
      const payload = elevesList.map(el => ({
        id: el.id || `el-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        etablissement_id: el.etablissementId || el.etablissement_id || null,
        etablissement_code: el.etablissementCode || el.etablissement_code || null,
        matricule: el.matricule,
        prenom: el.prenom,
        nom: el.nom,
        sexe: el.sexe || 'M',
        type: el.type || 'SCOLAIRE',
        classe_id: el.classeId || el.classe || null,
        statut_pension: el.statutPension || 'A_JOUR'
      }));
      const res = await apiRequest('/rest/v1/eleves', 'POST', payload, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      });
      return !!res;
    },

    // 8. Supprimer un élève de Supabase Cloud
    async deleteEleve(idOrMatricule) {
      if (!idOrMatricule) return false;
      const res = await apiRequest(
        `/rest/v1/eleves?or=(id.eq.${encodeURIComponent(idOrMatricule)},matricule.eq.${encodeURIComponent(idOrMatricule)})`,
        'DELETE'
      );
      return res !== null;
    },

    // ==========================================================================
    // ESPACE ENSEIGNANT DÉDIÉ (SUPABASE CLOUD & ISOLATION PAR TEACHER_ID)
    // ==========================================================================

    // 9. Retrouver un enseignant par correspondance exacte de sa clé d'accès (access_key)
    async getTeacherByAccessKey(accessKey) {
      if (!accessKey || typeof accessKey !== 'string') return null;
      const cleanKey = accessKey.trim();
      if (!cleanKey) return null;

      // 9.A. Recherche exacte dans public.teachers
      const rows = await apiRequest(`/rest/v1/teachers?access_key=eq.${encodeURIComponent(cleanKey)}&limit=1`);

      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }

      const t = rows[0];
      return {
        id: t.id,
        nomComplet: t.nom_complet || t.nom || 'Enseignant',
        matiere: t.matiere || t.matiere_principale || 'Discipline Générale',
        accessKey: t.access_key || t.matricule || cleanKey,
        telephone: t.telephone || '',
        email: t.email || '',
        etablissementId: t.etablissement_id || '',
        statut: t.statut || 'ACTIF',
        avatar: t.avatar || '👨‍🏫'
      };
    },

    // 10. Récupérer les classes assignées à un enseignant via classes.teacher_id
    async getClassesByTeacherId(teacherId) {
      if (!teacherId) return [];
      const rows = await apiRequest(`/rest/v1/classes?teacher_id=eq.${encodeURIComponent(teacherId)}&order=nom.asc`);
      if (!Array.isArray(rows)) return [];
      return rows.map(c => ({
        id: c.id,
        nom: c.nom,
        cycle: c.cycle || 'SECONDAIRE',
        teacherId: c.teacher_id,
        etablissementId: c.etablissement_id
      }));
    },

    // 11. Filtrer les élèves par classes de l'enseignant (classes.teacher_id)
    async getStudentsByClassIds(classIds) {
      if (!Array.isArray(classIds) || classIds.length === 0) return [];
      const formattedIds = classIds.map(c => encodeURIComponent(c.includes(' ') ? `"${c}"` : c)).join(',');
      const rows = await apiRequest(`/rest/v1/eleves?classe_id=in.(${formattedIds})&order=nom.asc`);
      if (!Array.isArray(rows)) return [];
      return rows.map(r => ({
        id: r.id,
        matricule: r.matricule,
        nom: r.nom,
        prenom: r.prenom,
        nomComplet: `${r.prenom} ${r.nom}`,
        classeId: r.classe_id,
        parentPhone: r.parent_phone || r.contact_urgence || '+221 77 000 00 00',
        parentName: r.parent_name || 'Parent d\'élève',
        statutPension: r.statut_pension || 'A_JOUR'
      }));
    },

    // 12. Récupérer les notes saisies pour les classes de l'enseignant
    async getNotesByClassIds(classIds) {
      if (!Array.isArray(classIds) || classIds.length === 0) return [];
      const formattedIds = classIds.map(c => encodeURIComponent(c.includes(' ') ? `"${c}"` : c)).join(',');
      const rows = await apiRequest(`/rest/v1/notes?classe_id=in.(${formattedIds})&order=date_evaluation.desc`);
      if (!Array.isArray(rows)) return [];
      return rows.map(n => ({
        id: n.id,
        eleveId: n.eleve_id,
        classeId: n.classe_id,
        teacherId: n.teacher_id,
        matiere: n.matiere,
        epreuve: n.epreuve || 'COMPO',
        note: Number(n.valeur_note) || 0,
        coefficient: Number(n.coefficient) || 1,
        appreciation: n.appreciation || '',
        decision: n.decision || '',
        dateEvaluation: n.date_evaluation
      }));
    },

    // 13. Récupérer le pointage des présences du jour pour les classes de l'enseignant
    async getPresencesByClassIds(classIds, dateStr = null) {
      if (!Array.isArray(classIds) || classIds.length === 0) return [];
      const today = dateStr || new Date().toISOString().split('T')[0];
      const formattedIds = classIds.map(c => encodeURIComponent(c.includes(' ') ? `"${c}"` : c)).join(',');
      const rows = await apiRequest(`/rest/v1/presences?classe_id=in.(${formattedIds})&date_seance=eq.${today}`);
      if (!Array.isArray(rows)) return [];
      return rows.map(p => ({
        id: p.id,
        eleveId: p.eleve_id,
        classeId: p.classe_id,
        teacherId: p.teacher_id,
        dateSeance: p.date_seance,
        matiere: p.matiere,
        statut: p.statut || 'PRESENT',
        justification: p.justification || '',
        parentPhone: p.parent_phone || '',
        parentName: p.parent_name || ''
      }));
    },

    // 14. Sauvegarder ou mettre à jour une note dans Supabase
    async saveTeacherGrade(gradeData) {
      if (!gradeData || !gradeData.eleveId) return false;
      const payload = {
        id: gradeData.id || `not-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        eleve_id: gradeData.eleveId,
        classe_id: gradeData.classeId,
        teacher_id: gradeData.teacherId || null,
        matiere: gradeData.matiere,
        epreuve: gradeData.epreuve || 'COMPO',
        valeur_note: Number(gradeData.note) || 0,
        coefficient: Number(gradeData.coefficient) || 2,
        appreciation: gradeData.appreciation || null,
        decision: gradeData.decision || null,
        date_evaluation: gradeData.dateEvaluation || new Date().toISOString().split('T')[0]
      };
      const res = await apiRequest('/rest/v1/notes', 'POST', payload, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      });
      return !!res;
    },

    // 15. Sauvegarder ou mettre à jour une présence dans Supabase
    async saveTeacherPresence(presenceData) {
      if (!presenceData || !presenceData.eleveId) return false;
      const payload = {
        id: presenceData.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        eleve_id: presenceData.eleveId,
        classe_id: presenceData.classeId,
        teacher_id: presenceData.teacherId || null,
        date_seance: presenceData.dateSeance || new Date().toISOString().split('T')[0],
        matiere: presenceData.matiere,
        statut: presenceData.statut || 'PRESENT',
        justification: presenceData.justification || '',
        parent_phone: presenceData.parentPhone || null,
        parent_name: presenceData.parentName || null
      };
      const res = await apiRequest('/rest/v1/presences', 'POST', payload, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      });
      return !!res;
    }
  };

  console.log('⚡ [SSE] Connecteur Supabase Cloud initialisé avec succès !');
})();
