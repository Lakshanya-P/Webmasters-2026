// galaxy-bg.js
// Unique animated galaxy background: swirling nebula, stars, and a glowing core

function randomBetween(a, b) {
    return a + Math.random() * (b - a);
}

function drawNebula(ctx, x, y, r, colorStops, alpha, swirl) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(swirl);
    let grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    for (const stop of colorStops) {
        grad.addColorStop(stop[0], stop[1]);
    }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
}

function drawGalaxyCore(ctx, x, y, r, t) {
    ctx.save();
    let grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.18, 'rgba(220,180,255,0.7)');
    grad.addColorStop(0.5, 'rgba(180,120,255,0.32)');
    grad.addColorStop(1, 'rgba(120,80,255,0.08)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.shadowColor = '#b080ff';
    ctx.shadowBlur = 80 + 20 * Math.sin(t/2);
    ctx.globalAlpha = 0.85 + 0.1 * Math.sin(t);
    ctx.fill();
    ctx.restore();
}

function drawStar(ctx, x, y, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
}

export function initGalaxyBackground(canvasId = 'galaxy-bg-canvas') {
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);
    }
    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate stars with velocity for movement
    const STAR_COUNT = 120;
    let stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: randomBetween(0.5, 1.7),
        alpha: randomBetween(0.4, 1),
        dx: randomBetween(-0.00008, 0.00008),
        dy: randomBetween(-0.00008, 0.00008)
    }));

    // Nebula clouds with velocity for movement
                const nebulae = [
                    { x: 0.7, y: 0.78, r: 260, color: [[0, 'rgba(160,80,255,0.19)'], [0.7, 'rgba(255,120,220,0.13)'], [1, 'rgba(0,0,0,0)']], alpha: 0.75, swirl: -0.5, dx: -0.00005, dy: 0.00003 },
                    { x: 0.55, y: 0.45, r: 180, color: [[0, 'rgba(180,120,255,0.17)'], [1, 'rgba(0,0,0,0)']], alpha: 0.7, swirl: 0.2, dx: 0.00004, dy: -0.00006 },
                    { x: 0.18, y: 0.88, r: 210, color: [[0, 'rgba(120,80,255,0.17)'], [1, 'rgba(0,0,0,0)']], alpha: 0.6, swirl: 0.9, dx: 0.00003, dy: -0.00004 }
                ];

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = Date.now() / 1200;
        // Animate nebulae movement
        for (const n of nebulae) {
            n.x += n.dx;
            n.y += n.dy;
            // Wrap around edges for seamless movement
            if (n.x < 0) n.x += 1;
            if (n.x > 1) n.x -= 1;
            if (n.y < 0) n.y += 1;
            if (n.y > 1) n.y -= 1;
            drawNebula(
                ctx,
                n.x * canvas.width,
                n.y * canvas.height,
                n.r + 18 * Math.sin(t + n.x * 2),
                n.color,
                n.alpha,
                n.swirl + Math.sin(t + n.y * 2) * 0.3
            );
        }
        // Removed central galaxy core for a cleaner background
        // Animate stars movement
        for (const s of stars) {
            s.x += s.dx;
            s.y += s.dy;
            if (s.x < 0) s.x += 1;
            if (s.x > 1) s.x -= 1;
            if (s.y < 0) s.y += 1;
            if (s.y > 1) s.y -= 1;
            drawStar(ctx, s.x * canvas.width, s.y * canvas.height, s.r, s.alpha * (0.7 + 0.3 * Math.sin(t + s.x * 8)));
        }
        requestAnimationFrame(animate);
    }
    animate();
}
