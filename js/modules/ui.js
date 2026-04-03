const jokeText = document.getElementById('joke-text');
const jokes = [
    "Et un de plus !", "Arrête de forcer un peu...", "Tu as que ça à faire ?", 
    "Machine ! 🤖", "Tricher n'est pas jouer.", "Le doigt le plus musclé de France.",
    "Allez, encore un effort !", "Impressionnant. Vraiment.", "C'est ton boss qui va être content."
];

function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
}

function showAppScreen() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
}

function createFloatingPlus(e) {
    const plus = document.createElement('span');
    plus.classList.add('floating-plus');
    plus.textContent = '+1';
    const rect = e.currentTarget.getBoundingClientRect();
    plus.style.left = (rect.width / 2 - 15) + 'px';
    plus.style.top = (rect.height / 2 - 20) + 'px';
    e.currentTarget.appendChild(plus);
    setTimeout(() => plus.remove(), 1000);
}

function showRandomJoke() {
    jokeText.textContent = jokes[Math.floor(Math.random() * jokes.length)];
}

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


export {
    showLoginScreen,
    showAppScreen,
    createFloatingPlus,
    showRandomJoke,
    updateStarDisplay,
    updateLeaderboard
};
