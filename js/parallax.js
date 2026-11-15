document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.parallax-bg');
    
    if (window.innerWidth < 768 || elements.length === 0) return;
    
    let ticking = false;
    
    function updateParallax() {
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.15;
                const offset = (windowHeight / 2 - (rect.top + rect.height / 2)) * speed;
                el.style.transform = `translateY(${offset}px)`;
            }
        });
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
    updateParallax();
});
