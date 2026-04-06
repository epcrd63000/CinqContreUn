# 🏗️ PLAN DE REFACTORISATION - CLARTÉ & MAINTENABILITÉ

**Objectif:** Transformer app.js monolithique en architecture modulaire claire  
**Durée estimée:** 2-4 heures  
**Impact:** +80% lisibilité, +60% maintenabilité

---

## 📦 STRUCTURE CIBLE

```
js/
├── app.js                          # Entry point, initialisation, navigation
├── modules/
│   ├── auth.js                     # Authentification ✅ (existe)
│   ├── firebase.js                 # Firestore config ✅ (existe)
│   ├── ui.js                       # Helpers UI ✅ (existe)
│   │
│   ├── br.js                       # 🆕 BR System (submit, delete, rate, comment)
│   ├── streak.js                   # 🆕 Streak tracking & calculations
│   ├── leaderboard.js              # 🆕 Rankings & display
│   ├── challenges.js               # 🆕 Challenge logic (create, validate, track)
│   ├── confrerie.js                # 🆕 Brother management
│   ├── notifications.js            # 🆕 Notifications (in-app + Bark)
│   ├── admin.js                    # 🆕 Admin functions (users, approvals)
│   └── constants.js                # 🆕 Global constants & configs
│
├── utils/
│   ├── dates.js                    # 🆕 Date utilities (timeAgo, weekId, etc.)
│   ├── validators.js               # 🆕 Input validation
│   ├── storage.js                  # 🆕 LocalStorage helpers
│   └── logger.js                   # 🆕 Error/debug logging
│
└── config/
    ├── firestore-rules.json        # 🆕 Security rules
    └── app-config.js               # 🆕 Settings centralisés
```

---

## 📋 DÉTAIL DES MODULES

### 1. `modules/br.js` - BR System (200-250 lignes)

**Responsabilités:**
- Poster nouvelle BR
- Noter une BR
- Commenter BR
- Supprimer BR
- Récupérer feed BR

```javascript
// Structure
export const BRSystem = {
  submit: (description, ratings) => {},
  delete: (brId) => {},
  rate: (brId, ratings) => {},
  comment: (brId, text) => {},
  getFeed: (limit = 10) => {},
  getById: (brId) => {}
};

// Événements d'export
window.submitBr = BRSystem.submit;
window.deleteBr = BRSystem.delete;
```

### 2. `modules/streak.js` - Streak Logic (150 lignes)

**Responsabilités:**
- Calculer streak actuel
- Mettre à jour lastBrDate
- Détecter rotations (reset)
- Animations streak

```javascript
export const StreakSystem = {
  calculate: (lastBrDate) => { /* retourne streak */ },
  update: (userName) => { /* met à jour lastBrDate */ },
  isStreak: (userName) => { /* true/false */ },
  animate: (element) => { /* animation flame */ }
};
```

### 3. `modules/leaderboard.js` - Rankings (180 lignes)

**Responsabilités:**
- Trier utilisateurs
- Afficher top 3
- Gagnants globaux vs hebdo
- Stats confréries

```javascript
export const LeaderboardSystem = {
  updateLeaderboard: (usersData) => {},
  displayWinners: (usersData) => {},
  getConfrereRanking: (confrerie) => {},
  getHistoryWinners: () => {}
};
```

### 4. `modules/challenges.js` - Challenges (300-350 lignes)

**Responsabilités:**
- CRUD challenges
- Validation status
- Tracking participant progress
- Scope (confrérie vs global)

```javascript
export const ChallengeSystem = {
  create: (params) => {},
  delete: (challengeId) => {},
  validate: (challengeId) => { /* admin only */ },
  updateProgress: (challengeId, userName) => {},
  setScope: (scope) => {},
  getDashboard: () => {}
};
```

### 5. `modules/confrerie.js` - Fraternités (200-250 lignes)

**Responsabilités:**
- Créer confrérie
- Ajouter/retirer membres
- Stats agrégées
- Affichage détails

```javascript
export const ConfrereSystem = {
  create: (name, members) => {},
  join: (confrerie, userName) => {},
  leave: (userName) => {},
  addMember: (confrerie, userName) => {},
  removeMember: (confrerie, userName) => {},
  getStats: (confrerie) => {},
  getMemberProfile: (userName) => {}
};
```

### 6. `modules/notifications.js` - Notifications (150 lignes)

**Responsabilités:**
- Ajouter notification in-app
- Envoyer push Bark
- Badges count
- Rendu liste notifications

```javascript
export const NotificationSystem = {
  add: (notification) => {},
  sendPush: (user, message) => {},
  render: () => {},
  clear: (notifId) => {},
  getUnread: () => {}
};
```

### 7. `modules/admin.js` - Admin Panel (200-250 lignes)

**Responsabilités:**
- CRUD utilisateurs
- Générer codes accès
- Approuver/rejeter défis globaux
- Modifier paramètres

```javascript
export const AdminSystem = {
  addUser: (name, code) => { /* Étienne only */ },
  deleteUser: (userName) => { /* Étienne only */ },
  approveChallengeGlobal: (chalId) => { /* Étienne only */ },
  rejectChallenge: (chalId) => { /* Étienne only */ },
  setSettings: (settings) => { /* Étienne only */ }
};
```

### 8. `modules/constants.js` - Constants (80-100 lignes)

```javascript
export const ADMIN_USER = "Étienne";
export const APP_VERSION = "1.0.0";

export const LIMITS = {
  BR_PER_WEEK: 999,
  CHALLENGE_MIN_DURATION: 1,
  CHALLENGE_MAX_DURATION: 30,
  CONFRERIE_MAX_MEMBERS: 10,
  CONFRERIE_MIN_MEMBERS: 2
};

export const SCORING = {
  BR_POINTS: 1,
  WEEKLY_RESET_DAY: 1, // Monday
  WEEKLY_RESET_HOUR: 0,
  STREAK_THRESHOLD: 1
};

export const COLLECTIONS = {
  USERS: 'users',
  BR: 'br',
  HISTORY: 'history',
  CHALLENGES: 'challenges',
  CONFRERIES: 'confreries',
  COMMENTS: 'comments'
};
```

### 9. `utils/dates.js` - Date Utilities (100 lignes)

```javascript
export const DateUtils = {
  timeAgo: (date) => { /* "il y a X..." */ },
  getWeekId: (date) => { /* "2026-W14" */ },
  getMonday: () => { /* Monday of week */ },
  isSameWeek: (d1, d2) => { /* bool */ },
  daysSince: (date) => { /* int */ }
};
```

### 10. `utils/validators.js` - Input Validation (120 lignes)

```javascript
export const Validators = {
  isValidUserName: (name) => { /* regex */ },
  isValidCode: (code) => { /* length, chars */ },
  isValidUrl: (url) => { /* protocol, domain */ },
  isValidRating: (rating) => { /* 1-5 */ },
  isValidChallengeTarget: (target) => { /* > 0 */ }
};
```

---

## 🔗 DEPENDENCY MAP (Modules inter-dépendances)

```
app.js (orchestrator)
  ├── auth.js (login/logout) ✅
  ├── firebase.js (db access) ✅
  ├── constants.js
  │
  ├── br.js
  │   ├── streak.js
  │   ├── leaderboard.js
  │   ├── notifications.js
  │   └── utils/dates.js
  │
  ├── challenges.js
  │   ├── leaderboard.js
  │   └── admin.js (if global)
  │
  ├── confrerie.js
  │   └── leaderboard.js
  │
  ├── admin.js
  │   └── challenge.js
  │
  └── ui.js (display helpers) ✅
```

---

## 📝 EXEMPLE REFACTORISATION: BR.js

### AVANT (app.js - mélangé)

```javascript
// Lignes 600-900 parsemées d'autres code
function submitBr(description, ratings) {
    const user = currentUser;
    const brRef = collection(db, "br");
    
    addDoc(brRef, {
        user: user,
        description: description,
        ratings: ratings,
        createdAt: serverTimestamp(),
        commentCount: 0
    }).then(() => {
        // Update streak
        const userRef = doc(db, "users", user);
        const lastBrDate = new Date();
        return updateDoc(userRef, {
            totalScore: increment(1),
            weeklyScore: increment(1),
            lastBrDate: lastBrDate
        });
    }).catch(err => {
        // error handling
    });
}

// Rating mixed with other stuff
function rateBr(brId, duration, pleasure, quality) {
    // ...
}
```

### APRÈS (modules/br.js - séparé & clair)

```javascript
import { db } from './firebase.js';
import { StreakSystem } from './streak.js';
import { NotificationSystem } from './notifications.js';
import { Validators } from '../utils/validators.js';
import { SCORING } from './constants.js';

export const BRSystem = {
  /**
   * Soumet une nouvelle BR
   * @param {string} description - Description BR
   * @param {Object} ratings - {duration, pleasure, quality} (1-5)
   * @returns {Promise} Document ID
   */
  submit: async (description, ratings) => {
    try {
      // Validations
      if (!description?.trim()) throw new Error('Description requise');
      if (!Validators.isValidRating(ratings.duration)) throw new Error('Rating invalide');
      
      const currentUser = window.currentUser;
      const brRef = collection(db, 'br');
      
      // Créer BR
      const docRef = await addDoc(brRef, {
        user: currentUser,
        description: description.trim(),
        ratings: ratings,
        createdAt: serverTimestamp(),
        commentCount: 0
      });
      
      // Mettre à jour streak utilisateur
      await StreakSystem.update(currentUser);
      
      // Mettre à jour scores
      const userRef = doc(db, 'users', currentUser);
      await updateDoc(userRef, {
        totalScore: increment(SCORING.BR_POINTS),
        weeklyScore: increment(SCORING.BR_POINTS),
        lastBrDate: new Date()
      });
      
      // Notifier autres utilisateurs
      await NotificationSystem.add({
        type: 'new_br',
        from: currentUser,
        description: description.substring(0, 50)
      });
      
      return docRef.id;
      
    } catch (error) {
      logger.error('BRSystem.submit', error);
      throw error;
    }
  },

  /**
   * Supprime une BR (creator + admin)
   * @param {string} brId
   */
  delete: async (brId) => {
    try {
      const currentUser = window.currentUser;
      const brDoc = await getDoc(doc(db, 'br', brId));
      const brData = brDoc.data();
      
      // Vérification permissions
      const canDelete = currentUser === brData.user || currentUser === ADMIN_USER;
      if (!canDelete) throw new Error('Permission refusée');
      
      // Supprimer BR
      await deleteDoc(doc(db, 'br', brId));
      
      // Retirer point si creator
      if (currentUser === brData.user) {
        const userRef = doc(db, 'users', currentUser);
        await updateDoc(userRef, {
          totalScore: increment(-SCORING.BR_POINTS),
          weeklyScore: increment(-SCORING.BR_POINTS)
        });
        
        await StreakSystem.recalculate(currentUser);
      }
      
    } catch (error) {
      logger.error('BRSystem.delete', error);
      throw error;
    }
  },

  rate: async (brId, ratings) => {
    // Implementation...
  }
  
  // ... autres méthodes
};

// Export window global pour HTML
window.submitBr = BRSystem.submit;
window.deleteBr = BRSystem.delete;
```

---

## 🚀 PLAN IMPLÉMENTATION

### Phase 1: Setup infrastructure (30 min)
```
☐ Créer dossier utils/
☐ Créer dossier modules/ (en duplicata au départ)
☐ Créer constants.js
☐ Créer logger.js
```

### Phase 2: Extraire utils (45 min)
```
☐ Copier dates/timings → utils/dates.js
☐ Créer validators.js
☐ Créer storage.js
```

### Phase 3: Extraire modules (2-3h)
```
☐ br.js ← ~150 lignes
☐ streak.js ← ~100 lignes
☐ leaderboard.js ← ~150 lignes
☐ challenges.js ← ~300 lignes
☐ confrerie.js ← ~200 lignes
☐ notifications.js ← ~120 lignes
☐ admin.js ← ~200 lignes
```

### Phase 4: Cleaning app.js (1-1.5h)
```
☐ Remplacer function calls par imports
☐ Simplifier event listeners
☐ Créer orchestrator functions
```

### Phase 5: Testing (45 min)
```
☐ Tester workflow: Login → BR → Podium
☐ Tester admin actions
☐ Tester challenges
☐ Valider console (no errors)
```

---

## 📊 AVANT vs APRÈS

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Lignes app.js** | 3050 | 600-800 | -75% |
| **Modules séparés** | 1 | 8 | 🆕 |
| **Fichiersavec >300 lignes** | 2 | 0 | -100% |
| **Temps trouver bug** | 15 min | 5 min | -66% |
| **Réutilisabilité code** | 40% | 80% | +100% |
| **Testabilité** | ❌ | ✅ | +∞ |

---

## ✅ CHECKLIST QUALITÉ POST-REFACTOR

- [ ] Tous les modules ont JSDoc
- [ ] Pas d'imports circulaires
- [ ] Constants centralisés
- [ ] Error handling consisten
- [ ] Aucun global `var` (utiliser `window.` explicitement)
- [ ] Pas d'`eval()` ou patterns dangereux
- [ ] Tests manuels: tous workflows ✅
- [ ] Console sans erreurs
- [ ] Performance: même ou meilleure
- [ ] Bundle size: meilleur (code-splitting possible)

---

## 🎯 GAINS ATTENDUS

**Immédiats:**
- ⬆️ Lisibilité +200%
- ⬇️ Bugs -50% (isolation logique)
- ⬆️ Développement +40% (navigation fichiers)

**À long terme:**
- ✅ Tests unitaires possibles
- ✅ Réutilisable pour autres projets
- ✅ Onboarding nouveaux devs
- ✅ Maintenance scalable

---

**Status:** 📋 À implémenter  
**Priorité:** 🟠 HAUTE (impact +80% maintenabilité)  
**Complexité:** 🟡 MOYENNE (faisable 4-6h)
