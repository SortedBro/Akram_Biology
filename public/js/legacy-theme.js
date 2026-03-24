(function initHeroParticles() {
  const wrap = document.getElementById('heroParticles');
  if (!wrap) return;

  const colors = ['#00f5a8', '#818cf8', '#22d3ee', '#fbbf24'];
  for (let i = 0; i < 28; i += 1) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = '-10px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = `${Math.random() * 12 + 8}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    wrap.appendChild(p);
  }
})();

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
