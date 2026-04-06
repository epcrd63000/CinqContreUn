# 👥 Guides - Rôles et Accès

Contains complete documentation on user roles, permissions, and security.

## 📋 Fichiers

- **ROLES_ACCES_PERMISSIONS.md** - Complete roles & access guide (4200+ lignes)
  - Les 3 rôles système (User, Owner/Creator, Admin)
  - Permissions détaillées par rôle
  - Matrice accès complète (30+ actions)
  - Scénarios réels
  - Vérifications sécurité implémentées
  - Checklist sécurité (à améliorer)

## 👥 For

- Admin (Étienne) - understand your powers
- Developers - implement correct access checks
- Security auditors - understand permission model
- QA - test user scenarios

## ⏱️ Reading Time

- Overview: 20 min
- Complete: 1.5h

## 🎯 Key Sections

- Synthèse exécutive (start here)
- Les 3 rôles (USER, OWNER/CREATOR, ADMIN)
- Matrice accès (comprehensive)
- Scénarios réels (4 examples)
- Vérifications sécurité

## 🔐 Security Focus

- Authentication checks
- Ownership verification
- Admin guards
- Data validation
- Permission matrix

## ⚠️ Known Issues

- Codes secrets en plaintext (fix recommended)
- Pas de rate-limiting
- Firestore rules à renforcer
- Admin check = simple string (should be token)
