// hover-footer.js

document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('.hover-footer');
  const footerSvg = document.querySelector('.hover-footer-svg');
  if (!footer || !footerSvg) return;

  const revealMask = footerSvg.querySelector('#revealMask');
  const textGradient = footerSvg.querySelector('#textGradient');

  // Set default state
  revealMask.setAttribute('cx', '50%');
  revealMask.setAttribute('cy', '50%');

  footer.addEventListener('mouseenter', () => {
    footerSvg.classList.add('is-hovered');
    // Inject the multi-colored stops
    textGradient.innerHTML = `
      <stop offset="0%" stop-color="#eab308" />
      <stop offset="25%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#80eeb4" />
      <stop offset="75%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#8b5cf6" />
    `;
  });

  footer.addEventListener('mouseleave', () => {
    footerSvg.classList.remove('is-hovered');
    textGradient.innerHTML = '';
  });

  footer.addEventListener('mousemove', (e) => {
    const rect = footerSvg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const cxPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    const cyPercentage = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update the center of the mask directly
    revealMask.setAttribute('cx', `${cxPercentage}%`);
    revealMask.setAttribute('cy', `${cyPercentage}%`);
  });

  // Replay animation when scrolling to the footer
  const strokeText = footerSvg.querySelector('.hover-footer-text-stroke');
  if (strokeText) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Play animation
          strokeText.classList.add('animate-stroke');
        } else {
          // Remove class so it can play again next time
          strokeText.classList.remove('animate-stroke');
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% visible

    observer.observe(footerSvg);
  }
});
