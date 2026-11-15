document.addEventListener('DOMContentLoaded', () => {
    const tracks = document.querySelectorAll('.carousel-track');
    
    tracks.forEach(track => {
        const slides = Array.from(track.children);
        if (slides.length === 0) return;
        const container = track.parentElement;
        const prevBtn = container.querySelector('.carousel-prev');
        const nextBtn = container.querySelector('.carousel-next');
        const dotsContainer = container.querySelector('.carousel-dots');
        
        let currentIndex = 0;
        let autoplayInterval;
        let isHovered = false;
        
        // Setup dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (idx === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(idx));
                dotsContainer.appendChild(dot);
            });
        }
        
        const dots = dotsContainer ? Array.from(dotsContainer.children) : [];
        
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        }
        
        function goToSlide(idx) {
            currentIndex = idx;
            updateCarousel();
            resetAutoplay();
        }
        
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
        
        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (!isHovered) nextSlide();
            }, 5000);
        }
        
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }
        
        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }
        
        container.addEventListener('mouseenter', () => isHovered = true);
        container.addEventListener('mouseleave', () => isHovered = false);
        
        // Touch support
        let startX = 0;
        let currentX = 0;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            stopAutoplay();
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        container.addEventListener('touchend', () => {
            if (currentX === 0) return;
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            startAutoplay();
            currentX = 0;
        });
        
        startAutoplay();
    });
});
