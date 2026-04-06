# 🧪 QUICK REFERENCE: BATTERIE TESTS

## ⚡ EN 30 SECONDES

```javascript
// Ouvrir Console (F12)
// Copier-coller ceci:

runAllTests()
```

Vérifier que tout montre ✅ (pas de ❌)

---

## 🔧 SI ERREUR DE CRÉATION

```javascript
// Reproduire l'erreur avec logs:
runAllTests.createChallenge()
```

**Chercher l'erreur exacte dans logs →searchdans ACTION_PLAN_TEST.md**

---

## ✅ TESTS RAPIDES

```javascript
// Test 1: Tout OK?
runAllTests()

// Test 2: Création marche?  
runAllTests.createChallenge()

// Test 3: Suppression?
window.deleteChallenge('challenge_123')  // (remplacer ID)

// Test 4: Progression?
window.displayChallengeProgress()

// Test 5: Scope buttons?
window.setChallengeScope('confrerie')
window.setChallengeScope('global')
```

---

## 🐛 ERREURS COURANTES

| Erreur | Fix |
|--------|-----|
| `permission-denied` | Firestore Rules → Allow write |
| `⚠️ target invalide` | Remplir Objectif > 0 |
| `USERS vide` | Attendre load + Reload |
| `currentUser undefined` | Vérifier connect + F5 |
| `Firestore DB non disponible` | Check firebase-config.js |

---

## 📊 SI TOUT FONCTIONNE

### Tester par UI:

1. **Création**: Nav → ⚔️ Défis → Proposer défi → Remplir → Launch
2. **Suppression**: Défis actifs → 🗑️ Supprimer → Confirm
3. **Progression**: 📊 Tab → Voir spermatozoids avancer
4. **Scope**: Buttons 🏰 / 🌍 → Feedback visuel

---

## 🎯 FICHES DÉTAILLÉES

| Document | Pour quoi |
|----------|----------|
| GUIDE_TESTS_DEFIS.md | Détail chaque test + erreurs |
| ACTION_PLAN_TEST.md | Plan étape par étape |
| TEST_SUITE_RECAP.md | Résumé système tests |

---

## 💻 COMMANDES CONSOLE

```javascript
// État du système:
console.table({
  user: window.currentUser,
  userCount: window.USERS.length,
  defisCount: window.challenges.length,
  db: !!window.db
})

// Voir mes défis:
window.challenges.filter(c => c.creator === window.currentUser)

// Voir un défi:
window.challenges[0]  // Premier défi

// Tester fonction:
window.setChallengeScope('confrerie')  // Doit changer buttons
```

---

**Ready? `runAllTests()` dans console! 🚀**
