
// Challenge enhancement functions
function setChallengeScope(scope) {
    window.currentChallengeScope = scope;
    const confBtn = document.getElementById('challenge-scope-confr');
    const globalBtn = document.getElementById('challenge-scope-global');
    if (!confBtn) return;
    if (scope === 'confrerie') {
        confBtn.style.background = 'var(--primary-color)';
        confBtn.style.borderColor = 'var(--secondary-color)';
        confBtn.style.color = 'white';
        globalBtn.style.background = 'var(--surface-color)';
        globalBtn.style.borderColor = '#333';
        globalBtn.style.color = 'var(--text-main)';
    } else {
        confBtn.style.background = 'var(--surface-color)';
        confBtn.style.borderColor = '#333';
        confBtn.style.color = 'var(--text-main)';
        globalBtn.style.background = 'var(--primary-color)';
        globalBtn.style.borderColor = 'var(--secondary-color)';
        globalBtn.style.color = 'white';
    }
}

function displayChallengeProgress() {
    const container = document.getElementById('challenge-progress-container');
    if (!container) return;
    if (!challenges || challenges.length === 0) {
        if (document.getElementById('no-progress')) document.getElementById('no-progress').style.display = 'block';
        container.style.display = 'none';
        return;
    }
    container.innerHTML = '';
    document.getElementById('no-progress').style.display = 'none';
    challenges.forEach(challenge => {
        const raceDiv = document.createElement('div');
        raceDiv.style.cssText = 'margin-bottom:20px;padding:15px;background:var(--surface-color);border-radius:8px;';
        raceDiv.innerHTML = `<div style="font-weight:bold;margin-bottom:10px;">${challenge.title}</div>`;
        const trackDiv = document.createElement('div');
        trackDiv.style.cssText = 'position:relative;height:35px;background:#000;border-radius:6px;overflow:hidden;border:2px solid var(--secondary-color);';
        Object.entries(challenge.participants).forEach(([userName, data]) => {
            const progress = Math.min((data.br || 0) / challenge.target * 100, 95);
            const spermDiv = document.createElement('div');
            spermDiv.style.cssText = `position:absolute;left:${progress}%;top:0;width:30px;height:100%;background:gold;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;transition:left 0.3s;`;
            const photo = userPhotoByUser[userName];
            spermDiv.textContent = 'o';
            spermDiv.title = userName + ': ' + data.br + '/' + challenge.target;
            trackDiv.appendChild(spermDiv);
        });
        const finishLine = document.createElement('div');
        finishLine.style.cssText = 'position:absolute;right:0;top:0;height:100%;width:2px;background:#00ff00;';
        trackDiv.appendChild(finishLine);
        raceDiv.appendChild(trackDiv);
        container.appendChild(raceDiv);
    });
}

window.setChallengeScope = setChallengeScope;
window.displayChallengeProgress = displayChallengeProgress;
