/* ══════════════════════════════════════════
   SOUND SYSTEM — 5 sounds max
══════════════════════════════════════════ */
const sounds = {
  sonar:  new Audio('assets/sonar.mp3'),
  whoosh: new Audio('assets/whoosh.mp3'),
  glass:  new Audio('assets/glass.mp3'),
  ripple: new Audio('assets/ripple.mp3'),
  swell:  new Audio('assets/swell.wav'),
};

sounds.sonar.volume  = 0.3;
sounds.whoosh.volume = 0.25;
sounds.glass.volume  = 0.2;
sounds.ripple.volume = 0.15;
sounds.swell.volume  = 0.2;

function playSound(name) {
  const s = sounds[name];
  if (!s) return;
  s.currentTime = 0;
  s.play().catch(() => {});
}

let soundsMuted = false;
function toggleMute() {
  soundsMuted = !soundsMuted;
  Object.values(sounds).forEach(s => s.muted = soundsMuted);
  const btn = document.getElementById('sound-toggle');
  if (btn) btn.textContent = soundsMuted ? '🔇' : '🔊';
}

/* ══════════════════════════════════════════
   OCEAN DEPTHS — UPGRADED MAIN.JS
══════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   1. LOADER
══════════════════════════════════════════ */
function runLoader() {
  const loader  = document.getElementById('loader');
  const counter = document.getElementById('loader-count');
  if (!loader || !counter) { runSurfaceEntrance(); return; }
  let count = 0;

  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 180) + 60;

    // ✅ BUG FIX: sonar ping was outside the setInterval — moved inside
    if (count % 2000 < 300) playSound('sonar');

    if (count >= 11000) {
      count = 11000;
      clearInterval(interval);
      gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
        onComplete: () => {
          loader.style.display = 'none';
          runSurfaceEntrance();
        }
      });
    }
    counter.textContent = count.toLocaleString();
  // ✅ BUG FIX: missing closing }); for setInterval — was broken in your version
  }, 80);
}

runLoader();

/* ══════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════ */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

if (dot && ring) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none' });
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    gsap.set(ring, { x: ringX, y: ringY });
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'button, .creature-card, .flip-card, .stat-card, .angler-fish, a';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(dot,  { scale: 2.5, duration: 0.3 });
      gsap.to(ring, { scale: 1.6, opacity: 0.8, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(dot,  { scale: 1, duration: 0.3 });
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
    });
  });
}

/* ══════════════════════════════════════════
   3. ZONE INDICATOR
══════════════════════════════════════════ */
const zoneName    = document.getElementById('zone-name');
const depthNumberEl = document.getElementById('depth-number');

document.querySelectorAll('section[data-zone]').forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => {
      if (!zoneName) return;
      gsap.to(zoneName, {
        opacity: 0, y: -10, duration: 0.2,
        onComplete: () => {
          zoneName.textContent = section.dataset.zone;
          gsap.to(zoneName, { opacity: 1, y: 0, duration: 0.3 });
        }
      });
    },
    onEnterBack: () => {
      if (!zoneName) return;
      gsap.to(zoneName, {
        opacity: 0, y: 10, duration: 0.2,
        onComplete: () => {
          zoneName.textContent = section.dataset.zone;
          gsap.to(zoneName, { opacity: 1, y: 0, duration: 0.3 });
        }
      });
    }
  });
});

/* ══════════════════════════════════════════
   4. DEPTH METER
══════════════════════════════════════════ */
ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const depth = Math.round(self.progress * 11000);
    if (depthNumberEl) depthNumberEl.textContent = depth.toLocaleString();
  }
});

/* ══════════════════════════════════════════
   5. SPLIT TEXT — character reveal
══════════════════════════════════════════ */
function splitTitle(el) {
  if (!el) return;
  const text  = el.innerHTML;
  const parts = text.split(/(<br\s*\/?>)/gi);
  el.innerHTML = '';
  parts.forEach(part => {
    if (/^<br/i.test(part)) {
      el.appendChild(document.createElement('br'));
    } else {
      part.split('').forEach(char => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
      });
    }
  });
}

document.querySelectorAll('[data-split]').forEach(el => {
  splitTitle(el);
  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(el.querySelectorAll('.char'), {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.03, ease: 'power3.out'
      });
    },
    onLeaveBack: () => {
      gsap.to(el.querySelectorAll('.char'), {
        opacity: 0, y: 60, duration: 0.3, stagger: 0.01
      });
    }
  });
});

/* ══════════════════════════════════════════
   6. DATA-REVEAL elements
   ✅ SOUND ADDED: whoosh on each reveal
══════════════════════════════════════════ */
gsap.utils.toArray('[data-reveal]').forEach(el => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: 'power3.out',
    onStart: () => playSound('whoosh'),
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
});

/* ══════════════════════════════════════════
   7. 3D TILT on cards
══════════════════════════════════════════ */
function addTilt(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 18, rotateX: -y * 18,
        scale: 1.04, duration: 0.4,
        ease: 'power2.out', transformPerspective: 800
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0, scale: 1,
        duration: 0.5, ease: 'power3.out'
      });
    });
  });
}

addTilt('[data-tilt]');

/* ══════════════════════════════════════════
   8. WEB AUDIO API
══════════════════════════════════════════ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx   = null;
let masterGain = null;
let ambientStarted = false;
let rumble, rumbleGain, shimmerGain;

function initAudio() {
  if (ambientStarted) return;
  ambientStarted = true;
  audioCtx   = new AudioCtx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(audioCtx.destination);
  startOceanAmbience();
}

window.addEventListener('scroll', initAudio, { once: true });
window.addEventListener('click',  initAudio, { once: true });

function startOceanAmbience() {
  rumble     = audioCtx.createOscillator();
  rumbleGain = audioCtx.createGain();
  rumble.type = 'sine';
  rumble.frequency.value = 60;
  rumbleGain.gain.value  = 0.07;
  rumble.connect(rumbleGain);
  rumbleGain.connect(masterGain);
  rumble.start();

  const hum     = audioCtx.createOscillator();
  const humGain = audioCtx.createGain();
  hum.type = 'sine';
  hum.frequency.value = 120;
  humGain.gain.value  = 0.03;
  hum.connect(humGain);
  humGain.connect(masterGain);
  hum.start();

  const shimmer = audioCtx.createOscillator();
  shimmerGain   = audioCtx.createGain();
  shimmer.type  = 'sine';
  shimmer.frequency.value = 440;
  shimmerGain.gain.value  = 0.01;
  shimmer.connect(shimmerGain);
  shimmerGain.connect(masterGain);
  shimmer.start();

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const d = self.progress;
      rumble.frequency.setTargetAtTime(60 - d * 40, audioCtx.currentTime, 0.3);
      rumbleGain.gain.setTargetAtTime(0.07 + d * 0.1, audioCtx.currentTime, 0.3);
      shimmerGain.gain.setTargetAtTime(0.01 * (1 - d), audioCtx.currentTime, 0.3);
    }
  });
}

function playBubble() {
  if (!audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function playDeepDrone() {
  if (!audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 55;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 2);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 5);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 5);
}

function playPressureClick() {
  if (!audioCtx) return;
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
  const data   = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02));
  }
  const source = audioCtx.createBufferSource();
  const gain   = audioCtx.createGain();
  gain.gain.value = 0.25;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

function playWhaleCall() {
  if (!audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(80,  audioCtx.currentTime + 1.5);
  osc.frequency.linearRampToValueAtTime(120, audioCtx.currentTime + 3);
  osc.frequency.linearRampToValueAtTime(60,  audioCtx.currentTime + 4);
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 4);
}

/* ══════════════════════════════════════════
   9. SURFACE ENTRANCE
   ✅ SOUND ADDED: swell plays on hero load
══════════════════════════════════════════ */
function runSurfaceEntrance() {
  playSound('swell');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.surface-tagline', { opacity: 0, y: 30, duration: 0.8 })
    .from('.surface-title',   { opacity: 0, y: 60, duration: 1.1 }, '-=0.4')
    .from('.surface-sub',     { opacity: 0, y: 30, duration: 0.8 }, '-=0.5')
    .from('.dive-btn',        { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.ray', {
      scaleY: 0, transformOrigin: 'top center',
      duration: 2, stagger: 0.15, ease: 'power2.out'
    }, '-=1.2')
    .from('.particle', { opacity: 0, duration: 1, stagger: 0.15 }, '-=1')
    .from('.jelly-surface-1, .jelly-surface-2', {
      opacity: 0, scale: 0.5, duration: 1.2, stagger: 0.3
    }, '-=0.8');
}

gsap.to('.sun-rays', {
  yPercent: 40, ease: 'none',
  scrollTrigger: {
    trigger: '.surface', start: 'top top', end: 'bottom top', scrub: true
  }
});

gsap.to('.surface-content', {
  opacity: 0, y: -80, ease: 'none',
  scrollTrigger: {
    trigger: '.surface', start: '20% top', end: '80% top', scrub: true
  }
});

// ✅ SOUND ADDED: glass tap on dive button
document.querySelector('.dive-btn').addEventListener('click', () => {
  playSound('glass');
  document.querySelector('.twilight').scrollIntoView({ behavior: 'smooth' });
});

/* ══════════════════════════════════════════
   10. TWILIGHT ZONE
══════════════════════════════════════════ */
gsap.from('.twilight-header', {
  opacity: 0, y: 80, duration: 1.2, ease: 'power3.out',
  scrollTrigger: {
    trigger: '.twilight', start: 'top 75%', toggleActions: 'play none none reverse'
  }
});

gsap.from('.creature-card', {
  opacity: 0, y: 80, duration: 0.8, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: {
    trigger: '.creature-grid', start: 'top 82%', toggleActions: 'play none none reverse'
  }
});

gsap.to('.twilight', {
  backgroundColor: '#020810', ease: 'none',
  scrollTrigger: {
    trigger: '.twilight', start: 'top top', end: 'bottom top', scrub: true
  }
});

// ✅ SOUND ADDED: ripple + bubble on card hover
document.querySelectorAll('.creature-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    playBubble();
    playSound('ripple');
    gsap.to(card, { boxShadow: '0 0 30px rgba(6,182,212,0.2)', duration: 0.3 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { boxShadow: '0 0 0px rgba(6,182,212,0)', duration: 0.3 });
  });
});

/* ══════════════════════════════════════════
   11. THREE.JS — MIDNIGHT PARTICLES
══════════════════════════════════════════ */
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000
);
camera.position.z = 5;

const particleCount = window.innerWidth < 768 ? 800 : 2000;
const positions = new Float32Array(particleCount * 3);
const colors    = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  const c = Math.random();
  if      (c < 0.5) { colors[i*3]=0.3; colors[i*3+1]=0.9; colors[i*3+2]=1.0; }
  else if (c < 0.8) { colors[i*3]=0.2; colors[i*3+1]=0.4; colors[i*3+2]=1.0; }
  else              { colors[i*3]=0.8; colors[i*3+1]=1.0; colors[i*3+2]=1.0; }
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size: 0.05, vertexColors: true, transparent: true, opacity: 0.8
});
const particles = new THREE.Points(geo, mat);
scene.add(particles);

function animateParticles() {
  requestAnimationFrame(animateParticles);
  const pos = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3 + 1] += 0.003;
    if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animateParticles();

if (window.innerWidth > 768) {
  document.querySelector('.midnight').addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 0.5;
    const y = (e.clientY / window.innerHeight - 0.5) * 0.5;
    gsap.to(camera.position, { x, y: -y, duration: 1, ease: 'power2.out' });
  });
}

window.addEventListener('resize', () => {
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

/* ══════════════════════════════════════════
   12. SPERM WHALE
══════════════════════════════════════════ */
const whaleWrapper = document.getElementById('whaleWrapper');

if (whaleWrapper) {
  ScrollTrigger.create({
    trigger: '.midnight',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to(whaleWrapper, { opacity: 1, duration: 0.5 });
      gsap.fromTo(whaleWrapper,
        { left: '-350px', top: '35%' },
        {
          left: '110%', top: '28%', duration: 12, ease: 'none',
          onComplete: () => gsap.set(whaleWrapper, { opacity: 0 })
        }
      );
    }
  });
}

/* ══════════════════════════════════════════
   13. MIDNIGHT SCROLL ANIMATIONS
══════════════════════════════════════════ */
gsap.from('.midnight-content', {
  opacity: 0, y: 80, duration: 1.2, ease: 'power3.out',
  scrollTrigger: {
    trigger: '.midnight', start: 'top 75%',
    onEnter: () => playDeepDrone(),
    toggleActions: 'play none none reverse'
  }
});

gsap.from('.angler-fish', {
  opacity: 0, scale: 0.5, duration: 1, ease: 'back.out(1.7)',
  scrollTrigger: {
    trigger: '.angler-fish', start: 'top 85%', toggleActions: 'play none none reverse'
  }
});

gsap.from('.bio-toggle', {
  opacity: 0, y: 20, duration: 0.8,
  scrollTrigger: {
    trigger: '.bio-toggle', start: 'top 90%', toggleActions: 'play none none reverse'
  }
});

document.getElementById('bioToggle').addEventListener('click', () => {
  document.querySelector('.midnight').classList.toggle('bio-off');
});

/* ══════════════════════════════════════════
   14. ABYSS
══════════════════════════════════════════ */
let pressureAnimated = false;

ScrollTrigger.create({
  trigger: '.abyss',
  start: 'top 60%',
  onEnter: () => {
    if (pressureAnimated) return;
    pressureAnimated = true;
    gsap.to({ val: 0 }, {
      val: 400, duration: 2.5, ease: 'power2.out',
      onUpdate: function () {
        document.getElementById('pressure-count').textContent =
          Math.round(this.targets()[0].val);
      }
    });
  }
});

gsap.from('.abyss-content', {
  opacity: 0, y: 80, duration: 1.2, ease: 'power3.out',
  scrollTrigger: { trigger: '.abyss', start: 'top 75%', toggleActions: 'play none none reverse' }
});

gsap.from('.cards-track', {
  x: 200, opacity: 0, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.cards-scroll-wrapper', start: 'top 80%', toggleActions: 'play none none reverse' }
});

gsap.from('.vent-container', {
  opacity: 0, y: 60, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.vent-container', start: 'top 90%', toggleActions: 'play none none reverse' }
});

// ✅ SOUND ADDED: pressure click on flip
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    playPressureClick();
    playSound('glass');
    card.classList.toggle('flipped');
    gsap.fromTo(card, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  });
});

const ventContainer = document.querySelector('.vent-container');
if (ventContainer) {
  ventContainer.addEventListener('mouseenter', () => {
    gsap.to('.smoke-particle', { scaleX: 2, duration: 0.3, stagger: 0.05 });
  });
  ventContainer.addEventListener('mouseleave', () => {
    gsap.to('.smoke-particle', { scaleX: 1, duration: 0.3, stagger: 0.05 });
  });
}

/* ══════════════════════════════════════════
   15. HADAL ZONE
══════════════════════════════════════════ */
gsap.to('.crack-1', {
  width: '120%', duration: 2, ease: 'power2.out',
  scrollTrigger: { trigger: '.hadal', start: 'top 70%', toggleActions: 'play none none reverse' }
});
gsap.to('.crack-2', {
  width: '100%', duration: 1.8, ease: 'power2.out', delay: 0.3,
  scrollTrigger: { trigger: '.hadal', start: 'top 70%', toggleActions: 'play none none reverse' }
});
gsap.to('.crack-3', {
  width: '90%', duration: 1.5, ease: 'power2.out', delay: 0.6,
  scrollTrigger: { trigger: '.hadal', start: 'top 70%', toggleActions: 'play none none reverse' }
});

gsap.from('.hadal-content .zone-label', {
  opacity: 0, y: 60, duration: 1.2, ease: 'power3.out',
  scrollTrigger: {
    trigger: '.hadal', start: 'top 75%',
    onEnter: () => playWhaleCall(),
    toggleActions: 'play none none reverse'
  }
});

let typewriterDone = false;
ScrollTrigger.create({
  trigger: '.hadal',
  start: 'top 60%',
  onEnter: () => {
    if (typewriterDone) return;
    typewriterDone = true;
    const message = "You are deeper than any human has ever dived. Deeper than sunlight. Deeper than sound. Here, in the crushing dark, life still finds a way.";
    const el = document.getElementById('typewriter');
    let i = 0;
    setTimeout(() => {
      const iv = setInterval(() => {
        el.textContent += message[i];
        i++;
        if (i >= message.length) clearInterval(iv);
      }, 35);
    }, 600);
  }
});

gsap.from('.stat-card', {
  opacity: 0, y: 80, scale: 0.9, duration: 0.8, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.stat-grid', start: 'top 80%', toggleActions: 'play none none reverse' }
});

gsap.from('.final-message', {
  opacity: 0, y: 40, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.final-message', start: 'top 85%', toggleActions: 'play none none reverse' }
});

gsap.from('.surface-btn', {
  opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '.surface-btn', start: 'top 90%', toggleActions: 'play none none reverse' }
});

document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, { boxShadow: '0 0 30px rgba(100,60,255,0.2)', duration: 0.3 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { boxShadow: '0 0 0px rgba(100,60,255,0)', duration: 0.3 });
  });
});

// ✅ SOUND ADDED: glass tap on return button
document.getElementById('returnBtn').addEventListener('click', () => {
  playSound('glass');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  gsap.fromTo('body',
    { filter: 'brightness(0)' },
    { filter: 'brightness(1)', duration: 1.5, ease: 'power2.out' }
  );
});

/* ══════════════════════════════════════════
   16. TOUCH — swipe cards on mobile
══════════════════════════════════════════ */
const wrapper = document.querySelector('.cards-scroll-wrapper');
if (wrapper) {
  let startX = 0;
  wrapper.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  wrapper.addEventListener('touchmove', e => {
    const diff = startX - e.touches[0].clientX;
    wrapper.scrollLeft += diff * 0.5;
    startX = e.touches[0].clientX;
  }, { passive: true });
}
