# CinqContreUn 🖐️

Une application web collaborative de défi créée avec Firebase. Les utilisateurs peuvent enregistrer leurs blagues/BR (branlette/blague), les noter sur 5 étoiles et participer à un défi hebdomadaire.

## 🎯 Fonctionnalités

### ✨ Pour tous les utilisateurs:
- **Connexion par code d'accès** - Authentification sécurisée
- **Photo de profil** - Ajouter/modifier/supprimer votre avatar
- **Enregistrer une BR** - Décrire votre BR avec notation sur 5 étoiles:
  - ⏱️ Durée
  - 😊 Plaisir
  - 📹 Qualité de la vidéo / Partenaire
- **Leaderboard** - Classement de la semaine en temps réel
- **Historique** - Palmarès des semaines précédentes
- **Commentaires** - Commenter les BR avec système de likes
- **Auto-connexion par IP** - Connexion automatique sur le même réseau

### 🔐 Pour l'administrateur (Étienne):
- **Gestion des utilisateurs** - Voir/éditer/supprimer les profils
- **Gestion des codes d'accès** - Créer des códs, afficher les codes existants
- **Ajouter des profils** - Créer de nouveaux utilisateurs avec code auto-généré
- **Paramètres** - Configurer la limite de BR par personne

## 🖼️ Interface

- Modal élégante pour les détails des BR avec système de notation visuel
- Panel d'administration avec onglets (Utilisateurs, Codes, Paramètres)
- Design moderne et responsif
- Animations fluides et feedback utilisateur

## 🚀 Technologie

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Backend** : Firebase Firestore (base de données temps réel)
- **Authentification** : Code d'accès + Auto-login par IP
- **Temps réel** : Firebase onSnapshot listeners

## 📱 Utilisation

1. Ouvrir `index.html` dans le navigateur
2. Sélectionner votre nom
3. Entrer votre code d'accès
4. Cliquer sur le gros bouton "+1" pour enregistrer une BR
5. Noter la BR sur 5 étoiles (Durée, Plaisir, Qualité)
6. Voir les BR des autres, commenter et liker

## ⚙️ Administration

Étienne a accès à un panel d'administration permettant de:
- Voir tous les utilisateurs et leurs scores
- Visualiser les codes d'accès
- Créer/modifier/supprimer des profils
- Configurer les paramètres de l'application

## 🔧 Configuration Firebase

Tous les paramètres Firebase sont dans `app.js`. Pour utiliser votre propre projet:
1. Créer un projet Firebase
2. Créer une base de données Firestore
3. Remplacer la `firebaseConfig` dans `app.js`

## 📝 Structure des données Firebase

```
/users/{userId}
  - name
  - accessCode
  - totalScore
  - weeklyScore
  - photoUrl
  - ips[]

/br/{brId}
  - user
  - description
  - createdAt
  - weekId
  - ratings: { duration, pleasure, quality }
  - /comments/{commentId}
    - user
    - text
    - createdAt
    - likes

/history/{weekId}
  - winner
  - score
  - weekId

/system/config
  - currentWeek
  - brLimit
```

## 🎨 Personnalisation

Modifiez les variables CSS dans `style.css`:
- `--primary-color`: Couleur principale (violet par défaut)
- `--secondary-color`: Couleur secondaire (cyan par défaut)
- `--bg-color`: Couleur de fond

## 📞 Support

Pour toute question ou bug, ouvrez une issue sur GitHub.

---

**Créé avec ❤️ par epcrd**
