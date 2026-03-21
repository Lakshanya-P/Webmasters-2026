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
// Add more as needed for other nav buttons
