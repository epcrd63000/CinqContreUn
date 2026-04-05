// === CHALLENGE SYSTEM UPGRADES ===
// This file contains enhancements for the challenges system
// Include AFTER app.js in index.html

let currentChallengeScope = 'confrerie';
let pendingChallenges = [];

// Expose functions to global scope for onclick handlers
window.setChallengeScope = setChallengeScope;
window.deleteChallenge = deleteChallenge;
window.displayChallengeProgress = displayChallengeProgress;

function setChallengeScope(scope) {
    currentChallengeScope = scope;
    const confBtn = document.getElementById('challenge-scope-confr');
    const globalBtn = document.getElementById('challenge-scope-global');
    
    if (scope === 'confrerie') {
        if (confBtn) {
            confBtn.style.background = 'var(--primary-color)';
            confBtn.style.borderColor = 'var(--secondary-color)';
            confBtn.style.color = 'white';
        }
        if (globalBtn) {
            globalBtn.style.background = 'var(--surface-color)';
            globalBtn.style.borderColor = '#333';
            globalBtn.style.color = 'var(--text-main)';
        }
    } else {
        if (confBtn) {
            confBtn.style.background = 'var(--surface-color)';
            confBtn.style.borderColor = '#333';
            confBtn.style.color = 'var(--text-main)';
        }
        if (globalBtn) {
            globalBtn.style.background = 'var(--primary-color)';
            globalBtn.style.borderColor = 'var(--secondary-color)';
            globalBtn.style.color = 'white';
        }
    }
}

function displayChallengeProgress() {
    const container = document.getElementById('challenge-progress-container');
    const noProgress = document.getElementById('no-progress');
    
    if (!challenges || challenges.length === 0) {
        if (container) container.style.display = 'none';
        if (noProgress) noProgress.style.display = 'block';
        return;
    }
    
    if (container) container.innerHTML = '';
    if (noProgress) noProgress.style.display = 'none';
    
    challenges.forEach(challenge => {
        const raceDiv = document.createElement('div');
        raceDiv.style.cssText = 'margin-bottom: 25px; padding: 15px; background: var(--surface-color); border-radius: 8px;';
        
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'font-weight: bold; margin-bottom: 12px; font-size: 0.9rem;';
        titleDiv.innerHTML = `${challenge.title} - Cible: ${challenge.target}`;
        raceDiv.appendChild(titleDiv);
        
        const trackDiv = document.createElement('div');
        trackDiv.style.cssText = 'position: relative; height: 40px; background: #000; border-radius: 6px; overflow: hidden; border: 2px solid var(--secondary-color);';
        
        Object.entries(challenge.participants).forEach(([userName, data]) => {
            const progress = (data.br || 0) / challenge.target * 100;
            const spermDiv = document.createElement('div');
            spermDiv.style.cssText = `position: absolute; top: 0; height: 100%; width: 35px; left: ${Math.min(progress, 95)}%; background: linear-gradient(45deg, #ffd700, #ffed4e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: left 0.3s ease; clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%); z-index: ${Math.floor(progress)};`;
            
            const photo = userPhotoByUser[userName];
            if (photo) {
                spermDiv.style.backgroundImage = `url(${photo})`;
                spermDiv.style.backgroundSize = 'cover';
                spermDiv.style.backgroundPosition = 'center';
            } else {
                spermDiv.textContent = '\u{1F40F}';
            }
            spermDiv.title = `${userName}: ${data.br}/${challenge.target}`;
            trackDiv.appendChild(spermDiv);
        });
        
        const finishLine = document.createElement('div');
        finishLine.style.cssText = 'position: absolute; right: 0; top: 0; height: 100%; width: 3px; background: #00ff00; opacity: 0.8; animation: pulse 1s infinite;';
        trackDiv.appendChild(finishLine);
        
        raceDiv.appendChild(trackDiv);
        
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'font-size: 0.8rem; color: var(--text-muted); margin-top: 10px;';
        const sorted = Object.entries(challenge.participants).sort((a, b) => (b[1].br || 0) - (a[1].br || 0));
        if (sorted.length > 0) {
            infoDiv.innerHTML = `Leader: <strong>${sorted[0][0]}</strong> (${sorted[0][1].br}/${challenge.target})`;
        }
        raceDiv.appendChild(infoDiv);
        
        if (container) container.appendChild(raceDiv);
    });
}

console.log('%c Challenges System Upgraded', 'color: #dac103; font-weight: bold;');
