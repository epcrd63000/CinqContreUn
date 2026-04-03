// Import des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
