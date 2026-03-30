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
    serverTimestamp,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const ADMIN_USER = "Étienne";
let currentUser = localStorage.getItem('cinqContreUnUser');
let USERS = [];
let ratings = { duration: 0, pleasure: 0, quality: 0 };
let currentBrId = null;

const jokes = [
    "Et un de plus !", "Arrête de forcer un peu...", "Tu as que ça à faire ?", 
    "Machine ! 🤖", "Tricher n'est pas jouer.", "Le doigt le plus musclé de France.",
    "Allez, encore un effort !", "Impressionnant. Vraiment.", "C'est ton boss qui va être content."
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

if (document.getElementById('apply-photo-btn')) {
    document.getElementById('apply-photo-btn').addEventListener('click', async () => {
        const urlInput = document.getElementById('photo-url-input').value.trim();
        const fileInput = document.getElementById('photo-file-input');
        let photoUrl = urlInput;
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                photoUrl = e.target.result;
                await updatePhotoInDb(photoUrl);
                closePhotoModal();
            };
            reader.readAsDataURL(file);
        } else if (photoUrl) {
            await updatePhotoInDb(photoUrl);
            closePhotoModal();
        }
    });
    document.getElementById('delete-photo-btn').addEventListener('click', async () => {
        const userRef = doc(db, "users", currentUser);
        await updateDoc(userRef, { photoUrl: null });
        userAvatar.style.backgroundImage = 'none';
        closePhotoModal();
    });
}

async function updatePhotoInDb(photoUrl) {
    const userRef = doc(db, "users", currentUser);
    await updateDoc(userRef, { photoUrl });
    userAvatar.style.backgroundImage = `url(${photoUrl})`;
}

btnMain.addEventListener('click', async (e) => {
    if (!currentUser) return;
    createFloatingPlus(e);
    jokeText.textContent = jokes[Math.floor(Math.random() * jokes.length)];
    ratings = { duration: 0, pleasure: 0, quality: 0 };
    document.getElementById('br-description-input').value = '';
    document.querySelectorAll('.stars[data-category]').forEach(star => {
        star.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const s = document.createElement('span');
            s.className = 'star';
            s.textContent = '⭐';
            s.dataset.value = i + 1;
            const category = star.dataset.category;
            s.addEventListener('click', () => {
                ratings[category] = i + 1;
                updateStarDisplay(star, i + 1);
            });
            star.appendChild(s);
        }
    });
    document.getElementById('rating-modal-overlay').style.display = 'flex';
});

function updateStarDisplay(starsContainer, filled) {
    const stars = starsContainer.querySelectorAll('.star');
    stars.forEach((s, idx) => {
        if (idx < filled) s.classList.add('filled');
        else s.classList.remove('filled');
    });
}

function closeRatingModal() {
    document.getElementById('rating-modal-overlay').style.display = 'none';
}

document.getElementById('submit-br-btn').addEventListener('click', async () => {
    if (!currentUser) return;
    const description = document.getElementById('br-description-input').value.trim();
    await addDoc(collection(db, "br"), {
        user: currentUser,
        description: description || "BR sans description",
        createdAt: serverTimestamp(),
        weekId: getISOWeekString(),
        ratings: ratings
    });
    const userRef = doc(db, "users", currentUser);
    await updateDoc(userRef, { totalScore: increment(1), weeklyScore: increment(1) });
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

function startListeners() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        let usersData = [];
        snapshot.forEach(d => {
            const data = d.data();
            usersData.push({
                name: data.name,
                total: data.totalScore || 0,
                weekly: data.weeklyScore || 0,
                photoUrl: data.photoUrl || null
            });
            if (data.name === currentUser) {
                document.getElementById('total-score').textContent = data.totalScore || 0;
                document.getElementById('weekly-score').textContent = data.weeklyScore || 0;
                if (userAvatar) {
                    userAvatar.style.backgroundImage = data.photoUrl ? `url(${data.photoUrl})` : 'none';
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
        brFeedList.innerHTML = '';
        snapshot.forEach(brDoc => {
            const brData = brDoc.data();
            const li = document.createElement('li');
            const ratingAvg = brData.ratings ? 
                Math.round((brData.ratings.duration + brData.ratings.pleasure + brData.ratings.quality) / 3) : 0;
            li.textContent = `${brData.user} : ${brData.description} ⭐ ${ratingAvg > 0 ? ratingAvg : '?'}`;
            li.addEventListener('click', () => openBrDetail(brDoc.id, brData));
            brFeedList.appendChild(li);
        });
    });
}

function updateLeaderboard(usersData) {
    usersData.sort((a, b) => b.weekly - a.weekly);
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    usersData.forEach((u, index) => {
        const li = document.createElement('li');
        let classes = '';
        if (index === 0 && u.weekly > 0) classes = 'rank-1';
        if (index === usersData.length - 1 && usersData[0].weekly > 0) classes = 'rank-last';
        li.className = classes;
        li.innerHTML = `<span>${index + 1}. ${u.name}</span> <strong>${u.weekly}</strong>`;
        list.appendChild(li);
    });
}

function openBrDetail(brId, brData) {
    currentBrId = brId;
    if (!brModalOverlay || !brDetailText || !brCommentsList) return;
    brDetailText.textContent = `${brData.user} : ${brData.description}`;
    brModalOverlay.style.display = 'flex';
    if (brRatings && brData.ratings) {
        brRatings.innerHTML = `
            <div class="br-rating-item">
                <span class="br-rating-label">Durée :</span>
                <div class="br-rating-stars">${'⭐'.repeat(brData.ratings.duration)}${'☆'.repeat(5 - brData.ratings.duration)}</div>
            </div>
            <div class="br-rating-item">
                <span class="br-rating-label">Plaisir :</span>
                <div class="br-rating-stars">${'⭐'.repeat(brData.ratings.pleasure)}${'☆'.repeat(5 - brData.ratings.pleasure)}</div>
            </div>
            <div class="br-rating-item">
                <span class="br-rating-label">Qualité :</span>
                <div class="br-rating-stars">${'⭐'.repeat(brData.ratings.quality)}${'☆'.repeat(5 - brData.ratings.quality)}</div>
            </div>
        `;
    }
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
                const commentRef = doc(db, "br", currentBrId, "comments", commentId);
                await updateDoc(commentRef, { likes: increment(1) });
            });
        });
    });
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
        createdAt: serverTimestamp(),
        likes: 0
    });
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
            batch.update(doc(db, "users", userDoc.id), { weeklyScore: 0 });
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
                <button onclick="editUser('${data.name}')">Éditer</button>
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
}

async function editUser(userName) {
    const newCode = prompt(`Nouveau code pour ${userName} :`, "");
    if (newCode !== null && newCode.trim() !== "") {
        const userRef = doc(db, "users", userName);
        await updateDoc(userRef, { accessCode: newCode.trim() });
        loadAdminPanel();
    }
}

async function deleteUser(userName) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) {
        await deleteDoc(doc(db, "users", userName));
        loadAdminPanel();
    }
}

document.getElementById('add-user-btn').addEventListener('click', () => {
    document.getElementById('new-user-modal-overlay').style.display = 'flex';
});

function closeNewUserModal() {
    document.getElementById('new-user-modal-overlay').style.display = 'none';
}

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
