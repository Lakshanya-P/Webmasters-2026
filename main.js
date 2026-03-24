// --- Login/Logout Button Logic (Universal) ---
// (Moved to <script type="module"> in HTML for compatibility)
// --- Heart Button Hold-to-Fill Logic (Universal) ---
document.addEventListener('DOMContentLoaded', function() {
  const heart = document.querySelector('#topnav .heart');
  console.debug('[Heart] DOMContentLoaded, heart:', heart);
  if (!heart) {
    console.warn('[Heart] Heart element not found!');
    return;
  }
  const tank = heart.querySelector('.tank');
  const curve = heart.querySelector('.curve');
  const complimentEl = document.getElementById('compliment');
  const compliments = [
    "You're amazing!","You light up the room!","You're a star!","You do great work!","You make a difference!"
  ];
  const DURATION = 1500;
  let progress = 0;
  let isHeld = false;
  let raf = null;
  let startTime = 0;
  let filled = false;
  function setFill(p) {
    progress = Math.max(0, Math.min(1, p));
    // Animate tank height with a wavy top using a sine wave
    if (tank) {
      // Use a sine wave to modulate the fill height for a wavy effect
      const baseHeight = progress * 100;
      // Amplitude of the wave (in percent of tank height)
      const amplitude = 6; // 6% wave height
      // Frequency of the wave (how many waves across the width)
      const frequency = 2; // 2 full waves
      // Animate the background position to create a moving wave
      const now = Date.now();
      // Use a CSS gradient for a wavy top illusion
      tank.style.height = baseHeight + '%';
      tank.style.background = progress === 1 ? 'red' : 'rgba(220, 53, 69, 0.6)';
      tank.style.backgroundImage = `repeating-linear-gradient(to top, rgba(220,53,69,0.6) 0%, rgba(220,53,69,0.6) ${baseHeight - amplitude * Math.sin((now/250) + frequency)}%, transparent ${baseHeight - amplitude * Math.sin((now/250) + frequency)}%, transparent 100%)`;
      tank.style.backgroundSize = '100% 100%';
      tank.style.backgroundRepeat = 'no-repeat';
    }
    // Animate the curve SVG to move up and down like a wave
    if (curve) {
      const crhStr = getComputedStyle(heart).getPropertyValue('--cruve-height') || '8px';
      const crh = parseFloat(crhStr);
      // Add a sine wave offset to the curve's bottom position
      const now = Date.now();
      const waveOffset = Math.sin(now / 200) * (crh * 0.4); // 40% of curve height
      curve.style.bottom = (-crh + progress * crh + waveOffset) + 'px';
    }
    console.debug('[Heart] setFill', p, 'progress:', progress);
  }
  function showCompliment() {
    console.debug('[Heart] showCompliment called');
    if (complimentEl) {
      const text = compliments[Math.floor(Math.random() * compliments.length)];
      complimentEl.textContent = text;
      complimentEl.classList.add('show');
      setTimeout(() => complimentEl.classList.remove('show'), 3000);
    }
    setTimeout(() => { console.debug('[Heart] Redirecting to selfcare.html'); window.location.href = 'selfcare.html'; }, 1500);
    setTimeout(() => { heart.classList.remove('full'); setFill(0); filled = false; }, 3500);
  }
  function step(ts) {
    if (!isHeld) { raf = null; return; }
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const p = elapsed / DURATION;
    if (p >= 1) {
      setFill(1);
      filled = true;
      isHeld = false;
      heart.classList.add('full');
      console.debug('[Heart] Animation complete, calling showCompliment');
      showCompliment();
      raf = null;
      return;
    } else {
      setFill(p);
      raf = requestAnimationFrame(step);
    }
  }
  function startHold() {
    console.debug('[Heart] startHold called, filled:', filled);
    if (filled) return;
    isHeld = true;
    startTime = 0;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }
  function endHold() {
    console.debug('[Heart] endHold called');
    isHeld = false;
    if (raf) cancelAnimationFrame(raf);
    if (!filled) {
      const startP = progress;
      const t0 = performance.now();
      const decayDur = 220;
      function decay(ts) {
        const t = Math.min(1, (ts - t0) / decayDur);
        const np = startP * (1 - t);
        setFill(np);
        if (t < 1) requestAnimationFrame(decay);
      }
      requestAnimationFrame(decay);
    }
  }
  heart.addEventListener('pointerdown', function(e) {
    console.debug('[Heart] pointerdown event', e);
    e.preventDefault();
    try { if (e.pointerId != null && heart.setPointerCapture) heart.setPointerCapture(e.pointerId); } catch (err) {console.warn('[Heart] setPointerCapture error', err);}
    startHold();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => heart.addEventListener(evt, function(e) {
    console.debug('[Heart]', evt, 'event', e);
    try { if (e.pointerId != null && heart.releasePointerCapture) heart.releasePointerCapture(e.pointerId); } catch (err) {console.warn('[Heart] releasePointerCapture error', err);}
    endHold(e);
  }));
  heart.addEventListener('keydown', function(e) { if (e.key === ' ' || e.key === 'Enter') { console.debug('[Heart] keydown', e.key); e.preventDefault(); startHold(); } });
  heart.addEventListener('keyup', function(e) { if (e.key === ' ' || e.key === 'Enter') { console.debug('[Heart] keyup', e.key); endHold(e); } });
});
// --- Big Dipper Constellation Section (A Look Through Our Site) ---
window.addEventListener('DOMContentLoaded', function() {
  const dipperCanvas = document.getElementById('bigdipper-canvas');
  const dipperStars = document.querySelectorAll('.bigdipper-star');
  if (!dipperCanvas || dipperStars.length === 0) return;
  const ctx = dipperCanvas.getContext('2d');
  // Big Dipper star positions (pot and handle) using provided coordinates
  // Order: Resource Hub, Highlights, References, FAQs, Self Care, (extra), (extra)
  // You may want to relabel these for Big Dipper: Merak, Dubhe, Phecda, Megrez, Alioth, Mizar, Alkaid
  const D_WIDTH = 600;
  const D_HEIGHT = 340;
  const originalDipperPositions = [
    {x: 76,  y: 37},   // Merak (pot bottom left)
    {x: 230, y: 78},   // Dubhe (pot top left)
    {x: 227, y: 154},  // Phecda (pot bottom right)
    {x: 30,  y: 120},  // Megrez (pot top right)
    {x: 313, y: 210},  // Alioth (handle, right of pot)
    {x: 374, y: 260},  // Mizar (handle, further out)
    {x: 508, y: 270}   // Alkaid (handle end)
  ];
  // Flip horizontally and vertically
  const starPositions = originalDipperPositions.map(pos => ({
    x: (D_WIDTH - 1) - pos.x - 50,
    y: (D_HEIGHT - 1) - pos.y
  }));
  // Drawing order for Big Dipper: pot (0-3), handle (3-6)
  // Pot: 0-1-2-3, Handle: 3-4-5-6
  // Position the stars
  dipperStars.forEach((star, i) => {
    const pos = starPositions[i];
    if (!pos) return;
    // Move main stars (0-4) down by 20px, but for 0,1,2,3 also up 10px and left 10px
    const isMain = star.classList.contains('main-star');
    let xOffset = 0, yOffset = 0;
    if (isMain && i <= 4) {
      yOffset = 20;
      if (i === 0 || i === 1 || i === 2 || i === 3) {
        xOffset = -10;
        yOffset = 20 - 10; // net +10px down
      }
      // Additional fine adjustment for References (2) and Highlights (1)
      if (i === 1 || i === 2) {
        xOffset -= 15; // previous -5, now -5-10 = -15
        yOffset -= 5;
      }
      // Move Resource Hub (0) up by 2px and left by 5px
      if (i === 0) {
        xOffset = -37;
        yOffset -= 9;
      }
      // Move FAQs (3) up by 3px
      if (i === 3) {
        yOffset -= 3;
      }
    }
    star.style.left = (pos.x - (isMain ? 12 : 6) + xOffset) + 'px';
    star.style.top = (pos.y - (isMain ? 12 : 6) + yOffset) + 'px';
  });
  // Draw constellation lines (connect main stars and extras for shape)
  function drawDipper(highlightIdx = null) {
    ctx.clearRect(0, 0, dipperCanvas.width, dipperCanvas.height);
    ctx.save();
    ctx.strokeStyle = '#b7cdf2';
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    // Always use original starPositions for lines (not visually offset)
    let centers = [];
    for (let i = 0; i < 5; i++) {
      centers[i] = { x: starPositions[i].x, y: starPositions[i].y };
    }
    // Draw pot (0-1-2-3-0)
    ctx.moveTo(centers[4].x, centers[4].y);
    ctx.lineTo(centers[2].x, centers[2].y);
    ctx.lineTo(centers[3].x, centers[3].y);
    ctx.lineTo(centers[0].x, centers[0].y);
    ctx.lineTo(centers[1].x, centers[1].y);
    ctx.lineTo(centers[2].x, centers[2].y);
    ctx.lineTo(centers[4].x, centers[4].y);
    ctx.lineTo(starPositions[5].x, starPositions[5].y);
    ctx.lineTo(starPositions[6].x, starPositions[6].y);
    ctx.stroke();
    ctx.restore();
  }
  drawDipper();
  // Interactivity: show one-liner on hover, highlight lines
  const mainStars = document.querySelectorAll('.bigdipper-star.main-star');
  mainStars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => {
      drawDipper(i);
    });
    star.addEventListener('mouseleave', () => {
      drawDipper();
    });
    star.addEventListener('click', () => {
      const link = star.getAttribute('href');
      if (link) window.location.href = link;
    });
  });
});
// --- Galaxy Map Section (A Look Through Our Site) ---
window.addEventListener('DOMContentLoaded', function() {
  const mapCanvas = document.getElementById('galaxy-map-canvas');
  const mapStars = document.querySelectorAll('.galaxy-star');
  if (!mapCanvas || mapStars.length === 0) return;
  const ctx = mapCanvas.getContext('2d');
  // Star positions (flipped horizontally and vertically across a 600x340 canvas)
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 340;
  const originalStarPositions = [
    {x: 76,  y: 37},   // Resource Hub
    {x: 300, y: 60},   // Highlights
    {x: 227, y: 154},  // References
    {x: 30,  y: 120},  // FAQs
    {x: 313, y: 210},  // Self Care (center-ish)
    {x: 374, y: 260},
    {x: 508, y: 270}
  ];
  // Use (width - 1 - x) and (height - 1 - y) for true mirroring
  const starPositions = originalStarPositions.map(pos => ({
    x: (CANVAS_WIDTH - 1) - pos.x,
    y: (CANVAS_HEIGHT - 1) - pos.y
  }));
  // Position the stars
  mapStars.forEach((star, i) => {
    const pos = starPositions[i];
    star.style.left = (pos.x - 11) + 'px';
    star.style.top = (pos.y - 11) + 'px';
  });
  // Draw constellation lines
  function drawConstellation(highlightIdx = null) {
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    ctx.save();
    ctx.strokeStyle = '#b7cdf2';
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    // Connect stars in a creative order
    const order = [0, 4, 1, 3, 4, 2, 0];
    for (let i = 0; i < order.length - 1; i++) {
      const a = starPositions[order[i]];
      const b = starPositions[order[i+1]];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    // Highlight line if hovering
    if (highlightIdx !== null) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      // Draw lines from this star to its neighbors
      const neighbors = [
        [4,2], // 0
        [4,3], // 1
        [0,4], // 2
        [1,4], // 3
        [0,1,2,3] // 4
      ];
      neighbors[highlightIdx].forEach(nIdx => {
        ctx.moveTo(starPositions[highlightIdx].x, starPositions[highlightIdx].y);
        ctx.lineTo(starPositions[nIdx].x, starPositions[nIdx].y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }
  drawConstellation();
  // Interactivity: highlight lines and star on hover
  mapStars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => {
      drawConstellation(i);
    });
    star.addEventListener('mouseleave', () => {
      drawConstellation();
    });
  });
});
// --- Galaxy Orbit Section Animation & Interactivity ---
window.addEventListener('DOMContentLoaded', function() {
  const orbitSystem = document.querySelector('.galaxy-orbit-system');
  if (!orbitSystem) return;
  const planets = Array.from(orbitSystem.querySelectorAll('.galaxy-orbit-planet'));
  const sun = orbitSystem.querySelector('.galaxy-orbit-sun');
  // Orbit radii and speeds for each planet
  const orbits = [110, 150, 190, 230, 270];
  const speeds = [0.18, 0.14, 0.11, 0.09, 0.07];
  function animateOrbits() {
    const now = Date.now() / 1000;
    planets.forEach((planet, i) => {
      const angle = now * speeds[i] + i * (Math.PI * 2 / planets.length);
      const x = 220 + Math.cos(angle) * orbits[i] - 40;
      const y = 220 + Math.sin(angle) * orbits[i] - 40;
      planet.style.left = x + 'px';
      planet.style.top = y + 'px';
    });
    requestAnimationFrame(animateOrbits);
  }
  animateOrbits();
  // Hover and click interactivity
  planets.forEach(planet => {
    planet.addEventListener('mouseenter', () => {
      planet.style.zIndex = 10;
    });
    planet.addEventListener('mouseleave', () => {
      planet.style.zIndex = 3;
    });
    planet.addEventListener('click', () => {
      const link = planet.getAttribute('data-link');
      if (link) window.location.href = link;
    });
  });
});
// --- Review Modal Popup Logic ---
document.addEventListener('DOMContentLoaded', function() {
  const planets = document.querySelectorAll('.planet');
  const modal = document.getElementById('review-modal');
  const modalContent = document.querySelector('.review-modal-content');
  const closeBtn = document.getElementById('close-review-modal');
  const modalReviewContent = document.getElementById('modal-review-content');

  // Example review data (replace with your real data)
  const reviews = [
    { title: 'Mercury Review', text: 'Mercury is small but mighty!' },
    { title: 'Venus Review', text: 'Venus shines bright in our solar system.' },
    { title: 'Earth Review', text: 'Our home planet, full of life and wonder.' },
    { title: 'Mars Review', text: 'The red planet inspires exploration.' },
    { title: 'Jupiter Review', text: 'Jupiter is the giant with a big heart.' },
    { title: 'Saturn Review', text: 'Saturn dazzles with its rings.' }
  ];

  function openModal(idx) {
    if (!modal) return;
    const review = reviews[idx] || { title: 'Review', text: 'No review available.' };
    modalReviewContent.innerHTML = `<h3>${review.title}</h3><p>${review.text}</p>`;
    modal.classList.add('show');
    modal.classList.remove('hide');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.classList.add('hide');
    document.body.style.overflow = '';
  }

  planets.forEach((planet, i) => {
    planet.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal(i);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeModal();
    });
  }

  // Close modal when clicking outside the content
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
});

// --- Navbar Navigation Functions (Universal) ---
function home() {
  window.location.href = 'index.html';
}
function resource() {
  window.location.href = 'directory.html';
}
function highlights() {
  window.location.href = 'highlights.html';
}
function references() {
  window.location.href = 'refs.html';
}

// --- More Dropdown Functionality (Universal) ---
document.addEventListener('DOMContentLoaded', function() {
  const moreBtn = document.getElementById('moreBtn');
  const moreMenu = document.getElementById('moreMenu');
  if (moreBtn && moreMenu) {
    moreBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = moreMenu.getAttribute('aria-hidden') !== 'false';
      moreMenu.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      moreMenu.classList.toggle('show', expanded);
    });
    document.addEventListener('click', function(e) {
      if (!moreMenu.contains(e.target) && !moreBtn.contains(e.target)) {
        moreMenu.setAttribute('aria-hidden', 'true');
        moreBtn.setAttribute('aria-expanded', 'false');
        moreMenu.classList.remove('show');
      }
    });
  }
});

// --- Meteor Animation for Newsletter Subscribe ---
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    showMeteorAnimation();
    // Optionally, handle form submission here (AJAX, etc.)
  });
});

function showMeteorAnimation() {
  // Remove any existing meteor
  const oldMeteor = document.getElementById('meteor-animation');
  if (oldMeteor) oldMeteor.remove();


  // Find #subscribe section position (for aiming)
  const subscribe = document.getElementById('subscribe');
  if (!subscribe) return;
  const rect = subscribe.getBoundingClientRect();

  // Start at absolute bottom left corner of #subscribe
  const startX = -600;
  const startY = rect.bottom - 100;
  // End at top right corner of #subscribe
  const endX = rect.right + 100;
  const endY = rect.top-305;

  // Create meteor container (behind newsletter)
  const meteor = document.createElement('div');
  meteor.id = 'meteor-animation';
  meteor.style.position = 'fixed';
  meteor.style.pointerEvents = 'none';
  meteor.style.zIndex = 9;
  meteor.style.left = startX + 'px';
  meteor.style.top = startY + 'px';
  meteor.style.width = '520px';
  meteor.style.height = '160px';
  document.body.appendChild(meteor);

  // Enhanced meteor HTML: single, large, detailed head, more effects
  meteor.innerHTML = `
    <div class="meteor-img-wrapper">
      <img src="assets/meteor.png" alt="Meteor" class="meteor-img" />
    </div>
  `;

  // Animate the meteor image and sparks across the screen
  const dx = endX - startX;
  const dy = endY - startY;
  const duration = 2700;
  meteor.style.transform = `translate(0px, 0px)`;
  meteor.style.opacity = 1;
  meteor.animate([
    { transform: `translate(0px, 0px)`, opacity: 1 },
    { offset: 0.99, opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
  ], {
    duration: duration,
    easing: 'cubic-bezier(0.7,0.1,0.9,0.8)',
    fill: 'forwards'
  });

  setTimeout(() => {
    meteor.remove();
  }, duration + 100);
}
