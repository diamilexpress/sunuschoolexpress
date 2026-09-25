-- ==============================================================================
-- SunuSchoolExpress - Database Schema (PostgreSQL)
-- Conforme aux spécifications : Écoles Privées, Daaras Modernes & SYSCOHADA
-- ==============================================================================

-- 1. Établissements & Multi-Campus
CREATE TABLE etablissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ECOLE_PRIVEE', 'DAARA_MODERNE', 'COMPLEXE_MIXTE')),
    code_etablissement VARCHAR(50) UNIQUE NOT NULL,
    adresse TEXT,
    ville VARCHAR(100) DEFAULT 'Dakar',
    pays VARCHAR(100) DEFAULT 'Sénégal',
    telephone VARCHAR(50),
    email VARCHAR(100),
    logo_url TEXT,
    frais_adhesion_paye BOOLEAN DEFAULT FALSE, -- 10 000 FCFA engagement
    date_fin_essai TIMESTAMP WITH TIME ZONE, -- 30 jours gratuits
    abonnement_plan VARCHAR(50) DEFAULT 'TRIAL', -- STARTER, PRO, PREMIUM, PACK_INTERNAT, ENTERPRISE
    abonnement_statut VARCHAR(50) DEFAULT 'ACTIF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Utilisateurs & Authentification Multi-Facteurs (MFA)
CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(50) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN_DIRECTEUR', 'OUSTAZ', 'ENSEIGNANT', 'COMPTABLE', 'PARENT', 'ELEVE')),
    mfa_active BOOLEAN DEFAULT TRUE,
    mfa_secret VARCHAR(100),
    langue_preferee VARCHAR(10) DEFAULT 'fr' CHECK (langue_preferee IN ('fr', 'wo')),
    statut VARCHAR(20) DEFAULT 'ACTIF',
    derniere_connexion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Années Académiques & Classes
CREATE TABLE annees_academiques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    libelle VARCHAR(50) NOT NULL, -- ex: '2026-2027'
    est_active BOOLEAN DEFAULT TRUE,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_id UUID REFERENCES annees_academiques(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL, -- ex: 'CM2 A', 'Niveau 3 Coran'
    cycle VARCHAR(50) NOT NULL, -- PRIMAIRE, COLLEGE, LYCEE, DAARA_HIFZ
    frais_mensuels NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    capacite_max INT DEFAULT 40
);

-- 3.B. Corps Professoral & Oustazs (RH, Contrats & Paie)
CREATE TABLE enseignants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    matricule VARCHAR(50) UNIQUE NOT NULL, -- ex: 'ENS-2026-01', 'OUS-2026-03'
    nom_complet VARCHAR(150) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    matiere_principale VARCHAR(100) NOT NULL,
    classes_affectees TEXT[], -- Array de classes
    type_contrat VARCHAR(50) DEFAULT 'CDI Titulaire', -- 'CDI Titulaire', 'Vacataire', 'Titulaire Daara'
    volume_horaire_hebdo VARCHAR(50) DEFAULT '20h / semaine',
    salaire_mensuel_net NUMERIC(12, 2) NOT NULL DEFAULT 200000.00,
    statut VARCHAR(30) DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF', 'CONGE', 'SUSPENDU', 'ARCHIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Élèves & Talibés
CREATE TABLE eleves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    classe_actuelle_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    sexe CHAR(1) CHECK (sexe IN ('M', 'F')),
    photo_url TEXT,
    parent_tuteur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    contact_urgence VARCHAR(50),
    est_interne BOOLEAN DEFAULT FALSE, -- Pensionnaire d'internat Daara
    groupe_sanguin VARCHAR(5),
    allergies_notes TEXT,
    statut_inscription VARCHAR(30) DEFAULT 'CONFIRME' CHECK (statut_inscription IN ('EN_ATTENTE', 'CONFIRME', 'SUSPENDU', 'ARCHIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Module Daara Moderne : Suivi Coranique
CREATE TABLE suivi_coranique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    oustaz_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_evaluation DATE NOT NULL DEFAULT CURRENT_DATE,
    hizb_actuel INT NOT NULL CHECK (hizb_actuel BETWEEN 1 AND 60),
    juz_actuel INT NOT NULL CHECK (juz_actuel BETWEEN 1 AND 30),
    sourate_nom VARCHAR(100) NOT NULL,
    verset_debut INT,
    verset_fin INT,
    qualite_memorisation VARCHAR(30) CHECK (qualite_memorisation IN ('EXCELLENT', 'TRES_BIEN', 'BIEN', 'A_REVOIR')),
    note_tajwid NUMERIC(4, 2), -- Note sur 20 ou 10
    statut_revision VARCHAR(50) DEFAULT 'EN_COURS', -- 'VALIDE', 'A_CONSOLIDER'
    commentaires_oustaz TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Module Daara Moderne : Internat, Dortoirs & Santé
CREATE TABLE dortoirs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    nom_batiment VARCHAR(100) NOT NULL,
    numero_chambre VARCHAR(50) NOT NULL,
    capacite_lits INT NOT NULL DEFAULT 6,
    genre_autorise CHAR(1) CHECK (genre_autorise IN ('M', 'F')),
    surveillant_responsable_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL
);

CREATE TABLE affectation_lits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dortoir_id UUID REFERENCES dortoirs(id) ON DELETE CASCADE,
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    numero_lit INT NOT NULL,
    date_entree DATE NOT NULL DEFAULT CURRENT_DATE,
    date_sortie DATE,
    statut VARCHAR(30) DEFAULT 'OCCUPE'
);

CREATE TABLE carnet_sante_internat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    date_consultation DATE NOT NULL DEFAULT CURRENT_DATE,
    symptomes TEXT NOT NULL,
    traitement_prescrit TEXT,
    hospitalisation_requise BOOLEAN DEFAULT FALSE,
    infirmier_responsable VARCHAR(100)
);

-- 7. Module Scolaire Classique : Matières, Notes & Bulletins
CREATE TABLE matieres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    intitule VARCHAR(100) NOT NULL,
    coefficient INT NOT NULL DEFAULT 1
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    matiere_id UUID REFERENCES matieres(id) ON DELETE CASCADE,
    enseignant_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    periode VARCHAR(30) NOT NULL, -- 'Trimestre 1', 'Semestre 1'
    type_evaluation VARCHAR(50) DEFAULT 'DEVOIR', -- 'DEVOIR', 'COMPOSITION'
    valeur_note NUMERIC(4, 2) NOT NULL CHECK (valeur_note BETWEEN 0 AND 20),
    note_sur INT DEFAULT 20,
    date_note DATE DEFAULT CURRENT_DATE
);

CREATE TABLE absences_retards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    date_incident DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(30) CHECK (type IN ('ABSENCE', 'RETARD')),
    duree_heures INT DEFAULT 1,
    justifie BOOLEAN DEFAULT FALSE,
    motif TEXT,
    alerte_parent_envoyee BOOLEAN DEFAULT FALSE
);

-- 8. Module Financier & Comptabilité SYSCOHADA (Wave, Orange Money, Free Money)
CREATE TABLE transactions_paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_recu VARCHAR(50) UNIQUE NOT NULL, -- Format: SSE-2026-XXXXX
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    eleve_id UUID REFERENCES eleves(id) ON DELETE SET NULL,
    payeur_nom VARCHAR(150) NOT NULL,
    payeur_telephone VARCHAR(50) NOT NULL,
    montant NUMERIC(12, 2) NOT NULL,
    devise VARCHAR(10) DEFAULT 'XOF',
    operateur VARCHAR(30) NOT NULL CHECK (operateur IN ('WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'ESPECES', 'VIREMENT')),
    statut VARCHAR(30) DEFAULT 'PAYE' CHECK (statut IN ('EN_ATTENTE', 'PAYE', 'ECHOUE', 'REMBOURSE')),
    type_motif VARCHAR(50) NOT NULL, -- 'MENSUALITE_SCOLARITE', 'FRAIS_INSCRIPTION', 'PENSION_INTERNAT', 'TENUE'
    mois_concerne VARCHAR(30), -- 'Octobre 2026'
    compte_syscohada VARCHAR(20) DEFAULT '512100', -- Comptes banques/monnaie électronique
    transaction_operateur_ref VARCHAR(100),
    date_reglement TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Rôles & Permissions Dynamiques (Spécifications SunuSchoolExpress)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'DIRECTEUR_ADMIN', 'OUSTAZ_ENSEIGNANT', 'PARENT', 'ELEVE'
    libelle VARCHAR(100) NOT NULL,
    type_identifiant VARCHAR(100) NOT NULL, -- 'Email professionnel ou code établissement', 'Email ou code enseignant', etc.
    description TEXT,
    mfa_requis BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_code VARCHAR(50) NOT NULL, -- 'ECOLE', 'PAIEMENTS', 'STATISTIQUES', 'NOTES', 'BULLETINS', 'ABSENCES', 'CORAN_HIZB', etc.
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH'
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Données initiales des 4 Rôles Officiels
INSERT INTO roles (code, libelle, type_identifiant, description, mfa_requis) VALUES
('DIRECTEUR_ADMIN', 'Directeur / Admin', 'Email professionnel ou code établissement', 'Gestion école, paiements, statistiques, sécurité 2FA', TRUE),
('OUSTAZ_ENSEIGNANT', 'Oustaz / Enseignant', 'Email ou code enseignant', 'Saisie des notes, absences, bulletins, mémorisation Coran', TRUE),
('PARENT', 'Parent d’élève', 'Numéro de téléphone ou code parent', 'Consultation des bulletins, paiements, alertes SMS/WhatsApp', FALSE),
('ELEVE', 'Élève / Talibé', 'Matricule ou code élève', 'Consultation des notes, ressources pédagogiques, accès retardé aux bulletins', FALSE);

-- 10. Publication des Bulletins Temporisée & Verrouillage
CREATE TABLE parametres_bulletins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    session_trimestre VARCHAR(50) NOT NULL DEFAULT '1er Trimestre 2026-2027',
    date_publication_bulletins DATE NOT NULL, -- Champ Date de publication des bulletins fixé par le Directeur
    est_debloque_automatique BOOLEAN DEFAULT TRUE,
    notifications_envoyees BOOLEAN DEFAULT FALSE,
    date_envoi_notifications TIMESTAMP WITH TIME ZONE,
    updated_by UUID REFERENCES utilisateurs(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. File d'attente & Journal des Notifications (WhatsApp API & SMS Gateway)
CREATE TABLE notifications_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    destinataire_tel VARCHAR(50) NOT NULL,
    destinataire_nom VARCHAR(150),
    type_alerte VARCHAR(50) NOT NULL CHECK (type_alerte IN ('PAIEMENT_CONFIRME', 'PAIEMENT_RETARD', 'BULLETIN_DISPONIBLE', 'REUNION_EVENEMENT')),
    canal VARCHAR(30) NOT NULL CHECK (canal IN ('WHATSAPP', 'SMS', 'WHATSAPP_SMS')),
    message TEXT NOT NULL,
    statut VARCHAR(30) DEFAULT 'ENVOYE' CHECK (statut IN ('EN_ATTENTE', 'ENVOYE', 'LIVRE', 'ECHOUE')),
    passerelle_ref VARCHAR(100),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Journal d'Audit & Sécurité (Traçage connexions et actions sensibles)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL, -- 'LOGIN_SSO', '2FA_CHALLENGE', 'GRADE_UPDATE', 'BULLETIN_PUBLISH_DATE_CHANGE', 'PAYMENT_RECEIPT'
    ip_adresse VARCHAR(50) DEFAULT '127.0.0.1',
    details JSONB,
    date_evenement TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alias pour compatibilité ascendante
CREATE VIEW journal_audit_securite AS SELECT * FROM audit_logs;

-- 13. Super Admin Initial de la Plateforme (SunuSchool Express HQ)
INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe_hash, role, statut)
VALUES ('Admin Plateforme', 'SunuSchool Express', 'sunushoolexpress@gmail.com', '+221 77 888 12 34', '$2b$12$sseAdminSecureHash2026PlatformRoot', 'SUPER_ADMIN', 'ACTIF')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 14. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS) & ISOLATION MULTI-TENANTS
-- ==============================================================================

-- Activation du RLS sur l'ensemble des tables sensibles
ALTER TABLE etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE annees_academiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enseignants ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE suivi_coranique ENABLE ROW LEVEL SECURITY;
ALTER TABLE dortoirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE affectation_lits ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_sante_internat ENABLE ROW LEVEL SECURITY;
ALTER TABLE matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences_retards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Fonction d'isolation du tenant courant et vérification Super-Admin
CREATE OR REPLACE FUNCTION current_app_etablissement_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_etablissement_id', true), '')::uuid;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(current_setting('app.user_role', true), '') = 'SUPER_ADMIN';
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Politiques RLS : Établissements (Accès propre ou Super Admin)
CREATE POLICY etablissements_tenant_policy ON etablissements
    FOR ALL
    USING (id = current_app_etablissement_id() OR is_super_admin());

-- Politiques RLS : Utilisateurs
CREATE POLICY utilisateurs_tenant_policy ON utilisateurs
    FOR ALL
    USING (etablissement_id = current_app_etablissement_id() OR is_super_admin());

-- Politiques RLS : Classes
CREATE POLICY classes_tenant_policy ON classes
    FOR ALL
    USING (etablissement_id = current_app_etablissement_id() OR is_super_admin());

-- Politiques RLS : Enseignants & Oustazs
CREATE POLICY enseignants_tenant_policy ON enseignants
    FOR ALL
    USING (etablissement_id = current_app_etablissement_id() OR is_super_admin());

-- Politiques RLS : Élèves & Talibés
CREATE POLICY eleves_tenant_policy ON eleves
    FOR ALL
    USING (etablissement_id = current_app_etablissement_id() OR is_super_admin());

-- Politiques RLS : Suivi Coranique
CREATE POLICY suivi_coranique_tenant_policy ON suivi_coranique
    FOR ALL
    USING (
        eleve_id IN (SELECT id FROM eleves WHERE etablissement_id = current_app_etablissement_id())
        OR is_super_admin()
    );

-- Politiques RLS : Notes & Évaluations
CREATE POLICY notes_tenant_policy ON notes
    FOR ALL
    USING (
        eleve_id IN (SELECT id FROM eleves WHERE etablissement_id = current_app_etablissement_id())
        OR is_super_admin()
    );

-- Politiques RLS : Transactions Financières SYSCOHADA (Wave, OM, Espèces)
CREATE POLICY transactions_tenant_policy ON transactions_paiements
    FOR ALL
    USING (etablissement_id = current_app_etablissement_id() OR is_super_admin());

-- Politiques RLS : Journal d'Audit & Sécurité
CREATE POLICY audit_logs_tenant_policy ON audit_logs
    FOR ALL
    USING (etablissement_id = current_app_etablissement_id() OR is_super_admin());

-- ==============================================================================
-- 15. PROTECTION ANTI-SABOTAGE & RESTRICTION DES PRIVILÈGES BASE DE DONNÉES
-- ==============================================================================

-- Création d'un rôle applicatif restreint sans privilèges de destruction (DROP / TRUNCATE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_restricted_user') THEN
        CREATE ROLE app_restricted_user WITH LOGIN PASSWORD 'AppSecurePassword2026!';
    END IF;
END $$;

-- Révocation des privilèges de destruction de tables
REVOKE DROP, TRUNCATE, ALTER ON ALL TABLES IN SCHEMA public FROM app_restricted_user;

-- Octroi strict des privilèges de lecture/écriture applicative (DML uniquement)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_restricted_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_restricted_user;

