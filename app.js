async function normalizeUsers() {
    const usersSnap = await getDocs(collection(db, "users"));

    usersSnap.forEach(async (userDoc) => {
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
    });

    console.log("Normalisation users terminée");
}
