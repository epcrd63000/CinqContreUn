// --- ANIMATION DE FLAMME EN CONTINU POUR LE PODIUM ---
(function() {
    const canvas = document.getElementById('flame-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    
    let width, height;
    let flames = [];
    let smokes = [];
    let sparks = [];

    function resize() {
        const podium = document.getElementById('home-podium');
        if (podium) {
            width = canvas.width = podium.clientWidth;
            height = canvas.height = podium.clientHeight;
        } else {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resize);
    // Initial resize will happen in animate or after load

    // --- PRE-RENDERING: TEXTURE DE FLAMME ---
    const fireTex = document.createElement('canvas');
    const fireSize = 80;
    fireTex.width = fireSize * 2;
    fireTex.height = fireSize * 2;
    const fCtx = fireTex.getContext('2d');
    const fGrad = fCtx.createRadialGradient(fireSize, fireSize, 0, fireSize, fireSize, fireSize);
    fGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    fGrad.addColorStop(0.15, 'rgba(255, 200, 0, 0.9)');
    fGrad.addColorStop(0.4, 'rgba(255, 40, 0, 0.5)');
    fGrad.addColorStop(0.7, 'rgba(100, 0, 0, 0.15)');
    fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    fCtx.fillStyle = fGrad;
    fCtx.beginPath();
    fCtx.arc(fireSize, fireSize, fireSize, 0, Math.PI * 2);
    fCtx.fill();

    // --- PRE-RENDERING: TEXTURE DE FUMÉE ---
    const smokeTex = document.createElement('canvas');
    const smokeSize = 100;
    smokeTex.width = smokeSize * 2;
    smokeTex.height = smokeSize * 2;
    const sCtx = smokeTex.getContext('2d');
    const sGrad = sCtx.createRadialGradient(smokeSize, smokeSize, 0, smokeSize, smokeSize, smokeSize);
    sGrad.addColorStop(0, 'rgba(40, 40, 40, 0.8)');
    sGrad.addColorStop(0.5, 'rgba(20, 20, 20, 0.4)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.beginPath();
    sCtx.arc(smokeSize, smokeSize, smokeSize, 0, Math.PI * 2);
    sCtx.fill();

    // --- CLASSE DE PARTICULE ---
    class Particle {
        constructor(type) {
            this.type = type; 
            
            const spawnSpread = width > 600 ? width * 0.8 : width * 0.9;
            this.x = (width / 2) + (Math.random() - 0.5) * spawnSpread;
            this.y = height - 10 + Math.random() * 20; 

            this.angle = Math.random() * Math.PI * 2;
            this.turbulence = Math.random() * 0.05 + 0.02;

            if (this.type === 'flame') {
                this.size = Math.random() * 60 + 30;
                this.life = Math.random() * 80 + 60; 
                this.speedY = Math.random() * 5 + 2; 
                this.speedX = (Math.random() - 0.5) * 2;
                this.thermalRise = Math.random() * 1.5 + 0.5; 
            } 
            else if (this.type === 'smoke') {
                this.size = Math.random() * 80 + 60;
                this.life = Math.random() * 120 + 100; 
                this.speedY = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 1;
                this.thermalRise = Math.random() * 1 + 0.5;
            }
            else if (this.type === 'spark') {
                this.size = Math.random() * 3 + 1;
                this.life = Math.random() * 60 + 40;
                this.speedY = Math.random() * 10 + 5; 
                this.speedX = (Math.random() - 0.5) * 5;
                this.thermalRise = 0;
            }
            
            this.maxLife = this.life;
        }

        update() {
            this.speedY *= 0.95; 
            this.speedX *= 0.95;

            this.y -= (this.speedY + this.thermalRise);
            
            this.angle += this.turbulence;
            const wind = Math.sin(this.angle) * (this.type === 'spark' ? 2 : 1);
            this.x += this.speedX + wind;
            
            if (this.type === 'flame') {
                this.size *= 0.96; 
            } else if (this.type === 'smoke') {
                this.size *= 1.01; 
            }

            this.life -= (this.type === 'spark' ? 2 : 1.2); 
        }

        draw() {
            const lifeRatio = Math.max(0, this.life / this.maxLife);
            
            if (this.type === 'spark') {
                ctx.globalAlpha = lifeRatio;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.life > this.maxLife * 0.5 ? '#fffacd' : '#ff4500';
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } 
            else if (this.type === 'flame') {
                ctx.globalAlpha = lifeRatio * 1.2; 
                ctx.drawImage(fireTex, this.x - this.size, this.y - (this.size * 1.3), this.size * 2, this.size * 2.6);
                ctx.globalAlpha = 1.0;
            }
            else if (this.type === 'smoke') {
                ctx.globalAlpha = lifeRatio * 0.6; 
                ctx.drawImage(smokeTex, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                ctx.globalAlpha = 1.0;
            }
        }
    }

    let firstResize = true;

    // --- BOUCLE D'ANIMATION ---
    function animate() {
        if (firstResize && document.getElementById('home-podium').clientWidth > 0) {
            resize();
            firstResize = false;
        }

        // Spawn particles continuously
        const isVisible = document.getElementById('home-podium').style.display !== 'none';
        if (isVisible) {
            if (Math.random() < 0.4) smokes.push(new Particle('smoke'));
            for(let i=0; i<3; i++) if (Math.random() < 0.8) flames.push(new Particle('flame'));
            if (Math.random() < 0.5) sparks.push(new Particle('spark'));
        }

        // 1. Fond noir mat de base
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#020000';
        ctx.fillRect(0, 0, width || 0, height || 0);

        // 2. Rendu de la Fumée
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < smokes.length; i++) {
            smokes[i].update();
            smokes[i].draw();
            if (smokes[i].life <= 0) { smokes.splice(i, 1); i--; }
        }

        // 3. Rendu du Feu et des Étincelles
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < flames.length; i++) {
            flames[i].update();
            flames[i].draw();
            if (flames[i].life <= 0 || flames[i].size <= 1) { flames.splice(i, 1); i--; }
        }

        for (let i = 0; i < sparks.length; i++) {
            sparks[i].update();
            sparks[i].draw();
            if (sparks[i].life <= 0) { sparks.splice(i, 1); i--; }
        }

        requestAnimationFrame(animate);
    }

    // Start
    setTimeout(() => {
        resize();
        animate();
    }, 500);

})();
