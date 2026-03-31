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
let userPhotoByUser = {}; // pour afficher avatars dans commentaire
let ratings = { duration: 0, pleasure: 0, quality: 0 };
let currentBrId = null;
let editingConfrerieId = null;
let myChart = null;

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
    createFloatingPlus(e);
    jokeText.textContent = jokes[Math.floor(Math.random() * jokes.length)];
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
            `;
            
            li.addEventListener('click', () => openBrDetail(brDoc.id, brData));
            brFeedList.appendChild(li);
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
    list.innerHTML = '';
    usersData.forEach((u, index) => {
        const li = document.createElement('li');
        li.classList.add('leaderboard-item');
        if (index === 0 && u.weekly > 0) li.classList.add('rank-1');
        if (index === 1 && u.weekly > 0) li.classList.add('rank-2');
        if (index === 2 && u.weekly > 0) li.classList.add('rank-3');
        if (index === usersData.length - 1 && usersData[0].weekly > 0 && usersData.length > 3) li.classList.add('rank-last');
        
        const photo = u.photoUrl ? `url(${u.photoUrl})` : '';

        li.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-user">
                <div class="leaderboard-avatar" style="background-image: ${photo}"></div>
                <span>${u.name}</span>
            </div>
            <strong>${u.weekly}</strong>
        `;
        list.appendChild(li);
    });
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
            const replyText = prompt(`Répondre à ${c.user} :`);
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
    const name = prompt("Nom de la nouvelle confrérie :");
    if (name) {
        const newId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const newConfrerieRef = doc(db, "confreries", newId);
        await setDoc(newConfrerieRef, { name: name, members: [] });
        loadAdminPanel();
    }
});

async function editUser(userName) {
    const newCode = prompt(`Nouveau code pour ${userName} :`, "");
    if (newCode !== null && newCode.trim() !== "") {
        const userRef = doc(db, "users", userName);
        await updateDoc(userRef, { accessCode: newCode.trim() });
        loadAdminPanel();
    }
}
window.editUser = editUser;

async function editUserBR(userName) {
    const userRef = doc(db, "users", userName);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    
    const currentData = userSnap.data();
    const newTotal = prompt(`Nouveau score total pour ${userName} :`, currentData.totalScore || 0);
    const newWeekly = prompt(`Nouveau score hebdomadaire pour ${userName} :`, currentData.weeklyScore || 0);
    
    if (newTotal !== null && newWeekly !== null) {
        const totalScore = parseInt(newTotal) || 0;
        const weeklyScore = parseInt(newWeekly) || 0;
        await updateDoc(userRef, { totalScore, weeklyScore });
        loadAdminPanel();
    }
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
