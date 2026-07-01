// ===== LIVING CELLS — NIGHT SKY =====
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d', { alpha: true });

let width = 0;
let height = 0;
let particles = [];
let mouse = { x: null, y: null, active: false };

const CONFIG = {
  particleCount: 118,
  maxDistance: 142,
  driftSpeed: 0.017,
  pulseSpeed: 0.009,
  connectionOpacity: 0.11,
  mouseRadius: 145,
  mouseForce: 0.72,
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.min(CONFIG.particleCount, Math.floor((width * height) / 13500) + 42);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.driftSpeed,
      vy: (Math.random() - 0.5) * CONFIG.driftSpeed,
      size: Math.random() * 1.8 + 0.9,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.006 + Math.random() * 0.008,
      brightness: 0.6 + Math.random() * 0.7,
      // occasional "star" cells
      isStar: Math.random() < 0.13,
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    // gentle drift + tiny wander
    p.x += p.vx;
    p.y += p.vy;

    // very subtle random walk to feel alive
    p.vx += (Math.random() - 0.5) * 0.0008;
    p.vy += (Math.random() - 0.5) * 0.0008;

    // soft speed clamp
    const speed = Math.hypot(p.vx, p.vy);
    const maxSpeed = CONFIG.driftSpeed * (p.isStar ? 0.6 : 1.1);
    if (speed > maxSpeed) {
      p.vx = (p.vx / speed) * maxSpeed;
      p.vy = (p.vy / speed) * maxSpeed;
    }

    // wrap around edges (feels infinite like space)
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    // mouse interaction — cells gently react
    if (mouse.active && mouse.x != null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONFIG.mouseRadius && dist > 0.1) {
        const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
        p.vx += (dx / dist) * force * 0.018;
        p.vy += (dy / dist) * force * 0.018;
      }
    }
  }
}

function drawParticles(time) {
  ctx.clearRect(0, 0, width, height);

  // Subtle deep night gradient / nebula feel
  const grad = ctx.createRadialGradient(
    width * 0.3, height * 0.28, Math.min(width, height) * 0.12,
    width * 0.72, height * 0.68, Math.max(width, height) * 0.85
  );
  grad.addColorStop(0, 'rgba(12, 10, 28, 0.18)');
  grad.addColorStop(0.5, 'rgba(6, 6, 14, 0.06)');
  grad.addColorStop(1, 'rgba(3, 3, 10, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Very faint static starfield layer (depth)
  ctx.fillStyle = 'rgba(230, 232, 240, 0.38)';
  for (let i = 0; i < 52; i++) {
    const sx = ((i * 137) % width) + (Math.sin(time * 0.00025 + i * 1.7) * 0.8);
    const sy = ((i * 83) % (height * 0.98)) + (Math.cos(time * 0.0001 + i) * 0.5);
    const s = (i % 5 === 0) ? 1.05 : (i % 3 === 0 ? 0.75 : 0.5);
    ctx.fillRect(sx, sy, s, s);
  }

  // Draw connections first (behind cells)
  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 0.7;

  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.maxDistance && dist > 0.5) {
        const alpha = (1 - dist / CONFIG.maxDistance) * CONFIG.connectionOpacity * (p1.isStar || p2.isStar ? 0.65 : 1);
        ctx.globalAlpha = Math.max(0.015, alpha);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  // Draw the living cells
  ctx.globalAlpha = 1;

  for (let p of particles) {
    const pulse = Math.sin(time * p.pulseSpeed + p.phase) * 0.5 + 0.5;
    const life = 0.5 + pulse * 0.5; // 0.5 - 1.0

    let size = p.size;
    if (p.isStar) {
      size = p.size * (0.9 + pulse * 0.55);
    } else {
      size = p.size * (0.85 + life * 0.35);
    }

    const baseAlpha = p.brightness * life;
    const alpha = p.isStar ? baseAlpha * 0.92 : baseAlpha * 0.75;

    // glow layer
    ctx.shadowBlur = p.isStar ? 13 : 7.5;
    ctx.shadowColor = p.isStar ? '#c0c8ff' : '#a5b4fc';

    ctx.fillStyle = p.isStar 
      ? `rgba(224, 231, 255, ${alpha * 0.95})`
      : `rgba(165, 180, 252, ${alpha})`;

    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();

    // bright core
    ctx.shadowBlur = 0;
    ctx.fillStyle = p.isStar 
      ? `rgba(255,255,255, ${alpha * 0.9})` 
      : `rgba(230,232,240, ${alpha * 0.65})`;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

let rafId = null;
function animate(time = 0) {
  updateParticles();
  drawParticles(time);
  rafId = requestAnimationFrame(animate);
}

// Mouse interaction
function setupMouse() {
  const handleMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  };

  const handleLeave = () => {
    mouse.active = false;
  };

  window.addEventListener('mousemove', handleMove, { passive: true });
  window.addEventListener('mouseleave', handleLeave);
  window.addEventListener('blur', handleLeave);

  // Touch support (single touch)
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', handleLeave);
}

// ===== GITHUB INTEGRATION =====
async function loadProjects() {
  const container = document.getElementById('projects');
  container.innerHTML = '';

  try {
    const res = await fetch('https://api.github.com/users/ruidosujeira/repos?sort=updated&per_page=30', {
      headers: { 'Accept': 'application/vnd.github+json' }
    });

    if (!res.ok) throw new Error('GitHub API error');

    const repos = await res.json();

    // Prefer non-forks, then by stars + recency
    const filtered = repos
      .filter(r => !r.fork && r.name !== 'ruidosujeira.github.io')
      .sort((a, b) => {
        const starsDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
        if (starsDiff !== 0) return starsDiff;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      })
      .slice(0, 6);

    if (filtered.length === 0) {
      throw new Error('no repos');
    }

    for (const repo of filtered) {
      const card = document.createElement('a');
      card.className = 'project-card';
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener';

      const lang = repo.language || '';
      const desc = repo.description || 'No description yet.';

      card.innerHTML = `
        <div class="project-name">
          ${escapeHtml(repo.name)}
        </div>
        <div class="project-desc">${escapeHtml(desc)}</div>
        <div class="project-meta">
          <span class="project-lang">
            ${lang ? `<span class="lang-dot" style="background:${langColor(lang)}"></span> ${escapeHtml(lang)}` : ''}
          </span>
          <span class="project-stats">
            ${repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : ''}
          </span>
        </div>
      `;

      container.appendChild(card);
    }
  } catch (err) {
    // Fallback: nice static featured projects if API fails or rate limit
    const fallback = [
      { name: 'discordkit', html_url: 'https://github.com/ruidosujeira/discordkit', description: 'A modern, type-safe Python Discord framework focused on excellent developer experience.', language: 'Python', stargazers_count: 4 },
      { name: 'depx', html_url: 'https://github.com/ruidosujeira/depx', description: 'Dependency analysis and management tool written in Rust.', language: 'Rust', stargazers_count: 16 },
      { name: 'gopanel', html_url: 'https://github.com/ruidosujeira/gopanel', description: 'Read Go docs in a clean side panel, without leaving VS Code.', language: 'Go', stargazers_count: 0 },
      { name: 'discordkitbot', html_url: 'https://github.com/ruidosujeira/discordkitbot', description: 'Bot built using discordkit.', language: 'Python', stargazers_count: 0 },
    ];

    fallback.forEach(repo => {
      const card = document.createElement('a');
      card.className = 'project-card';
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener';

      card.innerHTML = `
        <div class="project-name">${repo.name}</div>
        <div class="project-desc">${repo.description}</div>
        <div class="project-meta">
          <span class="project-lang">
            ${repo.language ? `<span class="lang-dot" style="background:${langColor(repo.language)}"></span> ${repo.language}` : ''}
          </span>
          <span class="project-stats">${repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : ''}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

function langColor(lang) {
  const colors = {
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    'C++': '#f34b7d',
  };
  return colors[lang] || '#64748b';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// ===== INIT =====
function init() {
  resize();
  createParticles();
  setupMouse();

  window.addEventListener('resize', () => {
    const oldW = width;
    const oldH = height;
    resize();
    // keep particles somewhat in place on resize
    const scaleX = width / oldW;
    const scaleY = height / oldH;
    for (let p of particles) {
      p.x *= scaleX;
      p.y *= scaleY;
    }
  }, { passive: true });

  // gentle start animation
  setTimeout(() => {
    animate(performance.now());
  }, 120);

  // Load dynamic GitHub projects
  loadProjects();

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Easter egg: click logo to burst the cells a little
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      for (let p of particles) {
        const angle = Math.random() * Math.PI * 2;
        const force = 0.9 + Math.random() * 1.1;
        p.vx += Math.cos(angle) * force * 0.08;
        p.vy += Math.sin(angle) * force * 0.08;
      }
    });
  }

  // Keyboard hint — press "g" goes to GitHub
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && document.activeElement.tagName === 'BODY') {
      window.open('https://github.com/ruidosujeira', '_blank');
    }
  });
}

init();