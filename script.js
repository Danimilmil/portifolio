document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelector('footer p').innerHTML = `&copy; ${new Date().getFullYear()} Daniel Dias. Todos os direitos reservados.`;

  // Cabeçalho compacto + barra de progresso + parallax da foto
  const header = document.querySelector('header');
  const photo = document.querySelector('[data-parallax]');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    document.documentElement.style.setProperty('--scroll', max > 0 ? y / max : 0);
    if (photo && !reduce) {
      const r = photo.getBoundingClientRect();
      photo.style.setProperty('--py', `${((r.top + r.height / 2) - innerHeight / 2) * -0.06}px`);
    }
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // Título do hero palavra por palavra
  const h1 = document.querySelector('.hero h1');
  h1.setAttribute('aria-label', h1.textContent);
  h1.innerHTML = h1.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}"><span>${w}</span></span>`).join(' ');

  // Revelação ao rolar
  const targets = document.querySelectorAll('.about-card > *, .section-title, .project-card, .contact-link, .contact .container > p');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', `${(i % 3) * 80}ms`);
    io.observe(el);
  });

  if (reduce) return;

  // Brilho que segue o cursor
  const spot = document.querySelector('.spotlight');
  if (fine) {
    addEventListener('pointermove', e => {
      spot.classList.add('on');
      spot.style.setProperty('--sx', e.clientX + 'px');
      spot.style.setProperty('--sy', e.clientY + 'px');
    }, { passive: true });
  }

  // Cards: brilho + inclinação 3D
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (!fine) return;
      card.classList.add('tilting');
      const rx = ((y / r.height) - .5) * -9, ry = ((x / r.width) - .5) * 9;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.classList.remove('tilting'); card.style.transform = ''; });
  });

  // Botões magnéticos
  if (fine) document.querySelectorAll('.btn, .contact-link').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });

  // Constelação interativa no hero
  const cv = document.querySelector('.hero-canvas'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 }, run = true;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(110, Math.floor(W * H / 14000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, c: Math.random() < .5 ? '124,58,237' : '34,211,238' }));
  };
  size(); addEventListener('resize', size);
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('pointerleave', () => mouse.x = mouse.y = -999);
  new IntersectionObserver(([e]) => run = e.isIntersecting).observe(cv);
  (function loop() {
    requestAnimationFrame(loop);
    if (!run) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { p.vx += dx / d * .02; p.vy += dy / d * .02; }
      p.vx *= .99; p.vy *= .99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = `rgba(${p.c},.85)`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) { ctx.strokeStyle = `rgba(${a.c},${(1 - d / 120) * .35})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const p of pts) {
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (d < 160) { ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 160) * .5})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
  })();
});
