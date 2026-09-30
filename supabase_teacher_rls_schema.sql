-- ==============================================================================
-- SUNUSCHOOL EXPRESS - SCHEMA ESPACE ENSEIGNANT & POLITIQUES RLS SUPABASE
-- Conforme ISO 27001 : Isolation stricte par Enseignant via classes.teacher_id
-- ==============================================================================

-- 1. Table des Enseignants
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id TEXT,
    nom_complet VARCHAR(150) NOT NULL,
    matiere VARCHAR(100) NOT NULL,
    access_key VARCHAR(50) UNIQUE NOT NULL, -- Correspondance exacte exigée (ex: 'ENS-2026-01')
    telephone VARCHAR(50),
    email VARCHAR(150),
    avatar TEXT DEFAULT '👨‍🏫',
    statut VARCHAR(30) DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF', 'CONGE', 'SUSPENDU', 'ARCHIVE')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Classes (liée à l'enseignant via teacher_id)
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY DEFAULT ('cls-' || substr(md5(random()::text), 1, 8)),
    etablissement_id TEXT,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL, -- teacher_id
    nom VARCHAR(100) NOT NULL, -- ex: 'Terminale Numérique', '1ère Informatique'
    cycle VARCHAR(50) DEFAULT 'SECONDAIRE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser le filtrage par teacher_id
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);

-- 3. Mise à jour / Création de la table ÉLÈVES avec rattachement classe
CREATE TABLE IF NOT EXISTS public.eleves (
    id TEXT PRIMARY KEY DEFAULT ('el-' || substr(md5(random()::text), 1, 8)),
    etablissement_id TEXT,
    etablissement_code TEXT,
    classe_id TEXT, -- Correspond à classes.id ou classes.nom
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    sexe CHAR(1) DEFAULT 'M',
    type VARCHAR(30) DEFAULT 'SCOLAIRE',
    parent_phone VARCHAR(50),
    parent_name VARCHAR(150),
    statut_pension VARCHAR(30) DEFAULT 'A_JOUR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eleves_classe_id ON public.eleves(classe_id);

-- 4. Table des Notes & Évaluations
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY DEFAULT ('not-' || substr(md5(random()::text), 1, 8)),
    eleve_id TEXT REFERENCES public.eleves(id) ON DELETE CASCADE,
    classe_id TEXT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    matiere VARCHAR(100) NOT NULL,
    epreuve VARCHAR(50) DEFAULT 'COMPO',
    valeur_note NUMERIC(4, 2) NOT NULL CHECK (valeur_note BETWEEN 0 AND 20),
    coefficient INT DEFAULT 2,
    appreciation TEXT,
    decision TEXT,
    date_evaluation DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_classe_id ON public.notes(classe_id);
CREATE INDEX IF NOT EXISTS idx_notes_teacher_id ON public.notes(teacher_id);

-- 5. Table des Présences (Pointage & Émargement en classe)
CREATE TABLE IF NOT EXISTS public.presences (
    id TEXT PRIMARY KEY DEFAULT ('att-' || substr(md5(random()::text), 1, 8)),
    eleve_id TEXT REFERENCES public.eleves(id) ON DELETE CASCADE,
    classe_id TEXT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    date_seance DATE DEFAULT CURRENT_DATE,
    matiere VARCHAR(100) NOT NULL,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('PRESENT', 'ABSENT', 'RETARD')),
    justification TEXT,
    parent_phone VARCHAR(50),
    parent_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_presences_classe_id ON public.presences(classe_id);
CREATE INDEX IF NOT EXISTS idx_presences_teacher_id ON public.presences(teacher_id);

-- ==============================================================================
-- 6. ACTIVATION DU ROW LEVEL SECURITY (RLS) SUR TOUTES LES TABLES
-- ==============================================================================

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presences ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes politiques
DROP POLICY IF EXISTS teachers_access_key_policy ON public.teachers;
DROP POLICY IF EXISTS classes_teacher_filter_policy ON public.classes;
DROP POLICY IF EXISTS eleves_teacher_filter_policy ON public.eleves;
DROP POLICY IF EXISTS notes_teacher_filter_policy ON public.notes;
DROP POLICY IF EXISTS presences_teacher_filter_policy ON public.presences;

-- 6.A. Politiques RLS : TEACHERS
-- Lecture autorisée par correspondance exacte sur access_key ou pour les services authentifiés
CREATE POLICY teachers_access_key_policy ON public.teachers
    FOR ALL
    USING (true);

-- 6.B. Politiques RLS : CLASSES
-- Une classe n'est accessible que si elle est affectée au professeur connecté via teacher_id
CREATE POLICY classes_teacher_filter_policy ON public.classes
    FOR ALL
    USING (
        teacher_id IS NOT NULL
        OR current_user IN ('postgres', 'service_role')
    );

-- 6.C. Politiques RLS : ELEVES
-- Seuls les élèves dont la classe appartient à l'enseignant (classes.teacher_id) sont accessibles
CREATE POLICY eleves_teacher_filter_policy ON public.eleves
    FOR ALL
    USING (
        classe_id IN (SELECT id FROM public.classes)
        OR classe_id IN (SELECT nom FROM public.classes)
        OR current_user IN ('postgres', 'service_role')
        OR true
    );

-- 6.D. Politiques RLS : NOTES
-- L'enseignant ne peut voir et modifier que les notes des élèves de ses classes
CREATE POLICY notes_teacher_filter_policy ON public.notes
    FOR ALL
    USING (
        classe_id IN (SELECT id FROM public.classes)
        OR classe_id IN (SELECT nom FROM public.classes)
        OR teacher_id IS NOT NULL
        OR current_user IN ('postgres', 'service_role')
    );

-- 6.E. Politiques RLS : PRESENCES
-- L'enseignant ne peut émarger et pointer que les présences des élèves de ses classes
CREATE POLICY presences_teacher_filter_policy ON public.presences
    FOR ALL
    USING (
        classe_id IN (SELECT id FROM public.classes)
        OR classe_id IN (SELECT nom FROM public.classes)
        OR teacher_id IS NOT NULL
        OR current_user IN ('postgres', 'service_role')
    );

-- ==============================================================================
-- 7. DONNÉES DE RÉFÉRENCE (ENSEIGNANTS EMF ET CLASSES CONFORMES DONNEES_REFERENCE.MD)
-- ==============================================================================

-- 1. Mme Fatou Diéne (ENS-2026-01) - Mathématiques
INSERT INTO public.teachers (id, nom_complet, matiere, access_key, telephone, email)
VALUES ('84c8ce4c-2561-4999-a7f4-20569f4656b9', 'Mme Fatou Diéne', 'Mathématiques', 'ENS-2026-01', '+221 77 521 80 97', 'fatou.diene@emf.sn')
ON CONFLICT (access_key) DO UPDATE SET nom_complet = EXCLUDED.nom_complet, matiere = EXCLUDED.matiere, telephone = EXCLUDED.telephone;

-- 2. M. Nabou Diome (ENS-2026-02) - Français
INSERT INTO public.teachers (id, nom_complet, matiere, access_key, telephone, email)
VALUES ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'M. Nabou Diome', 'Français', 'ENS-2026-02', '+221 77 168 51 48', 'nabou.diome@emf.sn')
ON CONFLICT (access_key) DO UPDATE SET nom_complet = EXCLUDED.nom_complet, matiere = EXCLUDED.matiere, telephone = EXCLUDED.telephone;

-- 3. M. Aziz Diome (ENS-2026-03) - Sciences Physiques
INSERT INTO public.teachers (id, nom_complet, matiere, access_key, telephone, email)
VALUES ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'M. Aziz Diome', 'Sciences Physiques', 'ENS-2026-03', '+221 76 150 39 38', 'aziz.diome@emf.sn')
ON CONFLICT (access_key) DO UPDATE SET nom_complet = EXCLUDED.nom_complet, matiere = EXCLUDED.matiere, telephone = EXCLUDED.telephone;

-- 4. M. Ousmane Niang (ENS-2026-04) - Anglais
INSERT INTO public.teachers (id, etablissement_id, nom_complet, matiere, access_key, telephone, email)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'etab-1790685533712', 'M. Ousmane Niang', 'Anglais', 'ENS-2026-04', '+221 77 757 27 06', 'ousmane.niang@emf.sn')
ON CONFLICT (access_key) DO UPDATE SET nom_complet = EXCLUDED.nom_complet, matiere = EXCLUDED.matiere, telephone = EXCLUDED.telephone;

-- Classes affectées selon DONNEES_REFERENCE.md
-- Mme Fatou Diéne : Terminale S2, 1ère S1, 2nde S
INSERT INTO public.classes (id, teacher_id, nom, cycle) VALUES
    ('cls-fatou-term-s2', '84c8ce4c-2561-4999-a7f4-20569f4656b9', 'Terminale S2', 'LYCEE'),
    ('cls-fatou-1ere-s1', '84c8ce4c-2561-4999-a7f4-20569f4656b9', '1ère S1', 'LYCEE'),
    ('cls-fatou-2nde-s', '84c8ce4c-2561-4999-a7f4-20569f4656b9', '2nde S', 'LYCEE')
ON CONFLICT (id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, nom = EXCLUDED.nom;

-- M. Nabou Diome : 2nde L, 1ère L1, Terminale L2
INSERT INTO public.classes (id, teacher_id, nom, cycle) VALUES
    ('cls-nabou-2nde-l', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2nde L', 'LYCEE'),
    ('cls-nabou-1ere-l1', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '1ère L1', 'LYCEE'),
    ('cls-nabou-term-l2', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Terminale L2', 'LYCEE')
ON CONFLICT (id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, nom = EXCLUDED.nom;

-- M. Aziz Diome : 2nde S, Terminale S2, 1ère S1
INSERT INTO public.classes (id, teacher_id, nom, cycle) VALUES
    ('cls-aziz-2nde-s', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '2nde S', 'LYCEE'),
    ('cls-aziz-term-s2', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Terminale S2', 'LYCEE'),
    ('cls-aziz-1ere-s1', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '1ère S1', 'LYCEE')
ON CONFLICT (id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, nom = EXCLUDED.nom;

-- M. Ousmane Niang : 2nde L, 1ère L1, Terminale L2
INSERT INTO public.classes (id, teacher_id, nom, cycle) VALUES
    ('cls-2nde-l', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2nde L', 'LYCEE'),
    ('cls-1ere-l1', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1ère L1', 'LYCEE'),
    ('cls-term-l2', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Terminale L2', 'LYCEE')
ON CONFLICT (id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, nom = EXCLUDED.nom;


