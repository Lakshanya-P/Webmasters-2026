// space-bg.js
// Interactive space background with twinkling stars and moving shooting stars

const STAR_COUNT = 120;
const SHOOTING_STAR_INTERVAL = 2000;

function randomBetween(a, b) {
    return a + Math.random() * (b - a);
}

function createStar(ctx, width, height) {
    // Add dx, dy for movement direction and speed
    const angle = randomBetween(0, 2 * Math.PI);
    const moveSpeed = randomBetween(0.02, 0.08); // slow movement
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: randomBetween(0.3, 1.2),
        alpha: randomBetween(0.5, 1),
        twinkle: Math.random() * Math.PI * 2,
        speed: randomBetween(0.01, 0.03),
        dx: Math.cos(angle) * moveSpeed,
        dy: Math.sin(angle) * moveSpeed
    };
}

function drawStar(ctx, star) {
    ctx.save();
    ctx.globalAlpha = star.alpha * (0.7 + 0.3 * Math.sin(star.twinkle));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
}

function createShootingStar(width, height) {
    const y = randomBetween(0, height * 0.7);
    return {
        x: randomBetween(-width * 0.2, width * 0.8),
        y,
        len: randomBetween(80, 180),
        speed: randomBetween(8, 16),
        angle: randomBetween(Math.PI / 6, Math.PI / 3),
        alpha: 1
    };
}

function drawShootingStar(ctx, star) {
    ctx.save();
    ctx.globalAlpha = star.alpha;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
        star.x - Math.cos(star.angle) * star.len,
        star.y - Math.sin(star.angle) * star.len
    );
    ctx.stroke();
    ctx.restore();
}

let sunAnim = null;
let moonAnim = null;
let sunActive = false;
let moonActive = false;

function drawSun(ctx, x, y, r) {
    ctx.save();
    ctx.globalAlpha = 0.99;
    // Sun body with multi-color fiery gradient
    let grad = ctx.createRadialGradient(x, y, r * 0.12, x, y, r);
    grad.addColorStop(0, '#fffbe7');
    grad.addColorStop(0.13, '#ffe066');
    grad.addColorStop(0.32, '#ffd700');
    grad.addColorStop(0.55, '#ffb300');
    grad.addColorStop(0.8, '#ff9100');
    grad.addColorStop(1, 'rgba(255, 80, 0, 0.18)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 90;
    ctx.fill();

    // Sunspots
    for (let i = 0; i < 7; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = r * randomBetween(0.25, 0.7);
        const sx = x + Math.cos(angle) * dist;
        const sy = y + Math.sin(angle) * dist;
        ctx.save();
        ctx.globalAlpha = 0.18 + Math.random() * 0.13;
        ctx.beginPath();
        ctx.arc(sx, sy, randomBetween(r * 0.04, r * 0.11), 0, 2 * Math.PI);
        ctx.fillStyle = '#c97a00';
        ctx.shadowColor = '#c97a00';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
    }

    // Inner glow
    ctx.save();
    let innerGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 0.7);
    innerGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
    innerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, 2 * Math.PI);
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.restore();

    // Fiery, irregular corona with more structure
    const coronaPoints = 80;
    const baseRadius = r * 1.09;
    const coronaOuter = r * 1.6;
    const t = Date.now() / 900;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= coronaPoints; i++) {
        const angle = (i / coronaPoints) * 2 * Math.PI;
        // Animate the corona with a sine wave and random flicker
        const flicker = Math.sin(angle * 7 + t * 1.2) * 18 + Math.cos(angle * 3.5 - t * 0.7) * 10 + Math.sin(angle * 13 + t * 0.5) * 5;
        const rad = baseRadius + (i % 2 === 0 ? 32 : 16) + flicker;
        const px = x + Math.cos(angle) * rad;
        const py = y + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    // Colorful corona gradient
    let coronaGrad = ctx.createRadialGradient(x, y, r * 1.05, x, y, coronaOuter);
    coronaGrad.addColorStop(0, 'rgba(255, 255, 180, 0.22)');
    coronaGrad.addColorStop(0.4, 'rgba(255, 200, 0, 0.13)');
    coronaGrad.addColorStop(0.7, 'rgba(255, 140, 0, 0.09)');
    coronaGrad.addColorStop(1, 'rgba(255, 80, 0, 0.04)');
    ctx.fillStyle = coronaGrad;
    ctx.shadowColor = '#ffb300';
    ctx.shadowBlur = 48;
    ctx.fill();
    ctx.restore();

    // Solar flare (subtle arc)
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.35, Math.PI * 0.15, Math.PI * 0.45);
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#fffbe7';
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 22;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

function drawMoon(ctx, x, y, r) {
    ctx.save();
    ctx.globalAlpha = 0.97;
    // Main moon body with subtle gradient
    let grad = ctx.createRadialGradient(x - r * 0.18, y - r * 0.18, r * 0.2, x, y, r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, '#e0e6f6');
    grad.addColorStop(0.7, '#b0b8d1');
    grad.addColorStop(1, '#a3a9bb');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.shadowColor = '#b0b8d1';
    ctx.shadowBlur = 38;
    ctx.fill();

    // Crescent shadow (softer)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x + r * 0.42, y - r * 0.08, r * 0.82, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // (Craters removed for a cleaner moon)

    // Subtle surface shading
    ctx.save();
    let shadeGrad = ctx.createRadialGradient(x + r * 0.2, y + r * 0.18, r * 0.1, x, y, r * 0.95);
    shadeGrad.addColorStop(0, 'rgba(180,190,210,0.13)');
    shadeGrad.addColorStop(1, 'rgba(180,190,210,0)');
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = shadeGrad;
    ctx.fill();
    ctx.restore();

    ctx.restore();
}

export function triggerSun() {
    sunActive = true;
    const centerY = window.innerHeight / 2;
    sunAnim = { x: -180, y: centerY, r: 120, vx: 6 };
}
export function triggerMoon() {
    moonActive = true;
    const centerY = window.innerHeight / 2;
    moonAnim = { x: -160, y: centerY, r: 70, vx: 5 };
}

export function initSpaceBackground(canvasId = 'space-bg-canvas') {
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

    let stars = Array.from({ length: STAR_COUNT }, () => createStar(ctx, canvas.width, canvas.height));
    let shootingStars = [];
    let lastShootingStar = Date.now();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw stars
        for (const star of stars) {
            drawStar(ctx, star);
            // Move the star
            star.x += star.dx;
            star.y += star.dy;
            // Wrap around edges
            if (star.x < 0) star.x += canvas.width;
            if (star.x > canvas.width) star.x -= canvas.width;
            if (star.y < 0) star.y += canvas.height;
            if (star.y > canvas.height) star.y -= canvas.height;
            // Twinkle
            star.twinkle += star.speed;
            if (star.twinkle > Math.PI * 2) star.twinkle -= Math.PI * 2;
        }
        // Shooting stars
        if (Date.now() - lastShootingStar > SHOOTING_STAR_INTERVAL) {
            shootingStars.push(createShootingStar(canvas.width, canvas.height));
            lastShootingStar = Date.now();
        }
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            drawShootingStar(ctx, s);
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.alpha -= 0.012;
            if (s.alpha <= 0) shootingStars.splice(i, 1);
        }
        // Sun animation
        if (sunActive && sunAnim) {
            drawSun(ctx, sunAnim.x, sunAnim.y, sunAnim.r);
            sunAnim.x += sunAnim.vx;
            if (sunAnim.x - sunAnim.r > canvas.width) {
                sunActive = false;
                sunAnim = null;
            }
        }
        // Moon animation
        if (moonActive && moonAnim) {
            drawMoon(ctx, moonAnim.x, moonAnim.y, moonAnim.r);
            moonAnim.x += moonAnim.vx;
            if (moonAnim.x - moonAnim.r > canvas.width) {
                moonActive = false;
                moonAnim = null;
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
