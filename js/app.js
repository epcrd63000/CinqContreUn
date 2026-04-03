// Import des modules Firebase
import { firebaseConfig } from './firebase-config.js';
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
    serverTimestamp,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_USER = "Étienne";
let currentUser = localStorage.getItem('cinqContreUnUser');
let USERS = [];
let userPhotoByUser = {}; // pour afficher avatars dans commentaire
let ratings = { duration: 0, pleasure: 0, quality: 0 };
let currentBrId = null;
let editingConfrerieId = null;
let myChart = null;

// 50 PHRASES ADDICTIVES ET MOTIVANTES 🔥
const motivationalPhrases = [
    "TU AS FROID? 🍆", 
    "Encore une petite? 😈",
    "C'est que tu commences! 💪",
    "La deuxième fait moins mal.",
    "T'es pas fatigué?",
    "Y'a des jaloux qui regardent... 👀",
    "Champion du monde! 🌍",
    "Vas-y boute en train! 🚂",
    "Tes potes font pareil en ce moment... 🧐",
    "C'est bon hein? 😏",
    "Une de plus et c'est la limite! ⚠️",
    "Toi aussi tu peux être champion! 🏆",
    "Tes stats explosent là! 📈",
    "Allez allez allez! 🏃",
    "Le sexe c'est bon pour la santé! 💊",
    "T'es déjà meilleur qu'hier! 📊",
    "Vas-y pète un record! 🚀",
    "Encore plus vite! ⚡",
    "C'est pas fini?! 🤡",
    "Pas de limite pour toi! ∞",
    "Double score en vue? 2️⃣",
    "T'es trop fort! 🔥",
    "Continue mon petit! 🎯",
    "Tes voisins t'entendent? 😂",
    "C'est pour te muscler le doigt! 💪",
    "À la prochaine tu fais un streak? 🔗",
    "C'est la machine qui va être contente! 🤖",
    "Un coup c'est bien! 😋",
    "Deux c'est mieux! 🎁",
    "Trois c'est de l'addiction! 😱",
    "T'es un vrai pro! 👨‍💼",
    "Tes mains te disent merci! 🙏",
    "C'est quoi ton secret? 🤫",
    "Y'a que toi qui comprends! 🧠",
    "Faut l'avouer c'est cool! 😎",
    "Tu vas battre le record! 📈",
    "Tes potes vont flipper! 😲",
    "C'est juste te détendre... 😌",
    "Elle crie ta main? 😆",
    "Pas de limite aujourd'hui! 🌟",
    "C'est notre petit secret! 🤐",
    "T'es légendaire! 👑",
    "Ça va devenir une habitude! 🔄",
    "Le timing est parfait! ⏰",
    "Continue continue continue! 🎢",
    "C'est pas du sport c'est une passion! ❤️",
    "Ton cerveau te remercie! 🧬",
    "Allez une dernière pour la route! 🛣️",
    "J'ADORE ce que tu fais! 😍",
    "C'est trop bon hein? 🍯",
    "À demain promis! 📅"
];

const jokes = [
    "Et un de plus !", "Arrête de forcer un peu...", "Tu as que ça à faire ?", 
    "Machine ! 🤖", "Tricher n'est pas jouer.", "Le doigt le plus musclé de France.",
    "Allez, encore un effort !", "Impressionnant. Vraiment.", "C'est ton boss qui va être content."
];

const brJokes = [
    "s'est astiqué le poireau.",
    "s'est lustré l'asperge.",
    "s'est épluché la banane.",
    "s'est poli le chinois.",
    "s'est essoré le cyclope.",
    "a fait pleurer le colosse.",
    "s'est secoué la flûte.",
    "s'est titillé le goujon.",
    "s'est poncé le pilon.",
    "a fait cracher le dragon.",
    "s'est mouché le grand timonier.",
    "s'est dégourdi le petit Jésus.",
    "s'est étouffé le perroquet.",
    "s'est astiqué la tige.",
    "s'est chatouillé l'anguille.",
    "s'est caressé le manche.",
    "a serré la main du chômeur.",
    "s'est fait une petite veuve poignet.",
    "s'est frotté le lampadaire.",
    "s'est agité la nouille.",
    "s'est chatouillé la trompette.",
    "s'est fait chauffer la couenne.",
    "s'est nettoyé le sifflet.",
    "s'est astiqué le pommeau.",
    "s'est taquiné le gardon.",
    "s'est fait reluire le casque.",
    "s'est massé le gourdin.",
    "a fait pleurer le chauve.",
    "a secoué le prunier.",
    "s'est brossé le manche.",
    "a fait chanter l'oiseau borgne.",
    "s'est astiqué la manivelle.",
    "s'est tapé sur le champignon.",
    "s'est rincé le thermomètre.",
    "a fait dégueuler la bébête.",
    "s'est titillé la saucisse.",
    "s'est astiqué le bambou.",
    "s'est caressé la bestiole.",
    "s'est dégorgé le limaçon.",
    "s'est astiqué le javelot.",
    "s'est lustré le boulon.",
    "s'est fait mousser le bout.",
    "s'est tiré sur la tige.",
    "s'est déridé la trompe.",
    "s'est secoué la canette.",
    "s'est astiqué le manche à balai.",
    "s'est frotté l'allumette.",
    "s'est lustré la carrosserie.",
    "s'est branlé le mammouth.",
    "s'est astiqué le manche à gigot."
];

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const btnMain = document.getElementById('main-btn');
const jokeText = document.getElementById('joke-text');
const logoutBtn = document.getElementById('logout-btn');
const adminBtn = document.getElementById('admin-btn');
const codeInput = document.getElementById('access-code-input');
const codeSubmit = document.getElementById('access-code-submit');
const codeError = document.getElementById('access-code-error');
const codeLogin = document.getElementById('code-login');
const userAvatar = document.getElementById('user-avatar');
const brFeedList = document.getElementById('br-feed-list');
const brModalOverlay = document.getElementById('br-modal-overlay');
const brDetailText = document.getElementById('br-detail-text');
const brCommentsList = document.getElementById('br-comments-list');
const brCommentInput = document.getElementById('br-comment-input');
const brCommentSubmit = document.getElementById('br-comment-submit');
const brDetailClose = document.getElementById('br-detail-close');
const brRatings = document.getElementById('br-ratings');

const homePodium = document.getElementById('home-podium');
const podiumPlaces = document.getElementById('podium-places');
const leaderboardListSection = document.getElementById('leaderboard-list-section');
const brTab = document.getElementById('br-tab');
const barkApiStatus = document.getElementById('bark-api-status');
const barkApiBtn = document.getElementById('bark-api-btn');
const notificationSection = document.getElementById('notifications-section');
const notificationList = document.getElementById('notification-list');
const notificationEmpty = document.getElementById('notification-empty');
const notificationBadge = document.getElementById('notification-badge');
let notifications = [];
let unreadNotificationCount = 0;
let currentTab = 'home';
let brInitialLoad = true;
let barkApiTimer = null;

// 🎬 SYSTÈME DE ROTATION DU TEXTE MOTIVANT
let phraseRotationInterval = null;
let currentPhraseIndex = 0;
let clickSound = null;

// ⚔️ SYSTÈME DE DÉFIS
let challenges = [];
let challengeModalOverlay = document.getElementById('challenges-modal-overlay');
let closeChallengesBtn = document.getElementById('close-challenges-btn');
let createChallengeBtn = document.getElementById('create-challenge-btn');
let challengesTabBtns = document.querySelectorAll('.challenge-tab-btn');


function initMotivationalText() {
    console.log('%c🎯 Init texte motivant', 'color: #dac103; font-weight: bold;');
    
    // Initialiser le son (Web Audio API)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Créer le son du clic (beep court)
    window.playClickSound = () => {
        try {
            const ctx = audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = 800; // Fréquence 800Hz
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch(e) {
            console.log('Son non disponible');
        }
    };
    
    // Démarrer la rotation du texte
    if (phraseRotationInterval) clearInterval(phraseRotationInterval);
    currentPhraseIndex = 0;
    updateMotivationalText();
    
    phraseRotationInterval = setInterval(updateMotivationalText, 3000); // Change toutes les 3 secondes
}

function updateMotivationalText() {
    if (!jokeText) return;
    jokeText.textContent = motivationalPhrases[currentPhraseIndex];
    jokeText.style.animation = 'fadeInOut 0.5s ease-in-out';
    currentPhraseIndex = (currentPhraseIndex + 1) % motivationalPhrases.length;
}

async function sendToBarksNotification(title, body) {
    console.log('🔔 BARK FUNCTION STARTED - title:', title, 'body:', body);
    console.log('%c🔔 BARK: Fonction appelée', 'color: #e03d3d; font-weight: bold; font-size: 14px;');
    console.log('Utilisateur actuel:', currentUser);
    
    if (!currentUser) {
        console.warn('❌ Pas d\'utilisateur actuel');
        return;
    }
    
    const userRef = doc(db, 'users', currentUser);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        console.warn('❌ Utilisateur non trouvé pour Bark');
        return;
    }
    
    const userData = userSnap.data();
    console.log('Données utilisateur:', userData);
    let barkApiKey = userData.barkApiKey;
    
    // Nettoyer la clé si elle contient une URL
    if (barkApiKey && barkApiKey.includes('api.day.app')) {
        console.log('%c🧹 Nettoyage de la clé Bark...', 'color: orange; font-weight: bold;');
        barkApiKey = barkApiKey.replace(/https:\/\//g, '').replace(/api\.day\.app\//g, '').replace(/\//g, '');
    }
    
    if (!barkApiKey) {
        console.log('%c⚠️ Pas de clé Bark API configurée', 'color: orange; font-weight: bold;');
        return;
    }

    console.log('%c🚀 Envoi notification Bark', 'color: green; font-weight: bold; font-size: 14px;');
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('API Key (first 10 chars):', barkApiKey.substring(0, 10) + '***');

    try {
        const url = 'https://api.day.app/' + barkApiKey;
        console.log('URL:', url);
        
        const payload = {
            title: title,
            body: body,
            sound: 'alarm'
        };
        console.log('Payload:', payload);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (response.ok) {
            console.log('%c✅ Notification Bark envoyée avec succès', 'color: green; font-weight: bold; font-size: 14px;');
        } else {
            console.error('%c❌ Erreur Bark API:', 'color: red; font-weight: bold;', response.status, responseText);
        }
    } catch (err) {
        console.error('%c❌ Erreur lors de l\'appel à Bark:', 'color: red; font-weight: bold;', err);
    }
}

function addSystemNotification(text) {
    console.log('%c📬 addSystemNotification appelé', 'color: #dac103; font-weight: bold; font-size: 12px;');
    const time = 'à l\'instant';
    notifications.unshift({ text, time, isBark: true });
    console.log('✅ Notification ajoutée:', text, 'Total notifs:', notifications.length);
    if (currentTab !== 'notifications') {
        unreadNotificationCount = Math.min(99, unreadNotificationCount + 1);
    }
    updateNotificationBadge();
    renderNotifications();
    console.log('✅ Badge et rendu mis à jour');
    
    console.log('%c📤 Appel sendToBarksNotification', 'color: #dac103; font-weight: bold;');
    // Important: await l'appel async pour s'assurer qu'il s'exécute
    sendToBarksNotification('💪 CinqContre1', text).catch(err => {
        console.error('Erreur non catchée dans sendToBarksNotification:', err);
    });
}

const promptModalOverlay = document.getElementById('prompt-modal-overlay');
const promptTitle = document.getElementById('prompt-title');
const promptInput = document.getElementById('prompt-input');
const promptOkBtn = document.getElementById('prompt-ok-btn');
const promptCancelBtn = document.getElementById('prompt-cancel-btn');
const promptCloseBtn = document.getElementById('prompt-close-btn');
let promptCallback = null;

function showPrompt(title, defaultValue, callback) {
    promptTitle.textContent = title;
    promptInput.value = defaultValue;
    promptCallback = callback;
    promptModalOverlay.style.display = 'flex';
    promptInput.focus();
}

if(promptOkBtn) {
    promptOkBtn.addEventListener('click', () => {
        if (promptCallback) {
            promptCallback(promptInput.value);
        }
        promptModalOverlay.style.display = 'none';
    });
}

if(promptCancelBtn) {
    promptCancelBtn.addEventListener('click', () => {
        promptModalOverlay.style.display = 'none';
    });
}

if(promptCloseBtn) {
    promptCloseBtn.addEventListener('click', () => {
        promptModalOverlay.style.display = 'none';
    });
}

let pendingUser = null;

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
        await updateDoc(userRef, { ips: arrayUnion(ip) });
    } catch (e) {
        console.error("Erreur lors de l'enregistrement de l'IP", e);
    }
}

async function autoLoginByIp() {
    const ip = await getPublicIp();
    if (!ip) return null;
    try {
        const q = query(collection(db, "users"), where("ips", "array-contains", ip));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs[0].data().name || null;
    } catch (e) {
        console.error("Erreur autoLoginByIp", e);
        return null;
    }
}

async function initConfrerie() {
    const confrerieRef = doc(db, "confreries", "la-confrerie-originelle");
    const confrerieSnap = await getDoc(confrerieRef);

    if (!confrerieSnap.exists()) {
        console.log("Initialisation de la Confrérie Originelle...");
        const usersSnap = await getDocs(collection(db, "users"));
        const userNames = [];
        let totalScore = 0;
        let weeklyScore = 0;

        usersSnap.forEach(userDoc => {
            const data = userDoc.data();
            userNames.push(userDoc.id);
            totalScore += data.totalScore || 0;
            weeklyScore += data.weeklyScore || 0;
        });

        const batch = writeBatch(db);

        batch.set(confrerieRef, {
            name: "La Confrérie Originelle",
            members: userNames,
            totalScore: totalScore,
            weeklyScore: weeklyScore
        });

        usersSnap.forEach(userDoc => {
            const userRef = doc(db, "users", userDoc.id);
            batch.update(userRef, {
                confrerieId: "la-confrerie-originelle",
                description: `Membre de la première heure.`
            });
        });

        await batch.commit();
        console.log("Confrérie Originelle créée avec tous les utilisateurs.");
    }
}

async function init() {
    if (!currentUser) {
        const autoUser = await autoLoginByIp();
        if (autoUser) {
            const userDoc = await getDoc(doc(db, "users", autoUser));
            if (userDoc.exists()) {
                currentUser = autoUser;
                localStorage.setItem('cinqContreUnUser', currentUser);
            }
        }
    }

    await initConfrerie(); 

    const usersSnap = await getDocs(collection(db, "users"));
    USERS = [];
    usersSnap.forEach(d => USERS.push(d.data().name));

    if (currentUser && USERS.includes(currentUser)) {
        loginScreen.classList.remove('active');
        appScreen.classList.add('active');
        document.getElementById('user-display-name').textContent = currentUser;
        const userRef = doc(db, "users", currentUser);
        await setDoc(userRef, { name: currentUser }, { merge: true });
        
        if (currentUser === ADMIN_USER) {
            adminBtn.style.display = 'block';
        }
        
        checkWeeklyReset();
        startListeners();
        renderNotifications();
        updateNotificationBadge();
    } else {
        loginScreen.classList.add('active');
        appScreen.classList.remove('active');
    }
}

async function loadLoginButtons() {
    const userGrid = document.querySelector('.user-grid');
    userGrid.innerHTML = '';
    const usersSnap = await getDocs(collection(db, "users"));
    USERS = [];
    usersSnap.forEach(d => {
        USERS.push(d.data().name);
        const btn = document.createElement('button');
        btn.className = 'login-btn';
        btn.textContent = d.data().name;
        btn.addEventListener('click', () => {
            pendingUser = d.data().name;
            if (codeLogin) codeLogin.classList.add('visible');
            if (codeInput) {
                codeInput.value = '';
                if (codeError) codeError.textContent = '';
                codeInput.focus();
            }
        });
        userGrid.appendChild(btn);
    });
}

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
        if (data.accessCode !== code) {
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

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('cinqContreUnUser');
    currentUser = null;
    init();
});

userAvatar.addEventListener('click', () => {
    document.getElementById('photo-modal-overlay').style.display = 'flex';
});

function closePhotoModal() {
    document.getElementById('photo-modal-overlay').style.display = 'none';
}
window.closePhotoModal = closePhotoModal;

function configureBarkApiKey() {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser);
    console.log('%c🔑 Ouverture popup config Bark', 'color: #dac103; font-weight: bold; font-size: 14px;', currentUser);

    showPrompt('Clé Bark API', '', async (newKey) => {
        console.log('%c📝 Clé reçue du prompt:', 'color: #750808; font-weight: bold;', newKey ? 'présente' : 'vide');
        if (newKey === null) {
            console.log('❌ Prompt annulé');
            return;
        }
        let trimmed = newKey.trim();
        
        // Extraire la clé si une URL complète est collée
        if (trimmed.includes('api.day.app')) {
            console.log('%c🔍 URL détectée, extraction de la clé...', 'color: #750808; font-weight: bold;');
            // Gérer différents formats: https://api.day.app/KEY ou api.day.app/KEY
            trimmed = trimmed.replace(/https:\/\//g, '').replace(/api\.day\.app\//g, '').replace(/\//g, '');
            console.log('Clé extraite:', trimmed);
        }
        
        console.log('%c💾 Sauvegarde clé Bark dans Firestore', 'color: #750808; font-weight: bold;');
        await updateDoc(userRef, { barkApiKey: trimmed || null });
        if (barkApiStatus) {
            barkApiStatus.textContent = trimmed ? 'Bark API : configurée' : 'Bark API : non configurée';
        }
        if (!trimmed) {
            console.log('🗑️ Clé supprimée');
            alert('Clé Bark supprimée.');
            if (barkApiTimer) {
                clearTimeout(barkApiTimer);
                barkApiTimer = null;
            }
        } else {
            alert('Clé Bark enregistrée. Notification dans 5 secondes : "va te br".');
            if (barkApiTimer) {
                clearTimeout(barkApiTimer);
            }
            console.log('%c⏱️ Timer Bark lancé pour 5 secondes', 'color: #dac103; font-weight: bold; font-size: 14px;');
            barkApiTimer = setTimeout(() => {
                console.log('%c⏰ Délai écoulé, appel de addSystemNotification', 'color: #dac103; font-weight: bold; font-size: 14px;');
                addSystemNotification('va te br');
            }, 5000);
        }
    });
}

if (barkApiBtn) {
    barkApiBtn.addEventListener('click', () => {
        configureBarkApiKey();
    });
}

if (document.getElementById('apply-photo-btn')) {
    document.getElementById('apply-photo-btn').addEventListener('click', async () => {
        const urlInput = document.getElementById('photo-url-input').value.trim();
        const fileInput = document.getElementById('photo-file-input');
        let photoUrl = urlInput;
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const img = new Image();
                        img.onload = async () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            let width = img.width;
                            let height = img.height;
                            const maxSize = 400;
                            
                            if (width > height) {
                                if (width > maxSize) {
                                    height = Math.round((height * maxSize) / width);
                                    width = maxSize;
                                }
                            } else {
                                if (height > maxSize) {
                                    width = Math.round((width * maxSize) / height);
                                    height = maxSize;
                                }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
                            await updatePhotoInDb(compressedUrl);
                            closePhotoModal();
                        };
                        img.onerror = () => alert('Erreur chargement image');
                        img.src = e.target.result;
                    } catch (err) {
                        console.error('Erreur compression image:', err);
                        alert('Erreur lors du traitement de l\'image');
                    }
                };
                reader.onerror = () => alert('Erreur lecture fichier');
                reader.readAsDataURL(file);
            } catch (err) {
                console.error('Erreur fichier:', err);
                alert('Erreur sélection fichier');
            }
        } else if (photoUrl) {
            await updatePhotoInDb(photoUrl);
            closePhotoModal();
        }
    });
    document.getElementById('delete-photo-btn').addEventListener('click', async () => {
        const userRef = doc(db, "users", currentUser);
        await setDoc(userRef, { photoUrl: null }, { merge: true });
        userPhotoByUser[currentUser] = null;
        localStorage.removeItem(`cinqContreUnPhoto_${currentUser}`);
        userAvatar.style.backgroundImage = 'none';
        closePhotoModal();
    });
}

async function updatePhotoInDb(photoUrl) {
    const userRef = doc(db, "users", currentUser);
    
    try {
        localStorage.removeItem(`cinqContreUnPhoto_${currentUser}`);
    } catch (e) {
        console.error('Erreur suppression localStorage', e);
    }
    
    try {
        await updateDoc(userRef, { photoUrl });
    } catch (e) {
        console.error('Erreur update photo Firestore', e);
        try {
            await setDoc(userRef, { photoUrl }, { merge: true });
        } catch (e2) {
            console.error('Erreur setDoc photo Firestore', e2);
        }
    }
    
    userPhotoByUser[currentUser] = photoUrl;
    if (typeof window !== 'undefined' && currentUser) {
        localStorage.setItem(`cinqContreUnPhoto_${currentUser}`, photoUrl);
    }
    userAvatar.style.backgroundImage = `url(${photoUrl})`;
}

btnMain.addEventListener('click', async (e) => {
    if (!currentUser) return;
    
    // 🔊 JOUER LE SON
    if (window.playClickSound) window.playClickSound();
    
    createFloatingPlus(e);
    ratings = { duration: 0, pleasure: 0, quality: 0 };
    document.getElementById('br-description-input').value = '';
    document.querySelectorAll('.stars[data-category]').forEach(star => {
        star.innerHTML = '';
        const category = star.dataset.category;
        let emoji = '⭐';
        if (category === 'duration') emoji = '⏱️';
        else if (category === 'pleasure') emoji = '💧';
        else if (category === 'quality') emoji = '📷';
        
        for (let i = 0; i < 5; i++) {
            const s = document.createElement('span');
            s.className = 'star';
            s.textContent = emoji;
            s.dataset.value = i + 1;
            s.addEventListener('click', () => {
                ratings[category] = i + 1;
                updateStarDisplay(star, i + 1);
            });
            s.addEventListener('mouseenter', () => {
                updateStarDisplay(star, i + 1);
            });
            s.addEventListener('mouseleave', () => {
                updateStarDisplay(star, ratings[category]);
            });
            star.appendChild(s);
        }
    });
    document.getElementById('rating-modal-overlay').style.display = 'flex';
});

function updateStarDisplay(starsContainer, filled) {
    const stars = starsContainer.querySelectorAll('.star');
    const category = starsContainer.dataset.category;
    let filledEmoji = '⭐', emptyEmoji = '☆';
    if (category === 'duration') {
        filledEmoji = '⏱️';
        emptyEmoji = '⏰';
    } else if (category === 'pleasure') {
        filledEmoji = '💧';
        emptyEmoji = '💧';
    } else if (category === 'quality') {
        filledEmoji = '📷';
        emptyEmoji = '📷';
    }
    
    stars.forEach((s, idx) => {
        if (idx < filled) {
            s.classList.add('filled');
            s.textContent = filledEmoji;
        } else {
            s.classList.remove('filled');
            s.textContent = emptyEmoji;
        }
    });
}

function closeRatingModal() {
    document.getElementById('rating-modal-overlay').style.display = 'none';
}
window.closeRatingModal = closeRatingModal;

document.getElementById('submit-br-btn').addEventListener('click', async () => {
    if (!currentUser) return;
    const description = document.getElementById('br-description-input').value.trim();
    await addDoc(collection(db, "br"), {
        user: currentUser,
        description: description || "BR sans description",
        createdAt: serverTimestamp(),
        weekId: getISOWeekString(),
        ratings: ratings,
        commentCount: 0
    });
    const userRef = doc(db, "users", currentUser);
    await updateDoc(userRef, { 
        totalScore: increment(1), 
        weeklyScore: increment(1),
        lastWeeklyScoreUpdate: serverTimestamp() 
    });
    closeRatingModal();
});

function createFloatingPlus(e) {
    const plus = document.createElement('span');
    plus.classList.add('floating-plus');
    plus.textContent = '+1';
    const rect = btnMain.getBoundingClientRect();
    plus.style.left = (rect.width / 2 - 15) + 'px';
    plus.style.top = (rect.height / 2 - 20) + 'px';
    btnMain.appendChild(plus);
    setTimeout(() => plus.remove(), 1000);
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ans";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " jours";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " heures";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " secondes";
}

function startListeners() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        let usersData = [];
        snapshot.forEach(d => {
            const data = d.data();
            usersData.push({
                name: data.name,
                total: data.totalScore || 0,
                weekly: data.weeklyScore || 0,
                photoUrl: data.photoUrl || null,
                lastUpdate: data.lastWeeklyScoreUpdate || null
            });
            userPhotoByUser[data.name] = data.photoUrl || null;
            if (data.name === currentUser) {
                document.getElementById('total-score').textContent = data.totalScore || 0;
                document.getElementById('weekly-score').textContent = data.weeklyScore || 0;
                if (userAvatar) {
                    const localPhoto = localStorage.getItem(`cinqContreUnPhoto_${currentUser}`);
                    const finalPhoto = data.photoUrl || localPhoto || null;
                    userAvatar.style.backgroundImage = finalPhoto ? `url(${finalPhoto})` : 'none';
                    if (finalPhoto) {
                        userPhotoByUser[currentUser] = finalPhoto;
                    }
                }

                if (barkApiStatus) {
                    if (data.barkApiKey) {
                        barkApiStatus.textContent = 'Bark API : configurée';
                    } else {
                        barkApiStatus.textContent = 'Bark API : non configurée';
                    }
                }
            }
        });
        updateLeaderboard(usersData);
    });

    onSnapshot(collection(db, "history"), (snapshot) => {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        let historyData = [];
        snapshot.forEach(d => historyData.push(d.data()));
        historyData.sort((a, b) => b.weekId.localeCompare(a.weekId));
        historyData.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Semaine ${item.weekId.split('-W')[1]}</span> <strong>${item.winner} (${item.score} pts)</strong>`;
            historyList.appendChild(li);
        });
    });

    const brQuery = query(collection(db, "br"), orderBy("createdAt", "desc"), limit(10));
    onSnapshot(brQuery, (snapshot) => {
        if (!brFeedList) return;

        // Notifications à chaque nouvelle br postée par d'autres joueurs (hors mise en cache initiale)
        if (snapshot.docChanges) {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' && !brInitialLoad) {
                    const brData = change.doc.data();
                    if (brData && brData.user && brData.user !== currentUser) {
                        addNotification(brData);
                    }
                }
            });
        }

        brFeedList.innerHTML = '';
        snapshot.forEach(brDoc => {
            const brData = brDoc.data();
            const li = document.createElement('li');
            li.className = 'br-card';

            const ratingAvg = brData.ratings ? 
                Math.round((brData.ratings.duration + brData.ratings.pleasure + brData.ratings.quality) / 3) : 0;
            const userAvatarUrl = userPhotoByUser[brData.user] || '';
            const time = brData.createdAt ? timeAgo(brData.createdAt.toDate()) : 'à l\'instant';

            li.innerHTML = `
                <div class="br-card-header">
                    <div class="br-card-avatar" style="background-image: url('${userAvatarUrl}')"></div>
                    <div class="br-card-user-time">
                        <span class="br-card-user">${brData.user}</span>
                        <span class="br-card-time">il y a ${time}</span>
                    </div>
                </div>
                <p class="br-card-description">${brData.description}</p>
                <div class="br-card-footer">
                    <span class="br-card-rating">⭐ ${ratingAvg > 0 ? ratingAvg + '/5' : 'Pas noté'}</span>
                    <span class="br-card-comments">💬 ${brData.commentCount || 0} commentaires</span>
                </div>
                <button class="br-card-comment-btn">Voir les commentaires</button>
            `;
            
            li.querySelector('.br-card-comment-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openBrDetail(brDoc.id, brData);
            });

            li.addEventListener('click', () => openBrDetail(brDoc.id, brData));
            brFeedList.appendChild(li);
        });

        brInitialLoad = false;
    });

    // 🚀 Listener global pour notifier TOUS les utilisateurs en temps réel (même hors du feed)
    console.log('%c📡 Activation listener GLOBAL pour notifs temps-réel', 'color: #00ff00; font-weight: bold; font-size: 14px;');
    const globalBrQuery = query(collection(db, "br"), orderBy("createdAt", "desc"));
    onSnapshot(globalBrQuery, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const brData = change.doc.data();
                if (brData && brData.user && brData.user !== currentUser && brInitialLoad === false) {
                    console.log('%c🔔 Nouvelle BR détectée pour notif:', 'color: #00ff00; font-weight: bold;', brData.user);
                    addNotification(brData);
                }
            }
        });
    });
}

function updateLeaderboard(usersData) {
    usersData.sort((a, b) => {
        if (b.weekly !== a.weekly) {
            return b.weekly - a.weekly;
        }
        if (!a.lastUpdate || !b.lastUpdate) {
            return 0;
        }
        return a.lastUpdate.toMillis() - b.lastUpdate.toMillis();
    });

    const list = document.getElementById('leaderboard-list');
    if (list) list.innerHTML = '';

    // Masquer le podium et afficher un classement complet
    if (podiumPlaces) {
        podiumPlaces.innerHTML = '';
    }

    usersData.forEach((u, index) => {
        const li = document.createElement('li');
        li.classList.add('leaderboard-item');
        
        // Ajouter les classes de rang
        if (index === 0 && u.weekly > 0) li.classList.add('rank-1');
        if (index === 1 && u.weekly > 0) li.classList.add('rank-2');
        if (index === 2 && u.weekly > 0) li.classList.add('rank-3');

        const rankDiv = document.createElement('div');
        rankDiv.className = 'leaderboard-rank';
        rankDiv.textContent = `#${index + 1}`;

        const userDiv = document.createElement('div');
        userDiv.className = 'leaderboard-user';

        const avatar = document.createElement('div');
        avatar.className = 'leaderboard-avatar';
        if (u.photoUrl) {
            avatar.style.backgroundImage = `url(${u.photoUrl})`;
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = u.name;

        userDiv.appendChild(avatar);
        userDiv.appendChild(nameSpan);

        const scoreStrong = document.createElement('strong');
        scoreStrong.textContent = `${u.weekly} BR`;

        li.appendChild(rankDiv);
        li.appendChild(userDiv);
        li.appendChild(scoreStrong);

        li.addEventListener('click', async () => {
            const userRef = doc(db, 'users', u.name);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                openMemberProfile(userDoc.data());
            }
        });

        if (list) list.appendChild(li);
    });
}

function updateNotificationBadge() {
    console.log('updateNotificationBadge appelé. Badge exist?', !!notificationBadge, 'Unread count:', unreadNotificationCount);
    if (!notificationBadge) {
        console.warn('❌ notificationBadge est null!');
        return;
    }
    if (unreadNotificationCount > 0) {
        notificationBadge.style.display = 'flex';
        notificationBadge.textContent = String(unreadNotificationCount);
        console.log('✅ Badge affiché avec count:', unreadNotificationCount);
    } else {
        notificationBadge.style.display = 'none';
        console.log('✅ Badge caché');
    }
}

function renderNotifications() {
    console.log('renderNotifications appelé. notificationSection:', !!notificationSection, 'notificationList:', !!notificationList, 'notificationEmpty:', !!notificationEmpty);
    if (!notificationSection || !notificationList || !notificationEmpty) {
        console.warn('❌ Un des éléments de notification est null!');
        return;
    }
    if (notifications.length === 0) {
        notificationEmpty.style.display = 'block';
        notificationList.style.display = 'none';
        notificationList.innerHTML = '';
        console.log('✅ Aucune notification, affichage message vide');
        return;
    }

    notificationEmpty.style.display = 'none';
    notificationList.style.display = 'block';
    notificationList.innerHTML = '';

    notifications.forEach(n => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.innerHTML = `
            <span>${n.text}</span>
            <span class="notification-time">${n.time}</span>
        `;

        if (n.isBark) {
            li.style.borderLeft = '3px solid #e03d3d';
            li.style.backgroundColor = 'rgba(224, 61, 61, 0.1)';
        }

        notificationList.appendChild(li);
    });
    console.log('✅ rendu notifications terminé, total:', notifications.length);
}

function addNotification(brData) {
    if (!brData || !brData.user || brData.user === currentUser) return;

    const isBark = brData.description && brData.description.toLowerCase().includes('bark');
    let text = `${brData.user} a posté une BR`;
    let notifTitle = '💪 CinqContre1 - Nouvelle BR';
    let notifBody = '';

    if (brData.description) {
        text = `${brData.user} : ${brData.description}`;
    }

    if (isBark) {
        text = `🚨 BARK : ${brData.user} vient de publier une BR !`;
        notifTitle = '🚨 CinqContre1 - BARK Alert';
        notifBody = `${brData.user} a posté une BR BARK !\n${brData.description}`;
    } else {
        // Ajouter une phrase rigolote pour chaque BR
        const randomJoke = brJokes[Math.floor(Math.random() * brJokes.length)];
        notifBody = `${brData.user} ${randomJoke}`;
        text = `${brData.user} ${randomJoke}`;
    }

    const time = brData.createdAt ? timeAgo(brData.createdAt.toDate()) : 'à l\'instant';

    notifications.unshift({ text, time, isBark });

    if (currentTab !== 'notifications') {
        unreadNotificationCount = Math.min(99, unreadNotificationCount + 1);
    }

    updateNotificationBadge();
    renderNotifications();
    
    // Envoyer notification Bark pour TOUTES les BR
    if (notifBody) {
        sendToBarksNotification(notifTitle, notifBody);
    }
}

function setActiveTab(tab) {
    currentTab = tab;

    // always hide all optional sections first
    if (homePodium) homePodium.style.display = 'none';
    if (leaderboardListSection) leaderboardListSection.style.display = 'none';
    if (brTab) brTab.style.display = 'none';
    if (navHistory) navHistory.style.display = 'none';
    if (notificationSection) notificationSection.style.display = 'none';

    // main action button and score should always remain visible
    if (navMainButton) navMainButton.style.display = 'block';

    if (tab === 'home') {
        // Afficher le classement complet au lieu du podium
        if (leaderboardListSection) leaderboardListSection.style.display = 'block';
    } else if (tab === 'leaderboard') {
        if (brTab) brTab.style.display = 'block';
    } else if (tab === 'challenges') {
        openChallengesModal();
    } else if (tab === 'notifications') {
        if (notificationSection) notificationSection.style.display = 'block';
        renderNotifications();
        unreadNotificationCount = 0;
        updateNotificationBadge();
    } else if (tab === 'confrerie') {
        if (homePodium) homePodium.style.display = 'block';
        loadConfrerieView();
        confrerieViewModalOverlay.style.display = 'flex';
    }

    // retour automatique à l'accueil quand on quitte un autre onglet (clic sur autre page personnelle)
    if (tab !== 'home') {
        window.addEventListener('blur', () => setActiveTab('home'), { once: true });
    }
}

function openBrDetail(brId, brData) {
    currentBrId = brId;
    if (!brModalOverlay || !brDetailText || !brCommentsList) return;
    brDetailText.textContent = `${brData.user} : ${brData.description}`;
    brModalOverlay.style.display = 'flex';
    if (brRatings && brData.ratings) {
        const durationEmoji = '⏱️';
        const pleasureEmoji = '💧';
        const qualityEmoji = '📷';
        const emptyEmoji = '⚪';

        const renderStars = (value, emoji) => {
            return `${emoji.repeat(value)}${emptyEmoji.repeat(5 - value)}`;
        };

        brRatings.innerHTML = `
            <div class="br-rating-item">
                <span class="br-rating-label">⏱️ Durée :</span>
                <div class="br-rating-stars">${renderStars(brData.ratings.duration, durationEmoji)}</div>
            </div>
            <div class="br-rating-item">
                <span class="br-rating-label">💧 Plaisir :</span>
                <div class="br-rating-stars">${renderStars(brData.ratings.pleasure, pleasureEmoji)}</div>
            </div>
            <div class="br-rating-item">
                <span class="br-rating-label">📷 Qualité :</span>
                <div class="br-rating-stars">${renderStars(brData.ratings.quality, qualityEmoji)}</div>
            </div>
        `;
    }
    const commentsRef = collection(db, "br", brId, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));

    const buildCommentNode = (commentDoc) => {
        const c = commentDoc.data();
        const li = document.createElement('li');
        li.className = 'br-comment-item';

        const avatarUrl = userPhotoByUser[c.user] || '';

        li.innerHTML = `
            <div class="br-comment-avatar" style="background-image: url('${avatarUrl}')"></div>
            <div class="br-comment-body">
                <p class="br-comment-text">
                    <span class="br-comment-user">${c.user}</span>
                    ${c.text}
                </p>
                <div class="br-comment-meta">
                    <span>${c.createdAt ? timeAgo(c.createdAt.toDate()) : ''}</span>
                    <button class="br-comment-reply" data-id="${commentDoc.id}">Répondre</button>
                    <button class="br-comment-like" data-id="${commentDoc.id}">♥ ${c.likes || 0}</button>
                    ${currentUser === ADMIN_USER ? `<button class="br-comment-delete" data-id="${commentDoc.id}">Supprimer</button>` : ''}
                </div>
            </div>
            <ul class="br-subcomments-list" data-parent="${commentDoc.id}"></ul>
        `;

        const likeBtn = li.querySelector('.br-comment-like');
        likeBtn.addEventListener('click', async () => {
            const commentRef = doc(db, "br", currentBrId, "comments", commentDoc.id);
            await updateDoc(commentRef, { likes: increment(1) });
        });

        const replyBtn = li.querySelector('.br-comment-reply');
        replyBtn.addEventListener('click', async () => {
            showPrompt(`Répondre à ${c.user} :`, '', async (replyText) => {
                if (!replyText || !replyText.trim()) return;
                await addDoc(commentsRef, {
                    user: currentUser,
                    text: replyText.trim(),
                    parentId: commentDoc.id,
                    createdAt: serverTimestamp(),
                    likes: 0
                });
                const brRef = doc(db, "br", currentBrId);
                await updateDoc(brRef, { commentCount: increment(1) });
            });
        });

        if (currentUser === ADMIN_USER) {
            const deleteBtn = li.querySelector('.br-comment-delete');
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Supprimer ce commentaire (et ses réponses) ?')) return;
                const deletedCount = await deleteCommentAndReplies(commentDoc.id);
                const brRef = doc(db, "br", currentBrId);
                await updateDoc(brRef, { commentCount: increment(-deletedCount) });
            });
        }

        return li;
    };

    const renderComments = (comments) => {
        const rootComments = comments.filter(c => !c.data().parentId);
        const replyComments = comments.filter(c => c.data().parentId);

        brCommentsList.innerHTML = '';

        const insertCommentWithReplies = (commentDoc) => {
            const node = buildCommentNode(commentDoc);
            const subList = node.querySelector('.br-subcomments-list');
            if(subList) {
                const childComments = replyComments.filter(x => x.data().parentId === commentDoc.id);
                childComments.forEach(childDoc => {
                    const childNode = insertCommentWithReplies(childDoc);
                    subList.appendChild(childNode);
                });
            }
            return node;
        };

        rootComments.forEach(rootDoc => {
            const rootNode = insertCommentWithReplies(rootDoc);
            brCommentsList.appendChild(rootNode);
        });
    };

    onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs;
        renderComments(comments);
    });
}

async function deleteCommentAndReplies(commentId) {
    if (!currentBrId) return 0;
    let deletedCount = 0;
    const commentsRef = collection(db, "br", currentBrId, "comments");
    const commentDocRef = doc(db, "br", currentBrId, "comments", commentId);
    
    const childQuery = query(commentsRef, where("parentId", "==", commentId));
    const childSnap = await getDocs(childQuery);
    for (const child of childSnap.docs) {
        deletedCount += await deleteCommentAndReplies(child.id);
    }
    
    await deleteDoc(commentDocRef);
    deletedCount++;
    return deletedCount;
}

brDetailClose.addEventListener('click', () => {
    brModalOverlay.style.display = 'none';
    currentBrId = null;
});

brCommentSubmit.addEventListener('click', async () => {
    if (!currentBrId || !currentUser) return;
    const text = brCommentInput.value.trim();
    if (!text) return;
    const commentsRef = collection(db, "br", currentBrId, "comments");
    await addDoc(commentsRef, {
        user: currentUser,
        text,
        parentId: null,
        createdAt: serverTimestamp(),
        likes: 0
    });
    const brRef = doc(db, "br", currentBrId);
    await updateDoc(brRef, { commentCount: increment(1) });
    brCommentInput.value = '';
});

function getISOWeekString() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

async function checkWeeklyReset() {
    const currentWeek = getISOWeekString();
    const configRef = doc(db, "system", "config");
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
        await setDoc(configRef, { currentWeek: currentWeek, brLimit: 999 });
        return;
    }
    const savedWeek = configSnap.data().currentWeek;
    if (savedWeek !== currentWeek) {
        const usersSnap = await getDocs(collection(db, "users"));
        let bestUser = null;
        let bestScore = -1;
        usersSnap.forEach(d => {
            const userData = d.data();
            if ((userData.weeklyScore || 0) > bestScore) {
                bestScore = userData.weeklyScore;
                bestUser = userData.name;
            }
        });
        const batch = writeBatch(db);
        if (bestUser && bestScore > 0) {
            const historyRef = doc(db, "history", savedWeek);
            batch.set(historyRef, { winner: bestUser, score: bestScore, weekId: savedWeek });
        }
        usersSnap.forEach(userDoc => {
            batch.update(doc(db, "users", userDoc.id), { weeklyScore: 0, lastWeeklyScoreUpdate: null });
        });
        batch.update(configRef, { currentWeek: currentWeek });
        await batch.commit();
        console.log("Reset de la semaine effectué !");
    }
}

adminBtn.addEventListener('click', () => {
    document.getElementById('admin-modal-overlay').style.display = 'flex';
    loadAdminPanel();
});

function closeAdminModal() {
    document.getElementById('admin-modal-overlay').style.display = 'none';
}
window.closeAdminModal = closeAdminModal;

const confrerieBtn = document.getElementById('confrerie-btn');
const confrerieViewModalOverlay = document.getElementById('confrerie-view-modal-overlay');
const closeConfrerieViewBtn = document.getElementById('close-confrerie-view-btn');
const editDescriptionModalOverlay = document.getElementById('edit-description-modal-overlay');
const closeEditDescriptionBtn = document.getElementById('close-edit-description-btn');
const saveDescriptionBtn = document.getElementById('save-description-btn');
const descriptionTextarea = document.getElementById('description-textarea');
const memberProfileModalOverlay = document.getElementById('member-profile-modal-overlay');
const closeMemberProfileBtn = document.getElementById('close-member-profile-btn');
const manageMembersModalOverlay = document.getElementById('manage-members-modal-overlay');
const closeManageMembersBtn = document.getElementById('close-manage-members-btn');
const saveMembersBtn = document.getElementById('save-members-btn');


confrerieBtn.addEventListener('click', () => {
    loadConfrerieView();
    confrerieViewModalOverlay.style.display = 'flex';
});

closeConfrerieViewBtn.addEventListener('click', () => {
    confrerieViewModalOverlay.style.display = 'none';
});

closeEditDescriptionBtn.addEventListener('click', () => {
    editDescriptionModalOverlay.style.display = 'none';
});

saveDescriptionBtn.addEventListener('click', async () => {
    const newDescription = descriptionTextarea.value.trim();
    if (newDescription) {
        const userRef = doc(db, "users", currentUser);
        await updateDoc(userRef, { description: newDescription });
        editDescriptionModalOverlay.style.display = 'none';
        loadConfrerieView();
    }
});

closeMemberProfileBtn.addEventListener('click', () => {
    memberProfileModalOverlay.style.display = 'none';
});

closeManageMembersBtn.addEventListener('click', () => {
    manageMembersModalOverlay.style.display = 'none';
});

saveMembersBtn.addEventListener('click', async () => {
    if (!editingConfrerieId) return;

    const newMemberCheckboxes = document.querySelectorAll('#manage-members-list input[type="checkbox"]');
    const newMembers = [];
    newMemberCheckboxes.forEach(box => {
        if (box.checked) {
            newMembers.push(box.dataset.userName);
        }
    });

    const confrerieRef = doc(db, "confreries", editingConfrerieId);
    await updateDoc(confrerieRef, { members: newMembers });

    // This part is tricky, we need to update all users.
    // For now, we assume this is handled or will be handled later.
    // A better implementation would use cloud functions to keep data consistent.
    
    manageMembersModalOverlay.style.display = 'none';
    loadAdminPanel();
});


async function loadConfrerieView() {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const confrerieId = userData.confrerieId;

    if (!confrerieId) {
        document.getElementById('confrerie-view-name').textContent = "La Confrérie : Aucune";
        return;
    }

    const confrerieRef = doc(db, "confreries", confrerieId);
    const confrerieSnap = await getDoc(confrerieRef);
    if (!confrerieSnap.exists()) return;

    const confrerieData = confrerieSnap.data();
    document.getElementById('confrerie-view-name').textContent = `La Confrérie : ${confrerieData.name}`;

    const memberIds = confrerieData.members || [];
    let memberData = [];
    let totalScore = 0;
    let weeklyScore = 0;

    for (const memberId of memberIds) {
        const memberRef = doc(db, "users", memberId);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
            const data = memberSnap.data();
            memberData.push(data);
            totalScore += data.totalScore || 0;
            weeklyScore += data.weeklyScore || 0;
        }
    }
    
    await updateDoc(confrerieRef, { totalScore, weeklyScore });

    document.getElementById('confrerie-total-score').textContent = totalScore;
    document.getElementById('confrerie-weekly-score').textContent = weeklyScore;

    document.getElementById('confrerie-rank').textContent = '#1';

    const memberList = document.getElementById('confrerie-member-list');
    memberList.innerHTML = '';
    memberData.sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0));

    memberData.forEach(member => {
        const card = document.createElement('div');
        card.className = 'member-card';
        if (member.name === currentUser) {
            card.classList.add('is-current-user');
        }

        const photo = member.photoUrl ? `url('${member.photoUrl}')` : '';

        card.innerHTML = `
            <div class="member-card-header">
                <div class="member-avatar" style="background-image: ${photo}"></div>
                <div class="member-info">
                    <h4 class="member-name">${member.name}</h4>
                    <div class="member-stats">
                        <span>Total: <strong>${member.totalScore || 0}</strong></span>
                        <span>Semaine: <strong>${member.weeklyScore || 0}</strong></span>
                    </div>
                </div>
            </div>
            <div class="member-description">
                <p>${member.description || 'Pas de description.'}</p>
                <button class="edit-description-btn">✏️</button>
            </div>
        `;
        
        card.addEventListener('click', () => {
            openMemberProfile(member);
        });

        const editBtn = card.querySelector('.edit-description-btn');
        if (editBtn && member.name === currentUser) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                descriptionTextarea.value = member.description || '';
                editDescriptionModalOverlay.style.display = 'flex';
            });
        }
        
        memberList.appendChild(card);
    });
}

async function openMemberProfile(memberData) {
    document.getElementById('member-profile-name').textContent = `Profil de ${memberData.name}`;
    document.getElementById('member-profile-title').textContent = memberData.name;
    document.getElementById('member-profile-description').textContent = memberData.description || 'Pas de description.';

    const userAvatarElem = document.getElementById('member-profile-avatar');
    if (userAvatarElem) {
        userAvatarElem.style.backgroundImage = memberData.photoUrl ? `url(${memberData.photoUrl})` : 'none';
    }

    const brsRef = collection(db, "br");
    const q = query(brsRef, where("user", "==", memberData.name), orderBy("createdAt", "asc"));
    const brsSnap = await getDocs(q);

    const brsByWeek = {};
    brsSnap.forEach(doc => {
        const br = doc.data();
        const weekId = br.weekId;
        if (!brsByWeek[weekId]) {
            brsByWeek[weekId] = 0;
        }
        brsByWeek[weekId]++;
    });

    const labels = Object.keys(brsByWeek).sort();
    const data = labels.map(label => brsByWeek[label]);

    const ctx = document.getElementById('member-br-chart').getContext('2d');
    if (myChart) {
        myChart.destroy();
    }
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => `S${l.split('-W')[1]}`),
            datasets: [{
                label: 'Nombre de BR par semaine',
                data: data,
                backgroundColor: 'rgba(218, 193, 3, 0.5)',
                borderColor: 'rgba(218, 193, 3, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });

    const weeklyBrEl = document.getElementById('member-profile-weekly-br');
    const avgBrEl = document.getElementById('member-profile-avg-br');
    if (weeklyBrEl) {
        weeklyBrEl.textContent = `BR cette semaine : ${memberData.weeklyScore || 0}`;
    }
    const average = labels.length ? (data.reduce((sum, v) => sum + v, 0) / labels.length).toFixed(2) : '0.00';
    if (avgBrEl) {
        avgBrEl.textContent = `Moyenne BR/semaine : ${average}`;
    }

    memberProfileModalOverlay.style.display = 'flex';
}

async function loadAdminPanel() {
    const usersSnap = await getDocs(collection(db, "users"));
    const userListAdmin = document.getElementById('user-list-admin');
    userListAdmin.innerHTML = '';
    usersSnap.forEach(d => {
        const data = d.data();
        const div = document.createElement('div');
        div.className = 'user-admin-item';
        div.innerHTML = `
            <div class="user-admin-info">
                <div class="user-admin-name">${data.name}</div>
                <div class="user-admin-stats">Total: ${data.totalScore || 0} | Semaine: ${data.weeklyScore || 0}</div>
            </div>
            <div class="user-admin-actions">
                <button onclick="editUser('${data.name}')">Éditer code</button>
                <button onclick="editUserBR('${data.name}')">Éditer BR</button>
                <button onclick="deleteUser('${data.name}')">Supprimer</button>
            </div>
        `;
        userListAdmin.appendChild(div);
    });
    const codesList = document.getElementById('codes-list');
    codesList.innerHTML = '';
    usersSnap.forEach(d => {
        const data = d.data();
        const div = document.createElement('div');
        div.className = 'code-item';
        div.innerHTML = `<strong>${data.name}</strong><code>${data.accessCode || 'N/A'}</code>`;
        codesList.appendChild(div);
    });
    const configSnap = await getDoc(doc(db, "system", "config"));
    if (configSnap.exists()) {
        document.getElementById('br-limit-input').value = configSnap.data().brLimit || 999;
    }

    // Load Confreries
    const confreriesSnap = await getDocs(collection(db, "confreries"));
    const confreriesListAdmin = document.getElementById('confreries-admin-list');
    confreriesListAdmin.innerHTML = '';
    confreriesSnap.forEach(confDoc => {
        const confrerie = confDoc.data();
        const div = document.createElement('div');
        div.className = 'confrerie-admin-item';
        div.innerHTML = `
            <div class="confrerie-admin-info">
                <strong>${confrerie.name}</strong>
                <span>${(confrerie.members || []).length} membres</span>
            </div>
            <div class="confrerie-admin-actions">
                <button onclick="editConfrerie('${confDoc.id}')">Gérer les membres</button>
                <button onclick="deleteConfrerie('${confDoc.id}')">Supprimer</button>
            </div>
        `;
        confreriesListAdmin.appendChild(div);
    });
}

window.editConfrerie = async (confrerieId) => {
    editingConfrerieId = confrerieId;
    const confrerieDoc = await getDoc(doc(db, "confreries", confrerieId));
    if(!confrerieDoc.exists()) return;

    const confrerieData = confrerieDoc.data();
    document.getElementById('manage-members-title').textContent = `Gérer ${confrerieData.name}`;
    const currentMembers = confrerieData.members || [];

    const allUsersSnap = await getDocs(collection(db, "users"));
    const manageMembersList = document.getElementById('manage-members-list');
    manageMembersList.innerHTML = '';

    allUsersSnap.forEach(userDoc => {
        const userName = userDoc.id;
        const item = document.createElement('div');
        item.className = 'manage-member-item';
        const isChecked = currentMembers.includes(userName);

        item.innerHTML = `
            <input type="checkbox" id="user-${userName}" data-user-name="${userName}" ${isChecked ? 'checked' : ''}>
            <label for="user-${userName}">${userName}</label>
        `;
        manageMembersList.appendChild(item);
    });
    
    manageMembersModalOverlay.style.display = 'flex';
};

window.deleteConfrerie = async (confrerieId) => {
    if (confirm(`Supprimer la confrérie ${confrerieId} ?`)) {
        await deleteDoc(doc(db, "confreries", confrerieId));
        const q = query(collection(db, "users"), where("confrerieId", "==", confrerieId));
        const usersSnap = await getDocs(q);
        const batch = writeBatch(db);
        usersSnap.forEach(userDoc => {
            batch.update(doc(db, "users", userDoc.id), { confrerieId: null });
        });
        await batch.commit();
        loadAdminPanel();
    }
};

document.getElementById('add-confrerie-btn').addEventListener('click', async () => {
    showPrompt("Nom de la nouvelle confrérie :", "", async (name) => {
        if (name) {
            const newId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const newConfrerieRef = doc(db, "confreries", newId);
            await setDoc(newConfrerieRef, { name: name, members: [] });
            loadAdminPanel();
        }
    });
});

async function editUser(userName) {
    showPrompt(`Nouveau code pour ${userName} :`, "", async (newCode) => {
        if (newCode !== null && newCode.trim() !== "") {
            const userRef = doc(db, "users", userName);
            await updateDoc(userRef, { accessCode: newCode.trim() });
            loadAdminPanel();
        }
    });
}
window.editUser = editUser;

async function editUserBR(userName) {
    const userRef = doc(db, "users", userName);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    
    const currentData = userSnap.data();
    showPrompt(`Nouveau score total pour ${userName} :`, currentData.totalScore || 0, (newTotal) => {
        if (newTotal !== null) {
            showPrompt(`Nouveau score hebdomadaire pour ${userName} :`, currentData.weeklyScore || 0, async (newWeekly) => {
                if (newWeekly !== null) {
                    const totalScore = parseInt(newTotal) || 0;
                    const weeklyScore = parseInt(newWeekly) || 0;
                    await updateDoc(userRef, { totalScore, weeklyScore });
                    loadAdminPanel();
                }
            });
        }
    });
}
window.editUserBR = editUserBR;

async function deleteUser(userName) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) {
        await deleteDoc(doc(db, "users", userName));
        loadAdminPanel();
    }
}
window.deleteUser = deleteUser;

document.getElementById('add-user-btn').addEventListener('click', () => {
    document.getElementById('new-user-modal-overlay').style.display = 'flex';
});

function closeNewUserModal() {
    document.getElementById('new-user-modal-overlay').style.display = 'none';
}
window.closeNewUserModal = closeNewUserModal;

document.getElementById('generate-code-btn').addEventListener('click', () => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('new-user-code-input').value = code;
});

document.getElementById('create-user-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-user-name-input').value.trim();
    const code = document.getElementById('new-user-code-input').value.trim();
    if (!name || !code) {
        alert("Remplis tous les champs !");
        return;
    }
    const userRef = doc(db, "users", name);
    await setDoc(userRef, { name, accessCode: code, totalScore: 0, weeklyScore: 0 });
    closeNewUserModal();
    loadAdminPanel();
    loadLoginButtons();
});

const adminTabs = document.querySelectorAll('.admin-tab-btn');
adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.admin-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    });
});

document.getElementById('save-settings-btn').addEventListener('click', async () => {
    const brLimit = parseInt(document.getElementById('br-limit-input').value);
    const configRef = doc(db, "system", "config");
    await updateDoc(configRef, { brLimit });
    alert("Paramètres sauvegardés !");
});

loadLoginButtons();
init();

// --- Bottom Navigation ---
const bottomNav = document.getElementById('bottom-nav');
const navLeaderboard = document.querySelector('.leaderboard');
const navBrFeed = document.querySelector('.br-feed');
const navHistory = document.querySelector('.history');
const navMainButton = document.querySelector('.button-container');

if (bottomNav) {
    bottomNav.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.nav-btn');
        if (!targetButton) return;

        const currentActive = bottomNav.querySelector('.nav-btn.active');
        if (currentActive) currentActive.classList.remove('active');
        targetButton.classList.add('active');

        const targetView = targetButton.dataset.target;
        setActiveTab(targetView);
    });
}

// ⚔️ FONCTIONS DES DÉFIS
function openChallengesModal() {
    challengeModalOverlay.style.display = 'flex';
    loadActiveChallenges();
}

function closeChallengesModal() {
    challengeModalOverlay.style.display = 'none';
}

function switchChallengeTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.challenge-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.challenge-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'create-challenge') {
        loadOpponentsForChallenge();
    } else if (tabName === 'challenge-history') {
        loadChallengeHistory();
    }
}

function loadActiveChallenges() {
    const list = document.getElementById('active-challenges-list');
    const noActive = document.getElementById('no-active-challenges');
    
    if (!challenges || challenges.length === 0) {
        list.style.display = 'none';
        noActive.style.display = 'block';
        return;
    }
    
    list.innerHTML = '';
    noActive.style.display = 'none';
    
    challenges.forEach(challenge => {
        const progress = (challenge.participants[currentUser]?.br || 0) / challenge.target * 100;
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.innerHTML = `
            <div class="challenge-card-info">
                <h4>${challenge.type === 'br-count' ? '🎯 Nombre de BR' : challenge.type === 'streak' ? '🔥 Streak' : '💰 Points'}</h4>
                <p><strong>${challenge.title}</strong></p>
                <p>Créé par: ${challenge.creator}</p>
                <p>Finit le: ${new Date(challenge.endDate).toLocaleDateString()}</p>
                <p>Récompense: 🏆 ${challenge.reward}</p>
                <div class="challenge-card-progress">
                    <div class="challenge-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <p style="font-size: 0.8rem;">${Math.round(progress)}% - ${challenge.participants[currentUser]?.br || 0}/${challenge.target}</p>
            </div>
            <button style="background: var(--primary-color); border: none; color: #fff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">Participer</button>
        `;
        list.appendChild(card);
    });
}

function loadOpponentsForChallenge() {
    const list = document.getElementById('challenge-opponents-list');
    list.innerHTML = '';
    
    USERS.forEach(user => {
        if (user.name !== currentUser) {
            const label = document.createElement('label');
            label.className = 'opponent-checkbox';
            label.innerHTML = `
                <input type="checkbox" value="${user.name}" />
                ${user.name}
            `;
            list.appendChild(label);
        }
    });
}

function loadChallengeHistory() {
    const list = document.getElementById('challenge-history-list');
    const noHistory = document.getElementById('no-history');
    
    // Pour l'instant, juste un placeholder
    if (!challenges || challenges.length === 0) {
        list.style.display = 'none';
        noHistory.style.display = 'block';
        return;
    }
    
    list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Les défis terminés apparaissent ici.</p>';
    noHistory.style.display = 'none';
}

async function createChallenge() {
    const type = document.getElementById('challenge-type').value;
    const duration = document.getElementById('challenge-duration').value;
    const target = document.getElementById('challenge-target').value;
    const reward = document.getElementById('challenge-reward').value;
    
    if (!target || target < 1) {
        alert('Entre un objectif valide!');
        return;
    }
    
    const opponents = Array.from(document.querySelectorAll('.opponent-checkbox input:checked')).map(cb => cb.value);
    
    if (opponents.length === 0) {
        alert('Sélectionne au moins un adversaire!');
        return;
    }
    
    const now = new Date();
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newChallenge = {
        id: `challenge_${Date.now()}`,
        type,
        title: `Défi: ${target} ${type === 'br-count' ? 'BR' : type === 'streak' ? 'jours' : 'points'}`,
        target: parseInt(target),
        reward,
        creator: currentUser,
        opponents,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        participants: {
            [currentUser]: { user: currentUser, br: 0 },
            ...opponents.reduce((acc, opp) => ({ ...acc, [opp]: { user: opp, br: 0 } }), {})
        },
        active: true
    };
    
    try {
        // Sauvegarder dans Firebase
        await setDoc(doc(db, 'challenges', newChallenge.id), newChallenge);
        alert('✅ Défi créé! Que le meilleur gagne! 🏆');
        
        // Reset form
        document.getElementById('challenge-type').value = 'br-count';
        document.getElementById('challenge-duration').value = '7';
        document.getElementById('challenge-target').value = '';
        document.getElementById('challenge-reward').value = '';
        document.querySelectorAll('.opponent-checkbox input').forEach(cb => cb.checked = false);
        
        // Reload challenges
        loadActiveChallenges();
        switchChallengeTab('active-challenges');
    } catch (err) {
        console.error('Erreur création défi:', err);
        alert('❌ Erreur lors de la création du défi');
    }
}

// Setup event listeners pour les défis
if (challengesTabBtns) {
    challengesTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchChallengeTab(e.target.closest('.challenge-tab-btn').dataset.tab);
        });
    });
}

if (closeChallengesBtn) {
    closeChallengesBtn.addEventListener('click', closeChallengesModal);
}

if (createChallengeBtn) {
    createChallengeBtn.addEventListener('click', createChallenge);
}

// Charger les défis en temps réel
const challengesRef = query(collection(db, 'challenges'), where('active', '==', true));
onSnapshot(challengesRef, (snapshot) => {
    challenges = snapshot.docs.map(doc => doc.data());
    console.log('%c📊 Défis chargés', 'color: #dac103; font-weight: bold;', challenges.length);
});

// On startup, ensure home tab is active
setActiveTab('home');

// 🎯 INITIALISER LE SYSTÈME MOTIVANT
initMotivationalText();
