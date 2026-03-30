// Import des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getFirestore, collection, doc, setDoc, updateDoc, increment, onSnapshot, 
    getDocs, writeBatch, getDoc, query, where, arrayUnion, orderBy, limit, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ⚠️ GARDE TA CONFIGURATION FIREBASE ⚠️
const firebaseConfig = {
    apiKey: "AIzaSyBGnRL-gycaoRQE3TN8vid_yWRJHrJ35PI",
    authDomain: "cinq-contre-un.firebaseapp.com",
    projectId: "cinq-contre-un",
    storageBucket: "cinq-contre-un.firebasestorage.app",
    messagingSenderId: "895355334637",
    appId: "1:895355334637:web:10b61a46f9c8966d2a01e4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = localStorage.getItem('cinqContreUnUser');
let dbUsersList = []; // Liste dynamique

// Blagues aléatoires
const jokes = ["Et un de plus !", "Arrête de forcer...", "Machine ! 🤖", "Le doigt le plus musclé.", "Allez, encore un effort !"];

// Éléments du DOM
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const dynamicUserGrid = document.getElementById('dynamic-user-grid');
const codeLogin = document.getElementById('code-login');
const codeInput = document.getElementById('access-code-input');
const codeSubmit = document.getElementById('access-code-submit');
const codeError = document.getElementById('access-code-error');
const cancelLoginBtn = document.getElementById('cancel-login');
const userAvatar = document.getElementById('user-avatar');
const adminBtn = document.getElementById('admin-btn');

let pendingUser = null;

// --- Utilitaires IP ---
async function getPublicIp() {
    try { const res = await fetch('https://api.ipify.org?format=json'); return (await res.json()).ip; } 
    catch (e) { return null; }
}

async function autoLoginByIp() {
    const ip = await getPublicIp();
    if (!ip) return null;
    const q = query(collection(db, "users"), where("ips", "array-contains", ip));
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data().name;
}


// --- Initialisation ---
async function init() {
    // 1. On cache tout par précaution pendant le chargement
    loginScreen.classList.remove('active');
    appScreen.classList.remove('active');

    await fetchUsers(); // Charger les profils

    // 2. Vérification si non connecté en local (auto-login par IP)
    if (!currentUser) {
        const autoUser = await autoLoginByIp();
        if (autoUser && dbUsersList.includes(autoUser)) {
            currentUser = autoUser;
            localStorage.setItem('cinqContreUnUser', currentUser);
        }
    }

    // 3. Routage strict : Dashboard OU Connexion
    if (currentUser && dbUsersList.includes(currentUser)) {
        // === CONNECTÉ ===
        loginScreen.classList.remove('active');
        appScreen.classList.add('active'); // On affiche le dashboard
        
        document.getElementById('user-display-name').textContent = currentUser;
        
        // Afficher bouton admin si Étienne
        if (currentUser === "Étienne" || currentUser === "Etienne") {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }

        checkWeeklyReset(); 
        startListeners();   
    } else {
        // === NON CONNECTÉ ===
        appScreen.classList.remove('active');
        loginScreen.classList.add('active'); // On affiche la connexion
    }
}

async function init() {
    await fetchUsers(); // Charger les profils

    if (!currentUser) {
        const autoUser = await autoLoginByIp();
        if (autoUser && dbUsersList.includes(autoUser)) {
            currentUser = autoUser;
            localStorage.setItem('cinqContreUnUser', currentUser);
        }
    }

    if (currentUser && dbUsersList.includes(currentUser)) {
        loginScreen.classList.remove('active');
        appScreen.classList.add('active');
        document.getElementById('user-display-name').textContent = currentUser;
        
        // Afficher bouton admin si Étienne
        if (currentUser === "Étienne" || currentUser === "Etienne") {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }

        checkWeeklyReset(); 
        startListeners();   
    } else {
        loginScreen.classList.add('active');
        appScreen.classList.remove('active');
    }
}

// --- Connexion ---
function showCodeInput(name) {
    pendingUser = name;
    codeLogin.classList.add('visible');
    dynamicUserGrid.style.display = 'none';
    codeInput.value = '';
    codeError.textContent = '';
    codeInput.focus();
}

cancelLoginBtn.addEventListener('click', () => {
    codeLogin.classList.remove('visible');
    dynamicUserGrid.style.display = 'grid';
    pendingUser = null;
});

codeSubmit.addEventListener('click', async () => {
    if (!pendingUser || !codeInput.value.trim()) { codeError.textContent = "Code requis."; return; }
    
    const userRef = doc(db, "users", pendingUser);
    const snap = await getDoc(userRef);
    if (!snap.exists() || snap.data().accessCode !== codeInput.value.trim()) {
        codeError.textContent = "Code invalide."; return;
    }

    currentUser = pendingUser;
    localStorage.setItem('cinqContreUnUser', currentUser);
    
    // Sauvegarde l'IP pour l'auto-login futur
    const ip = await getPublicIp();
    if (ip) await updateDoc(userRef, { ips: arrayUnion(ip) });

    codeLogin.classList.remove('visible');
    dynamicUserGrid.style.display = 'grid';
    init();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('cinqContreUnUser');
    currentUser = null;
    init();
});

// --- Gestion du Profil (Avatar) ---
const profileModal = document.getElementById('profile-modal');
userAvatar.addEventListener('click', () => profileModal.style.display = 'flex');
document.getElementById('close-profile-btn').addEventListener('click', () => profileModal.style.display = 'none');

document.getElementById('save-pic-btn').addEventListener('click', async () => {
    const url = document.getElementById('profile-pic-url').value.trim();
    if (url) {
        await updateDoc(doc(db, "users", currentUser), { photoUrl: url });
        profileModal.style.display = 'none';
    }
});

document.getElementById('remove-pic-btn').addEventListener('click', async () => {
    await updateDoc(doc(db, "users", currentUser), { photoUrl: null });
    document.getElementById('profile-pic-url').value = '';
    profileModal.style.display = 'none';
});

// --- Action Clic (+1) & Étoiles ---
const btnMain = document.getElementById('main-btn');
const brModal = document.getElementById('br-modal');
let brEvent = null;

// Gérer les clics sur les étoiles
document.querySelectorAll('.stars').forEach(container => {
    const stars = container.querySelectorAll('span');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            container.setAttribute('data-value', index + 1);
            stars.forEach((s, i) => s.style.color = i <= index ? 'var(--gold)' : 'var(--text-muted)');
        });
    });
});

btnMain.addEventListener('click', (e) => {
    if (!currentUser) return;
    brEvent = e;
    
    // Reset la modale
    document.getElementById('br-desc').value = '';
    document.querySelectorAll('.stars').forEach(c => {
        c.setAttribute('data-value', '0');
        c.querySelectorAll('span').forEach(s => s.style.color = 'var(--text-muted)');
    });

    brModal.style.display = 'flex';
});

document.getElementById('cancel-br').addEventListener('click', () => brModal.style.display = 'none');

document.getElementById('submit-br').addEventListener('click', async () => {
    brModal.style.display = 'none';
    
    // Animation + blague
    if (brEvent) createFloatingPlus(brEvent);
    document.getElementById('joke-text').textContent = jokes[Math.floor(Math.random() * jokes.length)];

    // Récupérer les notes
    const desc = document.getElementById('br-desc').value.trim();
    const notes = {};
    document.querySelectorAll('.stars').forEach(c => {
        notes[c.getAttribute('data-category')] = parseInt(c.getAttribute('data-value')) || 0;
    });

    // Sauvegarde en base
    await updateDoc(doc(db, "users", currentUser), { totalScore: increment(1), weeklyScore: increment(1) });
    await addDoc(collection(db, "br"), {
        user: currentUser,
        description: desc || "Session classique",
        ratings: notes,
        createdAt: serverTimestamp(),
        weekId: getISOWeekString()
    });
});

function createFloatingPlus(e) {
    const plus = document.createElement('span');
    plus.classList.add('floating-plus'); plus.textContent = '+1';
    const rect = btnMain.getBoundingClientRect();
    plus.style.left = (rect.width / 2 - 15) + 'px'; plus.style.top = (rect.height / 2 - 20) + 'px';
    btnMain.appendChild(plus);
    setTimeout(() => plus.remove(), 1000);
}

// --- Panneau ADMIN (Étienne) ---
const adminModal = document.getElementById('admin-modal');
adminBtn.addEventListener('click', () => {
    adminModal.style.display = 'flex';
    loadAdminUsers();
});
document.getElementById('close-admin-btn').addEventListener('click', () => adminModal.style.display = 'none');

// 1. Gérer l'objectif (Br max)
document.getElementById('admin-save-target').addEventListener('click', async () => {
    const target = parseInt(document.getElementById('admin-target-input').value);
    if (target > 0) {
        await setDoc(doc(db, "system", "config"), { brTarget: target }, { merge: true });
        alert("Objectif mis à jour !");
    }
});

// 2. Ajouter un utilisateur
document.getElementById('admin-add-user').addEventListener('click', async () => {
    const name = document.getElementById('admin-new-name').value.trim();
    const code = document.getElementById('admin-new-code').value.trim();
    if (name && code) {
        await setDoc(doc(db, "users", name), { name: name, accessCode: code, totalScore: 0, weeklyScore: 0 });
        alert(`${name} a été ajouté !`);
        document.getElementById('admin-new-name').value = '';
        document.getElementById('admin-new-code').value = '';
        loadAdminUsers(); // Rafraîchir la liste
    }
});

// 3. Voir les codes
async function loadAdminUsers() {
    const list = document.getElementById('admin-user-list');
    list.innerHTML = 'Chargement...';
    const snap = await getDocs(collection(db, "users"));
    list.innerHTML = '';
    snap.forEach(d => {
        const data = d.data();
        list.innerHTML += `<li><strong>${data.name}</strong> - Code : ${data.accessCode || 'Aucun'}</li>`;
    });
}

// --- Temps réel (Écoutes) ---
function startListeners() {
    // Écoute de la configuration système (Objectif)
    onSnapshot(doc(db, "system", "config"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().brTarget) {
            document.getElementById('target-container').style.display = 'block';
            document.getElementById('target-count').textContent = docSnap.data().brTarget;
        }
    });

    // Utilisateurs & Scores
    onSnapshot(collection(db, "users"), (snapshot) => {
        let usersData = [];
        snapshot.forEach(d => {
            const data = d.data();
            usersData.push({ name: data.name, total: data.totalScore || 0, weekly: data.weeklyScore || 0 });
            if (data.name === currentUser) {
                document.getElementById('total-score').textContent = data.totalScore || 0;
                document.getElementById('weekly-score').textContent = data.weeklyScore || 0;
                userAvatar.style.backgroundImage = data.photoUrl ? `url(${data.photoUrl})` : 'none';
            }
        });
        usersData.sort((a, b) => b.weekly - a.weekly);
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        usersData.forEach((u, i) => {
            const li = document.createElement('li');
            if (i === 0 && u.weekly > 0) li.className = 'rank-1';
            if (i === usersData.length - 1 && usersData[0].weekly > 0) li.className = 'rank-last';
            li.innerHTML = `<span>${i + 1}. ${u.name}</span> <strong>${u.weekly}</strong>`;
            list.appendChild(li);
        });
    });

    // Feed des BR (avec les étoiles)
    onSnapshot(query(collection(db, "br"), orderBy("createdAt", "desc"), limit(15)), (snapshot) => {
        const feed = document.getElementById('br-feed-list');
        if (!feed) return;
        feed.innerHTML = '';
        snapshot.forEach(brDoc => {
            const d = brDoc.data();
            const r = d.ratings || { duree: 0, plaisir: 0, qualite: 0 };
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="br-user-desc"><strong>${d.user}</strong> : ${d.description}</div>
                <div class="br-ratings">
                    <span>⏱️ ${r.duree}/5</span> | 
                    <span>💦 ${r.plaisir}/5</span> | 
                    <span>🎥 ${r.qualite}/5</span>
                </div>
            `;
            feed.appendChild(li);
        });
    });

    // Historique
    onSnapshot(collection(db, "history"), (snapshot) => {
        const hList = document.getElementById('history-list');
        hList.innerHTML = '';
        let hData = [];
        snapshot.forEach(d => hData.push(d.data()));
        hData.sort((a, b) => b.weekId.localeCompare(a.weekId));
        hData.forEach(item => {
            hList.innerHTML += `<li><span>Semaine ${item.weekId.split('-W')[1]}</span> <strong>${item.winner} (${item.score} pts)</strong></li>`;
        });
    });
}

// --- Utils (Semaines) ---
function getISOWeekString() {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + 4 - (d.getDay()||7));
    const yearStart = new Date(d.getFullYear(),0,1);
    const weekNo = Math.ceil((((d - yearStart)/86400000)+1)/7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

async function checkWeeklyReset() {
    const currentWeek = getISOWeekString();
    const configRef = doc(db, "system", "config");
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) { await setDoc(configRef, { currentWeek }); return; }
    
    const savedWeek = configSnap.data().currentWeek;
    if (savedWeek !== currentWeek) {
        const usersSnap = await getDocs(collection(db, "users"));
        let bestUser = null, bestScore = -1;
        usersSnap.forEach(d => {
            if ((d.data().weeklyScore || 0) > bestScore) { bestScore = d.data().weeklyScore; bestUser = d.data().name; }
        });

        const batch = writeBatch(db);
        if (bestUser && bestScore > 0) batch.set(doc(db, "history", savedWeek), { winner: bestUser, score: bestScore, weekId: savedWeek });
        usersSnap.forEach(u => batch.update(doc(db, "users", u.id), { weeklyScore: 0 }));
        batch.update(configRef, { currentWeek });
        await batch.commit();
    }
}

// Lancement
init();
