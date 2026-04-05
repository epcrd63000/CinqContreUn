// Challenge system functions
// Load after app.js module

(function() {
    console.log('Challenge system initialized');
    
    // Expose to window for onclick handlers
    window.setChallengeScope = setChallengeScope;
    window.displayChallengeProgress = displayChallengeProgress;
    window.deleteChallenge = deleteChallenge;
    
    function setChallengeScope(scope) {
        window.currentScope = scope;
        const confBtn = document.getElementById('challenge-scope-confr');
        const globBtn = document.getElementById('challenge-scope-global');
        if (!confBtn) return;
        
        if (scope === 'confrerie') {
            confBtn.style.background = 'var(--primary-color)';
            confBtn.style.borderColor = 'var(--secondary-color)';
            globBtn.style.background = 'var(--surface-color)';
            globBtn.style.borderColor = '#333';
        } else {
            confBtn.style.background = 'var(--surface-color)';
            confBtn.style.borderColor = '#333';
            globBtn.style.background = 'var(--primary-color)';
            globBtn.style.borderColor = 'var(--secondary-color)';
        }
    }
    
    function displayChallengeProgress() {
        const container = document.getElementById('challenge-progress-container');
        if (!container) return;
        
        if (!window.challenges || window.challenges.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = '';
        window.challenges.forEach(ch => {
            const div = document.createElement('div');
            div.style.margin = '15px 0';
            div.style.padding = '15px';
            div.style.background = 'var(--surface-color)';
            div.style.borderRadius = '8px';
            
            const title = document.createElement('div');
            title.style.fontWeight = 'bold';
            title.innerText = ch.title + ' (Cible: ' + ch.target + ')';
            div.appendChild(title);
            
            const track = document.createElement('div');
            track.style.position = 'relative';
            track.style.height = '35px';
            track.style.background = '#000';
            track.style.borderRadius = '6px';
            track.style.overflow = 'hidden';
            track.style.border = '2px solid var(--secondary-color)';
            track.style.marginTop = '10px';
            
            Object.entries(ch.participants).forEach(([user, data]) => {
                const pct = Math.min((data.br || 0) / ch.target * 100, 90);
                const sperm = document.createElement('div');
                sperm.style.position = 'absolute';
                sperm.style.left = pct + '%';
                sperm.style.top = '0';
                sperm.style.width = '25px';
                sperm.style.height = '100%';
                sperm.style.background = 'gold';
                sperm.style.borderRadius = '50%';
                sperm.style.transition = 'left 0.3s';
                sperm.title = user + ': ' + (data.br || 0) + '/' + ch.target;
                sperm.innerText = 'o';
                track.appendChild(sperm);
            });
            
            const finish = document.createElement('div');
            finish.style.position = 'absolute';
            finish.style.right = '0';
            finish.style.top = '0';
            finish.style.height = '100%';
            finish.style.width = '2px';
            finish.style.background = '#00ff00';
            track.appendChild(finish);
            
            div.appendChild(track);
            container.appendChild(div);
        });
    }
    
    function deleteChallenge(id) {
        if (confirm('Vraiment supprimer?')) {
            console.log('Deleting challenge:', id);
        }
    }
})();
