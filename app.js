// Import des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    increment,
    onSnapshot,
    getDocs,
    writeBatch,
    getDoc,
    query,
    where,
    arrayUnion,
    orderBy,
    limit,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ⚠️ REMPLACE CECI PAR TA CONFIGURATION FIREBASE ⚠️
const firebaseConfig = {

    apiKey: "AIzaSyBGnRL-gycaoRQE3TN8vid_yWRJHrJ35PI",
  
    authDomain: "cinq-contre-un.firebaseapp.com",
  
    projectId: "cinq-contre-un",
  
    storageBucket: "cinq-contre-un.firebasestorage.app",
  
    messagingSenderId: "895355334637",
  
    appId: "1:895355334637:web:10b61a46f9c8966d2a01e4"
  
  };
  

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Liste officielle des potes
const USERS = ["Léo", "Liam", "Étienne", "Augustin", "Antime"];
let currentUser = localStorage.getItem('cinqContreUnUser');

// Blagues aléatoires
const jokes = [
    "Et un de plus !", "Arrête de forcer un peu...", "Tu as que ça à faire ?", 
    "Machine ! 🤖", "Tricher n'est pas jouer.", "Le doigt le plus musclé de France.",
    "Allez, encore un effort !", "Impressionnant. Vraiment.", "C'est ton boss qui va être content."
];

// Éléments du DOM
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const btnMain = document.getElementById('main-btn');
const jokeText = document.getElementById('joke-text');
const logoutBtn = document.getElementById('logout-btn');

const codeInput = document.getElementById('access-code-input');
const codeSubmit = document.getElementById('access-code-submit');
const codeError = document.getElementById('access-code-error');
const codeLogin = document.getElementById('code-login');

const userAvatar = document.getElementById('user-avatar');

const brFeedList = document.getElementById('br-feed-list');
const brDetail = document.getElementById('br-detail');
const brDetailText = document.getElementById('br-detail-text');
const brCommentsList = document.getElementById('br-comments-list');
const brCommentInput = document.getElementById('br-comment-input');
const brCommentSubmit = document.getElementById('br-comment-submit');
const brDetailClose = document.getElementById('br-detail-close');

let pendingUser = null;
let currentBrId = null;

// --- Utilitaires IP ---
async function getPublicIp() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch (e) {
        console.error("Impossible de récupérer l'IP", e);
        return null;
    }
}

async function saveCurrentIpForUser(userRef) {
    const ip = await getPublicIp();
    if (!ip) return;
    try {
        await updateDoc(userRef, {
            ips: arrayUnion(ip)
        });
    } catch (e) {
        console.error("Erreur lors de l'enregistrement de l'IP", e);
    }
}

// --- Auto-login par IP ---
async function autoLoginByIp() {
    const ip = await getPublicIp();
    if (!ip) return null;

    try {
        const q = query(collection(db, "users"), where("ips", "array-contains", ip));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        const data = snap.docs[0].data();
        return data.name || null;
    } catch (e) {
        console.error("Erreur autoLoginByIp", e);
        return null;
    }
}

// --- Logique d'initialisation ---
async function init() {
    // Génère les champs manquants une seule fois (pour le dev).
    // Utile si tu as importé des users sans `accessCode` / `isSuperAdmin` / `ips`.
    if (!localStorage.getItem('cinqContreUnNormalizedUsers')) {
        try {
            await normalizeUsers();
            localStorage.setItem('cinqContreUnNormalizedUsers', '1');
        } catch (e) {
            console.error("normalizeUsers() a échoué", e);
        }
    }

    if (!currentUser) {
        const autoUser = await autoLoginByIp();
        if (autoUser && USERS.includes(autoUser)) {
            currentUser = autoUser;
            localStorage.setItem('cinqContreUnUser', currentUser);
        }
    }

    if (currentUser && USERS.includes(currentUser)) {
        loginScreen.classList.remove('active');
        appScreen.classList.add('active');
        document.getElementById('user-display-name').textContent = currentUser;
        
        // Initialiser l'utilisateur dans Firebase s'il n'existe pas
        const userRef = doc(db, "users", currentUser);
        await setDoc(userRef, { name: currentUser }, { merge: true });
        
        checkWeeklyReset(); // Vérifie si on doit reset la semaine
        startListeners();   // Lance l'écoute en temps réel
    } else {
        loginScreen.classList.add('active');
        appScreen.classList.remove('active');
    }
}

// --- Connexion par code ---
document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        pendingUser = e.target.getAttribute('data-name');
        if (codeLogin) codeLogin.classList.add('visible');
        if (codeInput) {
            codeInput.value = '';
            if (codeError) codeError.textContent = '';
            codeInput.focus();
        }
    });
});

if (codeSubmit) {
    codeSubmit.addEventListener('click', async () => {
        if (!pendingUser) {
            if (codeError) codeError.textContent = "Choisis d'abord ton prénom.";
            return;
        }
        const code = codeInput.value.trim();
        if (!code) {
            if (codeError) codeError.textContent = "Entre ton code.";
            return;
        }

        const userRef = doc(db, "users", pendingUser);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            if (codeError) codeError.textContent = "Utilisateur inconnu.";
            return;
        }

        const data = snap.data();
        const isSuperAdmin = !!data.isSuperAdmin;
        if (data.accessCode !== code && !isSuperAdmin) {
            if (codeError) codeError.textContent = "Code invalide.";
            return;
        }

        currentUser = pendingUser;
        localStorage.setItem('cinqContreUnUser', currentUser);
        await setDoc(userRef, { name: currentUser }, { merge: true });
        await saveCurrentIpForUser(userRef);
        pendingUser = null;
        if (codeLogin) codeLogin.classList.remove('visible');
        init();
    });
}

// Déconnexion
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('cinqContreUnUser');
    currentUser = null;
    init();
});

// --- Action Clic (+1) ---
btnMain.addEventListener('click', async (e) => {
    if (!currentUser) return;

    // 1. Animation visuelle
    createFloatingPlus(e);
    jokeText.textContent = jokes[Math.floor(Math.random() * jokes.length)];

    // 2. Mise à jour Firestore
    const userRef = doc(db, "users", currentUser);
    await updateDoc(userRef, {
        totalScore: increment(1),
        weeklyScore: increment(1)
    });

    // 3. Description de la br
    const description = prompt("Décris la br (facultatif) :", "");
    if (description !== null && description.trim() !== "") {
        await addDoc(collection(db, "br"), {
            user: currentUser,
            description: description.trim(),
            createdAt: serverTimestamp(),
            weekId: getISOWeekString()
        });
    }
});

function createFloatingPlus(e) {
    const plus = document.createElement('span');
    plus.classList.add('floating-plus');
    plus.textContent = '+1';
    
    // Positionnement au centre du bouton
    const rect = btnMain.getBoundingClientRect();
    plus.style.left = (rect.width / 2 - 15) + 'px';
    plus.style.top = (rect.height / 2 - 20) + 'px';
    
    btnMain.appendChild(plus);
    setTimeout(() => plus.remove(), 1000);
}

// --- Temps réel : Écoute des scores, historique, br ---
function startListeners() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        let usersData = [];
        snapshot.forEach(d => {
            const data = d.data();
            // Sécurité : si les scores n'existent pas encore, on met 0
            usersData.push({
                name: data.name,
                total: data.totalScore || 0,
                weekly: data.weeklyScore || 0,
                photoUrl: data.photoUrl || null
            });
            
            // Mise à jour de MES scores en haut de l'écran
            if (data.name === currentUser) {
                document.getElementById('total-score').textContent = data.totalScore || 0;
                document.getElementById('weekly-score').textContent = data.weeklyScore || 0;
                if (userAvatar) {
                    if (data.photoUrl) {
                        userAvatar.style.backgroundImage = `url(${data.photoUrl})`;
                    } else {
                        userAvatar.style.backgroundImage = 'none';
                    }
                }
            }
        });

        updateLeaderboard(usersData);
    });

    // Écoute de l'historique
    onSnapshot(collection(db, "history"), (snapshot) => {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        let historyData = [];
        snapshot.forEach(d => historyData.push(d.data()));
        
        // Trie par semaine décroissante
        historyData.sort((a, b) => b.weekId.localeCompare(a.weekId));
        
        historyData.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Semaine ${item.weekId.split('-W')[1]}</span> <strong>${item.winner} (${item.score} pts)</strong>`;
            historyList.appendChild(li);
        });
    });

    // Feed des br
    const brQuery = query(collection(db, "br"), orderBy("createdAt", "desc"), limit(10));
    onSnapshot(brQuery, (snapshot) => {
        if (!brFeedList) return;
        brFeedList.innerHTML = '';
        snapshot.forEach(brDoc => {
            const brData = brDoc.data();
            const li = document.createElement('li');
            li.textContent = `${brData.user} : ${brData.description}`;
            li.addEventListener('click', () => openBrDetail(brDoc.id, brData));
            brFeedList.appendChild(li);
        });
    });
}

function updateLeaderboard(usersData) {
    // Trier par score de la semaine décroissant
    usersData.sort((a, b) => b.weekly - a.weekly);
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    usersData.forEach((u, index) => {
        const li = document.createElement('li');
        let classes = '';
        if (index === 0 && u.weekly > 0) classes = 'rank-1'; // Le premier
        if (index === usersData.length - 1 && usersData[0].weekly > 0) classes = 'rank-last'; // Le dernier
        
        li.className = classes;
        li.innerHTML = `<span>${index + 1}. ${u.name}</span> <strong>${u.weekly}</strong>`;
        list.appendChild(li);
    });
}

// --- Détail des br, commentaires et likes ---
function openBrDetail(brId, brData) {
    currentBrId = brId;
    if (!brDetail || !brDetailText || !brCommentsList) return;

    brDetailText.textContent = `${brData.user} : ${brData.description}`;
    brDetail.style.display = 'block';

    const commentsRef = collection(db, "br", brId, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));
    onSnapshot(commentsQuery, (snapshot) => {
        brCommentsList.innerHTML = '';
        snapshot.forEach(commentDoc => {
            const c = commentDoc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${c.user}</strong> : ${c.text}</span>
                <span>
                    <button class="br-comment-like" data-id="${commentDoc.id}">♥ ${c.likes || 0}</button>
                </span>
            `;
            brCommentsList.appendChild(li);
        });

        brCommentsList.querySelectorAll('.br-comment-like').forEach(btn => {
            btn.addEventListener('click', async () => {
                const commentId = btn.getAttribute('data-id');
                const commentRef = doc(db, "br", brId, "comments", commentId);
                await updateDoc(commentRef, { likes: increment(1) });
            });
        });
    });
}

if (brDetailClose) {
    brDetailClose.addEventListener('click', () => {
        if (brDetail) brDetail.style.display = 'none';
        currentBrId = null;
    });
}

if (brCommentSubmit) {
    brCommentSubmit.addEventListener('click', async () => {
        if (!currentBrId || !currentUser) return;
        const text = brCommentInput.value.trim();
        if (!text) return;

        const commentsRef = collection(db, "br", currentBrId, "comments");
        await addDoc(commentsRef, {
            user: currentUser,
            text,
            createdAt: serverTimestamp(),
            likes: 0
        });
        brCommentInput.value = '';
    });
}

// --- Gestion du Reset Hebdomadaire ---
function getISOWeekString() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7)); // Jeudi de la semaine courante
    const yearStart = new Date(d.getFullYear(),0,1);
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

async function checkWeeklyReset() {
    const currentWeek = getISOWeekString();
    const configRef = doc(db, "system", "config");
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) {
        await setDoc(configRef, { currentWeek: currentWeek });
        return;
    }

    const savedWeek = configSnap.data().currentWeek;
    
    // Si la semaine enregistrée en base est différente de la semaine actuelle
    if (savedWeek !== currentWeek) {
        // 1. Récupérer les utilisateurs pour trouver le gagnant
        const usersSnap = await getDocs(collection(db, "users"));
        let bestUser = null;
        let bestScore = -1;
        
        usersSnap.forEach(doc => {
            const d = doc.data();
            if ((d.weeklyScore || 0) > bestScore) {
                bestScore = d.weeklyScore;
                bestUser = d.name;
            }
        });

        // 2. Lancer un Batch (transaction groupée)
        const batch = writeBatch(db);
        
        // Sauvegarder le gagnant dans l'historique
        if (bestUser && bestScore > 0) {
            const historyRef = doc(db, "history", savedWeek);
            batch.set(historyRef, { winner: bestUser, score: bestScore, weekId: savedWeek });
        }

        // Reset les scores de la semaine à 0 pour tout le monde
        usersSnap.forEach(userDoc => {
            batch.update(doc(db, "users", userDoc.id), { weeklyScore: 0 });
        });

        // Mettre à jour la semaine courante
        batch.update(configRef, { currentWeek: currentWeek });
        
        // Exécuter
        await batch.commit();
        console.log("Reset de la semaine effectué !");
    }
}
async function normalizeUsers() {
    const usersSnap = await getDocs(collection(db, "users"));

    for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();

        // Valeurs par défaut
        const update = {};

        if (data.accessCode === undefined) {
            // génère un code simple type ABCD-1234
            const prefix = (data.name || userDoc.id || 'USER').substring(0, 3).toUpperCase();
            const rand = Math.floor(1000 + Math.random() * 9000);
            update.accessCode = `${prefix}-${rand}`;
        }

        if (data.isSuperAdmin === undefined) {
            update.isSuperAdmin = false; // tu pourras mettre true à la main pour Étienne
        }

        if (!Array.isArray(data.ips)) {
            update.ips = [];
        }

        if (Object.keys(update).length > 0) {
            await updateDoc(doc(db, "users", userDoc.id), update);
        }
    }

    console.log("Normalisation users terminée");
}
// Lancement au chargement
init();
