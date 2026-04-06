/**
 * DIAGNOSTIC RAPIDE - À copier-coller dans console (F12)
 * 
 * Cela affichera EXACTEMENT le problème avec la création de défis
 */

console.log('%c🔍 DIAGNOSTIC RAPIDE DÉFIS', 'color: #ff6600; font-size: 16px; font-weight: bold;');
console.log('='.repeat(60));

// Test 1: Utilisateur
console.log('\n1️⃣ UTILISATEUR:');
console.log('   currentUser:', window.currentUser || '❌ UNDEFINED');

// Test 2: Utilisateurs
console.log('\n2️⃣ LISTE UTILISATEURS:');
console.log('   USERS exists:', !!window.USERS);
console.log('   USERS count:', window.USERS?.length || 0);
if (!window.USERS || window.USERS.length === 0) {
    console.warn('   ⚠️ USERS vide! Cela pourrait causer des erreurs');
}

// Test 3: Firebase
console.log('\n3️⃣ FIREBASE:');
console.log('   db exists:', !!window.db);
if (!window.db) {
    console.error('   ❌ FIREBASE NON INITIALISÉ - Cela bloquera la création!');
}

// Test 4: Éléments HTML
console.log('\n4️⃣ ÉLÉMENTS FORMULAIRE:');
const elements = {
    'challenge-type': document.getElementById('challenge-type'),
    'challenge-duration': document.getElementById('challenge-duration'),
    'challenge-target': document.getElementById('challenge-target'),
    'challenge-reward': document.getElementById('challenge-reward'),
    'create-challenge-btn': document.getElementById('create-challenge-btn')
};

Object.entries(elements).forEach(([id, elem]) => {
    const status = elem ? '✅' : '❌';
    console.log(`   ${status} #${id}`);
});

// Test 5: Fonctions exposées
console.log('\n5️⃣ FONCTIONS:');
console.log('   createChallenge:', typeof window.createChallenge);
console.log('   deleteChallenge:', typeof window.deleteChallenge);
console.log('   setChallengeScope:', typeof window.setChallengeScope);
console.log('   displayChallengeProgress:', typeof window.displayChallengeProgress);

// Test 6: Valeurs formulaire
console.log('\n6️⃣ VALEURS FORMULAIRE ACTUELLES:');
const type = document.getElementById('challenge-type')?.value;
const duration = document.getElementById('challenge-duration')?.value;
const target = document.getElementById('challenge-target')?.value;
const reward = document.getElementById('challenge-reward')?.value;

console.log('   Type:', type || 'VIDE');
console.log('   Durée:', duration || 'VIDE');
console.log('   Target:', target || 'VIDE');
console.log('   Reward:', reward || 'VIDE');

if (!target || parseInt(target) < 1) {
    console.error('   ❌ TARGET INVALIDE - La création sera bloquée!');
}

// Test 7: Défis chargés
console.log('\n7️⃣ DÉFIS ACTUELS:');
console.log('   challenges exists:', !!window.challenges);
console.log('   challenges count:', window.challenges?.length || 0);

// Résumé
console.log('\n' + '='.repeat(60));
console.log('%c📋 RÉSUMÉ', 'color: #00ff00; font-weight: bold;');

const issues = [];
if (!window.currentUser) issues.push('❌ currentUser undefined');
if (!window.db) issues.push('❌ Firebase pas initialisé');
if (!window.USERS || window.USERS.length === 0) issues.push('⚠️ USERS vide');
if (!document.getElementById('challenge-target')) issues.push('❌ Formulaire manquant');
if (!document.getElementById('challenge-target')?.value) issues.push('⚠️ Target field vide');

if (issues.length === 0) {
    console.log('%c✅ TOUT SEMBLE OK - Créez un défi de test', 'color: #00ff00; font-weight: bold;');
    console.log('Puis, si erreur, revenir ici et exécuter: runAllTests.createChallenge()');
} else {
    console.log('%c❌ PROBLÈMES DÉTECTÉS:', 'color: #ff0000; font-weight: bold;');
    issues.forEach(issue => console.log('   ' + issue));
}

console.log('\n💡 PROCHAINE ÉTAPE:');
console.log('   runAllTests.createChallenge()  ← Pour tester avec logs détaillés');
console.log('\n');
