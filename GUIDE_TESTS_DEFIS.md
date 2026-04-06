# 🧪 GUIDE BATTERIE DE TESTS - SYSTÈME DE DÉFIS

## 🚀 DÉMARRAGE RAPIDE

### Pour exécuter tous les tests:

1. **Ouvre DevTools Console** (F12 ou Ctrl+Shift+J)
2. **Tape**: `runAllTests()`
3. **Appuie Sur Entrée**

Cela exécutera **10 tests** qui couvrent:
- Variables globales
- Éléments HTML
- Lecture du formulaire
- Construction objet défi
- Fonctions exposées
- Firestore access
- Scope selector UI
- Progression visualization

---

## 🧪 TESTS SPÉCIFIQUES

### **TEST CRÉATION (avec logging détaillé)**

```javascript
// Dans console:
runAllTests.createChallenge()
```

Cela vous donnera un **flux étape par étape** de la création avec tous les détails:
- ✅ Étape 1: Récupération valeurs
- ✅ Étape 2: Validation
- ✅ Étape 3: Création participants
- ✅ Étape 4: Construction dates
- ✅ Étape 5: Objet défi
- ✅ Étape 6: Vérification Firestore
- ✅ Étape 7: Envoi Firestore

---

## 📋 INTERPRÉTATION DES RÉSULTATS

### **TEST 1: Variables Globales**

Si vous voyez ✅ pour tout:
```
✅ currentUser
✅ USERS
✅ db
✅ challenges
✅ deleteChallenge
✅ setChallengeScope
✅ displayChallengeProgress
```

**Excellent!** Tout est bien initialisé.

Si vous voyez ❌:
- `❌ currentUser` → Utilisateur pas identifié
- `❌ USERS` → Liste utilisateurs vide
- `❌ db` → Firestore pas initialisé
- `❌ challenges` → Array pas créé

### **TEST 2: Éléments HTML**

Tous les IDs doivent être trouvés (✅). Si ❌:
- `challenge-type` → <select> manquant
- `challenge-target` → <input> manquant
- `create-challenge-btn` → Bouton manquant
- Vérifier que index.html a les bons IDs

### **TEST 4: Construction Objet**

Vérifiable visuellement:
```
🎯 Objet Défi Créé:
id            | challenge_1712345678901
type          | br-count
title         | Défi: 10 BR
target        | 10
creator       | AlbertaX
participantCount | 8
durationDays  | 7
```

### **TEST 7: Firestore**

✅ Résultat idéal:
```
✅ Firestore accessible: 2 défis actifs trouvés
  - challenge_123...: Défi: 10 BR
  - challenge_456...: Défi: 5 points
```

❌ Si `permission-denied`:
- Vérifier Firestore Rules dans Firebase Console
- Doit être: `allow read, write: if request.auth != null;`

---

## 🔴 ERREURS COURANTES & SOLUTIONS

### **Erreur #1: "USERS est vide"**

```
⚠️ USERS vide! Fallback sur currentUser
```

**Cause**: USERS array n'est pas peuplée avant la création

**Solution**:
- Attendre que la page charge complètement (onSnapshot listener)
- Vérifier que l'utilisateur est connecté
- Check dans console: `console.log(window.USERS)`

### **Erreur #2: "permission-denied"**

```
❌ Erreur Firestore: permission-denied
```

**Cause**: Firestore rules interdisent write

**Solution**:
1. Aller à Firebase Console → Firestore → Rules
2. Mettre:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /challenges/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Publier les règles

### **Erreur #3: "unauthenticated"**

```
❌ Erreur Firestore: unauthenticated
```

**Cause**: Utilisateur pas authentifié

**Solution**:
- Se déconnecter et se connecter à nouveau
- Rafraîchir la page
- Vérifier Firebase Auth setup

### **Erreur #4: "target invalide"**

```
⚠️ Entre un objectif valide!
```

**Cause**: Champ "Objectif" vide ou < 1

**Solution**:
- Remplir le champ "Objectif: Exemple: 10 BR"
- Entrer un nombre > 0

---

## 🧬 DIAGNOSTIQUE AVANCÉ

### **Étape par étape de création**

```javascript
// 1. Vérifier les valeurs du formulaire
console.log('Formulaire:');
console.log(document.getElementById('challenge-type').value);
console.log(document.getElementById('challenge-duration').value);
console.log(document.getElementById('challenge-target').value);
console.log(document.getElementById('challenge-reward').value);

// 2. Vérifier les utilisateurs
console.log('Utilisateurs:', window.USERS);
console.log('User actuel:', window.currentUser);

// 3. Vérifier Firestore
console.log('DB disponible:', !!window.db);

// 4. Vérifier fonctions
console.log('createChallenge:', typeof window.createChallenge);
console.log('deleteChallenge:', typeof window.deleteChallenge);
```

### **Tester manuellement Firestore**

```javascript
// Dans console:

// 1. Test READ
const { getDocs, collection, query, where } = firebase.firestore;
const q = query(collection(firebase.app().firestore(), 'challenges'), 
                where('active', '==', true));
const snap = await getDocs(q);
console.log('Read test:', snap.size, 'défis');

// 2. Test WRITE (créer + supprimer test)
const testDoc = 'test_' + Date.now();
const { doc, setDoc, deleteDoc } = firebase.firestore;
const db = firebase.app().firestore();

await setDoc(doc(db, 'challenges', testDoc), {test: true, active: false});
console.log('Write test: OK');

await deleteDoc(doc(db, 'challenges', testDoc));
console.log('Delete test: OK');
```

---

## ✅ CHECKLIST AVANT UTILISATION

Avant de commencer à créer des défis, vérifier:

- [ ] Navigateur ouvert sur l'app (pas refresh pendant)
- [ ] Console DevTools ouverte (F12)
- [ ] Utilisateur identifié (voir "Salut X" en haut)
- [ ] Pas de message d'erreur rouge en console
- [ ] Firestore Rules correctement configurées
- [ ] Tests préalables passent (runAllTests() → tout ✅)

---

## 🐛 RAPPORT DE BUG

Si vous trouvez un bug, notez:

1. **Quelle étape exacte échoue?**
   - Création? Suppression? Affichage?

2. **Le message d'erreur exact** (from alert OR console)

3. **Output de**: `runAllTests()`

4. **Screenshots** de:
   - Console (F12)
   - Formulaire rempli
   - Erreur affichée

---

## 📞 COMMANDES UTILES

```javascript
// Voir tous les défis actuels
console.table(window.challenges);

// Voir l'utilisateur courant
console.log(window.currentUser);

// Voir tous les utilisateurs
console.table(window.USERS);

// Voir window.currentScope
console.log('Scope sélectionné:', window.currentScope);

// Forcer rechargement des défis
loadActiveChallenges();

// Switcher aux onglet défis
openChallengesModal();

// Test d'une fonction
window.setChallengeScope('confrerie');  // Change scope selector visually
window.displayChallengeProgress();      // Affiche progression tab
```

---

## 🚀 PROCHAINES ÉTAPES

Après validation des tests:

1. **Créer un défi de test**
   - Type: BR
   - Durée: 1 jour
   - Objectif: 5 BR
   - Récompense: Test 🧪

2. **Vérifier qu'il apparaît**
   - Dans "Défis actifs"
   - Sur l'accueil
   - Onglet "Progression"

3. **Soumettre des BR personnels**
   - Revenez à l'accueil
   - Cliquez le bouton principal
   - Confirmez 3-4 BR

4. **Vérifier la progression**
   - Allez à "Défis"
   - "Progression" tab
   - Voyez le spermatozoid avancer!

5. **Tester suppression** (creator only)
   - Allez à "Défis actifs"
   - Cliquez "🗑️ Supprimer"
   - Confirmez
   - Vérifie...z qu'il disparaît

---

**Bonne chance! 🍀 Vous avez tous les outils pour déboguer maintenant!**
