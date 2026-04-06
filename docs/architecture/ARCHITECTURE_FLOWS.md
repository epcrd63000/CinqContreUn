# 🎨 VISUALISATION ARCHITECTURE & FLUX DONNÉES

**Vue complète système** - Diagrammes & flux

---

## 🏗️ ARCHITECTURE SYSTÈME GLOBALE

```
╔════════════════════════════════════════════════════════════════════════╗
║                         UTILISATEUR                                    ║
║                    (Navigateur Web/App)                                ║
╚════════════════════════════════════════════════════════════════════════╝
                                  ↑ ↓
                         ┌─────────────────────┐
                         │  INTERFACE HTML/CSS │
                         │  • Écrans (Login)   │
                         │  • Modals (Défis)   │
                         │  • Classements      │
                         │  • Notifications    │
                         └─────────────────────┘
                                  ↑ ↓
          ╔═════════════════════════════════════════════════════╗
          ║       LOGIQUE MÉTIER (app.js + modules)            ║
          ║                                                     ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ EVENT LISTENERS                            │    ║
          ║  │ • Click buttons                            │    ║
          ║  │ • Form submissions                         │    ║
          ║  │ • Navigation tabs                          │    ║
          ║  └────────────────────────────────────────────┘    ║
          ║                    ↓                                ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ CONTROLLERS (setActiveTab, open*Modal)    │    ║
          ║  └────────────────────────────────────────────┘    ║
          ║                    ↓                                ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ BUSINESS LOGIC MODULES                     │    ║
          ║  │ • BRSystem (post/rate/delete)              │    ║
          ║  │ • ChallengeSystem (create/validate)        │    ║
          ║  │ • ConfrereSystem (manage members)          │    ║
          ║  │ • StreakSystem (calculate days)            │    ║
          ║  │ • LeaderboardSystem (rankings)             │    ║
          ║  │ • AdminSystem (approve global)             │    ║
          ║  │ • NotificationSystem (push/in-app)         │    ║
          ║  └────────────────────────────────────────────┘    ║
          ║                    ↓                                ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ DATA LAYER                                 │    ║
          ║  │ • Validators (input)                       │    ║
          ║  │ • Storage (localStorage)                   │    ║
          ║  │ • Logger (errors)                          │    ║
          ║  └────────────────────────────────────────────┘    ║
          ╚═════════════════════════════════════════════════════╝
                                  ↑ ↓
          ╔═════════════════════════════════════════════════════╗
          ║          FIREBASE (Cloud Backend)                   ║
          ║                                                     ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ FIRESTORE COLLECTIONS (Real-time)          │    ║
          ║  │ • users (totalScore, weeklyScore, streak)   │    ║
          ║  │ • br (description, ratings, createdAt)      │    ║
          ║  │ • comments (user, text, brId)               │    ║
          ║  │ • challenges (type, scope, status)          │    ║
          ║  │ • confreries (members, stats)                │    ║
          ║  │ • history (winner, score, weekId)           │    ║
          ║  └────────────────────────────────────────────┘    ║
          ║                    ↓                                ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ FIREBASE SECURITY RULES                    │    ║
          ║  │ ⚠️ À renforcer (règles simples)             │    ║
          ║  └────────────────────────────────────────────┘    ║
          ╚═════════════════════════════════════════════════════╝
                                  ↑ ↓
          ╔═════════════════════════════════════════════════════╗
          ║         SERVICES EXTERNES                            ║
          ║                                                     ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ Bark API (iOS Push Notifications)          │    ║
          ║  │ • Endpoint: push.bark.ru                   │    ║
          ║  │ • Optionnel: userKey (barkApiKey)          │    ║
          ║  └────────────────────────────────────────────┘    ║
          ║                                                     ║
          ║  ┌────────────────────────────────────────────┐    ║
          ║  │ Chart.js (Visualisations)                  │    ║
          ║  │ • Graphiques BR par user                   │    ║
          ║  │ • Progression défis                        │    ║
          ║  └────────────────────────────────────────────┘    ║
          ╚═════════════════════════════════════════════════════╝
```

---

## 📊 FLUX DONNÉES - EXEMPLE: Poster une BR

```
UTILISATEUR CLIQUE "VALIDER BR"
    ↓
[EVENT LISTENER] button#submit-br-btn click
    ↓
[CONTROLLER] ratingModalOverlay.display = 'none' (fermer modal)
    ↓
[FUNCTION] submitBr(description, ratings)
    ↓
[VALIDATION] 
  ✓ description non-vide?
  ✓ ratings 1-5?
  ✓ currentUser logged in?
    ↓ [PASS]
    ↓
[WRITE TO FIREBASE]
  FIRESTORE → br collection
    ├─ id: auto-generated
    ├─ user: "Victor"
    ├─ description: "Avec la main"
    ├─ ratings: {duration: 4, pleasure: 5, quality: 3}
    └─ createdAt: serverTimestamp()
    ↓
[UPDATE USER SCORES]
  FIRESTORE → users collection
    ├─ Victor.totalScore + 1 (42 → 43)
    ├─ Victor.weeklyScore + 1 (8 → 9)
    └─ Victor.lastBrDate = now (pour streak)
    ↓
[SYNC REAL-TIME]
  onSnapshot listeners triggered:
    ├─ usersData updated (Victor scores)
    ├─ brFeedList re-rendered
    └─ leaderboard updated
    ↓
[UI UPDATES AUTOMATICALLY]
  ✓ Victor.weeklyScore: 8 → 9 (badge)
  ✓ BR feed: nouvelle BR visible
  ✓ Classement: Victor rankup
  ✓ Notifications: Autres users voient BR Victor
    ↓
[NOTIFICATION]
  NotificationSystem.add({
    type: 'new_br',
    from: 'Victor'
  })
  ├─ In-app notif badge +1
  └─ IF Victor.barkApiKey exist:
     └─ Push iOS: "Victor a postée une BR"
    ↓
✅ COMPLETE - BR visible à tous, scores mis à jour
```

---

## 🔄 FLUX DONNÉES - EXEMPLE: Créer & Valider Défi Global

```
VICTOR CRÉE DÉFI GLOBAL "5 BRs du mois"
    ↓
[FORM SUBMIT] Challenge scope = 'global'
    ↓
[VALIDATION]
  ✓ Target > 0? (5 BRs)
  ✓ Duration valid? (30 jours)
  ✓ Type valid? (br-count)
    ↓
[CREATE IN FIREBASE]
  FIRESTORE → challenges collection
    ├─ id: auto-generated
    ├─ title: "5 BRs du mois"
    ├─ creator: "Victor"
    ├─ scope: "global" ← 🔑 KEY INDICATOR
    ├─ status: "pending" ← À VALIDER
    ├─ type: "br-count"
    ├─ target: 5
    ├─ duration: 30
    ├─ participants: {}
    └─ createdAt: serverTimestamp()
    ↓
[NOTIFICATION ADMIN]
  → Étienne reçoit notif: "Défi global en attente"
  → Button "Approuver" visible en admin panel
    ↓
[ÉTIENNE APPROUVE]
  ├─ Clique "Approuver dans admin modal
  ├─ [CHECK GUARD] if (currentUser === 'Étienne') ✅
  ├─ [CHECK STATUS] if (status === 'pending') ✅
  ├─ [CHECK SCOPE] if (scope === 'global') ✅
    ↓
[UPDATE FIRESTORE]
  challenges/{docId}:
    ├─ status: "pending" → "active" ✅
    ├─ approvedBy: "Étienne"
    └─ approvedAt: serverTimestamp()
    ↓
[REAL-TIME SYNC]
  onSnapshot triggered:
    └─ pendingChallenges list re-evaluated
    ↓
[UI UPDATE + NOTIFICATION]
  ✓ Défi disparait "en attente" list
  ✓ Défi apparait "actifs" list (tous users)
  ✓ Victor reçoit notif: "Défi approuvé! 🎉"
  ✓ Tous users voient: "5 BRs du mois - Victor"
    ↓
✅ DÉFI ACTIF - Participants peuvent rejoindre
```

---

## 🎯 FLUX ROLES & ACCÈS

```
REQUEST UTILISATEUR
    ↓
[AUTHENTIFICATION]
  ├─ if (!currentUser) → LOGIN_SCREEN
  └─ else → Valider permission
    ↓
[ROLE DETECTION]
  ├─ if (currentUser === 'Étienne')
  │   └─ role = 'ADMIN' → Access TOUT
  ├─ else if (document.creator === currentUser)
  │   └─ role = 'OWNER/CREATOR' → Access création + suppression propres
  └─ else
      └─ role = 'USER' → Access standards
    ↓
[PERMISSION CHECK]
  REQUEST_ACTION = deleteChallenge('someid')
    ├─ Is ADMIN? → ✅ ALLOW (toujours)
    ├─ Is CREATOR? → ✅ ALLOW (si creator)
    └─ Is USER? → ❌ DENY (seuls créator/admin)
    ↓
[ACTION EXECUTION]
  if (permitted) {
    Execute action
    Update database
    Sync real-time
    Notify users
  } else {
    Log error
    Show "Permission refusée"
    No data change
  }
    ↓
✅ COMPLETE
```

---

## 📈 FLUX SCORES & STREAK

```
DIMANCHE 23h59
  Victor.weeklyScore = 42 (gagné semaine)
  Victor.lastBrDate = "2026-04-05"
  Victor.currentStreak = 5 jours
    ↓
LUNDI 00:00 (RESET TIMER)
  ├─ NEW WEEK STARTED
  ├─ leaderboard = RESET
  └─ weeklyScore FOR ALL = 0
    ↓
VICTOR POSTE BR LUNDI
  setDoc(users/Victor, {
    totalScore: increment(1),    ← +1 (43 total)
    weeklyScore: increment(1),   ← +1 (0 → 1 cette semaine)
    lastBrDate: new Date()       ← Met à jour date
  })
    ↓
MARDI - VICTOR N'A PAS DE BR
  ├─ Victor.lastBrDate = "2026-04-06"
  ├─ Différence: now - lastBrDate = 1 jour
  ├─ currentStreak = 1 (reset à 0 si > 1 jour)
  └─ (Validation: si 2+ jours, streak break)
    ↓
MERCREDI - VICTOR REVIENT
  ├─ setDoc(users/Victor, { lastBrDate: now })
  ├─ Calcul: (now - lastBrDate) = 0 jours (consécutif!)
  ├─ currentStreak = 2 jours + 🔥
  └─ Notification: "Streak +1! 🔥"
    ↓
DYNAMIQUE SCORES:
  
  totalScore:   CUMULATIVE (NEVER reset)  🏆
    └─ À fin année: Gagnant = max(totalScore)
  
  weeklyScore:  RESET chaque lundi 00:00 🔥
    └─ À chaque dimanche: Gagnant = max(weeklyScore)
  
  currentStreak: TRACKED (peut reset à 0) ⚡
    └─ À N'IMPORTE QUELmoment: Gagnant = max(currentStreak)

  ✅ COMPLETE TRACKING
```

---

## 🔐 FLUX SÉCURITÉ & VALIDATION

```
ACTION SENSIBLE = deleteUserBr(brId)
    ↓
[GUARD 1: AUTHENTICATION]
  if (!currentUser) return;
    ↓ [GUARD 2: OWNERSHIP]
  const brData = await getDoc(br/brId);
  if (currentUser !== brData.user && !isAdmin())
    return error('Permission refusée');
    ↓ [GUARD 3: DATA VALIDATION]
  if (!brId || !brId.trim()) return error('ID invalid');
    ↓ [GUARD 4: CONSISTENCY CHECK]
  const userRef = doc(users/currentUser);
  const userData = await getDoc(userRef);
  if (userData.totalScore < 1) return error('Score < 1');
    ↓
✅ ALL GUARDS PASS → Proceed
    ├─ deleteDoc(br/brId)
    ├─ updateDoc(users/currentUser, {
    │    totalScore: decrement(1),
    │    weeklyScore: decrement(1)
    │  })
    ├─ Log action
    └─ Update UI
    ↓
✅ SECURE & COMPLETE
```

---

## 🌊 FLUX NOTIFICATIONS (In-app + Push)

```
ÉVÉNEMENT SYSTÈME
  • Nouvelle BR postée
  • Commentaire sur ta BR
  • Défi global approuvé
  • Membre rejoint confrérie
    ↓
[TRIGGER NOTIFICATION]
  NotificationSystem.add({
    type: 'new_br',
    from: 'Victor',
    description: 'Avec la main'
  })
    ↓
    ├─ SAVE TO STATE
    │  └─ notifications[] array += notification
    │
    └─ RENDER UI
       ├─ Badge: unreadCount +1
       ├─ Sound: beep
       └─ List: nouvelle notif visible
    ↓
[CHECK PUSH CONDITIONS]
  if (targetUser.barkApiKey) {
    ├─ Construct message
    ├─ POST to Bark API
    ├─ Response: OK or ERROR
    └─ Log result
  } else {
    └─ In-app only (no push)
  }
    ↓
[USER ACTIONS]
  ├─ Clique notification → open BR detail
  └─ Clique X → mark as read
    ↓
✅ NOTIFICATION COMPLETE
```

---

## 📋 SEQUENCE: Créer Confrérie + Ajouter Victor

```
PAUL CRÉE CONFRÉRIE
    ↓
[INPUT] name: "Les Trois Mousquetaires"
    ↓
[CREATE]
  FIRESTORE → confreries/{newDocId}
    ├─ name: "Les Trois Mousquetaires"
    ├─ creatorId: "Paul"
    ├─ members: ["Paul"]
    ├─ totalScore: 0
    ├─ weeklyScore: 0
    └─ createdAt: serverTimestamp()
    ↓
[UPDATE PAUL]
  FIRESTORE → users/Paul
    └─ confrerie: {newDocId}  ← Link to confrérie
    ↓
[RENDER UI]
  ✓ Paul.header: "Ma Confrérie: Les Trois..."
  ✓ Confrérie card visible
  ✓ Button "Ajouter membres"
    ↓
PAUL INVITE VICTOR
    ↓
[INPUT] Select Victor from dropdown
    ↓
[PERMISSION CHECK]
  if (currentUser === 'Paul' && Paul.isCreator) ✅
    ↓
[UPDATE FIRESTORE]
  FIRESTORE → confreries/{id}
    └─ members: ["Paul", "Victor"]
    
  FIRESTORE → users/Victor
    └─ confrerie: {id}
    ↓
[SYNC & UPDATE]
  onSnapshot triggered:
    ├─ Victor.header: "Ma Confrérie: Les Trois..."
    ├─ Victor notification: "Tu as rejoint!"
    ├─ Membre list updated
    └─ Stats agrégées recalculées
    ↓
✅ CONFRÉRIE CREATED & MEMBER ADDED
```

---

## 🧮 CALCUL CLASSEMENT CONFRÉRIE

```
CONFRÉRIE: "Les Trois Mousquetaires"
Members: Paul, Victor, Jules

CETTE SEMAINE:
├─ Paul:  weeklyScore = 12
├─ Victor: weeklyScore = 8
└─ Jules: weeklyScore = 5

CALCUL:
  1️⃣ Total confrérie = 12 + 8 + 5 = 25 pts 🏆
  2️⃣ Classement interne:
     ├─ 1️⃣ Paul (12)
     ├─ 2️⃣ Victor (8)
     └─ 3️⃣ Jules (5)
  3️⃣ Position global vs autres confréries:
     ├─ Confrérie A: 30 pts → Rank #1
     ├─ Les Trois... : 25 pts → Rank #2 ← NOTRE
     └─ Confrérie C: 20 pts → Rank #3

AFFICHAGE:
  Confrérie Card:
    ├─ "Les Trois Mousquetaires"
    ├─ 🏆 25 pts cette semaine
    ├─ 📍 Classement: #2 (vs 6 confréries)
    ├─ Membres: 3
    └─ [Button: Voir détails]
  ↓ Clique détails:
    ├─ Stats agrégées:
    │  ├─ Total: 25
    │  ├─ Semaine: 25
    │  └─ Classement: #2
    └─ Classement membres:
       ├─ 1️⃣ Paul (12) ← TOP
       ├─ 2️⃣ Victor (8)
       └─ 3️⃣ Jules (5)

✅ CONFRÉRIE RANKING DISPLAYED
```

---

## 📊 TABLEAU: FEATURES vs MODULES

```
┌─────────────────────────────────────┬──────────────────────┐
│ FEATURE                             │ MODULE TARGET        │
├─────────────────────────────────────┼──────────────────────┤
│ Login/Logout                        │ auth.js ✅ (existe)  │
│ Post BR                             │ br.js 🆕             │
│ Rate BR                             │ br.js 🆕             │
│ Comment BR                          │ br.js 🆕             │
│ Delete BR                           │ br.js 🆕             │
│ Streak calculation                  │ streak.js 🆕         │
│ Leaderboard                         │ leaderboard.js 🆕    │
│ Winners display                     │ leaderboard.js 🆕    │
│ Create challenge                    │ challenges.js 🆕     │
│ Validate challenge                  │ challenges.js 🆕     │
│ Delete challenge                    │ challenges.js 🆕     │
│ Challenge progress                  │ challenges.js 🆕     │
│ Create confrérie                    │ confrerie.js 🆕      │
│ Manage members                      │ confrerie.js 🆕      │
│ Confrérie stats                     │ confrerie.js 🆕      │
│ Admin panel                         │ admin.js 🆕          │
│ Approve global challenge            │ admin.js 🆕          │
│ User management                     │ admin.js 🆕          │
│ Notifications (in-app)              │ notifications.js 🆕  │
│ Push notifications (Bark)           │ notifications.js 🆕  │
│ Date utilities                      │ utils/dates.js 🆕    │
│ Input validation                    │ utils/validators.js  │
│ LocalStorage                        │ utils/storage.js 🆕  │
│ Error logging                       │ utils/logger.js 🆕   │
└─────────────────────────────────────┴──────────────────────┘
```

---

## 🎬 QUICK START: Comprendre Flow

**3 flux importants à maîtriser:**

1. ✅ **BR Posting** (app.js 600-900 → BR.js put)
2. ✅ **Challenge Global** (app.js 2600-2700 → Challenges.js + Admin.js)
3. ✅ **Access Control** (Tous fichiers → ROLES_ACCES_PERMISSIONS.md)

---

**Diagrams:** Architecture & flows  
**Version:** 1.0  
**Date:** 6 avril 2026
