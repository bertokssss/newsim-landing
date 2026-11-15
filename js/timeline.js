document.addEventListener('DOMContentLoaded', () => {
    const timelines = document.querySelectorAll('.timeline');
    
    timelines.forEach(timeline => {
        const progressLine = timeline.querySelector('.timeline-progress');
        const steps = timeline.querySelectorAll('.timeline-step');
        if (!progressLine || steps.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.5, rootMargin: '0px 0px -100px 0px' });
        
        steps.forEach(step => observer.observe(step));
        
        function updateProgress() {
            const rect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top > windowHeight || rect.bottom < 0) return;
            
            const total = rect.height;
            const scrolled = windowHeight / 2 - rect.top;
            let progress = Math.max(0, Math.min(1, scrolled / total));
            
            progressLine.style.height = `${progress * 100}%`;
        }
        
        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateProgress);
        });
        updateProgress();
    });
});
