// Import des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, increment, onSnapshot, getDocs, writeBatch, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- Logique d'initialisation ---
async function init() {
    if (currentUser && USERS.includes(currentUser)) {
        loginScreen.classList.remove('active');
        appScreen.classList.add('active');
        document.getElementById('user-display-name').textContent = currentUser;
        
        // Initialiser l'utilisateur dans Firebase s'il n'existe pas
        await setDoc(doc(db, "users", currentUser), { name: currentUser }, { merge: true });
        
        checkWeeklyReset(); // Vérifie si on doit reset la semaine
        startListeners();   // Lance l'écoute en temps réel
    } else {
        loginScreen.classList.add('active');
        appScreen.classList.remove('active');
    }
}

// --- Connexion ---
document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentUser = e.target.getAttribute('data-name');
        localStorage.setItem('cinqContreUnUser', currentUser);
        init();
    });
});

// Déconnexion
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('cinqContreUnUser');
    currentUser = null;
    init();
});

// --- Action Clic (+1) ---
btnMain.addEventListener('click', async (e) => {
    // 1. Animation visuelle
    createFloatingPlus(e);
    jokeText.textContent = jokes[Math.floor(Math.random() * jokes.length)];

    // 2. Mise à jour Firestore
    const userRef = doc(db, "users", currentUser);
    await updateDoc(userRef, {
        totalScore: increment(1),
        weeklyScore: increment(1)
    });
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

// --- Temps réel : Écoute des scores ---
function startListeners() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        let usersData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Sécurité : si les scores n'existent pas encore, on met 0
            usersData.push({
                name: data.name,
                total: data.totalScore || 0,
                weekly: data.weeklyScore || 0
            });
            
            // Mise à jour de MES scores en haut de l'écran
            if (data.name === currentUser) {
                document.getElementById('total-score').textContent = data.totalScore || 0;
                document.getElementById('weekly-score').textContent = data.weeklyScore || 0;
            }
        });

        updateLeaderboard(usersData);
    });

    // Écoute de l'historique
    onSnapshot(collection(db, "history"), (snapshot) => {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        let historyData = [];
        snapshot.forEach(doc => historyData.push(doc.data()));
        
        // Trie par semaine décroissante
        historyData.sort((a, b) => b.weekId.localeCompare(a.weekId));
        
        historyData.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Semaine ${item.weekId.split('-W')[1]}</span> <strong>${item.winner} (${item.score} pts)</strong>`;
            historyList.appendChild(li);
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

// Lancement au chargement
init();
