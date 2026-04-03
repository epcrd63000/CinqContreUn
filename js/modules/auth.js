import { doc, getDoc, setDoc, updateDoc, arrayUnion, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from './firebase.js';

let currentUser = localStorage.getItem('cinqContreUnUser');
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

async function attemptLogin(user, code) {
    const userRef = doc(db, "users", user);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
        return { success: false, message: "Utilisateur inconnu." };
    }
    const data = snap.data();
    if (data.accessCode !== code) {
        return { success: false, message: "Code invalide." };
    }
    currentUser = user;
    localStorage.setItem('cinqContreUnUser', currentUser);
    await setDoc(userRef, { name: currentUser }, { merge: true });
    await saveCurrentIpForUser(userRef);
    return { success: true };
}

function logout() {
    localStorage.removeItem('cinqContreUnUser');
    currentUser = null;
}

function getCurrentUser() {
    return currentUser;
}

function setPendingUser(user) {
    pendingUser = user;
}

function getPendingUser() {
    return pendingUser;
}

export {
    currentUser,
    autoLoginByIp,
    attemptLogin,
    logout,
    getCurrentUser,
    setPendingUser,
    getPendingUser
};
