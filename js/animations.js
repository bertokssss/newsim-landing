document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        } else {
          entry.target.classList.remove('revealed'); // Re-arm the animation when scrolling out of view
        }
      });
    }, { threshold: 0.1, rootMargin: '0px' });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// Rotating Text Logic Wait Mode
document.addEventListener('DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.rotating-text-wrapper');
  
  wrappers.forEach(wrapper => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrapper.setAttribute('data-reduced', 'true');
      return;
    }

    const words = Array.from(wrapper.querySelectorAll('.rotating-word')).slice(1);
    if (words.length === 0) return;

    let currentIndex = 0;
    
    function rotate() {
      const currentWord = words[currentIndex];
      currentWord.classList.remove('active');
      currentWord.classList.add('exit');
      
      // wait for exit transition (0.8s) before bringing next word
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % words.length;
        const nextWord = words[currentIndex];
        nextWord.classList.remove('exit');
        void nextWord.offsetWidth; // force reflow
        nextWord.classList.add('active');
      }, 800); // match transition duration
    }

    setInterval(rotate, 2500);
  });
});
