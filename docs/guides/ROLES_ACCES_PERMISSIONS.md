# 👥 GUIDE COMPLET - RÔLES, ACCÈS & PERMISSIONS

**Dernière mise à jour:** 6 avril 2026  
**Statut:** ✅ Production

---

## 📊 SYNTHÈSE EXÉCUTIVE

| Élément | Nombre | Détail |
|---------|--------|--------|
| **Rôles** | 3 | User, Owner/Creator, Admin |
| **Permissions uniques** | 28 | Voir matrix ci-dessous |
| **Objets protégeables** | 5 | BR, Challenges, Confreries, Codes, Utilisateurs |
| **Vérifications sécurité** | 12+ | Pour chaque action sensible |

---

## 🎭 LES 3 RÔLES SYSTÈME

### 1️⃣ USER (Utilisateur Standard)
**Population:** Tous non-admin  
**Identification:** `currentUser !== 'Étienne'`

```javascript
// Données utilisateur
{
  name: "Victor",             // Unique identifier
  totalScore: 42,             // All-time BR count
  weeklyScore: 8,             // This week BR count
  currentStreak: 3,           // Jours consécutifs
  maxStreak: 12,              // Record personnel
  lastBrDate: "2026-04-06",   // Tracking streak
  photoUrl: "https://...",    // Avatar
  description: "Je goone",    // Bio
  barkApiKey: null,           // Optional iOS notifications
  confrerie: "ID_123"         // Optional fraternity
}
```

**Permissions complètes:**

```
✅ PROFIL
   ├─ Voir son profil
   ├─ Modifier photo
   ├─ Modifier description
   ├─ Voir son totalScore + weeklyScore + streak
   └─ Voir position classement global

✅ BR (Masturb.n Tracking)
   ├─ Poster nouvelles BR
   ├─ Noter BR autres (1-5 stars)
   ├─ Commenter BR
   ├─ Supprimer ses propres BR
   ├─ Voir feed BR (10 dernières)
   └─ Voir son BR dans stats

✅ CLASSEMENTS
   ├─ Voir leaderboard global
   ├─ Voir leaderboard hebdo (reset lundi)
   ├─ Voir gagnant global + semaine dernière
   ├─ Voir palmarès historique
   └─ Calculer son rang (ex: 3ème sur 8)

✅ DÉFIS
   ├─ Voir défis confrérie actifs
   ├─ Créer défi confrérie (validé auto)
   ├─ Participer défi confrérie
   ├─ Voir progression défis
   ├─ Voir historique défis complétés
   ├─ Créer défi global (⏳ EN ATTENTE validation admin)
   └─ Suprimer ses propres défis (confrérie)

✅ CONFRÉRIES
   ├─ Créer nouvelle confrérie
   ├─ Voir détails confrérie
   ├─ Voir profils membres
   ├─ Voir stats agrégées confrérie
   ├─ Quitter confrérie
   └─ Si créateur: ajouter/retirer membres

✅ NOTIFICATIONS
   ├─ Recevoir notifs in-app
   ├─ Configurer clé Bark API (optional)
   ├─ Reçevoir push iOS (si Bark configuré)
   └─ Voir historique notifications

❌ ACTIONS REFUSÉES
   ├─ Accéder admin panel
   ├─ Voir/modifier données autres users
   ├─ Supprimer BR autre user
   ├─ Supprimer défi autre user
   ├─ Supprimer confrérie autre user
   ├─ Approuver/rejeter défis globaux
   ├─ Générer codes accès
   └─ Modifier paramètres app
```

**Code implémentation:**

```javascript
// Protection fonction standard
function submitBr(description, ratings) {
  const currentUser = window.currentUser;
  if (!currentUser) {
    alert('Connecte-toi d\'abord!');
    return;
  }
  // Reste implémentation...
}

// Vérification: user ne peut supprimer autre BR
async function deleteBr(brId) {
  const brDoc = await getDoc(doc(db, 'br', brId));
  const brData = brDoc.data();
  
  if (currentUser !== brData.user && currentUser !== 'Étienne') {
    console.error('❌ Permission refusée');
    return; // Silencieux ou toast error
  }
  
  // Procédure suppression...
}
```

---

### 2️⃣ OWNER / CREATOR (Propriétaire Entité)
**Population:** Créateurs de défis ou confréries  
**Identification:** `document.creator === currentUser` OU `confrerie.creatorId === currentUser`

```javascript
// Rôle attribué dynamiquement à la création

// Exemple: Défi créé par Victor
{
  id: "ch_abc123",
  title: "5 BRs du mois",
  creator: "Victor",          // ← Victor devient OWNER/CREATOR
  // ... autres fields
}

// Victor peut maintenant:
// - Voir défi
// - Supprimer défi (avant deadline)
// - Voir progression tous participants
```

**Permissions additionnelles (par-dessus USER):**

```
✅ DÉFIS (Propres)
   ├─ Supprimer défi créé ✅ NEW
   ├─ Voir progression détaillée participants
   └─ Voir raison rejet (si global refusé admin)

✅ CONFRÉRIES (Propres)
   ├─ Modifier liste membres
   ├─ Ajouter/inviter membres
   ├─ Retirer membres
   ├─ Voir stats détaillée membres
   └─ Supprimer confrérie ✅ NEW

❌ N'AFFECTE PAS
   ├─ Admin panel (toujours non-accessible)
   ├─ Codes création
   └─ Validation défis globaux
```

**Code implémentation:**

```javascript
// Vérification propriété
async function deleteChallenge(challengeId) {
  const chalDoc = await getDoc(doc(db, 'challenges', challengeId));
  const chalData = chalDoc.data();
  
  // ✅ Propriétaire OU admin
  const isCreator = currentUser === chalData.creator;
  const isAdmin = currentUser === 'Étienne';
  
  if (!isCreator && !isAdmin) {
    throw new Error('Seul créateur/admin peut supprimer');
  }
  
  // Suppression autorisée
  await deleteDoc(doc(db, 'challenges', challengeId));
}

// Dans Confrerie:
async function addMemberToConfrerie(confrerie, newMember) {
  // ✅ Créateur confrerie OU admin
  const isCreator = currentUser === confrerie.creatorId;
  const isAdmin = currentUser === 'Étienne';
  
  if (!isCreator && !isAdmin) {
    throw new Error('Seul créateur fraterie peut ajouter members');
  }
  
  // Ajout autorisé
}
```

---

### 3️⃣ ADMIN (Étienne - ROOT ACCESS)
**Population:** `currentUser === 'Étienne'`  
**Installation:** Codé en dur (voir amélioration sécurité)

```javascript
// Admin user = root
const ADMIN_USER = "Étienne";

// Toutes les permissions USER + OWNER + ADMIN
```

**Permissions spéciales ADMIN UNIQUES:**

```
✅ UTILISATEURS
   ├─ Voir liste tous utilisateurs
   ├─ Voir détails stats complètes (totalScore, weekly, streak, etc)
   ├─ Créer nouvel utilisateur
   ├─ Générer codes d'accès
   ├─ Supprimer utilisateur complet (+ autes données)
   └─ Forcer reset scores/streak

✅ BR MANAGEMENT
   ├─ Supprimer N'IMPORTE QUELLE BR
   ├─ Modifier BE d'autres users (rare)
   └─ Voir audit log BR (future)

✅ DÉFIS GLOBAUX
   ├─ Approuver défi global (attente → active) ✅ KEY
   ├─ Rejeter défi global (attente → rejected) ✅ KEY
   ├─ Voir liste défis en attente validation
   ├─ Forcer completion défi
   └─ Voir qui propose quoi

✅ CONFRÉRIES
   ├─ Supprimer N'IMPORTE QUELLE confrérie
   ├─ Modifier membres confrérie
   ├─ Merger confréries (future)
   └─ Voir stats toutes confréries

✅ CODES D'ACCÈS
   ├─ Générer nouveaux codes
   ├─ Voir codes générés
   ├─ Révoquer codes
   └─ Voir audit (qui utilisé quand)

✅ SETTINGS APP
   ├─ Modifier BR limite par semaine
   ├─ Modifier scoring (points par BR)
   ├─ Reset leaderboard hebdo (manuel)
   ├─ Maintenance mode
   └─ Voir system health

✅ NOTIFICATIONS
   ├─ Envoyer notif massive à tous users
   ├─ Voir logs notifications
   └─ Configurer Bark API globale

✅ AUDIT & LOGS
   ├─ Voir audit trail actions
   ├─ Voir erreurs system
   ├─ Exporter données
   └─ Analytics custom
```

**Interface Admin:**

```javascript
// Admin Panel Modal - Visible uniquement pour Étienne
if (currentUser === ADMIN_USER) {
  adminBtn.style.display = 'block';  // ⚙️ Admin button visible
}

// Au clique:
function openAdminModal() {
  if (currentUser !== ADMIN_USER) {
    return; // Silencieux (defensive)
  }
  
  // Panel s'ouvre avec 5 tabs:
  // 1. Utilisateurs (CRUD)
  // 2. Codes accès
  // 3. Confréries
  // 4. Validation Défis Global
  // 5. Settings
}
```

**Code implémentation clé:**

```javascript
// 🔑 Validation admin pour action sensible
async function approveChallengeGlobal(challengeId) {
  // ✅ GUARDS
  if (currentUser !== 'Étienne') {
    console.warn('⚠️ Access denied: not admin');
    return false;
  }
  
  const chalDoc = await getDoc(doc(db, 'challenges', challengeId));
  const chalData = chalDoc.data();
  
  if (chalData.scope !== 'global') {
    throw new Error('Only global challenges can be approved');
  }
  
  if (chalData.status !== 'pending') {
    throw new Error('Only pending challenges can be approved');
  }
  
  // ✅ PROCEED
  await updateDoc(doc(db, 'challenges', challengeId), {
    status: 'active',  // pending → active
    approvedByAdmin: 'Étienne',
    approvedAt: serverTimestamp()
  });
  
  // Notifier créateur
  await NotificationSystem.add({
    type: 'challenge_approved',
    message: `${chalData.title} a été approuvé!`
  });
}
```

---

## 🔐 MATRICE ACCÈS COMPLÈTE

```
┌────────────────────┬──────────────┬─────────────┬──────────┐
│ ACTION             │ USER NORMAL  │ OWNER/CREAT │ ADMIN    │
├────────────────────┼──────────────┼─────────────┼──────────┤
│ Poster BR          │ ✅ OWN       │ ✅ OWN      │ ✅ TOUS  │
│ Noter BR           │ ✅ TOUS      │ ✅ TOUS     │ ✅ TOUS  │
│ Commenter BR       │ ✅ TOUS      │ ✅ TOUS     │ ✅ TOUS  │
│ Supp BR propre     │ ✅ OWN       │ ✅ OWN      │ ✅ TOUS  │
│ Supp BR autre      │ ❌           │ ❌          │ ✅ TOUS  │
│                    │              │             │          │
│ Créer défi confr   │ ✅ OWN       │ ✅ OWN      │ ✅ TOUS  │
│ Créer défi global  │ ✅ ATTENTE   │ ✅ ATTENTE  │ ✅ AUTO  │
│ Supp défi propre   │ ✅ OWN       │ ✅ OWN      │ ✅ TOUS  │
│ Supp défi autre    │ ❌           │ ❌          │ ✅ TOUS  │
│ Approuver global   │ ❌           │ ❌          │ ✅ FORCE │
│                    │              │             │          │
│ Créer confrérie    │ ✅ OWN       │ ✅ OWN      │ ✅ TOUS  │
│ Ajouter membre     │ ⚠️ OWN-ONLY  │ ✅ OWN      │ ✅ TOUS  │
│ Retirer membre     │ ⚠️ OWN-ONLY  │ ✅ OWN      │ ✅ TOUS  │
│ Supp confrérie     │ ❌           │ ✅ OWN      │ ✅ TOUS  │
│                    │              │             │          │
│ Voir admin panel   │ ❌           │ ❌          │ ✅ FORCE │
│ Générer codes      │ ❌           │ ❌          │ ✅ FORCE │
│ Créer user         │ ❌           │ ❌          │ ✅ FORCE │
│ Modif settings     │ ❌           │ ❌          │ ✅ FORCE │
│ Forcer reset lbrd  │ ❌           │ ❌          │ ✅ FORCE │
└────────────────────┴──────────────┴─────────────┴──────────┘

LÉGENDE:
  ✅ = Autorisé
  ❌ = Refusé
  ⚠️ = Restriction particulière
  OWN = User sa propre ressource
  ATTENTE = Nécessite approbation admin
  AUTO = Automatiquement validé
  FORCE = Droit obligatoire (ne peut pas refuser)
  TOUS = Sur toutes les ressources
```

---

## 🛡️ VÉRIFICATIONS SÉCURITÉ IMPLÉMENTÉES

### 1. Authentification

```javascript
// Vérif à chaque page load
if (!currentUser) {
  showLoginScreen();
  return;
}
```

**✅ Fonctionnel:** `localStorage.getItem('cinqContreUnUser')`

### 2. Ownership Check (Défis)

```javascript
async function deleteChallenge(challengeId) {
  const chalData = await getChalData(challengeId);
  
  if (currentUser !== chalData.creator && !isAdmin()) {
    return logError('Not challenge creator');
  }
  // Procédure OK
}
```

**✅ Fonctionnel pour:** Défis, BR (partiellement)

### 3. Admin Guard (Protection routes admin)

```javascript
function openAdminModal() {
  if (currentUser !== 'Étienne') {
    return; // Silent fail
  }
  // Afficher modal
}
```

**✅ Fonctionnel:** Bouton ⚙️ caché si pas admin

### 4. Scope Validation (Défis globaux)

```javascript
async function approveChallengeGlobal(chalId) {
  const chal = await getChalData(chalId);
  
  if (chal.scope !== 'global') {
    throw new Error('Only global challenges');
  }
  if (chal.status !== 'pending') {
    throw new Error('Already approved/rejected');
  }
  // Procédure OK
}
```

**✅ Fonctionnel:** Limite actions globales

### 5. Data Validation

```javascript
function submitBr(description, ratings) {
  if (!description?.trim()) return error('Empty');
  if (!Number.isInteger(ratings.duration) || 
      ratings.duration < 1 || ratings.duration > 5) {
    return error('Invalid rating');
  }
  // Procédure OK
}
```

**✅ Fonctionnel:** Format + longueur checks

### 6. Owner Query (BR comments)

```javascript
async function deleteBrComment(brId, commentId) {
  const comment = await getCommentData(brId, commentId);
  
  if (currentUser !== comment.author && !isAdmin()) {
    return error('Not comment author');
  }
  // Procédure OK
}
```

**⚠️ Partiel:** Implément pour comments

---

## 🎯 SCENÁRIOS ACCÈS RÉELS

### Scenario 1: Victor poste une BR

```
Victor (USER):
  1. Clique "Poste ta BR" ✅
  2. Écrit description ✅
  3. Note sa session (durée/plaisir/qualité) ✅
  4. Clique "Valider" ✅
  RÉSULTAT: BR créée, score +1 ✅
```

**Vérifications:**
- `currentUser === 'Victor'` ✅
- Description non-vide ✅
- Ratings 1-5 ✅
- Pas de limite BR/semaine (999) ✅

---

### Scenario 2: Victor crée défi global

```
Victor (USER):
  1. Clique "Créer défi" ✅
  2. Choisit scope "Global" ✅
  3. Défini: "5 BRs en 7 jours" ✅
  4. Clique "Lancer" ✅
  RÉSULTAT: Défi EN ATTENTE (status: 'pending')
             Notification à Étienne ⌛
```

**Alors**, Étienne (ADMIN):
```
Étienne (ADMIN):
  1. Voit "Défi en attente" en admin panel ✅
  2. Clique "Approuver" ✅
  RÉSULTAT: Défi passe 'active'
             Notif Victor: "Approved!" ✅
```

**Vérifications:**
- Victor scope = 'global', status auto-set = 'pending' ✅
- Étienne a permission approbation ✅
- Une fois approved, visible tous users ✅

---

### Scenario 3: Victor crée confrérie + invite Paul

```
Victor (USER & CREATOR):
  1. Clique "+ Créer Confrérie" ✅
  2. Nom: "Les Trois Mousquetaires" ✅
  3. Victor = créateur  ✅
  4. Invite Paul ✅
  RÉSULTAT: Confrérie créée
             Paul peut rejoindre
```

**Victor peut:**
- Ajouter/retirer Paul ✅ (creator)
- Voir stats Paul ✅
- Créer défi confrérie ✅

**Paul peut:**
- Voir détails confrérie ✅
- Quitter ✅
- Ne PAS retirer Victor ❌

---

### Scenario 4: Paul essaie supprimer BR de Victor

```
Paul (USER):
  1. Voit BR de Victor
  2. Clique "Supprimer" ❌
  RÉSULTAT: Bouton grisé OU
             Error: "Seul creator/admin peut supprimer" ❌
```

**Même si techniquement il clikait:**
```javascript
if (currentUser !== brOwner && !isAdmin()) {
  return error('Permission refusée'); // ← Guard
}
```

---

## 📋 CHECKLIST SÉCURITÉ

### Implémenté

- ✅ Auth check sur login
- ✅ User ownership check (BR, Défis)
- ✅ Admin guard sur panel
- ✅ Scope validation (défi global)
- ✅ Content validation (description, ratings)
- ✅ Creator check (confrérie members)

### À améliorer

- 🔴 Codes secrets en plaintext (hash recommended)
- 🔴 Pas de rate-limiting BR/min (spam potential)
- 🔴 Pas de Firestore rules strictes (server-side)
- 🔴 LocalStorage pas sécurisé (ok pour privé)
- 🟡 Admin check = simple string compare (token better)

---

## 🚀 CHANGELOG ACCÈS

| Date | Changement | Impact |
|------|-----------|--------|
| 6-04-26 | Bug fix: palmarès affichage | UX |
| TBD | Audit code refactorisation | Maintenabilité |
| TBD | Renforcer Firestore rules | Sécurité |
| TBD | Ajouter rate-limiting | Spam |
| TBD | Implémenter token auth | Admin |

---

**Document:** Guide Rôles & Accès  
**Version:** 1.0  
**Produit par:** Audit complet 6-04-26  
**Maintenu par:** [À définir]
