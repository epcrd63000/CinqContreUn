# 📱 CinqContreUn - Spécifications Fonctionnelles

**Version**: 1.0 (April 3, 2026)  
**Dernier Update**: Suppression cascade + Likes 1/user + Clarté hebdo

---

## 🎯 Vision Générale

**CinqContreUn** est une app gamifiée pour tracker et compétitionner sur les "BR" (actions) par **semaines** (lundi→dimanche).

**Principes Clés:**
- ✅ **Rythme hebdomadaire**: Tout est organisé par semaine ISO
- ✅ **Suppression en cascade**: Supprimer une BR = moins les scores
- ✅ **Social + Compétition**: Likes, commentaires, défis entre amis
- ✅ **Notifications**: Push Bark en temps réel + historique

---

## 🏗️ Architecture

### Firestore Collections

```
users/
├── {userId}
│   ├── name: string (affiché)
│   ├── confrerieId: string (ID de la confrérie)
│   ├── totalScore: number (tous les temps)
│   ├── weeklyScore: number (semaine actuelle)
│   ├── photo: string (URL)
│   ├── barkApiKey: string (privé)
│   └── lastIpAddress: string (pour auto-login)

confreries/
├── {confrerieId}
│   ├── name: string
│   ├── description: string
│   ├── members: array[userId]
│   └── createdAt: timestamp

br/
├── {brId}
│   ├── user: string (userId)
│   ├── description: string
│   ├── weekId: string (ISO week: "2026-W14")
│   ├── ratings: { duration, pleasure, quality } (1-5)
│   ├── commentCount: number
│   ├── createdAt: timestamp
│   ├── likedBy: object (deprecated, unused)
│   └── comments/
│       └── {commentId}
│           ├── user: string
│           ├── text: string
│           ├── createdAt: timestamp
│           ├── parentId: string | null (null = parent, string = reply)
│           ├── likedBy: { [userId]: true } (1 like max/user)
│           └── replies/... (nested)

challenges/
├── {challengeId}
│   ├── title: string
│   ├── type: "BR" | "streak" | "points"
│   ├── creator: string (userId)
│   ├── opponents: array[userId]
│   ├── startDate: timestamp
│   ├── endDate: timestamp
│   ├── target: number (ex: 5 BR pour gagner)
│   ├── reward: string
│   ├── active: boolean
│   └── participants: object
│       ├── {userId}: { user, br, currentScore }

notifications/
└── [local storage] (historique affiché sur l'app)
```

---

## 📋 Modules Fonctionnels

### 1️⃣ **AUTHENTIFICATION & PROFIL**

**Flux:**
- User clique sur un user → code secret (localStorage)
- Auto-login par IP si disponible
- Avatar éditable (photo upload)

**Exigences:**
- ✅ Login sécurisé par code
- ✅ Auto-login IP (localStorage)
- ✅ Photo de profil
- ✅ Affichage confrérie du user

**Données:**
- currentUser = string (username)
- localStorage.cinqContreUnUser = username
- localStorage.cinqContreUnPhoto_{user} = photo URL

---

### 2️⃣ **SYSTÈME DE BR** (Core)

**Qu'est-ce qu'une BR?**
- Une action enregistrée: description libre
- Rating 1-5 sur 3 critères: durée, plaisir, qualité
- Score: +1 total, +1 semaine

**Flux:**
1. User clique le gros bouton 🖐️
2. Modal de notation (3 sliders 1-5)
3. Input texte optionnel
4. Submit → Score +1 total & +1 semaine
5. BR apparait dans le feed

**Exigences:**
- ✅ BR créée avec weekId auto
- ✅ Scores incrémentés (total + weekly)
- ✅ Commentaire count = 0
- ✅ Rating moyen calculé (durée+plaisir+qualité)/3
- ✅ Feed ordonné par date DESC

**Suppression BR:**
- User = creator ou Admin
- Bouton 🗑️ sur chaque BR
- Supprime: BR + ALL comments
- Scores: -1 total, -1 weekly (si semaine actuelle)

---

### 3️⃣ **LEADERBOARD**

**Affichage:**
- Tab "BR" (🔥) = Feed des BR de la semaine
- Tab "Accueil" (🏠) = Leaderboard complet semaine

**Leaderboard:**
- Trié par weeklyScore DESC
- Affiche: position, avatar, nom, score, commentaire count
- Selectable = voir détails du user

**Exigences:**
- ✅ Mise à jour temps réel (onSnapshot)
- ✅ Tri par score semaine
- ✅ Reset auto lundi (checkWeeklyReset)
- ✅ Scoring: +1 BR = +1 weekly

---

### 4️⃣ **COMMENTAIRES & LIKES**

**Vous pouvez:**
- Commenter une BR (chaîné par parentId)
- Liker un commentaire (1 par user max)
- Répondre à un commentaire

**Like System:**
- Ancien: `likes: 0` (nombre, bug: spam possible)
- **Nouveau**: `likedBy: { [userId]: true }` (set)
- Logique: Toggle like (click = add/remove)
- Count: `Object.keys(likedBy).length`

**Suppression Comment:**
- Ancien: Admin seulement
- **Nouveau**: User (creator) + Admin
- Supprime le comment + ses replies
- Décrémente commentCount de la BR

**Exigences:**
- ✅ 1 like par user maximum
- ✅ Only creator/admin can delete
- ✅ Nested replies avec parentId
- ✅ CommentCount sync

---

### 5️⃣ **NOTIFICATIONS**

**Types:**
- **Bark**: Push via API (jour.app/{key})
- **Local**: Badge + historique affichage

**Événements notifiés:**
- Nouvelle BR postée (tous les users)
- ~~Reçu un like~~ (pas encore)
- ~~Nouveau commentaire~~ (pas encore)

**Fonctionnement:**
- Global listener sur collection "br"
- Événement "added" = envoyer notif
- Bark API: titre + body
- Local: timestamp + texte

**Exigences:**
- ✅ Listener temps réel
- ✅ Bark pour TOUTES les BR
- ✅ Badge avec count
- ✅ Historique affichable

---

### 6️⃣ **CONFRÉRIES** (Groupes)

**C'est quoi?**
- Un groupe d'amis
- Members: array[userId]
- Description: texte libre
- Admin: peut éditer

**Affichage:**
- Tab "Confrérie" (👑) = vue du groupe
- Cards des members
- Bio/description du groupe
- Gestion members (admin)

**Exigences:**
- ✅ Members listés
- ✅ Edition bio (admin)
- ✅ Profil du member détaillé
- ✅ Vue confrérie = leaderboard du groupe

---

### 7️⃣ **DÉFIS** (Challenges)

**Fonctionnement:**
- **Type**: BR (count), streak (jours consécutifs), points (cumul)
- **Création**: Choix type + durée + cible + récompense + adversaires
- **Opponents**: Sélection depuis la confrérie
- **Suivi**: Progress bar live par participant
- **Affichage**: 
  - Modal avec 3 tabs (actifs/créer/historique)
  - Cards sur accueil (top 2 défis)
  - Animations agressives

**Exigences:**
- ✅ Créer défi (date début/fin)
- ✅ Sélectionner opponents (Firestore direct, pas USERS array)
- ✅ Tracker participants en temps réel
- ✅ Progress % = (currentScore / target) * 100
- ✅ Active = true/false trigger animations
- ⚠️ Bug: Error log après création (à fixer)
- ⚠️ Bug: Noms défis tronqués sur mobile (à fixer)

---

### 8️⃣ **ADMIN PANEL**

**Accès**: Admin user = "Étienne"

**Fonctionnalités:**
- Gestion utilisateurs (add/edit/delete)
- Gestion confréries (add/edit/delete)
- Edition scores manuels
- Suppression BR

**Exigences:**
- ✅ Sécurisé (currentUser === ADMIN_USER)
- ✅ CRUD complet users
- ✅ CRUD complet confreries
- ✅ Edit scores sur commande

---

## 🎨 UI/UX Elements

### Navigation (Tab Bar)
```
[🏠 Accueil] [🔥 BR] [⚔️ Défis] [🔔 Notif] [👑 Confrérie]
```
- Active tab: primary-color (#b81c22)
- Inactive: text-muted (#666)
- Badge sur notifications counter

### Animations
- **Motivational Text**: challengePulse
  - Scale: 0.6 → 1.3 → 1
  - Rotate: -5deg, +3deg, -2deg, +4deg
  - Color: red → gold → secondary
  - Runs: every 3s, 0.6s duration
- **Button Sound**: Web Audio
  - Duolingo 2-tone: Do (523.25Hz) + Mi (659.25Hz)
  - On BR button click

### Mobile Optimization
- ⚠️ Défi names: Tronqués sur mobile
  - Fix: word-break/overflow-wrap css

---

## 📊 Logique Métier

### Score System

**Total Score:**
- +1 chaque BR créée
- -1 si BR supprimée
- Persistent (tous les temps)

**Weekly Score:**
- +1 chaque BR créée (si weekId = current)
- -1 si BR supprimée (si weekId = current)
- **Reset** chaque lundi (ISO week change)

**Week Calculation:**
```javascript
function getISOWeekString() {
  // Retourne "2026-W14" (semaine ISO)
}
```

### Defender Logic (Cas d'usage)

**Scenario: User crée BR lundi W14**
- totalScore: 5 → 6
- weeklyScore: 3 → 4
- weekId: "2026-W14"

**Scenario: User supprime BR mardi W14**
- totalScore: 6 → 5
- weeklyScore: 4 → 3
- Le weekId de la BR était "2026-W14" (même semaine) → -1 weekly

**Scenario: Lundi W15 = auto reset**
- weeklyScore: 0 (reset)
- totalScore: 5 (unchanged)
- New listeners pour W15

---

## 🐛 Bugs Connus

### 🔴 ACTIFS
1. **Création Défi Error Log**
   - Symptôme: Log SUCCESS puis ERROR après création
   - Défi créé dans DB et visible quand même
   - Cause: À investiguer (likely promise/catch issue)
   - Impact: UX confus, mais fonctionnel

2. **Noms Défis Truncated Mobile**
   - Symptôme: Texte du défi coupé sur petits écrans
   - Cause: CSS overflow-wrap/word-break manquant
   - Fix: Ajouter CSS aux cards défis

### ✅ FIXÉS (v1.0)
- ✅ Opponent selection undefined (fixed: Firestore direct)
- ✅ Likes spam (fixed: 1 per user)
- ✅ Solo comment deletion (fixed: user + admin)
- ✅ BR score inconsistency (fixed: cascade delete)

---

## 🚀 Roadmap Futures

### Phase 2 (À implémenter)
- [ ] Défis: Pauffinement logique (victories, rankings)
- [ ] Notifications: Reply notifs, likes notifs
- [ ] Analytics: Graphiques stats séries BR/scores
- [ ] Replay: Historique complet BR past weeks
- [ ] Streaks: Système de streak (jours consécutifs)
- [ ] Achievements: Badges/trophées
- [ ] Export: CSV/PDF stats

---

## 📝 Checklist Qualité (v1.0)

**Core Features:**
- [x] Login + auto-login IP
- [x] BR creation + rating + comments
- [x] Real-time leaderboard
- [x] Notifications (Bark + local)
- [x] Comments + likes (1 per user)
- [x] BR deletion (cascade)
- [x] Confréries view
- [x] Challenges (create/track/display)
- [x] Admin panel

**UX/Navigation:**
- [x] 5-tab navigation
- [x] Clear active tab indicator
- [x] Animations (motivational text + sound)
- [x] Weekly rhythm visible
- [ ] Mobile optimization (names truncated - TODO)

**Data Integrity:**
- [x] Cascade deletes working
- [x] Weekly reset functioning
- [x] Like system 1-per-user
- [x] Comment threading (parentId)
- [x] Firestore security rules (manual)

**Bugs:**
- [ ] Fix challenge creation error log
- [ ] Fix mobile name truncation

---

## 🔐 Security Notes

**Current Implementation:**
- Admin checks: `currentUser === ADMIN_USER` (server side needed)
- User photos: localStorage (no server validation)
- Bark API keys: Stored in user doc (risky: expose in client)

**Recommendations (Future):**
- Move API keys to backend/env
- Implement Firestore security rules
- Rate limiting on BR creation
- Photo upload validation

---

**Last Updated**: April 3, 2026 - v1.0 Release
