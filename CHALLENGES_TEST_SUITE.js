// ================================================
// BATTERIE DE TESTS: SYSTÈME DE DÉFIS
// ================================================

console.log('%c🧪 DÉMARRAGE BATTERIE DE TESTS DÉFIS', 'color: #00ff00; font-size: 14px; font-weight: bold;');

// ============================================
// TEST 1: VÉRIFIER VARIABLES GLOBALES
// ============================================
function testVariablesGlobales() {
    console.log('%c\n=== TEST 1: Variables Globales ===', 'color: #ffff00; font-weight: bold;');
    
    const results = {};
    
    // Test currentUser
    console.log('✓ currentUser:', typeof window.currentUser, `"${window.currentUser}"`);
    results.currentUser = window.currentUser ? '✅' : '❌ MANQUANT';
    
    // Test USERS array
    console.log('✓ USERS:', Array.isArray(window.USERS) ? 'Array' : typeof window.USERS, `(length: ${window.USERS?.length || 0})`);
    results.USERS = Array.isArray(window.USERS) && window.USERS.length > 0 ? '✅' : '❌ VIDE/UNDEFINED';
    
    // Test db (Firestore)
    console.log('✓ db:', typeof window.db, window.db ? '(initialized)' : '(NOT initialized)');
    results.db = window.db ? '✅' : '❌ NOT INITIALIZED';
    
    // Test challenges array
    console.log('✓ challenges:', Array.isArray(window.challenges) ? 'Array' : typeof window.challenges, `(${window.challenges?.length || 0})`);
    results.challenges = Array.isArray(window.challenges) ? '✅' : '❌ INVALID TYPE';
    
    // Test fonctions exposées
    console.log('✓ window.deleteChallenge:', typeof window.deleteChallenge);
    results.deleteChallenge = typeof window.deleteChallenge === 'function' ? '✅' : '❌ NOT FUNCTION';
    
    console.log('✓ window.setChallengeScope:', typeof window.setChallengeScope);
    results.setChallengeScope = typeof window.setChallengeScope === 'function' ? '✅' : '❌ NOT FUNCTION';
    
    console.log('✓ window.displayChallengeProgress:', typeof window.displayChallengeProgress);
    results.displayChallengeProgress = typeof window.displayChallengeProgress === 'function' ? '✅' : '❌ NOT FUNCTION';
    
    console.table(results);
    return results;
}

// ============================================
// TEST 2: VÉRIFIER HTML ÉLÉMENTS
// ============================================
function testHTMLElements() {
    console.log('%c\n=== TEST 2: Éléments HTML ===', 'color: #ffff00; font-weight: bold;');
    
    const results = {};
    
    const ids = [
        'challenge-type',
        'challenge-duration',
        'challenge-target',
        'challenge-reward',
        'create-challenge-btn',
        'challenge-scope-confr',
        'challenge-scope-global',
        'challenge-progress-container',
        'no-active-challenges'
    ];
    
    ids.forEach(id => {
        const elem = document.getElementById(id);
        const exists = elem ? '✅' : '❌';
        const type = elem ? elem.tagName : 'N/A';
        console.log(`${exists} #${id} (${type})`);
        results[id] = elem ? '✅' : '❌ NOT FOUND';
    });
    
    console.table(results);
    return results;
}

// ============================================
// TEST 3: LECTURE FORMULAIRE
// ============================================
function testFormReading() {
    console.log('%c\n=== TEST 3: Lecture Formulaire ===', 'color: #ffff00; font-weight: bold;');
    
    const type = document.getElementById('challenge-type')?.value;
    const duration = document.getElementById('challenge-duration')?.value;
    const target = document.getElementById('challenge-target')?.value;
    const reward = document.getElementById('challenge-reward')?.value;
    
    console.log('📋 Valeurs formulaire:');
    console.log(`  - Type: "${type}" (${typeof type})`);
    console.log(`  - Durée: "${duration}" (${typeof duration}) → number: ${parseInt(duration)}`);
    console.log(`  - Target: "${target}" (${typeof target}) → number: ${parseInt(target)}`);
    console.log(`  - Récompense: "${reward}"`);
    
    const validation = {
        typeValid: type ? '✅' : '❌',
        durationValid: duration && parseInt(duration) > 0 ? '✅' : '❌',
        targetValid: target && parseInt(target) > 0 ? '✅' : '❌',
        rewardValid: reward ? '✅' : '❌'
    };
    
    console.table(validation);
    return { type, duration, target, reward, validation };
}

// ============================================
// TEST 4: CONSTRUCTION OBJET DÉFI
// ============================================
function testConstructionChallenge() {
    console.log('%c\n=== TEST 4: Construction Objet Défi ===', 'color: #ffff00; font-weight: bold;');
    
    // Récupérer les valeurs
    const type = document.getElementById('challenge-type')?.value || 'br-count';
    const duration = parseInt(document.getElementById('challenge-duration')?.value || '7');
    const target = parseInt(document.getElementById('challenge-target')?.value || '1');
    const reward = document.getElementById('challenge-reward')?.value || 'Mystérieux!';
    
    // Créer participants
    const participantsObj = {};
    if (window.USERS && window.USERS.length > 0) {
        console.log(`✓ Ajout de ${window.USERS.length} participants:`);
        window.USERS.forEach(user => {
            participantsObj[user.name] = { user: user.name, br: 0 };
            console.log(`  - ${user.name}`);
        });
    } else {
        console.warn('⚠️ USERS vide! Fallback sur currentUser');
        participantsObj[window.currentUser] = { user: window.currentUser, br: 0 };
    }
    
    // Créer dates
    const now = new Date();
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    // Construire objet défi
    const newChallenge = {
        id: `challenge_${Date.now()}`,
        type,
        title: `Défi: ${target} ${type === 'br-count' ? 'BR' : type === 'streak' ? 'jours' : 'points'}`,
        target: target,
        reward,
        creator: window.currentUser,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        participants: participantsObj,
        active: true
    };
    
    console.log('🎯 Objet Défi Créé:');
    console.table({
        id: newChallenge.id,
        type: newChallenge.type,
        title: newChallenge.title,
        target: newChallenge.target,
        creator: newChallenge.creator,
        participantCount: Object.keys(newChallenge.participants).length,
        durationDays: duration,
        startDate: newChallenge.startDate.substring(0, 10),
        endDate: newChallenge.endDate.substring(0, 10)
    });
    
    return newChallenge;
}

// ============================================
// TEST 5: SIMULATION CRÉATION (SANS FIREBASE)
// ============================================
async function testSimulationChallenge() {
    console.log('%c\n=== TEST 5: Simulation Création (NO FIRESTORE) ===', 'color: #ffff00; font-weight: bold;');
    
    try {
        const challenge = testConstructionChallenge();
        
        console.log('✅ Objet défi valide et constructible');
        console.log('✓ ID:', challenge.id);
        console.log('✓ Titre:', challenge.title);
        console.log('✓ Participants:', Object.keys(challenge.participants).length);
        
        return { success: true, challenge };
    } catch (err) {
        console.error('❌ Erreur simulation:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
// TEST 6: TEST FONCTIONS EXPOSÉES
// ============================================
async function testFunctionsExposed() {
    console.log('%c\n=== TEST 6: Test Fonctions Exposées ===', 'color: #ffff00; font-weight: bold;');
    
    // Test setChallengeScope
    console.log('🧪 Test setChallengeScope("confrerie"):');
    try {
        window.setChallengeScope('confrerie');
        console.log('✅ setChallengeScope exécutée');
        const scopeValue = window.currentScope;
        console.log(`  - window.currentScope = "${scopeValue}"`);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    }
    
    // Test setChallengeScope global
    console.log('\n🧪 Test setChallengeScope("global"):');
    try {
        window.setChallengeScope('global');
        console.log('✅ setChallengeScope exécutée');
        const scopeValue = window.currentScope;
        console.log(`  - window.currentScope = "${scopeValue}"`);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    }
    
    // Test displayChallengeProgress
    console.log('\n🧪 Test displayChallengeProgress():');
    try {
        if (window.challenges && window.challenges.length > 0) {
            window.displayChallengeProgress();
            console.log('✅ displayChallengeProgress exécutée');
            console.log(`  - ${window.challenges.length} défis affichés`);
        } else {
            console.warn('⚠️ Pas de défis actifs pour tester');
        }
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    }
}

// ============================================
// TEST 7: VÉRIFIER FIRESTORE
// ============================================
async function testFirestore() {
    console.log('%c\n=== TEST 7: Vérifier Firestore ===', 'color: #ffff00; font-weight: bold;');
    
    if (!window.db) {
        console.error('❌ Firestore DB non disponible');
        return { success: false };
    }
    
    try {
        // Déjà importé en app.js
        const { getDocs, collection, query, where } = await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js');
        
        // Tenter lecture
        console.log('🔍 Tentative accès challenges collection...');
        const q = query(collection(window.db, 'challenges'), where('active', '==', true));
        const snapshot = await getDocs(q);
        
        console.log(`✅ Firestore accessible: ${snapshot.size} défis actifs trouvés`);
        
        snapshot.forEach(doc => {
            console.log(`  - ${doc.id}: ${doc.data().title}`);
        });
        
        return { success: true, count: snapshot.size };
    } catch (err) {
        console.error('❌ Erreur Firestore:', err.code, err.message);
        return { success: false, error: err.message, code: err.code };
    }
}

// ============================================
// TEST 8: CRÉATION RÉELLE AVEC LOGGING
// ============================================
async function testCreateChallengeWithLogging() {
    console.log('%c\n=== TEST 8: Création Réelle DE FI (AVEC LOGGING) ===', 'color: #ffff00; font-weight: bold;');
    
    const type = document.getElementById('challenge-type')?.value;
    const duration = parseInt(document.getElementById('challenge-duration')?.value || '7');
    const target = parseInt(document.getElementById('challenge-target')?.value || '1');
    const reward = document.getElementById('challenge-reward')?.value;
    
    console.log('📋 Étape 1: Validation des entrées');
    console.log(`  - Type: ${type}`);
    console.log(`  - Durée: ${duration}`);
    console.log(`  - Target: ${target}`);
    console.log(`  - Reward: ${reward}`);
    
    if (!target || target < 1) {
        console.error('❌ Validation échouée: target invalide');
        return { success: false, error: 'Invalid target' };
    }
    console.log('✅ Validation réussie');
    
    console.log('\n📋 Étape 2: Création participants');
    const participantsObj = {};
    if (window.USERS && window.USERS.length > 0) {
        window.USERS.forEach(user => {
            participantsObj[user.name] = { user: user.name, br: 0 };
        });
        console.log(`✅ ${Object.keys(participantsObj).length} participants ajoutés`);
    } else {
        participantsObj[window.currentUser] = { user: window.currentUser, br: 0 };
        console.log('⚠️ USERS vide, fallback sur currentUser');
    }
    
    console.log('\n📋 Étape 3: Construction objet défi');
    const now = new Date();
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newChallenge = {
        id: `challenge_${Date.now()}`,
        type,
        title: `Défi: ${target} ${type === 'br-count' ? 'BR' : type === 'streak' ? 'jours' : 'points'}`,
        target: parseInt(target),
        reward,
        creator: window.currentUser,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        participants: participantsObj,
        active: true
    };
    console.log(`✅ Objet défi créé: ${newChallenge.id}`);
    console.table(newChallenge);
    
    console.log('\n📋 Étape 4: Envoi vers Firestore');
    try {
        const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js');
        
        console.log(`  Appel: setDoc(doc(db, 'challenges', '${newChallenge.id}'), {...})`);
        await setDoc(doc(window.db, 'challenges', newChallenge.id), newChallenge);
        
        console.log('✅ Défi sauvegardé en Firestore!');
        return { success: true, challengeId: newChallenge.id };
    } catch (err) {
        console.error('❌ Erreur Firestore:', err.code, err.message);
        console.error('Stack:', err.stack);
        return { success: false, error: err.message, code: err.code };
    }
}

// ============================================
// TEST 9: SCOPE SELECTOR UI
// ============================================
function testScopeUI() {
    console.log('%c\n=== TEST 9: Scope Selector UI ===', 'color: #ffff00; font-weight: bold;');
    
    const confBtn = document.getElementById('challenge-scope-confr');
    const globBtn = document.getElementById('challenge-scope-global');
    
    if (!confBtn || !globBtn) {
        console.error('❌ Boutons scope introuvables');
        return;
    }
    
    console.log('📋 État initial:');
    console.log(`  confBtn: background=${confBtn.style.background}, border=${confBtn.style.borderColor}`);
    console.log(`  globBtn: background=${globBtn.style.background}, border=${globBtn.style.borderColor}`);
    
    console.log('\n🧪 Click confBtn:');
    window.setChallengeScope('confrerie');
    console.log(`  confBtn: background=${confBtn.style.background}, border=${confBtn.style.borderColor}`);
    console.log(`  globBtn: background=${globBtn.style.background}, border=${globBtn.style.borderColor}`);
    console.log(`✅ window.currentScope = "${window.currentScope}"`);
    
    console.log('\n🧪 Click globBtn:');
    window.setChallengeScope('global');
    console.log(`  confBtn: background=${confBtn.style.background}, border=${confBtn.style.borderColor}`);
    console.log(`  globBtn: background=${globBtn.style.background}, border=${globBtn.style.borderColor}`);
    console.log(`✅ window.currentScope = "${window.currentScope}"`);
}

// ============================================
// TEST 10: PROGRESSION VISUALIZATION
// ============================================
function testProgressionVisualization() {
    console.log('%c\n=== TEST 10: Progression Visualization ===', 'color: #ffff00; font-weight: bold;');
    
    if (!window.challenges || window.challenges.length === 0) {
        console.warn('⚠️ Pas de défis pour tester la visualisation');
        return;
    }
    
    console.log(`📊 ${window.challenges.length} défi(s) trouvé(s)`);
    
    window.challenges.forEach((ch, i) => {
        console.log(`\n🧪 Défi #${i + 1}:`);
        console.log(`  Titre: ${ch.title}`);
        console.log(`  Cible: ${ch.target}`);
        console.log(`  Participants: ${Object.keys(ch.participants || {}).length}`);
        
        if (ch.participants) {
            Object.entries(ch.participants).forEach(([user, data]) => {
                const pct = ((data.br || 0) / ch.target * 100);
                console.log(`    - ${user}: ${data.br}/${ch.target} (${pct.toFixed(1)}%)`);
            });
        }
    });
    
    console.log('\n✅ Appel displayChallengeProgress():');
    try {
        window.displayChallengeProgress();
        console.log('✅ Visualization rendue');
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    }
}

// ============================================
// RUNNER: Exécuter tous les tests
// ============================================
window.runAllTests = async function() {
    console.log('%c\n\n╔════════════════════════════════════════════════╗', 'color: #00ff00;');
    console.log('%c║ 🧪 BATTERIE COMPLÈTE DE TESTS DÉFIS        ║', 'color: #00ff00; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════╝\n', 'color: #00ff00;');
    
    testVariablesGlobales();
    testHTMLElements();
    testFormReading();
    testConstructionChallenge();
    await testSimulationChallenge();
    await testFunctionsExposed();
    await testFirestore();
    testScopeUI();
    testProgressionVisualization();
    
    console.log('%c\n✅ BATTERIE DE TESTS COMPLÉTÉE!', 'color: #00ff00; font-weight: bold;');
    console.log('%c📝 Pour tester la création: runAllTests.createChallenge()', 'color: #ffff00; font-weight: bold;');
};

// Alias pour créer facilement
window.runAllTests.createChallenge = testCreateChallengeWithLogging;

console.log('%c\n✨ BATTERIE DE TESTS CHARGÉE!', 'color: #00ff00; font-weight: bold;');
console.log('%cCommande: runAllTests()', 'color: #ffff00; font-weight: bold;');
console.log('%cCommande création avec logs: runAllTests.createChallenge()', 'color: #ffff00; font-weight: bold;');
