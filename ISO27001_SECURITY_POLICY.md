# POLITIQUE GÉNÉRALE DE SÉCURITÉ DE L'INFORMATION (SMSI / ISMS)
## Conformité Norme Internationale ISO/IEC 27001:2022
**Éditeur** : Diamil-Express — Société Digitale au Sénégal  
**Plateforme** : SunuSchoolExpress (Écoles Privées & Daaras Modernes)  
**Version** : v3.7.0-PROD  
**Date d'entrée en vigueur** : 22 Septembre 2026  
**Responsable SSI / CISO** : Moustapha Diamil Diouf (Directeur Général)  

---

## 1. OBJET & DOMAINE D'APPLICATION
La présente politique définit le cadre de gestion de la sécurité de l'information (SMSI) de la plateforme SaaS **SunuSchoolExpress**, conformément à la norme internationale **ISO/IEC 27001:2022** et à la législation sénégalaise relative à la protection des données personnelles (Loi n° 2008-12 - CDP).

Elle s'applique à l'ensemble des modules applicatifs (Écoles Privées, Daaras Modernes, Gestion SYSCOHADA, Wave/OM Gateway, Espaces Parents & Enseignants).

---

## 2. POLITIQUE ACCÈS & AUTHENTIFICATION (ANNEXE A.9 ISO 27001)

### A.9.1 Contrôle d'Accès & Principe du Moindre Privilège
- Chaque utilisateur (Directeur, Oustaz, Enseignant, Comptable, Parent, Élève) dispose d'un rôle d'accès strictly limité à ses prérogatives fonctionnelles (**Role-Based Access Control - RBAC**).
- **Console Centrale HQ (`admin.html`)** : Accessible uniquement avec authentification forte Master Admin HQ validée côté serveur (Bcrypt/JWT).

### A.9.2 Mots de Passe & Clés d'Accès
- Tous les mots de passe sont hachés avec l'algorithme Bcrypt (facteur de coût >= 12). Aucun mot de passe n'est stocké en clair dans la base de données.
- Les tentatives d'authentification sont soumises à un pare-feu d'IP (`authRateLimiter`) bloquant toute adresse IP après 5 échecs consécutifs pendant 5 minutes.

---

## 3. CRYPTOGRAPHIE & GESTION DES CLÉS (ANNEXE A.10 ISO 27001)

### A.10.1 Protection des Données en Transit et au Repos
- **Transit (TLS 1.3 / HTTPS)** : Toutes les requêtes HTTP entre le navigateur client et l'API sont chiffrées. En-têtes `HSTS` et `X-Content-Type-Options: nosniff` activés.
- **Au Repos (PostgreSQL RLS)** : Row Level Security (RLS) activé sur les 17 tables sensibles pour empêcher toute fuite de données inter-écoles (`etablissement_id` isolation).

### A.10.2 Rotation des Clés d'API & Secrets
- Les accès et identifiants sécurisés (Compte Marchand Wave Business Direct Diamil-Express, JWT Secret, Session Secret) sont isolés au niveau du serveur dans le fichier d'environnement `.env`.
- Procédure de rotation des clés d'API programmée tous les 90 jours ou immédiatement en cas de suspicion de compromission.

---

## 4. SÉCURITÉ DES OPÉRATIONS & SAUVEGARDES (ANNEXE A.12 ISO 27001)

### A.12.1 Écriture Atomique & Sauvegardes Quotidiennes (RPO < 1h, RTO < 15 min)
- **Persistance Atomique** : Chaque écriture en base s'effectue via un swap de fichier temporaire (`.tmp` -> `.json` / WAL PostgreSQL) éliminant tout risque de corruption en cas d'interruption.
- **Sauvegardes Automatisées** : Dump complet quotidien de la base de données vers un stockage sécurisé chiffré.

### A.12.2 Journalisation & Traçabilité (Audit Logs)
- Enregistrement horodaté de toutes les actions sensibles dans le journal d'audit (`audit_logs`) :
  - Connexions Super-Admin HQ.
  - Validations d'adhésion Wave (10 000 FCFA).
  - Déblocages et surclassements de formules.
  - Blocages d'IP par le pare-feu.

---

## 5. MONITORING & GESTION DES INCIDENTS (PROMETHEUS + GRAFANA)

### Surveillance en Temps Réel
- Le serveur héberge l'endpoint standard `/metrics` (Format Exposition Prometheus) exposant :
  - `node_memory_rss_bytes` (Usage mémoire vive)
  - `http_requests_total{status}` (Compteurs 2xx, 4xx, 5xx)
  - `security_brute_force_blocked_total` (Alertes pare-feu)
- Alertes automatiques transmises par WhatsApp & Email au CISO (`+221 76 150 39 38` / `direction@sunuschoolexpress.com`) pour tout événement critique.

---

## 6. CONFORMITÉ LÉGALE & CDP SÉNÉGAL (ANNEXE A.18 ISO 27001)

- Conforme à la loi sur la Commission de Protection des Données Personnelles (CDP) du Sénégal.
- Droit d'accès, de rectification et d'effacement garanti pour les parents et directeurs d'établissement sur simple demande.

---
*Document Officiel Diamil-Express — SunuSchoolExpress Security Compliance Board*
