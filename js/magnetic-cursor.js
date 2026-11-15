class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  lerp(target, amount) {
    this.x += (target.x - this.x) * amount;
    this.y += (target.y - this.y) * amount;
    return this;
  }
  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  clone() {
    return new Vec2(this.x, this.y);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check touch devices to disable custom cursor
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  // Create cursor element
  const cursorEl = document.createElement('div');
  cursorEl.className = 'custom-magnetic-cursor';
  
  // Inject the little top-down cruise ship SVG
  cursorEl.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(20, 20) rotate(90) translate(-20, -20)">
        <!-- Hull -->
        <path d="M12 36 L28 36 C29 36 30 35 30 34 L32 16 C32 8 24 2 20 2 C16 2 8 8 8 16 L10 34 C10 35 11 36 12 36 Z" fill="white"/>
        <!-- Lower Deck -->
        <path d="M14 32 L26 32 L26 14 C26 10 22 8 20 8 C18 8 14 10 14 14 Z" fill="#0E1B2A"/>
        <!-- Upper Deck -->
        <path d="M16 28 L24 28 L24 16 C24 14 21 12 20 12 C19 12 16 14 16 16 Z" fill="white"/>
        <!-- Funnel -->
        <circle cx="20" cy="24" r="2" fill="#3ca2fa"/>
      </g>
    </svg>
  `;
  document.body.appendChild(cursorEl);

  // Configuration
  const config = {
    magneticFactor: 0.25,
    speedMultiplier: 0, // Disabled stretching for the ship
    maxScaleX: 1, // Keep ship rigid
    maxScaleY: 1, // Keep ship rigid
    cursorSize: 32, // Match SVG size
    lerpAmount: 0.08, // Keep the heavy water-like drag
    hoverPadding: 12,
    blendMode: 'exclusion'
  };

  // State
  const state = {
    pos: {
      current: new Vec2(-100, -100),
      target: new Vec2(-100, -100),
      previous: new Vec2(-100, -100)
    },
    hover: { isHovered: false },
    isDetaching: false
  };

  // Initial GSAP setup
  gsap.set(cursorEl, { 
    xPercent: -50, 
    yPercent: -50,
    width: config.cursorSize,
    height: config.cursorSize,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    mixBlendMode: config.blendMode,
    opacity: 0
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const detachDuration = prefersReducedMotion ? 0.1 : 0.35;

  let currentRotation = 0;

  const update = () => {
    const effectiveLerp = prefersReducedMotion ? 1 : config.lerpAmount;
    state.pos.current.lerp(state.pos.target, effectiveLerp);
    
    const delta = state.pos.current.clone().sub(state.pos.previous);
    state.pos.previous.copy(state.pos.current);

    const speed = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    if (speed > 0.5) {
      currentRotation = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
    }

    if (state.hover.isHovered) {
      // Just update rotation, let QuickTo handle x/y
      gsap.set(cursorEl, {
        rotate: currentRotation,
        overwrite: 'auto'
      });
      return;
    }

    if (state.isDetaching) {
      gsap.set(cursorEl, {
        x: state.pos.current.x,
        y: state.pos.current.y,
        scaleX: 1,
        scaleY: 1,
        rotate: currentRotation,
        overwrite: 'auto'
      });
    } else {
      gsap.set(cursorEl, {
        x: state.pos.current.x,
        y: state.pos.current.y,
        rotate: currentRotation,
        scaleX: 1,
        scaleY: 1,
        overwrite: 'auto'
      });
    }
  };

  gsap.ticker.add(update);

  // Mouse move to track target
  const onMouseMove = (event) => {
    state.pos.target.x = event.clientX;
    state.pos.target.y = event.clientY;

    const isInViewport =
      event.clientX >= 0 && event.clientX <= window.innerWidth &&
      event.clientY >= 0 && event.clientY <= window.innerHeight;

    gsap.to(cursorEl, { opacity: isInViewport ? 1 : 0, duration: 0.2, overwrite: 'auto' });

    const target = event.target;
    // Removed text hover squishing to keep the ship rigid
  };

  window.addEventListener('pointermove', onMouseMove);
  
  // Hide native cursor site-wide except on touch
  document.documentElement.style.cursor = 'none';
  const hideCursorStyles = document.createElement('style');
  hideCursorStyles.innerHTML = `
    * { cursor: none !important; }
  `;
  document.head.appendChild(hideCursorStyles);

  document.addEventListener('mouseleave', () => gsap.to(cursorEl, { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to(cursorEl, { opacity: 1, duration: 0.3 }));

  // Magnetic Snapping Logic
  const initMagneticElements = () => {
    const magneticElements = gsap.utils.toArray('[data-magnetic]');
    
    magneticElements.forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

      el.addEventListener('pointerenter', () => {
        state.hover.isHovered = true;
        state.isDetaching = false;

        const bounds = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        const dynamicPadding = config.hoverPadding * (1 + config.magneticFactor);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          x: centerX,
          y: centerY,
          scaleX: 1,
          scaleY: 1,
          duration: 0.3, 
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });

      el.addEventListener('pointerleave', () => {
        const currentX = gsap.getProperty(cursorEl, "x");
        const currentY = gsap.getProperty(cursorEl, "y");

        state.pos.current.x = currentX;
        state.pos.current.y = currentY;
        state.pos.previous.x = currentX;
        state.pos.previous.y = currentY;

        state.hover.isHovered = false;
        state.isDetaching = true;

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          scaleX: 1,
          scaleY: 1,
          duration: detachDuration,
          ease: 'power3.out',
          overwrite: 'all',
          onComplete: () => { state.isDetaching = false; }
        });
        
        xTo(0); 
        yTo(0);
      });

      let rafId = null;
      el.addEventListener('pointermove', (event) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const { clientX, clientY } = event;
          const { height, width, left, top } = el.getBoundingClientRect();
          xTo((clientX - (left + width / 2)) * config.magneticFactor);
          yTo((clientY - (top + height / 2)) * config.magneticFactor);
          rafId = null;
        });
      });
    });
  };

  // Run immediately
  initMagneticElements();
});
